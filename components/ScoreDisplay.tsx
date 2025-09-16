
import React, { useState, memo } from 'react';
import type { UltraScore, Nutrients } from '../types';
import { SuggestionCard } from './SuggestionCard';
import { StarIcon } from './icons';

interface ScoreDisplayProps {
    scoreData: UltraScore;
    onReset: () => void;
    onSearch: (term: string, image?: string) => void;
}

const AdjustmentRow: React.FC<{ adj: { reason: string; points: number } }> = ({ adj }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
        <span className="text-sm text-slate-600">{adj.reason}</span>
        <span className={`text-sm font-bold ${adj.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {adj.points > 0 ? `+${adj.points}` : adj.points}
        </span>
    </div>
);

const Macro: React.FC<{ label: string; value: number | undefined; unit: string }> = ({ label, value, unit }) => (
    <div className="text-center">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-bold text-slate-700">{value !== undefined ? Math.round(value) : '0'}{unit}</p>
    </div>
);

const NutritionInfo: React.FC<{ data: Nutrients | null }> = ({ data }) => {
    if (!data) return null;
    return (
        <div className="w-full mt-4">
            <p className="text-center text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Macros per 100g</p>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-xs mx-auto">
                <Macro label="Protein" value={data.proteinG} unit="g" />
                <Macro label="Carbs" value={data.carbohydratesG} unit="g" />
                <Macro label="Fat" value={data.totalFatG} unit="g" />
                <Macro label="Fiber" value={data.fiberG} unit="g" />
                <Macro label="Sugar" value={data.addedSugarG} unit="g" />
                <Macro label="Calories" value={data.calories} unit=" kcal" />
            </div>
        </div>
    );
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = memo(({ scoreData, onReset, onSearch }) => {
    const { finalScore, trustScore, category, productName, breakdown, healthierAddon, topInCategory, nutrients, overrideReason, isBestInClass } = scoreData;
    const [isExpanded, setIsExpanded] = useState(false);
    const handleSuggestionSearch = (newTerm: string) => onSearch(newTerm);

    const characteristicKeywords = ['homemade', 'raw', 'organic'];
    let characteristics: string[] = [];
    let cleanedProductName = productName || '';

    characteristicKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'ig');
        if (regex.test(cleanedProductName)) {
            const formattedMatch = keyword.charAt(0).toUpperCase() + keyword.slice(1);
            if (!characteristics.includes(formattedMatch)) {
                characteristics.push(formattedMatch);
            }
            cleanedProductName = cleanedProductName.replace(regex, '');
        }
    });
    cleanedProductName = cleanedProductName.replace(/,/g, ' ').replace(/\s\s+/g, ' ').trim();

    const categoryStyles = {
        Excellent: { bg: 'bg-green-100', text: 'text-green-800', gradient: 'from-green-500 to-emerald-600', stroke: 'stroke-green-500' },
        Good: { bg: 'bg-lime-100', text: 'text-lime-800', gradient: 'from-lime-500 to-green-500', stroke: 'stroke-lime-500' },
        Moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', gradient: 'from-yellow-400 to-amber-500', stroke: 'stroke-yellow-400' },
        Limit: { bg: 'bg-orange-100', text: 'text-orange-800', gradient: 'from-orange-500 to-red-500', stroke: 'stroke-orange-500' },
        Avoid: { bg: 'bg-red-100', text: 'text-red-800', gradient: 'from-red-500 to-rose-700', stroke: 'stroke-red-500' },
    };
    const styles = categoryStyles[category];
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (finalScore / 100) * circumference;

    return (
        <div className="w-full max-w-sm sm:max-w-md min-h-[550px] mx-auto bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-4 sm:p-6 flex flex-col items-center animate-fade-in">
            <div className="w-full flex justify-between items-baseline gap-4 px-1">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight truncate" title={productName || ''}>
                        {cleanedProductName}
                    </h2>
                    {characteristics.length > 0 && (
                        <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mt-1">
                            {characteristics.join(' • ')}
                        </div>
                    )}
                </div>
                {trustScore && (
                    <p className="text-sm text-slate-500 whitespace-nowrap flex-shrink-0">
                        Trust: {trustScore}%
                    </p>
                )}
            </div>

            <div className="relative my-4">
                <svg className="w-40 h-40 transform -rotate-90 mx-auto" viewBox="0 0 120 120">
                    <circle className="stroke-slate-200" cx="60" cy="60" r="52" strokeWidth="12" fill="transparent" />
                    <circle className={styles.stroke} cx="60" cy="60" r="52" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${styles.gradient}`}>{finalScore}</span>
                    <span className="text-sm text-slate-500 -mt-1">/ 100</span>
                </div>
            </div>

            {!overrideReason && <NutritionInfo data={nutrients} />}
            <div className={`text-center px-3 py-1 rounded-full text-sm font-bold tracking-wide ${styles.bg} ${styles.text} mt-4`}>{category}</div>
            
            {isBestInClass && !overrideReason && (
                <div className="mt-2 flex items-center justify-center gap-1.5 text-amber-500">
                    <StarIcon className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">BEST IN CLASS</span>
                </div>
            )}

            {overrideReason && (
                <div className="w-full mt-4 p-3 text-center bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-sm font-bold text-red-800">Safety Override by AI</p>
                    <p className="text-xs text-red-700 mt-1">{overrideReason}</p>
                </div>
            )}

            <div className="flex-grow w-full flex flex-col mt-4 overflow-hidden">
                {finalScore < 90 && !overrideReason && (healthierAddon || topInCategory) && (
                     <div className="w-full pt-2">
                         <h4 className="text-xl font-medium text-slate-700 text-center mb-3 tracking-tight">Better Choices</h4>
                         <div className="space-y-3">
                            {healthierAddon && <SuggestionCard title="Healthier Add-on" item={healthierAddon} onSearch={() => handleSuggestionSearch(healthierAddon.productName)} />}
                            {topInCategory && <SuggestionCard title="Top of Category" item={topInCategory} onSearch={() => handleSuggestionSearch(topInCategory.productName)} />}
                         </div>
                     </div>
                )}
            </div>
            <div className="w-full text-xs mt-auto flex-shrink-0 pt-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 font-bold w-full text-center py-1">{isExpanded ? 'Hide' : 'Show'} Breakdown</button>
                {isExpanded && (
                    <div className="mt-1 p-2 bg-slate-50 rounded-lg max-h-24 overflow-y-auto">
                        <AdjustmentRow adj={{ reason: 'Baseline', points: breakdown.baseScore }} />
                        {breakdown.adjustments.map((adj, i) => <AdjustmentRow key={i} adj={adj} />)}
                    </div>
                )}
                <button onClick={onReset} className="w-full mt-2 text-center text-sm font-bold tracking-wide text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg py-2 transition-colors flex-shrink-0">Analyze Another</button>
            </div>
        </div>
    );
});
