/**
 * Little Roses Academy (LRA) - Phase 0 Theme Manager
 * 
 * SPECIFICATION RULES:
 * Section 9: THEME SYSTEM
 * Support: LIGHT, DARK, SYSTEM
 * Default: SYSTEM
 * Allow the user to change theme.
 * Persist the preference locally.
 * The theme must affect background, cards, text, borders, navigation, dialogs, inputs, menus.
 * Subject colours must remain recognizable in both themes.
 * Assessment colours must remain recognizable in both themes.
 */

import { ThemePreference } from '../types/phase0.ts';

const THEME_STORAGE_KEY = 'lra_theme_preference';

type ThemeChangeListener = (theme: ThemePreference, resolvedDark: boolean) => void;

class ThemeManager {
  private preference: ThemePreference = 'system';
  private listeners: Set<ThemeChangeListener> = new Set();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        this.preference = stored;
      } else {
        this.preference = 'system';
      }
    } catch {
      this.preference = 'system';
    }

    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        if (this.preference === 'system') {
          this.applyTheme();
        }
      });
    }

    this.applyTheme();
  }

  public getPreference(): ThemePreference {
    return this.preference;
  }

  public isDark(): boolean {
    if (this.preference === 'dark') return true;
    if (this.preference === 'light') return false;
    // system
    if (typeof window !== 'undefined' && this.mediaQuery) {
      return this.mediaQuery.matches;
    }
    return false;
  }

  public setPreference(pref: ThemePreference) {
    this.preference = pref;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch (e) {
      console.warn('Could not save theme preference to localStorage:', e);
    }
    this.applyTheme();
  }

  private applyTheme() {
    if (typeof document === 'undefined') return;
    const dark = this.isDark();
    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    this.listeners.forEach((listener) => {
      try {
        listener(this.preference, dark);
      } catch (err) {
        console.error('Error in theme listener:', err);
      }
    });
  }

  public subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.preference, this.isDark());
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const themeManager = new ThemeManager();
