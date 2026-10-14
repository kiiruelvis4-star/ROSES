import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { ArrowLeft, GraduationCap, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { dataLayer } from '../services/dataLayer.ts';

interface LearnersLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function LearnersLogin({ onBack, onSuccess }: LearnersLoginProps) {
  const [upi, setUpi] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('lra_learner_lockout_ts');
      if (stored) {
        const val = parseInt(stored, 10);
        return val > Date.now() ? val : 0;
      }
    } catch {}
    return 0;
  });

  const getFailedAttempts = (cleanUpi: string): number => {
    try {
      const stored = localStorage.getItem(`lra_learner_fails_${cleanUpi}`);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  };

  const recordFailedAttempt = (cleanUpi: string): { attempts: number; isLocked: boolean; remaining: number } => {
    const current = getFailedAttempts(cleanUpi) + 1;
    try {
      localStorage.setItem(`lra_learner_fails_${cleanUpi}`, current.toString());
      if (current >= 5) {
        const until = Date.now() + 15 * 60 * 1000; // 15-minute lockout
        localStorage.setItem('lra_learner_lockout_ts', until.toString());
        setLockoutUntil(until);
        return { attempts: current, isLocked: true, remaining: 0 };
      }
    } catch {}
    return { attempts: current, isLocked: false, remaining: 5 - current };
  };

  const clearFailedAttempts = (cleanUpi: string) => {
    try {
      localStorage.removeItem(`lra_learner_fails_${cleanUpi}`);
      localStorage.removeItem('lra_learner_lockout_ts');
      setLockoutUntil(0);
    } catch {}
  };

  const isCurrentlyLocked = lockoutUntil > Date.now();
  const minutesRemaining = Math.max(1, Math.ceil((lockoutUntil - Date.now()) / (60 * 1000)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isCurrentlyLocked) {
      setError(`Account is temporarily locked due to repeated incorrect PIN attempts. Try again in ${minutesRemaining} minute(s) or ask your class teacher/parent to verify your PIN.`);
      return;
    }

    const cleanUpi = upi.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (!cleanUpi || !cleanPin) {
      setError('Please enter your School UPI number and 4-digit PIN.');
      return;
    }

    if (cleanPin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }

    setIsSubmitting(true);
    try {
      const pupil = await dataLayer.verifyLearnerLogin(cleanUpi, cleanPin);
      if (pupil) {
        clearFailedAttempts(cleanUpi);
        dataLayer.setSession({
          role: 'learner',
          id: pupil.id,
          name: pupil.name,
          identifier: pupil.upi,
          activeChildUpi: pupil.upi,
          photoUrl: pupil.photoUrl,
          residence: pupil.residence,
        });
        onSuccess();
      } else {
        const { isLocked, remaining } = recordFailedAttempt(cleanUpi);
        if (isLocked) {
          setError('Security lockout triggered: 5 failed PIN attempts. Access locked for 15 minutes. Contact your class teacher to reset your PIN.');
        } else {
          setError(`Incorrect UPI or PIN. ${remaining} attempt(s) remaining before a 15-minute security lockout.`);
        }
      }
    } catch {
      setError('Authentication error occurred. Please try again.');
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
        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
          Pupil Space
        </span>
      </div>

      <div className="max-w-sm w-full mx-auto my-auto flex flex-col items-center space-y-6">
        <Logo size="lg" showTagline={true} />

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">
            LEARNERS PORTAL
          </h2>
          <p className="text-xs text-slate-400">
            Sign in with your pupil UPI number and 4-digit secret PIN to see your lessons and storybooks!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Pupil UPI Number
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={upi}
                onChange={(e) => setUpi(e.target.value.toUpperCase())}
                placeholder="e.g. LRA-2026-0001"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              4-Digit Secret PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN (e.g. 1234)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In to My Classes'}</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center font-mono">
          Sample UPI: LRA-2026-0001 (Brian) • LRA-2026-0002 (Faith) • PIN: 1234
        </p>
      </div>
    </div>
  );
}
