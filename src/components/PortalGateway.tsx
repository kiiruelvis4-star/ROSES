/**
 * Little Roses Academy - Portal Gateway Screen
 * 
 * SPECIFICATION RULES:
 * Section 1 & 12:
 * 1. ADMIN PORTAL (School Administration)
 * 2. TEACHER PORTAL (Staff & Teachers)
 * 3. PARENT PORTAL (Parents & Guardians)
 * 4. LEARNER PORTAL (Learners)
 * 
 * Target approximately: 390 × 844 modern Android-native feel.
 * Clean spacing, rounded cards.
 * If no users configured: shows initial administrator setup state.
 * No hardcoded demo credentials.
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  GraduationCap,
  Users,
  BookOpen,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
import { PortalType } from '../types/phase0.ts';
import { phase0Storage } from '../services/phase0Storage.ts';

interface PortalGatewayProps {
  onSelectPortal: (portal: PortalType) => void;
  onOpenInitialSetup: () => void;
}

export const PortalGateway: React.FC<PortalGatewayProps> = ({
  onSelectPortal,
  onOpenInitialSetup,
}) => {
  const [userCount, setUserCount] = useState<number>(0);
  const schoolInfo = phase0Storage.getSchoolInfo();

  useEffect(() => {
    const update = () => {
      setUserCount(phase0Storage.getUsers().length);
    };
    update();
    return phase0Storage.subscribe(update);
  }, []);

  const portals: {
    type: PortalType;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    colorClasses: string;
    borderClasses: string;
    badge: string;
  }[] = [
    {
      type: 'ADMIN',
      title: 'School Administration',
      subtitle: 'Office console, academic years, grades & security',
      icon: Shield,
      colorClasses: 'from-blue-600 to-indigo-800 text-white',
      borderClasses: 'border-blue-500/30 hover:border-blue-500',
      badge: 'Full Control',
    },
    {
      type: 'TEACHER',
      title: 'Staff & Teachers',
      subtitle: 'CBC classroom timetable, schemes & assessments',
      icon: GraduationCap,
      colorClasses: 'from-emerald-600 to-teal-800 text-white',
      borderClasses: 'border-emerald-500/30 hover:border-emerald-500',
      badge: 'Teaching Staff',
    },
    {
      type: 'PARENT',
      title: 'Parents & Guardians',
      subtitle: 'Linked children CBC reports, attendance & homework',
      icon: Users,
      colorClasses: 'from-amber-600 to-orange-700 text-white',
      borderClasses: 'border-amber-500/30 hover:border-amber-500',
      badge: 'Family Portal',
    },
    {
      type: 'LEARNER',
      title: 'Learners Portal',
      subtitle: 'Daily lessons, homework, storybook & focus zone',
      icon: BookOpen,
      colorClasses: 'from-purple-600 to-indigo-900 text-white',
      borderClasses: 'border-purple-500/30 hover:border-purple-500',
      badge: 'Pupils UPI',
    },
  ];

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Phase 0 Foundation
          </span>
        </div>
        <ThemeSelector compact />
      </div>

      {/* Main Portal Body */}
      <div className="flex flex-col items-center my-auto py-4">
        {/* Crest & School Identity */}
        <div className="mb-4">
          <Logo size="md" showTagline={true} allowPhotoUpload={false} />
        </div>

        <div className="text-center mb-6 max-w-sm">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-serif">
            {schoolInfo.name}
          </h2>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
            {schoolInfo.motto} • Nakuru, Kenya
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            <span>LEARN</span>
            <span>•</span>
            <span>LOVE</span>
            <span>•</span>
            <span>LEAD</span>
          </div>
        </div>

        {/* Initial Setup Notification if No Administrator exists */}
        {userCount === 0 && (
          <div className="w-full max-w-md mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Initial Phase 0 Foundation Setup
                </h4>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-snug">
                  No accounts exist yet. In compliance with Phase 0 rules, no hardcoded accounts are pre-installed.
                </p>
                <button
                  onClick={onOpenInitialSetup}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
                >
                  <span>Configure School Administrator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portal Cards Grid */}
        <div className="w-full max-w-md grid grid-cols-1 gap-2.5">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.type}
                onClick={() => onSelectPortal(p.type)}
                className={`group w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border ${p.borderClasses} shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between text-left`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.colorClasses} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {p.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {p.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>ONE Connected School Operating System • Permanent Entity IDs</span>
        </p>
      </div>
    </div>
  );
};
