/**
 * Little Roses Academy - Learners Login
 * 
 * SPEC RULE 8:
 * "learners by UPI + PIN; PIN at least 4 digits.
 * Passwords and PINs are stored hashed, never displayed."
 */

import React, { useState } from 'react';
import { Header } from './Header.tsx';
import { dataLayer, hashSecret } from '../services/dataLayer.ts';
import { Sparkles, KeyRound, UserCheck, AlertCircle, LogIn, Award } from 'lucide-react';

interface LearnersLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const LearnersLogin: React.FC<LearnersLoginProps> = ({ onBack, onSuccess }) => {
  const [upi, setUpi] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUpi = upi.trim().toUpperCase();
    if (!cleanUpi) {
      setError('Please enter your School UPI number');
      return;
    }

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    try {
      setLoading(true);
      const pupil = dataLayer.getPupilByUpi(cleanUpi);
      if (!pupil) {
        setError('No pupil found with UPI ' + cleanUpi + '. Please verify with your class teacher.');
        return;
      }

      if (pupil.status !== 'Active') {
        setError(`This pupil record is marked as ${pupil.status}. Please check with the school office.`);
        return;
      }

      const inputPinHash = await hashSecret(pin);
      if (inputPinHash !== pupil.pinHash) {
        setError('Incorrect PIN. Ask your class teacher or parents if you need your PIN reset.');
        return;
      }

      dataLayer.setSession({
        role: 'learner',
        id: pupil.id,
        name: pupil.name,
        identifier: pupil.upi,
      });

      onSuccess();
    } catch {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white">
      <Header
        title="Learners"
        subtitle="Pupil Space"
        showBack={true}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-sm mx-auto w-full flex flex-col justify-center">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black tracking-wide text-white">
            Learner Sign In
          </h2>
          <p className="text-xs text-slate-400 text-center mt-1">
            Enter your UPI and secret 4-digit PIN to access your homework and timetable
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pupil UPI Number
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={upi}
                onChange={(e) => setUpi(e.target.value.toUpperCase())}
                placeholder="e.g. LRA-2026-0001"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 font-mono"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Format: LRA-&lt;year&gt;-XXXX (printed on your credentials sheet)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Secret PIN (4+ digits)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 font-mono tracking-widest"
                required
                minLength={4}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Entering...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Go to My Classroom</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
          >
            ← Back to Portal Selection
          </button>
        </div>
      </div>
    </div>
  );
};
