import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';

interface Splash2Props {
  mode?: 'phone' | 'tablet' | 'full';
  onComplete: () => void;
}

export function Splash2({ onComplete }: Splash2Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      data-splash="true"
      onClick={onComplete}
      className="relative w-full h-full flex-1 flex flex-col items-center justify-between p-8 bg-[#070D1E] text-white select-none cursor-pointer overflow-hidden"
    >
      <div className="w-full flex justify-end">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Version 1.0.0
        </span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-500">
        <Logo size="xl" showTagline={true} />
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tight text-white">
            LITTLE ROSES ACADEMY
          </h2>
          <p className="text-xs font-mono text-slate-400">
            OFFICIAL CBC PRIMARY SCHOOL PORTAL
          </p>
        </div>
      </div>

      {/* Progress Bar 0-100% */}
      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Loading offline modules...</span>
          <span className="font-bold text-amber-400">{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-[10px] text-slate-500 font-mono pt-1">
          Tap anywhere to skip
        </p>
      </div>
    </div>
  );
}
