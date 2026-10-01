/**
 * Little Roses Academy - Admin Portal (Phase 0 Foundation)
 * 
 * SPECIFICATION RULES:
 * Section 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 17, 20:
 * - Permanent IDs for all entities
 * - Academic Year Foundation (2026, 2027... without destroying previous years)
 * - Term Foundation (Term 1, 2, 3 dates empty until configured)
 * - Grade 1-6 Foundation (no Grade 7+, no streams)
 * - Curriculum Architecture (structure vs content)
 * - Central Subject Colour System (Grades 1-3 vs 4-6)
 * - Central Assessment Colour System (EE, ME, AE, BE)
 * - User Directory with permanent learnerId, teacherId, parentId
 * - Full Audit Logging & Operations
 * - Clean Empty States wherever data does not yet exist
 * - ZERO fake/demo data
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Layers,
  Palette,
  Users,
  Award,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Check,
  RotateCcw,
  Shield,
  Activity,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
import { EmptyState } from './EmptyState.tsx';
import {
  UserSession,
  AcademicYear,
  Term,
  GradeLevel,
  SubjectConfig,
  LearnerProfile,
  TeacherProfile,
  ParentProfile,
  AuditLog,
} from '../types/phase0.ts';
import { phase0Storage } from '../services/phase0Storage.ts';
import {
  getSubjectColorClasses,
  getAssessmentBandClasses,
  ASSESSMENT_BAND_COLORS,
} from '../services/subjectColorSystem.ts';

interface AdminPortalPhase0Props {
  session: UserSession;
  onSignOut: () => void;
}

type AdminTab =
  | 'academics'
  | 'subjects'
  | 'curriculum'
  | 'users'
  | 'assessment_bands'
  | 'audit';

export const AdminPortalPhase0: React.FC<AdminPortalPhase0Props> = ({
  session,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('academics');

  // Reactive state
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Dialog forms
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearNum, setNewYearNum] = useState<number>(2026);
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');

  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [termName, setTermName] = useState<'TERM 1' | 'TERM 2' | 'TERM 3'>('TERM 1');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');

  const [showAdmitLearnerModal, setShowAdmitLearnerModal] = useState(false);
  const [learnerName, setLearnerName] = useState('');
  const [learnerGender, setLearnerGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [learnerGrade, setLearnerGrade] = useState<GradeLevel>(1);
  const [learnerPin, setLearnerPin] = useState('');

  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherEmpNo, setTeacherEmpNo] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherGrades, setTeacherGrades] = useState<GradeLevel[]>([1]);

  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [parentLearnerId, setParentLearnerId] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    const y = phase0Storage.getAcademicYears();
    setYears(y);
    if (!selectedYearId && y.length > 0) {
      const active = y.find((item) => item.status === 'active') || y[0];
      setSelectedYearId(active.id);
    }
    setTerms(phase0Storage.getTerms());
    setSubjects(phase0Storage.getSubjects());
    setLearners(phase0Storage.getLearners());
    setTeachers(phase0Storage.getTeachers());
    setParents(phase0Storage.getParents());
    setAuditLogs(phase0Storage.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    return phase0Storage.subscribe(loadData);
  }, [selectedYearId]);

  const notifySuccess = (msg: string) => {
    setFeedback({ type: 'success', message: msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const notifyError = (msg: string) => {
    setFeedback({ type: 'error', message: msg });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Handlers
  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = phase0Storage.createAcademicYear(newYearNum, newYearStart, newYearEnd);
      setSelectedYearId(created.id);
      setShowAddYearModal(false);
      setNewYearStart('');
      setNewYearEnd('');
      notifySuccess(`Academic Year ${newYearNum} successfully configured with permanent ID ${created.id}`);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to create Academic Year.');
    }
  };

  const handleConfigureTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearId) {
      notifyError('Please select or configure an Academic Year first.');
      return;
    }
    try {
      const configured = phase0Storage.configureTerm(
        selectedYearId,
        termName,
        termStart,
        termEnd,
        'upcoming'
      );
      setShowTermModal(false);
      setTermStart('');
      setTermEnd('');
      notifySuccess(`${termName} configured for academic year (Permanent ID: ${configured.id})`);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to configure term.');
    }
  };

  const handleAdmitLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnerName.trim()) {
      notifyError('Please enter learner full name.');
      return;
    }
    if (learnerPin.length < 4) {
      notifyError('Learner PIN must be at least 4 digits.');
      return;
    }

    try {
      const res = await phase0Storage.admitLearner({
        fullName: learnerName.trim(),
        gender: learnerGender,
        grade: learnerGrade,
        pin: learnerPin,
      });

      setShowAdmitLearnerModal(false);
      setLearnerName('');
      setLearnerPin('');
      notifySuccess(`Learner admitted! Permanent ID: ${res.learner.id} • Official UPI: ${res.learner.upi}`);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to admit learner.');
    }
  };

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherPhone.trim()) {
      notifyError('Please provide teacher name and phone number.');
      return;
    }
    if (teacherPassword.length < 6) {
      notifyError('Teacher password must be at least 6 characters.');
      return;
    }

    try {
      const res = await phase0Storage.registerTeacher({
        fullName: teacherName.trim(),
        phone: teacherPhone.trim(),
        employeeNumber: teacherEmpNo.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        passwordPlain: teacherPassword,
        assignedGrades: teacherGrades,
        assignedSubjectIds: [],
      });

      setShowAddTeacherModal(false);
      setTeacherName('');
      setTeacherPhone('');
      setTeacherEmpNo('');
      setTeacherPassword('');
      notifySuccess(`Teacher registered! Permanent ID: ${res.teacher.id}`);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to register teacher.');
    }
  };

  const handleRegisterParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !parentPhone.trim()) {
      notifyError('Please enter parent name and phone number.');
      return;
    }
    if (parentPassword.length < 6) {
      notifyError('Parent password must be at least 6 characters.');
      return;
    }

    try {
      const res = await phase0Storage.registerParent({
        fullName: parentName.trim(),
        phone: parentPhone.trim(),
        passwordPlain: parentPassword,
      });

      if (parentLearnerId) {
        phase0Storage.linkLearnerToParent(parentLearnerId, res.parent.id);
      }

      setShowAddParentModal(false);
      setParentName('');
      setParentPhone('');
      setParentPassword('');
      setParentLearnerId('');
      notifySuccess(`Parent registered! Permanent ID: ${res.parent.id}`);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to register parent.');
    }
  };

  const handleInitializeCurriculumStructure = () => {
    if (!selectedYearId) {
      notifyError('Please configure an Academic Year first.');
      return;
    }
    try {
      const curric = phase0Storage.createCurriculumStructure(selectedYearId);
      notifySuccess(`Curriculum structure container created for Year ${selectedYearId} (Permanent ID: ${curric.id})`);
    } catch (err: any) {
      notifyError(err?.message || 'Failed to initialize curriculum structure.');
    }
  };

  const handleResetPhase0 = () => {
    if (confirm('Are you sure you want to reset all data back to the clean Phase 0 Foundation state?')) {
      phase0Storage.resetToCleanPhase0();
      notifySuccess('Database reset to clean Phase 0 state.');
    }
  };

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Top Navigation */}
      <header className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Logo size="xs" showTagline={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase font-serif">
                Little Roses Academy
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 uppercase">
                Admin Office
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Logged in: <strong className="text-slate-700 dark:text-slate-300">{session.fullName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSelector compact />
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
        {[
          { id: 'academics', label: 'Academic Years & Terms', icon: Calendar },
          { id: 'subjects', label: 'Subject Colour System', icon: Palette },
          { id: 'assessment_bands', label: 'Assessment Colours', icon: Award },
          { id: 'curriculum', label: 'Curriculum Architecture', icon: Layers },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'audit', label: 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`mx-4 mt-2 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in shrink-0 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* ==================================================== */}
        {/* TAB 1: ACADEMIC YEARS & TERMS FOUNDATION */}
        {/* ==================================================== */}
        {activeTab === 'academics' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Academic Year & Term Configuration</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Phase 0 Rule: Years (2026, 2027, etc.) and Terms (1, 2, 3) are configurable. Dates remain empty until set.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddYearModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configure Year</span>
                </button>
                <button
                  onClick={() => setShowTermModal(true)}
                  disabled={years.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configure Term</span>
                </button>
              </div>
            </div>

            {/* Academic Years List */}
            {years.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Academic Years Configured"
                description="In accordance with Phase 0 rules, no hardcoded calendar years exist. Click 'Configure Year' to set up 2026."
                actionText="Configure Academic Year 2026"
                onAction={() => setShowAddYearModal(true)}
              />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {years.map((y) => {
                    const isSelected = y.id === selectedYearId;
                    return (
                      <div
                        key={y.id}
                        onClick={() => setSelectedYearId(y.id)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {y.year}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              y.status === 'active'
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {y.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          ID: {y.id}
                        </p>
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                          {y.startDate && y.endDate ? (
                            <span>{y.startDate} to {y.endDate}</span>
                          ) : (
                            <span className="italic text-slate-400">Dates not yet set</span>
                          )}
                        </div>
                        {y.status !== 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              phase0Storage.updateAcademicYearStatus(y.id, 'active');
                              notifySuccess(`Academic Year ${y.year} set as active.`);
                            }}
                            className="mt-3 w-full py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-bold"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Terms for Selected Year */}
                {selectedYearId && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Terms for Year: {years.find((y) => y.id === selectedYearId)?.year}
                    </h3>

                    {terms.filter((t) => t.academicYearId === selectedYearId).length === 0 ? (
                      <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                        No terms configured yet for this academic year. Click "Configure Term" above to add Term 1, 2, or 3.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {terms
                          .filter((t) => t.academicYearId === selectedYearId)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {t.name}
                                </h4>
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                                  {t.status}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 mb-2">ID: {t.id}</p>
                              <div className="text-xs text-slate-600 dark:text-slate-300">
                                <span className="text-slate-400">Start:</span>{' '}
                                {t.startDate || <span className="italic">Empty</span>}
                                <br />
                                <span className="text-slate-400">End:</span>{' '}
                                {t.endDate || <span className="italic">Empty</span>}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: SUBJECT COLOUR SYSTEM (GRADES 1-3 VS 4-6) */}
        {/* ==================================================== */}
        {activeTab === 'subjects' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                <span>Central Subject Colour Configuration</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                SPECIFICATION Section 7: Subject colours are centrally defined and separate for Grades 1–3 and Grades 4–6.
                Subject colours are <strong>strictly NOT assessment colours</strong>. Admin can toggle enabled curriculum subjects.
              </p>
            </div>

            {/* Lower Primary Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Lower Primary (Grades 1 – 3) Subjects & Colours
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Grades 1, 2, 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subjects
                  .filter((s) => s.stage === 'lower_primary')
                  .map((subj) => {
                    const styling = getSubjectColorClasses(subj.stage, subj.colorKey);
                    return (
                      <div
                        key={subj.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${styling.card}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: styling.primaryHex }}
                          />
                          <div>
                            <span className={`text-xs font-bold ${styling.text}`}>
                              {subj.name}
                            </span>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Code: {subj.code}</span>
                              <span>•</span>
                              <span className="font-semibold uppercase">{styling.colorName}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            phase0Storage.toggleSubjectEnabled(subj.id, !subj.isEnabled);
                            notifySuccess(`Updated ${subj.name} status`);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                            subj.isEnabled
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {subj.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Upper Primary Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Upper Primary (Grades 4 – 6) Subjects & Colours
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Grades 4, 5, 6
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subjects
                  .filter((s) => s.stage === 'upper_primary')
                  .map((subj) => {
                    const styling = getSubjectColorClasses(subj.stage, subj.colorKey);
                    return (
                      <div
                        key={subj.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${styling.card}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: styling.primaryHex }}
                          />
                          <div>
                            <span className={`text-xs font-bold ${styling.text}`}>
                              {subj.name}
                            </span>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Code: {subj.code}</span>
                              <span>•</span>
                              <span className="font-semibold uppercase">{styling.colorName}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            phase0Storage.toggleSubjectEnabled(subj.id, !subj.isEnabled);
                            notifySuccess(`Updated ${subj.name} status`);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                            subj.isEnabled
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {subj.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ASSESSMENT PERFORMANCE COLOUR SYSTEM */}
        {/* ==================================================== */}
        {activeTab === 'assessment_bands' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Assessment Performance Colour System</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                SPECIFICATION Section 8: Completely separate performance colour system.
                These colours <strong>must NEVER depend on subject colour</strong>. For example, Mathematics uses Gold/Yellow as its identity,
                but a learner achieving EE in Mathematics shows GREEN.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['EE', 'ME', 'AE', 'BE'] as const).map((band) => {
                const conf = ASSESSMENT_BAND_COLORS[band];
                const helper = getAssessmentBandClasses(band);
                return (
                  <div
                    key={band}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={helper.badge}>
                        {band}: {conf.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {conf.minPercent}% – {conf.maxPercent}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {conf.description}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: conf.hex }}
                      />
                      <span>Assigned Colour: <strong>{conf.colorName}</strong> ({conf.hex})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: CURRICULUM ARCHITECTURE (STRUCTURE ONLY) */}
        {/* ==================================================== */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Curriculum Foundation Hierarchy</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  SPECIFICATION Section 6: Data architecture for Academic Year → Curriculum Version → Grade → Subject → Strand → Sub-strand → Outcome.
                  Structure only; zero invented curriculum.
                </p>
              </div>

              <button
                onClick={handleInitializeCurriculumStructure}
                disabled={years.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs shrink-0 disabled:opacity-50"
              >
                Initialize Structure Container
              </button>
            </div>

            {phase0Storage.getCurricula().length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Curriculum Container Structure Ready"
                description="Phase 0 mandates distinction between CURRICULUM STRUCTURE and TEACHING CONTENT. Click 'Initialize Structure Container' to scaffold the hierarchical nodes without demo text."
                actionText="Initialize Structure Container"
                onAction={handleInitializeCurriculumStructure}
              />
            ) : (
              <div className="space-y-3">
                {phase0Storage.getCurricula().map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.versionName} ({c.framework})
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">ID: {c.id}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {c.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {c.grades.map((g) => (
                        <div
                          key={g.gradeLevel}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Grade {g.gradeLevel}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {g.subjects.length} subjects configured • 0 fake strands (Phase 0 clean)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: USER DIRECTORY & PERMANENT IDS */}
        {/* ==================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>User Directory & Permanent Identifiers</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  SPECIFICATION Section 2: Permanent stable IDs (learnerId, teacherId, parentId).
                  Learner keeps same learnerId throughout school history. Zero demo accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAdmitLearnerModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admit Learner</span>
                </button>
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Teacher</span>
                </button>
                <button
                  onClick={() => setShowAddParentModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Parent</span>
                </button>
              </div>
            </div>

            {/* Counts & Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Admitted Learners</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {learners.length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Staff Teachers</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {teachers.length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Parents Registered</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {parents.length}
                </div>
              </div>
            </div>

            {/* Learners List */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Learner Records ({learners.length})
              </h3>
              {learners.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No Learners Admitted Yet"
                  description="Learner records are stored with permanent learner IDs. Zero demo pupils exist."
                  actionText="Admit First Learner"
                  onAction={() => setShowAdmitLearnerModal(true)}
                />
              ) : (
                <div className="space-y-2">
                  {learners.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {l.fullName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                            Grade {l.currentGrade}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Permanent ID: <span className="text-slate-700 dark:text-slate-300">{l.id}</span> • UPI: {l.upi}
                        </p>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Admitted: {l.dateOfAdmission}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teachers List */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Staff Teachers ({teachers.length})
              </h3>
              {teachers.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Teachers Registered Yet"
                  description="Staff accounts use permanent teacher IDs and salted password hashing."
                  actionText="Register Teacher"
                  onAction={() => setShowAddTeacherModal(true)}
                />
              ) : (
                <div className="space-y-2">
                  {teachers.map((t) => {
                    const u = phase0Storage.getUsers().find((user) => user.id === t.userId);
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {u?.fullName || 'Teacher'}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                              Emp #{t.employeeNumber}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Teacher ID: {t.id} • Phone: {u?.phone}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Grades: {t.assignedGrades.join(', ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: AUDIT LOGS & SECURITY */}
        {/* ==================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span>Immutable System Audit Logs</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  SPECIFICATION Section 2 & 20: Every action records a permanent auditLogId and timestamp.
                </p>
              </div>

              <button
                onClick={handleResetPhase0}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clean Phase 0 Reset</span>
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Audit Trail Clean"
                description="All subsequent configurations, admissions, and logins will be logged here."
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {log.entityType}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1">
                      Audit ID: {log.id} • Entity ID: {log.entityId}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL: CONFIGURE ACADEMIC YEAR */}
      {/* ==================================================== */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Configure Academic Year
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a school year (2026, 2027, etc.) without destroying previous records.
            </p>

            <form onSubmit={handleCreateYear} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2050"
                  value={newYearNum}
                  onChange={(e) => setNewYearNum(parseInt(e.target.value) || 2026)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={newYearStart}
                  onChange={(e) => setNewYearStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={newYearEnd}
                  onChange={(e) => setNewYearEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs"
                >
                  Save Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CONFIGURE TERM */}
      {/* ==================================================== */}
      {showTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Configure Term Dates
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Phase 0 Rule: Dates remain empty until Admin configures them.
            </p>

            <form onSubmit={handleConfigureTerm} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Term
                </label>
                <select
                  value={termName}
                  onChange={(e) => setTermName(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                >
                  <option value="TERM 1">TERM 1</option>
                  <option value="TERM 2">TERM 2</option>
                  <option value="TERM 3">TERM 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={termStart}
                  onChange={(e) => setTermStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={termEnd}
                  onChange={(e) => setTermEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTermModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs"
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADMIT LEARNER */}
      {/* ==================================================== */}
      {showAdmitLearnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Admit Learner (Phase 0)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Generates a permanent learnerId and official UPI (LRA-YYYY-XXXX).
            </p>

            <form onSubmit={handleAdmitLearner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Learner Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Mwangi"
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={learnerGender}
                    onChange={(e) => setLearnerGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade (1 to 6)
                  </label>
                  <select
                    value={learnerGrade}
                    onChange={(e) => setLearnerGrade(parseInt(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value={1}>Grade 1</option>
                    <option value={2}>Grade 2</option>
                    <option value={3}>Grade 3</option>
                    <option value={4}>Grade 4</option>
                    <option value={5}>Grade 5</option>
                    <option value={6}>Grade 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4-Digit Pupil PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="e.g. 5678"
                  value={learnerPin}
                  onChange={(e) => setLearnerPin(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmitLearnerModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs"
                >
                  Admit Pupil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: REGISTER TEACHER */}
      {/* ==================================================== */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Register Teacher
            </h3>
            <form onSubmit={handleRegisterTeacher} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tr. Grace Njeri"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Password (min 6 chars)
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Grades
                </label>
                <div className="flex gap-1.5">
                  {([1, 2, 3, 4, 5, 6] as GradeLevel[]).map((g) => {
                    const sel = teacherGrades.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => {
                          setTeacherGrades((prev) =>
                            sel ? prev.filter((item) => item !== g) : [...prev, g]
                          );
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          sel
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: REGISTER PARENT */}
      {/* ==================================================== */}
      {showAddParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Register Parent / Guardian
            </h3>
            <form onSubmit={handleRegisterParent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mary Kamau"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Password (min 6 chars)
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              {learners.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link to Admitted Child (Optional)
                  </label>
                  <select
                    value={parentLearnerId}
                    onChange={(e) => setParentLearnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value="">-- No child linked yet --</option>
                    {learners.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.fullName} (Grade {l.currentGrade} • {l.upi})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddParentModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
