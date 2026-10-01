/**
 * Little Roses Academy - Unified Portal Authentication Screen
 * 
 * SPECIFICATION RULES:
 * Section 12, 13, 14, 15:
 * - Admin, Teacher, Learner, Parent authentications
 * - Never store or display plaintext passwords
 * - Account lock & rate limiting (5 attempts = 15m lock)
 * - Biometric login architecture
 * - No fake demo accounts hardcoded
 * - If no users exist, provides administrative provisioning
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  User as UserIcon,
  Phone,
  Fingerprint,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
import { PortalType, UserSession } from '../types/phase0.ts';
import { phase0Storage } from '../services/phase0Storage.ts';

interface AuthScreenProps {
  portal: PortalType;
  onBack: () => void;
  onSuccess: (session: UserSession) => void;
  onNeedInitialSetup?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  portal,
  onBack,
  onSuccess,
  onNeedInitialSetup,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable] = useState(phase0Storage.isBiometricSupported());

  const portalConfig = {
    ADMIN: {
      title: 'School Administration Login',
      idLabel: 'Admin Identifier / Username / Phone',
      idPlaceholder: 'e.g. admin@littleroses.co.ke or phone',
      secretLabel: 'Administrator Password',
      secretPlaceholder: 'Enter secure password',
      icon: Lock,
      badge: 'Admin Office',
    },
    TEACHER: {
      title: 'Staff & Teachers Login',
      idLabel: 'Registered Staff Phone Number',
      idPlaceholder: 'e.g. 0712345678 or +254...',
      secretLabel: 'Teacher Password',
      secretPlaceholder: 'Enter staff password',
      icon: Phone,
      badge: 'Teaching Faculty',
    },
    PARENT: {
      title: 'Parents & Guardians Login',
      idLabel: 'Registered Parent Phone Number',
      idPlaceholder: 'e.g. 0712345678 or +254...',
      secretLabel: 'Parent Password',
      secretPlaceholder: 'Enter your password (min 6 chars)',
      icon: Phone,
      badge: 'Family Portal',
    },
    LEARNER: {
      title: 'Learners Portal Login',
      idLabel: 'Learner UPI / Permanent ID',
      idPlaceholder: 'e.g. LRA-2026-0001',
      secretLabel: 'Learner PIN',
      secretPlaceholder: '4-digit pupil PIN',
      icon: UserIcon,
      badge: 'Learner Zone',
    },
  }[portal];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your identifier.');
      return;
    }
    if (!password) {
      setError('Please enter your password or PIN.');
      return;
    }

    setLoading(true);
    try {
      const session = await phase0Storage.authenticate(identifier, password, portal);
      onSuccess(session);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setError(null);
    try {
      // Find matching user for identifier if typed, or prompt passkey
      const targetUser = identifier.trim()
        ? phase0Storage.findUserByIdentifier(identifier.trim())
        : phase0Storage.getUserByRole(portal)[0];

      if (!targetUser) {
        setError('Please enter your registered identifier first to use biometric login.');
        return;
      }

      if (!phase0Storage.isBiometricEnabledForUser(targetUser.id)) {
        setError('Biometric login is not yet enrolled for this account. Sign in with password first to enable.');
        return;
      }

      setLoading(true);
      const session = await phase0Storage.authenticateBiometric(targetUser.id);
      onSuccess(session);
    } catch (err: any) {
      setError(err?.message || 'Biometric authentication was cancelled or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const usersInSystem = phase0Storage.getUsers().length;

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Portals</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {portalConfig.badge}
          </span>
          <ThemeSelector compact />
        </div>
      </div>

      {/* Main Authentication Box */}
      <div className="flex flex-col items-center my-auto py-4 w-full max-w-sm mx-auto">
        <div className="mb-4">
          <Logo size="sm" showTagline={false} allowPhotoUpload={false} />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {portalConfig.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Little Roses Academy • Secure Authentication
          </p>
        </div>

        {/* If no accounts in system and this is Admin portal */}
        {usersInSystem === 0 && portal === 'ADMIN' && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-center">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
              No School Administrator Account Configured
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-1">
              Phase 0 requires initial configuration without hardcoded demo accounts.
            </p>
            {onNeedInitialSetup && (
              <button
                type="button"
                onClick={onNeedInitialSetup}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
              >
                Initialize First Administrator
              </button>
            )}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {portalConfig.idLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={portalConfig.idPlaceholder}
                disabled={loading}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {portalConfig.secretLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={portalConfig.secretPlaceholder}
                disabled={loading}
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign In to {portal}</span>
              </>
            )}
          </button>

          {/* Biometric Login Button */}
          {biometricAvailable && (
            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500/60 dark:hover:border-amber-400/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-4 h-4 text-amber-500" />
              <span>Biometric / Passkey Login</span>
            </button>
          )}
        </form>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Salted cryptographic SHA-256 verification • Never plaintext</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
        <p className="text-[10px] text-slate-400">
          Little Roses Academy Operating System • Phase 0 Permanent Identifiers
        </p>
      </div>
    </div>
  );
};
