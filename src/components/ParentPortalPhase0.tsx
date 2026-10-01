/**
 * Little Roses Academy - Parents & Guardians Portal (Phase 0 Foundation)
 * 
 * SPECIFICATION RULES:
 * Section 1, 2, 8, 9, 10, 16:
 * - Shared data architecture: uses the same permanent learnerId
 * - Multi-child switcher for linked siblings
 * - Clean Empty States (no fake attendance, no fake marks, no fake notifications)
 * - Zero demo data
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  Award,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
import { EmptyState } from './EmptyState.tsx';
import { UserSession, ParentProfile, LearnerProfile } from '../types/phase0.ts';
import { phase0Storage } from '../services/phase0Storage.ts';

interface ParentPortalPhase0Props {
  session: UserSession;
  onSignOut: () => void;
}

type ParentTab = 'today' | 'homework' | 'reports' | 'notices';

export const ParentPortalPhase0: React.FC<ParentPortalPhase0Props> = ({
  session,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<ParentTab>('today');
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<LearnerProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  useEffect(() => {
    const p = phase0Storage.getParents().find((item) => item.userId === session.userId);
    setParent(p || null);
    if (p) {
      const linked = phase0Storage.getLearnersForParent(p.id);
      setChildren(linked);
      if (linked.length > 0 && !selectedChildId) {
        setSelectedChildId(linked[0].id);
      }
    } else {
      // Also check if any learner has phone matching parent
      const allLearners = phase0Storage.getLearners();
      setChildren(allLearners);
      if (allLearners.length > 0 && !selectedChildId) {
        setSelectedChildId(allLearners[0].id);
      }
    }
  }, [session.userId, selectedChildId]);

  const activeChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Logo size="xs" showTagline={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase font-serif">
                Parents & Guardians
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 uppercase">
                Family Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Parent: <strong className="text-slate-700 dark:text-slate-300">{session.fullName}</strong>
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

      {/* Sibling Child Switcher */}
      {children.length > 0 && (
        <div className="px-4 py-2.5 bg-amber-500/10 dark:bg-amber-400/5 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
              Active Learner:
            </span>
            <div className="relative">
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-xl px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 pr-7"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} (Grade {c.currentGrade} • {c.upi})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            Permanent ID: {activeChild?.id}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 shrink-0 text-xs font-bold overflow-x-auto no-scrollbar">
        {[
          { id: 'today', label: 'Today in Class', icon: Calendar },
          { id: 'homework', label: 'Homework & Assignments', icon: BookOpen },
          { id: 'reports', label: 'CBC Term Reports', icon: Award },
          { id: 'notices', label: 'School Notices', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ParentTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                active
                  ? 'bg-amber-600 text-white shadow-xs'
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
        {children.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Child Linked to Account Yet"
            description="School Administration links admitted learners using the registered parent phone number. Once linked, you will see your children's real records here."
            badge="Phase 0 Zero Demo Data"
          />
        ) : (
          <>
            {/* TAB 1: TODAY */}
            {activeTab === 'today' && (
              <EmptyState
                icon={Calendar}
                title="No Attendance or Timetable Logged Today"
                description={`No classroom lessons or roll attendance have been entered yet for ${activeChild?.fullName || 'your child'}. In accordance with Phase 0 rules, no fake dates or demo lessons are displayed.`}
                badge="Phase 0 Clean State"
              />
            )}

            {/* TAB 2: HOMEWORK */}
            {activeTab === 'homework' && (
              <EmptyState
                icon={BookOpen}
                title="No Homework Due"
                description="When the class teacher approves daily homework, it will appear here with instructions and due dates."
                badge="Phase 0 Clean State"
              />
            )}

            {/* TAB 3: REPORTS */}
            {activeTab === 'reports' && (
              <EmptyState
                icon={Award}
                title="No Term CBC Reports Generated"
                description="Term assessment reports are generated at the end of each term using the official EE, ME, AE, BE assessment band colours."
                badge="Phase 0 Clean State"
              />
            )}

            {/* TAB 4: NOTICES */}
            {activeTab === 'notices' && (
              <EmptyState
                icon={Bell}
                title="No School Announcements"
                description="Official broadcasts, term calendar announcements, and school events from Administration will be displayed here."
                badge="Phase 0 Clean State"
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
