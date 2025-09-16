import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { GrainyAuroraBackground } from './components/GrainyAuroraBackground';
import { SearchBar } from './components/SearchBar';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ScoreDisplay } from './components/ScoreDisplay';
import { FeatureCard } from './components/FeatureCard';
import { ScanIcon, GaugeIcon, DecideIcon } from './components/icons';
import { analyzeProduct } from './services/apiService';
import type { UltraScore } from './types';

function App() {
    const [ultraScore, setUltraScore] = useState<UltraScore | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const handleSearch = useCallback(async (term: string, image?: string) => {
        setIsLoading(true);
        setError(null);
        setUltraScore(null);
        
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        try {
            const finalScoreData = await analyzeProduct(term, image);
            setUltraScore(finalScoreData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleReset = useCallback(() => {
         setUltraScore(null);
         setError(null);
         setIsLoading(false);
         window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
    const showResults = isLoading || error || ultraScore;

    return (
        <>
            <style>{` @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } } @keyframes fade-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } .bg-gradient-radial { background-image: radial-gradient(circle, var(--tw-gradient-stops)); } `}</style>
            <div className="relative min-h-screen w-full overflow-hidden bg-white text-slate-900 antialiased">
                <GrainyAuroraBackground />
                <Header />
                <main className="relative z-10">
                    <section className="pt-28 pb-12 sm:pt-40 sm:pb-20">
                        <div className="container mx-auto max-w-7xl px-6">
                            <div className="max-w-3xl mx-auto text-center">
                                <h1 className="text-4xl leading-snug sm:text-5xl md:text-6xl font-semibold tracking-tighter">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">Scan. </span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">Score. </span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-green-600">Decide.</span>
                                </h1>
                                <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600">
                                    The AI-powered app for health-scoring{' '}
                                    <span className="font-bold text-slate-700">everything. </span>
                                     Instantly understand the impact of any product on your well-being.
                                </p>
                                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                            </div>
                            
                            <div ref={resultsRef} className={`transition-opacity duration-500 ${showResults ? 'opacity-100' : 'opacity-0'}`}>
                                <div className={`flex justify-center items-start ${showResults ? 'mt-12 sm:mt-16 min-h-[550px]' : 'min-h-0'}`}>
                                    {isLoading && <LoadingState />}
                                    {error && <ErrorState message={error} onReset={handleReset} />}
                                    {ultraScore && <ScoreDisplay scoreData={ultraScore} onReset={handleReset} onSearch={handleSearch} />}
                                </div>
                            </div>

                        </div>
                    </section>
                    <section className="py-16 sm:py-24 bg-slate-50/70">
                        <div className="container mx-auto max-w-5xl px-6">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">How It Works</h2>
                                <p className="mt-4 text-lg sm:text-xl text-slate-600">A simple, three-step process to understand what's really in the products you use every day.</p>
                            </div>
                            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                                <FeatureCard icon={<ScanIcon className="h-8 w-8" />} title="1. Scan or Search" description="Use your camera to scan a label or barcode, or just type in a product name."/>
                                <FeatureCard icon={<GaugeIcon className="h-8 w-8" />} title="2. Get Your Score" description="Our AI objectively analyzes food and personal care products using a data-driven system."/>
                                <FeatureCard icon={<DecideIcon className="h-8 w-8" />} title="3. Make Better Choices" description="Receive a clear 0-100 score and actionable insights to improve your well-being."/>
                            </div>
                        </div>
                    </section>
                </main>
                <div className="container mx-auto max-w-4xl px-6 pb-8 text-center text-sm text-slate-500">
                    <p>*The AI-powered analysis is for informational purposes only and may not be 100% accurate. It is not a substitute for professional medical or nutritional advice. Always verify product information with the manufacturer.</p>
                </div>
                <footer className="relative z-10 border-t border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
                        <p>&copy; 2025 ULTRASCORE Inc. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default App;