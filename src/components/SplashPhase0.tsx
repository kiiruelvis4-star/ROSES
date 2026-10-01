/**
 * Little Roses Academy - Phase 0 Entry Splash Screen
 * 
 * SPECIFICATION RULES:
 * Section 10 & 11:
 * Show:
 * LITTLE ROSES ACADEMY
 * MUCH FROM LITTLE
 * LEARN • LOVE • LEAD
 * 
 * Primary LRA colours:
 * MIDNIGHT NAVY: #0F172A
 * DEEP NAVY: #0B1936
 * BLUE: #102A6B
 * GOLD: #EAB308
 * WHITE: #FFFFFF
 * 
 * Do not put fake school information.
 * Do not show fake statistics.
 * Do not show fake notifications.
 * Do not show fake "online" status.
 * Do not show fake sync information.
 * Transitions into the authentication / portal gateway.
 */

import React, { useEffect, useState } from 'react';
import { Logo } from './Logo.tsx';

interface SplashPhase0Props {
  onComplete: () => void;
}

export const SplashPhase0: React.FC<SplashPhase0Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 2.5s smooth progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#0F172A] via-[#0B1936] to-[#102A6B] text-white select-none overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      {/* Top Branding Pillar */}
      <div className="w-full text-center pt-6 z-10">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">
          Kenyan CBC Foundation • Nakuru
        </span>
      </div>

      {/* Center Crest & Pillars */}
      <div className="flex flex-col items-center z-10 my-auto">
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-500">
          <Logo size="splash" showTagline={false} allowPhotoUpload={false} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif uppercase text-center">
          Little Roses Academy
        </h1>

        <div className="mt-2 text-center">
          <p className="text-sm font-black tracking-widest text-amber-400 uppercase">
            Motto: MUCH FROM LITTLE
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-slate-300">
            <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-xs">LEARN</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-xs">LOVE</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-xs">LEAD</span>
          </div>
        </div>
      </div>

      {/* Bottom Loading Progress (Real system bootstrap) */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 pb-8 z-10">
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-medium">
          <span>Phase 0 Foundation</span>
          <span className="text-amber-400 font-bold">{progress}%</span>
        </div>

        <button
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4 mt-1 transition-colors"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
};
