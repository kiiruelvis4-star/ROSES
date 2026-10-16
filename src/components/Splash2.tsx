import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { dataLayer } from '../services/dataLayer.ts';

interface Splash2Props {
  mode?: 'phone' | 'tablet' | 'full';
  onComplete: () => void;
}

export function Splash2({ onComplete }: Splash2Props) {
  const [progress, setProgress] = useState(0);
  const profile = dataLayer.getSchoolProfile();
  const [imgSrc, setImgSrc] = useState<string>(
    profile.splash2ImageUrl || '/src/assets/images/splash2_learner_desk_1791992488500.jpg'
  );

  useEffect(() => {
    // Smooth progress increment up to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 250);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(interval);
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
      className="relative w-full h-full flex-1 flex flex-col items-center justify-between p-6 sm:p-8 bg-[#070D1E] text-white select-none cursor-pointer overflow-hidden"
      aria-label="Little Roses Academy Readiness. Tap to skip to portal gate."
    >
      {/* Background: Learner studying at desk with laptop & books or custom splash 2 image */}
      <img
        src={imgSrc}
        alt="Little Roses Academy Learner at desk studying"
        className="absolute inset-0 w-full h-full object-cover opacity-40 scale-100 transition-transform duration-1000 ease-out"
        referrerPolicy="no-referrer"
        onError={() => {
          if (imgSrc !== '/src/assets/images/splash2_learner_desk_1791992488500.jpg') {
            setImgSrc('/src/assets/images/splash2_learner_desk_1791992488500.jpg');
          }
        }}
      />

      {/* Measured Dark Navy Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070D1E]/85 via-[#070D1E]/75 to-[#070D1E]/95 pointer-events-none" />

      {/* Top Curriculum Indicator */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2">
        <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
          KENYAN CBC
        </span>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
          Primary School · Grades 1–6
        </span>
      </div>

      {/* Center Branding & Official Tagline */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center animate-in zoom-in-95 duration-500 my-auto">
        <Logo size="lg" showTagline={false} />

        <div className="space-y-1.5 pt-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
            LITTLE ROSES ACADEMY
          </h2>
          <p className="text-sm sm:text-base font-extrabold tracking-widest text-amber-400 uppercase">
            LEARN TODAY BUILD TOMORROW
          </p>
          <p className="text-xs text-slate-300 font-medium tracking-wide">
            Nakuru, Kenya
          </p>
        </div>
      </div>

      {/* Bottom System Readiness Indicator */}
      <div className="relative z-10 w-full max-w-xs space-y-2 pb-4">
        <div className="flex justify-between items-center text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-400">System Readiness</span>
          </span>
          <span className="font-bold text-amber-400 tabular-nums">{progress}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 rounded-full bg-slate-800/80 border border-slate-700/60 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-100 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
          <span>Encrypted School Gate</span>
          <span className="hover:text-slate-200">Tap anywhere to enter</span>
        </div>
      </div>
    </div>
  );
}

