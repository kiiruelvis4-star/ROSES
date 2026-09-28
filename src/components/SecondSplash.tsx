/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CircularBadgeLogo } from './CircularBadgeLogo.tsx';

interface SecondSplashProps {
  mode?: 'phone' | 'tablet' | 'full';
  replayTrigger?: number;
  onComplete?: () => void;
}

export function SecondSplash({ mode = 'phone', replayTrigger = 0, onComplete }: SecondSplashProps) {
  const [progress, setProgress] = useState(0);

  // Smooth realistic 0% to 100% progress animation
  useEffect(() => {
    setProgress(0);
    const duration = 2800; // 2.8s smooth loading
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          if (onComplete) {
            setTimeout(onComplete, 450);
          }
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [replayTrigger, onComplete]);

  const displayPercent = Math.min(100, Math.floor(progress));

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none bg-[#070D1E] ${
        mode === 'phone' ? 'py-8 px-5' : 'py-10 px-8'
      }`}
      style={{ backgroundColor: '#070D1E' }}
    >
      {/* Background radial ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 32%, #0d1a36 0%, #070d1e 75%, #040812 100%)',
        }}
      />

      {/* TOP SECTION: Installed School Logo */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center pt-1 sm:pt-2">
        <CircularBadgeLogo
          className={
            mode === 'phone'
              ? 'w-40 h-40 sm:w-44 sm:h-44'
              : 'w-48 h-48 sm:w-56 sm:h-56'
          }
        />
      </div>

      {/* CENTER SECTION: Typography Headline & Tagline */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-2 my-auto">
        <h1
          className="text-white uppercase leading-[1.04] tracking-tight drop-shadow-md"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: mode === 'phone' ? 'clamp(2.1rem, 8.8vw, 3.1rem)' : 'clamp(3rem, 5.5vw, 4.2rem)',
          }}
        >
          <div className="tracking-wide">LEARN TODAY</div>
          <div className="tracking-wide">BUILD</div>
          <div className="flex items-center justify-center gap-2 tracking-wide">
            <span>TOMORROW</span>
            <span className="text-3xl sm:text-4xl inline-block -mt-1 select-none">🤗</span>
          </div>
        </h1>

        <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
          Preparing students for tomorrow • Loading...
        </p>
      </div>

      {/* BOTTOM SECTION: 0% to 100% Progress Bar & Status Text */}
      <div
        className={`relative z-10 w-full flex flex-col items-center pb-1 sm:pb-2 ${
          mode === 'phone' ? 'max-w-[340px]' : 'max-w-[420px]'
        }`}
      >
        <div className="w-full bg-[#0E172E]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
          {/* Progress bar track */}
          <div className="w-full h-5 sm:h-6 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${displayPercent}%`,
                background: 'linear-gradient(90deg, #E5A823 0%, #FBBF24 50%, #FDE68A 100%)',
                boxShadow: '0 0 16px rgba(251, 191, 36, 0.85)',
              }}
            />
          </div>

          {/* 0% to 100% Numeric Counter */}
          <div className="mt-2.5 text-center">
            <span
              className="text-base sm:text-lg font-extrabold tracking-wider"
              style={{ color: '#FBBF24' }}
            >
              {displayPercent}%
            </span>
          </div>
        </div>

        {/* Subtitle status text */}
        <div className="mt-3 text-center space-y-0.5">
          <p className="text-[12px] sm:text-[13px] font-medium text-slate-400">
            Almost ready...
          </p>
          <p className="text-[11px] sm:text-[12px] text-slate-500">
            Setting up your learning environment
          </p>
        </div>
      </div>
    </div>
  );
}
