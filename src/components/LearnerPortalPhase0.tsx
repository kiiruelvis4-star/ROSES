/**
 * Little Roses Academy - Learners Portal (Phase 0 Foundation)
 * 
 * SPECIFICATION RULES:
 * Section 1, 2, 7, 8, 10, 16:
 * - Permanent learnerId and UPI
 * - Grade 1-6 foundation
 * - Grade-appropriate CBC Subject Colour System
 * - Clean Empty States (no fake lessons, no fake homework, no fake focus zone items)
 * - Zero demo data
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Sparkles,
  Award,
  LogOut,
  Target,
  Smile,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
import { EmptyState } from './EmptyState.tsx';
import { UserSession, LearnerProfile, SubjectConfig } from '../types/phase0.ts';
import { phase0Storage } from '../services/phase0Storage.ts';
import { getSubjectColorClasses } from '../services/subjectColorSystem.ts';

interface LearnerPortalPhase0Props {
  session: UserSession;
  onSignOut: () => void;
}

type LearnerTab = 'today' | 'subjects' | 'homework' | 'focus';

export const LearnerPortalPhase0: React.FC<LearnerPortalPhase0Props> = ({
  session,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<LearnerTab>('today');
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);

  useEffect(() => {
    const l = phase0Storage.getLearners().find((item) => item.userId === session.userId);
    setLearner(l || null);
    if (l) {
      setSubjects(phase0Storage.getSubjectsForGrade(l.currentGrade));
    } else {
      setSubjects(phase0Storage.getSubjectsForGrade(1));
    }
  }, [session.userId]);

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Logo size="xs" showTagline={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase font-serif">
                Learners Portal
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 uppercase">
                Grade {learner?.currentGrade || 1}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pupil: <strong className="text-slate-700 dark:text-slate-300">{session.fullName}</strong>
              {learner?.upi && ` • UPI: ${learner.upi}`}
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
          { id: 'today', label: 'Today in Class', icon: Calendar },
          { id: 'subjects', label: 'My Learning Areas', icon: BookOpen },
          { id: 'homework', label: 'Homework To-Do', icon: Sparkles },
          { id: 'focus', label: 'My Focus Zone', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LearnerTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                active
                  ? 'bg-purple-600 text-white shadow-xs'
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
        {/* Permanent ID Banner */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Official Learner Profile
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Permanent ID: {learner?.id || 'Pending Link'} • School: Little Roses Academy
            </p>
          </div>
          <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
            <Smile className="w-4 h-4" />
            <span>MUCH FROM LITTLE</span>
          </span>
        </div>

        {/* TAB 1: TODAY */}
        {activeTab === 'today' && (
          <EmptyState
            icon={Calendar}
            title="No Lessons Scheduled for Today"
            description="Your timetable will show your daily lessons once the school term begins and timetable is published."
            badge="Phase 0 Clean State"
          />
        )}

        {/* TAB 2: MY LEARNING AREAS */}
        {activeTab === 'subjects' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CBC Learning Areas for Grade {learner?.currentGrade || 1}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subjects.map((s) => {
                const styling = getSubjectColorClasses(s.stage, s.colorKey);
                return (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${styling.card}`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                      style={{ backgroundColor: styling.primaryHex }}
                    />
                    <div>
                      <h4 className={`text-xs font-bold ${styling.text}`}>
                        {s.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Subject Code: {s.code} • Identity: {styling.colorName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: HOMEWORK */}
        {activeTab === 'homework' && (
          <EmptyState
            icon={Sparkles}
            title="No Homework Due Right Now"
            description="Enjoy your day! Daily assignments approved by your teachers will appear here."
            badge="Phase 0 Clean State"
          />
        )}

        {/* TAB 4: FOCUS ZONE */}
        {activeTab === 'focus' && (
          <EmptyState
            icon={Target}
            title="Focus Zone is Clear"
            description="Phase 0 Rule: The Focus Zone helps you practice topics you want to improve. No topics need attention right now."
            badge="Phase 0 Clean State"
          />
        )}
      </main>
    </div>
  );
};
