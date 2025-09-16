export interface Nutrients {
    calories: number;
    carbohydratesG: number;
    totalFatG: number;
    proteinG: number;
    addedSugarG: number;
    sodiumMg: number;
    saturatedFatG: number;
    unsaturatedFatG: number;
    fiberG: number;
}

export interface PersonalCareDetails {
    harmfulIngredients: string[];
    beneficialIngredients: string[];
    hasFragrance: boolean;
    isCrueltyFree: boolean;
}

export interface Suggestion {
    productName: string;
    description: string;
    scoreBoost?: number;
}

export interface AiResponseData {
    isConsumerProduct: boolean;
    isBestInClass: boolean | null;
    rejectionReason: string | null;
    trustScore: number | null;
    productName: string | null;
    productCategory: "Food" | "Beverage" | "PersonalCare" | null;
    processingLevel: "Unprocessed/Minimally Processed" | "Processed Culinary Ingredients" | "Processed Foods" | "Ultra-Processed Foods" | null;
    harmfulAdditives: {
        hasArtificialSweeteners: boolean;
        hasIndustrialEmulsifiers: boolean;
        hasArtificialColorsFlavors: boolean;
    } | null;
    nutrientsPer100g: Nutrients | null;
    proteinQuality: "High-Quality Whole-Food" | "High-Quality Plant-Based" | "None" | null;
    hasTransFat: boolean | null;
    wholeFoodContentPercentage: number | null;
    personalCareDetails: PersonalCareDetails | null;
    healthierAddon: Suggestion | null;
    topInCategory: Suggestion | null;
}

export interface ScoreAdjustment {
    reason: string;
    points: number;
}

export interface ScoreBreakdown {
    baseScore: number;
    adjustments: ScoreAdjustment[];
}

export interface UltraScore {
    finalScore: number;
    isBestInClass: boolean | null;
    trustScore: number | null;
    category: 'Excellent' | 'Good' | 'Moderate' | 'Limit' | 'Avoid';
    productName: string | null;
    breakdown: ScoreBreakdown;
    healthierAddon: Suggestion | null;
    topInCategory: Suggestion | null;
    nutrients: Nutrients | null;
    overrideReason?: string | null;
}