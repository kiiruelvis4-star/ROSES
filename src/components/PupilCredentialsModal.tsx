/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, ShieldCheck, KeyRound, User, Phone, Image as ImageIcon } from 'lucide-react';
import { PupilRecord } from '../services/schoolDataService.ts';

export interface PupilCredentialsModalProps {
  pupil: PupilRecord;
  onClose: () => void;
  onSave: (updated: PupilRecord) => void;
  showToast: (msg: string) => void;
}

const ALL_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

const PRESET_PUPIL_AVATARS = [
  { label: 'Boy 1', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80' },
  { label: 'Girl 1', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
  { label: 'Boy 2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
  { label: 'Girl 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { label: 'Boy 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
];

export function PupilCredentialsModal({
  pupil,
  onClose,
  onSave,
  showToast
}: PupilCredentialsModalProps) {
  const [name, setName] = useState(pupil.name);
  const [grade, setGrade] = useState(pupil.grade);
  const [gender, setGender] = useState<'Boy' | 'Girl'>(pupil.gender);
  const [pin, setPin] = useState(pupil.pin || '123');
  const [showPin, setShowPin] = useState(false);
  const [parentName, setParentName] = useState(pupil.parentName || '');
  const [parentPhone, setParentPhone] = useState(pupil.parentPhone || '');
  const [parentPassword, setParentPassword] = useState(pupil.parentPassword || '4455');
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(pupil.avatarUrl || PRESET_PUPIL_AVATARS[0].url);
  const [standing, setStanding] = useState<'On Track' | 'Needs Support' | 'Excelling'>(
    pupil.academicStanding || 'On Track'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Learner name cannot be blank');
      return;
    }
    if (!pin.trim()) {
      showToast('Learner PIN / password cannot be blank');
      return;
    }

    const updated: PupilRecord = {
      ...pupil,
      name: name.trim(),
      grade,
      gender,
      pin: pin.trim(),
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentPassword: parentPassword.trim(),
      avatarUrl: avatarUrl.trim(),
      academicStanding: standing,
      statusRingColor: gender === 'Boy' ? '#10B981' : '#F59E0B'
    };

    onSave(updated);
    showToast(`Updated credentials and password for ${updated.name}! 💾`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0B152E] border-2 border-emerald-500 rounded-3xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4 my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔑</span>
            <div>
              <h3 className="font-bold text-base text-white">Edit Learner Profile & Passwords</h3>
              <p className="text-[10px] text-emerald-400 font-mono">UPI: {pupil.upi}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Full Learner Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Class / Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Boy' | 'Girl')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Academic Standing
              </label>
              <select
                value={standing}
                onChange={(e) => setStanding(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="On Track">On Track</option>
                <option value="Needs Support">Needs Support</option>
                <option value="Excelling">Excelling</option>
              </select>
            </div>
          </div>

          {/* Passwords Section */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Learner & Parent Access Passwords</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Learner PIN / Password
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    placeholder="e.g. 123"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[9px] text-slate-400">Used by child to log into quizzes</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Parent Password
                </label>
                <div className="relative">
                  <input
                    type={showParentPassword ? 'text' : 'password'}
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    required
                    placeholder="e.g. 4455"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowParentPassword(!showParentPassword)}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showParentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[9px] text-slate-400">Parent app access code</span>
              </div>
            </div>
          </div>

          {/* Parent Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Parent Full Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Parent Phone Number
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* DP / Passport Photo */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Passport Photo / DP
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt="Learner DP"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 flex-shrink-0"
              />
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste avatar URL or pick below..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
                <div className="flex gap-1.5">
                  {PRESET_PUPIL_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === av.url ? 'border-emerald-400 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Passwords 💾</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
