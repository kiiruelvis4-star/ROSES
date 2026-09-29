/**
 * Little Roses Academy - Splash 2
 * 
 * SPEC RULE 2:
 * "Splash 2 (navy, logo, tagline, 0-100% bar) -> portal selection with four cards:
 * School Administration, Staff & Teachers, Parents & Guardians, Learners."
 * 
 * SPEC RULE 1:
 * "LOGO: use the attached logo image exactly as it is on every screen.
 * Never redraw, recolour, regenerate, or add rings. One shared Logo component.
 * Tagline everywhere: 'LEARN TODAY BUILD TOMORROW'. No other taglines."
 * 
 * Redesigned for maximum elegance, institutional prestige, and seamless responsive layout.
 */

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { loadCustomSplashImage } from '../services/imageStorage.ts';

interface Splash2Props {
  mode?: 'phone' | 'tablet' | 'full';
  onComplete?: () => void;
}

export const Splash2: React.FC<Splash2Props> = ({ mode = 'phone', onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [customBg, setCustomBg] = useState<string | null>(null);

  // Check for any custom uploaded background in storage
  useEffect(() => {
    let isMounted = true;
    loadCustomSplashImage('splash2_bg').then((cached) => {
      if (isMounted && cached) {
        setCustomBg(cached);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Smooth, calibrated progress animation from 0% to 100%
  useEffect(() => {
    const duration = 2100; // 2.1 seconds smooth progression
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const displayPercent = Math.min(100, Math.floor(progress));

  // Dynamic academic status phrase matching progress milestones
  const getStatusText = (pct: number) => {
    if (pct < 25) return 'Initializing Little Roses Academy...';
    if (pct < 55) return 'Loading CBC Curriculum & Classes...';
    if (pct < 85) return 'Preparing Offline School Portals...';
    return 'Ready • Welcome to Little Roses Academy';
  };

  return (
    <div
      onClick={() => {
        if (onComplete) onComplete();
      }}
      className="relative flex-1 w-full h-full min-h-full overflow-hidden select-none bg-[#050B1A] text-white flex flex-col justify-between p-5 sm:p-8 cursor-pointer transition-colors duration-500"
      title="Tap anywhere to proceed directly to portals"
    >
      {/* Optional Custom Background with Navy Overlay */}
      {customBg ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={customBg}
            alt="School Background"
            className="w-full h-full object-cover object-center filter brightness-[0.4] saturate-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1A]/85 via-[#070D1E]/90 to-[#040814]" />
        </div>
      ) : (
        /* Rich Deep Navy Academic Ambient Glow */
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 50% 40%, rgba(26, 47, 95, 0.45) 0%, rgba(7, 13, 30, 0.85) 60%, #050B1A 100%),
              linear-gradient(180deg, #060D1E 0%, #071026 50%, #03060F 100%)
            `,
          }}
        />
      )}

      {/* Subtle Atmospheric Light Ring behind Crest */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none blur-3xl opacity-20 bg-amber-400"
        aria-hidden="true"
      />

      {/* TOP KICKER: Subtle School Affiliation & Location */}
      <header className="relative z-10 w-full flex items-center justify-between text-slate-400 text-xs tracking-wider">
        <span className="font-semibold text-amber-400/90 tracking-widest uppercase text-[11px] sm:text-xs">
          Nakuru, Kenya
        </span>
        <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-widest font-mono">
          Kenyan CBC
        </span>
      </header>

      {/* CENTER: Exact Official Logo with Guaranteed Dead-Center Positioning */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto px-2 pointer-events-none">
        <div className="flex flex-col items-center justify-center transition-transform duration-300">
          {/* Official Emblem with Glow Drop Shadow */}
          <div className="filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)] drop-shadow-[0_0_30px_rgba(245,158,11,0.22)]">
            <Logo
              size={mode === 'tablet' ? 'splash' : 'splash'}
              showTagline={true}
            />
          </div>

          {/* School Level Subtitle */}
          <p className="mt-4 text-xs sm:text-sm font-medium tracking-wide text-slate-300 text-center">
            Primary School • Grades 1 – 6
          </p>
        </div>
      </main>

      {/* BOTTOM SECTION: 0% to 100% Progress Bar & Status */}
      <footer className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center gap-2.5 pb-2">
        {/* Status Text & Percentage */}
        <div className="w-full flex items-center justify-between text-xs sm:text-sm font-medium px-0.5">
          <span className="text-slate-300 truncate max-w-[75%] font-sans text-[11px] sm:text-xs tracking-wide">
            {getStatusText(displayPercent)}
          </span>
          <span className="text-amber-400 font-mono font-bold text-xs sm:text-sm tracking-wider">
            {displayPercent}%
          </span>
        </div>

        {/* Elegant Gold Progress Track */}
        <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-900/90 p-0.5 border border-slate-700/70 shadow-inner overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75 relative"
            style={{
              width: `${displayPercent}%`,
              background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.65)',
            }}
          >
            {/* Subtle light shimmer line on top */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>

        {/* Minimal, Uncluttered Skip Indicator */}
        <div className="mt-1 text-center">
          <span className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors">
            Tap anywhere to continue →
          </span>
        </div>
      </footer>
    </div>
  );
};
