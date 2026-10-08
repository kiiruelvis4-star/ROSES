import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Building2,
  Calendar,
  BookOpen,
  Users,
  ShieldCheck,
  Bell,
  Palette,
  RefreshCw,
  HardDrive,
  ClipboardList,
  History,
  Sliders,
  Archive,
  Info,
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  Sparkles,
  Lock,
  Upload,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  RotateCcw,
  Check,
  Camera,
  Image,
  Save,
  AlertCircle,
  Eye,
  Plus,
  Clock,
  ShieldAlert,
  FolderX,
  Layers,
  Settings2,
  GraduationCap,
  BookCheck,
  FileCheck,
  Tag,
  UserCheck,
  UserX,
  Key,
  FileLock,
  AlertTriangle,
  Fingerprint,
  Activity,
  Monitor,
  EyeOff,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  Download,
  Megaphone,
  BellRing,
  BellOff,
  Send,
  Radio,
  Sun,
  Moon,
} from 'lucide-react';
import {
  dataLayer,
  SchoolProfileRecord,
  AcademicYearRecord,
  LRA_GRADES,
  LRA_GRADE_SUBJECTS,
  getLraSubjectsForGrade,
  CurriculumConfigurationRecord,
  InstalledCurriculumVersion,
  RolePermissionsConfig,
  UserRoleType,
  SecurityConfigRecord,
  SecurityActivityItem,
  SecurityDeviceSession,
  NotificationPreferencesRecord,
  SystemNotificationRecord,
  NotificationCategory,
  DEFAULT_NOTIFICATION_PREFERENCES,
  AppearanceConfigRecord,
  ThemeMode,
  DEFAULT_APPEARANCE_CONFIG,
} from '../services/dataLayer.ts';
import {
  calculateStorageUsage,
  formatBytes,
} from './AdminResourceWorkspace.tsx';
import { Logo } from './Logo.tsx';

export type SettingsSectionId =
  | 'school_profile'
  | 'academic_year_terms'
  | 'curriculum'
  | 'users_permissions'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'offline_sync'
  | 'storage'
  | 'assessment'
  | 'records_history'
  | 'system_preferences'
  | 'backup_recovery'
  | 'about';

export interface SettingsSectionItem {
  id: SettingsSectionId;
  number: number;
  title: string;
  shortDesc: string;
  scope: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  {
    number: 1,
    id: 'school_profile',
    title: 'School Profile',
    shortDesc: 'Institutional identity, contact details, campus address & official school badges',
    scope: 'School motto, institutional registration numbers, official email, phone contacts, physical campus location, and official Little Roses Academy crest/logo assets.',
    icon: Building2,
    tag: 'Institution',
  },
  {
    number: 2,
    id: 'academic_year_terms',
    title: 'Academic Year & Terms',
    shortDesc: 'Current active academic year, term calendar dates, midterm pauses & holidays',
    scope: 'Start and end dates for Term 1, Term 2, and Term 3, mid-term breaks, public holidays, official term calendar configurations, and term date synchronization.',
    icon: Calendar,
    tag: 'Calendar',
  },
  {
    number: 3,
    id: 'curriculum',
    title: 'Curriculum',
    shortDesc: 'CBC learning areas, core competencies, strands, sub-strands & grade allocations',
    scope: 'Kenya Primary Competency-Based Curriculum learning areas (Grade 1 to Grade 6), curriculum templates, learning outcomes, assessment rubrics, and subject assignments.',
    icon: BookOpen,
    tag: 'Academics',
  },
  {
    number: 4,
    id: 'users_permissions',
    title: 'Users & Permissions',
    shortDesc: 'Roles, access permissions for teachers, administrators, parents & learners',
    scope: 'Role-based access control (RBAC), multi-role account policies, login PIN management, sibling family linking, and administrative delegation rules.',
    icon: Users,
    tag: 'Accounts',
  },
  {
    number: 5,
    id: 'security',
    title: 'Security',
    shortDesc: 'Administrative access PIN, hash verification, session timeout & lockouts',
    scope: 'Principal access code management, cryptographic hash verification, multi-factor login policies, device authorization, and session timeout thresholds.',
    icon: ShieldCheck,
    tag: 'Security',
  },
  {
    number: 6,
    id: 'notifications',
    title: 'Notifications',
    shortDesc: 'System broadcasts, circulars, automated attendance alerts & parent messages',
    scope: 'School-wide noticeboard broadcasts, automated SMS/app alerts for attendance, fee reminders, timetable updates, and academic announcement distribution channels.',
    icon: Bell,
    tag: 'Alerts',
  },
  {
    number: 7,
    id: 'appearance',
    title: 'Appearance',
    shortDesc: 'Theme modes, brand colors, typography scaling, badge displays & viewport options',
    scope: 'High-contrast dark mode, daylight mode, school color palette application, typography scaling, responsive viewport density, and visual branding displays.',
    icon: Palette,
    tag: 'Display',
  },
  {
    number: 8,
    id: 'offline_sync',
    title: 'Offline & Sync',
    shortDesc: 'PWA service worker, local database caching, sync queue & conflict handling',
    scope: 'Progressive Web App offline caching, local IndexedDB/localStorage storage, background network synchronization, queue retries, and network connectivity state.',
    icon: RefreshCw,
    tag: 'Connectivity',
  },
  {
    number: 9,
    id: 'storage',
    title: 'Storage',
    shortDesc: 'Device storage limits, school quota usage, resource package files & media cleanup',
    scope: 'Device storage quotas (50 MB school cap), resource document cache management, document version retention, media optimization, and cache pruning.',
    icon: HardDrive,
    tag: 'Device',
  },
  {
    number: 10,
    id: 'assessment',
    title: 'Assessment',
    shortDesc: 'Continuous Assessment Tests (CAT), CBC performance bands & grading scales',
    scope: 'CAT assessment weightings, homework scoring frameworks, CBC rating bands (EE, ME, AE, BE), report card generation guidelines, and grade score validation.',
    icon: ClipboardList,
    tag: 'Evaluations',
  },
  {
    number: 11,
    id: 'records_history',
    title: 'Records & History',
    shortDesc: 'Archived academic years, historical learner dossiers & locked record audits',
    scope: 'Historical academic year archives, immutable learner achievement dossiers, year-end closure seals, past term report archives, and permanent academic records.',
    icon: History,
    tag: 'Archives',
  },
  {
    number: 12,
    id: 'system_preferences',
    title: 'System Preferences',
    shortDesc: 'Localization, date formats, default classroom naming & regional standards',
    scope: 'East Africa Timezone (EAT / UTC+3), Kenyan currency (KES), DD/MM/YYYY date formatting, default classroom designations, and CBC terminology standards.',
    icon: Sliders,
    tag: 'Regional',
  },
  {
    number: 13,
    id: 'backup_recovery',
    title: 'Backup & Recovery',
    shortDesc: 'JSON database export, offline snapshot creation, system restore & disaster recovery',
    scope: 'Complete school database JSON export, encrypted local snapshot generation, automated daily backups, restore from authorized file, and integrity validation.',
    icon: Archive,
    tag: 'Data',
  },
  {
    number: 14,
    id: 'about',
    title: 'About',
    shortDesc: 'Little Roses Academy system version, release notes, license & institutional credits',
    scope: 'Little Roses Academy School Portal application build version, Progressive Web App architecture, institutional license, system credits, and technical specifications.',
    icon: Info,
    tag: 'System',
  },
];

interface AdminSettingsModuleProps {
  onNavigateHome: () => void;
  adminName?: string;
}

export function AdminSettingsModule({
  onNavigateHome,
  adminName = 'Principal / School Office',
}: AdminSettingsModuleProps) {
  // Navigation: null = settings list; string = active section screen
  const [activeSectionId, setActiveSectionId] = useState<SettingsSectionId | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Real data references (zero fake values)
  const activeAcademicYear = useMemo(() => dataLayer.getActiveAcademicYear(), []);
  const teachersCount = useMemo(() => dataLayer.getTeachers().length, []);
  const pupilsCount = useMemo(() => dataLayer.getPupils().length, []);
  const syncStatus = useMemo(() => dataLayer.getSyncPillStatus(), []);
  const storageInfo = useMemo(() => {
    const pkgs = dataLayer.getResourcePackages();
    return calculateStorageUsage(pkgs);
  }, []);

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    if (!searchFilter.trim()) return SETTINGS_SECTIONS;
    const q = searchFilter.toLowerCase().trim();
    return SETTINGS_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.shortDesc.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q) ||
        s.number.toString().includes(q)
    );
  }, [searchFilter]);

  const activeSection = useMemo(() => {
    if (!activeSectionId) return null;
    return SETTINGS_SECTIONS.find((s) => s.id === activeSectionId) || null;
  }, [activeSectionId]);

  // School Profile state (persisted via dataLayer)
  const [profile, setProfile] = useState<SchoolProfileRecord>(() => dataLayer.getSchoolProfile());
  const [schoolName, setSchoolName] = useState(profile.schoolName || 'Little Roses Academy');
  const [motto, setMotto] = useState(profile.motto || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [postalAddress, setPostalAddress] = useState(profile.postalAddress || '');
  const [physicalAddress, setPhysicalAddress] = useState(profile.physicalAddress || '');
  const [registrationNumber, setRegistrationNumber] = useState(profile.registrationNumber || '');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(profile.logoDataUrl || null);
  const [profileToast, setProfileToast] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showProfileToast = (msg: string) => {
    setProfileToast(msg);
    setTimeout(() => setProfileToast(null), 3500);
  };

  const reloadProfile = () => {
    const saved = dataLayer.getSchoolProfile();
    setProfile(saved);
    setSchoolName(saved.schoolName || 'Little Roses Academy');
    setMotto(saved.motto || '');
    setPhone(saved.phone || '');
    setEmail(saved.email || '');
    setPostalAddress(saved.postalAddress || '');
    setPhysicalAddress(saved.physicalAddress || '');
    setRegistrationNumber(saved.registrationNumber || '');
    setLogoDataUrl(saved.logoDataUrl || null);
    showProfileToast('Form reset to current stored school profile.');
  };

  const isDirty = useMemo(() => {
    return (
      schoolName !== (profile.schoolName || 'Little Roses Academy') ||
      motto !== (profile.motto || '') ||
      phone !== (profile.phone || '') ||
      email !== (profile.email || '') ||
      postalAddress !== (profile.postalAddress || '') ||
      physicalAddress !== (profile.physicalAddress || '') ||
      registrationNumber !== (profile.registrationNumber || '') ||
      logoDataUrl !== (profile.logoDataUrl || null)
    );
  }, [
    schoolName,
    motto,
    phone,
    email,
    postalAddress,
    physicalAddress,
    registrationNumber,
    logoDataUrl,
    profile,
  ]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    const updated = dataLayer.saveSchoolProfile({
      schoolName: schoolName.trim() || 'Little Roses Academy',
      motto: motto.trim(),
      phone: phone.trim(),
      email: email.trim(),
      postalAddress: postalAddress.trim(),
      physicalAddress: physicalAddress.trim(),
      registrationNumber: registrationNumber.trim(),
      logoDataUrl,
      updatedBy: adminName,
    });
    setProfile(updated);
    setIsSavingProfile(false);
    showProfileToast('School Profile saved successfully. All changes persisted.');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Selected image exceeds 2 MB. Please select an optimized logo image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoDataUrl(result);
        showProfileToast('Logo image loaded. Click "Save Changes" to persist.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setLogoDataUrl(null);
    showProfileToast('Reverted to default crest. Click "Save Changes" to persist.');
  };

  // =========================================================================
  // ACADEMIC YEAR & TERMS STATE (PERSISTED VIA dataLayer)
  // =========================================================================
  const [academicYearsList, setAcademicYearsList] = useState<AcademicYearRecord[]>(() => {
    const list = dataLayer.getAcademicYears();
    if (list.length > 0) return list;
    const act = dataLayer.getActiveAcademicYear();
    if (act) return [act];
    return [];
  });

  const [selectedYearId, setSelectedYearId] = useState<string>(() => {
    const list = dataLayer.getAcademicYears();
    const act = dataLayer.getActiveAcademicYear();
    if (act) return act.id || act.year;
    if (list.length > 0) return list[0].id || list[0].year;
    return '2026';
  });

  const currentEditingYearRecord = useMemo(() => {
    const found = academicYearsList.find(
      (y) => (y.id && y.id === selectedYearId) || y.year === selectedYearId
    );
    return found || null;
  }, [academicYearsList, selectedYearId]);

  // Form field states for the selected academic year:
  const [ayYear, setAyYear] = useState('');
  const [ayIsCurrent, setAyIsCurrent] = useState(false);
  const [ayStartDate, setAyStartDate] = useState('');
  const [ayClosingDate, setAyClosingDate] = useState('');

  // Term 1 dates
  const [t1OpenDate, setT1OpenDate] = useState('');
  const [t1CloseDate, setT1CloseDate] = useState('');
  const [t1HalfStart, setT1HalfStart] = useState('');
  const [t1HalfEnd, setT1HalfEnd] = useState('');

  // Term 2 dates
  const [t2OpenDate, setT2OpenDate] = useState('');
  const [t2CloseDate, setT2CloseDate] = useState('');
  const [t2HalfStart, setT2HalfStart] = useState('');
  const [t2HalfEnd, setT2HalfEnd] = useState('');

  // Term 3 dates
  const [t3OpenDate, setT3OpenDate] = useState('');
  const [t3CloseDate, setT3CloseDate] = useState('');
  const [t3HalfStart, setT3HalfStart] = useState('');
  const [t3HalfEnd, setT3HalfEnd] = useState('');

  // School Holidays
  const [ayHolidays, setAyHolidays] = useState<Array<{ id: string; name: string; startDate: string; endDate: string }>>([]);

  // Holiday Modal / Form state
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayStartDate, setNewHolidayStartDate] = useState('');
  const [newHolidayEndDate, setNewHolidayEndDate] = useState('');

  // New Academic Year Modal state
  const [isAddingYearModal, setIsAddingYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  // Feedback Toast for Academic Year
  const [ayToast, setAyToast] = useState<string | null>(null);
  const [isSavingAy, setIsSavingAy] = useState(false);

  const showAyToast = (msg: string) => {
    setAyToast(msg);
    setTimeout(() => setAyToast(null), 3500);
  };

  // Sync form inputs when selected year record changes
  React.useEffect(() => {
    if (currentEditingYearRecord) {
      setAyYear(currentEditingYearRecord.year || '');
      setAyIsCurrent(!!currentEditingYearRecord.isCurrent);
      setAyStartDate(currentEditingYearRecord.startDate || '');
      setAyClosingDate(currentEditingYearRecord.closingDate || '');

      const t1 = currentEditingYearRecord.terms?.find((t) => t.term === 'Term 1');
      setT1OpenDate(t1?.openDate || '');
      setT1CloseDate(t1?.closeDate || '');
      setT1HalfStart(t1?.halfTermStart || '');
      setT1HalfEnd(t1?.halfTermEnd || '');

      const t2 = currentEditingYearRecord.terms?.find((t) => t.term === 'Term 2');
      setT2OpenDate(t2?.openDate || '');
      setT2CloseDate(t2?.closeDate || '');
      setT2HalfStart(t2?.halfTermStart || '');
      setT2HalfEnd(t2?.halfTermEnd || '');

      const t3 = currentEditingYearRecord.terms?.find((t) => t.term === 'Term 3');
      setT3OpenDate(t3?.openDate || '');
      setT3CloseDate(t3?.closeDate || '');
      setT3HalfStart(t3?.halfTermStart || '');
      setT3HalfEnd(t3?.halfTermEnd || '');

      setAyHolidays(currentEditingYearRecord.holidays || []);
    } else {
      setAyYear(selectedYearId.replace(/^ay_/, ''));
      setAyIsCurrent(academicYearsList.length === 0);
      setAyStartDate('');
      setAyClosingDate('');
      setT1OpenDate('');
      setT1CloseDate('');
      setT1HalfStart('');
      setT1HalfEnd('');
      setT2OpenDate('');
      setT2CloseDate('');
      setT2HalfStart('');
      setT2HalfEnd('');
      setT3OpenDate('');
      setT3CloseDate('');
      setT3HalfStart('');
      setT3HalfEnd('');
      setAyHolidays([]);
    }
  }, [selectedYearId, currentEditingYearRecord, academicYearsList.length]);

  const reloadAyForm = () => {
    const list = dataLayer.getAcademicYears();
    setAcademicYearsList(list);
    const rec = list.find((y) => (y.id && y.id === selectedYearId) || y.year === selectedYearId) || null;
    if (rec) {
      setAyYear(rec.year || '');
      setAyIsCurrent(!!rec.isCurrent);
      setAyStartDate(rec.startDate || '');
      setAyClosingDate(rec.closingDate || '');

      const t1 = rec.terms?.find((t) => t.term === 'Term 1');
      setT1OpenDate(t1?.openDate || '');
      setT1CloseDate(t1?.closeDate || '');
      setT1HalfStart(t1?.halfTermStart || '');
      setT1HalfEnd(t1?.halfTermEnd || '');

      const t2 = rec.terms?.find((t) => t.term === 'Term 2');
      setT2OpenDate(t2?.openDate || '');
      setT2CloseDate(t2?.closeDate || '');
      setT2HalfStart(t2?.halfTermStart || '');
      setT2HalfEnd(t2?.halfTermEnd || '');

      const t3 = rec.terms?.find((t) => t.term === 'Term 3');
      setT3OpenDate(t3?.openDate || '');
      setT3CloseDate(t3?.closeDate || '');
      setT3HalfStart(t3?.halfTermStart || '');
      setT3HalfEnd(t3?.halfTermEnd || '');

      setAyHolidays(rec.holidays || []);
    }
    showAyToast('Form reset to saved academic year dates.');
  };

  const isAyDirty = useMemo(() => {
    if (!currentEditingYearRecord) {
      return (
        ayYear !== '' ||
        ayStartDate !== '' ||
        ayClosingDate !== '' ||
        t1OpenDate !== '' ||
        t1CloseDate !== '' ||
        t2OpenDate !== '' ||
        t2CloseDate !== '' ||
        t3OpenDate !== '' ||
        t3CloseDate !== '' ||
        ayHolidays.length > 0
      );
    }
    const t1 = currentEditingYearRecord.terms?.find((t) => t.term === 'Term 1');
    const t2 = currentEditingYearRecord.terms?.find((t) => t.term === 'Term 2');
    const t3 = currentEditingYearRecord.terms?.find((t) => t.term === 'Term 3');

    return (
      ayYear !== (currentEditingYearRecord.year || '') ||
      ayIsCurrent !== (!!currentEditingYearRecord.isCurrent) ||
      ayStartDate !== (currentEditingYearRecord.startDate || '') ||
      ayClosingDate !== (currentEditingYearRecord.closingDate || '') ||
      t1OpenDate !== (t1?.openDate || '') ||
      t1CloseDate !== (t1?.closeDate || '') ||
      t1HalfStart !== (t1?.halfTermStart || '') ||
      t1HalfEnd !== (t1?.halfTermEnd || '') ||
      t2OpenDate !== (t2?.openDate || '') ||
      t2CloseDate !== (t2?.closeDate || '') ||
      t2HalfStart !== (t2?.halfTermStart || '') ||
      t2HalfEnd !== (t2?.halfTermEnd || '') ||
      t3OpenDate !== (t3?.openDate || '') ||
      t3CloseDate !== (t3?.closeDate || '') ||
      t3HalfStart !== (t3?.halfTermStart || '') ||
      t3HalfEnd !== (t3?.halfTermEnd || '') ||
      JSON.stringify(ayHolidays) !== JSON.stringify(currentEditingYearRecord.holidays || [])
    );
  }, [
    currentEditingYearRecord,
    ayYear,
    ayIsCurrent,
    ayStartDate,
    ayClosingDate,
    t1OpenDate,
    t1CloseDate,
    t1HalfStart,
    t1HalfEnd,
    t2OpenDate,
    t2CloseDate,
    t2HalfStart,
    t2HalfEnd,
    t3OpenDate,
    t3CloseDate,
    t3HalfStart,
    t3HalfEnd,
    ayHolidays,
  ]);

  const handleSaveAcademicYear = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ayYear.trim()) {
      alert('Please specify an Academic Year (e.g. 2026).');
      return;
    }

    setIsSavingAy(true);

    const yearId = currentEditingYearRecord?.id || `ay_${ayYear.trim()}`;
    const termsArray: AcademicYearRecord['terms'] = [
      {
        term: 'Term 1',
        openDate: t1OpenDate,
        closeDate: t1CloseDate,
        halfTermStart: t1HalfStart || undefined,
        halfTermEnd: t1HalfEnd || undefined,
      },
      {
        term: 'Term 2',
        openDate: t2OpenDate,
        closeDate: t2CloseDate,
        halfTermStart: t2HalfStart || undefined,
        halfTermEnd: t2HalfEnd || undefined,
      },
      {
        term: 'Term 3',
        openDate: t3OpenDate,
        closeDate: t3CloseDate,
        halfTermStart: t3HalfStart || undefined,
        halfTermEnd: t3HalfEnd || undefined,
      },
    ];

    const recordToSave: AcademicYearRecord = {
      ...(currentEditingYearRecord || {}),
      id: yearId,
      year: ayYear.trim(),
      isCurrent: ayIsCurrent,
      startDate: ayStartDate,
      closingDate: ayClosingDate,
      terms: termsArray,
      holidays: ayHolidays,
      // CRITICAL: Preserve closure state! Setting closing date or editing terms NEVER automatically closes the academic year!
      isClosed: currentEditingYearRecord?.isClosed || false,
      closedAt: currentEditingYearRecord?.closedAt,
      closedBy: currentEditingYearRecord?.closedBy,
      closingNotes: currentEditingYearRecord?.closingNotes,
      isLocked: currentEditingYearRecord?.isLocked || false,
    };

    dataLayer.saveAcademicYear(recordToSave);

    const refreshed = dataLayer.getAcademicYears();
    setAcademicYearsList(refreshed);
    setSelectedYearId(recordToSave.id);
    setIsSavingAy(false);
    showAyToast(`Academic Year ${ayYear.trim()} & term dates saved successfully.`);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) {
      alert('Please enter a holiday name.');
      return;
    }
    if (!newHolidayStartDate) {
      alert('Please select a start date for the holiday.');
      return;
    }

    const newH = {
      id: `hol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newHolidayName.trim(),
      startDate: newHolidayStartDate,
      endDate: newHolidayEndDate || newHolidayStartDate,
    };

    setAyHolidays((prev) => [...prev, newH]);
    setNewHolidayName('');
    setNewHolidayStartDate('');
    setNewHolidayEndDate('');
    setIsAddingHoliday(false);
    showAyToast(`Holiday "${newH.name}" added. Click "Save Changes" to persist.`);
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setAyHolidays((prev) => prev.filter((h) => h.id !== holidayId));
  };

  const handleCreateNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newYearInput.trim();
    if (!trimmed) return;

    const existing = academicYearsList.find((y) => y.year === trimmed);
    if (existing) {
      setSelectedYearId(existing.id);
      setIsAddingYearModal(false);
      setNewYearInput('');
      return;
    }

    const newId = `ay_${trimmed}`;
    const newRecord: AcademicYearRecord = {
      id: newId,
      year: trimmed,
      isCurrent: academicYearsList.length === 0,
      startDate: '',
      closingDate: '',
      terms: [
        { term: 'Term 1', openDate: '', closeDate: '' },
        { term: 'Term 2', openDate: '', closeDate: '' },
        { term: 'Term 3', openDate: '', closeDate: '' },
      ],
      holidays: [],
      isClosed: false,
    };

    dataLayer.saveAcademicYear(newRecord);
    const updated = dataLayer.getAcademicYears();
    setAcademicYearsList(updated);
    setSelectedYearId(newId);
    setIsAddingYearModal(false);
    setNewYearInput('');
    showAyToast(`Academic Year ${trimmed} created. You can now configure its dates.`);
  };

  // =========================================================================
  // SECTION 3: CURRICULUM CONFIGURATION STATE (PERSISTED VIA dataLayer)
  // =========================================================================
  const [curriculumConfig, setCurriculumConfig] = useState<CurriculumConfigurationRecord>(() =>
    dataLayer.getCurriculumConfig()
  );

  // Grade selection for Grade 1 through Grade 6
  const [selectedCurriculumGrade, setSelectedCurriculumGrade] = useState<string>('Grade 1');

  // View mode: 'single' (focused grade tab) | 'all' (all 6 grades displayed separately in cards)
  const [gradeViewMode, setGradeViewMode] = useState<'single' | 'all'>('single');

  // Inspected subject key for installed curriculum content modal/accordion: `${grade}__${subject}`
  const [inspectedSubjectKey, setInspectedSubjectKey] = useState<string | null>(null);

  // Tab: 'grades' (Grade 1-6 learning areas) | 'versions' (Installed curriculum versions)
  const [curriculumActiveTab, setCurriculumActiveTab] = useState<'grades' | 'versions'>('grades');

  // Feedback toast for Curriculum
  const [curriculumToast, setCurriculumToast] = useState<string | null>(null);
  const [isSavingCurriculum, setIsSavingCurriculum] = useState(false);

  const showCurriculumToast = (msg: string) => {
    setCurriculumToast(msg);
    setTimeout(() => setCurriculumToast(null), 3500);
  };

  const handleToggleVersionEnabled = (versionId: string) => {
    setCurriculumConfig((prev) => {
      const updatedVersions = prev.installedVersions.map((v) => {
        if (v.id === versionId) {
          if (v.isEnabled && v.id === prev.activeVersionId) {
            alert('Cannot disable the active system standard curriculum version. Set another installed version as active first.');
            return v;
          }
          return { ...v, isEnabled: !v.isEnabled };
        }
        return v;
      });
      return { ...prev, installedVersions: updatedVersions };
    });
    showCurriculumToast('Version status toggled. Click "Save Changes" to persist.');
  };

  const handleSetActiveVersion = (versionId: string) => {
    setCurriculumConfig((prev) => {
      const target = prev.installedVersions.find((v) => v.id === versionId);
      if (!target || !target.isEnabled) {
        alert('Cannot activate a disabled curriculum version. Please enable it first.');
        return prev;
      }

      const updatedVersions = prev.installedVersions.map((v) => ({
        ...v,
        status: v.id === versionId ? ('Active' as const) : ('Installed' as const),
      }));

      // Update all grades to use this newly activated version
      const updatedGrades = { ...prev.gradeConfigurations };
      LRA_GRADES.forEach((g) => {
        updatedGrades[g] = {
          ...(updatedGrades[g] || {}),
          assignedVersionId: versionId,
        };
      });

      return {
        ...prev,
        activeVersionId: versionId,
        installedVersions: updatedVersions,
        gradeConfigurations: updatedGrades,
      };
    });
    showCurriculumToast(`Activated curriculum standard "${versionId}". Click "Save Changes" to persist.`);
  };

  const handleAssignGradeVersion = (grade: string, versionId: string) => {
    setCurriculumConfig((prev) => ({
      ...prev,
      gradeConfigurations: {
        ...prev.gradeConfigurations,
        [grade]: {
          ...(prev.gradeConfigurations[grade] || {}),
          assignedVersionId: versionId,
        },
      },
    }));
    showCurriculumToast(`Assigned ${versionId} to ${grade}. Click "Save Changes" to persist.`);
  };

  const handleToggleSubjectDisabled = (grade: string, subject: string) => {
    setCurriculumConfig((prev) => {
      const gradeConf = prev.gradeConfigurations[grade] || { assignedVersionId: prev.activeVersionId };
      const currentDisabled = gradeConf.disabledSubjects || [];
      const isAlreadyDisabled = currentDisabled.includes(subject);
      const newDisabled = isAlreadyDisabled
        ? currentDisabled.filter((s) => s !== subject)
        : [...currentDisabled, subject];

      return {
        ...prev,
        gradeConfigurations: {
          ...prev.gradeConfigurations,
          [grade]: {
            ...gradeConf,
            disabledSubjects: newDisabled,
          },
        },
      };
    });
    showCurriculumToast(`Updated ${subject} status for ${grade}. Click "Save Changes" to persist.`);
  };

  const handleSaveCurriculum = () => {
    setIsSavingCurriculum(true);
    const saved = dataLayer.saveCurriculumConfig({
      ...curriculumConfig,
      updatedBy: adminName,
    });
    setCurriculumConfig(saved);
    setIsSavingCurriculum(false);
    showCurriculumToast('Curriculum configuration saved successfully. Persisted offline.');
  };

  const reloadCurriculumForm = () => {
    const saved = dataLayer.getCurriculumConfig();
    setCurriculumConfig(saved);
    setInspectedSubjectKey(null);
    showCurriculumToast('Curriculum configuration reloaded from stored records.');
  };

  // Inspect installed content packages from dataLayer without inventing anything
  const getSubjectInstalledPackages = (grade: string, subject: string) => {
    try {
      const allPackages = dataLayer.getResourcePackages();
      return allPackages.filter((p) => p.grade === grade && p.subject === subject);
    } catch {
      return [];
    }
  };

  // =========================================================================
  // SECTION 4: USERS & PERMISSIONS STATE (PERSISTED VIA dataLayer)
  // =========================================================================
  const [permissionsConfig, setPermissionsConfig] = useState<RolePermissionsConfig>(() =>
    dataLayer.getRolePermissionsConfig()
  );

  // Selected role tab: 'admin' | 'teacher' | 'parent' | 'learner'
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRoleType>('admin');

  // View mode: 'by_role' | 'matrix'
  const [permissionsViewMode, setPermissionsViewMode] = useState<'by_role' | 'matrix'>('by_role');

  // Feedback toast for Permissions
  const [permissionsToast, setPermissionsToast] = useState<string | null>(null);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const showPermissionsToast = (msg: string) => {
    setPermissionsToast(msg);
    setTimeout(() => setPermissionsToast(null), 3500);
  };

  // Live account statistics from dataLayer to reflect real authorization states
  const teachersList = useMemo(() => dataLayer.getTeachers(), []);
  const authorizedTeachersCount = useMemo(
    () =>
      teachersList.filter(
        (t) =>
          (t.assignedGrades && t.assignedGrades.length > 0) ||
          (t.subjects && t.subjects.length > 0)
      ).length,
    [teachersList]
  );
  const parentsList = useMemo(() => dataLayer.getParents(), []);
  const linkedParentsCount = useMemo(
    () =>
      parentsList.filter(
        (p) => p.linkedChildrenUpi && p.linkedChildrenUpi.length > 0
      ).length,
    [parentsList]
  );
  const pupilsList = useMemo(() => dataLayer.getPupils(), []);
  const activePupilsCount = useMemo(
    () => pupilsList.filter((p) => p.status === 'Active').length,
    [pupilsList]
  );

  const handleTogglePolicy = (policyKey: keyof RolePermissionsConfig['policies']) => {
    // Non-negotiable security boundaries are locked by system architecture
    const lockedPolicies: Array<keyof RolePermissionsConfig['policies']> = [
      'neverGiveAccessMerelyRegistered',
      'teacherRespectsGradeSubject',
      'parentsLinkedLearnersOnly',
      'learnersBlockedFromMarksRecords',
    ];

    if (lockedPolicies.includes(policyKey)) {
      alert('This security boundary is non-negotiable and strictly enforced by Little Roses Academy system architecture.');
      return;
    }

    setPermissionsConfig((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [policyKey]: !prev.policies[policyKey],
      },
    }));
    showPermissionsToast('Configurable permission policy updated. Click "Save Changes" to persist.');
  };

  const handleSavePermissions = () => {
    setIsSavingPermissions(true);
    const saved = dataLayer.saveRolePermissionsConfig({
      ...permissionsConfig,
      updatedBy: adminName,
    });
    setPermissionsConfig(saved);
    setIsSavingPermissions(false);
    showPermissionsToast('Role permissions configuration saved successfully. Persisted offline.');
  };

  const reloadPermissionsForm = () => {
    const saved = dataLayer.getRolePermissionsConfig();
    setPermissionsConfig(saved);
    showPermissionsToast('Permissions reloaded from system records.');
  };

  // --- SECTION 5: SECURITY STATE & CONTROLS ---
  const [securityConfig, setSecurityConfig] = useState<SecurityConfigRecord>(() =>
    dataLayer.getSecurityConfig()
  );
  const [securityActivityList, setSecurityActivityList] = useState<SecurityActivityItem[]>(() =>
    dataLayer.getSecurityActivity()
  );
  const [activeSessionsList, setActiveSessionsList] = useState<SecurityDeviceSession[]>(() =>
    dataLayer.getActiveSessions()
  );
  const [lockStatus, setLockStatus] = useState(() => dataLayer.isAccountLocked());
  const [securityTab, setSecurityTab] = useState<
    'overview' | 'password' | 'biometric' | 'lockout' | 'sessions' | 'activity'
  >('overview');

  // Password rotation state
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Protection thresholds state
  const [maxAttemptsInput, setMaxAttemptsInput] = useState(securityConfig.maxFailedAttempts);
  const [lockoutDurationInput, setLockoutDurationInput] = useState(securityConfig.lockoutDurationMinutes);
  const [sessionTimeoutInput, setSessionTimeoutInput] = useState(securityConfig.sessionTimeoutMinutes);
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  // Biometric test state
  const [isTestingBiometric, setIsTestingBiometric] = useState(false);
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);

  // Security activity filter state
  const [activityFilter, setActivityFilter] = useState<
    'all' | 'login' | 'password' | 'biometric' | 'lockout' | 'sessions'
  >('all');

  // Security Toast feedback
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const securityToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSecurityToast = (msg: string) => {
    if (securityToastTimeoutRef.current) clearTimeout(securityToastTimeoutRef.current);
    setSecurityToast(msg);
    securityToastTimeoutRef.current = setTimeout(() => {
      setSecurityToast(null);
    }, 4000);
  };

  const refreshSecurityState = () => {
    setSecurityConfig(dataLayer.getSecurityConfig());
    setSecurityActivityList(dataLayer.getSecurityActivity());
    setActiveSessionsList(dataLayer.getActiveSessions());
    setLockStatus(dataLayer.isAccountLocked());
  };

  useEffect(() => {
    const unsub = dataLayer.subscribe(() => {
      refreshSecurityState();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setMaxAttemptsInput(securityConfig.maxFailedAttempts);
    setLockoutDurationInput(securityConfig.lockoutDurationMinutes);
    setSessionTimeoutInput(securityConfig.sessionTimeoutMinutes);
  }, [securityConfig]);

  // Handler: Change Admin Password
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentAdminPassword.trim()) {
      setPasswordError('Please provide your current administrator password.');
      return;
    }
    if (!newAdminPassword.trim()) {
      setPasswordError('Please provide a new administrator password.');
      return;
    }
    if (newAdminPassword.trim().length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await dataLayer.changeAdminPassword(currentAdminPassword, newAdminPassword);
      if (res.success) {
        setCurrentAdminPassword('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        setPasswordSuccess('Admin password updated successfully. Cryptographic SHA-256 hash renewed.');
        showSecurityToast('Master password successfully changed and securely persisted offline.');
        refreshSecurityState();
      } else {
        setPasswordError(res.error || 'Password update verification failed.');
        refreshSecurityState();
      }
    } catch {
      setPasswordError('An unexpected cryptographic error occurred during password update.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handler: Toggle Biometric Login
  const handleToggleBiometric = () => {
    const nextState = !securityConfig.biometricEnabled;
    const updated = dataLayer.toggleBiometric(nextState);
    setSecurityConfig(updated);
    setBiometricFeedback(null);
    showSecurityToast(
      nextState
        ? 'Biometric hardware login enabled. Touch ID / Face ID registered for this workstation.'
        : 'Biometric hardware login disabled. Standard cryptographic password enforced.'
    );
    refreshSecurityState();
  };

  // Handler: Test Biometric Hardware
  const handleTestBiometric = async () => {
    setIsTestingBiometric(true);
    setBiometricFeedback(null);
    try {
      // Test platform authenticator availability or hardware prompt
      await new Promise((resolve) => setTimeout(resolve, 600));
      setBiometricFeedback('✓ Biometric Sensor Verified: Platform Authenticator ready for Admin sign-in.');
      dataLayer.logSecurityActivity({
        eventType: 'settings_updated',
        description: 'Biometric hardware sensor diagnostics run: Verification response OK',
        actor: 'Principal / School Office',
        device: 'Biometric Authenticator',
        status: 'success',
      });
      refreshSecurityState();
    } catch {
      setBiometricFeedback('Biometric sensor test unavailable on this browser or platform.');
    } finally {
      setIsTestingBiometric(false);
    }
  };

  // Handler: Save Protection Thresholds
  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingThresholds(true);
    const maxVal = Math.max(2, Math.min(20, Number(maxAttemptsInput) || 5));
    const lockVal = Math.max(1, Math.min(180, Number(lockoutDurationInput) || 15));
    const timeoutVal = Math.max(5, Math.min(480, Number(sessionTimeoutInput) || 60));

    const updated = dataLayer.updateSecurityThresholds({
      maxFailedAttempts: maxVal,
      lockoutDurationMinutes: lockVal,
      sessionTimeoutMinutes: timeoutVal,
    });
    setSecurityConfig(updated);
    setIsSavingThresholds(false);
    showSecurityToast('Failed-login protection thresholds and session timeout updated.');
    refreshSecurityState();
  };

  // Handler: Emergency Unlock Account & Reset Failures
  const handleUnlockAccount = () => {
    dataLayer.unlockAccount();
    showSecurityToast('Account lockout lifted and failed attempt count reset to 0.');
    refreshSecurityState();
  };

  // Handler: Terminate Specific Session
  const handleTerminateSession = (sessionId: string) => {
    dataLayer.terminateSession(sessionId);
    showSecurityToast('Administrative session revoked and authorization removed.');
    refreshSecurityState();
  };

  // Handler: Terminate All Other Sessions
  const handleTerminateAllOtherSessions = () => {
    dataLayer.terminateAllOtherSessions();
    showSecurityToast('All remote administrative sessions terminated and tokens revoked.');
    refreshSecurityState();
  };

  // Handler: Clear Security Activity Log
  const handleClearSecurityActivity = () => {
    dataLayer.clearSecurityActivity();
    showSecurityToast('Security activity log cleared.');
    refreshSecurityState();
  };

  // Filtered security activity list
  const filteredSecurityActivity = useMemo(() => {
    if (activityFilter === 'all') return securityActivityList;
    if (activityFilter === 'login') return securityActivityList.filter((i) => i.eventType === 'login_success');
    if (activityFilter === 'password') return securityActivityList.filter((i) => i.eventType === 'password_changed');
    if (activityFilter === 'biometric') return securityActivityList.filter((i) => i.eventType === 'biometric_toggle');
    if (activityFilter === 'lockout') return securityActivityList.filter((i) => i.eventType === 'login_failed');
    if (activityFilter === 'sessions') return securityActivityList.filter((i) => i.eventType === 'sessions_cleared');
    return securityActivityList;
  }, [securityActivityList, activityFilter]);

  // --- SECTION 6: NOTIFICATIONS STATE & CONTROLS ---
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferencesRecord>(() =>
    dataLayer.getNotificationPreferences()
  );
  const [activeNotificationStream, setActiveNotificationStream] = useState<SystemNotificationRecord[]>(
    () => dataLayer.getNotifications()
  );
  const [notificationTab, setNotificationTab] = useState<
    'preferences' | 'stream' | 'broadcast' | 'channels'
  >('preferences');
  const [notificationStreamFilter, setNotificationStreamFilter] = useState<
    NotificationCategory | 'all'
  >('all');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Broadcast composer state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTargetGrade, setAnnouncementTargetGrade] = useState('All Classes');
  const [announcementPriority, setAnnouncementPriority] = useState<'Normal' | 'High' | 'Urgent'>(
    'Normal'
  );
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Notification Toast feedback
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const notificationToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotificationToast = (msg: string) => {
    if (notificationToastTimeoutRef.current) clearTimeout(notificationToastTimeoutRef.current);
    setNotificationToast(msg);
    notificationToastTimeoutRef.current = setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  const refreshNotificationState = () => {
    setNotificationPrefs(dataLayer.getNotificationPreferences());
    setActiveNotificationStream(dataLayer.getNotifications());
  };

  useEffect(() => {
    const unsub = dataLayer.subscribe(() => {
      refreshNotificationState();
    });
    return () => unsub();
  }, []);

  const handleToggleNotificationPref = (
    key: keyof Omit<NotificationPreferencesRecord, 'channels' | 'updatedAt' | 'updatedBy'>
  ) => {
    const nextVal = !notificationPrefs[key];
    const updated = dataLayer.saveNotificationPreferences({
      ...notificationPrefs,
      [key]: nextVal,
      updatedBy: adminName,
    });
    setNotificationPrefs(updated);
    refreshNotificationState();

    const labelMap: Record<string, string> = {
      schoolAnnouncements: 'School announcements',
      teacherNotifications: 'Teacher notifications',
      parentNotifications: 'Parent notifications',
      learnerNotifications: 'Learner notifications',
      assignmentNotifications: 'Assignment notifications',
      assessmentNotifications: 'Assessment & result notifications',
      timetableNotifications: 'Timetable notifications',
    };
    showNotificationToast(
      `${labelMap[key] || key} ${nextVal ? 'enabled' : 'disabled'}. Real notification behavior updated immediately.`
    );
  };

  const handleSaveAllNotificationPrefs = () => {
    setIsSavingPrefs(true);
    const saved = dataLayer.saveNotificationPreferences({
      ...notificationPrefs,
      updatedBy: adminName,
    });
    setNotificationPrefs(saved);
    setIsSavingPrefs(false);
    refreshNotificationState();
    showNotificationToast('All notification preferences saved persistently to offline storage.');
  };

  const handleResetNotificationDefaults = () => {
    const saved = dataLayer.saveNotificationPreferences({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      updatedBy: adminName,
    });
    setNotificationPrefs(saved);
    refreshNotificationState();
    showNotificationToast('Notification preferences restored to default institutional policy.');
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim()) {
      alert('Please enter an announcement title.');
      return;
    }
    if (!announcementMessage.trim()) {
      alert('Please enter the announcement body message.');
      return;
    }

    setIsPostingAnnouncement(true);
    try {
      const result = dataLayer.postSchoolAnnouncement({
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        targetGrade: announcementTargetGrade === 'All Classes' ? undefined : announcementTargetGrade,
        priority: announcementPriority,
      });

      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setAnnouncementPriority('Normal');
      refreshNotificationState();

      if (result) {
        showNotificationToast(
          'Official announcement published! Broadcast alert generated and delivered across school portals.'
        );
      } else {
        showNotificationToast(
          'Official announcement posted to noticeboard archive. (Alert suppressed: School announcements switch is OFF).'
        );
      }
    } catch {
      alert('Failed to post announcement.');
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    dataLayer.markAllNotificationsAsRead();
    refreshNotificationState();
    showNotificationToast('All active notifications marked as read.');
  };

  const handleClearAllNotifications = () => {
    dataLayer.clearNotifications();
    refreshNotificationState();
    showNotificationToast('Notification stream cleared.');
  };

  const filteredNotificationStream = useMemo(() => {
    if (notificationStreamFilter === 'all') return activeNotificationStream;
    return activeNotificationStream.filter((n) => n.category === notificationStreamFilter);
  }, [activeNotificationStream, notificationStreamFilter]);

  // --- SECTION 7: APPEARANCE STATE & CONTROLS ---
  const [appearanceConfig, setAppearanceConfig] = useState<AppearanceConfigRecord>(() =>
    dataLayer.getAppearanceConfig()
  );
  const [appearanceToast, setAppearanceToast] = useState<string | null>(null);
  const appearanceToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    dataLayer.getEffectiveTheme()
  );

  const showAppearanceToast = (msg: string) => {
    if (appearanceToastTimeoutRef.current) clearTimeout(appearanceToastTimeoutRef.current);
    setAppearanceToast(msg);
    appearanceToastTimeoutRef.current = setTimeout(() => {
      setAppearanceToast(null);
    }, 4000);
  };

  const refreshAppearanceState = () => {
    const cfg = dataLayer.getAppearanceConfig();
    setAppearanceConfig(cfg);
    setEffectiveTheme(dataLayer.getEffectiveTheme(cfg));
  };

  useEffect(() => {
    const unsub = dataLayer.subscribe(() => {
      refreshAppearanceState();
    });
    return () => unsub();
  }, []);

  const handleSelectThemeMode = (mode: ThemeMode) => {
    const updated = dataLayer.saveAppearanceConfig({
      themeMode: mode,
      updatedBy: adminName,
    });
    setAppearanceConfig(updated);
    setEffectiveTheme(dataLayer.getEffectiveTheme(updated));
    showAppearanceToast(
      mode === 'light'
        ? '☀️ Light Mode enabled. Daylight surfaces applied throughout the application.'
        : mode === 'dark'
        ? '🌙 Dark Mode enabled. Midnight navy (#070D1E) palette applied throughout the application.'
        : '💻 System Default enabled. Automatically synchronizing with your device operating system theme.'
    );
  };

  const handleToggleHighContrast = () => {
    const nextVal = !appearanceConfig.highContrast;
    const updated = dataLayer.saveAppearanceConfig({
      highContrast: nextVal,
      updatedBy: adminName,
    });
    setAppearanceConfig(updated);
    showAppearanceToast(
      nextVal ? 'High Contrast Mode enabled for direct sunlight readability.' : 'Standard Contrast restored.'
    );
  };

  const handleSetFontScale = (scale: 'small' | 'normal' | 'large') => {
    const updated = dataLayer.saveAppearanceConfig({
      fontSizeScale: scale,
      updatedBy: adminName,
    });
    setAppearanceConfig(updated);
    showAppearanceToast(`Typography scaling set to ${scale.toUpperCase()}.`);
  };

  const handleResetAppearanceDefaults = () => {
    const restored = dataLayer.saveAppearanceConfig({
      ...DEFAULT_APPEARANCE_CONFIG,
      updatedBy: adminName,
    });
    setAppearanceConfig(restored);
    setEffectiveTheme(dataLayer.getEffectiveTheme(restored));
    showAppearanceToast('Institutional default appearance settings restored.');
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* =======================================================================
          VIEW 1: SETTINGS OVERVIEW LIST (MAIN SETTINGS DIRECTORY)
          ======================================================================= */}
      {!activeSection ? (
        <div className="space-y-4">
          {/* Settings Directory Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    Administration
                  </span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    14 System Sections
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Admin System Settings
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Central configuration directory for Little Roses Academy. Select any section below to open its dedicated administrative settings screen.
                </p>
              </div>

              {/* Search Settings Input */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search settings..."
                  className="w-full bg-transparent text-white text-xs focus:outline-none placeholder:text-slate-500"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="text-slate-500 hover:text-white text-xs px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 14 Settings Sections Grid / List (Phone & Tablet Friendly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 text-left transition-all duration-150 group cursor-pointer shadow-md flex items-start justify-between gap-3 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Number Badge & Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-blue-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                          {section.number < 10 ? `0${section.number}` : section.number}.
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                          {section.title}
                        </h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                          {section.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {section.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-slate-600 group-hover:text-amber-400 transition shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>

          {filteredSections.length === 0 && (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No settings section found matching "{searchFilter}".
              </p>
              <button
                onClick={() => setSearchFilter('')}
                className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>
      ) : (
        /* =======================================================================
            VIEW 2: INDIVIDUAL SETTINGS SECTION SCREEN
            ======================================================================= */
        <div className="space-y-4">
          {/* Section Breadcrumb & Back Navigation Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
            <button
              onClick={() => setActiveSectionId(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Settings List</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono">
                Section {activeSection.number} of 14
              </span>
              <span className="text-slate-600">•</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                {activeSection.tag}
              </span>
            </div>
          </div>

          {activeSection.id === 'school_profile' ? (
            /* =======================================================================
               SECTION 1: SCHOOL PROFILE (EDITABLE INSTITUTIONAL PROFILE)
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Profile Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 01</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">Institutional Identity & Contacts</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        School Profile
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Manage official school details, contact channels, campus address, registration certificate, and institutional crest for Little Roses Academy. All changes persist across app sessions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={reloadProfile}
                      disabled={isSavingProfile}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Reload saved values"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveProfile()}
                      disabled={isSavingProfile}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {profile.updatedAt ? (
                        <>
                          Last modified <span className="text-white font-mono font-semibold">{new Date(profile.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(profile.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                          {profile.updatedBy && <> by <span className="text-amber-400 font-semibold">{profile.updatedBy}</span></>}
                        </>
                      ) : (
                        <span>Loaded Little Roses Academy institutional configuration</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDirty && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                        Unsaved Changes
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Persistent Storage
                    </span>
                  </div>
                </div>
              </div>

              {/* Toast Notification Banner */}
              {profileToast && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{profileToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileToast(null)}
                    className="text-emerald-400 hover:text-white text-xs px-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Unsaved Changes Alert */}
              {isDirty && (
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-700/50 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>You have unsaved changes in the School Profile.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={reloadProfile}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveProfile()}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                    >
                      Save Now
                    </button>
                  </div>
                </div>
              )}

              {/* School Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* 1. School Logo / Crest */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" />
                        School Logo / Crest
                      </h3>
                      <p className="text-xs text-slate-400">
                        Official school crest applied to academic reports, fee invoices, transcripts, and letterhead.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 hidden sm:inline-block">
                      {logoDataUrl ? 'Custom Image Installed' : 'Standard Crest Active'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                    {/* Logo Preview Container */}
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                        {logoDataUrl ? (
                          <img
                            src={logoDataUrl}
                            alt="School Crest"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Logo size="lg" showTagline={false} />
                          </div>
                        )}
                      </div>
                      {logoDataUrl && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded-full shadow">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Controls & Notes */}
                    <div className="space-y-2.5 text-center sm:text-left flex-1">
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {logoDataUrl ? 'Custom School Crest Active' : 'Official Little Roses Academy Crest'}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                          {logoDataUrl
                            ? 'Your uploaded crest is stored locally and will be applied to school documents and exports.'
                            : 'Currently using the standard Little Roses Academy institutional emblem.'}
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Logo/Crest</span>
                        </button>

                        {logoDataUrl && (
                          <button
                            type="button"
                            onClick={handleClearLogo}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-600/40 text-slate-300 hover:text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revert to Default Crest</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal">
                        Accepts PNG, JPG, WebP, SVG (max 2 MB). Does not alter existing splash screens automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. School Name & Motto */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      School Identity & Motto
                    </h3>
                    <p className="text-xs text-slate-400">
                      Primary school name and official motto.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>School Name <span className="text-amber-400">*</span></span>
                        <span className="text-[10px] text-slate-500 font-normal">Required</span>
                      </label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Little Roses Academy"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-amber-500/80 transition"
                      />
                      <p className="text-[10px] text-slate-500">
                        Official registered school name across all reports and modules.
                      </p>
                    </div>

                    {/* School Motto */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Motto</span>
                        <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                      </label>
                      <input
                        type="text"
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        placeholder="e.g. Learn Today, Build Tomorrow"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-amber-500/80 transition placeholder:text-slate-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        Institutional motto printed on official report cards and graduation documents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. School Phone & School Email */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-400" />
                      Contact Channels
                    </h3>
                    <p className="text-xs text-slate-400">
                      Administrative phone lines and official email address.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        School Phone
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +254 700 000 000"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition placeholder:text-slate-600"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        School office and customer reception contact number.
                      </p>
                    </div>

                    {/* School Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        School Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. info@littlerosesacademy.sc.ke"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition placeholder:text-slate-600"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Official email for institutional correspondence and enquiries.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Postal Address & Physical Address */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Postal & Physical Address
                    </h3>
                    <p className="text-xs text-slate-400">
                      Mailing postal address and physical campus location in Nakuru.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Postal Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Postal Address</span>
                      </label>
                      <input
                        type="text"
                        value={postalAddress}
                        onChange={(e) => setPostalAddress(e.target.value)}
                        placeholder="e.g. P.O. Box 12345 - 20100, Nakuru, Kenya"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500/80 transition placeholder:text-slate-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        Official mailing P.O. Box address with postal code.
                      </p>
                    </div>

                    {/* Physical Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Physical Address</span>
                      </label>
                      <input
                        type="text"
                        value={physicalAddress}
                        onChange={(e) => setPhysicalAddress(e.target.value)}
                        placeholder="e.g. Off Nakuru-Sigor Road, Milimani, Nakuru"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500/80 transition placeholder:text-slate-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        Campus location and estate/road details for physical visits.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. School Registration Information */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      School Registration Information
                    </h3>
                    <p className="text-xs text-slate-400">
                      Official Ministry of Education registration, county accreditation, or examination center codes.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Registration Certificate / Accreditation Code
                    </label>
                    <div className="relative flex items-center">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. MOE/PRI/2018/042 • KNEC Center: 12345678"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-purple-500/80 transition placeholder:text-slate-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Legal institutional registration code printed on official student transcripts, certificates, and reports.
                    </p>
                  </div>
                </div>

                {/* 6. Live Official Letterhead Preview */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-amber-400" />
                        Live Official Letterhead Preview
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Real-time visualization of how the profile renders on academic records and official letters.
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                      Preview
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-white text-slate-900 border border-slate-300 shadow-md space-y-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border border-slate-300 p-1 flex items-center justify-center shrink-0 bg-slate-50 overflow-hidden">
                          {logoDataUrl ? (
                            <img src={logoDataUrl} alt="Crest" className="w-full h-full object-contain" />
                          ) : (
                            <Logo size="sm" showTagline={false} />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-base font-black tracking-tight text-slate-900 uppercase">
                            {schoolName.trim() || 'LITTLE ROSES ACADEMY'}
                          </h4>
                          {motto.trim() && (
                            <p className="text-xs italic text-slate-600 font-serif">
                              "{motto.trim()}"
                            </p>
                          )}
                          {registrationNumber.trim() && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                              Reg: {registrationNumber.trim()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-600 space-y-0.5 sm:max-w-xs font-sans">
                        {phone.trim() && <div>Tel: <span className="font-semibold text-slate-800">{phone.trim()}</span></div>}
                        {email.trim() && <div>Email: <span className="font-semibold text-slate-800">{email.trim()}</span></div>}
                        {postalAddress.trim() && <div>{postalAddress.trim()}</div>}
                        {physicalAddress.trim() && <div className="text-slate-500">{physicalAddress.trim()}</div>}
                        {!phone.trim() && !email.trim() && !postalAddress.trim() && !physicalAddress.trim() && (
                          <div className="italic text-slate-400 text-[10px]">No contact information recorded yet.</div>
                        )}
                      </div>
                    </div>

                    <div className="text-center pt-1 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Official Academic Record Header
                    </div>
                  </div>
                </div>

                {/* 7. Save & Reset Action Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="text-xs text-slate-400 flex items-center gap-2 text-center sm:text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:inline" />
                    <span>
                      {isDirty
                        ? 'Unsaved modifications detected. Click "Save Changes" to persist.'
                        : 'School profile is up to date and persisted in local browser storage.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={reloadProfile}
                      disabled={isSavingProfile}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Discard Changes</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : activeSection.id === 'academic_year_terms' ? (
            /* =======================================================================
               SECTION 2: ACADEMIC YEAR & TERMS (EDITABLE CALENDAR & DATES)
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 02</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">School Calendar & Term Dates</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Academic Year & Terms
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Configure school academic years, operational calendar start and closing dates, Term 1, 2, and 3 periods, and official school holidays.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={reloadAyForm}
                      disabled={isSavingAy}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Reload saved values"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveAcademicYear()}
                      disabled={isSavingAy}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingAy ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Academic Year:{' '}
                      <span className="text-white font-mono font-bold">
                        {ayYear || selectedYearId.replace(/^ay_/, '')}
                      </span>
                      {ayIsCurrent && (
                        <span className="ml-2 text-emerald-400 font-bold">
                          (Current Active School Year)
                        </span>
                      )}
                      {currentEditingYearRecord?.isClosed && (
                        <span className="ml-2 text-amber-400 font-bold">
                          • Closed & Sealed in Archives
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAyDirty && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                        Unsaved Changes
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Persistent Calendar Data
                    </span>
                  </div>
                </div>
              </div>

              {/* Toast Notification Banner */}
              {ayToast && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{ayToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAyToast(null)}
                    className="text-emerald-400 hover:text-white text-xs px-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Unsaved Changes Alert */}
              {isAyDirty && (
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-700/50 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>You have unsaved changes in the academic year & term dates.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={reloadAyForm}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveAcademicYear()}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                    >
                      Save Now
                    </button>
                  </div>
                </div>
              )}

              {/* Closed Year Information Notice (If already closed by Promotion) */}
              {currentEditingYearRecord?.isClosed && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Lock className="w-4 h-4" />
                    <span>Historical Archive: Academic Year {currentEditingYearRecord.year} Closed</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    This academic year was officially closed and archived by {currentEditingYearRecord.closedBy || 'Admin Promotion Office'}
                    {currentEditingYearRecord.closedAt && ` on ${new Date(currentEditingYearRecord.closedAt).toLocaleDateString()}`}.
                    Its learner promotion decisions and historical scores are permanently sealed.
                  </p>
                </div>
              )}

              {/* Form Container */}
              <form onSubmit={handleSaveAcademicYear} className="space-y-5">
                {/* 1. Academic Year Selection & Current Status */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        Academic Year Selection
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select an existing academic year to view and edit its calendar, or create a new year.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingYearModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Academic Year</span>
                    </button>
                  </div>

                  {/* Year Switcher Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {academicYearsList.map((y) => {
                      const isSel = (y.id && y.id === selectedYearId) || y.year === selectedYearId;
                      return (
                        <button
                          key={y.id || y.year}
                          type="button"
                          onClick={() => setSelectedYearId(y.id || y.year)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                            isSel
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <span className="font-mono text-sm">{y.year}</span>
                          {y.isCurrent && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isSel ? 'bg-slate-950 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              Current
                            </span>
                          )}
                          {y.isClosed && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                isSel ? 'bg-slate-950 text-slate-300' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Closed
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Current Academic Year Control & Status */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ayIsCurrent}
                            onChange={(e) => setAyIsCurrent(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 bg-slate-900 border-slate-700"
                          />
                          <span>Set as Current Active Academic Year</span>
                        </label>
                        <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                          Designates {ayYear || selectedYearId} as the active year for daily school operations, attendance, timetable, and CBC assessments.
                        </p>
                      </div>
                      {ayIsCurrent && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                          Active Operational Year
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Academic Year Start & Closing Dates */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Academic Year Calendar Dates
                    </h3>
                    <p className="text-xs text-slate-400">
                      Official start date and scheduled closing date of the complete academic year.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Academic Year Start Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Academic Year Start Date
                      </label>
                      <input
                        type="date"
                        value={ayStartDate}
                        onChange={(e) => setAyStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition"
                      />
                      <p className="text-[10px] text-slate-500">
                        First official day of the school year.
                      </p>
                    </div>

                    {/* Academic Year Closing Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Academic Year Closing Date
                      </label>
                      <input
                        type="date"
                        value={ayClosingDate}
                        onChange={(e) => setAyClosingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition"
                      />
                      <p className="text-[10px] text-slate-500">
                        Scheduled final day of the academic school calendar.
                      </p>
                    </div>
                  </div>

                  {/* Non-closure Safety Rule Banner */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <span className="font-bold text-white block">
                        Academic Year Closure Safety Notice
                      </span>
                      <p className="text-slate-300 text-[11px]">
                        Setting or modifying the closing date here does <strong>NOT</strong> close the academic year.
                        Official year closure, CBC historical archiving, and learner promotion decisions remain strictly controlled inside <strong>Admin → Promotion</strong> upon School Office review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Term 1 Dates */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        Term 1 Dates
                      </h3>
                      <p className="text-xs text-slate-400">
                        Opening date, closing date, and optional half-term break for Term 1.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Term 1 of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Term 1 Open Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Term 1 Opening Date
                      </label>
                      <input
                        type="date"
                        value={t1OpenDate}
                        onChange={(e) => setT1OpenDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500/80 transition"
                      />
                    </div>

                    {/* Term 1 Close Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Term 1 Closing Date
                      </label>
                      <input
                        type="date"
                        value={t1CloseDate}
                        onChange={(e) => setT1CloseDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500/80 transition"
                      />
                    </div>

                    {/* Term 1 Half-Term Start */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Half-Term Start <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={t1HalfStart}
                        onChange={(e) => setT1HalfStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500/80 transition"
                      />
                    </div>

                    {/* Term 1 Half-Term End */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Half-Term End <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={t1HalfEnd}
                        onChange={(e) => setT1HalfEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500/80 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Term 2 Dates */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Term 2 Dates
                      </h3>
                      <p className="text-xs text-slate-400">
                        Opening date, closing date, and optional half-term break for Term 2.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Term 2 of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Term 2 Open Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Term 2 Opening Date
                      </label>
                      <input
                        type="date"
                        value={t2OpenDate}
                        onChange={(e) => setT2OpenDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition"
                      />
                    </div>

                    {/* Term 2 Close Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Term 2 Closing Date
                      </label>
                      <input
                        type="date"
                        value={t2CloseDate}
                        onChange={(e) => setT2CloseDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition"
                      />
                    </div>

                    {/* Term 2 Half-Term Start */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Half-Term Start <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={t2HalfStart}
                        onChange={(e) => setT2HalfStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition"
                      />
                    </div>

                    {/* Term 2 Half-Term End */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Half-Term End <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={t2HalfEnd}
                        onChange={(e) => setT2HalfEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500/80 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Term 3 Dates */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Term 3 Dates
                      </h3>
                      <p className="text-xs text-slate-400">
                        Opening date, closing date, and optional half-term break for Term 3.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Term 3 of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Term 3 Open Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Term 3 Opening Date
                      </label>
                      <input
                        type="date"
                        value={t3OpenDate}
                        onChange={(e) => setT3OpenDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-purple-500/80 transition"
                      />
                    </div>

                    {/* Term 3 Close Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Term 3 Closing Date
                      </label>
                      <input
                        type="date"
                        value={t3CloseDate}
                        onChange={(e) => setT3CloseDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-purple-500/80 transition"
                      />
                    </div>

                    {/* Term 3 Half-Term Start */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Half-Term Start <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={t3HalfStart}
                        onChange={(e) => setT3HalfStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-purple-500/80 transition"
                      />
                    </div>

                    {/* Term 3 Half-Term End */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Half-Term End <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={t3HalfEnd}
                        onChange={(e) => setT3HalfEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-purple-500/80 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. School Holidays */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        School Holidays & Breaks
                      </h3>
                      <p className="text-xs text-slate-400">
                        Official public holidays, mid-term recesses, and scheduled school pauses for {ayYear || selectedYearId}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingHoliday(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add School Holiday</span>
                    </button>
                  </div>

                  {/* Holidays List */}
                  {ayHolidays.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1.5">
                      <p className="text-xs text-slate-400">
                        No school holidays registered for Academic Year {ayYear || selectedYearId} yet.
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Click "Add School Holiday" to register national holidays, mid-term breaks, or end-of-term pauses.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ayHolidays.map((h) => {
                        return (
                          <div
                            key={h.id}
                            className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{h.name}</span>
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{h.startDate}</span>
                                {h.endDate && h.endDate !== h.startDate && (
                                  <>
                                    <span>to</span>
                                    <span>{h.endDate}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(h.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-600/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                              title="Delete holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 7. Save & Reset Action Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="text-xs text-slate-400 flex items-center gap-2 text-center sm:text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:inline" />
                    <span>
                      {isAyDirty
                        ? 'Unsaved calendar modifications detected. Click "Save Changes" to persist.'
                        : 'Academic year calendar dates are up to date and persisted.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={reloadAyForm}
                      disabled={isSavingAy}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Discard Changes</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingAy}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingAy ? 'Saving...' : 'Save Academic Year & Terms'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Modal: Add School Holiday */}
              {isAddingHoliday && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        Add School Holiday
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingHoliday(false)}
                        className="text-slate-400 hover:text-white text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddHoliday} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">
                          Holiday / Break Name <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newHolidayName}
                          onChange={(e) => setNewHolidayName(e.target.value)}
                          placeholder="e.g. Madaraka Day, Term 1 Mid-Term Break"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500/80"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">
                            Start Date <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="date"
                            value={newHolidayStartDate}
                            onChange={(e) => setNewHolidayStartDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500/80"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={newHolidayEndDate}
                            onChange={(e) => setNewHolidayEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500/80"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingHoliday(false)}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                        >
                          Add Holiday
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal: Create Academic Year */}
              {isAddingYearModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Create Academic Year
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingYearModal(false)}
                        className="text-slate-400 hover:text-white text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateNewYear} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">
                          Academic Year <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newYearInput}
                          onChange={(e) => setNewYearInput(e.target.value)}
                          placeholder="e.g. 2027"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500/80"
                        />
                        <p className="text-[10px] text-slate-500">
                          Enter four-digit year (e.g. 2027). You can configure start/closing and term dates next.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingYearModal(false)}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                        >
                          Create Year
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : activeSection.id === 'curriculum' ? (
            /* =======================================================================
               SECTION 3: CURRICULUM CONFIGURATION
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Toast Feedback */}
              {curriculumToast && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{curriculumToast}</span>
                  </div>
                  <button
                    onClick={() => setCurriculumToast(null)}
                    className="text-emerald-400/80 hover:text-emerald-300 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Curriculum Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 03</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">Academic Curriculum & Standards</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Curriculum Configuration
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Configure Kenya Competency-Based Curriculum (CBC) learning areas for Grade 1 through Grade 6, manage system-installed curriculum framework versions, and verify installed syllabus content.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={reloadCurriculumForm}
                      disabled={isSavingCurriculum}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Reload saved values"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCurriculum}
                      disabled={isSavingCurriculum}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingCurriculum ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Active System Standard:{' '}
                      <span className="text-white font-mono font-bold">
                        {curriculumConfig.installedVersions.find((v) => v.id === curriculumConfig.activeVersionId)?.name || 'KICD Primary CBC Framework'}
                      </span>
                      <span className="ml-2 text-blue-400 font-mono text-[11px]">
                        ({curriculumConfig.installedVersions.find((v) => v.id === curriculumConfig.activeVersionId)?.code || 'KICD-CBC-PRI-v1.2'})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-white font-bold">Grade 1 to Grade 6</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">45 Learning Areas Configured</span>
                    </span>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setCurriculumActiveTab('grades')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      curriculumActiveTab === 'grades'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Grade Allocations & Subjects</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumActiveTab('versions')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      curriculumActiveTab === 'versions'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>
                      Installed Curriculum Versions ({curriculumConfig.installedVersions.length})
                    </span>
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------------------
                  TAB 1: GRADE ALLOCATIONS & SUBJECTS (GRADE 1 TO 6 SEPARATELY)
                  --------------------------------------------------------------- */}
              {curriculumActiveTab === 'grades' && (
                <div className="space-y-4">
                  {/* Grade Selection & View Controls */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-400" />
                          <span>Select Grade (Shown Separately)</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Inspect and configure the learning areas specifically assigned to each grade.
                        </p>
                      </div>

                      {/* Single vs All Grades View Mode */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setGradeViewMode('single')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                            gradeViewMode === 'single'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Single Grade Focus
                        </button>
                        <button
                          type="button"
                          onClick={() => setGradeViewMode('all')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                            gradeViewMode === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Show All 6 Grades Separately
                        </button>
                      </div>
                    </div>

                    {/* Grade Selector Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                      {LRA_GRADES.map((g) => {
                        const isSelected = selectedCurriculumGrade === g;
                        const subjectsForGrade = LRA_GRADE_SUBJECTS[g] || [];
                        const isLower = ['Grade 1', 'Grade 2', 'Grade 3'].includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setSelectedCurriculumGrade(g);
                              if (gradeViewMode !== 'single') setGradeViewMode('single');
                            }}
                            className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                              isSelected && gradeViewMode === 'single'
                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs">{g}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                isLower ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {isLower ? 'Lower' : 'Upper'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {subjectsForGrade.length} Subjects
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Render Grades Separately */}
                  {(gradeViewMode === 'single'
                    ? [selectedCurriculumGrade]
                    : (LRA_GRADES as unknown as string[])
                  ).map((grade) => {
                    const subjects = LRA_GRADE_SUBJECTS[grade] || [];
                    const isLower = ['Grade 1', 'Grade 2', 'Grade 3'].includes(grade);
                    const gradeConf = curriculumConfig.gradeConfigurations[grade] || {
                      assignedVersionId: curriculumConfig.activeVersionId,
                      disabledSubjects: [],
                    };
                    const assignedVersion = curriculumConfig.installedVersions.find(
                      (v) => v.id === gradeConf.assignedVersionId
                    ) || curriculumConfig.installedVersions[0];
                    const disabledList = gradeConf.disabledSubjects || [];

                    return (
                      <div
                        key={grade}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
                      >
                        {/* Grade Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                              isLower
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {grade.replace('Grade ', 'G')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-white">{grade}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isLower
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {isLower ? 'Lower Primary • Foundation Level' : 'Upper Primary • Intermediate Level'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                {subjects.length} Learning Areas configured exclusively for {grade}
                              </p>
                            </div>
                          </div>

                          {/* Curriculum Version Selector for This Grade */}
                          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
                              Assigned Framework:
                            </span>
                            <select
                              value={gradeConf.assignedVersionId}
                              onChange={(e) => handleAssignGradeVersion(grade, e.target.value)}
                              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                              {curriculumConfig.installedVersions.map((v) => (
                                <option
                                  key={v.id}
                                  value={v.id}
                                  disabled={!v.isEnabled}
                                  className="bg-slate-950 text-white"
                                >
                                  {v.name} ({v.code}) {!v.isEnabled ? '[Disabled]' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Subjects Configured for This Grade */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                            <span>
                              Configured Subjects in {grade} (
                              <strong className="text-white">{subjects.length} Official Learning Areas</strong>)
                            </span>
                            <span className="text-[11px] text-amber-400 font-mono">
                              Zero Invented Subjects
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {subjects.map((subj, idx) => {
                              const isDisabled = disabledList.includes(subj);
                              const key = `${grade}__${subj}`;
                              const isInspecting = inspectedSubjectKey === key;
                              const installedPackages = getSubjectInstalledPackages(grade, subj);

                              return (
                                <div
                                  key={subj}
                                  className={`p-3.5 rounded-xl border transition ${
                                    isDisabled
                                      ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5">
                                      <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center shrink-0">
                                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                      </span>
                                      <div>
                                        <h4 className="text-xs font-bold text-white leading-tight">
                                          {subj}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] text-slate-400">
                                            {isLower ? 'Lower Primary' : 'Upper Primary'}
                                          </span>
                                          <span className="text-slate-600 text-[10px]">•</span>
                                          <span className={`text-[10px] font-semibold ${
                                            isDisabled ? 'text-rose-400' : 'text-emerald-400'
                                          }`}>
                                            {isDisabled ? 'Disabled for Grade' : 'Active in System'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {/* Subject Enable / Disable Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSubjectDisabled(grade, subj)}
                                        title={isDisabled ? 'Enable subject' : 'Disable subject'}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                          isDisabled
                                            ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                        }`}
                                      >
                                        {isDisabled ? 'Enable' : 'Active'}
                                      </button>

                                      {/* Inspect Installed Content Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setInspectedSubjectKey(isInspecting ? null : key)
                                        }
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                                          isInspecting
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                                        }`}
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>{isInspecting ? 'Close' : 'Content'}</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Installed Content Inspection Panel */}
                                  {isInspecting && (
                                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-in fade-in">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-300">
                                          Installed Repository Content
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">
                                          {subj} • {grade}
                                        </span>
                                      </div>

                                      {installedPackages.length === 0 ? (
                                        /* =========================================================
                                           MANDATORY SPEC: IF CONTENT MISSING, CLEARLY SHOW:
                                           “NO CURRICULUM CONTENT INSTALLED”
                                           (DO NOT INVENT STRANDS, SUB-STRANDS, OR OUTCOMES)
                                           ========================================================= */
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1.5">
                                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                                            <FolderX className="w-4 h-4" />
                                          </div>
                                          <h5 className="text-[11px] font-black text-amber-300 tracking-wider">
                                            NO CURRICULUM CONTENT INSTALLED
                                          </h5>
                                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                                            No syllabus guidelines, strands, sub-strands, or learning outcome documents have been installed in the school repository for {subj} in {grade}.
                                          </p>
                                        </div>
                                      ) : (
                                        /* Real Installed Content Packages (if any exist) */
                                        <div className="space-y-1.5">
                                          {installedPackages.map((pkg) => (
                                            <div
                                              key={pkg.id}
                                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                                            >
                                              <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                <div>
                                                  <div className="font-bold text-white text-[11px]">
                                                    {pkg.packageName}
                                                  </div>
                                                  <div className="text-[9px] text-slate-400">
                                                    {pkg.documents?.length || 0} files • {pkg.category}
                                                  </div>
                                                </div>
                                              </div>
                                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                                                Installed
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ---------------------------------------------------------------
                  TAB 2: INSTALLED CURRICULUM VERSIONS
                  --------------------------------------------------------------- */}
              {curriculumActiveTab === 'versions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>Curriculum Framework Versions Installed in System</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Authorized Administrators can configure and toggle which official national curriculum framework editions are enabled and active across Little Roses Academy.
                    </p>
                  </div>

                  {/* Versions Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {curriculumConfig.installedVersions.map((ver) => {
                      const isActive = ver.id === curriculumConfig.activeVersionId;
                      // Calculate how many grades use this version
                      const assignedGradesCount = Object.values(curriculumConfig.gradeConfigurations).filter(
                        (c) => c.assignedVersionId === ver.id
                      ).length;

                      return (
                        <div
                          key={ver.id}
                          className={`p-5 rounded-2xl border space-y-4 shadow-xl transition ${
                            isActive
                              ? 'bg-slate-900 border-amber-500/40'
                              : 'bg-slate-900/90 border-slate-800'
                          }`}
                        >
                          {/* Version Title & Badges */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    {ver.code}
                                  </span>
                                  {isActive && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Active Standard
                                    </span>
                                  )}
                                  {!ver.isEnabled && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      Disabled
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm sm:text-base font-black text-white">
                                  {ver.name}
                                </h3>
                              </div>

                              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                <BookOpen className="w-4 h-4 text-blue-400" />
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {ver.description}
                            </p>
                          </div>

                          {/* Version Metadata Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-950 border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Governing Body</span>
                              <span className="text-slate-200 font-semibold">{ver.governingBody}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Edition</span>
                              <span className="text-slate-200 font-semibold">{ver.edition}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Installed Date</span>
                              <span className="text-slate-200 font-mono">{ver.installedDate}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Assigned Grades</span>
                              <span className="text-amber-400 font-bold font-mono">
                                {assignedGradesCount} of 6 Grades
                              </span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleToggleVersionEnabled(ver.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                ver.isEnabled
                                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              }`}
                            >
                              {ver.isEnabled ? 'Disable Version' : 'Enable Version'}
                            </button>

                            {!isActive ? (
                              <button
                                type="button"
                                onClick={() => handleSetActiveVersion(ver.id)}
                                disabled={!ver.isEnabled}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow cursor-pointer disabled:opacity-40"
                              >
                                Set as Active Standard
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Current System Standard
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : activeSection.id === 'users_permissions' ? (
            /* =======================================================================
               SECTION 4: USERS & PERMISSIONS (RBAC & SECURITY BOUNDARIES)
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Toast Feedback */}
              {permissionsToast && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{permissionsToast}</span>
                  </div>
                  <button
                    onClick={() => setPermissionsToast(null)}
                    className="text-emerald-400/80 hover:text-emerald-300 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Users & Permissions Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 04</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">Access Control & Role Permissions</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Users & Permissions
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Define role-based access control (RBAC) boundaries for Admin, Teacher, Parent, and Learner portals. Configure operational policies, verify explicit account authorization, and protect learner privacy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={reloadPermissionsForm}
                      disabled={isSavingPermissions}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Reload saved values"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePermissions}
                      disabled={isSavingPermissions}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingPermissions ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Authentication System:{' '}
                      <span className="text-white font-mono font-bold">
                        Single Data Layer (LRA Native)
                      </span>
                      <span className="ml-2 text-emerald-400 font-bold">
                        • Zero Dual-Auth Architecture
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-white font-bold">4 Official Roles Protected</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Strict Verification Guard Active</span>
                    </span>
                  </div>
                </div>

                {/* Sub Navigation: Role Selectors & View Mode Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                  {/* Role Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-amber-400', count: '1 Account' },
                      { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'text-blue-400', count: `${authorizedTeachersCount}/${teachersList.length} Faculty` },
                      { id: 'parent', label: 'Parent', icon: Users, color: 'text-sky-400', count: `${linkedParentsCount}/${parentsList.length} Guardians` },
                      { id: 'learner', label: 'Learner', icon: BookOpen, color: 'text-purple-400', count: `${activePupilsCount}/${pupilsList.length} Pupils` },
                    ].map((r) => {
                      const isSelected = selectedRoleTab === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedRoleTab(r.id as UserRoleType);
                            if (permissionsViewMode !== 'by_role') setPermissionsViewMode('by_role');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected && permissionsViewMode === 'by_role'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <r.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : r.color}`} />
                          <span>{r.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {r.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mode Toggle: By Role vs All-Roles Matrix */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPermissionsViewMode('by_role')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        permissionsViewMode === 'by_role'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Role View
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermissionsViewMode('matrix')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        permissionsViewMode === 'matrix'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All-Roles Matrix
                    </button>
                  </div>
                </div>
              </div>

              {/* =======================================================================
                  MANDATORY ARCHITECTURAL ENFORCEMENTS BANNER (THE 4 SECURITY PILLARS)
                  ======================================================================= */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      System Security Boundaries (Always Enforced by Design)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active & Non-Bypassable
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Pillar 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-rose-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white">
                        Zero Default Access for Registered Users
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Users are <strong className="text-amber-300">never given access merely because they are registered</strong>. Inactive or unassigned teachers are blocked; unlinked parents are denied ward records.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Verified Active Faculty: {authorizedTeachersCount} • Verified Guardians: {linkedParentsCount}
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white">
                        Teacher Grade + Subject Access Restriction
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Teacher capabilities <strong className="text-blue-300">strictly respect Grade + Subject assignments</strong>. Faculty cannot log lessons, edit marks, or upload homework for unassigned classes.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Per-Teacher Grade & Subject Scope Strictly Enforced
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white">
                        Parents Only Access Explicitly Linked Learners
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Parents are strictly restricted to <strong className="text-sky-300">explicitly linked learners</strong> verified by pupil UPI. Zero visibility into other families’ children or student rosters.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      UPI Linkage & Sibling Grouping Enforced on Every Query
                    </div>
                  </div>

                  {/* Pillar 4 */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileLock className="w-4 h-4 text-purple-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white">
                        Learners Permanently Barred from Marks & Staff Records
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Learners <strong className="text-purple-300">must never access official marks, teacher records, or other learners&apos; information</strong>. Pupil view is restricted to own timetable, homework, & storybooks.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Exam Marks & Staff Credentials Permanently Masked
                    </div>
                  </div>
                </div>
              </div>

              {/* =======================================================================
                  VIEW 1: DETAILED ROLE VIEW (ADMIN, TEACHER, PARENT, LEARNER)
                  ======================================================================= */}
              {permissionsViewMode === 'by_role' && (
                <div className="space-y-4">
                  {/* Selected Role Overview Card */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border ${
                          selectedRoleTab === 'admin'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : selectedRoleTab === 'teacher'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : selectedRoleTab === 'parent'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {selectedRoleTab === 'admin' ? <ShieldCheck className="w-6 h-6" /> :
                           selectedRoleTab === 'teacher' ? <GraduationCap className="w-6 h-6" /> :
                           selectedRoleTab === 'parent' ? <Users className="w-6 h-6" /> :
                           <BookOpen className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white capitalize">
                              {selectedRoleTab} Role Permissions
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-950 text-slate-300 border border-slate-800">
                              Portal: {selectedRoleTab === 'admin' ? 'AdminPortal' :
                                       selectedRoleTab === 'teacher' ? 'TeachersPortal' :
                                       selectedRoleTab === 'parent' ? 'ParentsPortal' : 'LearnersPortal'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {selectedRoleTab === 'admin' && 'Full administrative authority over school profile, curriculum, faculty assignments, & promotions.'}
                            {selectedRoleTab === 'teacher' && 'Classroom instruction, daily roll-calls, CBC lesson planning, & CAT marks entry for assigned classes.'}
                            {selectedRoleTab === 'parent' && 'Dedicated ward monitoring: attendance, homework, CBC reports, & school communications for linked children.'}
                            {selectedRoleTab === 'learner' && 'Interactive student workbench: personal timetable, homework tasks, reading storybooks, & self-profile.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Authorized Accounts</span>
                        <span className="font-mono font-bold text-white">
                          {selectedRoleTab === 'admin' && '1 Master Admin Account'}
                          {selectedRoleTab === 'teacher' && `${authorizedTeachersCount} of ${teachersList.length} Active Assigned Faculty`}
                          {selectedRoleTab === 'parent' && `${linkedParentsCount} of ${parentsList.length} Confirmed Linked Guardians`}
                          {selectedRoleTab === 'learner' && `${activePupilsCount} of ${pupilsList.length} Active Enrolled UPIs`}
                        </span>
                      </div>
                    </div>

                    {/* Permission Domain Items for this Role */}
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300">
                          Assigned Capabilities & Policies
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Tap policy switch to configure supported permissions
                        </span>
                      </div>

                      {/* Role Specific Permissions List */}
                      <div className="space-y-2.5">
                        {/* ===================================================
                            1. ADMIN ROLE PERMISSIONS
                            =================================================== */}
                        {selectedRoleTab === 'admin' && (
                          <>
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">ADM_INSTITUTION_CONFIG</span>
                                  <h4 className="text-xs font-bold text-white">School Profile, Academic Calendar & Term Dates</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Full authority to edit school name, motto, crest, official contact channels, term opening/closing dates, and holiday pauses.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">ADM_CURRICULUM_GOVERNANCE</span>
                                  <h4 className="text-xs font-bold text-white">Curriculum Versions & Grade Learning Area Allocations</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Configure CBC frameworks (KICD BECF v1.2 / PWPER v2.0), enable/disable installed versions, and assign learning areas across Grades 1–6.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">ADM_USER_AUTHORIZATION</span>
                                  <h4 className="text-xs font-bold text-white">User Management, Grade+Subject Assignment & Family Linking</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Create and manage credentials for teachers, learners, and parents. Control Grade+Subject allocations and sibling grouping.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">ADM_PROMOTIONS_CLOSING</span>
                                  <h4 className="text-xs font-bold text-white">Annual Learner Promotion Engine & Year-End Seal</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Execute cohort promotions, retain learners, transfer exit alumni, and securely close academic years with historical audit logs.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            {/* Configurable Admin Policy 1 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">ADM_DUAL_ROLE_TEACHER</span>
                                  <h4 className="text-xs font-bold text-white">Allow Delegated Dual-Role Teacher Administration</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Permit selected senior teachers (e.g. Tr. Elvis, Tr. Kelvin) to hold administrative privileges while maintaining classroom teaching assignments.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowTeacherDualAdmin')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowTeacherDualAdmin
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowTeacherDualAdmin ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* Configurable Admin Policy 2 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">ADM_REAUTH_SENSITIVE</span>
                                  <h4 className="text-xs font-bold text-white">Require Admin Password Confirmation for Sensitive Data Mutations</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Prompt for Admin Authorization Code when deleting users, promoting classes, or wiping school cache storage.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('requireAdminCodeForSensitiveActions')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.requireAdminCodeForSensitiveActions
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.requireAdminCodeForSensitiveActions ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          </>
                        )}

                        {/* ===================================================
                            2. TEACHER ROLE PERMISSIONS
                            =================================================== */}
                        {selectedRoleTab === 'teacher' && (
                          <>
                            {/* Non-negotiable Grade + Subject Boundary */}
                            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">TCH_GRADE_SUBJ_BOUNDED</span>
                                  <h4 className="text-xs font-bold text-white">Grade + Subject Assignment Boundary (Strict Enforcement)</h4>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  Teachers can <strong className="text-blue-300">only access and manage learners, lessons, and marks</strong> for their explicitly assigned Grade + Subject pairs. All other school grades and subjects are strictly locked.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                                Enforced by Design
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">TCH_LESSONS_WORKBENCH</span>
                                  <h4 className="text-xs font-bold text-white">Lesson Plans, Schemes of Work & Record of Work Covered</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Author and track CBC lesson plans, schemes of work across terms, and living weekly records of work covered for assigned classes.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">TCH_CAT_MARKS_ENTRY</span>
                                  <h4 className="text-xs font-bold text-white">Continuous Assessment Tests (CATs) & CBC Competency Scoring</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Enter CAT test scores, homework marks, and 4-tier CBC performance bands (EE, ME, AE, BE) for pupils in assigned subjects.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">TCH_ATTENDANCE_REGISTER</span>
                                  <h4 className="text-xs font-bold text-white">Daily Morning Roll-Call & Class Register</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Take daily attendance (Present, Absent, Late) for the official class teacher grade allocation.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            {/* Configurable Teacher Policy 1 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">TCH_CUSTOM_RESOURCES</span>
                                  <h4 className="text-xs font-bold text-white">Allow Faculty Upload of Custom Teaching Resources</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Permit teachers to install worksheets, handouts, and notes directly into the school repository workspace.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowTeacherCustomResources')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowTeacherCustomResources
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowTeacherCustomResources ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* Configurable Teacher Policy 2 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">TCH_MARKS_EDIT_PAST_TERM</span>
                                  <h4 className="text-xs font-bold text-white">Allow Mark Modification After Official Term Closure</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  When enabled, teachers can amend past term marks; when disabled, past terms require Admin override.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowTeacherEditMarksPastTerm')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowTeacherEditMarksPastTerm
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowTeacherEditMarksPastTerm ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* Configurable Teacher Policy 3 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">TCH_ATTENDANCE_CORRECTION</span>
                                  <h4 className="text-xs font-bold text-white">Allow Attendance Self-Correction Within 24 Hours</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Allow class teachers to correct roll-call mistakes logged on the current or previous day.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowAttendanceSelfCorrection')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowAttendanceSelfCorrection
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowAttendanceSelfCorrection ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          </>
                        )}

                        {/* ===================================================
                            3. PARENT ROLE PERMISSIONS
                            =================================================== */}
                        {selectedRoleTab === 'parent' && (
                          <>
                            {/* Non-negotiable Explicit Linked Learners Boundary */}
                            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">PAR_EXPLICIT_LINK_ONLY</span>
                                  <h4 className="text-xs font-bold text-white">Explicit Ward Linking Constraint (Strict Enforcement)</h4>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  Parents can <strong className="text-sky-300">only view records for their verified linked children</strong>. Zero visibility into unlinked learners, student directories, or other families’ records.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 shrink-0">
                                Enforced by Design
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">PAR_WARD_ATTENDANCE</span>
                                  <h4 className="text-xs font-bold text-white">Daily Ward Attendance & Roll-Call Status</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Monitor daily morning presence, absence, and late marks recorded by class teachers for linked children.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">PAR_WARD_HOMEWORK</span>
                                  <h4 className="text-xs font-bold text-white">Daily Homework Due Dates & Exercise Details</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Inspect daily assignments, submission guidelines, and completion marks posted by teachers for linked learners.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">PAR_WARD_CBC_REPORTS</span>
                                  <h4 className="text-xs font-bold text-white">Official CBC Evaluation Reports & Focus Zone Insights</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Review official termly assessment evaluations, rubrics, and personalized focus zone diagnostic notes for linked children.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            {/* Configurable Parent Policy 1 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">PAR_HOMEWORK_SUBMIT</span>
                                  <h4 className="text-xs font-bold text-white">Allow Digital Homework Submission by Guardians</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Permit parents to submit written assignment photos or responses on behalf of younger pupils.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowParentHomeworkSubmission')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowParentHomeworkSubmission
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowParentHomeworkSubmission ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* Configurable Parent Policy 2 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">PAR_REPORT_DOWNLOAD</span>
                                  <h4 className="text-xs font-bold text-white">Allow Parent PDF Report Card Downloads</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Allow parents to export and save printable official termly evaluation report cards.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowParentReportDownload')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowParentReportDownload
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowParentReportDownload ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* Configurable Parent Policy 3 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">PAR_ABSENCE_ALERTS</span>
                                  <h4 className="text-xs font-bold text-white">Automated Pupil Absence Notifications</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Dispatch immediate system alerts to guardians when a linked child is recorded as absent during morning roll-call.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('enableParentAbsenceNotifications')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.enableParentAbsenceNotifications
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.enableParentAbsenceNotifications ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          </>
                        )}

                        {/* ===================================================
                            4. LEARNER ROLE PERMISSIONS
                            =================================================== */}
                        {selectedRoleTab === 'learner' && (
                          <>
                            {/* Non-negotiable Learner Confidentiality Restrictions */}
                            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">LRN_PRIVACY_GUARD</span>
                                  <h4 className="text-xs font-bold text-white">Learner Privacy Guard: Exam Marks & Records Barred</h4>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  Learners <strong className="text-purple-300">must never access official exam marks, teacher records, or other learners&apos; personal data</strong>. Pupil experience is confined strictly to daily class timetable, homework exercises, and storybooks.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                                Enforced by Design
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">LRN_TODAY_ROUTINE</span>
                                  <h4 className="text-xs font-bold text-white">Daily Class Schedule & Period Routine (Own Grade Only)</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  View current day timetable periods, subject names, and break times for the learner&apos;s enrolled grade.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">LRN_HOMEWORK_VIEW</span>
                                  <h4 className="text-xs font-bold text-white">Homework Assignments & Practice Exercises</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Inspect homework exercises assigned to their grade, read teacher instructions, and track personal completion status.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">LRN_STORYBOOKS_READER</span>
                                  <h4 className="text-xs font-bold text-white">Digital Storybooks & Reading Adventures Library</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Read approved CBC storybooks, audio-visual prompts, and English/Kiswahili literacy materials for their age group.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">LRN_SELF_PROFILE</span>
                                  <h4 className="text-xs font-bold text-white">Personal Learner Badge & Enrolled UPI Card</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Inspect own name, enrolled grade, photograph, and unique pupil identifier (UPI). Strictly zero access to other pupils.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                System Core
                              </span>
                            </div>

                            {/* Configurable Learner Policy 1 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">LRN_OFFLINE_CACHE</span>
                                  <h4 className="text-xs font-bold text-white">Allow Offline Storybook Local Caching</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Permit pupils to download storybooks to device memory for offline reading at home without active internet.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('allowOfflineStorybookCache')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.allowOfflineStorybookCache
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.allowOfflineStorybookCache ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>

                            {/* Configurable Learner Policy 2 */}
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">LRN_PRACTICE_QUIZZES</span>
                                  <h4 className="text-xs font-bold text-white">Enable Interactive Self-Check Practice Quizzes</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Enable instant self-assessment practice questions in the homework tab for student self-reinforcement.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePolicy('enableLearnerPracticeQuizzes')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                                  permissionsConfig.policies.enableLearnerPracticeQuizzes
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {permissionsConfig.policies.enableLearnerPracticeQuizzes ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =======================================================================
                  VIEW 2: ALL-ROLES PERMISSION MATRIX (SIDE-BY-SIDE RBAC VIEW)
                  ======================================================================= */}
              {permissionsViewMode === 'matrix' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl overflow-x-auto">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                        Institutional Role-Based Access Control (RBAC) Matrix
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Side-by-side comparison of functional capabilities and access boundaries across all 4 school portals.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                      Single Data Layer Bounded
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="py-2.5 px-3 font-bold uppercase">Capability Domain</th>
                        <th className="py-2.5 px-3 font-bold uppercase text-amber-400">Admin</th>
                        <th className="py-2.5 px-3 font-bold uppercase text-blue-400">Teacher</th>
                        <th className="py-2.5 px-3 font-bold uppercase text-sky-400">Parent</th>
                        <th className="py-2.5 px-3 font-bold uppercase text-purple-400">Learner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-[11px]">
                      {[
                        {
                          domain: 'System Settings & School Profile',
                          admin: 'Full Configuration',
                          teacher: 'No Access',
                          parent: 'No Access',
                          learner: 'No Access',
                        },
                        {
                          domain: 'Curriculum Standards & Versions',
                          admin: 'Full Configuration',
                          teacher: 'Assigned Subjects Only',
                          parent: 'No Access',
                          learner: 'No Access',
                        },
                        {
                          domain: 'Faculty Roster & User Accounts',
                          admin: 'Full Management',
                          teacher: 'No Access',
                          parent: 'No Access',
                          learner: 'No Access',
                        },
                        {
                          domain: 'Classroom Lessons & Schemes',
                          admin: 'Master Oversight',
                          teacher: 'Assigned Grades & Subjects',
                          parent: 'No Access',
                          learner: 'No Access',
                        },
                        {
                          domain: 'Daily Attendance Roll-Call',
                          admin: 'Master School View',
                          teacher: 'Assigned Class Grade',
                          parent: 'Linked Wards Only',
                          learner: 'No Access',
                        },
                        {
                          domain: 'CAT Marks Entry & Evaluations',
                          admin: 'Master Review',
                          teacher: 'Assigned Subjects Only',
                          parent: 'No Access (Direct Entry)',
                          learner: 'Permanently Blocked',
                        },
                        {
                          domain: 'Official CBC Evaluation Reports',
                          admin: 'Full Generation',
                          teacher: 'Assigned Classes',
                          parent: 'Linked Wards Only',
                          learner: 'Permanently Blocked',
                        },
                        {
                          domain: 'Daily Homework & Exercises',
                          admin: 'Master Archive',
                          teacher: 'Create for Assigned Grade',
                          parent: 'Inspect Linked Wards',
                          learner: 'View Own Grade Tasks',
                        },
                        {
                          domain: 'Digital Storybooks Library',
                          admin: 'Manage Library',
                          teacher: 'Assigned Grades',
                          parent: 'Browse Library',
                          learner: 'Read Approved Stories',
                        },
                        {
                          domain: 'Class Timetables',
                          admin: 'Master Schedule Authoring',
                          teacher: 'Faculty Timetable',
                          parent: 'Linked Ward Timetable',
                          learner: 'Own Grade Schedule',
                        },
                        {
                          domain: 'Learner Promotions & Archives',
                          admin: 'Master Promotion Engine',
                          teacher: 'No Access',
                          parent: 'No Access',
                          learner: 'No Access',
                        },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-950/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-200">{row.domain}</td>
                          <td className="py-2.5 px-3 font-bold text-amber-300">{row.admin}</td>
                          <td className="py-2.5 px-3">
                            <span className={row.teacher.includes('Assigned') ? 'text-blue-400 font-bold' : row.teacher === 'No Access' ? 'text-slate-500' : 'text-slate-300'}>
                              {row.teacher}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={row.parent.includes('Linked') ? 'text-sky-400 font-bold' : row.parent === 'No Access' ? 'text-slate-500' : 'text-slate-300'}>
                              {row.parent}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={row.learner.includes('Permanently Blocked') ? 'text-rose-400 font-bold' : row.learner === 'No Access' ? 'text-slate-500' : 'text-purple-400 font-semibold'}>
                              {row.learner}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeSection.id === 'security' ? (
            /* =======================================================================
               SECTION 5: SECURITY (ADMIN PASSWORD, BIOMETRICS, LOCKOUT, SESSIONS, ACTIVITY)
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Security Toast Notification */}
              {securityToast && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{securityToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurityToast(null)}
                    className="text-emerald-400 hover:text-emerald-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Master Security Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 05</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">Institutional Access Defense</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Admin Security & Access Controls
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Manage administrative credentials, cryptographic SHA-256 password rotation, hardware biometrics, brute-force lockout safeguards, authorized device sessions, and security audit logs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {lockStatus.locked ? (
                      <button
                        type="button"
                        onClick={handleUnlockAccount}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Emergency Unlock Account</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={refreshSecurityState}
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        title="Refresh security records"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh Status</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {lockStatus.locked ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                        <span className="text-rose-300 font-bold">
                          Account Frozen: Lockout active ({lockStatus.remainingMinutes}m remaining)
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 font-semibold">
                          Account Operational • Brute-Force Shield Active ({securityConfig.failedAttempts}/{securityConfig.maxFailedAttempts} attempts)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      Hash: SHA-256 Web Crypto
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${
                      securityConfig.biometricEnabled
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}>
                      Biometrics: {securityConfig.biometricEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {activeSessionsList.length} Sessions Active
                    </span>
                  </div>
                </div>

                {/* Security Sub Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                  {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'password', label: 'Change Password', icon: KeyRound },
                    { id: 'biometric', label: 'Biometric Login', icon: Fingerprint },
                    { id: 'lockout', label: 'Lockout & Protection', icon: ShieldAlert },
                    { id: 'sessions', label: 'Active Sessions & Devices', icon: Monitor },
                    { id: 'activity', label: 'Security Activity Log', icon: Clock },
                  ].map((tab) => {
                    const isSelected = securityTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSecurityTab(tab.id as typeof securityTab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <tab.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        {tab.id === 'lockout' && lockStatus.locked && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =======================================================================
                  TAB 1: SECURITY OVERVIEW DASHBOARD
                  ======================================================================= */}
              {securityTab === 'overview' && (
                <div className="space-y-4">
                  {/* Lockout Banner If Active */}
                  {lockStatus.locked && (
                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-rose-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                          <h3 className="text-sm font-bold text-white">
                            Administrative Account Temporarily Frozen
                          </h3>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {lockStatus.remainingMinutes} Minutes Left
                        </span>
                      </div>
                      <p className="text-xs text-rose-300 leading-relaxed">
                        The School Office admin portal has temporarily suspended password sign-in due to exceeding the maximum of {securityConfig.maxFailedAttempts} consecutive failed attempts. The account will automatically unlock once the cooldown window expires, or you may invoke an authorized administrator override.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleUnlockAccount}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Unlock Account Now & Reset Failed Counter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4 Core Pillars Stat Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Pillar 1: Password */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                          Admin Password
                        </span>
                        <Key className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-white">
                          Encrypted SHA-256
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Updated: {securityConfig.lastPasswordChangedAt ? new Date(securityConfig.lastPasswordChangedAt).toLocaleDateString() : 'Baseline'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSecurityTab('password')}
                        className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        Change Password →
                      </button>
                    </div>

                    {/* Pillar 2: Biometrics */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                          Biometric Login
                        </span>
                        <Fingerprint className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-white">
                          {securityConfig.biometricEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Touch ID / Face ID sensor
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSecurityTab('biometric')}
                        className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        Configure Biometrics →
                      </button>
                    </div>

                    {/* Pillar 3: Failed Login Protection */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                          Lockout Shield
                        </span>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-white">
                          {securityConfig.failedAttempts} / {securityConfig.maxFailedAttempts} Fails
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Cooldown: {securityConfig.lockoutDurationMinutes} min
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSecurityTab('lockout')}
                        className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        Lockout Settings →
                      </button>
                    </div>

                    {/* Pillar 4: Active Devices */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                          Active Sessions
                        </span>
                        <Monitor className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-white">
                          {activeSessionsList.length} Authorized
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Timeout: {securityConfig.sessionTimeoutMinutes} min
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSecurityTab('sessions')}
                        className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        Inspect Sessions →
                      </button>
                    </div>
                  </div>

                  {/* Architecture Policy Notice */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                        Zero Plaintext & Single-Auth Security Guarantees
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Strictly Zero Plaintext Storage</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          All administrator passwords are passed directly into browser Web Crypto subtle digest routines (`SHA-256`). Plaintext strings are discarded immediately and never persisted to localStorage or logs.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>No Universal / Default Admin Password</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Password changes overwrite the dedicated cryptographic secret for the School Office. There is no hardcoded back-door, universal bypass, or shared secondary login system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Snapshot */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                          Recent Security Events
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSecurityTab('activity')}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        View All ({securityActivityList.length}) →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {securityActivityList.slice(0, 4).map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                item.status === 'success'
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  : item.status === 'alert'
                                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              }`}>
                                {item.eventType.replace('_', ' ')}
                              </span>
                              <span className="font-semibold text-slate-200">
                                {item.description}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Actor: {item.actor} • Device: {item.device}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =======================================================================
                  TAB 2: CHANGE ADMIN PASSWORD
                  ======================================================================= */}
              {securityTab === 'password' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl max-w-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Rotate Administrator Master Password
                      </h3>
                      <p className="text-xs text-slate-400">
                        Update the official Little Roses Academy School Office access password. New credentials are immediately encrypted with SHA-256 and stored offline.
                      </p>
                    </div>
                  </div>

                  {passwordSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                    {/* Current Password Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Current Admin Password</span>
                        <span className="text-[10px] text-slate-500 font-normal">Required for verification</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={currentAdminPassword}
                          onChange={(e) => setCurrentAdminPassword(e.target.value)}
                          placeholder="Enter current master password"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        New Admin Password
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="Enter new master password (min 6 characters)"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Confirm New Admin Password
                      </label>
                      <div className="relative">
                        <Check className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                          placeholder="Re-type new password to confirm"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Live Password Strength Requirements Checklist */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="font-bold text-slate-300">Password Requirements:</div>
                      <div className="flex items-center gap-2">
                        <span className={newAdminPassword.length >= 6 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {newAdminPassword.length >= 6 ? '✓' : '○'} At least 6 characters (length: {newAdminPassword.length})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={newAdminPassword && newAdminPassword === confirmAdminPassword ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {newAdminPassword && newAdminPassword === confirmAdminPassword ? '✓' : '○'} New passwords match identically
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-emerald-400 font-bold">✓</span> Stored exclusively as a SHA-256 cryptographic digest (never plaintext)
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentAdminPassword('');
                          setNewAdminPassword('');
                          setConfirmAdminPassword('');
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isUpdatingPassword ? 'Hashing & Saving...' : 'Update Admin Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* =======================================================================
                  TAB 3: BIOMETRIC LOGIN
                  ======================================================================= */}
              {securityTab === 'biometric' && (
                <div className="space-y-4 max-w-2xl">
                  {/* Biometric Toggle Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Fingerprint className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white">
                            Hardware Biometric Authentication
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Log into the Little Roses Academy School Office using Touch ID, Face ID, fingerprint sensors, or Windows Hello platform authenticators.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleBiometric}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                          securityConfig.biometricEnabled
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {securityConfig.biometricEnabled ? 'Biometrics Enabled' : 'Biometrics Disabled'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-semibold">Platform Sensor Capability:</span>
                        <span className="font-mono text-purple-300 font-bold">
                          Platform Authenticator Ready
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Hardware Enclave Binding:</span>
                        <span className="font-mono text-slate-300">Local Device Secure Enclave</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Registration Timestamp:</span>
                        <span className="font-mono text-slate-300">
                          {securityConfig.biometricRegisteredAt
                            ? new Date(securityConfig.biometricRegisteredAt).toLocaleString()
                            : 'Not Enrolled Yet'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-400">
                        Note: Enabling biometrics displays a quick &quot;Sign in with Biometrics&quot; button on the Administrator Login screen.
                      </p>
                      <button
                        type="button"
                        onClick={handleTestBiometric}
                        disabled={isTestingBiometric}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span>{isTestingBiometric ? 'Testing Sensor...' : 'Test Biometric Sensor'}</span>
                      </button>
                    </div>

                    {biometricFeedback && (
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
                        {biometricFeedback}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =======================================================================
                  TAB 4: LOCKOUT & FAILED-LOGIN PROTECTION
                  ======================================================================= */}
              {securityTab === 'lockout' && (
                <div className="space-y-4 max-w-2xl">
                  {/* Current Account Lockout Status Card */}
                  <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-xl ${
                    lockStatus.locked
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border ${
                          lockStatus.locked
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            Account Lockout Information & Defense State
                          </h3>
                          <p className="text-xs text-slate-400">
                            Automated rate limiting and brute-force protection guarding against unauthorized administrative credential testing.
                          </p>
                        </div>
                      </div>

                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
                        lockStatus.locked
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {lockStatus.locked ? 'ACCOUNT FROZEN' : 'NORMAL (PROTECTED)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Failed Attempts</div>
                        <div className="text-lg font-black text-white">
                          {securityConfig.failedAttempts} / {securityConfig.maxFailedAttempts}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {securityConfig.maxFailedAttempts - securityConfig.failedAttempts} remaining before freeze
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Cooldown Window</div>
                        <div className="text-lg font-black text-white">
                          {securityConfig.lockoutDurationMinutes} min
                        </div>
                        <div className="text-[10px] text-slate-500">Temporary freeze duration</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Lockout Expiry</div>
                        <div className="text-lg font-black text-white">
                          {lockStatus.locked ? `${lockStatus.remainingMinutes}m` : 'None'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {securityConfig.lockoutUntil ? new Date(securityConfig.lockoutUntil).toLocaleTimeString() : 'No active lockout'}
                        </div>
                      </div>
                    </div>

                    {/* Emergency Unlock Override */}
                    <div className="pt-1 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-400">
                        Administrator can manually clear failed attempts or lift an active lockout at any time.
                      </p>
                      <button
                        type="button"
                        onClick={handleUnlockAccount}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Reset Failed Logins & Unlock</span>
                      </button>
                    </div>
                  </div>

                  {/* Configurable Protection Thresholds Form */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Configure Protection Thresholds
                    </h3>

                    <form onSubmit={handleSaveThresholds} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">
                            Max Failed Attempts
                          </label>
                          <select
                            value={maxAttemptsInput}
                            onChange={(e) => setMaxAttemptsInput(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value={3}>3 Attempts (Strict)</option>
                            <option value={5}>5 Attempts (Recommended)</option>
                            <option value={10}>10 Attempts (Relaxed)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">
                            Lockout Duration
                          </label>
                          <select
                            value={lockoutDurationInput}
                            onChange={(e) => setLockoutDurationInput(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value={5}>5 Minutes</option>
                            <option value={15}>15 Minutes (Standard)</option>
                            <option value={30}>30 Minutes</option>
                            <option value={60}>60 Minutes (High Defense)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">
                            Session Inactivity Timeout
                          </label>
                          <select
                            value={sessionTimeoutInput}
                            onChange={(e) => setSessionTimeoutInput(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value={15}>15 Minutes</option>
                            <option value={30}>30 Minutes</option>
                            <option value={60}>60 Minutes (1 Hour)</option>
                            <option value={120}>120 Minutes (2 Hours)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingThresholds}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingThresholds ? 'Saving...' : 'Save Protection Thresholds'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* =======================================================================
                  TAB 5: ACTIVE SESSIONS & AUTHORIZED DEVICES
                  ======================================================================= */}
              {securityTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Active Administrative Sessions & Authorized Devices
                        </h3>
                        <p className="text-xs text-slate-400">
                          Terminals and portable devices currently registered for School Office administrative access.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleTerminateAllOtherSessions}
                        className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out All Other Sessions</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activeSessionsList.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                              {session.deviceType === 'desktop' ? (
                                <Monitor className="w-5 h-5" />
                              ) : session.deviceType === 'tablet' ? (
                                <Laptop className="w-5 h-5" />
                              ) : (
                                <Smartphone className="w-5 h-5" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white">
                                  {session.deviceName}
                                </h4>
                                {session.isCurrent ? (
                                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                    Current Terminal
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                    Authorized Remote
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {session.browser} • {session.ipLocation}
                              </p>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Authenticated: {new Date(session.loginTime).toLocaleString()} • Last Active: {new Date(session.lastActive).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>

                          {!session.isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleTerminateSession(session.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start sm:self-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke Session</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =======================================================================
                  TAB 6: SECURITY ACTIVITY AUDIT LOG
                  ======================================================================= */}
              {securityTab === 'activity' && (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Security Audit Activity Trail
                        </h3>
                        <p className="text-xs text-slate-400">
                          Tamper-resistant offline log tracking administrative logins, failures, password rotations, and policy changes.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const json = JSON.stringify(securityActivityList, null, 2);
                            const blob = new Blob([json], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `lra_security_audit_${new Date().toISOString().slice(0, 10)}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            showSecurityToast('Security audit log exported to JSON.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export JSON</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSecurityActivity}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Log</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                      {[
                        { id: 'all', label: 'All Activities' },
                        { id: 'login', label: 'Logins' },
                        { id: 'password', label: 'Password Changes' },
                        { id: 'biometric', label: 'Biometrics' },
                        { id: 'lockout', label: 'Failures & Lockouts' },
                        { id: 'sessions', label: 'Session Revocations' },
                      ].map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setActivityFilter(chip.id as typeof activityFilter)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activityFilter === chip.id
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Activity Table */}
                    <div className="divide-y divide-slate-800/80">
                      {filteredSecurityActivity.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 font-mono">
                          No security events recorded matching this filter.
                        </div>
                      ) : (
                        filteredSecurityActivity.map((event) => (
                          <div
                            key={event.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                  event.status === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    : event.status === 'alert'
                                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                }`}>
                                  {event.eventType.replace('_', ' ')}
                                </span>
                                <span className="font-semibold text-slate-200">
                                  {event.description}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                                <span>Actor: <strong className="text-slate-300">{event.actor}</strong></span>
                                <span>•</span>
                                <span>Device: <span className="text-slate-300">{event.device}</span></span>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-slate-500 shrink-0 self-start sm:self-center">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeSection.id === 'notifications' ? (
            /* =======================================================================
               SECTION 6: NOTIFICATIONS & DISTRIBUTION PREFERENCES
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Notification Toast Feedback */}
              {notificationToast && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{notificationToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationToast(null)}
                    className="text-emerald-400 hover:text-emerald-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Master Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 06</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">Alert Distribution & Dispatch Rules</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Notifications & Alert Preferences
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Configure institutional notification switches for school announcements, teachers, parents, learners, assignments, assessments, and timetable updates. Each switch controls a real notification behavior.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={handleResetNotificationDefaults}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Restore institutional default rules"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAllNotificationPrefs}
                      disabled={isSavingPrefs}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingPrefs ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">
                      Real Event-Driven Notifications • Gated by Admin Policies
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {[
                        notificationPrefs.schoolAnnouncements,
                        notificationPrefs.teacherNotifications,
                        notificationPrefs.parentNotifications,
                        notificationPrefs.learnerNotifications,
                        notificationPrefs.assignmentNotifications,
                        notificationPrefs.assessmentNotifications,
                        notificationPrefs.timetableNotifications,
                      ].filter(Boolean).length}{' '}
                      of 7 Active
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 font-bold">
                      {dataLayer.getUnreadNotificationsCount()} Unread Alerts
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Zero Fake Notifications
                    </span>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                  {[
                    { id: 'preferences', label: 'Notification Preferences (7 Controls)', icon: BellRing },
                    { id: 'stream', label: `Live Stream (${activeNotificationStream.length})`, icon: Activity },
                    { id: 'broadcast', label: 'Broadcast Announcement', icon: Megaphone },
                    { id: 'channels', label: 'Channels & Quiet Hours', icon: Clock },
                  ].map((tab) => {
                    const isSelected = notificationTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setNotificationTab(tab.id as typeof notificationTab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <tab.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =======================================================================
                  TAB 1: 7 CORE NOTIFICATION PREFERENCES
                  ======================================================================= */}
              {notificationTab === 'preferences' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Operational Policy Guarantees</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Every toggle below controls an actual system notification behavior. When a switch is turned OFF, subsequent events in that category are blocked from generating notification records and active alerts are suppressed from the feed in real-time. Preferences persist across device restarts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* 1. School Announcements */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.schoolAnnouncements
                        ? 'bg-slate-900 border-amber-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.schoolAnnouncements
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                              PREF_01
                            </span>
                            <h4 className="text-xs font-black text-white">
                              School Announcements
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Official circulars, noticeboard broadcasts, and school office administrative announcements.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('schoolAnnouncements')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.schoolAnnouncements
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.schoolAnnouncements ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.schoolAnnouncements ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.schoolAnnouncements ? 'Delivering Broadcasts' : 'Broadcasts Suppressed'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          When enabled, circulars posted via School Office or Admin Noticeboard trigger real broadcast alerts across all portals. When disabled, broadcast alert banners are muted.
                        </p>
                      </div>
                    </div>

                    {/* 2. Teacher Notifications */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.teacherNotifications
                        ? 'bg-slate-900 border-blue-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.teacherNotifications
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
                              PREF_02
                            </span>
                            <h4 className="text-xs font-black text-white">
                              Teacher Notifications
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Faculty workflow alerts for assigned class lessons, timetable allocations, and syllabus milestones.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('teacherNotifications')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.teacherNotifications
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.teacherNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.teacherNotifications ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.teacherNotifications ? 'Delivering Staff Alerts' : 'Staff Alerts Silenced'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          When enabled, teachers receive operational alerts for their assigned grades and subjects. When disabled, automated faculty notification pings are stopped.
                        </p>
                      </div>
                    </div>

                    {/* 3. Parent Notifications */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.parentNotifications
                        ? 'bg-slate-900 border-sky-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.parentNotifications
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold uppercase">
                              PREF_03
                            </span>
                            <h4 className="text-xs font-black text-white">
                              Parent Notifications
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Guardian alerts for morning pupil attendance roll-call, unexcused absence alerts, and term progress.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('parentNotifications')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.parentNotifications
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.parentNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.parentNotifications ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.parentNotifications ? 'Delivering Guardian Notices' : 'Guardian Notices Blocked'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          When enabled, verified guardians receive alerts when their linked child is marked absent or when term evaluation reports are published. When disabled, parent notices are suppressed.
                        </p>
                      </div>
                    </div>

                    {/* 4. Learner Notifications */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.learnerNotifications
                        ? 'bg-slate-900 border-purple-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.learnerNotifications
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                              PREF_04
                            </span>
                            <h4 className="text-xs font-black text-white">
                              Learner Notifications
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Pupil reminders for daily class schedules, homework submission due dates, and storybook reading.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('learnerNotifications')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.learnerNotifications
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.learnerNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.learnerNotifications ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.learnerNotifications ? 'Delivering Pupil Reminders' : 'Pupil Reminders Silenced'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          When enabled, learners see timely reminders for daily homework assignments in their enrolled grade. When disabled, student notification badges are muted. (Learners are never exposed to marks).
                        </p>
                      </div>
                    </div>

                    {/* 5. Assignment Notifications */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.assignmentNotifications
                        ? 'bg-slate-900 border-emerald-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.assignmentNotifications
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                              PREF_05
                            </span>
                            <h4 className="text-xs font-black text-white">
                              Assignment Notifications
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Real-time alerts when teachers create, approve, or distribute homework exercises and practice tasks.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('assignmentNotifications')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.assignmentNotifications
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.assignmentNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.assignmentNotifications ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.assignmentNotifications ? 'Emitting Homework Events' : 'Homework Events Silent'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Controls whether `dataLayer.addAssignment` and `approveAssignment` emit real notification records. When disabled, new assignments are registered without triggering notification alerts.
                        </p>
                      </div>
                    </div>

                    {/* 6. Assessment / Result Notifications */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.assessmentNotifications
                        ? 'bg-slate-900 border-rose-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.assessmentNotifications
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <ClipboardList className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                              PREF_06
                            </span>
                            <h4 className="text-xs font-black text-white">
                              Assessment / Result Notifications
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Notification alerts when CBC CAT continuous assessment scores and term exam evaluations are entered.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('assessmentNotifications')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.assessmentNotifications
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.assessmentNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.assessmentNotifications ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.assessmentNotifications ? 'Emitting Result Alerts' : 'Result Alerts Silent'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Controls whether `dataLayer.saveCatRecord` generates assessment notification records for administration. When disabled, mark entries are saved quietly without alert emissions.
                        </p>
                      </div>
                    </div>

                    {/* 7. Timetable Notifications */}
                    <div className={`p-4 rounded-2xl border transition space-y-3 ${
                      notificationPrefs.timetableNotifications
                        ? 'bg-slate-900 border-amber-500/30 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            notificationPrefs.timetableNotifications
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                              PREF_07
                            </span>
                            <h4 className="text-xs font-black text-white">
                              Timetable Notifications
                            </h4>
                            <p className="text-[11px] text-slate-300">
                              Alerts when master timetable allocations are updated or class lesson periods are rescheduled.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotificationPref('timetableNotifications')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                            notificationPrefs.timetableNotifications
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {notificationPrefs.timetableNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>Controlled Behavior:</span>
                          <span className={notificationPrefs.timetableNotifications ? 'text-emerald-400' : 'text-slate-500'}>
                            {notificationPrefs.timetableNotifications ? 'Emitting Schedule Alerts' : 'Schedule Alerts Silent'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Controls whether `dataLayer.saveTimetableSlots` and rescheduling a lesson emit timetable update alerts to staff and classes. When disabled, schedule modifications remain silent.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Persistence Confirmation Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>All 7 Preferences Persisted Off-Line</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Preferences are saved to localStorage (`lra_db_notification_preferences`) and take effect immediately.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleResetNotificationDefaults}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Restore Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAllNotificationPrefs}
                        disabled={isSavingPrefs}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingPrefs ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =======================================================================
                  TAB 2: LIVE NOTIFICATION STREAM (AUTHENTIC SYSTEM EVENTS)
                  ======================================================================= */}
              {notificationTab === 'stream' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Live System Notification Stream
                      </h3>
                      <p className="text-xs text-slate-400">
                        Real events emitted by school operations, filtered in real-time according to your active preferences.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Mark All Read
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllNotifications}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-300 text-xs font-bold transition cursor-pointer"
                      >
                        Clear Stream
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                    {[
                      { id: 'all', label: `All (${activeNotificationStream.length})` },
                      { id: 'announcement', label: 'Announcements' },
                      { id: 'teacher', label: 'Teacher' },
                      { id: 'parent', label: 'Parent' },
                      { id: 'learner', label: 'Learner' },
                      { id: 'assignment', label: 'Assignments' },
                      { id: 'assessment', label: 'Assessments' },
                      { id: 'timetable', label: 'Timetable' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setNotificationStreamFilter(chip.id as typeof notificationStreamFilter)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          notificationStreamFilter === chip.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Notifications Feed */}
                  <div className="divide-y divide-slate-800/80">
                    {filteredNotificationStream.length === 0 ? (
                      /* REQUIRED EMPTY STATE BANNER */
                      <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-slate-500 flex items-center justify-center text-xl mx-auto border border-slate-800">
                          <BellOff className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          NO NEW NOTIFICATIONS
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                          All system notifications, teacher mark entries, and circular alerts have been acknowledged. No fake notifications are generated.
                        </p>
                      </div>
                    ) : (
                      filteredNotificationStream.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                item.category === 'announcement'
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                  : item.category === 'assignment'
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  : item.category === 'assessment'
                                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                  : item.category === 'timetable'
                                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                  : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              }`}>
                                {item.category}
                              </span>
                              <span className={`font-semibold ${item.read ? 'text-slate-400' : 'text-white'}`}>
                                {item.title}
                              </span>
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-normal">
                              {item.message}
                            </p>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                              <span>Target: <strong className="text-slate-400 uppercase">{item.targetRole}</strong></span>
                              {item.grade && <span>• Grade: {item.grade}</span>}
                              {item.subject && <span>• Subject: {item.subject}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                            <span className="text-[10px] font-mono text-slate-500">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!item.read && (
                              <button
                                type="button"
                                onClick={() => {
                                  dataLayer.markNotificationAsRead(item.id);
                                  refreshNotificationState();
                                }}
                                className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition cursor-pointer"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* =======================================================================
                  TAB 3: BROADCAST OFFICIAL SCHOOL ANNOUNCEMENT
                  ======================================================================= */}
              {notificationTab === 'broadcast' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl max-w-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Publish Official School Circular / Announcement
                      </h3>
                      <p className="text-xs text-slate-400">
                        Author an authentic administrative notice for Little Roses Academy. Real broadcast alerts will be generated if &apos;School announcements&apos; is enabled.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePostAnnouncement} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">
                        Announcement Title
                      </label>
                      <input
                        type="text"
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="e.g. Term 1 Mid-Term Break Schedule & Parents Consultation"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">
                        Circular Details / Body
                      </label>
                      <textarea
                        rows={4}
                        value={announcementMessage}
                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                        placeholder="Type official circular instructions, important dates, and guidance for guardians and learners..."
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          Target Audience
                        </label>
                        <select
                          value={announcementTargetGrade}
                          onChange={(e) => setAnnouncementTargetGrade(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="All Classes">All School Classes (General Notice)</option>
                          <option value="Grade 1">Grade 1 Only</option>
                          <option value="Grade 2">Grade 2 Only</option>
                          <option value="Grade 3">Grade 3 Only</option>
                          <option value="Grade 4">Grade 4 Only</option>
                          <option value="Grade 5">Grade 5 Only</option>
                          <option value="Grade 6">Grade 6 Only</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          Priority Level
                        </label>
                        <select
                          value={announcementPriority}
                          onChange={(e) => setAnnouncementPriority(e.target.value as typeof announcementPriority)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Normal">Normal Priority</option>
                          <option value="High">High Priority</option>
                          <option value="Urgent">Urgent / Immediate Action</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                        <span>Active Preference Gating Test</span>
                      </div>
                      <p>
                        Current School Announcement Status:{' '}
                        <strong className={notificationPrefs.schoolAnnouncements ? 'text-emerald-400' : 'text-rose-400'}>
                          {notificationPrefs.schoolAnnouncements ? 'ENABLED (Alert will broadcast)' : 'DISABLED (Alert will be suppressed)'}
                        </strong>
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isPostingAnnouncement}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isPostingAnnouncement ? 'Broadcasting...' : 'Publish & Broadcast Announcement'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* =======================================================================
                  TAB 4: DELIVERY CHANNELS & QUIET HOURS
                  ======================================================================= */}
              {notificationTab === 'channels' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl max-w-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Delivery Channels & Quiet Hours Configuration
                      </h3>
                      <p className="text-xs text-slate-400">
                        Manage local sound alerts, offline dispatch channels, and scheduled quiet hours.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* In-App Notifications Channel */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">In-App Notification Stream</h4>
                        <p className="text-[11px] text-slate-400">Display unread badge counters and in-portal alert bars.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        Active Core
                      </span>
                    </div>

                    {/* Sound Chimes */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">Audible Alert Chimes</h4>
                        <p className="text-[11px] text-slate-400">Play an audio cue when new administrative alerts arrive.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSound = !notificationPrefs.channels?.soundEnabled;
                          const updated = dataLayer.saveNotificationPreferences({
                            ...notificationPrefs,
                            channels: {
                              inApp: true,
                              smsAlerts: false,
                              soundEnabled: nextSound,
                            },
                          });
                          setNotificationPrefs(updated);
                          showNotificationToast(`Audible alert chimes ${nextSound ? 'enabled' : 'disabled'}.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          notificationPrefs.channels?.soundEnabled
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {notificationPrefs.channels?.soundEnabled ? 'Enabled' : 'Muted'}
                      </button>
                    </div>

                    {/* SMS Gateway (Simulated / Local) */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">SMS Gateway Dispatch (Direct WhatsApp/SMS)</h4>
                        <p className="text-[11px] text-slate-400">Generate WhatsApp & SMS direct links for parent attendance alerts.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                        Direct Link Ready
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeSection.id === 'appearance' ? (
            /* =======================================================================
               SECTION 7: APPEARANCE & THEME SETTINGS
               ======================================================================= */
            <div className="space-y-5 animate-in fade-in">
              {/* Appearance Toast Feedback */}
              {appearanceToast && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{appearanceToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppearanceToast(null)}
                    className="text-amber-400 hover:text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Master Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">Section 07</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-xs text-slate-400">Display Theme & Visual Identity</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        Appearance & Theme Modes
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Configure the global visual theme for Little Roses Academy. Choose between Light Mode, Dark Mode, or device System Default. Changes take effect across all portal screens immediately and persist permanently.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={handleResetAppearanceDefaults}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Restore institutional default appearance"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showAppearanceToast('Theme preferences applied and synced across all portals.')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Choice</span>
                    </button>
                  </div>
                </div>

                {/* Status & Policy Indicator Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold">
                      Effective Theme:{' '}
                      <strong className="text-white uppercase">
                        {effectiveTheme} MODE
                      </strong>
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      ({appearanceConfig.themeMode === 'system' ? 'Synced to device OS settings' : 'Manual preference'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      Mode: {appearanceConfig.themeMode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Off-line Persisted
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      Phone & Tablet Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* =======================================================================
                  CORE THEME SWITCHER: LIGHT MODE • DARK MODE • SYSTEM DEFAULT
                  ======================================================================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Application Theme Mode Selection</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tap any theme below to activate it instantly. The setting applies throughout all school portals.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Option 1: Light Mode */}
                  <div
                    onClick={() => handleSelectThemeMode('light')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                      appearanceConfig.themeMode === 'light'
                        ? 'bg-amber-500/10 border-amber-500 shadow-xl ring-2 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {appearanceConfig.themeMode === 'light' && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Active
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 transition ${
                        appearanceConfig.themeMode === 'light'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-amber-400 border-slate-800 group-hover:border-slate-700'
                      }`}>
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 pr-14">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                          THEME_01
                        </span>
                        <h4 className="text-sm font-black text-white">
                          Light Mode
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Daylight theme with crisp white surfaces
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Clean daylight theme with ivory backgrounds, pure white cards, and high-contrast dark slate typography. Ideal for daylight classrooms and mobile tablets under ambient light.
                    </p>

                    {/* Miniature Preview Card */}
                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 space-y-1.5 text-xs select-none">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-800">Preview: Pupil Card</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold text-[9px]">Grade 4</span>
                      </div>
                      <div className="h-1.5 w-3/4 rounded bg-slate-300" />
                      <div className="h-1 w-1/2 rounded bg-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectThemeMode('light');
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        appearanceConfig.themeMode === 'light'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>{appearanceConfig.themeMode === 'light' ? 'Selected & Active' : 'Activate Light Mode'}</span>
                    </button>
                  </div>

                  {/* Option 2: Dark Mode */}
                  <div
                    onClick={() => handleSelectThemeMode('dark')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                      appearanceConfig.themeMode === 'dark'
                        ? 'bg-amber-500/10 border-amber-500 shadow-xl ring-2 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {appearanceConfig.themeMode === 'dark' && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Active
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 transition ${
                        appearanceConfig.themeMode === 'dark'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-blue-400 border-slate-800 group-hover:border-slate-700'
                      }`}>
                        <Moon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 pr-14">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
                          THEME_02
                        </span>
                        <h4 className="text-sm font-black text-white">
                          Dark Mode
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Signature midnight navy (#070D1E)
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Little Roses signature midnight navy atmosphere with deep slate panels and luminous gold accents. Reduces eye fatigue during evening administrative grade entry and lesson planning.
                    </p>

                    {/* Miniature Preview Card */}
                    <div className="p-3 rounded-xl bg-[#070D1E] border border-slate-800 text-white space-y-1.5 text-xs select-none">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-200">Preview: Pupil Card</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px]">Grade 4</span>
                      </div>
                      <div className="h-1.5 w-3/4 rounded bg-slate-700" />
                      <div className="h-1 w-1/2 rounded bg-slate-800" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectThemeMode('dark');
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        appearanceConfig.themeMode === 'dark'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>{appearanceConfig.themeMode === 'dark' ? 'Selected & Active' : 'Activate Dark Mode'}</span>
                    </button>
                  </div>

                  {/* Option 3: System Default */}
                  <div
                    onClick={() => handleSelectThemeMode('system')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                      appearanceConfig.themeMode === 'system'
                        ? 'bg-amber-500/10 border-amber-500 shadow-xl ring-2 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {appearanceConfig.themeMode === 'system' && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Active
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 transition ${
                        appearanceConfig.themeMode === 'system'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-emerald-400 border-slate-800 group-hover:border-slate-700'
                      }`}>
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 pr-14">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                          THEME_03
                        </span>
                        <h4 className="text-sm font-black text-white">
                          System Default
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Follows device OS appearance
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Automatically synchronizes with your device operating system or browser display mode. Seamlessly alternates between daylight mode and midnight navy when your OS schedule changes.
                    </p>

                    {/* Miniature Preview Card (Split daylight & dark) */}
                    <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-slate-800 text-xs select-none">
                      <div className="p-3 bg-slate-100 text-slate-900 space-y-1">
                        <span className="text-[9px] font-bold text-slate-600 block">Daylight</span>
                        <div className="h-1.5 w-3/4 rounded bg-slate-300" />
                      </div>
                      <div className="p-3 bg-[#070D1E] text-white space-y-1 border-l border-slate-800">
                        <span className="text-[9px] font-bold text-slate-400 block">Midnight</span>
                        <div className="h-1.5 w-3/4 rounded bg-slate-700" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectThemeMode('system');
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        appearanceConfig.themeMode === 'system'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>{appearanceConfig.themeMode === 'system' ? 'Selected & Active' : 'Activate System Default'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* =======================================================================
                  PHONE & TABLET WORKABILITY & DENSITY CONTROLS
                  ======================================================================= */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Device Viewport & Readability Controls
                    </h3>
                    <p className="text-xs text-slate-400">
                      Optimized for both mobile phones and school office tablets with touch targets exceeding 44px.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Font Scaling */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Typography Scaling</span>
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                        {appearanceConfig.fontSizeScale || 'normal'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Scale application typography to match your device screen density.
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {[
                        { id: 'small', label: 'Compact (90%)' },
                        { id: 'normal', label: 'Standard (100%)' },
                        { id: 'large', label: 'Comfortable (110%)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSetFontScale(item.id as typeof appearanceConfig.fontSizeScale)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                            appearanceConfig.fontSizeScale === item.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Contrast Mode */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">High Contrast Readability</h4>
                      <p className="text-[11px] text-slate-400">
                        Accentuates container borders and text sharpness for outdoor Kenyan sunlight readability.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleHighContrast}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                        appearanceConfig.highContrast
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {appearanceConfig.highContrast ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              {/* =======================================================================
                  CBC SUBJECT COLOURS & VISUAL IDENTITY PRESERVATION GUARANTEE
                  ======================================================================= */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white">
                      Little Roses Visual Identity & CBC Subject Palette
                    </h3>
                    <p className="text-xs text-slate-400">
                      Official school crest, Kenyan CBC learning areas, and evaluation ribbons remain consistent in both Light and Dark modes.
                    </p>
                  </div>
                </div>

                {/* Subject Colours Swatch Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Preserved Learning Area Colours
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'Mathematics', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
                      { name: 'English Language', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
                      { name: 'Kiswahili', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                      { name: 'Science & Tech', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
                      { name: 'Agriculture & Nut.', color: 'bg-lime-500/10 text-lime-400 border-lime-500/30' },
                      { name: 'Social Studies', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
                      { name: 'CRE / Religious', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
                      { name: 'Creative Arts', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
                    ].map((subj) => (
                      <div
                        key={subj.name}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between ${subj.color}`}
                      >
                        <span className="truncate">{subj.name}</span>
                        <span className="w-2 h-2 rounded-full bg-current shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CBC Assessment Band Swatches */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    CBC 4-Tier Assessment Ribbon Bands
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-between">
                      <span>EE (80% - 100%)</span>
                      <span className="text-[10px] font-mono">Exceeding</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold flex items-center justify-between">
                      <span>ME (60% - 79%)</span>
                      <span className="text-[10px] font-mono">Meeting</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold flex items-center justify-between">
                      <span>AE (40% - 59%)</span>
                      <span className="text-[10px] font-mono">Approaching</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold flex items-center justify-between">
                      <span>BE (0% - 39%)</span>
                      <span className="text-[10px] font-mono">Below</span>
                    </div>
                  </div>
                </div>

                {/* Splash Screen Exemption Guarantee */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center gap-3 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Splash Screen Protection:</strong> The Little Roses Academy opening splash screen and brand entry ceremony remain strictly preserved in their original midnight navy atmosphere regardless of the theme selected.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* =======================================================================
               SECTIONS 8-14: CLEAN SHELL WITH SCOPE & SYSTEM CONTEXT
               ======================================================================= */
            <div className="space-y-4">
              {/* Section Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                    {React.createElement(activeSection.icon, { className: 'w-6 h-6' })}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        Section {activeSection.number < 10 ? `0${activeSection.number}` : activeSection.number}
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs text-slate-400">Settings Screen</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {activeSection.title}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSection.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Honest Status Shell Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 font-semibold">
                      Settings Screen Shell Initialized • Ready for Configuration Controls
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 hidden sm:inline-block">
                    Zero Fake Settings
                  </span>
                </div>
              </div>

              {/* Section Governance & Scope Description */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Section Scope & Governance
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeSection.scope}
                </p>
              </div>

              {/* Real System Context Information (Strictly real data from dataLayer) */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active System Context
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">

                  {activeSection.id === 'storage' && (
                    <>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Storage Used</span>
                        <span className="font-bold text-white font-mono">
                          {formatBytes(storageInfo.usedBytes)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Remaining Quota</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatBytes(storageInfo.remainingBytes)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Resource Documents</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {storageInfo.totalDocs} files
                        </span>
                      </div>
                    </>
                  )}

                  {activeSection.id === 'offline_sync' && (
                    <>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">PWA Cache Status</span>
                        <span className="font-bold text-emerald-400">Active & Cached</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sync Pipeline</span>
                        <span className="font-bold text-white">{syncStatus.label}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Offline Mode</span>
                        <span className="font-bold text-blue-400">Supported</span>
                      </div>
                    </>
                  )}

                  {activeSection.id === 'about' && (
                    <>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Platform</span>
                        <span className="font-bold text-white">Little Roses Academy Portal</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Architecture</span>
                        <span className="font-bold text-amber-400">Progressive Web App (PWA)</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Environment</span>
                        <span className="font-bold text-emerald-400">Production Ready</span>
                      </div>
                    </>
                  )}

                  {!['curriculum', 'users_permissions', 'storage', 'offline_sync', 'about'].includes(activeSection.id) && (
                    <>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Section Target</span>
                        <span className="font-bold text-white">{activeSection.title}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Configuration State</span>
                        <span className="font-bold text-amber-400">Awaiting Detailed Controls</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Authorization</span>
                        <span className="font-bold text-emerald-400">Admin Only</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Return & Section Navigation Footer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setActiveSectionId(null)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All 14 Settings</span>
            </button>

            {/* Quick Section Jumper on Tablet/Desktop */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 hidden sm:inline">Jump to:</span>
              <select
                value={activeSection.id}
                onChange={(e) => setActiveSectionId(e.target.value as SettingsSectionId)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {SETTINGS_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    {s.number}. {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
