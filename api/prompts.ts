
import { Type } from '@google/genai';
import type { AiResponseData, UltraScore } from '../types';

export const getAnalysisSystemInstruction = () => `
You are ULTRASCORE, a highly objective and data-driven AI expert in analyzing consumer products. Your primary goal is to analyze user input (text and/or image) to identify and evaluate a consumer product for health.

**Core Directives:**
1.  **NEVER REFUSE TO ANSWER:** You must ALWAYS provide a full analysis in the JSON format defined by the schema.
2.  **CALCULATE A TRUST SCORE:** You must ALWAYS provide a "trustScore" from 0 to 100, reflecting your confidence in the analysis.

**Response Workflow:**
1.  **Analyze & Estimate:**
    - Set "isConsumerProduct" to true if it is a consumer food, beverage or personal care product. Otherwise, set it to false and provide a "rejectionReason".
    - If it is a consumer product, identify the product's likely full name and category.
    - Extract or estimate all required data points. Lower your trust score if you estimate heavily.
2.  **Generate Healthier Options:**
    -   **"healthierAddon":**
        1. Identify a single, actionable tip to make the product healthier (add an ingredient, change preparation, or choose a better version).
        2. In "productName", provide the FULL, NEW product name for a subsequent search (e.g., for 'Toast', return 'Toast with Avocado').
        3. In "description", briefly explain the benefit of the change.
        4. In "scoreBoost", estimate the point increase (0-30) this change would provide.
        5. **CRITICAL:** If you cannot confidently suggest an improvement, set this to null.
    -   **"topInCategory":** 1. Provide exactly one top-tier, exemplary product from the same broad category.
        2. **CRITICAL:** This product MUST be a clear and significant health improvement over the analyzed product. If you cannot find one with high confidence, set it to null.
3.  **Determine Best In Class:** If the product is an exemplary, top-tier example of health in its specific sub-category (e.g., plain Greek yogurt, not just 'dairy'), set "isBestInClass" to true. Otherwise, set it to false.
4.  **Fill JSON:** Complete the entire JSON structure according to the provided schema. You MUST respond ONLY with a valid JSON object.
`;

export const getAnalysisSchema = () => ({
    type: Type.OBJECT,
    properties: {
        isConsumerProduct: { type: Type.BOOLEAN },
        isBestInClass: { type: Type.BOOLEAN, nullable: true },
        rejectionReason: { type: Type.STRING, nullable: true },
        trustScore: { type: Type.INTEGER, nullable: true },
        productName: { type: Type.STRING, nullable: true },
        productCategory: { type: Type.STRING, enum: ["Food", "Beverage", "PersonalCare"], nullable: true },
        processingLevel: { type: Type.STRING, enum: ["Unprocessed/Minimally Processed", "Processed Culinary Ingredients", "Processed Foods", "Ultra-Processed Foods"], nullable: true },
        harmfulAdditives: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                hasArtificialSweeteners: { type: Type.BOOLEAN },
                hasIndustrialEmulsifiers: { type: Type.BOOLEAN },
                hasArtificialColorsFlavors: { type: Type.BOOLEAN },
            },
        },
        nutrientsPer100g: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                calories: { type: Type.INTEGER }, carbohydratesG: { type: Type.NUMBER }, totalFatG: { type: Type.NUMBER },
                proteinG: { type: Type.NUMBER }, addedSugarG: { type: Type.NUMBER }, sodiumMg: { type: Type.NUMBER },
                saturatedFatG: { type: Type.NUMBER }, unsaturatedFatG: { type: Type.NUMBER }, fiberG: { type: Type.NUMBER },
            },
        },
        proteinQuality: { type: Type.STRING, enum: ["High-Quality Whole-Food", "High-Quality Plant-Based", "None"], nullable: true },
        hasTransFat: { type: Type.BOOLEAN, nullable: true },
        wholeFoodContentPercentage: { type: Type.INTEGER, nullable: true },
        personalCareDetails: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                harmfulIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                beneficialIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                hasFragrance: { type: Type.BOOLEAN },
                isCrueltyFree: { type: Type.BOOLEAN },
            },
        },
        healthierAddon: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                productName: { type: Type.STRING }, description: { type: Type.STRING }, scoreBoost: { type: Type.INTEGER },
            },
        },
        topInCategory: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                productName: { type: Type.STRING }, description: { type: Type.STRING },
            },
        },
    },
});

export const getCommonSenseCheckPrompt = (productData: AiResponseData, initialScore: UltraScore) => `
You are a safety and common sense validation AI. Your task is to identify dangerously misleading health scores. The algorithm scores based on nutritional data but can be fooled by inedible or poisonous items (e.g., scoring 'Cyanide Water' as 100).
Product Name: "${productData.productName}", Initial Score: ${initialScore.finalScore}/100.
**Task:** Evaluate if the score is absurd or dangerous (Toxic, Inedible, etc.).
**Response Format:** If plausible, respond ONLY with: {"isMisleading": false}. If dangerous, respond ONLY with: {"isMisleading": true, "correctedScore": 0, "reason": "A brief, user-facing explanation."}. Only override for clear, unambiguous cases of danger.
`;
