import React from 'react';
import { Logo } from './Logo.tsx';
import { Building2, BookOpen, Users, GraduationCap, Lock, Smartphone, KeyRound, ChevronRight, Sparkles } from 'lucide-react';

export type PortalType = 'admin' | 'teachers' | 'parents' | 'learners';

interface PortalSelectionProps {
  onSelectPortal: (portal: PortalType) => void;
  onOpenSplashCustomizer?: () => void;
}

export function PortalSelection({ onSelectPortal, onOpenSplashCustomizer }: PortalSelectionProps) {
  const portals = [
    {
      id: 'admin' as const,
      title: 'School Administration',
      subtitle: 'Office & Management Console',
      cue: 'Admin code + password',
      cueIcon: Lock,
      icon: Building2,
      borderGlow: 'border-amber-500/40 hover:border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.15)] hover:shadow-[0_0_32px_rgba(245,158,11,0.25)]',
      bgGradient: 'bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-slate-950',
      iconCircle: 'border-amber-400/50 bg-amber-500/10 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.25)]',
      cueColor: 'text-amber-300/90',
      btnGlow: 'border-amber-400/40 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950',
    },
    {
      id: 'teachers' as const,
      title: 'Staff and Teachers',
      subtitle: 'Faculty & Classroom Records',
      cue: 'Phone + password',
      cueIcon: Smartphone,
      icon: BookOpen,
      borderGlow: 'border-blue-500/40 hover:border-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.15)] hover:shadow-[0_0_32px_rgba(59,130,246,0.25)]',
      bgGradient: 'bg-gradient-to-b from-blue-500/10 via-slate-900/90 to-slate-950',
      iconCircle: 'border-blue-400/50 bg-blue-500/10 text-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.25)]',
      cueColor: 'text-blue-300/90',
      btnGlow: 'border-blue-400/40 text-blue-300 group-hover:bg-blue-400 group-hover:text-slate-950',
    },
    {
      id: 'parents' as const,
      title: 'Parents and Guardians',
      subtitle: 'Child Progress & Reports',
      cue: 'Phone + password',
      cueIcon: Smartphone,
      icon: Users,
      borderGlow: 'border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.15)] hover:shadow-[0_0_32px_rgba(6,182,212,0.25)]',
      bgGradient: 'bg-gradient-to-b from-cyan-500/10 via-slate-900/90 to-slate-950',
      iconCircle: 'border-cyan-400/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.25)]',
      cueColor: 'text-cyan-300/90',
      btnGlow: 'border-cyan-400/40 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950',
    },
    {
      id: 'learners' as const,
      title: 'Learners',
      subtitle: 'My Classes, Work & Stars',
      cue: 'UPI + PIN',
      cueIcon: KeyRound,
      icon: GraduationCap,
      borderGlow: 'border-purple-500/40 hover:border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.15)] hover:shadow-[0_0_32px_rgba(168,85,247,0.25)]',
      bgGradient: 'bg-gradient-to-b from-purple-500/10 via-slate-900/90 to-slate-950',
      iconCircle: 'border-purple-400/50 bg-purple-500/10 text-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.25)]',
      cueColor: 'text-purple-300/90',
      btnGlow: 'border-purple-400/40 text-purple-300 group-hover:bg-purple-400 group-hover:text-slate-950',
    },
  ];

  return (
    <div className="w-full h-full flex-1 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 bg-[#070D1E] text-white overflow-y-auto select-none">
      {/* Top Header Crowned with the Official Round School Logo */}
      <div className="w-full max-w-lg flex flex-col items-center text-center pt-2 pb-6 sm:pb-8">
        {/* Round School Logo replacing generic shield per user request */}
        <div className="relative mb-3 flex items-center justify-center animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
          <Logo size="lg" showTagline={false} />
        </div>

        {/* SELECT SECURITY PORTAL Title */}
        <div className="space-y-1.5 mt-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-amber-400 uppercase drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]">
            SELECT SECURITY PORTAL
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Little Roses Academy · Nakuru, Kenya
          </p>
        </div>

        {/* Ambient Glow Beam */}
        <div className="w-48 h-0.5 mt-4 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      </div>

      {/* 4 Glowing Portal Cards (2x2 Grid) */}
      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const CueIcon = portal.cueIcon;

          return (
            <button
              key={portal.id}
              onClick={() => onSelectPortal(portal.id)}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center cursor-pointer group active:scale-[0.98] ${portal.borderGlow} ${portal.bgGradient}`}
              aria-label={`Enter ${portal.title}`}
            >
              {/* Circular Glowing Icon */}
              <div
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300 ${portal.iconCircle}`}
              >
                <Icon className="w-8 h-8" />
              </div>

              {/* Portal Title */}
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mb-1 group-hover:text-amber-300 transition-colors">
                {portal.title}
              </h2>

              <p className="text-[11px] text-slate-400 mb-4 line-clamp-1">
                {portal.subtitle}
              </p>

              {/* Sign-in Credential Cue */}
              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-medium mb-5 px-3 py-1 rounded-full bg-slate-950/60 border border-slate-800 ${portal.cueColor}`}
              >
                <CueIcon className="w-3.5 h-3.5" />
                <span>{portal.cue}</span>
              </div>

              {/* Circular Action Button */}
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${portal.btnGlow}`}
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer System Attribution & Splash Customizer Action */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center text-[10px] text-slate-500 font-mono py-2">
        <div className="flex items-center gap-2">
          <span>LEARN TODAY BUILD TOMORROW</span>
          <span>·</span>
          <span>CBC Secure Access</span>
        </div>

        {onOpenSplashCustomizer && (
          <button
            type="button"
            onClick={onOpenSplashCustomizer}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-400/40 transition-colors cursor-pointer text-[10px]"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Customise Splash</span>
          </button>
        )}
      </div>
    </div>
  );
}

