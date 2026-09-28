/**
 * Little Roses Academy - Splash 2
 * 
 * SPEC RULE 2:
 * "Splash 2 (navy, logo, tagline, 0-100% bar) -> portal selection with four cards:
 * School Administration, Staff & Teachers, Parents & Guardians, Learners."
 */

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';

interface Splash2Props {
  onComplete?: () => void;
}

export const Splash2: React.FC<Splash2Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds smooth count up to 100%

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="relative w-full h-full flex flex-col items-center justify-between p-8 select-none bg-[#070D1E] text-white cursor-pointer"
      title="Tap to skip"
    >
      {/* Top spacing */}
      <div className="w-full flex justify-end">
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          Kenyan CBC
        </span>
      </div>

      {/* Center: Navy, Logo, Tagline */}
      <div className="flex flex-col items-center justify-center">
        <Logo size="xl" showTagline={true} />
        <p className="mt-4 text-xs tracking-wider text-slate-400 font-medium">
          Primary School • Grades 1 – 6
        </p>
      </div>

      {/* Bottom: 0 - 100% progress bar */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2 mb-4">
        <div className="w-full flex justify-between text-xs font-mono font-bold text-amber-400">
          <span>Loading School System</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/60 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
