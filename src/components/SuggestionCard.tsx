import { memo, FC } from 'react';
import type { Suggestion } from '../types';
import { ArrowUpRightIcon, SparklesIcon } from './icons';

interface SuggestionCardProps {
    title: "Healthier Add-on" | "Top of Category";
    item: Suggestion;
    onSearch: () => void;
}

const cardConfig = {
    "Healthier Add-on": {
        icon: <ArrowUpRightIcon className="w-6 h-6 text-green-600" />,
        bgColor: "bg-green-50/80",
        borderColor: "border-green-200/50",
        titleColor: "text-green-700",
    },
    "Top of Category": {
        icon: <SparklesIcon className="w-6 h-6 text-amber-500" />,
        bgColor: "bg-amber-50/80",
        borderColor: "border-amber-200/50",
        titleColor: "text-amber-600",
    },
};

export const SuggestionCard: FC<SuggestionCardProps> = memo(({ title, item, onSearch }) => {
    if (!item || !item.productName) return null;
    const config = cardConfig[title];
    return (
        <button
            onClick={onSearch}
            className={`w-full text-left p-3 rounded-lg border ${config.bgColor} ${config.borderColor} transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">{config.icon}</div>
                <div className="flex-grow">
                    <h5 className={`text-xs font-bold uppercase tracking-wider ${config.titleColor}`}>{title}</h5>
                    <p className="font-semibold text-slate-800 mt-1">{item.productName}</p>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                </div>
            </div>
        </button>
    );
});