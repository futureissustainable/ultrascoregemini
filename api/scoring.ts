import type { AiResponseData, UltraScore, ScoreAdjustment, Nutrients } from '../types';

// FIX: Define a default nutrients object to prevent runtime errors when nutrient data is missing.
const defaultNutrients: Nutrients = {
    calories: 0,
    carbohydratesG: 0,
    totalFatG: 0,
    proteinG: 0,
    addedSugarG: 0,
    sodiumMg: 0,
    saturatedFatG: 0,
    unsaturatedFatG: 0,
    fiberG: 0,
};

const calculateFoodScore = (data: AiResponseData): UltraScore => {
    const baseline = 50;
    let score = baseline;
    const adjustments: ScoreAdjustment[] = [];
    // FIX: Use the defaultNutrients object if data.nutrientsPer100g is null. This ensures
    // `nutrients` is always a valid Nutrients object, preventing type errors on property access.
    const nutrients = data.nutrientsPer100g || defaultNutrients;
    const addAdjustment = (reason: string, points: number) => {
        if (points !== 0) {
            adjustments.push({ reason, points });
            score += points;
        }
    };

    switch (data.processingLevel) {
        case "Unprocessed/Minimally Processed": addAdjustment("NOVA Group 1", 15); break;
        case "Processed Culinary Ingredients": addAdjustment("NOVA Group 2", 8); break;
        case "Processed Foods": addAdjustment("NOVA Group 3", 0); break;
        case "Ultra-Processed Foods": addAdjustment("NOVA Group 4", -8); break;
    }

    const productNameLower = data.productName?.toLowerCase() || '';
    if (productNameLower.includes('water') && (!nutrients || (nutrients.addedSugarG === 0 && nutrients.sodiumMg === 0))) {
        return { finalScore: 100, isBestInClass: true, trustScore: data.trustScore || 99, category: 'Excellent', productName: data.productName, breakdown: { baseScore: 100, adjustments: [] }, healthierAddon: null, topInCategory: null, nutrients: null };
    }

    let positivePoints = 0;
    const fiber = nutrients.fiberG ?? 0;
    if (fiber >= 6) positivePoints += 8; else if (fiber >= 3) positivePoints += 5; else if (fiber >= 1.5) positivePoints += 3;
    
    const unsatFat = nutrients.unsaturatedFatG ?? 0;
    const satFat = nutrients.saturatedFatG ?? 0;
    if (satFat > 0) { const ratio = unsatFat / satFat; if (ratio >= 2.0) positivePoints += 5; else if (ratio >= 1.0) positivePoints += 3; }
    else if (unsatFat > 0) { positivePoints += 3; }
    
    if (data.proteinQuality === "High-Quality Whole-Food") positivePoints += 5;
    else if (data.proteinQuality === "High-Quality Plant-Based") positivePoints += 3;
    
    if (data.wholeFoodContentPercentage && data.wholeFoodContentPercentage >= 40) positivePoints += 3;
    
    addAdjustment("Positive Nutrients", Math.min(20, positivePoints));

    let negativePoints = 0;
    const sugar = nutrients.addedSugarG ?? 0;
    if (sugar > 22.5) negativePoints += 20; else if (sugar >= 15) negativePoints += 15; else if (sugar >= 5) negativePoints += 10; else if (sugar > 0) negativePoints += 5;
    
    const sodium = nutrients.sodiumMg ?? 0;
    if (sodium >= 600) negativePoints += 8; else if (sodium >= 300) negativePoints += 5; else if (sodium >= 120) negativePoints += 3;
    
    if (data.hasTransFat) negativePoints += 5;
    
    let additivePenalty = 0;
    if (data.harmfulAdditives?.hasArtificialSweeteners) additivePenalty += 3;
    if (data.harmfulAdditives?.hasIndustrialEmulsifiers) additivePenalty += 3;
    if (data.harmfulAdditives?.hasArtificialColorsFlavors) additivePenalty += 3;
    negativePoints += Math.min(5, additivePenalty);
    
    addAdjustment("Negative Modifiers", -Math.min(30, negativePoints));

    if (data.isBestInClass === true) {
        addAdjustment("⭐ Best In Class", 5);
    }
    
    let finalScore = Math.max(0, Math.min(100, Math.round(score)));

    let category: UltraScore['category'];
    if (finalScore >= 90) category = 'Excellent';
    else if (finalScore >= 70) category = 'Good';
    else if (finalScore >= 50) category = 'Moderate';
    else if (finalScore >= 30) category = 'Limit';
    else category = 'Avoid';

    return {
        finalScore,
        isBestInClass: data.isBestInClass,
        trustScore: data.trustScore,
        category,
        productName: data.productName,
        breakdown: { baseScore: baseline, adjustments },
        healthierAddon: data.healthierAddon || null,
        topInCategory: data.topInCategory || null,
        nutrients: data.nutrientsPer100g
    };
};

const calculatePersonalCareScore = (data: AiResponseData): UltraScore => {
    const baseline = 60;
    const adjustments: ScoreAdjustment[] = [];
    let score = baseline;
    const details = data.personalCareDetails;
    const addAdjustment = (reason: string, points: number) => {
        adjustments.push({ reason, points });
        score += points;
    };
    
    if(details) {
        details.harmfulIngredients?.forEach(ing => {
            if (/paraben/i.test(ing)) addAdjustment("Contains Parabens", -8);
            else if (/sulfate|sls|sles/i.test(ing)) addAdjustment("Contains Sulfates", -3);
            else if (/phthalate/i.test(ing)) addAdjustment("Contains Phthalates", -8);
        });
        if (details.hasFragrance) addAdjustment("Contains Synthetic Fragrance", -3);
        details.beneficialIngredients?.forEach(ing => {
            if (/ceramide/i.test(ing)) addAdjustment("Contains Ceramides", 5);
            else if (/vitamin e|tocopherol/i.test(ing)) addAdjustment("Contains Vitamin E", 3);
        });
        if (details.isCrueltyFree) addAdjustment("Cruelty-Free", 3);
    }

    if (data.isBestInClass === true) {
        addAdjustment("⭐ Best In Class", 5);
    }

    let finalScore = Math.max(0, Math.min(100, Math.round(score)));
    
    let category: UltraScore['category'];
    if (finalScore >= 90) category = 'Excellent';
    else if (finalScore >= 70) category = 'Good';
    else if (finalScore >= 50) category = 'Moderate';
    else if (finalScore >= 30) category = 'Limit';
    else category = 'Avoid';

    return {
        finalScore,
        isBestInClass: data.isBestInClass,
        trustScore: data.trustScore,
        category,
        productName: data.productName,
        breakdown: { baseScore: baseline, adjustments },
        healthierAddon: data.healthierAddon || null,
        topInCategory: data.topInCategory || null,
        nutrients: null
    };
};

export const calculateUltraScore = (data: AiResponseData): UltraScore => {
    if (!data.isConsumerProduct || !data.productCategory) {
        throw new Error("Cannot calculate score for a non-consumer item.");
    }
    switch (data.productCategory) {
        case "Food":
        case "Beverage":
            return calculateFoodScore(data);
        case "PersonalCare":
            return calculatePersonalCareScore(data);
        default:
            throw new Error(`Scoring not implemented for category: ${data.productCategory}`);
    }
};
