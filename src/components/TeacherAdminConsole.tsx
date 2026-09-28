/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Save,
  Check,
  Edit3,
  BookOpen,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { TeacherRecord, PupilRecord } from '../services/schoolDataService.ts';

export interface TeacherAdminConsoleProps {
  teacher: TeacherRecord;
  allPupils: PupilRecord[];
  allTimetableSlots: any[];
  onClose: () => void;
  onSaveTeacher: (updated: TeacherRecord) => void;
  onPushToTeacherPortal: (teacher: TeacherRecord, payload: any) => void;
  showToast: (msg: string) => void;
}

const ALL_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

const LOWER_SUBJECTS = [
  'Social Studies',
  'Social Studies Activities',
  'Mathematics Activities',
  'English Activities',
  'Kiswahili Activities',
  'Environmental Activities',
  'Creative Activities',
  'Religious Education Activities',
  'Indigenous Language Activities',
  'Movement & Physical Activities'
];

const UPPER_SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Science and Technology',
  'Social Studies',
  'Agriculture & Nutrition',
  'Creative Arts & Sports',
  'Religious Education'
];

const PRESET_AVATARS = [
  { label: 'Male Portrait 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80' },
  { label: 'Male Portrait 2', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80' },
  { label: 'Female Portrait 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80' },
  { label: 'Female Portrait 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
  { label: 'Male Portrait 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' }
];

export function TeacherAdminConsole({
  teacher,
  allPupils,
  allTimetableSlots,
  onClose,
  onSaveTeacher,
  onPushToTeacherPortal,
  showToast
}: TeacherAdminConsoleProps) {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'profile' | 'learners'>('profile');

  // Teacher Profile & Credentials
  const [name, setName] = useState(teacher.name);
  const [phone, setPhone] = useState(teacher.phone);
  const [password, setPassword] = useState(teacher.password || 'Roses@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(teacher.avatarUrl || PRESET_AVATARS[0].url);
  const [isDualAdmin, setIsDualAdmin] = useState(Boolean(teacher.isDualAdmin));
  const [assignedGrades, setAssignedGrades] = useState<string[]>(
    teacher.assignedGrades && teacher.assignedGrades.length > 0
      ? teacher.assignedGrades
      : ['Grade 4']
  );

  // Grade-by-Grade Subject Allocations (Grade 1 -> Grade 6)
  const [gradeSubjects, setGradeSubjects] = useState<Record<string, string[]>>(() => {
    if (teacher.gradeSubjects && Object.keys(teacher.gradeSubjects).length > 0) {
      return teacher.gradeSubjects;
    }
    const initial: Record<string, string[]> = {};
    ALL_GRADES.forEach((g) => {
      initial[g] = teacher.subjects || [];
    });
    return initial;
  });

  // Selected Grade for Learners view
  const [selectedSubGrade, setSelectedSubGrade] = useState<string>(
    assignedGrades[0] || 'Grade 4'
  );

  // 2. Learners in selected grade
  const gradePupils = allPupils.filter((p) => p.grade === selectedSubGrade);

  // Teacher performance mark records from localStorage
  const [marksCache] = useState<Record<string, { assignment: number; cat: number; remark: string }>>(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_marks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleGrade = (g: string) => {
    setAssignedGrades((prev) => {
      if (prev.includes(g)) {
        if (prev.length === 1) {
          showToast('Teacher must be assigned to at least 1 grade');
          return prev;
        }
        return prev.filter((item) => item !== g);
      } else {
        return [...prev, g].sort();
      }
    });
  };

  const handleToggleSubjectForGrade = (grade: string, subject: string) => {
    setGradeSubjects((prev) => {
      const current = prev[grade] || [];
      const updated = current.includes(subject)
        ? current.filter((s) => s !== subject)
        : [...current, subject];
      return { ...prev, [grade]: updated };
    });
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast('Teacher name cannot be blank');
      return;
    }

    // Collect all unique subjects across grades
    const allUniqueSubjects = Array.from(
      new Set(Object.values(gradeSubjects).flat())
    );

    const updated: TeacherRecord = {
      ...teacher,
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim(),
      assignedGrades,
      assignedGrade: assignedGrades.join(', '),
      subjects: allUniqueSubjects.length > 0 ? allUniqueSubjects : teacher.subjects,
      gradeSubjects,
      avatarUrl,
      isDualAdmin
    };

    onSaveTeacher(updated);
    showToast(`Updated profile and grade subject allocations for ${updated.name}! 💾`);
  };

  // AI Timetable Scoping Engine
  const handleScopeTimetable = () => {
    // Scopes master timetable slots matching this teacher's assigned grades and subjects
    const teacherGradeSet = new Set(assignedGrades);
    const matchingSlots = allTimetableSlots.filter((slot) => {
      if (!teacherGradeSet.has(slot.grade)) return false;
      const subjectsForGrade = gradeSubjects[slot.grade] || teacher.subjects;
      return subjectsForGrade.includes(slot.subject);
    });

    // Check collisions (small school multi-grade reality)
    const timeSlotsSeen = new Map<string, any[]>();
    matchingSlots.forEach((slot) => {
      const key = `${slot.day}-${slot.time}`;
      if (!timeSlotsSeen.has(key)) timeSlotsSeen.set(key, []);
      timeSlotsSeen.get(key)!.push(slot);
    });

    let collisionCount = 0;
    timeSlotsSeen.forEach((slots) => {
      if (slots.length > 1) {
        collisionCount += slots.length - 1;
        slots.forEach((s) => {
          s.isMultiClass = true;
          s.collisionNote = `Multi-Grade Combined Lesson (${slots.map((x) => x.grade).join(' & ')})`;
        });
      }
    });

    onPushToTeacherPortal(teacher, {
      type: 'timetable_scoped',
      slots: matchingSlots
    });

    showToast(
      `Scoped ${matchingSlots.length} timetable periods for ${name}! ${
        collisionCount > 0 ? `(${collisionCount} multi-grade combined periods managed)` : ''
      } 🗓️`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0B152E] border-2 border-amber-400 rounded-3xl w-full max-w-4xl p-4 sm:p-6 text-white shadow-2xl space-y-4 my-4 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow"
              />
              {isDualAdmin && (
                <span
                  title="Dual Admin Privilege Enabled"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black"
                >
                  👑
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">{name}</h3>
                {isDualAdmin && (
                  <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    Dual Admin Privileged
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Phone: <strong className="text-amber-300">{phone}</strong> • Assigned: {assignedGrades.join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Main Console Navigation Tabs (Schemes/Lesson plans are teacher's own work) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 flex-shrink-0">
          <button
            onClick={() => setActiveConsoleTab('profile')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeConsoleTab === 'profile'
                ? 'bg-amber-400 text-neutral-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Profile & Grade Subjects</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('learners')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeConsoleTab === 'learners'
                ? 'bg-emerald-600 text-white font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learners & Performance</span>
          </button>
        </div>

        {/* TAB BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* ===================================================================
              TAB 1: PROFILE, CREDENTIALS & GRADE-BY-GRADE SUBJECTS
              =================================================================== */}
          {activeConsoleTab === 'profile' && (
            <div className="space-y-4">
              {/* Credentials Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider">
                  Teacher Identity & Login Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Phone Number (Sign-in Key)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Portal Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Passport Photo / DP & Dual Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Passport Photo / DP
                    </label>
                    <div className="flex gap-2">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(av.url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                            avatarUrl === av.url ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-400/40 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-amber-300 text-xs block">
                        👑 Dual Admin Privilege
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Allows teacher to switch between Teacher and Administration Office.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isDualAdmin}
                      onChange={(e) => setIsDualAdmin(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-emerald-300 uppercase tracking-wider">
                    Assigned Teaching Classes
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Tick all grades this teacher is active in
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ALL_GRADES.map((g) => {
                    const isChecked = assignedGrades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleToggleGrade(g)}
                        className={`p-2 rounded-xl text-center font-bold border transition-all ${
                          isChecked
                            ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grade-by-Grade Subject Matrix (Grade 1 -> Grade 6) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-blue-300 uppercase tracking-wider">
                      Grade-by-Grade Subject Allocation Matrix
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Specify which subjects {name} teaches in each specific grade (Grade 1 to 6)
                    </p>
                  </div>
                  <button
                    onClick={handleScopeTimetable}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer active:scale-95"
                    title="AI scopes the master timetable to generate this teacher's timetable"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Auto-Scope Timetable</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {assignedGrades.map((grade) => {
                    const isLower = ['Grade 1', 'Grade 2', 'Grade 3'].includes(grade);
                    const availableSubjects = isLower ? LOWER_SUBJECTS : UPPER_SUBJECTS;
                    const allocated = gradeSubjects[grade] || [];

                    return (
                      <div key={grade} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-amber-300">
                            {grade} {isLower ? '(Lower Primary Activities)' : '(Upper Primary Learning Areas)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {allocated.length} subjects allocated
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {availableSubjects.map((subject) => {
                            const isAllocated = allocated.includes(subject);
                            return (
                              <button
                                key={subject}
                                type="button"
                                onClick={() => handleToggleSubjectForGrade(grade, subject)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                  isAllocated
                                    ? 'bg-blue-600/30 border-blue-400 text-blue-200 shadow-sm'
                                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isAllocated ? '✓ ' : '+ '}
                                {subject}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Save Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Teacher Credentials & Subjects 💾</span>
                </button>
                <button
                  type="button"
                  onClick={handleScopeTimetable}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Scope Timetable 🗓️</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 2: LEARNERS & PERFORMANCE (PER GRADE FOR THIS TEACHER)
              =================================================================== */}
          {activeConsoleTab === 'learners' && (
            <div className="space-y-3">
              {/* Grade Selector Strip */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-xs text-slate-400 uppercase mr-1">View Grade:</span>
                {assignedGrades.map((g) => {
                  const count = allPupils.filter((p) => p.grade === g).length;
                  return (
                    <button
                      key={g}
                      onClick={() => setSelectedSubGrade(g)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        selectedSubGrade === g
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{g}</span>
                      <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono">
                        {count} pupils
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Learners Roster & Marks Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedSubGrade} Learners Enrolled Under {name}</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {gradePupils.length} Total Pupils
                  </span>
                </div>

                {gradePupils.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No pupils currently enrolled in {selectedSubGrade}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                      <thead>
                        <tr className="bg-slate-900 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                          <th className="p-2.5">Learner UPI & Name</th>
                          <th className="p-2.5">Parent Contact</th>
                          <th className="p-2.5 text-center w-24">Assign /10</th>
                          <th className="p-2.5 text-center w-24">CAT /20</th>
                          <th className="p-2.5 text-center w-24 text-amber-300">Total /30</th>
                          <th className="p-2.5 text-center w-20">CBC Band</th>
                          <th className="p-2.5">Teacher Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {gradePupils.map((pupil) => {
                          const mark = marksCache[pupil.upi];
                          const hasAssign = mark && mark.assignment !== undefined && !isNaN(Number(mark.assignment));
                          const hasCat = mark && mark.cat !== undefined && !isNaN(Number(mark.cat));
                          const hasAnyScore = hasAssign || hasCat;
                          const total = hasAnyScore ? Math.min(30, (Number(mark?.assignment) || 0) + (Number(mark?.cat) || 0)) : 0;
                          const band = hasAnyScore ? (total >= 24 ? 'EE' : total >= 18 ? 'ME' : total >= 12 ? 'AE' : 'BE') : null;

                          return (
                            <tr key={pupil.id} className="hover:bg-slate-900/50">
                              <td className="p-2.5">
                                <div className="font-bold text-white">{pupil.name}</div>
                                <div className="text-[10px] font-mono text-amber-400">{pupil.upi}</div>
                              </td>
                              <td className="p-2.5 text-slate-300">
                                <div>{pupil.parentName}</div>
                                <div className="text-[10px] font-mono text-slate-400">{pupil.parentPhone}</div>
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-slate-200">
                                {hasAssign ? mark.assignment : '—'}
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-slate-200">
                                {hasCat ? mark.cat : '—'}
                              </td>
                              <td className="p-2.5 text-center font-mono font-black text-amber-300">
                                {hasAnyScore ? total : '—'}
                              </td>
                              <td className="p-2.5 text-center">
                                {band ? (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                                      band === 'EE'
                                        ? 'bg-emerald-600'
                                        : band === 'ME'
                                        ? 'bg-blue-600'
                                        : band === 'AE'
                                        ? 'bg-amber-600'
                                        : 'bg-red-600'
                                    }`}
                                  >
                                    {band}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Pending</span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-400 italic">
                                {mark?.remark || 'No remark logged yet'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
