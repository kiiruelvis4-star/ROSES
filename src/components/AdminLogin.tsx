/**
 * Little Roses Academy - School Administration Login & First-Run Setup
 * 
 * STEP 1: "first-run admin setup (admin name + admin code, 6+ characters)"
 * SPEC RULE 8: "admin by admin code... passwords and PINs are stored hashed, never displayed"
 */

import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { Header } from './Header.tsx';
import { dataLayer } from '../services/dataLayer.ts';
import { Shield, KeyRound, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onSuccess }) => {
  const isFirstRun = dataLayer.isFirstRun();

  // First-run state
  const [adminName, setAdminName] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  // Standard login state
  const [adminCode, setAdminCode] = useState('');

  // General state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFirstRunSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminName.trim()) {
      setError('Please enter administrator / office name');
      return;
    }

    if (setupCode.length < 6) {
      setError('Admin security code must be at least 6 characters');
      return;
    }

    if (setupCode !== confirmCode) {
      setError('Admin codes do not match');
      return;
    }

    try {
      setLoading(true);
      await dataLayer.setupInitialAdmin(adminName, setupCode);
      dataLayer.setSession({
        role: 'admin',
        id: 'admin_root',
        name: adminName.trim(),
        identifier: 'ADMIN',
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to configure administration');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminCode.trim()) {
      setError('Please enter your admin security code');
      return;
    }

    try {
      setLoading(true);
      const isValid = await dataLayer.verifyAdminCode(adminCode);
      if (isValid) {
        const config = dataLayer.getAdminConfig();
        dataLayer.setSession({
          role: 'admin',
          id: 'admin_root',
          name: config?.adminName || 'School Administration',
          identifier: 'ADMIN',
        });
        onSuccess();
      } else {
        setError('Invalid admin security code. Please check and try again.');
      }
    } catch {
      setError('Error verifying credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white">
      <Header
        title="School Administration"
        subtitle="School Office"
        showBack={true}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-sm mx-auto w-full flex flex-col justify-center">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black tracking-wide text-white">
            {isFirstRun ? 'First-Run School Setup' : 'Admin Security Access'}
          </h2>
          <p className="text-xs text-slate-400 text-center mt-1">
            {isFirstRun
              ? 'Configure your school office administrator name and security code'
              : 'Enter your administrative security code to access the school office'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isFirstRun ? (
          /* FIRST RUN SETUP FORM */
          <form onSubmit={handleFirstRunSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Office / Administrator Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Principal's Office"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Security Code (6+ characters)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Stored hashed per SPEC security rules.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Security Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Setting up...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Initialize School Admin</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* STANDARD ADMIN LOGIN FORM */
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Security Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin code"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? <span>Verifying...</span> : <span>Enter School Administration</span>}
            </button>
          </form>
        )}

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
