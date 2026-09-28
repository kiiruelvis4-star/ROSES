/**
 * Little Roses Academy, Nakuru, Kenya
 * Official Kenyan CBC Primary School Application
 * 
 * STEP 1:
 * Foundation: Splash 1, Splash 2, portal selection, four login screens with back buttons,
 * first-run admin setup (admin name + admin code, 6+ characters), installable PWA with
 * offline caching, the single data-layer file, the real connection pill, and shared parts
 * (Logo, Header, Bottom Tabs, colour system for classes, subjects and teachers).
 */

import React, { useState, useEffect, useRef } from 'react';
import { Splash1 } from './components/Splash1.tsx';
import { Splash2 } from './components/Splash2.tsx';
import { PortalSelection, PortalType } from './components/PortalSelection.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { TeachersLogin } from './components/TeachersLogin.tsx';
import { ParentsLogin } from './components/ParentsLogin.tsx';
import { LearnersLogin } from './components/LearnersLogin.tsx';
import { Header } from './components/Header.tsx';
import { Logo } from './components/Logo.tsx';
import { BottomTabs, TabItem } from './components/BottomTabs.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { TeachersPortal } from './components/TeachersPortal.tsx';
import { CBC_BAND_COLORS } from './styles/colors.ts';
import { dataLayer, subscribeToDataLayer, CurrentUserSession } from './services/dataLayer.ts';
import { 
  Smartphone, 
  Tablet, 
  Maximize, 
  RotateCcw, 
  Building2, 
  GraduationCap, 
  Users, 
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle,
  Home,
  MessageSquare,
  ShieldCheck,
  FolderOpen,
  Camera,
  Image as ImageIcon,
  Phone,
  Award,
  Star,
  CheckCheck,
  Clock,
  Download,
  ArrowRight,
  AlertCircle,
  FileText,
  ChevronRight,
  Check,
  Heart
} from 'lucide-react';

type ScreenState = 
  | 'splash1'
  | 'splash2'
  | 'portals'
  | 'login_admin'
  | 'login_teachers'
  | 'login_parents'
  | 'login_learners'
  | 'portal_admin'
  | 'portal_teachers'
  | 'portal_parents'
  | 'portal_learners';

type DeviceMode = 'phone' | 'tablet' | 'full';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('splash1');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone');
  const [session, setSession] = useState<CurrentUserSession | null>(dataLayer.getCurrentSession());
  const [replayCount, setReplayCount] = useState(0);

  // Subscribe to session changes
  useEffect(() => {
    return subscribeToDataLayer(() => {
      setSession(dataLayer.getCurrentSession());
    });
  }, []);

  const handleRestartFlow = () => {
    setReplayCount((c) => c + 1);
    setScreen('splash1');
  };

  const handleLogout = () => {
    dataLayer.clearSession();
    setScreen('portals');
  };

  return (
    <div className="min-h-screen w-full bg-[#03060d] text-neutral-100 flex flex-col items-center justify-center relative select-none font-sans overflow-hidden">
      {/* Top Device & Navigation Bar */}
      <nav
        aria-label="Presentation & Viewport Controls"
        className="fixed top-2.5 z-50 flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-2xl"
      >
        {/* Step Shortcuts */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-full border border-slate-800">
          <button
            onClick={handleRestartFlow}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              screen === 'splash1' || screen === 'splash2'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Start from Splash 1"
          >
            Splash
          </button>

          <button
            onClick={() => setScreen('portals')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              screen === 'portals'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portals
          </button>

          <button
            onClick={() => setScreen('login_admin')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              screen === 'login_admin' || screen === 'portal_admin'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="School Administration Portal"
          >
            Admin
          </button>

          <button
            onClick={() => setScreen('login_teachers')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              screen === 'login_teachers' || screen === 'portal_teachers'
                ? 'bg-emerald-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Staff & Teachers Portal"
          >
            Teachers
          </button>

          <button
            onClick={() => setScreen('login_parents')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              screen === 'login_parents' || screen === 'portal_parents'
                ? 'bg-sky-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Parents & Guardians Portal"
          >
            Parents
          </button>

          <button
            onClick={() => setScreen('login_learners')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              screen === 'login_learners' || screen === 'portal_learners'
                ? 'bg-purple-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Learners Portal"
          >
            Learners
          </button>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-4 bg-slate-700 mx-0.5" />

        {/* Viewport Modes */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-full border border-slate-800">
          <button
            onClick={() => setDeviceMode('phone')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              deviceMode === 'phone'
                ? 'bg-slate-100 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone</span>
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              deviceMode === 'tablet'
                ? 'bg-slate-100 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setDeviceMode('full')}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all ${
              deviceMode === 'full'
                ? 'bg-slate-100 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Full Screen Mode"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Replay Button */}
        <button
          onClick={handleRestartFlow}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ml-0.5"
          title="Replay from Splash 1"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </nav>

      {/* Main Viewport Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0">
        <div
          className={`overflow-hidden flex flex-col relative transition-all duration-300 ${
            deviceMode === 'phone'
              ? 'h-[85vh] max-h-[820px] aspect-[9/19.5] max-w-[94vw] bg-[#070D1E] shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-3xl border border-slate-800/60'
              : deviceMode === 'tablet'
              ? 'h-[85vh] max-h-[820px] aspect-[3/4] max-w-[94vw] bg-[#070D1E] shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-2xl border border-slate-800/60'
              : 'w-full h-screen min-h-screen bg-[#070D1E]'
          }`}
        >
          {/* STEP 1 SCREENS */}
          {screen === 'splash1' && (
            <Splash1
              key={`s1_${replayCount}`}
              onComplete={() => setScreen('splash2')}
            />
          )}

          {screen === 'splash2' && (
            <Splash2
              key={`s2_${replayCount}`}
              onComplete={() => setScreen('portals')}
            />
          )}

          {screen === 'portals' && (
            <PortalSelection
              onSelectPortal={(portalType) => {
                if (portalType === 'admin') setScreen('login_admin');
                if (portalType === 'teachers') setScreen('login_teachers');
                if (portalType === 'parents') setScreen('login_parents');
                if (portalType === 'learners') setScreen('login_learners');
              }}
            />
          )}

          {screen === 'login_admin' && (
            <AdminLogin
              onBack={() => setScreen('portals')}
              onSuccess={() => setScreen('portal_admin')}
            />
          )}

          {screen === 'login_teachers' && (
            <TeachersLogin
              onBack={() => setScreen('portals')}
              onSuccess={() => setScreen('portal_teachers')}
            />
          )}

          {screen === 'login_parents' && (
            <ParentsLogin
              onBack={() => setScreen('portals')}
              onSuccess={() => setScreen('portal_parents')}
            />
          )}

          {screen === 'login_learners' && (
            <LearnersLogin
              onBack={() => setScreen('portals')}
              onSuccess={() => setScreen('portal_learners')}
            />
          )}

          {/* ACTIVE PORTAL SCREENS */}
          {screen === 'portal_admin' && (
            <AdminPortal
              mode={deviceMode}
              onBackToPortals={handleLogout}
              onSwitchToTeachers={() => setScreen('portal_teachers')}
            />
          )}

          {screen === 'portal_teachers' && (
            <TeachersPortal
              mode={deviceMode}
              onSwitchToAdmin={() => setScreen('portal_admin')}
              onExit={handleLogout}
            />
          )}

          {screen === 'portal_parents' && (
            <ParentsPortalView onLogout={handleLogout} />
          )}

          {screen === 'portal_learners' && (
            <LearnersPortalView onLogout={handleLogout} />
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * PARENTS & GUARDIANS PORTAL VIEW
 * Full implementation for all 5 tabs: Today, Homework, CBC Reports, Focus Zone, Notices
 */
function ParentsPortalView({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'today' | 'homework' | 'reports' | 'focus' | 'noticeboard'>('today');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const [homeworkFilter, setHomeworkFilter] = useState<'due' | 'submitted' | 'past'>('due');
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [activeChildIndex, setActiveChildIndex] = useState(0);

  const session = dataLayer.getCurrentSession();
  const termInfo = dataLayer.getAcademicTermInfo();

  // Children linked to this parent (at least one or enrolled pupils)
  const allPupils = dataLayer.getPupils();
  const linkedChildren = allPupils.length > 0
    ? allPupils.slice(0, 2)
    : [
        {
          id: 'p1',
          name: 'Faith Wambui Mwangi',
          grade: 'Grade 4',
          upi: 'LRA-2026-0012',
          gender: 'Girl' as const,
          parentName: 'Jane Mwangi',
          parentPhone: '0712345678',
          pinHash: '',
          status: 'Active' as const,
          enrolledAt: ''
        },
        {
          id: 'p2',
          name: 'Kevin Kiptoo Mwangi',
          grade: 'Grade 2',
          upi: 'LRA-2026-0045',
          gender: 'Boy' as const,
          parentName: 'Jane Mwangi',
          parentPhone: '0712345678',
          pinHash: '',
          status: 'Active' as const,
          enrolledAt: ''
        }
      ];

  const currentChild = linkedChildren[activeChildIndex] || linkedChildren[0];

  const tabs: TabItem[] = [
    { id: 'today', label: 'Today', icon: <Home className="w-5 h-5" /> },
    { id: 'homework', label: 'Homework', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'reports', label: 'CBC Reports', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 'focus', label: 'Focus Zone', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'noticeboard', label: 'Notices', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white">
      <Header
        title="Parents & Guardians"
        subtitle={currentChild ? `${currentChild.name} • ${currentChild.grade}` : 'Family Portal'}
        showLogout={true}
        onLogout={onLogout}
      />

      {/* Sibling Switcher Bar if multiple children */}
      {linkedChildren.length > 1 && (
        <div className="px-3 py-1.5 bg-[#091227] border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Child Switcher:</span>
          <div className="flex gap-1">
            {linkedChildren.map((child, idx) => (
              <button
                key={child.id}
                onClick={() => setActiveChildIndex(idx)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeChildIndex === idx
                    ? 'bg-sky-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {child.name.split(' ')[0]} ({child.grade})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        
        {/* =====================================================================
            TAB 1: TODAY
            ===================================================================== */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            {/* Daily Attendance Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 text-lg">
                  ✔
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white">Present in Class</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      ON TIME
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Arrived 07:42 AM • Morning Roll Call Checked</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Today</span>
            </div>

            {/* Today's Lessons & Taught Checkmarks */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Today&apos;s Timetable Schedule</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">{termInfo.term} • Week {termInfo.weekNumber}</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { time: '08:00 - 08:35', subject: 'Mathematics Activities', teacher: 'Tr. Kelvin', status: 'Taught in Class ✔' },
                  { time: '08:35 - 09:10', subject: 'English Language Activities', teacher: 'Mr. Elvis Kiiru', status: 'Taught in Class ✔' },
                  { time: '09:10 - 09:45', subject: 'Environmental Activities', teacher: 'Tr. Kelvin', status: 'In Progress ⏳' },
                  { time: '10:05 - 10:40', subject: 'Shughuli za Kiswahili', teacher: 'Mr. Elvis Kiiru', status: 'Upcoming' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{item.subject}</div>
                      <div className="text-[10px] text-slate-400">{item.time} • {item.teacher}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status.includes('Taught')
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status.includes('Progress')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Result & Star Learner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-lg">
                  ⭐
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">Reading Superstar!</div>
                  <p className="text-[10px] text-slate-300">Scored 95% in CBC Storybook &quot;Hare and the Tortoise&quot;</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400">Awarded</span>
            </div>

            {/* Quick Contacts */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:0702080186"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white"
              >
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>Call Class Teacher</span>
              </a>
              <a
                href="tel:0702080186"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>School Office Desk</span>
              </a>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: HOMEWORK
            ===================================================================== */}
        {activeTab === 'homework' && (
          <div className="space-y-3">
            {/* Filter buttons */}
            <div className="flex gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setHomeworkFilter('due')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  homeworkFilter === 'due' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Due Soon (2)
              </button>
              <button
                onClick={() => setHomeworkFilter('submitted')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  homeworkFilter === 'submitted' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Submitted (3)
              </button>
              <button
                onClick={() => setHomeworkFilter('past')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  homeworkFilter === 'past' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Past Records
              </button>
            </div>

            {/* List of Homework according to filter */}
            <div className="space-y-2">
              {homeworkFilter === 'due' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        Mathematics Activities
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due Tomorrow 08:00 AM
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Addition with Regrouping (Exercise 4)</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Complete Questions 1 to 8 on page 42 of the textbook. Show all working steps neatly.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                      <span>Approved by Tr. Kelvin</span>
                      <span className="text-amber-400 font-semibold">Teacher Approved ✔</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                        English Language
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due Wednesday
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Comprehension: Our Community Helpers</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Read passage on police officers and doctors, then answer 4 short comprehension questions.
                    </p>
                  </div>
                </>
              )}

              {homeworkFilter === 'submitted' && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Environmental Activities
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">Marked: 18 / 20 (90%)</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Clean Water & Soil Conservation</h4>
                  <p className="text-xs text-slate-300">Teacher Remarks: &quot;Excellent diagram and neat handwriting, well done!&quot;</p>
                  <div className="pt-1 text-[10px] text-slate-400">Marked by Tr. Kelvin • EE Badge awarded</div>
                </div>
              )}

              {homeworkFilter === 'past' && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center py-6">
                  <CheckCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-bold">14 Past Homework Records Archived</p>
                  <p className="text-[10px] text-slate-500 mt-1">All Term 1 assignments are preserved permanently.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: CBC REPORTS (CAT 60% + ASSIGNMENT 40% = 100%)
            ===================================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {/* Term selector */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Academic Term:</span>
              <div className="flex gap-1">
                {(['Term 1', 'Term 2', 'Term 3'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTerm(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTerm === t
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Report Card */}
            <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-sm font-black text-white">{currentChild.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">UPI: {currentChild.upi} • {currentChild.grade}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">
                    MEETING EXPECTATIONS
                  </span>
                  <div className="text-[9px] text-slate-400 mt-0.5">Overall CBC Standing</div>
                </div>
              </div>

              {/* Assessment formula rule: CATs (60%) + Assignments (40%) = 100% */}
              <div className="text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Assessment Formula: CAT (60%) + Assignment (40%)</span>
                <span className="text-amber-400 font-semibold">Max: 100%</span>
              </div>

              {/* Subjects Table */}
              <div className="space-y-2">
                {[
                  { subject: 'Mathematical Activities', cat: 54, asg: 36, total: 90, band: 'EE' as const },
                  { subject: 'English Language Activities', cat: 48, asg: 32, total: 80, band: 'EE' as const },
                  { subject: 'Shughuli za Kiswahili', cat: 42, asg: 30, total: 72, band: 'ME' as const },
                  { subject: 'Environmental Activities', cat: 44, asg: 31, total: 75, band: 'ME' as const },
                  { subject: 'CRE Activities', cat: 46, asg: 32, total: 78, band: 'ME' as const },
                  { subject: 'Creative Activities', cat: 50, asg: 35, total: 85, band: 'EE' as const },
                ].map((row, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{row.subject}</div>
                      <div className="text-[10px] text-slate-400">
                        CAT: {row.cat}/60 • Asg: {row.asg}/40
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{row.total}%</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${CBC_BAND_COLORS[row.band].badgeClass}`}>
                        {row.band}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Teacher Remarks & Download Button */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-xs text-slate-300 italic">
                  Class Teacher Remark: &quot;Faith is a dedicated and bright pupil. Keep maintaining high standards in Mathematics and Reading.&quot;
                </p>
                <button
                  type="button"
                  onClick={() => alert('Official CBC Report Card generated with school logo and signed by Principal.')}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official CBC Report Card (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: FOCUS ZONE
            ===================================================================== */}
        {activeTab === 'focus' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>My Focus Zone</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Specific curriculum sub-strands flagged by teacher reflections where {currentChild.name.split(' ')[0]} receives personalized reinforcement.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Mathematics • Long Division
                </span>
                <span className="text-[10px] text-amber-400 font-bold">Improving 📈</span>
              </div>
              <h4 className="text-xs font-bold text-white">Division with Remainders</h4>
              <p className="text-[11px] text-slate-300">
                Teacher Note: &quot;Practice step-by-step subtraction after multiplying quotients. 5 practice sums assigned.&quot;
              </p>
              <div className="pt-1 text-[10px] text-slate-400">Updated: Yesterday • Next review in Week 6 CAT</div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: NOTICEBOARD
            ===================================================================== */}
        {activeTab === 'noticeboard' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Academic Calendar
                </span>
                <span className="text-[10px] text-slate-400">School Office</span>
              </div>
              <h4 className="text-xs font-bold text-white">Mid-Term Assessments & Visiting Day</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Mid-Term CATs commence on Week 7. Parents are invited for learner consultation on Friday, 9:00 AM to 1:00 PM.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Fees & Welfare
                </span>
                <span className="text-[10px] text-slate-400">Bursar Desk</span>
              </div>
              <h4 className="text-xs font-bold text-white">School Feeding Programme & Trips</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hot balanced lunch and afternoon snack continue smoothly. Grade 4 agricultural visit scheduled for Nakuru Farm.
              </p>
            </div>
          </div>
        )}

      </div>

      <BottomTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
        accentColor="#0EA5E9"
      />
    </div>
  );
}

/**
 * LEARNERS PORTAL VIEW
 * Full implementation for all 5 tabs: Today, Timetable, Homework, Storybooks, Me
 */
function LearnersPortalView({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'today' | 'timetable' | 'homework' | 'storybooks' | 'me'>('today');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const [homeworkFilter, setHomeworkFilter] = useState<'todo' | 'done'>('todo');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const session = dataLayer.getCurrentSession();
  const learnerName = session?.name || 'Joy Wambui';
  const learnerUpi = session?.identifier || 'LRA-2026-0012';

  const tabs: TabItem[] = [
    { id: 'today', label: 'Today', icon: <Home className="w-5 h-5" /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-5 h-5" /> },
    { id: 'homework', label: 'Homework', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'storybooks', label: 'Storybooks', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'me', label: 'Me', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white">
      <Header
        title="Learners"
        subtitle={learnerName}
        showLogout={true}
        onLogout={onLogout}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        
        {/* =====================================================================
            TAB 1: TODAY
            ===================================================================== */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            {/* Pupil Welcome Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 to-slate-900 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Welcome to Class!
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Habari, {learnerName.split(' ')[0]}! 🌟
                </h3>
                <p className="text-[10px] text-purple-200 font-mono mt-0.5">UPI: {learnerUpi}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-2xl">
                🎒
              </div>
            </div>

            {/* Today's Subjects Cards */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Today&apos;s Learning Adventures</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🔢</span>
                    <div className="text-xs font-extrabold text-white mt-1">Maths</div>
                    <div className="text-[10px] text-purple-200">Addition & Regrouping</div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 mt-2">Taught ✔</span>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">📖</span>
                    <div className="text-xs font-extrabold text-white mt-1">English</div>
                    <div className="text-[10px] text-teal-200">Reading Story & Words</div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 mt-2">Taught ✔</span>
                </div>

                <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🗣️</span>
                    <div className="text-xs font-extrabold text-white mt-1">Kiswahili</div>
                    <div className="text-[10px] text-orange-200">Kusoma Hadithi</div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 mt-2">Next Period</span>
                </div>

                <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🎨</span>
                    <div className="text-xs font-extrabold text-white mt-1">Creative Arts</div>
                    <div className="text-[10px] text-pink-200">Clay Modelling & Music</div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mt-2">Upcoming</span>
                </div>
              </div>
            </div>

            {/* My Next Step */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">My Next Step:</span>
                <p className="text-xs font-bold text-white mt-0.5">Read Chapter 3 of &quot;The Wise Tortoise&quot;</p>
              </div>
              <span className="text-xl">🎯</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: TIMETABLE
            ===================================================================== */}
        {activeTab === 'timetable' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Daily Schedule • Monday to Friday</span>
              <span className="text-[10px] font-bold text-purple-400">Class Roll: Present</span>
            </div>

            <div className="space-y-1.5">
              {[
                { time: '08:00 - 08:35', sub: 'Mathematical Activities', room: 'Classroom', active: false, done: true },
                { time: '08:35 - 09:10', sub: 'English Language Activities', room: 'Classroom', active: false, done: true },
                { time: '09:10 - 09:45', sub: 'Environmental Activities', room: 'Garden Field', active: true, done: false },
                { time: '09:45 - 10:05', sub: '☕ Tea Break', room: 'Dining Hall', active: false, done: false },
                { time: '10:05 - 10:40', sub: 'Shughuli za Kiswahili', room: 'Classroom', active: false, done: false },
                { time: '10:40 - 11:15', sub: 'CRE Activities', room: 'Classroom', active: false, done: false },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    p.active
                      ? 'bg-purple-950/60 border-purple-400 shadow-md scale-[1.01]'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{p.sub}</div>
                    <div className="text-[10px] text-slate-400">{p.time} • {p.room}</div>
                  </div>
                  {p.done ? (
                    <span className="text-[10px] font-bold text-emerald-400">Taught ✔</span>
                  ) : p.active ? (
                    <span className="text-[10px] font-bold text-purple-300 animate-pulse">Now Happening 🔔</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Scheduled</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: HOMEWORK (INTERACTIVE)
            ===================================================================== */}
        {activeTab === 'homework' && (
          <div className="space-y-3">
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setHomeworkFilter('todo')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  homeworkFilter === 'todo' ? 'bg-purple-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                To Do (1)
              </button>
              <button
                onClick={() => setHomeworkFilter('done')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  homeworkFilter === 'done' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed (4)
              </button>
            </div>

            {homeworkFilter === 'todo' ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    Mathematics • Grade 4
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">1 Question</span>
                </div>

                <h4 className="text-sm font-bold text-white">
                  Quick Quiz: What is 48 divided by 6?
                </h4>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'A. 6', val: 0, correct: false },
                    { label: 'B. 7', val: 1, correct: false },
                    { label: 'C. 8', val: 2, correct: true },
                    { label: 'D. 9', val: 3, correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setQuizAnswer(opt.val)}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        quizAnswer === opt.val
                          ? opt.correct
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-rose-600 border-rose-400 text-white'
                          : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-purple-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {quizAnswer !== null && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                    quizAnswer === 2 ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}>
                    {quizAnswer === 2 ? '🎉 Correct! 48 ÷ 6 = 8. Saved to Phone 💾' : '❌ Try again! 6 x 8 = 48.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center py-6">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white">All previous homework submitted!</h4>
                <p className="text-[10px] text-slate-400 mt-1">4 tasks evaluated by class teachers.</p>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 4: STORYBOOKS
            ===================================================================== */}
        {activeTab === 'storybooks' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/40 to-slate-900 border border-pink-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider">CBC Storybook Zone 📚</h3>
                <p className="text-xs text-slate-200 mt-0.5">Read approved stories and earn star badges!</p>
              </div>
              <span className="text-2xl">⭐</span>
            </div>

            <div className="space-y-2">
              {[
                { title: 'The Clever Hare and Hyena', lang: 'English', pages: '6 pages', stars: '3 Stars ⭐⭐⭐' },
                { title: 'Sungura na Kobe Mwerevu', lang: 'Kiswahili', pages: '8 pages', stars: '2 Stars ⭐⭐' },
                { title: 'The Great Baobab Tree', lang: 'English', pages: '5 pages', stars: 'Completed ✔' },
              ].map((book, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-pink-400 font-bold">{book.lang}</span>
                    <h4 className="text-xs font-extrabold text-white mt-0.5">{book.title}</h4>
                    <p className="text-[10px] text-slate-400">{book.pages} • CBC Level 2 Reader</p>
                  </div>
                  <button
                    onClick={() => alert(`Opening "${book.title}". Offline reader loaded!`)}
                    className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 text-xs font-bold shadow transition cursor-pointer"
                  >
                    Read Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: ME & PROFILE
            ===================================================================== */}
        {activeTab === 'me' && (
          <div className="space-y-3">
            {/* Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-3xl mb-2 shadow">
                👧🏾
              </div>
              <h3 className="text-sm font-black text-white">{learnerName}</h3>
              <p className="text-xs font-mono text-purple-300">UPI: {learnerUpi}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                <span>Grade 4 • Little Roses Academy</span>
              </div>
            </div>

            {/* Badges Collection */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>My CBC Achievement Badges</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
                  <div className="text-xs font-black text-emerald-300">EE</div>
                  <div className="text-[9px] text-slate-300 mt-0.5">Maths</div>
                  <div className="text-[8px] text-emerald-400">Exceeding</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
                  <div className="text-xs font-black text-emerald-300">EE</div>
                  <div className="text-[9px] text-slate-300 mt-0.5">English</div>
                  <div className="text-[8px] text-emerald-400">Exceeding</div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40">
                  <div className="text-xs font-black text-blue-300">ME</div>
                  <div className="text-[9px] text-slate-300 mt-0.5">Kiswahili</div>
                  <div className="text-[8px] text-blue-400">Meeting</div>
                </div>
              </div>
            </div>

            {/* Offline Status */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Saved Offline Work:</span>
              <span className="text-emerald-400 font-bold">All Synced 💾</span>
            </div>
          </div>
        )}

      </div>

      <BottomTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
        accentColor="#A855F7"
      />
    </div>
  );
}
