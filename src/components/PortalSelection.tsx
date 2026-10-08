import React from 'react';
import { Logo } from './Logo.tsx';
import { Building2, Users, Heart, GraduationCap, ArrowRight } from 'lucide-react';

export type PortalType = 'admin' | 'teachers' | 'parents' | 'learners';

interface PortalSelectionProps {
  onSelectPortal: (portal: PortalType) => void;
}

export function PortalSelection({ onSelectPortal }: PortalSelectionProps) {
  const portals = [
    {
      id: 'admin' as const,
      title: 'School Administration',
      subtitle: 'Office & Principal Console',
      description: 'Pupil admissions, staff roster, timetables, and school operations',
      icon: Building2,
      badge: 'Admin Code',
      color: 'border-amber-500/40 hover:border-amber-400 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      iconColor: 'text-amber-400',
    },
    {
      id: 'teachers' as const,
      title: 'Staff & Teachers',
      subtitle: 'Faculty Workbench',
      description: 'Roll call, living records of work, lesson plans, and CBC marks',
      icon: Users,
      badge: 'Phone + Password',
      color: 'border-blue-500/40 hover:border-blue-400 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      iconColor: 'text-blue-400',
    },
    {
      id: 'parents' as const,
      title: 'Parents & Guardians',
      subtitle: 'Family & Children Portal',
      description: 'Daily attendance, homework book, term reports, and child progress',
      icon: Heart,
      badge: 'Phone + Password',
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'learners' as const,
      title: 'Learners Portal',
      subtitle: 'Little Roses Pupils',
      description: 'My daily timetable, homework tasks, reading storybooks, and stars',
      icon: GraduationCap,
      badge: 'UPI + PIN',
      color: 'border-purple-500/40 hover:border-purple-400 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="w-full h-full flex-1 flex flex-col p-4 sm:p-6 bg-[#070D1E] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2 pb-6">
        <Logo size="md" showTagline={true} />
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            SELECT YOUR PORTAL
          </h1>
          <p className="text-xs text-slate-400 max-w-sm">
            Choose your Little Roses Academy portal to sign in securely.
          </p>
        </div>
      </div>

      {/* 4 Portal Cards */}
      <div className="max-w-xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-6">
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <button
              key={portal.id}
              onClick={() => onSelectPortal(portal.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:scale-[1.02] active:scale-98 shadow-lg group ${portal.color}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 ${portal.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${portal.badgeColor}`}>
                  {portal.badge}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {portal.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-300">
                  {portal.subtitle}
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-slate-500 font-mono mt-auto py-2">
        Offline-Ready PWA • Nakuru, Kenya
      </div>
    </div>
  );
}
