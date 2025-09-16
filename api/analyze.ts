import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { kv } from '@vercel/kv';
import { getAnalysisSchema, getAnalysisSystemInstruction, getCommonSenseCheckPrompt } from './prompts';
import { calculateUltraScore } from './scoring';
import type { AiResponseData, UltraScore } from '../types';

const RATE_LIMIT_PER_DAY = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. Rate Limiting
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const ip = req.headers['x-forwarded-for'] as string || '127.0.0.1';
            const ratelimitKey = `rate_limit_${ip}`;
            const currentUsage = await kv.get<number>(ratelimitKey) || 0;

            if (currentUsage >= RATE_LIMIT_PER_DAY) {
                return res.status(429).json({ message: 'Rate limit exceeded. Try again tomorrow.' });
            }
        } catch (error) {
            console.error('Redis error:', error);
            // Don't block requests if Redis fails
        }
    }
    
    // 2. AI Analysis
    const { term, image } = req.body;
    if (!term) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ message: 'API key not configured on server.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // --- Main Product Analysis Call ---
        const requestParts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [
            { text: `Product name/description: ${term}` }
        ];
        if (image) {
            requestParts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image
                }
            });
        }
        
        const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: requestParts }, // FIX: Changed from [{ parts }] to { parts: ... }
            config: {
                systemInstruction: getAnalysisSystemInstruction(),
                responseMimeType: 'application/json',
                responseSchema: getAnalysisSchema(),
                temperature: 0.2
            }
        });

        const analysisText = analysisResponse.text;
        const analysisData: AiResponseData = JSON.parse(analysisText);
        
        if (!analysisData.isConsumerProduct) {
             return res.status(400).json({ message: analysisData.rejectionReason || "The item is not a recognized consumer product." });
        }

        const initialScore = calculateUltraScore(analysisData);

        // --- Common Sense Safety Check Call ---
        if (initialScore.finalScore < 20) {
            // If score is already very low, skip safety check for efficiency
             if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
                const ip = req.headers['x-forwarded-for'] as string || '127.0.0.1';
                const ratelimitKey = `rate_limit_${ip}`;
                const currentUsage = await kv.get<number>(ratelimitKey) || 0;
                await kv.set(ratelimitKey, currentUsage + 1, { ex: 86400 }); 
            }
            return res.status(200).json(initialScore);
        }

        const safetyResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: getCommonSenseCheckPrompt(analysisData, initialScore), // FIX: Use string shorthand for contents
            config: {
                responseMimeType: 'application/json',
                temperature: 0.0
            }
        });
        
        let finalScoreData: UltraScore = initialScore;
        const safetyCheckText = safetyResponse.text;
        const validation = JSON.parse(safetyCheckText);

        if (validation.isMisleading) {
            console.warn(`Common sense override for "${analysisData.productName}". Reason: ${validation.reason}`);
            finalScoreData = {
                ...initialScore,
                finalScore: validation.correctedScore,
                category: 'Avoid',
                overrideReason: validation.reason,
                healthierAddon: null,
                topInCategory: null,
                breakdown: {
                    baseScore: initialScore.breakdown.baseScore,
                    adjustments: [{ reason: `Safety Override: ${validation.reason}`, points: -100 }]
                }
            };
        }

         // 3. Increment Rate Limiter on success
         if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            const ip = req.headers['x-forwarded-for'] as string || '127.0.0.1';
            const ratelimitKey = `rate_limit_${ip}`;
            const currentUsage = await kv.get<number>(ratelimitKey) || 0;
            await kv.set(ratelimitKey, currentUsage + 1, { ex: 86400 }); // expire in 24 hours
        }

        res.status(200).json(finalScoreData);

    } catch (error: any) {
        console.error("Error in /api/analyze:", error);
        res.status(500).json({ message: error.message || 'Failed to analyze product.' });
    }
}