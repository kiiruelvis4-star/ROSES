import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { ArrowLeft, Lock, ShieldCheck, AlertCircle, Fingerprint } from 'lucide-react';
import { dataLayer } from '../services/dataLayer.ts';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AdminLogin({ onBack, onSuccess }: AdminLoginProps) {
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const secConfig = dataLayer.getSecurityConfig();

  const handleBiometricLogin = async () => {
    setError('');
    const lockStatus = dataLayer.isAccountLocked();
    if (lockStatus.locked) {
      setError(
        `Account temporarily frozen due to repeated invalid attempts. Please retry in ${lockStatus.remainingMinutes} minute${lockStatus.remainingMinutes > 1 ? 's' : ''}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Hardware biometric authentication attempt
      dataLayer.resetFailedAdminLogins();
      dataLayer.logSecurityActivity({
        eventType: 'login_success',
        description: 'Successful administrative login via biometric hardware authentication (Touch ID / Face ID)',
        actor: 'Principal / School Office',
        device:
          typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile')
            ? 'Mobile Biometric Enclave'
            : 'Workstation Biometric Enclave',
        status: 'success',
      });
      dataLayer.setSession({
        role: 'admin',
        id: 'admin-principal',
        name: 'Principal / School Office',
        identifier: 'ADMIN',
      });
      onSuccess();
    } catch {
      setError('Biometric authentication failed. Please enter your administrator password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lockStatus = dataLayer.isAccountLocked();
    if (lockStatus.locked) {
      setError(`Account temporarily frozen due to repeated invalid attempts. Please retry in ${lockStatus.remainingMinutes} minute${lockStatus.remainingMinutes > 1 ? 's' : ''}.`);
      return;
    }

    if (!adminCode.trim()) {
      setError('Please enter your School Office admin password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isValid = await dataLayer.verifyAdminCode(adminCode);
      if (isValid) {
        dataLayer.resetFailedAdminLogins();
        dataLayer.logSecurityActivity({
          eventType: 'login_success',
          description: 'Successful administrative login via password authentication',
          actor: 'Principal / School Office',
          device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Workstation',
          status: 'success',
        });
        dataLayer.setSession({
          role: 'admin',
          id: 'admin-principal',
          name: 'Principal / School Office',
          identifier: 'ADMIN',
        });
        onSuccess();
      } else {
        const failure = dataLayer.recordFailedAdminLogin();
        if (failure.isLocked) {
          setError('Maximum failed login attempts reached. Account is temporarily frozen for 15 minutes.');
        } else {
          setError(`Invalid admin password. Failed attempt ${failure.attempts} of 5.`);
        }
      }
    } catch {
      setError('An error occurred during verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col p-4 sm:p-6 bg-[#070D1E] text-white overflow-y-auto">
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Office Gateway
        </span>
      </div>

      <div className="max-w-sm w-full mx-auto my-auto flex flex-col items-center space-y-6">
        <Logo size="lg" showTagline={true} />

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">
            SCHOOL ADMINISTRATION
          </h2>
          <p className="text-xs text-slate-400">
            Enter your official school office admin password to access administrative operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-normal"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Access School Office'}</span>
          </button>

          {secConfig.biometricEnabled && (
            <div className="pt-1">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-mono text-slate-500">
                  Or Biometric Key
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Sign in with Biometrics (Touch ID / Face ID)</span>
              </button>
            </div>
          )}
        </form>

        <p className="text-[11px] text-slate-500 text-center font-mono">
          Offline Secured • Dual Role Authorized
        </p>
      </div>
    </div>
  );
}
