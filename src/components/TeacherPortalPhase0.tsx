/**
 * Little Roses Academy - Staff & Teachers Portal (Phase 0 Foundation)
 * 
 * SPECIFICATION RULES:
 * Section 1, 2, 6, 7, 8:
 * - Shared data architecture with Admin, Learner, Parent
 * - Teacher Profile with permanent teacherId & employeeNumber
 * - Assigned Grades & Subjects using the Central Subject Colour System
 * - Phase 0 Clean Empty States (no fake schemes, no fake lesson plans, no fake CATs)
 * - Class Roll for assigned grades from the shared learner repository
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  FileCheck,
  Award,
  Users,
  LogOut,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
import { EmptyState } from './EmptyState.tsx';
import { UserSession, TeacherProfile, LearnerProfile, SubjectConfig } from '../types/phase0.ts';
import { phase0Storage } from '../services/phase0Storage.ts';
import { getSubjectColorClasses } from '../services/subjectColorSystem.ts';

interface TeacherPortalPhase0Props {
  session: UserSession;
  onSignOut: () => void;
}

type TeacherTab = 'timetable' | 'classes' | 'schemes' | 'assessments';

export const TeacherPortalPhase0: React.FC<TeacherPortalPhase0Props> = ({
  session,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('timetable');
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);

  useEffect(() => {
    const t = phase0Storage.getTeachers().find((tch) => tch.userId === session.userId);
    setTeacher(t || null);
    setLearners(phase0Storage.getLearners());
    setSubjects(phase0Storage.getSubjects());
  }, [session.userId]);

  const assignedGrades = teacher?.assignedGrades || [1];
  const teacherLearners = learners.filter((l) => assignedGrades.includes(l.currentGrade));

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Logo size="xs" showTagline={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase font-serif">
                Staff & Teachers Portal
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 uppercase">
                Faculty
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Welcome, <strong className="text-slate-700 dark:text-slate-300">{session.fullName}</strong>
              {teacher?.employeeNumber && ` • Emp #${teacher.employeeNumber}`}
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

      {/* Tabs */}
      <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 shrink-0 text-xs font-bold overflow-x-auto no-scrollbar">
        {[
          { id: 'timetable', label: 'Today & Timetable', icon: Calendar },
          { id: 'classes', label: 'My Class Roll', icon: Users },
          { id: 'schemes', label: 'Schemes & Lesson Plans', icon: BookOpen },
          { id: 'assessments', label: 'Assessments & CATs', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TeacherTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                active
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
        {/* Assigned Grades & Subjects Overview */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Assigned Grades & Subject Allocations
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Teacher ID: {teacher?.id || 'Pending Admin Link'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {assignedGrades.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
              >
                Grade {g} ({g <= 3 ? 'Lower Primary' : 'Upper Primary'})
              </span>
            ))}
          </div>

          {/* Subjects for these grades */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
              Enabled Curriculum Learning Areas (Central Colour System):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {subjects
                .filter((s) => s.isEnabled && s.applicableGrades.some((g) => assignedGrades.includes(g)))
                .map((subj) => {
                  const style = getSubjectColorClasses(subj.stage, subj.colorKey);
                  return (
                    <span
                      key={subj.id}
                      className={style.badge}
                      title={`Color: ${style.colorName}`}
                    >
                      {subj.name}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: TIMETABLE & TODAY */}
        {/* ==================================================== */}
        {activeTab === 'timetable' && (
          <EmptyState
            icon={Calendar}
            title="Timetable Empty"
            description="Timetable entries have not yet been assigned by School Administration for this academic term. In accordance with Phase 0 rules, no fake timetable records exist."
            badge="Phase 0 Zero Demo Data"
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2: MY CLASS ROLL */}
        {/* ==================================================== */}
        {activeTab === 'classes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Class Roll for Assigned Grades
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shared learner records from the primary school repository ({teacherLearners.length} pupils)
                </p>
              </div>
            </div>

            {teacherLearners.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Learners Admitted in Your Grades Yet"
                description="When School Administration admits pupils to your assigned grades, their permanent records will appear here immediately."
              />
            ) : (
              <div className="space-y-2">
                {teacherLearners.map((learner) => (
                  <div
                    key={learner.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {learner.fullName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                          Grade {learner.currentGrade}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        UPI: {learner.upi} • Permanent ID: {learner.id}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Admitted: {learner.dateOfAdmission}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SCHEMES & LESSON PLANS */}
        {/* ==================================================== */}
        {activeTab === 'schemes' && (
          <EmptyState
            icon={BookOpen}
            title="No Schemes or Lesson Plans Created Yet"
            description="Phase 0 mandates that no invented schemes of work, fake lesson plans, or fake lesson notes are populated. Phase 1 will install the teaching resource workflow."
            badge="Phase 0 Foundation"
          />
        )}

        {/* ==================================================== */}
        {/* TAB 4: ASSESSMENTS & CATS */}
        {/* ==================================================== */}
        {activeTab === 'assessments' && (
          <EmptyState
            icon={Award}
            title="No Assessment Records Registered Yet"
            description="Assessment marks, CATs, and rubrics will be entered when teaching commences. In Phase 0, all assessment registers start completely clean with zero fake marks."
            badge="Phase 0 Clean Register"
          />
        )}
      </main>
    </div>
  );
};
