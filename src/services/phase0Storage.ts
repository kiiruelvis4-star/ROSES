/**
 * Little Roses Academy - Phase 0 Storage for Logo and Campus Photo
 */

const STORAGE_KEYS = {
  LOGO: 'lra_installed_school_logo',
  CAMPUS_PHOTO: 'lra_installed_campus_photo',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const phase0Storage = {
  getAttachedLogo(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LOGO);
    } catch {
      return null;
    }
  },

  setAttachedLogo(dataUrl: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGO, dataUrl);
      notify();
    } catch {}
  },

  clearAttachedLogo(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGO);
      notify();
    } catch {}
  },

  getAttachedCampusPhoto(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CAMPUS_PHOTO);
    } catch {
      return null;
    }
  },

  setAttachedCampusPhoto(dataUrl: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPUS_PHOTO, dataUrl);
      notify();
    } catch {}
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
