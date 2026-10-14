import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2, GraduationCap, Users, Sparkles, Check, ArrowRight } from 'lucide-react';

export type PortalTypeKey = 'admin' | 'teachers' | 'parents' | 'learners';

export interface PortalSwitcherBadgeProps {
  currentPortal: PortalTypeKey;
  onSwitchPortal?: (portal: PortalTypeKey) => void;
  className?: string;
}

const PORTALS_CONFIG: Array<{
  id: PortalTypeKey;
  name: string;
  shortName: string;
  roleTitle: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  desc: string;
}> = [
  {
    id: 'admin',
    name: 'School Office (Admin)',
    shortName: 'Admin Office',
    roleTitle: 'Administration & Head Office',
    icon: '🏛️',
    colorClass: 'text-amber-300',
    borderClass: 'border-amber-400/40',
    bgClass: 'bg-amber-500/15',
    desc: 'Pupils registry, faculty accounts, fees & school repository',
  },
  {
    id: 'teachers',
    name: 'Teachers Curriculum Desk',
    shortName: 'Teachers Desk',
    roleTitle: 'Faculty & Curriculum Workbench',
    icon: '👨‍🏫',
    colorClass: 'text-emerald-300',
    borderClass: 'border-emerald-400/40',
    bgClass: 'bg-emerald-500/15',
    desc: 'CBC Schemes of work, lesson notes, CATs & attendance',
  },
  {
    id: 'parents',
    name: 'Parents & Guardians Portal',
    shortName: 'Parents Portal',
    roleTitle: 'Family & Guardians Hub',
    icon: '👨‍👩‍👧',
    colorClass: 'text-sky-300',
    borderClass: 'border-sky-400/40',
    bgClass: 'bg-sky-500/15',
    desc: 'Child academic attainments, homework push & fee balance',
  },
  {
    id: 'learners',
    name: 'Learners CBC Study Zone',
    shortName: 'Learners App',
    roleTitle: 'Pupil Learning App',
    icon: '🎒',
    colorClass: 'text-purple-300',
    borderClass: 'border-purple-400/40',
    bgClass: 'bg-purple-500/15',
    desc: 'Interactive assignments, CBC subject badges & attainments',
  },
];

export function PortalSwitcherBadge({
  currentPortal,
  onSwitchPortal,
  className = '',
}: PortalSwitcherBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activePortalConfig =
    PORTALS_CONFIG.find((p) => p.id === currentPortal) || PORTALS_CONFIG[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!onSwitchPortal) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${activePortalConfig.bgClass} ${activePortalConfig.borderClass} ${activePortalConfig.colorClass} ${className}`}
      >
        <span>{activePortalConfig.icon}</span>
        <span className="hidden sm:inline">{activePortalConfig.shortName}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${activePortalConfig.bgClass} ${activePortalConfig.borderClass} ${activePortalConfig.colorClass} hover:brightness-125`}
        title="Switch to another School Portal (Admin, Teachers, Parents, Learners)"
      >
        <span className="text-sm leading-none">{activePortalConfig.icon}</span>
        <span className="hidden sm:inline font-black tracking-tight">
          {activePortalConfig.shortName}
        </span>
        <span className="sm:hidden font-black uppercase text-[10px]">Portal</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-2xl bg-[#0B152E] border border-cyan-500/40 shadow-2xl p-2 z-[100] text-white space-y-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Switch Active Portal</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Linked</span>
          </div>

          <div className="space-y-1">
            {PORTALS_CONFIG.map((portal) => {
              const isCurrent = portal.id === currentPortal;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (!isCurrent) {
                      onSwitchPortal(portal.id);
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 cursor-pointer ${
                    isCurrent
                      ? `${portal.bgClass} ${portal.borderClass} border ${portal.colorClass}`
                      : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{portal.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black truncate">{portal.name}</span>
                      {isCurrent ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-cyan-400 text-slate-950 uppercase shrink-0">
                          Current
                        </span>
                      ) : (
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {portal.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
