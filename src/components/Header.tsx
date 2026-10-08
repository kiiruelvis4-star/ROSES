/**
 * Little Roses Academy - Shared Mobile Header
 * 
 * Includes: Logo, Title, Real Connection Pill, Term & Week info, and Action button
 */

import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { ConnectionPill } from './ConnectionPill.tsx';
import { dataLayer, subscribeToDataLayer } from '../services/dataLayer.ts';
import { LogOut, ArrowLeft, Menu } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  photoUrl?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onOpenMenu?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  photoUrl,
  showBack = false,
  onBack,
  showMenu = false,
  onOpenMenu,
  showLogout = false,
  onLogout,
  rightAction,
}) => {
  const [termInfo, setTermInfo] = useState(dataLayer.getAcademicTermInfo());

  useEffect(() => {
    const update = () => setTermInfo(dataLayer.getAcademicTermInfo());
    return subscribeToDataLayer(update);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070D1E]/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2 text-white shadow-md">
      <div className="flex items-center justify-between gap-2">
        {/* Left: 3-line Hamburger Menu, Back button, or School Logo */}
        <div className="flex items-center gap-2">
          {showMenu && onOpenMenu ? (
            <button
              onClick={onOpenMenu}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-white transition active:scale-95 cursor-pointer border border-slate-700/60"
              title="Open portal menu (excesses & tools)"
              aria-label="Open portal menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          ) : null}

          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}

          <div className="flex items-center gap-2">
            <Logo size="xs" showTagline={false} />
            {(photoUrl || dataLayer.getCurrentSession()?.photoUrl) && (
              <div className="w-7 h-7 rounded-full border border-amber-400/80 overflow-hidden shrink-0 shadow bg-slate-900">
                <img
                  src={photoUrl || dataLayer.getCurrentSession()?.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xs font-black tracking-wider uppercase text-slate-100 leading-tight">
                {title || 'Little Roses Academy'}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {subtitle ? (
                  <span>{subtitle}</span>
                ) : (
                  <>
                    <span className="text-amber-400 font-semibold">{termInfo.term}</span>
                    <span>•</span>
                    <span>Week {termInfo.weekNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sync Status Pill + Optional Install / Actions / Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton compact />
          <ConnectionPill />

          {rightAction}

          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
