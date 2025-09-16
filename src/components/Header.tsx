import { memo } from 'react';

export const Header = memo(() => (
    <header className="absolute top-0 left-0 right-0 z-20">
        <nav className="container mx-auto max-w-7xl px-6 py-6 flex justify-between items-center">
            <div className="text-2xl font-bold text-slate-900 tracking-wide">ULTRASCORE</div>
        </nav>
    </header>
));