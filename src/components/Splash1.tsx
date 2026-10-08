import React, { useEffect } from 'react';
import { Logo } from './Logo.tsx';

export function Splash1({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      data-splash="true"
      onClick={onComplete}
      className="relative w-full h-full flex-1 flex flex-col items-center justify-center cursor-pointer select-none bg-[#070D1E] overflow-hidden"
    >
      {/* Background with navy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070D1E]/80 via-[#070D1E]/70 to-[#070D1E] z-10" />

      {/* Campus photo if present */}
      <img
        src="/src/assets/images/little_roses_campus_1790246122159.jpg"
        alt="Little Roses Academy Campus"
        className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105 animate-pulse duration-1000"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-700">
        <Logo size="xl" showTagline={true} />
        <div className="pt-8">
          <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
            Nakuru, Kenya • CBC Primary School
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 z-20 text-[10px] text-slate-500 font-mono tracking-wider">
        Tap anywhere to continue
      </div>
    </div>
  );
}
