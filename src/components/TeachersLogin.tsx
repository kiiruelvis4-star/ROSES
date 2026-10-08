import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { ArrowLeft, Phone, Lock, Users, AlertCircle } from 'lucide-react';
import { dataLayer } from '../services/dataLayer.ts';
import { setRememberedTeacherSession } from '../services/schoolDataService.ts';

interface TeachersLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function TeachersLogin({ onBack, onSuccess }: TeachersLoginProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('Please enter your registered staff phone number and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const teacher = await dataLayer.verifyTeacherLogin(phone, password);
      if (teacher) {
        dataLayer.setSession({
          role: 'teacher',
          id: teacher.id,
          name: teacher.name,
          identifier: teacher.phone,
          photoUrl: teacher.photoUrl,
        });
        setRememberedTeacherSession({
          id: teacher.id,
          name: teacher.name,
          phone: teacher.phone,
          subjects: teacher.subjects,
          assignedGrades: teacher.assignedGrades,
          tier: teacher.tier,
          isClassTeacher: teacher.isClassTeacher,
          classTeacherGrade: teacher.classTeacherGrade,
          isAdminDualRole: teacher.isAdminDualRole,
          photoUrl: teacher.photoUrl,
          avatarUrl: teacher.photoUrl,
        });
        onSuccess();
      } else {
        setError('Incorrect phone number or password. Please verify and try again.');
      }
    } catch {
      setError('Authentication error occurred.');
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
          Staff Room
        </span>
      </div>

      <div className="max-w-sm w-full mx-auto my-auto flex flex-col items-center space-y-6">
        <Logo size="lg" showTagline={true} />

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">
            STAFF & TEACHERS DESK
          </h2>
          <p className="text-xs text-slate-400">
            Enter your mobile phone number and password to access your teaching workbench.
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
              Teacher Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0702 080 186 or 0722..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Staff Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. 123456)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In as Teacher'}</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center font-mono">
          Sample Teachers: 0702080186 (Mr. Elvis) • 0722123456 (Tr. Mary) • Pass: 123456
        </p>
      </div>
    </div>
  );
}
