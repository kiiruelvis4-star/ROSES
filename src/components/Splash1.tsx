import React, { useEffect } from 'react';
import { Logo } from './Logo.tsx';

interface Splash1Props {
  onComplete: () => void;
}

export function Splash1({ onComplete }: Splash1Props) {
  useEffect(() => {
    // 5-second duration per PRD v7 Section 4
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      data-splash="true"
      onClick={onComplete}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onComplete();
        }
      }}
      className="relative w-full h-full flex-1 flex flex-col items-center justify-center cursor-pointer select-none bg-[#070D1E] overflow-hidden"
      aria-label="Little Roses Academy Splash Screen. Tap to continue."
    >
      {/* Background Campus Image with measured dark navy scrim */}
      <img
        src="/src/assets/images/splash1_campus_crest_1790668349675.jpg"
        alt="Little Roses Academy Campus Grounds"
        className="absolute inset-0 w-full h-full object-cover opacity-35 scale-100 transition-transform duration-1000 ease-out"
        onError={(e) => {
          // Fallback to secondary campus asset if needed
          const target = e.target as HTMLImageElement;
          if (target.src.indexOf('little_roses_campus') === -1) {
            target.src = '/src/assets/images/little_roses_campus_1790246122159.jpg';
          }
        }}
      />

      {/* Atmospheric Navy Gradient Scrim ensuring WCAG AA contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070D1E]/80 via-[#070D1E]/65 to-[#070D1E]/90 z-10 pointer-events-none" />

      {/* Centered Official Round School Crest & Tagline */}
      <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-700">
        <Logo size="splash" showTagline={true} />

        <div className="pt-4 space-y-1">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300">
            Nakuru, Kenya
          </p>
          <p className="text-[11px] uppercase tracking-widest text-amber-400 font-medium">
            Kenyan CBC Primary School • Grades 1–6
          </p>
        </div>
      </div>

      {/* Subtle Bottom Affordance */}
      <div className="absolute bottom-6 z-20 flex items-center gap-2 text-[11px] text-slate-400 font-mono tracking-wider bg-slate-900/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-slate-800">
        <span>Tap anywhere to continue</span>
        <span className="text-slate-500 font-sans">·</span>
        <span className="text-amber-400 font-bold">5s</span>
      </div>
    </div>
  );
}

