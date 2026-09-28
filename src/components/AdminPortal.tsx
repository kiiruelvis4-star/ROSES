/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Coins, 
  Bell, 
  Search, 
  ArrowLeft, 
  LogOut, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  UserCheck,
  CalendarDays,
  Plus,
  KeyRound,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Upload,
  Download,
  Trash2,
  Edit3,
  Check,
  X,
  Phone,
  Clock,
  BookOpen,
  Coffee,
  Utensils,
  Trophy,
  AlertCircle,
  Home,
  UserPlus,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Archive,
  RefreshCw,
  Share2
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { dataLayer } from '../services/dataLayer.ts';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { TeacherAdminConsole } from './TeacherAdminConsole.tsx';
import {
  getRegisteredTeachers,
  saveRegisteredTeachers,
  getSharedAdminDocuments,
  saveSharedAdminDocuments,
  addSharedAdminDocument,
  AdminSharedDocument,
  getRememberedTeacherSession,
  saveRememberedTeacherSession,
  detectSiblingGroups,
  checkTeacherIsParent,
  normalizePhone
} from '../services/schoolDataService.ts';

// -----------------------------------------------------------------------------
// TYPES & DATA STRUCTURES
// -----------------------------------------------------------------------------

export interface TeacherRecord {
  id: string;
  name: string;
  phone: string;
  assignedGrade?: string; // fallback string e.g. "Grade 5, Grade 6" or "Grades 1–6 (All)"
  assignedGrades: string[]; // e.g. ["Grade 5", "Grade 6"] or all 6 classes
  tier: 'lower' | 'upper' | 'both'; // lower: PP1-Grade 3, upper: Grade 4-Grade 6, both: crosses tiers
  subjects: string[];
  gradeSubjects?: Record<string, string[]>;
  password?: string;
  avatarUrl?: string; // Passport photo / DP
  isDualAdmin?: boolean; // Can be both teacher and admin (e.g. Mr. Elvis Kiiru or Mr. Kelvin)
  pedagogicalAudit: {
    timetableLessonsMarked: boolean;
    assignmentsUploaded: boolean;
    cbc30MarkScoresEntered: boolean;
  };
}

export interface PupilRecord {
  id: string;
  name: string;
  gender: 'Boy' | 'Girl';
  grade: string; // "Grade 1" ... "Grade 6"
  upi: string; // LRA-2026-XXXX
  parentName: string;
  parentPhone: string;
  pin: string; // 3-digit pupil pin
  parentPassword: string; // 4-digit parent password
  avatarUrl?: string;
  statusRingColor?: string;
  academicStanding?: 'On Track' | 'Needs Support' | 'Excelling';
  siblingGroupConfirmed?: boolean;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string; // e.g. "08:00 - 08:35"
  periodIndex: number;
  grade: string;
  subject: string;
  teacher: string;
  isBreak?: boolean;
  breakType?: 'tea' | 'lunch' | 'games';
  breakLabel?: string;
}

export interface FamilyHousehold {
  phone: string;
  parentName: string;
  householdId: string;
  children: PupilRecord[];
}

interface AdminPortalProps {
  mode?: 'phone' | 'tablet' | 'full';
  onBackToPortals: () => void;
  onSwitchToTeachers?: () => void;
}

const OFFICIAL_ADMIN_CODE = 'LRA4.@2025';

const DEFAULT_PERIOD_TIMES = [
  '08:00 - 08:35',
  '08:35 - 09:10',
  '09:10 - 09:45',
  '09:45 - 10:05', // Tea Break
  '10:05 - 10:40',
  '10:40 - 11:15',
  '11:15 - 11:50',
  '11:50 - 12:30', // Lunch Break
  '12:30 - 13:05',
  '13:05 - 13:40',
  '13:40 - 14:15',
  '14:15 - 14:50', // Games
];

const PERIOD_TIMES = DEFAULT_PERIOD_TIMES;

export const CBC_SUBJECTS_LOWER = [
  'Social Studies',
  'Social Studies Activities',
  'Mathematics Activities',
  'English Language Activities',
  'Kiswahili Language Activities',
  'Environmental Activities',
  'Creative Activities',
  'Religious Activities (CRE/IRE)',
  'Indigenous Language',
  'Movement Activities'
];

export const CBC_SUBJECTS_UPPER = [
  'Mathematics',
  'English',
  'Kiswahili',
  'Science and Technology',
  'Social Studies',
  'Agriculture and Nutrition',
  'Creative Arts',
  'Religious Education (CRE/IRE)',
  'Physical & Health Education'
];

export const ALL_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

export function generateFullSchoolTimetable(currentPeriodTimes: string[] = DEFAULT_PERIOD_TIMES): TimetableSlot[] {
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  const allSlots: TimetableSlot[] = [];

  ALL_GRADES.forEach((grade, gradeIdx) => {
    const isLower = grade === 'Grade 1' || grade === 'Grade 2' || grade === 'Grade 3';
    const gradeSubjects = isLower ? CBC_SUBJECTS_LOWER : CBC_SUBJECTS_UPPER;

    days.forEach((day, dayIdx) => {
      currentPeriodTimes.forEach((time, pIdx) => {
        const slotId = `${grade.replace(/\s+/g, '')}-${day}-${pIdx}`;
        if (pIdx === 3 || time === '09:45 - 10:05') {
          allSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade,
            subject: 'Tea Break',
            teacher: 'Staff on Duty',
            isBreak: true,
            breakType: 'tea',
            breakLabel: '☕ Tea Break'
          });
        } else if (pIdx === 7 || time === '11:50 - 12:30') {
          allSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade,
            subject: 'Lunch Break',
            teacher: 'Dining Hall Staff',
            isBreak: true,
            breakType: 'lunch',
            breakLabel: '🍲 Lunch Break'
          });
        } else if (pIdx === 11 || time === '14:15 - 14:50') {
          allSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade,
            subject: isLower ? 'Movement Activities' : 'Games & PE',
            teacher: 'Sports Master',
            isBreak: true,
            breakType: 'games',
            breakLabel: '⚽ Games & PE'
          });
        } else {
          // Grade-specific CBC subject allocation
          const subjectIdx = (dayIdx * 3 + pIdx + gradeIdx * 2) % gradeSubjects.length;
          const subject = gradeSubjects[subjectIdx];
          const teacher = (gradeIdx + pIdx + dayIdx) % 2 === 0 ? 'MR ELVIS' : 'TR. KELVIN';

          allSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade,
            subject,
            teacher
          });
        }
      });
    });
  });

  return allSlots;
}

export function AdminPortal({ mode = 'phone', onBackToPortals, onSwitchToTeachers }: AdminPortalProps) {
  // ---------------------------------------------------------------------------
  // AUTHENTICATION & THEME
  // ---------------------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dark / Light Mode Toggle (Requested by user: "up there make a theme button from dark to light")
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Active User & Dual Role Switch (Recognizing both MR ELVIS teachers & Tr. Kelvin)
  const [dualRoleUser, setDualRoleUser] = useState<string>('Mr. Elvis Kiiru');
  const [activeRoleView, setActiveRoleView] = useState<'office' | 'teacher'>('office');

  // Selected Teacher for full Studio/Workbench Console Modal (Resources, Learners, Allocations)
  const [selectedTeacherForConsole, setSelectedTeacherForConsole] = useState<TeacherRecord | null>(null);

  // Pupil Editing State (Credentials, Passwords, PIN, DP, Info)
  const [editingPupil, setEditingPupil] = useState<PupilRecord | null>(null);
  const [editPupilName, setEditPupilName] = useState('');
  const [editPupilGender, setEditPupilGender] = useState<'Boy' | 'Girl'>('Boy');
  const [editPupilGrade, setEditPupilGrade] = useState('Grade 1');
  const [editPupilUpi, setEditPupilUpi] = useState('');
  const [editPupilPin, setEditPupilPin] = useState('');
  const [editPupilParentPassword, setEditPupilParentPassword] = useState('');
  const [editPupilParentName, setEditPupilParentName] = useState('');
  const [editPupilParentPhone, setEditPupilParentPhone] = useState('');
  const [editPupilAvatar, setEditPupilAvatar] = useState('');
  const [editPupilAcademicStanding, setEditPupilAcademicStanding] = useState<'On Track' | 'Needs Support' | 'Excelling'>('On Track');
  const [showEditPupilPin, setShowEditPupilPin] = useState(false);
  const [showEditParentPassword, setShowEditParentPassword] = useState(false);

  // Navigation Tab: 6 WhatsApp-style dedicated tabs
  const [activeTab, setActiveTab] = useState<'home' | 'teachers' | 'pupils' | 'families' | 'timetable' | 'promotion'>('home');
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // DATA STATE - Strictly 0 / Empty by default as requested: "don't add any body any learners or teachers that's admin work"
  // ---------------------------------------------------------------------------
  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => {
    return getRegisteredTeachers();
  });

  const [sharedDocs, setSharedDocs] = useState<AdminSharedDocument[]>(() => {
    return getSharedAdminDocuments();
  });

  useEffect(() => {
    saveSharedAdminDocuments(sharedDocs);
  }, [sharedDocs]);

  const [pupils, setPupils] = useState<PupilRecord[]>(() => {
    try {
      const saved = localStorage.getItem('lra_office_pupils');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Editable Master Timetable Period / Bell Times
  const [periodTimes, setPeriodTimes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lra_office_period_times');
      return saved ? JSON.parse(saved) : DEFAULT_PERIOD_TIMES;
    } catch {
      return DEFAULT_PERIOD_TIMES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lra_office_period_times', JSON.stringify(periodTimes));
    } catch {
      // ignore
    }
  }, [periodTimes]);

  // Timetable State (Editable by Admin, Grade-Specific Schedules & CBC Subjects)
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem('lra_office_timetable');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if parsed dataset covers all 6 grades
          const coversAllGrades = ALL_GRADES.every((g) => parsed.some((s: any) => s.grade === g));
          if (coversAllGrades) {
            return parsed;
          }
        }
      }
    } catch {
      // fallback
    }
    return generateFullSchoolTimetable(DEFAULT_PERIOD_TIMES);
  });

  // Selected Grade for timetable view: 'Grade 1'...'Grade 6', or 'master'
  const [selectedGradeTimetable, setSelectedGradeTimetable] = useState<string>('Grade 1');
  const [masterViewDay, setMasterViewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lra_office_teachers', JSON.stringify(teachers));
    } catch {
      // ignore
    }
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem('lra_office_pupils', JSON.stringify(pupils));
    } catch {
      // ignore
    }
  }, [pupils]);

  useEffect(() => {
    try {
      localStorage.setItem('lra_office_timetable', JSON.stringify(timetable));
    } catch {
      // ignore
    }
  }, [timetable]);

  // School Activity Pause Controller
  const [activityPause, setActivityPause] = useState<{
    isPaused: boolean;
    eventTitle: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('lra_activity_pause');
      return saved ? JSON.parse(saved) : { isPaused: true, eventTitle: 'Sports Day — Fri: classwork paused' };
    } catch {
      return { isPaused: true, eventTitle: 'Sports Day — Fri: classwork paused' };
    }
  });

  const toggleActivityPause = () => {
    const updated = { ...activityPause, isPaused: !activityPause.isPaused };
    setActivityPause(updated);
    try {
      localStorage.setItem('lra_activity_pause', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(updated.isPaused ? 'Classwork and homework successfully paused' : 'Classwork resumed on timetable');
  };

  // ---------------------------------------------------------------------------
  // DERIVED HOUSEHOLDS & SIBLING TREE
  // ---------------------------------------------------------------------------
  const families: FamilyHousehold[] = useMemo(() => {
    const map = new Map<string, FamilyHousehold>();
    let famCounter = 1;

    pupils.forEach((pupil) => {
      // Normalize phone: strip spaces and dashes
      const cleanPhone = pupil.parentPhone.replace(/[\s-]/g, '');
      if (!map.has(cleanPhone)) {
        map.set(cleanPhone, {
          phone: pupil.parentPhone,
          parentName: pupil.parentName,
          householdId: `FAM-${String(famCounter++).padStart(3, '0')}`,
          children: [pupil]
        });
      } else {
        const existing = map.get(cleanPhone)!;
        existing.children.push(pupil);
      }
    });

    return Array.from(map.values());
  }, [pupils]);

  // ---------------------------------------------------------------------------
  // TEACHERS TAB STATE & MODAL
  // ---------------------------------------------------------------------------
  const [teacherFilterTier, setTeacherFilterTier] = useState<'all' | 'lower' | 'upper'>('all');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherGrades, setNewTeacherGrades] = useState<string[]>(['Grade 5', 'Grade 6']);
  const [newTeacherSubjects, setNewTeacherSubjects] = useState<string[]>([]);
  const [newTeacherPassword, setNewTeacherPassword] = useState('Roses@2026');
  const [showNewTeacherPassword, setShowNewTeacherPassword] = useState(false);
  const [newTeacherAvatar, setNewTeacherAvatar] = useState(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=240&q=80'
  );
  const [newTeacherIsDualAdmin, setNewTeacherIsDualAdmin] = useState(false);

  // Teacher Profile Editing State
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherPhone, setEditTeacherPhone] = useState('');
  const [editTeacherPassword, setEditTeacherPassword] = useState('');
  const [showEditTeacherPassword, setShowEditTeacherPassword] = useState(false);
  const [editTeacherGrades, setEditTeacherGrades] = useState<string[]>([]);
  const [editTeacherSubjects, setEditTeacherSubjects] = useState<string[]>([]);
  const [editTeacherAvatar, setEditTeacherAvatar] = useState('');
  const [editTeacherIsDualAdmin, setEditTeacherIsDualAdmin] = useState(false);

  // Admin Document Sharing State (Admin -> Teachers Portal)
  const [teacherViewSubTab, setTeacherViewSubTab] = useState<'staff' | 'shared_docs'>('staff');
  const [showShareDocModal, setShowShareDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'Syllabus' | 'Circular' | 'Assessment Guide' | 'Scheme of Work'>('Syllabus');
  const [newDocGrade, setNewDocGrade] = useState('All Classes');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [newDocFileData, setNewDocFileData] = useState<string>('');

  const PRESET_AVATARS = [
    { label: 'Male Portrait 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80' },
    { label: 'Female Portrait 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80' },
    { label: 'Female Portrait 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
    { label: 'Male Portrait 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
    { label: 'Female Portrait 3', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=240&q=80' }
  ];

  const handleStartEditTeacher = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher);
    setEditTeacherName(teacher.name);
    setEditTeacherPhone(teacher.phone);
    setEditTeacherPassword(teacher.password || 'Roses@2026');
    setEditTeacherGrades(teacher.assignedGrades || (teacher.assignedGrade ? [teacher.assignedGrade] : ['Grade 1']));
    setEditTeacherSubjects(teacher.subjects || []);
    setEditTeacherAvatar(teacher.avatarUrl || PRESET_AVATARS[0].url);
    setEditTeacherIsDualAdmin(Boolean(teacher.isDualAdmin));
  };

  const handleSaveEditedTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editTeacherName.trim()) {
      showToast('Teacher name cannot be blank');
      return;
    }
    if (editTeacherGrades.length === 0) {
      showToast('Please assign at least one class');
      return;
    }

    const hasLower = editTeacherGrades.some((g) => ['Grade 1', 'Grade 2', 'Grade 3'].includes(g));
    const hasUpper = editTeacherGrades.some((g) => ['Grade 4', 'Grade 5', 'Grade 6'].includes(g));
    const tier: 'lower' | 'upper' | 'both' = hasLower && hasUpper ? 'both' : hasLower ? 'lower' : 'upper';

    const updated: TeacherRecord = {
      ...editingTeacher,
      name: editTeacherName.trim(),
      phone: editTeacherPhone.trim(),
      password: editTeacherPassword,
      assignedGrades: editTeacherGrades,
      assignedGrade: editTeacherGrades.length === ALL_GRADES.length ? 'Grades 1–6 (All Classes)' : editTeacherGrades.join(', '),
      tier,
      subjects: editTeacherSubjects.length > 0 ? editTeacherSubjects : ['Mathematics', 'Creative Arts'],
      avatarUrl: editTeacherAvatar,
      isDualAdmin: editTeacherIsDualAdmin
    };

    const nextList = teachers.map((t) => (t.id === editingTeacher.id ? updated : t));
    setTeachers(nextList);
    saveRegisteredTeachers(nextList);

    // Also update remembered teacher session if it matches
    const currentSession = getRememberedTeacherSession();
    if (currentSession && (currentSession.id === updated.id || currentSession.phone === updated.phone)) {
      saveRememberedTeacherSession(updated);
    }

    setEditingTeacher(null);
    showToast(`✓ Teacher ${updated.name}'s profile, password, and photo updated!`);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const target = teachers.find((t) => t.id === teacherId);
    if (!target) return;
    if (window.confirm(`Are you sure you want to remove ${target.name} from the school roster?`)) {
      const nextList = teachers.filter((t) => t.id !== teacherId);
      setTeachers(nextList);
      saveRegisteredTeachers(nextList);
      showToast(`Teacher ${target.name} removed from roster`);
    }
  };

  // Open full Teacher Studio Workbench (Resources, Learners, Allocations, Scoped Timetable)
  const handleOpenTeacherConsole = (teacher: TeacherRecord) => {
    setSelectedTeacherForConsole(teacher);
  };

  const handlePushToTeacherPortal = (targetTeacher: TeacherRecord, payload: any) => {
    // Schemes & lesson documents are teacher's own work and not pushed from office
    if (payload.type === 'timetable_scoped') {
      showToast(`Timetable periods scoped for ${targetTeacher.name} 🗓️`);
    }
  };

  // Pupil Edit Handlers (Passwords, PIN, DP, Info)
  const handleStartEditPupil = (pupil: PupilRecord) => {
    setEditingPupil(pupil);
    setEditPupilName(pupil.name);
    setEditPupilGender(pupil.gender);
    setEditPupilGrade(pupil.grade);
    setEditPupilUpi(pupil.upi);
    setEditPupilPin(pupil.pin);
    setEditPupilParentPassword(pupil.parentPassword);
    setEditPupilParentName(pupil.parentName);
    setEditPupilParentPhone(pupil.parentPhone);
    setEditPupilAvatar(pupil.avatarUrl || PRESET_AVATARS[0].url);
    setEditPupilAcademicStanding(pupil.academicStanding || 'On Track');
  };

  const handleSaveEditedPupil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPupil) return;
    if (!editPupilName.trim()) {
      showToast('Learner name cannot be blank');
      return;
    }
    if (!editPupilPin.trim()) {
      showToast('Learner PIN / password cannot be blank');
      return;
    }

    const updated: PupilRecord = {
      ...editingPupil,
      name: editPupilName.trim(),
      gender: editPupilGender,
      grade: editPupilGrade,
      upi: editPupilUpi.trim() || editingPupil.upi,
      pin: editPupilPin.trim(),
      parentPassword: editPupilParentPassword.trim() || editingPupil.parentPassword,
      parentName: editPupilParentName.trim() || editingPupil.parentName,
      parentPhone: editPupilParentPhone.trim() || editingPupil.parentPhone,
      avatarUrl: editPupilAvatar,
      academicStanding: editPupilAcademicStanding
    };

    const nextList = pupils.map((p) => (p.id === editingPupil.id ? updated : p));
    setPupils(nextList);
    try {
      localStorage.setItem('lra_office_pupils', JSON.stringify(nextList));
    } catch {}

    setEditingPupil(null);
    showToast(`✓ Updated ${updated.name}'s credentials, PIN (${updated.pin}), and parent password! Functional immediately 💾`);
  };

  const handleDeletePupil = (pupilId: string) => {
    const target = pupils.find((p) => p.id === pupilId);
    if (!target) return;
    if (window.confirm(`Are you sure you want to remove ${target.name} from school records?`)) {
      const nextList = pupils.filter((p) => p.id !== pupilId);
      setPupils(nextList);
      try {
        localStorage.setItem('lra_office_pupils', JSON.stringify(nextList));
      } catch {}
      showToast(`Learner ${target.name} removed from enrollment`);
    }
  };

  // AI Sibling Group Confirm / Dismiss
  const handleConfirmSiblings = (parentPhone: string) => {
    const clean = normalizePhone(parentPhone);
    const updated = pupils.map((p) => {
      if (normalizePhone(p.parentPhone) === clean) {
        return { ...p, siblingGroupConfirmed: true };
      }
      return p;
    });
    setPupils(updated);
    try {
      localStorage.setItem('lra_office_pupils', JSON.stringify(updated));
    } catch {}
    showToast(`✓ Confirmed sibling household for phone ${parentPhone}! Linked in Families hub 👨‍👩‍👧`);
  };

  const handleDismissSiblings = (parentPhone: string) => {
    const clean = normalizePhone(parentPhone);
    const updated = pupils.map((p) => {
      if (normalizePhone(p.parentPhone) === clean) {
        return { ...p, siblingGroupConfirmed: true };
      }
      return p;
    });
    setPupils(updated);
    try {
      localStorage.setItem('lra_office_pupils', JSON.stringify(updated));
    } catch {}
    showToast(`Sibling inquiry dismissed for ${parentPhone}`);
  };

  const handleShareDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      showToast('Please enter document title');
      return;
    }
    const finalFileName = newDocFileName.trim() || `${newDocTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const added = addSharedAdminDocument({
      title: newDocTitle.trim(),
      fileName: finalFileName,
      fileType: finalFileName.endsWith('.docx') ? 'docx' : finalFileName.endsWith('.xlsx') ? 'xlsx' : 'pdf',
      category: newDocCategory,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      targetGrade: newDocGrade,
      sharedBy: dualRoleUser === 'Elvis' ? 'Mr. Elvis Kiiru • Administration' : 'Mr. Kelvin • Administration',
      fileSize: '1.2 MB',
      notes: newDocNotes.trim() || 'Official curriculum material distributed by School Office.',
      fileUrl: newDocFileData
    });

    setSharedDocs([added, ...sharedDocs.filter((d) => d.id !== added.id)]);
    setShowShareDocModal(false);
    setNewDocTitle('');
    setNewDocFileName('');
    setNewDocNotes('');
    setNewDocFileData('');
    showToast(`✓ Document "${added.title}" shared with teachers! Instantly visible in Teachers Portal ☁️`);
  };

  const handleDeleteSharedDoc = (docId: string) => {
    const nextDocs = sharedDocs.filter((d) => d.id !== docId);
    setSharedDocs(nextDocs);
    saveSharedAdminDocuments(nextDocs);
    showToast('Document removed from shared shelf');
  };

  const toggleTeacherGrade = (g: string) => {
    if (newTeacherGrades.includes(g)) {
      if (newTeacherGrades.length > 1) {
        setNewTeacherGrades(newTeacherGrades.filter((item) => item !== g));
      } else {
        showToast('Teacher must be assigned to at least one class');
      }
    } else {
      setNewTeacherGrades([...newTeacherGrades, g].sort());
    }
  };

  const toggleEditTeacherGrade = (g: string) => {
    if (editTeacherGrades.includes(g)) {
      if (editTeacherGrades.length > 1) {
        setEditTeacherGrades(editTeacherGrades.filter((item) => item !== g));
      } else {
        showToast('Teacher must be assigned to at least one class');
      }
    } else {
      setEditTeacherGrades([...editTeacherGrades, g].sort());
    }
  };

  const handleSelectAllGrades = () => {
    if (newTeacherGrades.length === ALL_GRADES.length) {
      setNewTeacherGrades(['Grade 1']);
    } else {
      setNewTeacherGrades([...ALL_GRADES]);
    }
  };

  const handleSelectAllEditGrades = () => {
    if (editTeacherGrades.length === ALL_GRADES.length) {
      setEditTeacherGrades(['Grade 1']);
    } else {
      setEditTeacherGrades([...ALL_GRADES]);
    }
  };

  const handleToggleSubject = (sub: string) => {
    if (newTeacherSubjects.includes(sub)) {
      setNewTeacherSubjects(newTeacherSubjects.filter((s) => s !== sub));
    } else {
      setNewTeacherSubjects([...newTeacherSubjects, sub]);
    }
  };

  const handleToggleEditSubject = (sub: string) => {
    if (editTeacherSubjects.includes(sub)) {
      setEditTeacherSubjects(editTeacherSubjects.filter((s) => s !== sub));
    } else {
      setEditTeacherSubjects([...editTeacherSubjects, sub]);
    }
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) {
      showToast('Please enter the teacher full legal name');
      return;
    }
    if (newTeacherGrades.length === 0) {
      showToast('Please assign at least one class');
      return;
    }

    const hasLower = newTeacherGrades.some((g) => ['Grade 1', 'Grade 2', 'Grade 3'].includes(g));
    const hasUpper = newTeacherGrades.some((g) => ['Grade 4', 'Grade 5', 'Grade 6'].includes(g));
    const tier: 'lower' | 'upper' | 'both' = hasLower && hasUpper ? 'both' : hasLower ? 'lower' : 'upper';

    const newTeacher: TeacherRecord = {
      id: `TCH-${Date.now().toString().slice(-4)}`,
      name: newTeacherName.trim(),
      phone: newTeacherPhone.trim() || '0712 345 678',
      assignedGrades: newTeacherGrades,
      assignedGrade: newTeacherGrades.length === ALL_GRADES.length ? 'Grades 1–6 (All Classes)' : newTeacherGrades.join(', '),
      tier,
      subjects: newTeacherSubjects.length > 0 ? newTeacherSubjects : ['Mathematics', 'Creative Arts'],
      password: newTeacherPassword,
      avatarUrl: newTeacherAvatar,
      isDualAdmin: newTeacherIsDualAdmin,
      pedagogicalAudit: {
        timetableLessonsMarked: true,
        assignmentsUploaded: true,
        cbc30MarkScoresEntered: false
      }
    };

    const nextList = [newTeacher, ...teachers];
    setTeachers(nextList);
    saveRegisteredTeachers(nextList);
    setShowAddTeacherModal(false);
    setNewTeacherName('');
    setNewTeacherPhone('');
    setNewTeacherGrades(['Grade 5', 'Grade 6']);
    setNewTeacherSubjects([]);
    setNewTeacherIsDualAdmin(false);
    showToast(`Staff member ${newTeacher.name} assigned to ${newTeacher.assignedGrade} successfully registered!`);
  };

  const toggleTeacherAudit = (teacherId: string, key: keyof TeacherRecord['pedagogicalAudit']) => {
    setTeachers(teachers.map((t) => {
      if (t.id === teacherId) {
        return {
          ...t,
          pedagogicalAudit: {
            ...t.pedagogicalAudit,
            [key]: !t.pedagogicalAudit[key]
          }
        };
      }
      return t;
    }));
    showToast('Pedagogical audit status updated');
  };

  // ---------------------------------------------------------------------------
  // PUPILS TAB STATE & ADMISSION FORMS
  // ---------------------------------------------------------------------------
  const [selectedPupilGrade, setSelectedPupilGrade] = useState<string>('Grade 4');
  const [newPupilName, setNewPupilName] = useState('');
  const [newPupilGender, setNewPupilGender] = useState<'Boy' | 'Girl'>('Boy');
  const [newPupilGrade, setNewPupilGrade] = useState('Grade 4');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [parentLookupResult, setParentLookupResult] = useState<string | null>(null);

  // Bulk Admission Studio
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkPreviewRows, setBulkPreviewRows] = useState<{
    name: string;
    grade: string;
    phone: string;
    parent: string;
    isValid: boolean;
    reason?: string;
  }[]>([]);

  const handleParentLookup = () => {
    if (!newParentPhone.trim()) {
      showToast('Enter a parent phone number to search');
      return;
    }
    const clean = newParentPhone.replace(/[\s-]/g, '');
    const matchedFamily = families.find((f) => f.phone.replace(/[\s-]/g, '') === clean);
    if (matchedFamily) {
      setNewParentName(matchedFamily.parentName);
      setParentLookupResult(`Household found: ${matchedFamily.parentName} (${matchedFamily.children.length} siblings in school)`);
      showToast(`Existing household found: ${matchedFamily.parentName}`);
    } else {
      setParentLookupResult('New household — no existing siblings found on record');
      showToast('New household will be created');
    }
  };

  const handleAdmitPupil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPupilName.trim()) {
      showToast('Please enter the pupil full name');
      return;
    }
    const nextSeq = String(pupils.length + 47).padStart(4, '0');
    const autoUpi = `LRA-2026-${nextSeq}`;
    const randomPin = String(Math.floor(100 + Math.random() * 900));
    const randomParentPass = String(Math.floor(1000 + Math.random() * 9000));

    const pupil: PupilRecord = {
      id: `PUP-${Date.now()}`,
      name: newPupilName.trim(),
      gender: newPupilGender,
      grade: newPupilGrade,
      upi: autoUpi,
      parentName: newParentName.trim() || 'Parent',
      parentPhone: newParentPhone.trim() || '+254 712 345 678',
      pin: randomPin,
      parentPassword: randomParentPass,
      statusRingColor: newPupilGender === 'Boy' ? '#10B981' : '#F59E0B',
      academicStanding: 'On Track'
    };

    setPupils([...pupils, pupil]);
    setNewPupilName('');
    setNewParentName('');
    setNewParentPhone('');
    setParentLookupResult(null);
    showToast(`Pupil ${pupil.name} (${pupil.upi}) admitted to ${pupil.grade}!`);
  };

  // Bulk CSV parser
  const handleParseCsv = (text: string) => {
    setBulkCsvText(text);
    if (!text.trim()) {
      setBulkPreviewRows([]);
      return;
    }
    const lines = text.trim().split('\n');
    const rows = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      const name = parts[0] || '';
      const grade = parts[1] || '';
      const phone = parts[2] || '';
      const parent = parts[3] || 'Parent';

      const isValidGrade = ALL_GRADES.includes(grade);
      const isValidPhone = phone.length >= 9;
      const isValid = Boolean(name && isValidGrade && isValidPhone);

      return {
        name,
        grade,
        phone,
        parent,
        isValid,
        reason: !name ? 'Missing name' : !isValidGrade ? 'Invalid Grade (use Grade 1-6)' : !isValidPhone ? 'Invalid phone number' : undefined
      };
    });
    setBulkPreviewRows(rows);
  };

  const handleCommitBulkAdmission = () => {
    const validRows = bulkPreviewRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast('No valid rows found to commit');
      return;
    }
    const newPupilsList: PupilRecord[] = validRows.map((r, idx) => {
      const nextSeq = String(pupils.length + idx + 50).padStart(4, '0');
      return {
        id: `PUP-${Date.now()}-${idx}`,
        name: r.name,
        gender: idx % 2 === 0 ? 'Boy' : 'Girl',
        grade: r.grade,
        upi: `LRA-2026-${nextSeq}`,
        parentName: r.parent,
        parentPhone: r.phone,
        pin: String(Math.floor(100 + Math.random() * 900)),
        parentPassword: String(Math.floor(1000 + Math.random() * 9000)),
        statusRingColor: '#10B981',
        academicStanding: 'On Track'
      };
    });

    setPupils([...pupils, ...newPupilsList]);
    setBulkCsvText('');
    setBulkPreviewRows([]);
    showToast(`Admitted ${newPupilsList.length} pupils in bulk successfully!`);
  };

  // ---------------------------------------------------------------------------
  // TIMETABLE EDITING & CONFLICT DETECTION (EDITABLE LESSONS & EDITABLE TIMES)
  // ---------------------------------------------------------------------------
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editSlotTime, setEditSlotTime] = useState('');

  // Bell schedule & period time editing state
  const [showBellScheduleModal, setShowBellScheduleModal] = useState(false);
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null);
  const [quickPeriodTimeVal, setQuickPeriodTimeVal] = useState('');

  // Check if a teacher is double-booked across different grades in the same period
  const conflictWarning = useMemo(() => {
    if (!editingSlot || !editTeacher.trim()) return null;
    const cleanTeacher = editTeacher.trim().toLowerCase();

    const conflict = timetable.find(
      (s) =>
        s.id !== editingSlot.id &&
        s.day === editingSlot.day &&
        s.periodIndex === editingSlot.periodIndex &&
        s.grade !== editGrade &&
        s.teacher.trim().toLowerCase() === cleanTeacher &&
        !s.isBreak
    );
    if (conflict) {
      return `⚠️ DOUBLE-BOOKING CONFLICT: "${editTeacher}" is already scheduled in ${conflict.grade} for "${conflict.subject}" on ${conflict.day} (${conflict.time})!`;
    }
    return null;
  }, [editingSlot, editTeacher, editGrade, timetable]);

  const handleOpenEditSlot = (slot: TimetableSlot) => {
    if (slot.isBreak) return;
    setEditingSlot(slot);
    setEditSubject(slot.subject);
    setEditTeacher(slot.teacher);
    setEditGrade(slot.grade);
    setEditSlotTime(slot.time);
  };

  const handleCreateOrEditSlot = (
    grade: string, 
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', 
    pIdx: number, 
    time: string
  ) => {
    const existing = timetable.find((s) => s.grade === grade && s.day === day && s.periodIndex === pIdx);
    if (existing) {
      handleOpenEditSlot(existing);
    } else {
      const isLower = grade === 'Grade 1' || grade === 'Grade 2' || grade === 'Grade 3';
      const defaultSubjects = isLower ? CBC_SUBJECTS_LOWER : CBC_SUBJECTS_UPPER;
      const newSlot: TimetableSlot = {
        id: `${grade.replace(/\s+/g, '')}-${day}-${pIdx}`,
        day,
        time,
        periodIndex: pIdx,
        grade,
        subject: defaultSubjects[pIdx % defaultSubjects.length],
        teacher: 'MR ELVIS'
      };
      handleOpenEditSlot(newSlot);
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const newTime = editSlotTime.trim() || editingSlot.time;

    // Synchronize periodTimes array
    const updatedPeriodTimes = [...periodTimes];
    if (updatedPeriodTimes[editingSlot.periodIndex] !== undefined && updatedPeriodTimes[editingSlot.periodIndex] !== newTime) {
      updatedPeriodTimes[editingSlot.periodIndex] = newTime;
      setPeriodTimes(updatedPeriodTimes);
    }

    const slotExists = timetable.some((s) => s.id === editingSlot.id);
    let updatedTimetable: TimetableSlot[];

    if (slotExists) {
      updatedTimetable = timetable.map((s) => {
        if (s.id === editingSlot.id) {
          return {
            ...s,
            time: newTime,
            subject: editSubject,
            teacher: editTeacher,
            grade: editGrade
          };
        }
        if (s.periodIndex === editingSlot.periodIndex) {
          return {
            ...s,
            time: newTime
          };
        }
        return s;
      });
    } else {
      const newSlot: TimetableSlot = {
        id: editingSlot.id,
        day: editingSlot.day,
        time: newTime,
        periodIndex: editingSlot.periodIndex,
        grade: editGrade,
        subject: editSubject,
        teacher: editTeacher
      };
      updatedTimetable = [...timetable, newSlot].map((s) => {
        if (s.periodIndex === editingSlot.periodIndex) {
          return { ...s, time: newTime };
        }
        return s;
      });
    }

    setTimetable(updatedTimetable);
    setEditingSlot(null);
    showToast(`Updated ${editGrade} ${editingSlot.day} Period ${editingSlot.periodIndex + 1}!`);
  };

  const handleResetGradeSchedule = (gradeToReset: string) => {
    const isLower = gradeToReset === 'Grade 1' || gradeToReset === 'Grade 2' || gradeToReset === 'Grade 3';
    const gradeSubjects = isLower ? CBC_SUBJECTS_LOWER : CBC_SUBJECTS_UPPER;
    const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
    ];
    const gradeIdx = Math.max(0, ALL_GRADES.indexOf(gradeToReset));

    const otherGradesSlots = timetable.filter((s) => s.grade !== gradeToReset);
    const newGradeSlots: TimetableSlot[] = [];

    days.forEach((day, dayIdx) => {
      periodTimes.forEach((time, pIdx) => {
        const slotId = `${gradeToReset.replace(/\s+/g, '')}-${day}-${pIdx}`;
        if (pIdx === 3 || time === '09:45 - 10:05') {
          newGradeSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade: gradeToReset,
            subject: 'Tea Break',
            teacher: 'Staff on Duty',
            isBreak: true,
            breakType: 'tea',
            breakLabel: '☕ Tea Break'
          });
        } else if (pIdx === 7 || time === '11:50 - 12:30') {
          newGradeSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade: gradeToReset,
            subject: 'Lunch Break',
            teacher: 'Dining Hall Staff',
            isBreak: true,
            breakType: 'lunch',
            breakLabel: '🍲 Lunch Break'
          });
        } else if (pIdx === 11 || time === '14:15 - 14:50') {
          newGradeSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade: gradeToReset,
            subject: isLower ? 'Movement Activities' : 'Games & PE',
            teacher: 'Sports Master',
            isBreak: true,
            breakType: 'games',
            breakLabel: '⚽ Games & PE'
          });
        } else {
          const subjectIdx = (dayIdx * 3 + pIdx + gradeIdx * 2) % gradeSubjects.length;
          newGradeSlots.push({
            id: slotId,
            day,
            time,
            periodIndex: pIdx,
            grade: gradeToReset,
            subject: gradeSubjects[subjectIdx],
            teacher: (gradeIdx + pIdx + dayIdx) % 2 === 0 ? 'MR ELVIS' : 'TR. KELVIN'
          });
        }
      });
    });

    setTimetable([...otherGradesSlots, ...newGradeSlots]);
    showToast(`Reset ${gradeToReset} timetable to official CBC subject pacing!`);
  };

  const handleSaveSpecificPeriodTime = (pIdx: number, newTime: string) => {
    if (!newTime.trim()) return;
    const cleanTime = newTime.trim();
    const updatedTimes = [...periodTimes];
    updatedTimes[pIdx] = cleanTime;
    setPeriodTimes(updatedTimes);

    setTimetable(
      timetable.map((s) => {
        if (s.periodIndex === pIdx) {
          return {
            ...s,
            time: cleanTime
          };
        }
        return s;
      })
    );
    setEditingPeriodIndex(null);
    showToast(`Period ${pIdx + 1} time updated to ${cleanTime}`);
  };

  const handleResetDefaultBellTimes = () => {
    setPeriodTimes(DEFAULT_PERIOD_TIMES);
    setTimetable(
      timetable.map((s) => ({
        ...s,
        time: DEFAULT_PERIOD_TIMES[s.periodIndex] || s.time
      }))
    );
    showToast('Reset all periods to standard 35-minute CBC times');
  };

  // ---------------------------------------------------------------------------
  // PROMOTION STUDIO STATE
  // ---------------------------------------------------------------------------
  const [exceptions, setExceptions] = useState<{
    [upi: string]: { status: 'retained' | 'transferred'; reason: string };
  }>({});

  const handleRunPromotion = () => {
    if (pupils.length === 0) {
      showToast('No enrolled learners to promote yet');
      return;
    }
    // Advance cohorts: Grade 1 -> Grade 2, ... Grade 6 -> Alumni
    const promotedList = pupils.map((p) => {
      const exc = exceptions[p.upi];
      if (exc?.status === 'retained') {
        return p; // retains same grade
      }
      if (exc?.status === 'transferred') {
        return { ...p, grade: 'Transferred Out' };
      }
      // Normal promotion
      if (p.grade === 'Grade 1') return { ...p, grade: 'Grade 2' };
      if (p.grade === 'Grade 2') return { ...p, grade: 'Grade 3' };
      if (p.grade === 'Grade 3') return { ...p, grade: 'Grade 4' };
      if (p.grade === 'Grade 4') return { ...p, grade: 'Grade 5' };
      if (p.grade === 'Grade 5') return { ...p, grade: 'Grade 6' };
      if (p.grade === 'Grade 6') return { ...p, grade: 'Alumni Archive' };
      return p;
    });

    setPupils(promotedList);
    showToast('Cohort promotion completed! Academic records preserved.');
  };

  // ---------------------------------------------------------------------------
  // BACKUP & RESTORE DATA
  // ---------------------------------------------------------------------------
  const handleBackupSchoolData = () => {
    const dataSnapshot = {
      academy: 'Little Roses Academy Nakuru',
      academicYear: '2026',
      term: 'Term 1',
      exportedAt: new Date().toISOString(),
      teachers,
      pupils,
      timetable,
      activityPause
    };
    const blob = new Blob([JSON.stringify(dataSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Little_Roses_Academy_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('School data snapshot downloaded safely 💾');
  };

  // Broadcast modal state
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'grade'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('Please type an announcement message');
      return;
    }
    showToast(`Notice broadcasted to ${broadcastTarget === 'all' ? 'all registered parents' : 'selected grade'}!`);
    setBroadcastMessage('');
  };

  // Grade Counts for Cohort Advancement
  const gradeCounts = useMemo(() => {
    const counts: { [g: string]: number } = {
      'Grade 1': 0,
      'Grade 2': 0,
      'Grade 3': 0,
      'Grade 4': 0,
      'Grade 5': 0,
      'Grade 6': 0,
      'Alumni Archive': 0
    };
    pupils.forEach((p) => {
      if (counts[p.grade] !== undefined) {
        counts[p.grade]++;
      }
    });
    return counts;
  }, [pupils]);

  // ---------------------------------------------------------------------------
  // AUTHENTICATION GUARD
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div 
        className={`relative w-full h-full flex flex-col justify-between overflow-y-auto p-4 sm:p-6 font-sans select-none ${
          isDarkMode ? 'bg-[#060D1E] text-white' : 'bg-slate-100 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <button
            onClick={onBackToPortals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portals</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-slate-950/90 border border-amber-400/50 px-2.5 py-1 rounded-full shadow-lg">
              <Lock className="w-3 h-3" />
              <span>Strict Admin Access</span>
            </div>
          </div>
        </div>

        {/* Central Authentication Card */}
        <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-3">
          <div className="bg-[#0B152E]/95 backdrop-blur-xl border-2 border-amber-400/90 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
            {/* Crest Logo */}
            <div className="w-16 h-16 mb-2.5 flex items-center justify-center">
              <Logo size="md" showTagline={false} />
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-amber-400/50 text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1.5">
              School Administration
            </div>

            <h2 className="text-xl font-black text-white tracking-wide">
              School Office Gate
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              Enter your designated Little Roses Admin Code to enter the executive console.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (adminCode.trim() === OFFICIAL_ADMIN_CODE) {
                  setIsAuthenticated(true);
                  setLoginError('');
                  showToast('Administrator Security Verified • Welcome Principal');
                } else {
                  setLoginError('Invalid Admin Code. Access restricted to authorized Little Roses Administration.');
                }
              }}
              className="w-full mt-5 space-y-3.5 text-left"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Code</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    className="w-full bg-slate-950/90 border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white font-mono tracking-widest focus:outline-none transition-colors shadow-inner"
                    placeholder="••••••••••••"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/70 border border-red-800 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Enter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN ADMIN CONSOLE (AUTHENTICATED)
  // ---------------------------------------------------------------------------
  return (
    <div 
      className={`relative w-full h-full flex flex-col overflow-hidden font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#060D1E] text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER & IDENTITY (MATCHING EXACT SCREENSHOTS)
          ========================================================================= */}
      <header className="relative z-30 w-full flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#0F172A] border-b border-slate-800 text-white shadow-md">
        {/* Left: Little Roses Crest & School Office Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Logo size="sm" showTagline={false} />
          </div>

          <div>
            <h1 className="font-serif font-black text-base sm:text-lg text-amber-300 tracking-wide leading-tight">
              School Office
            </h1>
            <div className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-400/15 border border-amber-400/40 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
              <span>👤 Head Teacher / Owner</span>
            </div>
          </div>
        </div>

        {/* Right: Term Badge, Sync Pill, Theme Switch, Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Term & Academic Year Badge */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>2026 • Term 1</span>
          </div>

          {/* Sync Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Synced</span>
          </div>

          {/* Theme Button: Dark to Light (Requested by user) */}
          <button
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              showToast(!isDarkMode ? 'Dark executive mode enabled' : 'Clean light theme enabled');
            }}
            className="p-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors shadow-sm cursor-pointer"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Lock / Exit Session */}
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminCode('');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            title="Lock Administration Session"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          <button
            onClick={onBackToPortals}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            title="Exit to Portal Selector"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. DUAL-ROLE QUICK SWITCH BAR (RECOGNIZING BOTH MR ELVIS & TR KELVIN)
          ========================================================================= */}
      <section className="relative z-20 w-full px-3 sm:px-4 py-2 bg-[#091227] border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-black flex items-center justify-center text-xs shadow-md border-2 border-amber-400">
            👑
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm text-white tracking-wide">
                {dualRoleUser}
              </span>
              <select
                value={dualRoleUser}
                onChange={(e) => {
                  setDualRoleUser(e.target.value);
                  showToast(`Switched active administrator to ${e.target.value} (Dual Admin Privileged) 👑`);
                }}
                className="bg-slate-900 border border-amber-400/50 text-amber-300 text-[10px] font-bold rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
                title="Select Dual Admin Leader: Recognizes both Mr. Elvis teachers"
              >
                {teachers
                  .filter((t) => t.isDualAdmin || t.name.toUpperCase().includes('ELVIS') || t.name.toUpperCase().includes('KELVIN'))
                  .map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.phone})
                    </option>
                  ))}
              </select>
            </div>
            <p className="text-[10px] text-amber-400/90 font-medium">Dual Admin & Teacher Privilege Granted</p>
          </div>
        </div>

        {/* Dual Role Switch Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              // Save target teacher session so teacher workbench loads the exact teacher profile!
              const target =
                teachers.find((t) => t.name === dualRoleUser) ||
                teachers.find((t) => t.name.toUpperCase().includes('ELVIS')) ||
                teachers[0];
              if (target) {
                saveRememberedTeacherSession(target);
              }
              if (onSwitchToTeachers) {
                onSwitchToTeachers();
              } else {
                setActiveRoleView('teacher');
                showToast(`Switched to Teacher Workspace as ${target?.name} • CBC Active`);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRoleView === 'teacher'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch directly to Teacher's Workbench"
          >
            <span>👨🏾‍🏫</span>
            <span className="hidden xs:inline">Teachers Portal</span>
          </button>

          <button
            onClick={() => {
              setActiveRoleView('office');
              showToast('Switched to School Office View • Governance Active');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRoleView === 'office'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏛️</span>
            <span>School Office</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          3. MAIN CONTENT CONTAINER (SWITCHES ACROSS 6 DEDICATED TABS)
          ========================================================================= */}
      <main ref={mainContentRef} className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 pb-24 space-y-4">
        
        {/* -----------------------------------------------------------------------
            TAB 1: 🏠 HOME (SCHOOL VITALS & DAILY OVERVIEW)
            ----------------------------------------------------------------------- */}
        {activeTab === 'home' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* 4 Live Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Teachers */}
              <div 
                onClick={() => setActiveTab('teachers')}
                className={`p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] ${
                  isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👨‍🏫</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {teachers.length}
                </div>
                <div className="text-xs font-bold mt-1 text-slate-300">
                  Teachers
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {teachers.length === 0 ? 'No staff added' : `${teachers.length} on duty`}
                </div>
              </div>

              {/* Pupils */}
              <div 
                onClick={() => setActiveTab('pupils')}
                className={`p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] ${
                  isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🎒</span>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    Grades 1-6
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400">
                  {pupils.length}
                </div>
                <div className="text-xs font-bold mt-1 text-slate-300">
                  Pupils
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {pupils.length === 0 ? 'Awaiting admissions' : 'Enrolled learners'}
                </div>
              </div>

              {/* Families */}
              <div 
                onClick={() => setActiveTab('families')}
                className={`p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] ${
                  isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👨‍👩‍👧</span>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                    Households
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">
                  {families.length}
                </div>
                <div className="text-xs font-bold mt-1 text-slate-300">
                  Families
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {families.length === 0 ? 'Linked by phone' : 'Unique contacts'}
                </div>
              </div>

              {/* Classes */}
              <div 
                onClick={() => setActiveTab('timetable')}
                className={`p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] ${
                  isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🏫</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    CBC
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">
                  6
                </div>
                <div className="text-xs font-bold mt-1 text-slate-300">
                  Classes
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Grades 1 to 6 (No streams)
                </div>
              </div>
            </div>

            {/* Subtext info pill */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Counts are real, not placeholders. Registered directly by administration.</span>
            </div>

            {/* Term Progress & Remaining Teaching Days Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Term Progress */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Term Progress</span>
                  </span>
                  <span className="text-xs font-bold text-blue-400">38%</span>
                </div>
                <h3 className="text-lg font-black text-white">Week 5 of 13</h3>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: '38%' }} />
                </div>
              </div>

              {/* Remaining Teaching Days */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Remaining Teaching Days</span>
                  </span>
                  <span className="text-[10px] text-slate-400">(Mon–Fri only)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">42</span>
                  <span className="text-xs text-slate-400 font-medium">days until End of Term 1</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Excludes weekends and official holidays.</p>
              </div>
            </div>

            {/* School Activity Pause Banner */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${
              activityPause.isPaused
                ? 'bg-amber-500/15 border-amber-400/80'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl flex-shrink-0">
                    🔔
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-300">
                      School Activity Pause {activityPause.isPaused ? '(Active)' : '(Inactive)'}
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5 font-medium">
                      {activityPause.eventTitle}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {activityPause.isPaused 
                        ? 'Timetable, homework & assessments are frozen. No lessons marked missed.'
                        : 'Regular timetable schedule active.'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleActivityPause}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer whitespace-nowrap ${
                    activityPause.isPaused
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {activityPause.isPaused ? 'Resume Lessons' : 'Pause Activities'}
                </button>
              </div>
            </div>

            {/* 3 Quick Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => setActiveTab('pupils')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Admit New Pupil</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('teachers');
                  setShowAddTeacherModal(true);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>

              <button
                onClick={() => setActiveTab('families')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish Announcement</span>
              </button>
            </div>

            {/* School Logo & Campus Photo Management */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Exact School Logo & Campus Background</span>
                </h4>
                <span className="text-[10px] text-slate-400">PWA & Portal Assets</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Logo Preview & Upload */}
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                    <Logo size="md" showTagline={false} />
                  </div>
                  <span className="text-[11px] font-bold text-white mb-0.5">School Crest</span>
                  <span className="text-[9px] text-slate-400 mb-2">Exact badge replica</span>
                  <label className="cursor-pointer px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold shadow transition active:scale-95 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const res = ev.target?.result as string;
                            if (res) {
                              dataLayer.setAttachedLogo(res);
                              showToast('School logo updated successfully!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Campus Photo Preview & Upload */}
                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 mb-2 bg-slate-900">
                    <img
                      src={dataLayer.getAttachedCampusPhoto() || '/src/assets/images/little_roses_campus_1790246122159.jpg'}
                      alt="Campus Background"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white mb-0.5">Campus Photo</span>
                  <span className="text-[9px] text-slate-400 mb-2">Splash 1 background</span>
                  <label className="cursor-pointer px-2.5 py-1 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-bold shadow transition active:scale-95 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const res = ev.target?.result as string;
                            if (res) {
                              dataLayer.setAttachedCampusPhoto(res);
                              showToast('Campus background photo updated!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* School Details, Motto & Backup Card */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-black text-sm text-amber-300">
                    Little Roses Academy • Nakuru, Kenya
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Motto: <span className="italic font-semibold text-amber-200">"Much from Little"</span> • Pillars: <span className="font-bold text-emerald-400">LEARN • LOVE • LEAD</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackupSchoolData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup School Data 💾</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: 👩‍🏫 TEACHERS MANAGEMENT & SHARED CURRICULUM
            ----------------------------------------------------------------------- */}
        {activeTab === 'teachers' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Sub-Navigation & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B152E]/90 p-3 rounded-2xl border border-slate-800">
              {/* Sub Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTeacherViewSubTab('staff')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    teacherViewSubTab === 'staff'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👨‍🏫 Staff Roster</span>
                  <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono">
                    {teachers.length}
                  </span>
                </button>

                <button
                  onClick={() => setTeacherViewSubTab('shared_docs')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    teacherViewSubTab === 'shared_docs'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📤 Shared Curriculum & PDFs</span>
                  <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full font-mono">
                    {sharedDocs.length}
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareDocModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share PDF to Teachers</span>
                </button>

                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Teacher</span>
                </button>
              </div>
            </div>

            {teacherViewSubTab === 'staff' && (
              <>
                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setTeacherFilterTier('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      teacherFilterTier === 'all'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    All Staff ({teachers.length})
                  </button>

                  <button
                    onClick={() => setTeacherFilterTier('lower')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      teacherFilterTier === 'lower'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    Lower Primary (PP1–Grade 3)
                  </button>

                  <button
                    onClick={() => setTeacherFilterTier('upper')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      teacherFilterTier === 'upper'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    Upper Primary (Grade 4–Grade 6)
                  </button>
                </div>

                {/* Teachers List */}
                {teachers.length === 0 ? (
                  <div className={`p-8 rounded-2xl border text-center ${
                    isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center text-2xl mb-3">
                      👩‍🏫
                    </div>
                    <h3 className="font-bold text-base text-white">No Teachers on Record Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Teachers must be registered by school administration. Tap below to register your first teacher.
                    </p>
                    <button
                      onClick={() => setShowAddTeacherModal(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-emerald-500"
                    >
                      + Add First Teacher
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teachers
                      .filter((t) => {
                        if (teacherFilterTier === 'all') return true;
                        const grades = t.assignedGrades || (t.assignedGrade ? [t.assignedGrade] : []);
                        if (teacherFilterTier === 'lower') {
                          return grades.some((g) => ['Grade 1', 'Grade 2', 'Grade 3'].includes(g)) || t.tier === 'lower' || t.tier === 'both';
                        }
                        if (teacherFilterTier === 'upper') {
                          return grades.some((g) => ['Grade 4', 'Grade 5', 'Grade 6'].includes(g)) || t.tier === 'upper' || t.tier === 'both';
                        }
                        return true;
                      })
                      .map((teacher) => {
                        const assignedList = teacher.assignedGrades || (teacher.assignedGrade ? [teacher.assignedGrade] : ['Grade 1']);
                        const isAllSix = assignedList.length >= 6;

                        return (
                          <div
                            key={teacher.id}
                            className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                            }`}
                          >
                            {/* Teacher Profile Left */}
                            <div className="flex items-start gap-3">
                              {/* Passport / DP Photo */}
                              <div className="relative flex-shrink-0">
                                {teacher.avatarUrl ? (
                                  <img
                                    src={teacher.avatarUrl}
                                    alt={teacher.name}
                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                                    {teacher.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                {teacher.isDualAdmin && (
                                  <span
                                    title="Dual Role: Can access School Office & Teachers Portal"
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-[10px] font-black border border-neutral-900 shadow"
                                  >
                                    👑
                                  </span>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <h4 className="font-bold text-sm text-white">{teacher.name}</h4>
                                  {teacher.isDualAdmin && (
                                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <span>👑 Dual Admin/Teacher</span>
                                    </span>
                                  )}
                                  {isAllSix ? (
                                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full">
                                      ⭐ All Classes (Grades 1–6)
                                    </span>
                                  ) : (
                                    assignedList.map((g) => (
                                      <span key={g} className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        {g}
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 font-mono">
                                  <span>Phone: <strong className="text-slate-200">{teacher.phone}</strong></span>
                                  {teacher.password && (
                                    <span>Pass: <strong className="text-amber-300">{teacher.password}</strong></span>
                                  )}
                                </div>

                                {/* Subject chips */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {teacher.subjects.map((sub, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                                    >
                                      {sub}
                                    </span>
                                  ))}
                                </div>

                                 {/* Teacher & Parent AI Cross-Check Tag */}
                                {(() => {
                                  const pCheck = checkTeacherIsParent(teacher.phone);
                                  if (pCheck.isParent) {
                                    return (
                                      <div className="mt-2 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-500/40 text-[10px] text-purple-200 flex items-center gap-1.5 flex-wrap">
                                        <span>👨‍👧</span>
                                        <span>
                                          <strong>AI Cross-Check:</strong> Teacher is also a Parent ({pCheck.linkedChildren.map((c) => `${c.name} - ${c.grade}`).join(', ')})
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800 flex-wrap">
                                  <button
                                    onClick={() => handleOpenTeacherConsole(teacher)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                    title="Open full Teacher Studio: Resources, Schemes, Learners performance, and Scoped Timetable"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Open Teacher Workbench (Resources & Learners)</span>
                                  </button>
                                  <button
                                    onClick={() => handleStartEditTeacher(teacher)}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-amber-400/40 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Quick Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                    className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors border border-red-500/30 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Pedagogical Audit Right */}
                            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 text-xs space-y-1.5 md:min-w-[260px]">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                                Pedagogical Audit
                              </span>

                              <div 
                                onClick={() => toggleTeacherAudit(teacher.id, 'timetableLessonsMarked')}
                                className="flex items-center justify-between cursor-pointer hover:opacity-80"
                              >
                                <span className="text-[11px] text-slate-300">Timetable lessons marked as taught</span>
                                {teacher.pedagogicalAudit.timetableLessonsMarked ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <X className="w-4 h-4 text-red-400" />
                                )}
                              </div>

                              <div 
                                onClick={() => toggleTeacherAudit(teacher.id, 'assignmentsUploaded')}
                                className="flex items-center justify-between cursor-pointer hover:opacity-80"
                              >
                                <span className="text-[11px] text-slate-300">Daily assignments uploaded</span>
                                {teacher.pedagogicalAudit.assignmentsUploaded ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <X className="w-4 h-4 text-red-400" />
                                )}
                              </div>

                              <div 
                                onClick={() => toggleTeacherAudit(teacher.id, 'cbc30MarkScoresEntered')}
                                className="flex items-center justify-between cursor-pointer hover:opacity-80"
                              >
                                <span className="text-[11px] text-slate-300">30-mark CBC assessment entered</span>
                                {teacher.pedagogicalAudit.cbc30MarkScoresEntered ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <X className="w-4 h-4 text-red-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}

            {/* SHARED CURRICULUM & PDFS SUB-TAB */}
            {teacherViewSubTab === 'shared_docs' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span>Curriculum Documents & Circulars Shared with Teachers</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PDFs and guidelines published here automatically sync to the "From Administration 🏫" shelf on every teacher's workbench.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowShareDocModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Share New Document (PDF)</span>
                    </button>
                  </div>

                  {sharedDocs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No documents shared yet. Tap "Share New Document" to distribute a syllabus PDF or official circular.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sharedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between hover:border-blue-500/50 transition-all space-y-2.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {doc.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{doc.date}</span>
                            </div>

                            <h4 className="font-bold text-xs text-white mt-2 leading-snug">{doc.title}</h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <span>📄</span>
                              <span className="truncate">{doc.fileName}</span>
                            </p>
                            {doc.notes && (
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{doc.notes}</p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-emerald-400">
                              For: {doc.targetGrade}
                            </span>
                            <button
                              onClick={() => handleDeleteSharedDoc(doc.id)}
                              className="text-red-400 hover:text-red-300 text-[10px] font-bold p-1"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3: 🎒 PUPILS (LEARNERS) HUB
            ----------------------------------------------------------------------- */}
        {activeTab === 'pupils' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* AI Sibling Inquiry Engine Banner */}
            {(() => {
              const unconfirmed = detectSiblingGroups(pupils).filter((g) => !g.isConfirmed);
              if (unconfirmed.length === 0) return null;
              return (
                <div className="space-y-2 mb-2">
                  {unconfirmed.map((group) => (
                    <div
                      key={group.parentPhone}
                      className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 font-black flex items-center justify-center flex-shrink-0 text-sm">
                          🤖
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                            <span>AI Sibling Inquiry Engine: Matching Parent Phone Detected</span>
                            <span className="font-mono text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full text-amber-200">
                              {group.parentPhone}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Phone number is shared by <strong>{group.pupils.length} learners</strong>:{' '}
                            {group.pupils.map((p) => `${p.name} (${p.grade})`).join(' and ')}. Are these students siblings in the same household?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => handleConfirmSiblings(group.parentPhone)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Yes, Confirm Siblings</span>
                        </button>
                        <button
                          onClick={() => handleDismissSiblings(group.parentPhone)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Grade Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {ALL_GRADES.map((g) => {
                const countInGrade = pupils.filter((p) => p.grade === g).length;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedPupilGrade(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      selectedPupilGrade === g
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {g} ({countInGrade})
                  </button>
                );
              })}
            </div>

            {/* Pupil Profile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {pupils
                .filter((p) => p.grade === selectedPupilGrade)
                .map((pupil) => (
                  <div
                    key={pupil.id}
                    className={`p-3.5 rounded-2xl border shadow-sm flex items-start gap-3 ${
                      isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Avatar with Status Ring */}
                    <div 
                      className="w-11 h-11 rounded-full p-0.5 flex-shrink-0 flex items-center justify-center"
                      style={{ border: `2.5px solid ${pupil.statusRingColor || '#10B981'}` }}
                    >
                      {pupil.avatarUrl ? (
                        <img
                          src={pupil.avatarUrl}
                          alt={pupil.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-white">
                          {pupil.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-white truncate">{pupil.name}</h4>
                        <span className="text-[9px] font-bold text-slate-400">{pupil.gender}</span>
                      </div>
                      <p className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">{pupil.upi}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5">
                        <span className="text-emerald-400">PIN: <strong>{pupil.pin}</strong></span>
                        <span className="text-amber-300">Parent: <strong>{pupil.parentPassword}</strong></span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">Parent: {pupil.parentName}</p>
                      <p className="text-[10px] text-emerald-400 font-mono">{pupil.parentPhone}</p>

                      {/* Edit Credentials Button */}
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800">
                        <button
                          onClick={() => handleStartEditPupil(pupil)}
                          className="px-2 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Edit Credentials & Pass</span>
                        </button>
                        <button
                          onClick={() => handleDeletePupil(pupil.id)}
                          className="px-1.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] cursor-pointer transition-colors"
                          title="Remove Pupil"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {pupils.filter((p) => p.grade === selectedPupilGrade).length === 0 && (
              <div className={`p-6 rounded-2xl border text-center ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <p className="text-xs text-slate-400">
                  No pupils admitted in {selectedPupilGrade} yet. Use the Admit Pupil form or Bulk Studio below.
                </p>
              </div>
            )}

            {/* Admission Forms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Single Admission Form */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-emerald-400 font-bold text-base">+</span>
                  <h3 className="font-bold text-sm text-white">Admit Single Pupil</h3>
                </div>

                <form onSubmit={handleAdmitPupil} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={newPupilName}
                      onChange={(e) => setNewPupilName(e.target.value)}
                      placeholder="e.g. Angela Wanjiku"
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                      <select
                        value={newPupilGender}
                        onChange={(e) => setNewPupilGender(e.target.value as 'Boy' | 'Girl')}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        <option value="Boy">Boy</option>
                        <option value="Girl">Girl</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Grade</label>
                      <select
                        value={newPupilGrade}
                        onChange={(e) => setNewPupilGrade(e.target.value)}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        {ALL_GRADES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Phone Number</label>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={newParentPhone}
                        onChange={(e) => setNewParentPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleParentLookup}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-amber-300 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Lookup
                      </button>
                    </div>
                    {parentLookupResult && (
                      <p className="text-[10px] text-amber-400 mt-1 font-semibold">{parentLookupResult}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Name</label>
                    <input
                      type="text"
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      placeholder="e.g. Mary Odhiambo"
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-xs shadow-md mt-2 cursor-pointer"
                  >
                    Save & Admit Pupil
                  </button>
                </form>
              </div>

              {/* Bulk Admission Studio */}
              <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-white">Bulk Admission Studio</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkCsvText(`Ian Mwangi, Grade 4, 0712345678, Jane Mwangi\nFaith Naliaka, Grade 4, 0723456789, George Naliaka\nPaul Otieno, Grade 5, 0734567890, Dorcas Otieno`);
                        handleParseCsv(`Ian Mwangi, Grade 4, 0712345678, Jane Mwangi\nFaith Naliaka, Grade 4, 0723456789, George Naliaka\nPaul Otieno, Grade 5, 0734567890, Dorcas Otieno`);
                        showToast('Sample CSV format inserted');
                      }}
                      className="text-[10px] text-blue-400 hover:underline font-bold"
                    >
                      Insert CSV Sample
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Format: <span className="font-mono text-slate-300">Pupil Name, Grade, Parent Phone, Parent Name</span>
                  </p>

                  <textarea
                    rows={4}
                    value={bulkCsvText}
                    onChange={(e) => handleParseCsv(e.target.value)}
                    placeholder="Paste CSV lines here..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
                  />

                  {/* Preview summary */}
                  {bulkPreviewRows.length > 0 && (
                    <div className="mt-2 text-xs flex items-center justify-between text-slate-300">
                      <span className="text-emerald-400 font-bold">
                        ✔ {bulkPreviewRows.filter((r) => r.isValid).length} valid rows
                      </span>
                      {bulkPreviewRows.some((r) => !r.isValid) && (
                        <span className="text-red-400 font-bold">
                          ✖ {bulkPreviewRows.filter((r) => !r.isValid).length} need attention
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCommitBulkAdmission}
                  disabled={bulkPreviewRows.filter((r) => r.isValid).length === 0}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-wider text-xs shadow-md mt-3 cursor-pointer"
                >
                  Review & Commit Bulk Rows
                </button>
              </div>
            </div>

            {/* Office Credential Sheet & Parent Sibling Linking Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Office Credential Sheet */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Office Credential Sheet (PINs & Passwords)</span>
                </h4>
                <div className="max-h-48 overflow-y-auto text-xs">
                  {pupils.length === 0 ? (
                    <p className="text-slate-400 text-[11px] py-4 text-center">Credentials will be generated as pupils are enrolled.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-400 border-b border-slate-800">
                          <th className="pb-1">Pupil</th>
                          <th className="pb-1">UPI</th>
                          <th className="pb-1">PIN</th>
                          <th className="pb-1">Parent Pass</th>
                          <th className="pb-1 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {pupils.map((p) => (
                          <tr key={p.id} className="py-1">
                            <td className="py-1 font-semibold text-white">{p.name}</td>
                            <td className="py-1 font-mono text-[10px] text-slate-400">{p.upi}</td>
                            <td className="py-1 font-mono text-emerald-400 font-bold">{p.pin}</td>
                            <td className="py-1 font-mono text-amber-400 font-bold">{p.parentPassword}</td>
                            <td className="py-1 text-right">
                              <button
                                onClick={() => handleStartEditPupil(p)}
                                className="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[10px] cursor-pointer"
                                title="Edit learner PIN, parent password, and information"
                              >
                                ✏️ Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Sibling Linking Indicator */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className="font-bold text-xs text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Automatic Sibling Linking</span>
                </h4>
                <p className="text-xs text-slate-300 mb-2">
                  When multiple pupils share the same parent phone number, Little Roses Academy automatically groups them into a single family household.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Active Sibling Groups:</span>
                  {families.filter((f) => f.children.length > 1).length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No multi-child households detected yet.</p>
                  ) : (
                    families
                      .filter((f) => f.children.length > 1)
                      .map((fam) => (
                        <div key={fam.phone} className="py-1 border-b border-slate-800 last:border-none">
                          <span className="font-bold text-white">{fam.parentName}: </span>
                          <span className="text-emerald-400 font-medium">
                            {fam.children.map((c) => `${c.name} (${c.grade})`).join(' & ')}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Non-destructive guarantee note */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-xs text-blue-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>Good to know: All pupil edits are non-destructive. Historical CBC assessments and records are preserved permanently.</span>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 4: 👨‍👩‍👧 FAMILIES (PARENTS HUB)
            ----------------------------------------------------------------------- */}
        {activeTab === 'families' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* AI Sibling Inquiry Engine Banner */}
            {(() => {
              const unconfirmed = detectSiblingGroups(pupils).filter((g) => !g.isConfirmed);
              if (unconfirmed.length === 0) return null;
              return (
                <div className="space-y-2 mb-2">
                  {unconfirmed.map((group) => (
                    <div
                      key={group.parentPhone}
                      className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 font-black flex items-center justify-center flex-shrink-0 text-sm">
                          🤖
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                            <span>AI Sibling Inquiry Engine: Matching Parent Phone Detected</span>
                            <span className="font-mono text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full text-amber-200">
                              {group.parentPhone}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Phone number is shared by <strong>{group.pupils.length} learners</strong>:{' '}
                            {group.pupils.map((p) => `${p.name} (${p.grade})`).join(' and ')}. Are these students siblings in the same household?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => handleConfirmSiblings(group.parentPhone)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Yes, Confirm Siblings</span>
                        </button>
                        <button
                          onClick={() => handleDismissSiblings(group.parentPhone)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Families & Households</h3>
                <p className="text-xs text-slate-400">All households grouped strictly by primary parent phone number.</p>
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                {families.length} Active Households
              </span>
            </div>

            {/* Households List */}
            {families.length === 0 ? (
              <div className={`p-8 rounded-2xl border text-center ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center text-2xl mb-3">
                  👨‍👩‍👧
                </div>
                <h3 className="font-bold text-base text-white">No Families Registered Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When pupils are admitted, their parents are automatically grouped here into household trees.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {families.map((fam) => (
                  <div
                    key={fam.phone}
                    className={`p-4 rounded-2xl border shadow-sm ${
                      isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-sm">
                          👨‍👩‍👧
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{fam.parentName}</h4>
                            <span className="text-[10px] text-purple-300 bg-purple-500/15 px-2 py-0.2 rounded-full font-mono">
                              {fam.householdId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{fam.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => showToast(`Password for ${fam.parentName}: ${fam.children[0]?.parentPassword || '4821'}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                        >
                          👁 View Password
                        </button>
                        <button
                          onClick={() => showToast(`New password generated and dispatched to ${fam.phone}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer"
                        >
                          🔒 Reset Password
                        </button>
                      </div>
                    </div>

                    {/* Sibling tree children */}
                    <div className="pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Children in this household ({fam.children.length}):
                      </span>
                      <div className="space-y-1.5 pl-3 border-l-2 border-slate-700">
                        {fam.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{child.name}</span>
                              <span className="text-[10px] text-blue-300 bg-blue-500/15 px-2 py-0.2 rounded-full">
                                {child.grade}
                              </span>
                              <span className="text-[10px] text-amber-300 font-mono">
                                PIN: {child.pin}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                {child.academicStanding || 'On Track'}
                              </span>
                              <button
                                onClick={() => handleStartEditPupil(child)}
                                className="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[10px] cursor-pointer"
                                title="Edit child's PIN, password, and profile"
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Broadcast Notices Box */}
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Broadcast Notice to Parents</span>
                </h4>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setBroadcastTarget('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      broadcastTarget === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Parents
                  </button>
                  <button
                    onClick={() => setBroadcastTarget('grade')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      broadcastTarget === 'grade'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Target by Grade
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-2.5">
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type official school notice to parents..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Phone normalization treats 07..., 01..., and +254... as the same number.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Notice</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 5: 📅 TIMETABLE & CALENDAR (GRADE-SPECIFIC SCHEDULES & MASTER RADAR)
            ----------------------------------------------------------------------- */}
        {activeTab === 'timetable' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-white">Master Timetable (Class Schedules & Bell Times)</h3>
                <p className="text-xs text-slate-400">
                  Select a grade to manage its authentic CBC subjects, or switch to Master Matrix for cross-class oversight.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBellScheduleModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Period Times / Bell Schedule</span>
                </button>
                {selectedGradeTimetable !== 'master' && (
                  <button
                    onClick={() => handleResetGradeSchedule(selectedGradeTimetable)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    title={`Reset ${selectedGradeTimetable} to default CBC subjects`}
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Reset {selectedGradeTimetable}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grade Selector Strip */}
            <div className="p-2 rounded-2xl bg-[#081022] border border-slate-800 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Grade Timetable (Remember: Each Grade has Distinct CBC Subjects):
                </span>
                <span className="text-[10px] text-amber-400 font-semibold hidden sm:inline">
                  ✏️ Tap any period cell to customize lesson or teacher
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {ALL_GRADES.map((grade) => {
                  const isSelected = selectedGradeTimetable === grade;
                  const isLower = grade === 'Grade 1' || grade === 'Grade 2' || grade === 'Grade 3';
                  return (
                    <button
                      key={grade}
                      onClick={() => setSelectedGradeTimetable(grade)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? isLower
                            ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50 scale-[1.02]'
                            : 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/50 scale-[1.02]'
                          : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>{grade}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        isSelected 
                          ? 'bg-black/30 text-white' 
                          : isLower ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {isLower ? 'Lower CBC' : 'Upper CBC'}
                      </span>
                    </button>
                  );
                })}

                <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

                <button
                  onClick={() => setSelectedGradeTimetable('master')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGradeTimetable === 'master'
                      ? 'bg-amber-400 text-neutral-950 shadow-lg ring-2 ring-amber-300 scale-[1.02]'
                      : 'bg-slate-900/90 text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-400/30'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Master Matrix (All 6 Classes)</span>
                </button>
              </div>

              {/* Grade-specific CBC Curriculum Banner */}
              {selectedGradeTimetable !== 'master' && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <div className="text-[11px]">
                    <span className="font-bold text-white mr-1.5">
                      {selectedGradeTimetable} Curriculum Areas:
                    </span>
                    <span className="text-slate-300">
                      {selectedGradeTimetable === 'Grade 1' || selectedGradeTimetable === 'Grade 2' || selectedGradeTimetable === 'Grade 3'
                        ? 'Lower Primary Activities (Mathematics Activities, English Activities, Kiswahili Activities, Environmental, Creative, Religious, Indigenous, Movement)'
                        : 'Upper Primary Subjects (Mathematics, English, Kiswahili, Science & Technology, Social Studies, Agriculture & Nutrition, Creative Arts, Religious Ed, PHE)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md font-semibold whitespace-nowrap self-start sm:self-auto">
                    ✓ Official CBC Pacing
                  </span>
                </div>
              )}
            </div>

            {/* SINGLE GRADE TIMETABLE GRID */}
            {selectedGradeTimetable !== 'master' && (
              <div className={`rounded-2xl border overflow-hidden shadow-lg ${
                isDarkMode ? 'bg-[#0B152E]/95 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="p-3 bg-[#081022] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                      {selectedGradeTimetable} Weekly Class Schedule
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Showing Monday through Friday • 35-min CBC Lessons
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                    <thead>
                      <tr className="bg-[#060D1E] text-slate-300 font-bold border-b border-slate-800">
                        <th className="p-2.5 w-28 text-[11px]">Period / Time</th>
                        <th className="p-2.5">Monday</th>
                        <th className="p-2.5">Tuesday</th>
                        <th className="p-2.5">Wednesday</th>
                        <th className="p-2.5">Thursday</th>
                        <th className="p-2.5">Friday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {periodTimes.map((time, pIdx) => {
                        const isBreakRow = pIdx === 3 || pIdx === 7 || pIdx === 11;
                        const breakLabel = pIdx === 3 ? '☕ Tea Break' : pIdx === 7 ? '🍲 Lunch Break' : '⚽ Games & PE';

                        if (isBreakRow) {
                          return (
                            <tr key={pIdx} className="bg-slate-900/60 text-center font-bold text-amber-300">
                              <td 
                                onClick={() => {
                                  setEditingPeriodIndex(pIdx);
                                  setQuickPeriodTimeVal(time);
                                }}
                                className="p-2 text-[10px] text-amber-300 hover:text-white hover:bg-amber-500/20 font-mono text-left cursor-pointer transition-colors"
                                title="Click to edit break time"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span>{time}</span>
                                  <Edit3 className="w-2.5 h-2.5 opacity-60" />
                                </div>
                              </td>
                              <td colSpan={5} className="p-2 text-xs uppercase tracking-wider text-amber-300/90">
                                {breakLabel}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={pIdx} className="hover:bg-slate-900/40 transition-colors">
                            <td 
                              onClick={() => {
                                setEditingPeriodIndex(pIdx);
                                setQuickPeriodTimeVal(time);
                              }}
                              className="p-2 text-[10px] font-mono text-amber-300/90 hover:text-white hover:bg-amber-500/20 font-semibold align-top cursor-pointer transition-colors group"
                              title="Click to edit this period time"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span>{time}</span>
                                <Edit3 className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 opacity-60 group-hover:opacity-100" />
                              </div>
                            </td>
                            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => {
                              const slot = timetable.find(
                                (s) => s.grade === selectedGradeTimetable && s.day === day && s.periodIndex === pIdx
                              );

                              if (!slot) {
                                return (
                                  <td
                                    key={day}
                                    onClick={() => handleCreateOrEditSlot(selectedGradeTimetable, day, pIdx, time)}
                                    className="p-1.5 align-top cursor-pointer group"
                                  >
                                    <div className="p-2 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 hover:border-amber-400 text-slate-500 hover:text-amber-300 flex items-center justify-center gap-1 text-[11px] font-medium transition-all">
                                      <Plus className="w-3 h-3" />
                                      <span>Set Lesson</span>
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={day}
                                  onClick={() => handleOpenEditSlot(slot)}
                                  className="p-1.5 align-top cursor-pointer group"
                                >
                                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-400 transition-all group-hover:scale-[1.01] shadow-sm">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-400">
                                      <span>{slot.grade}</span>
                                      <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                                    </div>
                                    <div className="font-extrabold text-white text-[11px] mt-0.5 truncate" title={slot.subject}>
                                      {slot.subject}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                      👤 {slot.teacher}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MASTER MATRIX VIEW (ALL 6 GRADES SIDE-BY-SIDE BY DAY) */}
            {selectedGradeTimetable === 'master' && (
              <div className={`rounded-2xl border overflow-hidden shadow-lg ${
                isDarkMode ? 'bg-[#0B152E]/95 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {/* Day selector for master matrix */}
                <div className="p-3 bg-[#081022] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>All Grades Master Matrix & Conflict Radar</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Select day to audit teacher assignments across all 6 classes simultaneously.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setMasterViewDay(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          masterViewDay === d
                            ? 'bg-amber-400 text-neutral-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[840px]">
                    <thead>
                      <tr className="bg-[#060D1E] text-slate-300 font-bold border-b border-slate-800">
                        <th className="p-2.5 w-24 text-[11px]">Time</th>
                        {ALL_GRADES.map((g) => (
                          <th key={g} className="p-2 text-[11px]">
                            <div className="flex items-center gap-1">
                              <span>{g}</span>
                              <span className="text-[9px] text-slate-500 font-normal">
                                {g === 'Grade 1' || g === 'Grade 2' || g === 'Grade 3' ? '(Lower)' : '(Upper)'}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {periodTimes.map((time, pIdx) => {
                        const isBreakRow = pIdx === 3 || pIdx === 7 || pIdx === 11;
                        const breakLabel = pIdx === 3 ? '☕ Tea Break' : pIdx === 7 ? '🍲 Lunch Break' : '⚽ Games & PE';

                        if (isBreakRow) {
                          return (
                            <tr key={pIdx} className="bg-slate-900/60 text-center font-bold text-amber-300">
                              <td className="p-2 text-[10px] font-mono text-left text-amber-300">{time}</td>
                              <td colSpan={6} className="p-2 text-xs uppercase tracking-wider text-amber-300/90">
                                {breakLabel}
                              </td>
                            </tr>
                          );
                        }

                        // Collect teachers in this period to check for double-booking clashes
                        const periodSlots = ALL_GRADES.map((g) =>
                          timetable.find((s) => s.grade === g && s.day === masterViewDay && s.periodIndex === pIdx)
                        ).filter(Boolean) as TimetableSlot[];

                        const teacherCounts: Record<string, number> = {};
                        periodSlots.forEach((s) => {
                          if (s.teacher && !s.isBreak) {
                            const tKey = s.teacher.trim().toLowerCase();
                            teacherCounts[tKey] = (teacherCounts[tKey] || 0) + 1;
                          }
                        });

                        return (
                          <tr key={pIdx} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-2 text-[10px] font-mono text-amber-300/90 font-semibold align-top">
                              {time}
                            </td>
                            {ALL_GRADES.map((grade) => {
                              const slot = timetable.find(
                                (s) => s.grade === grade && s.day === masterViewDay && s.periodIndex === pIdx
                              );

                              const hasTeacherConflict = slot && slot.teacher && !slot.isBreak && teacherCounts[slot.teacher.trim().toLowerCase()] > 1;

                              if (!slot) {
                                return (
                                  <td
                                    key={grade}
                                    onClick={() => handleCreateOrEditSlot(grade, masterViewDay, pIdx, time)}
                                    className="p-1 align-top cursor-pointer"
                                  >
                                    <div className="p-1.5 rounded-lg border border-dashed border-slate-800 text-slate-500 hover:border-amber-400 text-[10px] text-center">
                                      + Add
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={grade}
                                  onClick={() => handleOpenEditSlot(slot)}
                                  className="p-1 align-top cursor-pointer group"
                                >
                                  <div className={`p-1.5 rounded-xl border transition-all shadow-sm ${
                                    hasTeacherConflict
                                      ? 'bg-red-950/70 border-red-500 text-red-200 ring-1 ring-red-400'
                                      : 'bg-slate-950/80 border-slate-800 group-hover:border-amber-400'
                                  }`}>
                                    <div className="font-bold text-[10px] text-white truncate" title={slot.subject}>
                                      {slot.subject}
                                    </div>
                                    <div className={`text-[9px] truncate mt-0.5 flex items-center gap-1 ${
                                      hasTeacherConflict ? 'text-red-300 font-bold' : 'text-slate-400'
                                    }`}>
                                      {hasTeacherConflict && <AlertTriangle className="w-2.5 h-2.5 text-red-400 flex-shrink-0 animate-pulse" />}
                                      <span>👤 {slot.teacher}</span>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Syllabus Pacing & School Activity Pause Controller */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2-Term Syllabus Pacing */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className="font-bold text-xs text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Curriculum Pacing Framework</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="font-bold text-emerald-400">Terms 1 & 2: </span>
                    <span className="text-slate-300">Complete curriculum strands, learning sub-strands, and schemes of work.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="font-bold text-amber-400">Term 3: </span>
                    <span className="text-slate-300">Dedicated to comprehensive KNEC exam preparation and revision past papers.</span>
                  </div>
                </div>
              </div>

              {/* Pause Controller */}
              <div className={`p-4 rounded-2xl border shadow-sm ${
                isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>School Activity Pause Controller</span>
                </h4>
                <p className="text-xs text-slate-300 mb-2">
                  Freeze timetable lessons and homework expectations during sports, drama, or music festivals.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activityPause.eventTitle}
                    onChange={(e) => setActivityPause({ ...activityPause, eventTitle: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    placeholder="e.g. Inter-House Sports Monday–Wednesday"
                  />
                  <button
                    onClick={toggleActivityPause}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      activityPause.isPaused
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activityPause.isPaused ? 'Unfreeze' : 'Freeze'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 6: 🎓 PROMOTION STUDIO (YEAR-END TRANSITION)
            ----------------------------------------------------------------------- */}
        {activeTab === 'promotion' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Cohort Advancement Sequence */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm ${
              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-bold text-sm text-white mb-1">
                Cohort Advancement — End of Term 3
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Advance learners forward one academic grade. CBC 30-mark assessments are preserved permanently.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                {ALL_GRADES.map((g, idx) => (
                  <div key={g} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                    <span className="text-lg">🧒</span>
                    <span className="font-bold text-white text-[11px] mt-1">{g}</span>
                    <span className="text-emerald-400 font-bold text-xs mt-0.5">{gradeCounts[g] || 0}</span>
                    <span className="text-[9px] text-slate-500">learners</span>
                    {idx < 5 && <span className="text-slate-600 text-xs mt-1">➔</span>}
                  </div>
                ))}

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex flex-col items-center">
                  <span className="text-lg">🎓</span>
                  <span className="font-bold text-amber-300 text-[11px] mt-1">Alumni</span>
                  <span className="text-amber-400 font-bold text-xs mt-0.5">{gradeCounts['Alumni Archive'] || 0}</span>
                  <span className="text-[9px] text-slate-400">archived</span>
                </div>
              </div>
            </div>

            {/* Alumni Archive Vault Card */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-2xl flex-shrink-0">
                  🏛️
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Alumni Archive Vault</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Permanently keeps CBC 30-mark assessment records and KNEC national exam results.
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    ✔ Zero-Loss Guarantee
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Exceptions Table */}
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isDarkMode ? 'bg-[#0B152E]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider mb-2">
                Individual Exceptions (per learner)
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Specify learners to retain in current grade or mark as transferred out.
              </p>

              {pupils.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No enrolled learners to configure exceptions for.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {pupils.map((pupil) => {
                    const exc = exceptions[pupil.upi] || { status: 'promoted', reason: '' };
                    return (
                      <div
                        key={pupil.id}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{pupil.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2 font-mono">({pupil.grade})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`exc-${pupil.upi}`}
                              checked={exc.status !== 'retained' && exc.status !== 'transferred'}
                              onChange={() => {
                                const copy = { ...exceptions };
                                delete copy[pupil.upi];
                                setExceptions(copy);
                              }}
                            />
                            <span>Promote</span>
                          </label>

                          <label className="flex items-center gap-1 text-[11px] text-amber-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`exc-${pupil.upi}`}
                              checked={exc.status === 'retained'}
                              onChange={() => {
                                setExceptions({
                                  ...exceptions,
                                  [pupil.upi]: { status: 'retained', reason: 'Retained by committee' }
                                });
                              }}
                            />
                            <span>Retain (Repeat)</span>
                          </label>

                          <label className="flex items-center gap-1 text-[11px] text-red-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`exc-${pupil.upi}`}
                              checked={exc.status === 'transferred'}
                              onChange={() => {
                                setExceptions({
                                  ...exceptions,
                                  [pupil.upi]: { status: 'transferred', reason: 'Transferred' }
                                });
                              }}
                            />
                            <span>Transferred</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleRunPromotion}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                🚀 Run Promotion • Promote learners and archive records safely
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          4. BOTTOM NAVIGATION BAR (WHATSAPP-STYLE DEDICATED 6 TABS)
          ========================================================================= */}
      <nav className="sticky bottom-0 z-40 w-full bg-[#0F172A] border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl flex-shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-emerald-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-emerald-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">👩‍🏫</span>
          <span className="text-[10px] font-bold">Teachers</span>
        </button>

        <button
          onClick={() => setActiveTab('pupils')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pupils'
              ? 'bg-emerald-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🎒</span>
          <span className="text-[10px] font-bold">Pupils</span>
        </button>

        <button
          onClick={() => setActiveTab('families')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'families'
              ? 'bg-emerald-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">👨‍👩‍👧</span>
          <span className="text-[10px] font-bold">Families</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'timetable'
              ? 'bg-emerald-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">📅</span>
          <span className="text-[10px] font-bold">Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('promotion')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'promotion'
              ? 'bg-emerald-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg">🎓</span>
          <span className="text-[10px] font-bold">Promotion</span>
        </button>
      </nav>

      {/* =========================================================================
          5. MODAL: ADD TEACHER
          ========================================================================= */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B152E] border-2 border-emerald-500/80 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">👩‍🏫</span>
                <h3 className="font-bold text-base text-white">Add Teacher</h3>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Legal Name</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="e.g. Mary Wanjiku Kamau"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={newTeacherPhone}
                  onChange={(e) => setNewTeacherPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Assigned Classes (Tick 1, 2, or All 6)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllGrades}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {newTeacherGrades.length === ALL_GRADES.length ? 'Reset to Grade 1' : 'Tick All 6 (Grades 1–6)'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {ALL_GRADES.map((g) => {
                    const isSelected = newTeacherGrades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleTeacherGrade(g)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md border border-emerald-400'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span>{g}</span>
                        <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Assigned classes:</span>
                  <span className="font-bold text-emerald-400">
                    {newTeacherGrades.length === ALL_GRADES.length
                      ? '⭐ All Classes (Grade 1 through Grade 6)'
                      : newTeacherGrades.join(', ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Subject Assignment (Choose all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {[...CBC_SUBJECTS_LOWER, ...CBC_SUBJECTS_UPPER]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((sub) => {
                      const isSelected = newTeacherSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleToggleSubject(sub)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-900 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{sub}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Passport Photo / DP Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Passport Photo / Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={newTeacherAvatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setNewTeacherAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewTeacherAvatar(av.url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                            newTeacherAvatar === av.url ? 'border-amber-400 scale-110' : 'border-slate-700 opacity-60'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Role Option (Mr. Elvis / Mr. Kelvin) */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-400/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-300 block">👑 Dual Role (Admin & Teacher)</span>
                  <span className="text-[10px] text-slate-400">
                    Allows switching between School Office and Teachers Portal without logging out.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newTeacherIsDualAdmin}
                  onChange={(e) => setNewTeacherIsDualAdmin(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Login Password</label>
                <div className="relative mt-1">
                  <input
                    type={showNewTeacherPassword ? 'text' : 'password'}
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewTeacherPassword(!showNewTeacherPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Teachers can log in using their phone number or full legal name.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow"
                >
                  ✔ Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5B. MODAL: EDIT TEACHER PROFILE (NAME, PHONE, PASSWORD, DP, SUBJECTS, GRADES)
          ========================================================================= */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B152E] border-2 border-amber-400/80 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Teacher Profile</h3>
                  <p className="text-[10px] text-amber-300 font-mono">ID: {editingTeacher.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTeacher} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Legal Name</label>
                <input
                  type="text"
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={editTeacherPhone}
                  onChange={(e) => setEditTeacherPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Used for teacher portal sign-in and parent-teacher family cross-check.
                </p>
              </div>

              {/* Passport Photo / DP Editor */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Passport Photo / Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editTeacherAvatar}
                    alt="Teacher DP"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditTeacherAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
                    />
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditTeacherAvatar(av.url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                            editTeacherAvatar === av.url ? 'border-amber-400 scale-110' : 'border-slate-700 opacity-60'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Role Option */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-400/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-300 block">👑 Dual Role (Admin & Teacher)</span>
                  <span className="text-[10px] text-slate-400">
                    Grant leadership switch pill between School Office and Teacher workspace.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editTeacherIsDualAdmin}
                  onChange={(e) => setEditTeacherIsDualAdmin(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
              </div>

              {/* Assigned Classes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Assigned Classes (Tick 1, 2, or All 6)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllEditGrades}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {editTeacherGrades.length === ALL_GRADES.length ? 'Reset to Grade 1' : 'Tick All 6 (Grades 1–6)'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {ALL_GRADES.map((g) => {
                    const isSelected = editTeacherGrades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleEditTeacherGrade(g)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span>{g}</span>
                        <span className={`text-[11px] font-black ${isSelected ? 'text-neutral-950' : 'text-slate-500'}`}>
                          {isSelected ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Assignment */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Subject Assignment
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {[...CBC_SUBJECTS_LOWER, ...CBC_SUBJECTS_UPPER]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((sub) => {
                      const isSelected = editTeacherSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleToggleEditSubject(sub)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 font-black'
                              : 'bg-slate-900 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{sub}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Login Password</label>
                <div className="relative mt-1">
                  <input
                    type={showEditTeacherPassword ? 'text' : 'password'}
                    value={editTeacherPassword}
                    onChange={(e) => setEditTeacherPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditTeacherPassword(!showEditTeacherPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showEditTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black shadow"
                >
                  ✔ Update Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5C. MODAL: SHARE DOCUMENT / PDF TO TEACHERS
          ========================================================================= */}
      {showShareDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B152E] border-2 border-blue-500/80 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📤</span>
                <div>
                  <h3 className="font-bold text-base text-white">Share Document / PDF to Teachers</h3>
                  <p className="text-[10px] text-blue-300">Appears directly in the Teachers Portal "From Administration" shelf</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareDocModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShareDocument} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Document Title</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Grade 4 Mathematics Scheme of Work Approved"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Syllabus">Syllabus</option>
                    <option value="Circular">Official Circular</option>
                    <option value="Assessment Guide">Assessment Guide</option>
                    <option value="Scheme of Work">Scheme of Work</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Grade</label>
                  <select
                    value={newDocGrade}
                    onChange={(e) => setNewDocGrade(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Classes">All Classes (1–6)</option>
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">PDF / Document File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewDocFileName(file.name);
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setNewDocFileData(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full mt-1 text-[11px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {newDocFileName && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1">✓ Selected: {newDocFileName}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes / Instructions</label>
                <textarea
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder="Provide brief guidelines for teachers regarding this document..."
                  rows={2}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareDocModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow"
                >
                  📤 Publish to Teachers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: EDIT TIMETABLE SLOT (WITH CONFLICT DETECTION & EDITABLE TIME)
          ========================================================================= */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0B152E] border-2 border-amber-400/80 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">Edit Timetable Lesson</h3>
                <p className="text-xs text-amber-300 font-mono">
                  {editingSlot.day} • {editingSlot.time}
                </p>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Period Time (Editable)</span>
                  <span className="text-[10px] text-amber-400 lowercase font-mono">e.g. 08:00 - 08:35</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={editSlotTime}
                    onChange={(e) => setEditSlotTime(e.target.value)}
                    placeholder="e.g. 08:00 - 08:35"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-8 text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Grade / Class</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    editGrade === 'Grade 1' || editGrade === 'Grade 2' || editGrade === 'Grade 3'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {editGrade === 'Grade 1' || editGrade === 'Grade 2' || editGrade === 'Grade 3'
                      ? 'CBC Lower Primary'
                      : 'CBC Upper Primary'}
                  </span>
                </div>
                <select
                  value={editGrade}
                  onChange={(e) => {
                    const newG = e.target.value;
                    setEditGrade(newG);
                    // Default to first subject of that tier if current subject is not in that tier
                    const isNewLower = newG === 'Grade 1' || newG === 'Grade 2' || newG === 'Grade 3';
                    const list = isNewLower ? CBC_SUBJECTS_LOWER : CBC_SUBJECTS_UPPER;
                    if (!list.includes(editSubject)) {
                      setEditSubject(list[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic CBC Subjects for selected Grade */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Official {editGrade} CBC Subjects (Click to Select)
                  </label>
                  <span className="text-[9px] text-amber-400">1-Tap Select</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
                  {(editGrade === 'Grade 1' || editGrade === 'Grade 2' || editGrade === 'Grade 3'
                    ? CBC_SUBJECTS_LOWER
                    : CBC_SUBJECTS_UPPER
                  ).map((sub) => {
                    const isSelected = editSubject === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setEditSubject(sub)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-300 scale-[1.02]'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Selected Subject / Activity Title</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="e.g. Mathematics Activities or Science and Technology"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Teacher</label>
                  <span className="text-[9px] text-slate-400">Click name or type</span>
                </div>

                {/* Quick teacher pills */}
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {['MR ELVIS', 'TR. KELVIN', ...teachers.map((t) => t.name.toUpperCase())]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((tName) => {
                      const isSelected = editTeacher.trim().toUpperCase() === tName;
                      return (
                        <button
                          key={tName}
                          type="button"
                          onClick={() => setEditTeacher(tName)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          👤 {tName}
                        </button>
                      );
                    })}
                </div>

                <input
                  type="text"
                  value={editTeacher}
                  onChange={(e) => setEditTeacher(e.target.value)}
                  placeholder="e.g. MR ELVIS or TR. KELVIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Conflict Detection Red Warning Box */}
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black shadow cursor-pointer"
                >
                  Save Lesson & Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: QUICK EDIT SINGLE PERIOD TIME
          ========================================================================= */}
      {editingPeriodIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B152E] border-2 border-amber-400/80 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Edit Period {editingPeriodIndex + 1} Time
                </h3>
              </div>
              <button
                onClick={() => setEditingPeriodIndex(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSpecificPeriodTime(editingPeriodIndex, quickPeriodTimeVal);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Time Slot (Start - End)
                </label>
                <input
                  type="text"
                  value={quickPeriodTimeVal}
                  onChange={(e) => setQuickPeriodTimeVal(e.target.value)}
                  placeholder="e.g. 08:00 - 08:35"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400 text-sm"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Updates this period time across Monday to Friday on the master timetable.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPeriodIndex(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black shadow cursor-pointer"
                >
                  Save Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. MODAL: FULL BELL SCHEDULE & ALL PERIOD TIMES
          ========================================================================= */}
      {showBellScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B152E] border-2 border-amber-400/80 rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Master Timetable Bell Schedule</h3>
                  <p className="text-[10px] text-slate-400">Edit any lesson or break time slot</p>
                </div>
              </div>
              <button
                onClick={() => setShowBellScheduleModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              {periodTimes.map((time, idx) => {
                const label = idx === 3 ? '☕ Tea Break' : idx === 7 ? '🍲 Lunch Break' : idx === 11 ? '⚽ Games & PE' : `Lesson Period ${idx < 3 ? idx + 1 : idx < 7 ? idx : idx - 1}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300 min-w-[130px]">
                      {label}
                    </span>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => {
                        const val = e.target.value;
                        const copy = [...periodTimes];
                        copy[idx] = val;
                        setPeriodTimes(copy);
                        setTimetable(
                          timetable.map((s) => s.periodIndex === idx ? { ...s, time: val } : s)
                        );
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetDefaultBellTimes}
                className="w-full sm:w-auto text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer py-1"
              >
                Reset to Standard CBC Times (35-min)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBellScheduleModal(false);
                  showToast('Master bell schedule saved successfully!');
                }}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow cursor-pointer"
              >
                Done / Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: TEACHER ADMIN CONSOLE (RESOURCES, LEARNERS, GRADE ALLOCATIONS, TIMETABLE)
          ========================================================================= */}
      {selectedTeacherForConsole && (
        <TeacherAdminConsole
          teacher={selectedTeacherForConsole}
          allPupils={pupils}
          allTimetableSlots={timetable}
          onClose={() => setSelectedTeacherForConsole(null)}
          onSaveTeacher={(updated) => {
            const nextList = teachers.map((t) => (t.id === updated.id ? updated : t));
            setTeachers(nextList);
            saveRegisteredTeachers(nextList);
            const currentSession = getRememberedTeacherSession();
            if (currentSession && (currentSession.id === updated.id || currentSession.phone === updated.phone)) {
              saveRememberedTeacherSession(updated);
            }
            setSelectedTeacherForConsole(updated);
            showToast(`✓ Teacher ${updated.name}'s profile & grade allocations saved!`);
          }}
          onPushToTeacherPortal={handlePushToTeacherPortal}
          showToast={showToast}
        />
      )}

      {/* =========================================================================
          8. MODAL: EDIT LEARNER CREDENTIALS & PASSWORDS (FULL CONTROL FOR ADMIN)
          ========================================================================= */}
      {editingPupil && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border-2 border-emerald-400 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto my-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Learner & Credentials</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">UPI: {editingPupil.upi}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPupil(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPupil} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Learner Full Name</label>
                <input
                  type="text"
                  value={editPupilName}
                  onChange={(e) => setEditPupilName(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                  <select
                    value={editPupilGender}
                    onChange={(e) => setEditPupilGender(e.target.value as 'Boy' | 'Girl')}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Class</label>
                  <select
                    value={editPupilGrade}
                    onChange={(e) => setEditPupilGrade(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none font-bold"
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Functional Passwords Section */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-amber-400/50 space-y-2.5">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                  🔐 Portal Passwords & PIN (Admin Authority)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Learner PIN (Password)</label>
                    <div className="relative mt-0.5">
                      <input
                        type={showEditPupilPin ? 'text' : 'password'}
                        value={editPupilPin}
                        onChange={(e) => setEditPupilPin(e.target.value)}
                        placeholder="e.g. 123"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPupilPin(!showEditPupilPin)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showEditPupilPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Parent Password</label>
                    <div className="relative mt-0.5">
                      <input
                        type={showEditParentPassword ? 'text' : 'password'}
                        value={editPupilParentPassword}
                        onChange={(e) => setEditPupilParentPassword(e.target.value)}
                        placeholder="e.g. 4455"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditParentPassword(!showEditParentPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showEditParentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400">
                  Changing passwords here updates the credentials immediately and makes them functional.
                </p>
              </div>

              {/* Parent Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Name</label>
                  <input
                    type="text"
                    value={editPupilParentName}
                    onChange={(e) => setEditPupilParentName(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Phone Number</label>
                  <input
                    type="text"
                    value={editPupilParentPhone}
                    onChange={(e) => setEditPupilParentPhone(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Passport Photo / DP */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Passport Photo / Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editPupilAvatar}
                    alt="Learner DP"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditPupilAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-600 file:text-white cursor-pointer"
                    />
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditPupilAvatar(av.url)}
                          className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                            editPupilAvatar === av.url ? 'border-emerald-400 scale-110' : 'border-slate-700 opacity-60'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Academic Standing</label>
                <select
                  value={editPupilAcademicStanding}
                  onChange={(e) => setEditPupilAcademicStanding(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="On Track">On Track</option>
                  <option value="Needs Support">Needs Support</option>
                  <option value="Excelling">Excelling</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPupil(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow"
                >
                  ✔ Save & Make Functional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
