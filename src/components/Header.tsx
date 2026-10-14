import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { ConnectionPill } from './ConnectionPill.tsx';
import { dataLayer, subscribeToDataLayer } from '../services/dataLayer.ts';
import { LogOut, ArrowLeft, Menu, Sun, Moon } from 'lucide-react';
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
  showMenu = true,
  onOpenMenu,
  showLogout = false,
  onLogout,
  rightAction,
}) => {
  const [termInfo, setTermInfo] = useState(dataLayer.getAcademicTermInfo());
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return dataLayer.getEffectiveTheme();
  });

  useEffect(() => {
    const update = () => {
      setTermInfo(dataLayer.getAcademicTermInfo());
      setThemeMode(dataLayer.getEffectiveTheme());
    };
    return subscribeToDataLayer(update);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    dataLayer.saveAppearanceConfig({ themeMode: nextTheme });
    dataLayer.applyTheme({ ...dataLayer.getAppearanceConfig(), themeMode: nextTheme });
    setThemeMode(nextTheme);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#0a1e4a] via-[#0d2b6b] to-[#0a1e4a] rounded-b-2xl sm:rounded-b-3xl shadow-xl px-3.5 py-2.5 sm:py-3 text-white border-b border-blue-900/50 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: 3-line Hamburger Menu, Back button, and Official Round Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showMenu && onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="p-1.5 sm:p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/90 text-amber-300 hover:text-white transition active:scale-95 cursor-pointer border border-blue-800/60 shadow-sm"
              title="Open full menu and excess tabs (≡)"
              aria-label="Open portal navigation menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {showBack && onBack && (
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/90 text-slate-200 hover:text-white transition active:scale-95 cursor-pointer border border-blue-800/60 shadow-sm"
              title="Go back"
              aria-label="Go back to previous view"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Logo size="xs" showTagline={false} />
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white leading-tight drop-shadow-sm line-clamp-1">
                {title || 'Little Roses Academy'}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-blue-200/90 font-medium">
                {subtitle ? (
                  <span className="line-clamp-1">{subtitle}</span>
                ) : (
                  <>
                    <span className="text-amber-300 font-bold">{termInfo.term}</span>
                    <span>•</span>
                    <span>Week {termInfo.weekNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Theme Switcher, Avatar, Sync Pill & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1-Tap Light/Dark Mode Switcher */}
          <button
            onClick={handleToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900/90 text-amber-300 hover:text-amber-200 border border-blue-800/60 transition active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle dark and light theme"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-200" />
            )}
          </button>

          {/* User Photo Avatar */}
          {(photoUrl || dataLayer.getCurrentSession()?.photoUrl) && (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-amber-400 overflow-hidden shrink-0 shadow bg-slate-900">
              <img
                src={photoUrl || dataLayer.getCurrentSession()?.photoUrl}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <PWAInstallButton compact />
          <ConnectionPill />

          {rightAction}

          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-800/40 transition active:scale-95 cursor-pointer shadow-sm"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

