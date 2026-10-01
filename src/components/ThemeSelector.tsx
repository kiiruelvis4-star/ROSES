/**
 * Little Roses Academy - Theme Selector Component
 * 
 * SPECIFICATION RULE 9:
 * Support: LIGHT, DARK, SYSTEM (Default: SYSTEM)
 * Allow the user to change theme. Persist locally.
 */

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { themeManager } from '../services/themeManager.ts';
import { ThemePreference } from '../types/phase0.ts';

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false, className = '' }) => {
  const [pref, setPref] = useState<ThemePreference>(themeManager.getPreference());

  useEffect(() => {
    return themeManager.subscribe((newPref) => {
      setPref(newPref);
    });
  }, []);

  const options: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  if (compact) {
    return (
      <div className={`inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 select-none ${className}`}>
        {options.map((opt) => {
          const active = pref === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => themeManager.setPreference(opt.value)}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                active
                  ? 'bg-white dark:bg-slate-700 text-amber-500 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={`Theme: ${opt.label}`}
              aria-label={`Select ${opt.label} theme`}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 select-none ${className}`}>
      {options.map((opt) => {
        const active = pref === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => themeManager.setPreference(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              active
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
