import React, { memo } from 'react';
import { ArrowPathIcon } from './icons';

export const LoadingState = memo(() => (
    <div className="w-full max-w-sm sm:max-w-md h-[550px] mx-auto bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-6 flex flex-col justify-center items-center text-center animate-fade-in">
        <ArrowPathIcon className="w-12 h-12 text-slate-500 animate-spin" />
        <p className="mt-4 text-lg text-slate-600">AI is analyzing...</p>
        <p className="text-sm text-slate-500 mt-1">This can take a moment.</p>
    </div>
));