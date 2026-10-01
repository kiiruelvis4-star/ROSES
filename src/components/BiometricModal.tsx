/**
 * Little Roses Academy - Phase 0 Biometric Prompt Modal
 * 
 * SPECIFICATION RULE 15:
 * First normal successful login may offer:
 * "Enable biometric login?"
 * Buttons:
 * YES, ENABLE
 * NOT NOW
 * Biometric verification must be handled by operating system/platform.
 * Application never stores raw fingerprint or face data.
 */

import React from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onEnable,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-500 dark:text-amber-400 mx-auto mb-4 border border-amber-500/20">
          <Fingerprint className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Enable biometric login?
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Use your device fingerprint, face recognition, or screen lock passkey for faster and more secure sign-ins to Little Roses Academy.
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-6 bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Biometric credentials are securely verified by your operating system.</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onEnable}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md transition-transform active:scale-98"
          >
            YES, ENABLE
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors"
          >
            NOT NOW
          </button>
        </div>
      </div>
    </div>
  );
};
