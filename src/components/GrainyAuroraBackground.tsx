import { memo } from 'react';

export const GrainyAuroraBackground = memo(() => (
    <>
        <svg className="absolute w-0 h-0" aria-hidden="true">
            <filter id="grainy">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
            </filter>
        </svg>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20">
            <div className="absolute -top-[10rem] right-[5rem] w-[40rem] h-[40rem] rounded-full bg-gradient-radial from-green-300/40 to-transparent blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
            <div className="absolute top-[10rem] -right-[10rem] w-[50rem] h-[50rem] rounded-full bg-gradient-radial from-red-300/30 to-transparent blur-3xl animate-[pulse_10s_ease-in-out_infinite_2s]" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10" style={{ filter: 'url(#grainy)', pointerEvents: 'none' }} />
    </>
));