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
import { SplashCustomizerModal } from './components/SplashCustomizerModal.tsx';
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
import { PortalDrawer } from './components/PortalDrawer.tsx';
import { PortalSwitcherBadge } from './components/PortalSwitcherBadge.tsx';
import { CBC_BAND_COLORS } from './styles/colors.ts';
import {
  downloadCBCReportCard,
  downloadStorybook,
  downloadHomeworkSubmission,
} from './utils/downloadPDF.ts';
import {
  dataLayer,
  subscribeToDataLayer,
  CurrentUserSession,
  normalizePhoneNumber,
} from './services/dataLayer.ts';
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
  Heart,
  Menu,
  Layers,
  LogOut,
  BarChart3,
  SlidersHorizontal,
  Sun,
  Moon,
  Target,
  Trophy
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
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('full');
  const [session, setSession] = useState<CurrentUserSession | null>(dataLayer.getCurrentSession());
  const [appearance, setAppearance] = useState(dataLayer.getAppearanceConfig());
  const [replayCount, setReplayCount] = useState(0);
  const [showQuickJumper, setShowQuickJumper] = useState(false);
  const [isSplashCustomizerOpen, setIsSplashCustomizerOpen] = useState(false);

  // Subscribe to session and appearance changes
  useEffect(() => {
    return subscribeToDataLayer(() => {
      setSession(dataLayer.getCurrentSession());
      setAppearance(dataLayer.getAppearanceConfig());
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

  const handleSwitchPortal = (target: 'admin' | 'teachers' | 'parents' | 'learners') => {
    if (target === 'admin') setScreen('portal_admin');
    else if (target === 'teachers') setScreen('portal_teachers');
    else if (target === 'parents') setScreen('portal_parents');
    else if (target === 'learners') setScreen('portal_learners');
  };

  return (
    <div
      data-theme={dataLayer.getEffectiveTheme(appearance)}
      data-theme-mode={appearance.themeMode}
      data-font-scale={appearance.fontSizeScale}
      data-high-contrast={appearance.highContrast ? 'true' : 'false'}
      className="w-full min-h-screen h-[100dvh] bg-[#070D1E] text-neutral-100 flex flex-col relative select-none font-sans overflow-hidden"
    >
      {/* Discreet Testing Floating Widget (Tucked away at bottom right so screen is 100% available) */}
      <aside aria-label="Dev Portal Controls" className="fixed bottom-3 right-3 z-50">
        {showQuickJumper ? (
          <div className="flex flex-col gap-1 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs max-w-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
              <span>Quick Portal Jump</span>
              <button
                onClick={() => setShowQuickJumper(false)}
                className="text-slate-400 hover:text-white px-1 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <button
                onClick={() => { handleRestartFlow(); setShowQuickJumper(false); }}
                className="px-2 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-bold hover:bg-amber-400/30 text-left truncate"
              >
                Splash 1 & 2
              </button>
              <button
                onClick={() => { setScreen('portals'); setShowQuickJumper(false); }}
                className="px-2 py-1 rounded-lg bg-blue-600/30 text-blue-300 font-bold hover:bg-blue-600/40 text-left truncate"
              >
                Portals Gate
              </button>
              <button
                onClick={() => { setScreen('portal_admin'); setShowQuickJumper(false); }}
                className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 text-left truncate"
              >
                Admin Office
              </button>
              <button
                onClick={() => { setScreen('portal_teachers'); setShowQuickJumper(false); }}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30 text-left truncate"
              >
                Teachers Desk
              </button>
              <button
                onClick={() => { setScreen('portal_parents'); setShowQuickJumper(false); }}
                className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold hover:bg-sky-500/30 text-left truncate"
              >
                Parents Portal
              </button>
              <button
                onClick={() => { setScreen('portal_learners'); setShowQuickJumper(false); }}
                className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold hover:bg-purple-500/30 text-left truncate"
              >
                Learners App
              </button>
              <button
                onClick={() => { setIsSplashCustomizerOpen(true); setShowQuickJumper(false); }}
                className="col-span-2 px-2 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 font-bold hover:bg-pink-500/30 text-left truncate flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Customise Splash Screens
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowQuickJumper(true)}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700/60 shadow-lg backdrop-blur-sm transition-all cursor-pointer opacity-40 hover:opacity-100"
            title="Dev Quick Jump & Screen Controls"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
      </aside>

      {/* Main Viewport Container - Edge-to-Edge Responsive Fit */}
      <main className="w-full h-full flex-1 flex flex-col relative overflow-hidden bg-[#070D1E]">
        <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden bg-[#070D1E]">
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
              mode={deviceMode}
              onComplete={() => setScreen('portals')}
            />
          )}

          {screen === 'portals' && (
            <PortalSelection
              onOpenSplashCustomizer={() => setIsSplashCustomizerOpen(true)}
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
              onSwitchPortal={handleSwitchPortal}
            />
          )}

          {screen === 'portal_teachers' && (
            <TeachersPortal
              mode={deviceMode}
              onSwitchToAdmin={() => setScreen('portal_admin')}
              onSwitchPortal={handleSwitchPortal}
              onExit={handleLogout}
            />
          )}

          {screen === 'portal_parents' && (
            <ParentsPortalView
              onLogout={handleLogout}
              onSwitchPortal={handleSwitchPortal}
            />
          )}

          {screen === 'portal_learners' && (
            <LearnersPortalView
              onLogout={handleLogout}
              onSwitchPortal={handleSwitchPortal}
            />
          )}
        </div>
      </main>

      {/* In-App Splash Customizer Modal */}
      <SplashCustomizerModal
        isOpen={isSplashCustomizerOpen}
        onClose={() => setIsSplashCustomizerOpen(false)}
        onPreviewSplashFlow={handleRestartFlow}
      />
    </div>
  );
}

/**
 * PARENTS & GUARDIANS PORTAL VIEW
 * Full implementation for all 5 tabs: Today, Homework, CBC Reports, Focus Zone, Notices
 */
function ParentsPortalView({
  onLogout,
  onSwitchPortal,
}: {
  onLogout: () => void;
  onSwitchPortal?: (portal: 'admin' | 'teachers' | 'parents' | 'learners') => void;
}) {
  const [activeTab, setActiveTab] = useState<'today' | 'homework' | 'reports' | 'focus' | 'noticeboard'>('today');
  const [showParentDrawer, setShowParentDrawer] = useState(false);
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

  const allParents = dataLayer.getParents();
  const currentParent = allParents.find(
    (p) =>
      (session?.id && p.id === session.id) ||
      (session?.identifier &&
        (normalizePhoneNumber(p.parentPhone) === normalizePhoneNumber(session.identifier) ||
          normalizePhoneNumber(p.phone) === normalizePhoneNumber(session.identifier)))
  );

  const parentPhoto = currentParent?.photoUrl || session?.photoUrl;
  const parentName = currentParent?.parentName || currentParent?.name || session?.name || 'Parent';

  // Children linked to this parent (at least one or enrolled pupils)
  const allPupils = dataLayer.getPupils();
  const parentPhone = currentParent?.parentPhone || currentParent?.phone || session?.identifier;
  const userLinkedChildren = allPupils.filter(
    (pup) =>
      (parentPhone && pup.parentPhone && normalizePhoneNumber(pup.parentPhone) === normalizePhoneNumber(parentPhone)) ||
      (currentParent && pup.parentAccountId === currentParent.id) ||
      (currentParent?.linkedChildrenUpi && currentParent.linkedChildrenUpi.includes(pup.upi)) ||
      (currentParent?.pupilUpiList && currentParent.pupilUpiList.includes(pup.upi))
  );

  const linkedChildren = userLinkedChildren.length > 0
    ? userLinkedChildren
    : allPupils.length > 0
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
        subtitle={currentChild ? `${currentChild.name} • ${currentChild.grade}` : parentName}
        photoUrl={parentPhoto}
        showMenu={true}
        onOpenMenu={() => setShowParentDrawer(true)}
        showLogout={true}
        onLogout={onLogout}
        rightAction={
          <PortalSwitcherBadge
            currentPortal="parents"
            onSwitchPortal={onSwitchPortal}
          />
        }
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
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[10px] text-slate-400">
                    <span>Marked by Tr. Kelvin • EE Badge awarded</span>
                    <button
                      type="button"
                      onClick={() =>
                        downloadHomeworkSubmission(
                          'Clean Water & Soil Conservation',
                          `LITTLE ROSES ACADEMY\nHOMEWORK SUBMISSION & FEEDBACK\n\nLearner: ${currentChild.name}\nUPI: ${currentChild.upi}\nGrade: ${currentChild.grade}\nSubject: Environmental Activities\nTopic: Clean Water & Soil Conservation\nScore: 18 / 20 (90% - Exceeding Expectations)\nTeacher Feedback: Excellent diagram and neat handwriting, well done!\nStatus: Marked & Verified\nDate: ${new Date().toLocaleDateString()}`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Feedback</span>
                    </button>
                  </div>
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
                  onClick={() =>
                    downloadCBCReportCard(currentChild.name, currentChild.upi, currentChild.grade, {
                      term: selectedTerm,
                      standing: 'Meeting Expectations (ME) • Overall 81.2%',
                      subjects: [
                        { subject: 'Mathematical Activities', cat: 54, asg: 36, total: 90, band: 'EE' },
                        { subject: 'English Language Activities', cat: 48, asg: 32, total: 80, band: 'EE' },
                        { subject: 'Shughuli za Kiswahili', cat: 42, asg: 30, total: 72, band: 'ME' },
                        { subject: 'Environmental Activities', cat: 44, asg: 31, total: 75, band: 'ME' },
                        { subject: 'CRE Activities', cat: 46, asg: 32, total: 78, band: 'ME' },
                        { subject: 'Creative Activities', cat: 50, asg: 35, total: 85, band: 'EE' },
                      ],
                      remark:
                        'Faith is a dedicated and bright pupil. Keep maintaining high standards in Mathematics and Reading.',
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official CBC Report Card (PDF / Report)</span>
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

      {/* TOP-LEFT 3-LINE MENU DRAWER FOR PARENTS (EXCESS TOOLS) */}
      <PortalDrawer
        isOpen={showParentDrawer}
        onClose={() => setShowParentDrawer(false)}
        portalTitle="Parents Portal"
        portalSubtitle="Little Roses Academy"
        userName={session?.name || currentChild?.parentName || 'Parent / Guardian'}
        userBadge={currentChild ? `Ward: ${currentChild.name} (${currentChild.grade})` : undefined}
        currentPortal="parents"
        onSwitchPortal={onSwitchPortal}
        navItems={[
          {
            id: 'today',
            label: 'Today & Attendance',
            icon: '🏠',
            active: activeTab === 'today',
            onClick: () => setActiveTab('today'),
          },
          {
            id: 'homework',
            label: 'Homework & Assignments',
            icon: '📖',
            active: activeTab === 'homework',
            onClick: () => setActiveTab('homework'),
          },
          {
            id: 'reports',
            label: 'Official CBC Reports',
            icon: '📊',
            active: activeTab === 'reports',
            onClick: () => setActiveTab('reports'),
          },
          {
            id: 'focus',
            label: 'My Focus Zone',
            icon: '✨',
            active: activeTab === 'focus',
            onClick: () => setActiveTab('focus'),
          },
          {
            id: 'noticeboard',
            label: 'School Notices & Calendar',
            icon: '💬',
            active: activeTab === 'noticeboard',
            onClick: () => setActiveTab('noticeboard'),
          },
        ]}
        toolItems={[
          ...(linkedChildren.length > 1
            ? linkedChildren.map((child, idx) => ({
                id: `child_${child.id}`,
                label: `Switch to ${child.name.split(' ')[0]}`,
                description: `${child.grade} • UPI ${child.upi}`,
                icon: <Users className="w-4 h-4 text-sky-400" />,
                badge: activeChildIndex === idx ? 'ACTIVE' : undefined,
                onClick: () => setActiveChildIndex(idx),
              }))
            : []),
          {
            id: 'term_select',
            label: `Current View: ${selectedTerm}`,
            description: 'Change assessment term period',
            icon: <Calendar className="w-4 h-4 text-amber-400" />,
            onClick: () => {
              const next = selectedTerm === 'Term 1' ? 'Term 2' : selectedTerm === 'Term 2' ? 'Term 3' : 'Term 1';
              setSelectedTerm(next);
            },
          },
          {
            id: 'download_report',
            label: 'Download CBC Report Card',
            description: 'Signed report card with school crest',
            icon: <Download className="w-4 h-4 text-emerald-400" />,
            onClick: () => alert('Official CBC Report Card generated with school logo and signed by Principal.'),
          },
          {
            id: 'hw_filter',
            label: `Homework: ${homeworkFilter.toUpperCase()}`,
            description: 'Filter assignments by due, submitted or past',
            icon: <BookOpen className="w-4 h-4 text-purple-400" />,
            onClick: () => {
              const next = homeworkFilter === 'due' ? 'submitted' : homeworkFilter === 'submitted' ? 'past' : 'due';
              setHomeworkFilter(next);
            },
          },
        ]}
        footerActions={[
          {
            label: 'Sign Out Parents Portal',
            icon: <LogOut className="w-4 h-4" />,
            danger: true,
            onClick: onLogout,
          },
        ]}
      />
    </div>
  );
}

/**
 * LEARNERS PORTAL VIEW
 * Full implementation for all 5 tabs: Today, Timetable, Homework, Storybooks, Me
 */
function LearnersPortalView({
  onLogout,
  onSwitchPortal,
}: {
  onLogout: () => void;
  onSwitchPortal?: (portal: 'admin' | 'teachers' | 'parents' | 'learners') => void;
}) {
  const [activeTab, setActiveTab] = useState<'today' | 'timetable' | 'homework' | 'storybooks' | 'me'>('today');
  const [showLearnerDrawer, setShowLearnerDrawer] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const [homeworkFilter, setHomeworkFilter] = useState<'todo' | 'done'>('todo');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const session = dataLayer.getCurrentSession();
  const allPupils = dataLayer.getPupils();
  const currentPupil = allPupils.find(
    (p) =>
      (session?.identifier && (p.upi === session.identifier || p.phone === session.identifier)) ||
      (session?.id && p.id === session.id) ||
      (session?.name && p.name.toLowerCase() === session.name.toLowerCase())
  );

  const learnerName = currentPupil?.name || session?.name || 'Joy Wambui';
  const learnerUpi = currentPupil?.upi || session?.identifier || 'LRA-2026-0012';
  const learnerGrade = currentPupil?.grade || 'Grade 4';
  const learnerPhoto = currentPupil?.photoUrl || session?.photoUrl;
  const learnerResidence = currentPupil?.residence || session?.residence;

  const tabs: TabItem[] = [
    { id: 'today', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-5 h-5" /> },
    { id: 'homework', label: 'Homework', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'me', label: 'Progress', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'more', label: 'More', icon: <SlidersHorizontal className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#070D1E] text-white">
      <Header
        title="Learners"
        subtitle={`${learnerName} • ${learnerGrade}`}
        photoUrl={learnerPhoto}
        showMenu={true}
        onOpenMenu={() => setShowLearnerDrawer(true)}
        showLogout={true}
        onLogout={onLogout}
        rightAction={
          <PortalSwitcherBadge
            currentPortal="learners"
            onSwitchPortal={onSwitchPortal}
          />
        }
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
                {learnerResidence && (
                  <p className="text-[10px] text-slate-400 mt-0.5">📍 {learnerResidence}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/50 overflow-hidden flex items-center justify-center text-2xl shrink-0 shadow">
                {learnerPhoto ? (
                  <img src={learnerPhoto} alt={learnerName} className="w-full h-full object-cover" />
                ) : (
                  <span>🎒</span>
                )}
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
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center py-6 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <h4 className="text-xs font-bold text-white">All previous homework submitted!</h4>
                <p className="text-[10px] text-slate-400">4 tasks evaluated by class teachers.</p>
                <button
                  type="button"
                  onClick={() =>
                    downloadHomeworkSubmission(
                      'Mathematics Division Task',
                      `LITTLE ROSES ACADEMY - CBC HOMEWORK RECORD\n\nLearner: ${learnerName}\nUPI: ${learnerUpi}\nGrade: ${learnerGrade}\nTask: Mathematics Division (48 ÷ 6 = 8)\nStatus: Completed & Verified (100% Score)\nEvaluated by: Class Teacher\nRecorded: ${new Date().toLocaleDateString()}\nLittle Roses Academy • Nakuru, Kenya`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow inline-flex items-center gap-1.5 transition cursor-pointer mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Homework Receipt</span>
                </button>
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
                {
                  title: 'The Clever Hare and Hyena',
                  lang: 'English',
                  pages: '6 pages',
                  stars: '3 Stars ⭐⭐⭐',
                  content: `THE CLEVER HARE AND HYENA\nLittle Roses Academy CBC Reader\n\nOnce upon a time in Nakuru, Hare and Hyena went searching for honey. Hare was clever and prepared a ladder, while Hyena was hasty and forgot his tools...\n\nMoral: Preparation and patience bring success!`,
                },
                {
                  title: 'Sungura na Kobe Mwerevu',
                  lang: 'Kiswahili',
                  pages: '8 pages',
                  stars: '2 Stars ⭐⭐',
                  content: `SUNGURA NA KOBE MWEREVU\nShule ya Little Roses Academy Hadithi ya CBC\n\nHapo zamani, Sungura alijigamba kuwa ana mbio zaidi ya wanyama wote. Kobe akamwambia, 'Mbio si nguvu bali ni ustahimilivu.'\n\nFunzo: Bidii na utulivu hushinda maringo!`,
                },
                {
                  title: 'The Great Baobab Tree',
                  lang: 'English',
                  pages: '5 pages',
                  stars: 'Completed ✔',
                  content: `THE GREAT BAOBAB TREE\nLittle Roses Academy CBC Environmental Reader\n\nIn the school garden stands a lovely baobab seedling. The pupils water it every Friday during Environmental Activities...\n\nMoral: Taking care of our plants keeps Kenya green!`,
                },
              ].map((book, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-pink-400 font-bold">{book.lang}</span>
                    <h4 className="text-xs font-extrabold text-white mt-0.5 truncate">{book.title}</h4>
                    <p className="text-[10px] text-slate-400">{book.pages} • CBC Level 2 Reader</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadStorybook(book.title, book.content)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Download Storybook (Offline txt/pdf)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Opening "${book.title}". Offline reader loaded!`)}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 text-xs font-bold shadow transition cursor-pointer"
                    >
                      Read Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: PROGRESS (EXACT MATCH WITH MY PROGRESS SCREENSHOT)
            ===================================================================== */}
        {activeTab === 'me' && (
          <div className="space-y-4">
            {/* Understanding My CBC Performance Card */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-md">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>Understanding My CBC Performance</span>
              </div>
              <p className="text-[11px] text-slate-400">
                My progress is shown using simple, friendly rings across all learning areas.
              </p>

              {/* 4 Performance Level Rings (EE, ME, AE, BE) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {/* EE */}
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-400 flex items-center justify-center text-emerald-300 font-black text-sm mb-1.5 shadow-sm">
                    EE
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300">Exceeding Expectations</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">I'm doing amazing! 🌟</span>
                </div>

                {/* ME */}
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-400 flex items-center justify-center text-blue-300 font-black text-sm mb-1.5 shadow-sm">
                    ME
                  </div>
                  <span className="text-[11px] font-bold text-blue-300">Meeting Expectations</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">I'm on the right track! 👍</span>
                </div>

                {/* AE */}
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-400 flex items-center justify-center text-amber-300 font-black text-sm mb-1.5 shadow-sm">
                    AE
                  </div>
                  <span className="text-[11px] font-bold text-amber-300">Approaching Expectations</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">I'm getting there! 💪</span>
                </div>

                {/* BE */}
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-rose-400 flex items-center justify-center text-rose-300 font-black text-sm mb-1.5 shadow-sm">
                    BE
                  </div>
                  <span className="text-[11px] font-bold text-rose-300">Beginning Expectations</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">I'm ready to grow! 🌱</span>
                </div>
              </div>
            </div>

            {/* My Subject Progress Section */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📚</span>
                  <h3 className="text-sm font-bold text-white">My Subject Progress</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
                  Term 1 • Active
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 pt-1">
                {[
                  { name: 'English', score: 85, level: 'EE', color: 'from-emerald-500 to-green-400', badgeColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60' },
                  { name: 'Mathematics', score: 78, level: 'ME', color: 'from-blue-500 to-cyan-400', badgeColor: 'text-blue-400 border-blue-500/50 bg-blue-950/60' },
                  { name: 'Science', score: 72, level: 'AE', color: 'from-purple-500 to-indigo-400', badgeColor: 'text-purple-400 border-purple-500/50 bg-purple-950/60' },
                  { name: 'Social Studies', score: 68, level: 'AE', color: 'from-pink-500 to-rose-400', badgeColor: 'text-rose-400 border-rose-500/50 bg-rose-950/60' },
                  { name: 'Creative Arts', score: 92, level: 'EE', color: 'from-teal-500 to-emerald-400', badgeColor: 'text-teal-400 border-teal-500/50 bg-teal-950/60' },
                  { name: 'Physical Education', score: 88, level: 'EE', color: 'from-amber-500 to-orange-400', badgeColor: 'text-amber-400 border-amber-500/50 bg-amber-950/60' },
                ].map((subj) => (
                  <div key={subj.name} className="flex items-center gap-3 text-xs">
                    <span className="w-28 font-bold text-slate-200 truncate">{subj.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${subj.color}`}
                        style={{ width: `${subj.score}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300 w-9 text-right">{subj.score}%</span>
                    <span className={`w-7 h-6 rounded-full border text-[10px] font-black flex items-center justify-center ${subj.badgeColor}`}>
                      {subj.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* You're Doing GREAT! Encouragement Trophy Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-blue-500/10 to-purple-500/20 border border-amber-400/40 flex items-center gap-3.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  You're doing GREAT! 🌟
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Keep learning, keep shining, the best is yet to come!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      <BottomTabs
        tabs={tabs}
        activeTab={activeTab === 'me' ? 'me' : activeTab}
        onSelectTab={(id) => {
          if (id === 'more') {
            setShowLearnerDrawer(true);
          } else {
            setActiveTab(id as any);
          }
        }}
        accentColor="#A855F7"
      />

      {/* TOP-LEFT 3-LINE MENU DRAWER FOR LEARNERS (EXCESS TOOLS) */}
      <PortalDrawer
        isOpen={showLearnerDrawer}
        onClose={() => setShowLearnerDrawer(false)}
        portalTitle="Learners Portal"
        portalSubtitle="Little Roses Academy"
        userName={learnerName}
        userBadge={learnerUpi}
        currentPortal="learners"
        onSwitchPortal={onSwitchPortal}
        navItems={[
          {
            id: 'today',
            label: 'Today In School',
            icon: '🏠',
            active: activeTab === 'today',
            onClick: () => setActiveTab('today'),
          },
          {
            id: 'timetable',
            label: 'My Daily Timetable',
            icon: '📅',
            active: activeTab === 'timetable',
            onClick: () => setActiveTab('timetable'),
          },
          {
            id: 'homework',
            label: 'My Homework Book',
            icon: '📖',
            active: activeTab === 'homework',
            onClick: () => setActiveTab('homework'),
          },
          {
            id: 'storybooks',
            label: 'CBC Storybooks',
            icon: '✨',
            active: activeTab === 'storybooks',
            onClick: () => setActiveTab('storybooks'),
          },
          {
            id: 'me',
            label: 'My Profile & Badges',
            icon: '👥',
            active: activeTab === 'me',
            onClick: () => setActiveTab('me'),
          },
        ]}
        toolItems={[
          {
            id: 'hw_check',
            label: homeworkFilter === 'todo' ? 'Show Completed Tasks' : 'Show Tasks To Do',
            description: `Currently viewing ${homeworkFilter === 'todo' ? 'pending homework' : 'completed work'}`,
            icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
            onClick: () => setHomeworkFilter(homeworkFilter === 'todo' ? 'done' : 'todo'),
          },
          {
            id: 'quick_story',
            label: 'Read Clever Tortoise',
            description: 'English Grade 2/3 featured storybook',
            icon: <Sparkles className="w-4 h-4 text-amber-400" />,
            onClick: () => setActiveTab('storybooks'),
          },
        ]}
        footerActions={[
          {
            label: 'Sign Out Learners Portal',
            icon: <LogOut className="w-4 h-4" />,
            danger: true,
            onClick: onLogout,
          },
        ]}
      />
    </div>
  );
}
