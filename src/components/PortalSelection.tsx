/**
 * Little Roses Academy - Portal Selection
 * 
 * SPEC RULE 2:
 * "portal selection with four cards: School Administration, Staff & Teachers, Parents & Guardians, Learners."
 */

import React from 'react';
import { Logo } from './Logo.tsx';
import { ConnectionPill } from './ConnectionPill.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { Building2, GraduationCap, Users, Sparkles, ChevronRight, ShieldCheck, Camera } from 'lucide-react';

export type PortalType = 'admin' | 'teachers' | 'parents' | 'learners';

interface PortalSelectionProps {
  onSelectPortal: (portal: PortalType) => void;
  onOpenPhotoManager?: () => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal, onOpenPhotoManager }) => {
  const portals = [
    {
      id: 'admin' as PortalType,
      title: 'School Administration',
      subtitle: 'School Office & Management',
      description: 'Admissions, staff rolls, timetables, calendar & promotion',
      icon: <Building2 className="w-6 h-6 text-amber-400" />,
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'Admin Office',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      gradient: 'from-amber-950/30 to-slate-900/60',
    },
    {
      id: 'teachers' as PortalType,
      title: 'Staff & Teachers',
      subtitle: 'Class & Subject Teachers',
      description: 'Schemes of Work, Lesson Plans, roll call & CBC assessments',
      icon: <GraduationCap className="w-6 h-6 text-emerald-400" />,
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'Educators',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      gradient: 'from-emerald-950/30 to-slate-900/60',
    },
    {
      id: 'parents' as PortalType,
      title: 'Parents & Guardians',
      subtitle: 'Family & Guardian Portal',
      description: 'Daily attendance, approved homework, report cards & notices',
      icon: <Users className="w-6 h-6 text-sky-400" />,
      border: 'border-sky-500/40 hover:border-sky-400',
      badge: 'Families',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      gradient: 'from-sky-950/30 to-slate-900/60',
    },
    {
      id: 'learners' as PortalType,
      title: 'Learners',
      subtitle: 'Pupil Learning Zone',
      description: 'Today’s lessons, interactive homework, reading books & badges',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: 'Pupils',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gradient: 'from-purple-950/30 to-slate-900/60',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white overflow-y-auto">
      {/* Top Bar with Real Connection Pill and Install Button */}
      <header className="w-full px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Logo size="xs" showTagline={false} />
          <span className="text-xs font-black tracking-wider text-slate-200">
            LRA PORTAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenPhotoManager && (
            <button
              onClick={onOpenPhotoManager}
              className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition"
              title="Change Background Photo or Logo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
          <PWAInstallButton compact />
          <ConnectionPill />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full flex flex-col items-center">
        {/* Crest & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" showTagline={true} />
          <p className="mt-2 text-xs text-slate-300 font-medium">
            Nakuru, Kenya • CBC Primary School (Grades 1–6)
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Select your school portal to continue</span>
          </div>
        </div>

        {/* The Four Portal Cards */}
        <div className="w-full space-y-3">
          {portals.map((portal) => (
            <button
              key={portal.id}
              onClick={() => onSelectPortal(portal.id)}
              className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r ${portal.gradient} border ${portal.border} transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] group relative flex items-center gap-3.5`}
            >
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                {portal.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h2 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {portal.title}
                  </h2>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${portal.badgeColor}`}
                  >
                    {portal.badge}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-300">
                  {portal.subtitle}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {portal.description}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] text-slate-500">
          Little Roses Academy • Offline Capable PWA
        </div>
      </div>
    </div>
  );
};
