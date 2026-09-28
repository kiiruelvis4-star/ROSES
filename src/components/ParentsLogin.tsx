/**
 * Little Roses Academy - Parents & Guardians Login
 * 
 * SPEC RULE 8:
 * "Login: staff and parents by phone number + password; parent password at least 6 characters.
 * Phone numbers accept 07.., 01.., +254.. and spaces."
 */

import React, { useState } from 'react';
import { Header } from './Header.tsx';
import { dataLayer, hashSecret, isValidKenyanPhone, normalizePhoneNumber } from '../services/dataLayer.ts';
import { Users, Phone, Lock, AlertCircle, LogIn, Heart } from 'lucide-react';

interface ParentsLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ParentsLogin: React.FC<ParentsLoginProps> = ({ onBack, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please enter your phone number');
      return;
    }

    if (!isValidKenyanPhone(cleanPhone)) {
      setError('Please enter a valid Kenyan phone number (e.g. 0712345678, 0112345678, or +254...)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const parent = dataLayer.getParentByPhone(cleanPhone);
      if (!parent) {
        setError('No family account linked to this phone number. Please contact the school office.');
        return;
      }

      if (!parent.passwordHash) {
        setError('Password not yet set for this family account. Please contact the school office to receive your initial access password.');
        return;
      }

      const inputHash = await hashSecret(password);
      if (inputHash !== parent.passwordHash) {
        setError('Incorrect password. If you need a reset, the school office can issue a new password.');
        return;
      }

      // Link first child as default active child
      const activeChildUpi = parent.pupilUpiList[0] || undefined;

      dataLayer.setSession({
        role: 'parent',
        id: `parent_${parent.phone}`,
        name: parent.name || 'Parent / Guardian',
        identifier: parent.phone,
        activeChildUpi,
      });

      onSuccess();
    } catch {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white">
      <Header
        title="Parents & Guardians"
        subtitle="Family Portal"
        showBack={true}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-sm mx-auto w-full flex flex-col justify-center">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black tracking-wide text-white">
            Parents & Guardians
          </h2>
          <p className="text-xs text-slate-400 text-center mt-1">
            View attendance, approved homework, CBC term reports & teacher messages
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
              Registered Parent Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678 or +254..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              One login connects all your children at Little Roses Academy
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password (6+ characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter Family Portal</span>
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
