/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Power, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  PhoneCall, 
  Building2, 
  Lock, 
  Check, 
  Star, 
  Heart,
  X
} from 'lucide-react';
import { CircularBadgeLogo } from './CircularBadgeLogo.tsx';
import { AdminPortal } from './AdminPortal.tsx';
import { TeachersPortal } from './TeachersPortal.tsx';

interface PortalStep3Props {
  mode?: 'phone' | 'tablet' | 'full';
  onExit?: () => void;
}

export function PortalStep3({ mode = 'phone', onExit }: PortalStep3Props) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [installedLogo, setInstalledLogo] = useState<string | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  // Sync installed logo from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lra_installed_school_logo');
    if (saved) {
      setInstalledLogo(saved);
    }
  }, []);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-y-auto overflow-x-hidden select-none transition-colors duration-300 font-sans ${
        isDarkMode ? 'bg-[#060D1E] text-white' : 'bg-slate-900 text-slate-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 15%, rgba(20, 45, 90, 0.45) 0%, rgba(6, 13, 30, 0.95) 75%),
          linear-gradient(180deg, rgba(6, 13, 30, 0.82) 0%, rgba(4, 9, 20, 0.96) 100%)
        `,
      }}
    >
      {/* =========================================================================
          1. TOP NAVIGATION BAR (LITTLE ROSES, Day/Night & Exit)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-3.5 py-2.5 bg-[#071024]/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        {/* Left: Non-editable mini crest & LITTLE ROSES location */}
        <div className="flex items-center gap-2">
          {/* Permanent mini crest logo */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-amber-400/80 bg-[#ECD8C0] shadow-sm flex-shrink-0 select-none pointer-events-none">
            {installedLogo ? (
              <img
                src={installedLogo}
                alt="Little Roses"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <CircularBadgeLogo className="w-8 h-8" />
            )}
          </div>

          {/* Location: LITTLE ROSES */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold tracking-wider text-slate-200 uppercase">
            <MapPin className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 flex-shrink-0" />
            <span>LITTLE ROSES</span>
          </div>
        </div>

        {/* Right: Theme Switcher & Red EXIT Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Day / Night Toggle */}
          <div
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/80 border border-slate-700/60 cursor-pointer shadow-inner"
            title="Toggle theme"
          >
            <Sun
              className={`w-3.5 h-3.5 transition-colors ${
                !isDarkMode ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
              }`}
            />
            {/* Pill track */}
            <div className="w-8 h-4 bg-slate-800 rounded-full p-0.5 relative transition-colors">
              <div
                className={`w-3 h-3 rounded-full bg-amber-400 shadow-md transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-4 bg-amber-400' : 'translate-x-0 bg-amber-400'
                }`}
              />
            </div>
            <Moon
              className={`w-3.5 h-3.5 transition-colors ${
                isDarkMode ? 'text-blue-400 fill-blue-400' : 'text-slate-500'
              }`}
            />
          </div>

          {/* Red EXIT Button */}
          <button
            onClick={() => onExit?.()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 border border-red-400/50"
          >
            <Power className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Scrollable & Responsive)
          ========================================================================= */}
      <main className={`flex-1 flex flex-col items-center px-4 py-4 sm:py-6 ${
        mode === 'tablet' ? 'max-w-[620px] mx-auto w-full' : 'w-full max-w-[440px] mx-auto'
      }`}>
        {/* CENTER MAIN CREST: Permanent, Non-Editable */}
        <div className="relative flex flex-col items-center justify-center mt-1 mb-3">
          <div className="relative select-none pointer-events-none">
            {installedLogo ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] border-amber-400/90 bg-[#ECD8C0] shadow-[0_10px_28px_rgba(0,0,0,0.8)]">
                <img
                  src={installedLogo}
                  alt="Little Roses Academy"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <CircularBadgeLogo className="w-24 h-24 sm:w-28 sm:h-28" />
            )}
          </div>

          {/* Golden Ribbon Banner underneath the crest */}
          <div className="mt-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-neutral-950 font-black text-[9px] tracking-widest uppercase shadow-md border border-amber-200/60">
            NURTURE • INSPIRE • EXCEL
          </div>
        </div>

        {/* Headline Header */}
        <div className="text-center mb-4">
          <h2
            className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase drop-shadow-sm"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            SELECT SECURITY PORTAL
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Choose your designated Little Roses workspace
          </p>
        </div>

        {/* =========================================================================
            3. THE 4 SECURITY PORTAL SELECTION CARDS
            ========================================================================= */}
        <div className="w-full space-y-3">
          {/* PORTAL 1: School Administration */}
          <button
            onClick={() => setSelectedPortal('School Administration')}
            className="w-full text-left bg-gradient-to-r from-[#0C1733]/95 to-[#081024]/95 hover:from-[#112048] hover:to-[#0D1836] border-2 border-amber-400/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_20px_rgba(245,158,11,0.15)] flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  School Administration
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Governance & Complete School Oversight
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-amber-400/50 text-[10px] text-amber-300 font-semibold">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Strict Admin Access • Admin Code</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          {/* PORTAL 2: Staff & Teachers */}
          <button
            onClick={() => setSelectedPortal('Staff & Teachers')}
            className="w-full text-left bg-gradient-to-r from-[#062419]/95 to-[#051A13]/95 hover:from-[#0A3324] hover:to-[#08241A] border-2 border-emerald-500 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_20px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-emerald-400/60 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                👨🏾‍🏫
              </div>

              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Staff & Teachers
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Workstation, Lessons, Resources & Assessment
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-emerald-500/60 text-[10px] text-emerald-300 font-semibold">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Staff Phone & Password Access</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          {/* PORTAL 3: Parents & Guardians */}
          <button
            onClick={() => setSelectedPortal('Parents & Guardians')}
            className="w-full text-left bg-gradient-to-r from-[#0C1C3D]/95 to-[#07132C]/95 hover:from-[#102550] hover:to-[#0A1A3A] border-2 border-blue-500 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_20px_rgba(59,130,246,0.15)] flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-blue-400/60 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                👨‍👩‍👦
              </div>

              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Parents & Guardians
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Child Progress, Homework, Timetable & Notices
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-blue-500/60 text-[10px] text-blue-300 font-semibold">
                  <Check className="w-2.5 h-2.5 text-blue-400" />
                  <span>Linked Family Phone Access</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          {/* PORTAL 4: Learners & Pupils */}
          <button
            onClick={() => setSelectedPortal('Learners & Pupils')}
            className="w-full text-left bg-gradient-to-r from-[#2B1705]/95 to-[#1A0E03]/95 hover:from-[#3A2007] hover:to-[#241304] border-2 border-amber-500 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_20px_rgba(245,158,11,0.15)] flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/60 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                👦🏾
              </div>

              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Learners & Pupils
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  My School Day, Subjects, Star Points & Focus Zone
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-amber-500/60 text-[10px] text-amber-300 font-semibold">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span>Little Roses UPI Code (LRA-YYYY-XXXX)</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
        </div>

        {/* =========================================================================
            4. BOTTOM HELP & SUPPORT CARD
            ========================================================================= */}
        <div className="w-full mt-4 bg-[#081228]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-2xl flex-shrink-0">
              🎧
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                NEED HELP? WE&apos;RE HERE FOR YOU!
              </div>
              <a
                href="tel:0702080186"
                className="flex items-center gap-1.5 text-base sm:text-lg font-black text-amber-300 hover:text-amber-200 transition-colors tracking-wide"
              >
                <PhoneCall className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <span>0702080186</span>
              </a>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                <span>We care. We listen. We help.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 w-full sm:w-auto">
            <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div className="text-[10px] leading-tight text-slate-300">
              For your safety, the admin password is{' '}
              <span className="font-extrabold text-amber-300 uppercase">NEVER</span>{' '}
              mentioned.
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          5. ROLE PORTAL VIEW (Admin Portal, Teachers Portal, or Modals)
          ========================================================================= */}
      {selectedPortal === 'School Administration' && (
        <div className="absolute inset-0 z-50 bg-[#060D1E]">
          <AdminPortal
            mode={mode}
            onBackToPortals={() => setSelectedPortal(null)}
          />
        </div>
      )}

      {selectedPortal === 'Staff & Teachers' && (
        <div className="absolute inset-0 z-50 bg-[#070D1E]">
          <TeachersPortal
            mode={mode}
            onSwitchToAdmin={() => setSelectedPortal('School Administration')}
            onExit={() => setSelectedPortal(null)}
          />
        </div>
      )}

      {selectedPortal &&
        selectedPortal !== 'School Administration' &&
        selectedPortal !== 'Staff & Teachers' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0A1633] border-2 border-amber-400/80 rounded-2xl p-5 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedPortal(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/60 mx-auto flex items-center justify-center text-3xl mb-3">
              {selectedPortal === 'Staff & Teachers' && '👨🏾‍🏫'}
              {selectedPortal === 'Parents & Guardians' && '👨‍👩‍👦'}
              {selectedPortal === 'Learners & Pupils' && '👦🏾'}
            </div>

            <h4 className="font-black text-lg text-white mb-1">{selectedPortal}</h4>
            <p className="text-xs text-slate-300 mb-4">
              Enter your credentials to access the Little Roses {selectedPortal} workspace.
            </p>

            <div className="space-y-2 mb-4 text-left">
              <label className="text-[11px] font-bold text-slate-300">Access Key / Phone</label>
              <input
                type="text"
                placeholder={
                  selectedPortal === 'Learners & Pupils'
                    ? 'LRA-2026-XXXX'
                    : 'Enter registered phone or username'
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => setSelectedPortal(null)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Sign In to {selectedPortal}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
