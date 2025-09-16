import React, { useState, useRef } from 'react';
import { CameraIcon } from './icons';

interface SearchBarProps {
    onSearch: (term: string, image?: string) => void;
    isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSearch(inputValue.trim());
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if (base64String) {
                    setInputValue(file.name);
                    onSearch(file.name, base64String);
                }
            };
            // FIX: Corrected typo from readDataURL to readAsDataURL.
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit} className="relative mt-8 max-w-xl mx-auto">
            <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 opacity-15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="relative flex items-center w-full bg-slate-50/70 backdrop-blur-lg rounded-xl p-1 shadow-lg ring-1 ring-black/5">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 w-full h-10 bg-transparent text-slate-900 outline-none placeholder-slate-500 px-4"
                    placeholder="e.g., 'Cheerios', 'Avocado', or 'Head and Shoulders'"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={isLoading}
                />
                <button
                    type="button"
                    aria-label="Scan with camera"
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    className="ml-1 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:bg-slate-400"
                >
                    <CameraIcon className="w-6 h-6" />
                </button>
            </div>
        </form>
    );
};