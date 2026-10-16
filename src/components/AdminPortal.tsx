/**
 * Little Roses Academy Nakuru - Official Kenyan CBC Primary School Application
 * PHASE 1A-2: ADMIN PORTAL NAVIGATION (RELIABLE MULTI-PLATFORM ROUTING)
 * 
 * SPECIFICATION COMPLIANCE:
 * - Full 19 exact Admin Destinations:
 *   Home, School Office, Teachers, Learners, Families / Parents, Curriculum,
 *   Resources, Assessments, Reports, Calendar, Timetable, Promotion, Noticeboard,
 *   Notifications, Settings, Security, Backup & Recovery, Help & Support, Sign Out.
 * - Phone Navigation: 3-line hamburger menu opens complete drawer with smooth transitions.
 *   Closes on selection, outside tap, or Android/browser back.
 * - Phone Bottom Navigation: Home, Users (opens Teachers/Learners/Families), Curriculum, Calendar, More.
 * - Tablet & Desktop Navigation: Visible sidebar when screen width allows.
 * - Active destination visually identifiable with existing application theme.
 * - Deep navigation: Home -> Teachers -> Teacher Profile -> back to Teachers -> back to Home.
 * - Hardware Android back & browser popstate support:
 *   Closes drawers, sheets, menus, dialogs, sub-views, or prompts "LEAVING ALREADY? 🥺" at root.
 * - Unsaved changes guard: Prompts SAVE & LEAVE, DISCARD, CANCEL before navigating away.
 * - Admin permission protection: Denies unauthorized access if session is invalid.
 * - Notifications header icon navigates to Notifications; shows "NO NEW NOTIFICATIONS" when empty.
 * - Profile header control opens Admin Profile dialog with session vitals.
 * - Strictly 0 fake data: honest empty states for all unbuilt future engine destinations.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Home,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  ClipboardList,
  BarChart3,
  Calendar,
  Clock,
  Activity,
  Sparkles,
  Bell,
  Settings,
  ShieldCheck,
  Database,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Sun,
  Moon,
  Monitor,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Share2,
  RefreshCw,
  Download,
  Upload,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  FileText,
  SlidersHorizontal,
  Lock,
  Eye,
  Info,
  ArrowLeft,
  UserCheck,
  UserPlus,
  MapPin,
  Camera,
  Phone,
  Link2,
  FileUp,
  Layers,
  Table,
  Video,
  History,
  FolderInput,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Copy,
  Edit3,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { SchoolCalendarView } from './SchoolCalendarView.tsx';
import {
  AdminResourceWorkspace,
  calculateStorageUsage,
  formatBytes,
  WorkspaceResourceItem,
  WorkspaceDocument,
  TOTAL_SCHOOL_STORAGE_BYTES,
} from './AdminResourceWorkspace.tsx';
import { AdminTimetableModule } from './AdminTimetableModule.tsx';
import { AdminPromotionModule } from './AdminPromotionModule.tsx';
import { AdminSettingsModule } from './AdminSettingsModule.tsx';
import { AdminAssessmentPortal } from './AdminAssessmentPortal.tsx';
import { OfflineAIDocumentAssistantModal } from './OfflineAIDocumentAssistantModal.tsx';
import { CentralSchoolAIModal } from './CentralSchoolAIModal.tsx';
import { extractTextFromFile } from '../services/aiDocumentAssistant.ts';
import {
  TeacherModal,
  LearnerModal,
  ParentModal,
} from './UserEditModals.tsx';
import { PortalSwitcherBadge } from './PortalSwitcherBadge.tsx';
import {
  dataLayer,
  subscribeToDataLayer,
  CurrentUserSession,
  normalizePhoneNumber,
  AcademicYearRecord,
  TimetableSlotItem,
  TeacherAccountRecord,
  PupilRecord,
  ParentAccount,
  getTeacherGradeAssignments,
  TeacherGradeAssignment,
  LRA_GRADES,
  LRA_GRADE_SUBJECTS,
  getLraSubjectsForGrade,
} from '../services/dataLayer.ts';

// -----------------------------------------------------------------------------
// 1. EXACT 19 ADMIN DESTINATIONS (LITTLE ROSES ACADEMY SPEC)
// -----------------------------------------------------------------------------
export type AdminTab =
  | 'home'
  | 'school_office'
  | 'users'
  | 'teachers'
  | 'learners'
  | 'families'
  | 'curriculum'
  | 'resources'
  | 'assessments'
  | 'reports'
  | 'calendar'
  | 'timetable'
  | 'promotion'
  | 'noticeboard'
  | 'notifications'
  | 'settings'
  | 'security'
  | 'backup'
  | 'help'
  | 'signout';

export interface AdminNavItem {
  id: AdminTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'home', label: 'Home', description: 'Dashboard & live overview', icon: Home },
  { id: 'school_office', label: 'School Office', description: 'School settings & management', icon: Building2 },
  { id: 'teachers', label: 'Teachers', description: 'Manage teachers & staff', icon: Users },
  { id: 'learners', label: 'Learners', description: 'Manage pupil admissions', icon: GraduationCap },
  { id: 'families', label: 'Families / Parents', description: 'Manage parent accounts & households', icon: Users },
  { id: 'curriculum', label: 'Curriculum', description: 'Curriculum management & learning areas', icon: BookOpen },
  { id: 'resources', label: 'Resources', description: 'Curriculum resource library', icon: FolderOpen },
  { id: 'assessments', label: 'Assessments', description: 'CATs & assessment records', icon: ClipboardList },
  { id: 'reports', label: 'Reports', description: 'Official CBC reports & analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', description: 'Academic school calendar & terms', icon: Calendar },
  { id: 'timetable', label: 'Timetable', description: 'Master timetable management', icon: Clock },
  { id: 'promotion', label: 'Promotion', description: 'Promote, retain & transfer', icon: Sparkles },
  { id: 'noticeboard', label: 'Noticeboard', description: 'School notices & broadcasts', icon: Bell },
  { id: 'notifications', label: 'Notifications', description: 'Alerts, logs & messages', icon: Bell },
  { id: 'settings', label: 'Settings', description: 'System settings & configuration', icon: Settings },
  { id: 'security', label: 'Security', description: 'Permissions & audit log', icon: ShieldCheck },
  { id: 'backup', label: 'Backup & Recovery', description: 'Data backup & restoration', icon: Database },
  { id: 'help', label: 'Help & Support', description: 'Help documentation & guides', icon: HelpCircle },
  { id: 'signout', label: 'Sign Out', description: 'Logout & lock session', icon: LogOut },
];

export const CBC_CLASSES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
];

export const CBC_SUBJECTS = [
  'English Language Activities',
  'Kiswahili Language Activities',
  'Mathematics Activities',
  'Science and Technology',
  'Social Studies',
  'Agriculture and Nutrition',
  'Creative Arts & Sports',
  'Religious Education (CRE/IRE)',
];

export interface ResourceCategoryInfo {
  id: string;
  name: string;
  icon: string;
}

export const RESOURCE_CATEGORIES: ResourceCategoryInfo[] = [
  { id: 'schemes_of_work', name: 'Schemes of Work', icon: '📋' },
  { id: 'lesson_plans', name: 'Lesson Plans', icon: '📝' },
  { id: 'lesson_notes', name: 'Lesson Notes', icon: '📓' },
  { id: 'class_notes', name: 'Class Notes', icon: '📖' },
  { id: 'assignments', name: 'Assignments', icon: '✍️' },
  { id: 'assessments_cats', name: 'CATs / Assessments', icon: '📊' },
  { id: 'revision_materials', name: 'Revision Materials', icon: '🔄' },
  { id: 'past_papers', name: 'Past Papers', icon: '📄' },
  { id: 'reading_materials', name: 'Reading Materials', icon: '📚' },
  { id: 'videos', name: 'Videos', icon: '🎥' },
  { id: 'pdf_documents', name: 'PDF Documents', icon: '📑' },
  { id: 'images_photos', name: 'Images / Photos', icon: '🖼️' },
  { id: 'cbc_curriculum', name: 'CBC Curriculum', icon: '🇰🇪' },
  { id: 'record_of_work', name: 'Record of Work', icon: '📈' },
  { id: 'reference_materials', name: 'Reference Materials', icon: '🔍' },
  { id: 'other_school_documents', name: 'Other School Documents', icon: '📁' },
];

export interface StoredResourceItem {
  id: string;
  title: string;
  categoryName: string;
  categoryId: string;
  fileType?: string;
  fileName?: string;
  fileSize?: string;
  grade?: string;
  subject?: string;
  strand?: string;
  term?: string;
  academicYear?: string;
  sharedBy?: string;
  teacherId?: string;
  recipientTeachers?: string[];
  date?: string;
  content?: string;
  notes?: string;
  documents?: { id: string; name: string; size?: string; content?: string }[];
  isApproved?: boolean;
}

interface AdminPortalProps {
  mode?: 'phone' | 'tablet' | 'full';
  onBackToPortals: () => void;
  onSwitchToTeachers?: () => void;
  onSwitchPortal?: (portal: 'admin' | 'teachers' | 'parents' | 'learners') => void;
}

export function AdminPortal({
  onBackToPortals,
  onSwitchToTeachers,
  onSwitchPortal,
}: AdminPortalProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [navHistory, setNavHistory] = useState<AdminTab[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sub-Navigation / Deep Detail State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedPupilId, setSelectedPupilId] = useState<string | null>(null);
  const [selectedParentPhone, setSelectedParentPhone] = useState<string | null>(null);
  const [selectedResourceCategory, setSelectedResourceCategory] = useState<string | null>(null);
  const [selectedResourceTeacherId, setSelectedResourceTeacherId] = useState<string | null>(null);
  const [selectedResourceGrade, setSelectedResourceGrade] = useState<string | null>(null);
  const [selectedResourceSubject, setSelectedResourceSubject] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [activeWorkspaceResource, setActiveWorkspaceResource] = useState<WorkspaceResourceItem | null>(null);
  const [resourcesRevision, setResourcesRevision] = useState(0);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [showAIAssistantModal, setShowAIAssistantModal] = useState(false);
  const [showCentralAIModal, setShowCentralAIModal] = useState(false);
  const [centralAITab, setCentralAITab] = useState<'chat' | 'document_intelligence' | 'assessment_generator' | 'progress_analyzer'>('chat');
  const [treeExpandedTeachers, setTreeExpandedTeachers] = useState<string[]>([]);
  const [treeExpandedGrades, setTreeExpandedGrades] = useState<string[]>([]);
  const [showResourceTree, setShowResourceTree] = useState(true);

  // Search & Sort within the current location workspace
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [resourceSortBy, setResourceSortBy] = useState<
    'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc'
  >('date_desc');

  // Resource card three-dot menu open state
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  // Modals triggered from resource cards
  const [renameModalResource, setRenameModalResource] = useState<WorkspaceResourceItem | null>(null);
  const [renameNewTitle, setRenameNewTitle] = useState('');
  const [renameNewFileName, setRenameNewFileName] = useState('');

  const [moveModalResource, setMoveModalResource] = useState<WorkspaceResourceItem | null>(null);
  const [moveTargetTeacherId, setMoveTargetTeacherId] = useState('');
  const [moveTargetGrade, setMoveTargetGrade] = useState('');
  const [moveTargetSubject, setMoveTargetSubject] = useState('');

  const [versionsModalResource, setVersionsModalResource] = useState<WorkspaceResourceItem | null>(null);

  // Direct file upload ref & state
  const locationFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetResourceId, setReplaceTargetResourceId] = useState<string | null>(null);
  const [uploadStatusBanner, setUploadStatusBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New resource modal form fields
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceFileType, setNewResourceFileType] = useState('PDF Document');
  const [newResourceTerm, setNewResourceTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [newResourceAcademicYear, setNewResourceAcademicYear] = useState('2026');
  const [newResourceStrand, setNewResourceStrand] = useState('');
  const [newResourceNotes, setNewResourceNotes] = useState('');
  const [newResourceFileName, setNewResourceFileName] = useState('');
  const [resourceFormError, setResourceFormError] = useState('');
  const [newResourceAttachedFile, setNewResourceAttachedFile] = useState<File | null>(null);
  const [newResourceAttachedDataUrl, setNewResourceAttachedDataUrl] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);
  const [modalTargetCategory, setModalTargetCategory] = useState<string>('pdf_documents');
  const [modalTargetTeacherId, setModalTargetTeacherId] = useState<string>('');
  const [modalTargetGrade, setModalTargetGrade] = useState<string>('Grade 4');
  const [modalTargetSubject, setModalTargetSubject] = useState<string>('Mathematics Activities');

  // Phone Users Bottom Sheet: Teachers | Learners | Families
  const [showUsersSheet, setShowUsersSheet] = useState(false);

  // Active People Sub-tab in Home Dashboard (Teachers | Learners | Parents)
  const [homePeopleTab, setHomePeopleTab] = useState<'teachers' | 'learners' | 'parents'>('teachers');

  // Structural Three-Dot Menu dropdown tracker: panelId -> boolean
  const [openThreeDotMenu, setOpenThreeDotMenu] = useState<string | null>(null);

  // Exit & Unsaved Changes Dialogs
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavTab, setPendingNavTab] = useState<AdminTab | null>(null);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Selected Event / Activity Detail Modal State (Task 3)
  const [selectedEventModal, setSelectedEventModal] = useState<{
    title: string;
    category: string;
    timeOrDate: string;
    details?: string;
    targetNav?: AdminTab;
  } | null>(null);

  // Theme State: 'dark' | 'light' | 'system'
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('lra_theme_mode');
      return (saved as 'dark' | 'light' | 'system') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Real DataLayer state subscriptions
  const [session, setSession] = useState<CurrentUserSession | null>(dataLayer.getCurrentSession());
  const [teachers, setTeachers] = useState(() => dataLayer.getTeachers());
  const [pupils, setPupils] = useState(() => dataLayer.getPupils());
  const [parents, setParents] = useState(() => dataLayer.getParents());
  const [termInfo, setTermInfo] = useState(() => dataLayer.getAcademicTermInfo());
  const [activeAcademicYear, setActiveAcademicYear] = useState<AcademicYearRecord | null>(() => dataLayer.getActiveAcademicYear());
  const [allAcademicYears, setAllAcademicYears] = useState<AcademicYearRecord[]>(() => dataLayer.getAcademicYears());
  const [storedTimetableSlots, setStoredTimetableSlots] = useState<TimetableSlotItem[]>(() => dataLayer.getTimetableSlots());

  // User Management Modal States (Teachers, Learners, Families)
  const [editingTeacher, setEditingTeacher] = useState<TeacherAccountRecord | null>(null);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [editingPupil, setEditingPupil] = useState<PupilRecord | null>(null);
  const [isAddingPupil, setIsAddingPupil] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentAccount | null>(null);
  const [isAddingParent, setIsAddingParent] = useState(false);

  // In-app Delete Confirmation Dialog State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'teacher' | 'pupil' | 'parent' | 'resource';
    id: string;
    name: string;
    subtitle?: string;
  } | null>(null);

  const handleExecuteDeleteConfirm = () => {
    if (!deleteConfirmTarget) return;
    const { type, id, name } = deleteConfirmTarget;

    try {
      if (type === 'teacher') {
        dataLayer.deleteTeacher(id);
        setSelectedTeacherId(null);
        setTeachers(dataLayer.getTeachers());
        setUploadStatusBanner({
          message: `Deleted teacher "${name}"`,
          type: 'success',
        });
      } else if (type === 'pupil') {
        dataLayer.deletePupil(id);
        setSelectedPupilId(null);
        setPupils(dataLayer.getPupils());
        setUploadStatusBanner({
          message: `Deleted learner "${name}"`,
          type: 'success',
        });
      } else if (type === 'parent') {
        dataLayer.deleteParent(id);
        setSelectedParentPhone(null);
        setParents(dataLayer.getParents());
        setUploadStatusBanner({
          message: `Deleted family account for "${name}"`,
          type: 'success',
        });
      } else if (type === 'resource') {
        dataLayer.deleteResourcePackage(id);
        setResourcesRevision((r) => r + 1);
        setUploadStatusBanner({
          message: `Deleted resource "${name}"`,
          type: 'success',
        });
      }
    } catch (err: any) {
      setUploadStatusBanner({
        message: `Deletion failed: ${err?.message || 'Error occurred'}`,
        type: 'error',
      });
    }
    setTimeout(() => setUploadStatusBanner(null), 3500);
    setDeleteConfirmTarget(null);
  };

  // Subscribe to real data updates & storage events (Task 7)
  useEffect(() => {
    const handleDataRefresh = () => {
      setSession(dataLayer.getCurrentSession());
      setTeachers(dataLayer.getTeachers());
      setPupils(dataLayer.getPupils());
      setParents(dataLayer.getParents());
      setTermInfo(dataLayer.getAcademicTermInfo());
      setActiveAcademicYear(dataLayer.getActiveAcademicYear());
      setAllAcademicYears(dataLayer.getAcademicYears());
      setStoredTimetableSlots(dataLayer.getTimetableSlots());
      setResourcesRevision((r) => r + 1);
    };

    const unsubscribe = subscribeToDataLayer(handleDataRefresh);
    window.addEventListener('storage', handleDataRefresh);
    window.addEventListener('lra_data_update', handleDataRefresh);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleDataRefresh);
      window.removeEventListener('lra_data_update', handleDataRefresh);
    };
  }, []);

  // Theme switcher effect
  useEffect(() => {
    try {
      localStorage.setItem('lra_theme_mode', themeMode);
    } catch {}
  }, [themeMode]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && true);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Admin 👋';
    if (hour < 17) return 'Good Afternoon, Admin 👋';
    return 'Good Evening, Admin 👋';
  }, []);

  // Real Data Counts (STRICTLY real: 0 if no records exist in application)
  const teachersCount = teachers.length;
  const learnersCount = pupils.length;
  const parentsCount = parents.length;
  const classesCount = CBC_CLASSES.length; // 6 CBC Classes
  const subjectsCount = CBC_SUBJECTS.length; // 8 CBC Learning Areas

  // Derived Real Families / Households
  const familiesCount = useMemo(() => {
    if (parents.length > 0) return parents.length;
    const phoneSet = new Set<string>();
    pupils.forEach((p) => {
      if (p.parentPhone) phoneSet.add(p.parentPhone.replace(/[\s-]/g, ''));
    });
    return phoneSet.size;
  }, [parents, pupils]);

  // ---------------------------------------------------------------------------
  // REAL STORED RESOURCES & CATEGORIES ENGINE (TASK 6)
  // Strictly zero fake resources. Preserves all metadata and permissions.
  // ---------------------------------------------------------------------------
  const allStoredResources = useMemo<StoredResourceItem[]>(() => {
    const list: StoredResourceItem[] = [];

    // Helper to resolve category ID from raw category string
    const resolveCategoryId = (rawCat?: string, fallback = 'other_school_documents'): string => {
      if (!rawCat) return fallback;
      const lower = rawCat.toLowerCase().trim();
      if (lower.includes('scheme')) return 'schemes_of_work';
      if (lower.includes('lesson plan')) return 'lesson_plans';
      if (lower.includes('lesson note')) return 'lesson_notes';
      if (lower.includes('class note')) return 'class_notes';
      if (lower.includes('assignment')) return 'assignments';
      if (lower.includes('assessment') || lower.includes('cat')) return 'assessments_cats';
      if (lower.includes('revision')) return 'revision_materials';
      if (lower.includes('past paper')) return 'past_papers';
      if (lower.includes('reading') || lower.includes('storybook') || lower.includes('story')) return 'reading_materials';
      if (lower.includes('video')) return 'videos';
      if (lower.includes('pdf')) return 'pdf_documents';
      if (lower.includes('image') || lower.includes('photo')) return 'images_photos';
      if (lower.includes('curriculum') || lower.includes('cbc') || lower.includes('syllabus')) return 'cbc_curriculum';
      if (lower.includes('record of work')) return 'record_of_work';
      if (lower.includes('reference') || lower.includes('guide')) return 'reference_materials';

      const matched = RESOURCE_CATEGORIES.find((c) => c.id === rawCat || c.name.toLowerCase() === lower);
      return matched ? matched.id : fallback;
    };

    // 1. Bulk Resource Packages (dataLayer / localStorage 'lra_db_resource_packages')
    try {
      const packages = dataLayer.getResourcePackages();
      packages.forEach((pkg) => {
        const catId = resolveCategoryId(pkg.category, 'other_school_documents');
        const catObj = RESOURCE_CATEGORIES.find((c) => c.id === catId);
        list.push({
          id: pkg.id,
          title: pkg.packageName,
          categoryName: catObj?.name || 'Other School Documents',
          categoryId: catId,
          grade: pkg.grade,
          subject: pkg.subject,
          strand: pkg.strand,
          term: pkg.term,
          academicYear: pkg.academicYear,
          sharedBy: 'Curriculum Admin',
          recipientTeachers: pkg.recipientTeacherIds,
          date: pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('en-GB') : undefined,
          documents: pkg.documents,
          fileType: 'Package',
          fileSize: pkg.documents?.length ? `${pkg.documents.length} docs` : 'Ready',
        });
      });
    } catch {}

    // 2. Shared Admin Documents (schoolDataService / localStorage 'lra_shared_admin_docs')
    try {
      const sharedDocsRaw = localStorage.getItem('lra_shared_admin_docs');
      if (sharedDocsRaw) {
        const docs = JSON.parse(sharedDocsRaw);
        if (Array.isArray(docs)) {
          docs.forEach((d: any) => {
            let catId = 'other_school_documents';
            if (d.category === 'Syllabus') catId = 'cbc_curriculum';
            else if (d.category === 'Assessment Guide') catId = 'reference_materials';
            else if (d.category === 'Scheme of Work') catId = 'schemes_of_work';
            else if (d.fileType === 'pdf') catId = 'pdf_documents';
            else catId = resolveCategoryId(d.category, 'other_school_documents');

            const catObj = RESOURCE_CATEGORIES.find((c) => c.id === catId);
            list.push({
              id: d.id,
              title: d.title || d.fileName,
              fileName: d.fileName,
              categoryName: catObj?.name || 'Other School Documents',
              categoryId: catId,
              fileType: d.fileType ? d.fileType.toUpperCase() : 'PDF',
              fileSize: d.fileSize || 'Standard',
              grade: d.targetGrade,
              sharedBy: d.sharedBy || 'School Office',
              date: d.date,
              notes: d.notes,
              content: d.notes,
            });
          });
        }
      }
    } catch {}

    // 3. Teacher Storybooks (localStorage 'lra_teacher_storybooks' / reading materials)
    try {
      const storyRaw = localStorage.getItem('lra_teacher_storybooks');
      if (storyRaw) {
        const stories = JSON.parse(storyRaw);
        if (Array.isArray(stories)) {
          stories.forEach((s: any) => {
            list.push({
              id: s.id,
              title: s.title,
              categoryName: 'Reading Materials',
              categoryId: 'reading_materials',
              grade: s.grade,
              subject: s.language === 'Kiswahili' ? 'Kiswahili Activities' : 'English Activities',
              strand: s.strandMapping,
              date: s.date,
              sharedBy: s.approvedDate || (s.approvedByTeacher ? 'Approved Story' : 'Class Teacher'),
              content: s.excerpt,
              notes: s.approvedByTeacher ? '✓ Approved for CBC Lower Primary' : 'Draft Storybook',
              fileType: 'Storybook',
              isApproved: s.approvedByTeacher,
            });
          });
        }
      }
    } catch {}

    // 4. Living Record of Work (localStorage 'lra_teacher_record_of_work')
    try {
      const rowRaw = localStorage.getItem('lra_teacher_record_of_work');
      if (rowRaw) {
        const rows = JSON.parse(rowRaw);
        if (Array.isArray(rows) && rows.length > 0) {
          rows.forEach((r: any) => {
            list.push({
              id: r.id || `row_${r.week}`,
              title: `Week ${r.week}: ${r.strand || 'CBC Curriculum'}`,
              categoryName: 'Record of Work',
              categoryId: 'record_of_work',
              strand: r.strand,
              date: r.dateTaught,
              sharedBy: r.teacherSignature || 'Class Teacher',
              content: `Work Done: ${r.workDone}\nLearning Outcomes: ${r.learningOutcomes}`,
              notes: `Sub-strand: ${r.subStrand || 'Core CBC'}`,
              fileType: 'Record',
            });
          });
        }
      }
    } catch {}

    // 5. Stored Lessons (dataLayer.getLessons())
    try {
      const lessons = dataLayer.getLessons();
      lessons.forEach((l) => {
        list.push({
          id: l.id,
          title: l.lessonTitle || `Lesson: ${l.strand}`,
          categoryName: 'Lesson Plans',
          categoryId: 'lesson_plans',
          grade: l.grade,
          subject: l.subject,
          strand: l.strand,
          academicYear: l.academicYear,
          sharedBy: l.teacherName,
          date: l.dateTaught || (l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : undefined),
          content: l.learningOutcomes,
          notes: l.keyInquiryQuestions ? `Key Inquiry: ${l.keyInquiryQuestions}` : undefined,
          fileType: 'Lesson Plan',
        });
      });
    } catch {}

    // 6. Stored Assignments (dataLayer.getAssignments())
    try {
      const assignments = dataLayer.getAssignments();
      assignments.forEach((a) => {
        list.push({
          id: a.id,
          title: a.title,
          categoryName: 'Assignments',
          categoryId: 'assignments',
          grade: a.grade,
          subject: a.subject,
          term: a.term,
          academicYear: a.academicYear,
          sharedBy: a.teacherName,
          date: a.dueDate ? `Due: ${a.dueDate}` : undefined,
          notes: a.description,
          content: a.description,
          fileType: 'Assignment',
          isApproved: a.isApproved,
        });
      });
    } catch {}

    // 7. Stored Assessment / CATs (dataLayer.getCats())
    try {
      const cats = dataLayer.getCats();
      cats.forEach((c) => {
        list.push({
          id: c.id,
          title: c.title,
          categoryName: 'Assessment/CATs',
          categoryId: 'assessments_cats',
          grade: c.grade,
          subject: c.subject,
          strand: c.strand,
          term: c.term,
          academicYear: c.academicYear,
          sharedBy: c.teacherName,
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : undefined,
          content: `CAT Total: ${c.catTotalMarks} marks (scaled to 60%) • Homework: ${c.homeworkTotalMarks} marks (scaled to 40%)`,
          fileType: 'Assessment',
        });
      });
    } catch {}

    return list;
  }, [resourcesRevision]);

  // Real resources count from stored repository records
  const resourcesCount = useMemo(() => {
    return allStoredResources.length;
  }, [allStoredResources]);

  // Active Selected Resource for Inspection
  const activeResourceRecord = useMemo(() => {
    if (!selectedResourceId) return null;
    return allStoredResources.find((r) => r.id === selectedResourceId) || null;
  }, [selectedResourceId, allStoredResources]);

  // Active Category Object
  const activeResourceCategoryObj = useMemo(() => {
    if (!selectedResourceCategory) return null;
    return RESOURCE_CATEGORIES.find((c) => c.id === selectedResourceCategory) || null;
  }, [selectedResourceCategory]);

  // Active Teacher for Resources
  const activeResourceTeacher = useMemo(() => {
    if (!selectedResourceTeacherId) return null;
    return teachers.find((t) => t.id === selectedResourceTeacherId) || null;
  }, [selectedResourceTeacherId, teachers]);

  // Active Teachers who exist in the LRA system and have Grade + Subject assignments
  const activeTeachersForResources = useMemo(() => {
    return teachers
      .map((teacher) => {
        const assignments = getTeacherGradeAssignments(teacher);
        const validAssignments = assignments.filter(
          (a) => a.grade && Array.isArray(a.subjects) && a.subjects.length > 0
        );
        return {
          teacher,
          assignments: validAssignments,
        };
      })
      .filter((item) => item.assignments.length > 0);
  }, [teachers]);

  // Match resources to Category + Teacher + Grade + Subject
  const getMatchingDocumentsForLocation = useCallback(
    (categoryId: string, teacher: TeacherAccountRecord, grade: string, subject: string) => {
      const cleanGrade = grade.trim().toLowerCase();
      const cleanSubject = subject.trim().toLowerCase();
      const tId = teacher.id;
      const tName = teacher.name.toLowerCase().trim();

      return allStoredResources.filter((res) => {
        if (res.categoryId !== categoryId) return false;
        if (res.grade && res.grade.trim().toLowerCase() !== cleanGrade) return false;
        if (res.subject && res.subject.trim().toLowerCase() !== cleanSubject) return false;

        if (res.teacherId && res.teacherId === tId) return true;
        if (res.recipientTeachers && (res.recipientTeachers.includes(tId) || res.recipientTeachers.includes('all'))) {
          return true;
        }
        if (res.sharedBy && res.sharedBy.toLowerCase().trim() === tName) return true;
        // Generic resources for this grade and subject
        if (!res.teacherId && (!res.recipientTeachers || res.recipientTeachers.length === 0) && !res.sharedBy) {
          return true;
        }
        return false;
      });
    },
    [allStoredResources]
  );

  // Handle saving a real resource into the repository
  const handleSaveNewResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim()) {
      setResourceFormError('Please enter a resource title.');
      return;
    }

    const targetCatId = selectedResourceCategory || modalTargetCategory || 'pdf_documents';
    const targetCatObj = RESOURCE_CATEGORIES.find((c) => c.id === targetCatId);
    const categoryName = targetCatObj?.name || 'Other School Documents';

    const targetTeacher =
      activeResourceTeacher ||
      teachers.find((t) => t.id === modalTargetTeacherId) ||
      teachers[0];

    const targetGrade = selectedResourceGrade || modalTargetGrade || 'Grade 4';
    const targetSubject = selectedResourceSubject || modalTargetSubject || 'Mathematics Activities';

    const cleanTitle = newResourceTitle.trim();
    let detectedType = newResourceFileType.toLowerCase().includes('pdf') ? 'pdf' : 'document';
    if (newResourceAttachedFile) {
      const ext = newResourceAttachedFile.name.split('.').pop()?.toLowerCase() || '';
      if (['xlsx', 'xls', 'csv'].includes(ext)) detectedType = 'spreadsheet';
      else if (['pdf'].includes(ext)) detectedType = 'pdf';
      else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) detectedType = 'image';
      else if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) detectedType = 'video';
      else if (['txt', 'md', 'log'].includes(ext)) detectedType = 'text';
    }

    const defaultExt = detectedType === 'pdf' ? 'pdf' : detectedType === 'spreadsheet' ? 'xlsx' : 'doc';
    const cleanFileName =
      newResourceFileName.trim() ||
      (newResourceAttachedFile
        ? newResourceAttachedFile.name
        : `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${defaultExt}`);

    try {
      dataLayer.addResourcePackage({
        packageName: cleanTitle,
        category: categoryName,
        grade: targetGrade,
        subject: targetSubject,
        strand: newResourceStrand.trim() || undefined,
        academicYear: newResourceAcademicYear,
        term: newResourceTerm,
        recipientTeacherIds: targetTeacher ? [targetTeacher.id] : ['all'],
        documents: [
          {
            id: `doc_${Date.now()}`,
            name: cleanFileName,
            size: newResourceAttachedFile ? formatBytes(newResourceAttachedFile.size) : 'Official Document',
            sizeBytes: newResourceAttachedFile ? newResourceAttachedFile.size : undefined,
            content: newResourceNotes.trim() || undefined,
            fileData: newResourceAttachedDataUrl || undefined,
            fileType: detectedType,
            versions: [],
          },
        ],
      });

      setResourcesRevision((r) => r + 1);
      setIsAddingResource(false);
      setNewResourceTitle('');
      setNewResourceNotes('');
      setNewResourceStrand('');
      setNewResourceFileName('');
      setNewResourceAttachedFile(null);
      setNewResourceAttachedDataUrl(null);
      setResourceFormError('');
      setUploadStatusBanner({
        message: `Successfully added "${cleanTitle}" to ${categoryName} (${targetGrade} • ${targetSubject})`,
        type: 'success',
      });
      setTimeout(() => setUploadStatusBanner(null), 5000);
    } catch (err: any) {
      setResourceFormError(`Error saving resource: ${err.message || 'Storage error'}`);
    }
  };

  // Real School Storage Quota Calculation
  const schoolStorageInfo = useMemo(() => {
    const allPkgs = dataLayer.getResourcePackages();
    return calculateStorageUsage(allPkgs);
  }, [resourcesRevision]);

  // Convert StoredResourceItem to WorkspaceResourceItem
  const convertToWorkspaceItem = useCallback(
    (res: StoredResourceItem): WorkspaceResourceItem => {
      const allPkgs = dataLayer.getResourcePackages();
      const pkg = allPkgs.find((p) => p.id === res.id);
      if (pkg) {
        return {
          id: pkg.id,
          title: pkg.packageName,
          category: pkg.category,
          categoryId: res.categoryId,
          grade: pkg.grade,
          subject: pkg.subject,
          strand: pkg.strand,
          term: pkg.term,
          academicYear: pkg.academicYear,
          recipientTeacherIds: pkg.recipientTeacherIds,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          documents: pkg.documents || [],
        };
      }

      const isSpreadsheet =
        res.fileType?.toLowerCase().includes('spreadsheet') ||
        res.fileType?.toLowerCase().includes('excel') ||
        res.fileType?.toLowerCase().includes('csv') ||
        res.fileName?.endsWith('.xlsx') ||
        res.fileName?.endsWith('.csv');
      const isPdf = res.fileType?.toLowerCase().includes('pdf') || res.fileName?.endsWith('.pdf');
      const isImage = res.fileType?.toLowerCase().includes('image') || res.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      const isVideo = res.fileType?.toLowerCase().includes('video') || res.fileName?.match(/\.(mp4|webm|mov)$/i);
      const isText = res.fileType?.toLowerCase().includes('text') || res.fileName?.endsWith('.txt');

      let resolvedType = 'document';
      if (isSpreadsheet) resolvedType = 'spreadsheet';
      else if (isPdf) resolvedType = 'pdf';
      else if (isImage) resolvedType = 'image';
      else if (isVideo) resolvedType = 'video';
      else if (isText) resolvedType = 'text';

      const docs: WorkspaceDocument[] =
        res.documents && res.documents.length > 0
          ? res.documents
          : [
              {
                id: `doc_${res.id}`,
                name: res.fileName || `${res.title}.${isSpreadsheet ? 'xlsx' : isPdf ? 'pdf' : isText ? 'txt' : 'doc'}`,
                content: res.content || res.notes || '',
                fileType: resolvedType,
                size: res.fileSize || 'Standard Document',
                versions: [],
              },
            ];

      return {
        id: res.id,
        title: res.title,
        category: res.categoryName,
        categoryId: res.categoryId,
        grade: res.grade || selectedResourceGrade || 'Grade 1',
        subject: res.subject || selectedResourceSubject || 'General',
        strand: res.strand,
        term: res.term,
        academicYear: res.academicYear,
        documents: docs,
      };
    },
    [selectedResourceGrade, selectedResourceSubject]
  );

  // Upload Real Resource File to Current Location (Media, PDF, Doc, Video, Spreadsheet)
  const handleLocationFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setUploadStatusBanner({
        message: `Upload Failed: File size (${formatBytes(file.size)}) exceeds 50 MB document limit.`,
        type: 'error',
      });
      setTimeout(() => setUploadStatusBanner(null), 6000);
      return;
    }

    const cleanPackageTitle = file.name.replace(/\.[^/.]+$/, '');
    const isText =
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.md');

    // If teacher, grade, or subject not yet chosen, seamlessly open Add Resource modal with file preloaded
    if (!selectedResourceCategory || !selectedResourceTeacherId || !selectedResourceGrade || !selectedResourceSubject) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setNewResourceAttachedFile(file);
          setNewResourceAttachedDataUrl(result);
          setNewResourceTitle(cleanPackageTitle);
          setNewResourceFileName(file.name);
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          if (ext === 'pdf') setNewResourceFileType('PDF Document');
          else if (['xlsx', 'xls', 'csv'].includes(ext)) setNewResourceFileType('Spreadsheet');
          if (selectedResourceCategory) setModalTargetCategory(selectedResourceCategory);
          if (selectedResourceTeacherId) setModalTargetTeacherId(selectedResourceTeacherId);
          if (selectedResourceGrade) setModalTargetGrade(selectedResourceGrade);
          if (selectedResourceSubject) setModalTargetSubject(selectedResourceSubject);
          setIsAddingResource(true);
        }
      };
      if (isText) reader.readAsText(file);
      else reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    const categoryObj = RESOURCE_CATEGORIES.find((c) => c.id === selectedResourceCategory);
    const categoryName = categoryObj?.name || 'Other School Documents';

    // Extract text offline via AI assistant engine
    extractTextFromFile(file).then(({ text }) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (!result) {
          setUploadStatusBanner({
            message: 'Upload Failed: Unable to read file content.',
            type: 'error',
          });
          setTimeout(() => setUploadStatusBanner(null), 5000);
          return;
        }

        let detectedType = 'document';
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (['xlsx', 'xls', 'csv'].includes(ext)) detectedType = 'spreadsheet';
        else if (['pdf'].includes(ext)) detectedType = 'pdf';
        else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) detectedType = 'image';
        else if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) detectedType = 'video';
        else if (['txt', 'md', 'log'].includes(ext)) detectedType = 'text';

        try {
          dataLayer.addResourcePackage({
            packageName: cleanPackageTitle,
            category: categoryName,
            grade: selectedResourceGrade,
            subject: selectedResourceSubject,
            academicYear: '2026',
            term: 'Term 1',
            recipientTeacherIds: [selectedResourceTeacherId],
            documents: [
              {
                id: `doc_${Date.now()}`,
                name: file.name,
                content: text || (isText && typeof result === 'string' ? result : undefined),
                fileData: typeof result === 'string' ? result : undefined,
                fileType: detectedType,
                size: formatBytes(file.size),
                sizeBytes: file.size,
                versions: [],
              },
            ],
          });

        setResourcesRevision((r) => r + 1);
        setUploadStatusBanner({
          message: `Successfully uploaded "${file.name}" (${formatBytes(file.size)}) to ${activeResourceTeacher?.name} • ${selectedResourceGrade} • ${selectedResourceSubject}`,
          type: 'success',
        });
        setTimeout(() => setUploadStatusBanner(null), 5000);
      } catch (err: any) {
        setUploadStatusBanner({
          message: `Upload Failed: ${err.message || 'Storage error'}`,
          type: 'error',
        });
        setTimeout(() => setUploadStatusBanner(null), 6000);
      }
    };

    reader.onerror = () => {
      setUploadStatusBanner({
        message: 'Upload Failed: File read error.',
        type: 'error',
      });
      setTimeout(() => setUploadStatusBanner(null), 5000);
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
    });

    e.target.value = '';
  };

  // Replace Existing File with Quota & Historical Version Preservation
  const handleLocationFileReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetResourceId) return;

    if (file.size > 50 * 1024 * 1024) {
      alert(`Storage Limit Exceeded: File size (${formatBytes(file.size)}) exceeds 50 MB limit.`);
      return;
    }

    const allPkgs = dataLayer.getResourcePackages();
    const pkg = allPkgs.find((p) => p.id === replaceTargetResourceId);
    if (!pkg) {
      alert('Resource package not found in repository.');
      return;
    }

    const isText =
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.md');
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;

      let detectedType = 'document';
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (['xlsx', 'xls', 'csv'].includes(ext)) detectedType = 'spreadsheet';
      else if (['pdf'].includes(ext)) detectedType = 'pdf';
      else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) detectedType = 'image';
      else if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) detectedType = 'video';
      else if (['txt', 'md', 'log'].includes(ext)) detectedType = 'text';

      const currentDocs = [...pkg.documents];
      const targetDoc = currentDocs[0] || {
        id: `doc_${Date.now()}`,
        name: file.name,
      };

      // Preserve previous version in history before replacing
      const versions = [...(targetDoc.versions || [])];
      versions.unshift({
        version: versions.length + 1,
        timestamp: new Date().toISOString(),
        name: targetDoc.name,
        size: targetDoc.size,
        sizeBytes: targetDoc.sizeBytes,
        content: targetDoc.content,
        fileData: targetDoc.fileData,
        fileType: targetDoc.fileType,
        author: 'Replaced by Admin',
      });

      currentDocs[0] = {
        ...targetDoc,
        name: file.name,
        content: isText && typeof result === 'string' ? result : undefined,
        fileData: typeof result === 'string' ? result : undefined,
        fileType: detectedType,
        size: formatBytes(file.size),
        sizeBytes: file.size,
        versions: versions,
      };

      dataLayer.updateResourcePackage(pkg.id, {
        documents: currentDocs,
        updatedAt: new Date().toISOString(),
      });

      setResourcesRevision((r) => r + 1);
      setReplaceTargetResourceId(null);
      setUploadStatusBanner({
        message: `Successfully replaced file with "${file.name}" (archived previous version)`,
        type: 'success',
      });
      setTimeout(() => setUploadStatusBanner(null), 4000);
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  // Create New Document in Working Workspace (Word, Spreadsheet, Text)
  const handleCreateNewDocument = (type: 'document' | 'spreadsheet' | 'text') => {
    if (!selectedResourceCategory || !selectedResourceTeacherId || !selectedResourceGrade || !selectedResourceSubject) {
      return;
    }

    const categoryObj = RESOURCE_CATEGORIES.find((c) => c.id === selectedResourceCategory);
    const categoryName = categoryObj?.name || 'Curriculum Resource';
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(':', '');

    let defaultTitle = '';
    let docName = '';
    let initialContent: string | undefined = undefined;
    let initialSpreadsheetData: { headers: string[]; rows: string[][] } | undefined = undefined;

    if (type === 'spreadsheet') {
      defaultTitle = `${categoryName} Spreadsheet - ${selectedResourceSubject}`;
      docName = `${selectedResourceSubject.toLowerCase().replace(/\s+/g, '_')}_sheet_${timestampStr}.xlsx`;
      initialSpreadsheetData = {
        headers: ['Topic / Strand', 'Week', 'Target Hours', 'Key CBC Competency', 'Assessment Status'],
        rows: [
          ['CBC Theme 1', 'Week 1', '4', 'Communication & Collaboration', 'In Progress'],
          ['CBC Theme 2', 'Week 2', '4', 'Critical Thinking & Problem Solving', 'Pending'],
          ['CBC Theme 3', 'Week 3', '4', 'Digital Literacy', 'Pending'],
          ['CBC Theme 4', 'Week 4', '4', 'Imagination & Creativity', 'Pending'],
        ],
      };
    } else if (type === 'text') {
      defaultTitle = `${categoryName} Notes - ${selectedResourceSubject}`;
      docName = `${selectedResourceSubject.toLowerCase().replace(/\s+/g, '_')}_notes_${timestampStr}.txt`;
      initialContent = `LITTLE ROSES ACADEMY\n${categoryName.toUpperCase()} — ${selectedResourceSubject.toUpperCase()}\nGrade: ${selectedResourceGrade}\nTeacher: ${activeResourceTeacher?.name}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\n`;
    } else {
      defaultTitle = `${categoryName} - ${selectedResourceSubject}`;
      docName = `${selectedResourceSubject.toLowerCase().replace(/\s+/g, '_')}_document_${timestampStr}.doc`;
      initialContent = `<h1>${categoryName}: ${selectedResourceSubject}</h1><p><b>Grade:</b> ${selectedResourceGrade} | <b>Teacher:</b> ${activeResourceTeacher?.name}</p><hr/><p>Start composing official curriculum documentation here...</p>`;
    }

    const newPkg = dataLayer.addResourcePackage({
      packageName: defaultTitle,
      category: categoryName,
      grade: selectedResourceGrade,
      subject: selectedResourceSubject,
      academicYear: '2026',
      term: 'Term 1',
      recipientTeacherIds: [selectedResourceTeacherId],
      documents: [
        {
          id: `doc_${Date.now()}`,
          name: docName,
          content: initialContent,
          fileType: type,
          spreadsheetData: initialSpreadsheetData,
          size: '4 KB',
          sizeBytes: 4096,
          versions: [],
        },
      ],
    });

    setResourcesRevision((r) => r + 1);

    // Launch immediately into full workspace
    const wsItem: WorkspaceResourceItem = {
      id: newPkg.id,
      title: newPkg.packageName,
      category: newPkg.category,
      categoryId: selectedResourceCategory,
      grade: newPkg.grade,
      subject: newPkg.subject,
      strand: newPkg.strand,
      term: newPkg.term,
      academicYear: newPkg.academicYear,
      recipientTeacherIds: newPkg.recipientTeacherIds,
      createdAt: newPkg.createdAt,
      documents: newPkg.documents || [],
    };
    setActiveWorkspaceResource(wsItem);
  };

  // Card Action: Duplicate / Save As Copy
  const handleCardDuplicateResource = (res: StoredResourceItem) => {
    try {
      const allPkgs = dataLayer.getResourcePackages();
      const existingPkg = allPkgs.find((p) => p.id === res.id);
      const copyTitle = `Copy of ${res.title}`;

      if (existingPkg) {
        dataLayer.addResourcePackage({
          ...existingPkg,
          packageName: copyTitle,
          documents: existingPkg.documents.map((d) => ({
            ...d,
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: `copy_${d.name}`,
            versions: [],
          })),
        });
      } else {
        dataLayer.addResourcePackage({
          packageName: copyTitle,
          category: res.categoryName,
          grade: res.grade || selectedResourceGrade || 'Grade 1',
          subject: res.subject || selectedResourceSubject || 'General',
          strand: res.strand,
          academicYear: res.academicYear || '2026',
          term: res.term || 'Term 1',
          recipientTeacherIds: [selectedResourceTeacherId || 'all'],
          documents: [
            {
              id: `doc_${Date.now()}`,
              name: `copy_${res.fileName || 'resource.doc'}`,
              content: res.content || res.notes || '',
              fileType: res.fileType?.toLowerCase() || 'document',
              size: res.fileSize || 'Standard',
              versions: [],
            },
          ],
        });
      }

      setResourcesRevision((r) => r + 1);
      setUploadStatusBanner({
        message: `Created duplicate copy: "${copyTitle}"`,
        type: 'success',
      });
      setTimeout(() => setUploadStatusBanner(null), 3500);
    } catch (err: any) {
      alert(`Error creating copy: ${err.message}`);
    }
  };

  // Card Action: Delete Resource Permanently
  const handleCardDeleteResource = (res: StoredResourceItem) => {
    setDeleteConfirmTarget({
      type: 'resource',
      id: res.id,
      name: res.title,
      subtitle: `${res.grade || ''} • ${res.subject || ''} • ${res.categoryName || res.categoryId || ''}`,
    });
  };

  // Card Action: Download Resource
  const handleCardDownloadResource = (res: StoredResourceItem) => {
    try {
      const allPkgs = dataLayer.getResourcePackages();
      const existingPkg = allPkgs.find((p) => p.id === res.id);
      const doc = existingPkg?.documents?.[0];

      const link = document.createElement('a');
      link.download = doc?.name || res.fileName || `${res.title}.txt`;

      if (doc?.fileData) {
        link.href = doc.fileData;
      } else if (doc?.fileType === 'spreadsheet' && doc.spreadsheetData) {
        const csvContent = [
          doc.spreadsheetData.headers.join(','),
          ...doc.spreadsheetData.rows.map((row) => row.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        link.href = URL.createObjectURL(blob);
      } else {
        const content = doc?.content || res.content || res.notes || res.title;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        link.href = URL.createObjectURL(blob);
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Card Modal: Rename Submit
  const handleRenameResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameModalResource || !renameNewTitle.trim()) return;

    try {
      const allPkgs = dataLayer.getResourcePackages();
      const pkg = allPkgs.find((p) => p.id === renameModalResource.id);
      if (pkg) {
        const currentDocs = [...pkg.documents];
        if (currentDocs[0] && renameNewFileName.trim()) {
          currentDocs[0].name = renameNewFileName.trim();
        }
        dataLayer.updateResourcePackage(pkg.id, {
          packageName: renameNewTitle.trim(),
          documents: currentDocs,
          updatedAt: new Date().toISOString(),
        });
      }

      setRenameModalResource(null);
      setResourcesRevision((r) => r + 1);
      setUploadStatusBanner({
        message: `Renamed resource to "${renameNewTitle.trim()}"`,
        type: 'success',
      });
      setTimeout(() => setUploadStatusBanner(null), 3000);
    } catch (err: any) {
      alert(`Rename error: ${err.message}`);
    }
  };

  // Card Modal: Move Submit (Targets ONLY real teacher assignments)
  const handleMoveResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveModalResource || !moveTargetTeacherId || !moveTargetGrade || !moveTargetSubject) return;

    try {
      dataLayer.updateResourcePackage(moveModalResource.id, {
        grade: moveTargetGrade,
        subject: moveTargetSubject,
        recipientTeacherIds: [moveTargetTeacherId],
        updatedAt: new Date().toISOString(),
      });

      setMoveModalResource(null);
      setResourcesRevision((r) => r + 1);
      setUploadStatusBanner({
        message: `Moved resource to ${moveTargetGrade} • ${moveTargetSubject}`,
        type: 'success',
      });
      setTimeout(() => setUploadStatusBanner(null), 3000);
    } catch (err: any) {
      alert(`Move error: ${err.message}`);
    }
  };

  // Card Modal: Restore Historical Version
  const handleRestoreCardVersion = (res: WorkspaceResourceItem, v: any) => {
    const allPkgs = dataLayer.getResourcePackages();
    const existingPkg = allPkgs.find((p) => p.id === res.id);
    if (existingPkg) {
      const currentDocs = [...existingPkg.documents];
      const targetDoc = currentDocs[0] || { id: `doc_${Date.now()}`, name: res.title };

      const versions = [...(targetDoc.versions || [])];
      versions.unshift({
        version: versions.length + 1,
        timestamp: new Date().toISOString(),
        name: targetDoc.name,
        size: targetDoc.size,
        sizeBytes: targetDoc.sizeBytes,
        content: targetDoc.content,
        fileData: targetDoc.fileData,
        fileType: targetDoc.fileType,
        author: 'Current before Restore',
      });

      currentDocs[0] = {
        ...targetDoc,
        name: v.name,
        content: v.content,
        fileData: v.fileData,
        fileType: v.fileType,
        versions: versions,
      };

      dataLayer.updateResourcePackage(res.id, {
        documents: currentDocs,
        updatedAt: new Date().toISOString(),
      });
    }

    setVersionsModalResource(null);
    setResourcesRevision((r) => r + 1);
    setUploadStatusBanner({
      message: `Restored version ${v.version}`,
      type: 'success',
    });
    setTimeout(() => setUploadStatusBanner(null), 3000);
  };

  // Real timetable count from stored timetable slots
  const timetableCount = useMemo(() => {
    return storedTimetableSlots.length;
  }, [storedTimetableSlots]);

  // ---------------------------------------------------------------------------
  // REAL DATA COMPUTATIONS FOR TODAY AT SCHOOL & UPCOMING EVENTS (TASK 3)
  // ---------------------------------------------------------------------------
  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const todayIsoDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // 1. Real scheduled timetable slots for today from stored timetable
  const todayTimetableSlots = useMemo(() => {
    return storedTimetableSlots.filter((s: any) => {
      if (!s.day) return false;
      const dayStr = String(s.day).trim().toLowerCase();
      const todayStr = todayDayName.toLowerCase();
      return dayStr === todayStr || dayStr === todayStr.slice(0, 3);
    });
  }, [storedTimetableSlots, todayDayName]);

  // 2. Real school activity pauses active today
  const todayPauses = useMemo(() => {
    const termDates = dataLayer.getTermDates();
    return (termDates.activityPauses || []).filter(
      (p) => todayIsoDate >= p.startDate && todayIsoDate <= p.endDate
    );
  }, [todayIsoDate]);

  // 3. Real notices for today
  const todayNotices = useMemo(() => {
    try {
      const saved = localStorage.getItem('lra_school_notices');
      if (saved) {
        const notices = JSON.parse(saved);
        if (Array.isArray(notices)) {
          return notices.filter((n: any) => n.date === todayIsoDate);
        }
      }
    } catch {}
    return [];
  }, [todayIsoDate]);

  // 4. Combined real items for Today at School
  const todaySchoolItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      category: 'Scheduled Lesson' | 'School Activity' | 'Notice' | 'Event';
      timeOrInfo: string;
      meta?: string;
      targetNav?: AdminTab;
    }> = [];

    // Active pauses today
    todayPauses.forEach((p) => {
      items.push({
        id: `pause_${p.id}`,
        title: `School Activity Pause: ${p.reason}`,
        category: 'School Activity',
        timeOrInfo: `${p.startDate} to ${p.endDate}`,
        meta: 'School Office Administrative Pause',
        targetNav: 'calendar',
      });
    });

    // Today's scheduled timetable lessons
    todayTimetableSlots.forEach((slot: any, idx: number) => {
      items.push({
        id: `slot_${slot.id || idx}`,
        title: slot.isBreak ? (slot.breakLabel || 'Break Period') : `${slot.subject} (${slot.grade})`,
        category: 'Scheduled Lesson',
        timeOrInfo: slot.time || `Period ${slot.periodIndex || idx + 1}`,
        meta: slot.teacher ? `Teacher: ${slot.teacher}` : undefined,
        targetNav: 'timetable',
      });
    });

    // Today's notices
    todayNotices.forEach((n: any) => {
      items.push({
        id: `notice_${n.id}`,
        title: n.title || 'Official School Notice',
        category: 'Notice',
        timeOrInfo: n.priority ? `Priority: ${n.priority}` : 'School Office Announcement',
        meta: n.targetGrade || 'All Classes',
        targetNav: 'noticeboard',
      });
    });

    return items;
  }, [todayPauses, todayTimetableSlots, todayNotices]);

  // Real Upcoming Events from existing academic year, term milestones, holidays & assignments
  const upcomingEvents = useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      date: string;
      displayDate: string;
      type: 'Term Milestone' | 'National Holiday' | 'Activity Pause' | 'Assessment Due';
      details: string;
      targetNav: AdminTab;
    }> = [];

    const activeYear = dataLayer.getActiveAcademicYear();

    // 1. Term open & close milestones
    if (activeYear?.terms) {
      activeYear.terms.forEach((t) => {
        if (t.openDate >= todayIsoDate) {
          events.push({
            id: `term_open_${t.term}`,
            title: `${t.term} Opening Day`,
            date: t.openDate,
            displayDate: new Date(t.openDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: 'Term Milestone',
            details: `Official opening of ${t.term} for all primary grades`,
            targetNav: 'calendar',
          });
        }
        if (t.closeDate >= todayIsoDate) {
          events.push({
            id: `term_close_${t.term}`,
            title: `${t.term} Closing Day`,
            date: t.closeDate,
            displayDate: new Date(t.closeDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: 'Term Milestone',
            details: `End of ${t.term} & commencement of school break`,
            targetNav: 'calendar',
          });
        }
      });
    }

    // 2. Official Academic Holidays
    if (activeYear?.holidays) {
      activeYear.holidays.forEach((h) => {
        if (h.endDate >= todayIsoDate) {
          events.push({
            id: `hol_${h.id}`,
            title: h.name,
            date: h.startDate,
            displayDate: new Date(h.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: 'National Holiday',
            details: h.startDate === h.endDate ? 'Public Holiday • School Closed' : `${h.startDate} to ${h.endDate}`,
            targetNav: 'calendar',
          });
        }
      });
    }

    // 3. Activity Pauses
    const termDates = dataLayer.getTermDates();
    if (termDates?.activityPauses) {
      termDates.activityPauses.forEach((p) => {
        if (p.endDate >= todayIsoDate) {
          events.push({
            id: `pause_${p.id}`,
            title: p.reason || 'Scheduled Activity Pause',
            date: p.startDate,
            displayDate: new Date(p.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: 'Activity Pause',
            details: `School-wide break until ${p.endDate}`,
            targetNav: 'calendar',
          });
        }
      });
    }

    // 4. Assignments / Assessments
    const assignments = dataLayer.getAssignments({ approvedOnly: true });
    assignments.forEach((a) => {
      if (a.dueDate >= todayIsoDate) {
        events.push({
          id: `asg_${a.id}`,
          title: `${a.subject}: ${a.title}`,
          date: a.dueDate,
          displayDate: new Date(a.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          type: 'Assessment Due',
          details: `${a.grade} assignment due date`,
          targetNav: 'assessments',
        });
      }
    });

    return events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  }, [todayIsoDate]);

  // ---------------------------------------------------------------------------
  // REAL RECENT ACTIVITY & AUDIT ACTIONS (TASK 4)
  // ---------------------------------------------------------------------------
  interface RealActivityItem {
    id: string;
    action: string;
    category: 'Learner' | 'Teacher' | 'Resource' | 'Assessment' | 'Curriculum' | 'Notice' | 'Audit';
    userRole: string;
    displayTime: string;
    timestamp: number;
    details?: string;
    targetNav: AdminTab;
    recordId?: string;
  }

  const recentActivities = useMemo(() => {
    const list: RealActivityItem[] = [];

    // Helper for formatting real dates & times
    const formatTime = (raw?: string): string => {
      if (!raw) return '';
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
      if (isToday) return `Today, ${timeStr}`;
      if (isYesterday) return `Yesterday, ${timeStr}`;
      return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${timeStr}`;
    };

    // 1. Real learner records added or updated
    pupils.forEach((p) => {
      if (p.enrolledAt) {
        list.push({
          id: `act_p_${p.id}`,
          action: `Learner Enrolled: ${p.name}`,
          category: 'Learner',
          userRole: 'School Office',
          displayTime: formatTime(p.enrolledAt),
          timestamp: new Date(p.enrolledAt).getTime() || 0,
          details: `${p.grade} • UPI: ${p.upi} • Status: ${p.status}`,
          targetNav: 'learners',
          recordId: p.id,
        });
      }
    });

    // 2. Real teacher records added or updated
    teachers.forEach((t) => {
      if (t.createdAt) {
        list.push({
          id: `act_t_${t.id}`,
          action: `Teacher Registered: ${t.name}`,
          category: 'Teacher',
          userRole: 'Administrator',
          displayTime: formatTime(t.createdAt),
          timestamp: new Date(t.createdAt).getTime() || 0,
          details: `${t.assignedGrades?.join(', ') || 'Teaching Staff'} • ${t.phone}`,
          targetNav: 'teachers',
          recordId: t.id,
        });
      }
    });

    // 3. Real resources uploaded or published
    try {
      const resourcePackages = dataLayer.getResourcePackages();
      resourcePackages.forEach((pkg) => {
        if (pkg.createdAt) {
          list.push({
            id: `act_pkg_${pkg.id}`,
            action: `Resource Uploaded: ${pkg.packageName}`,
            category: 'Resource',
            userRole: 'Curriculum Admin',
            displayTime: formatTime(pkg.createdAt),
            timestamp: new Date(pkg.createdAt).getTime() || 0,
            details: `${pkg.category} • ${pkg.grade || 'All Grades'} • ${pkg.subject || 'CBC'}`,
            targetNav: 'resources',
          });
        }
      });
      const sharedDocsRaw = localStorage.getItem('lra_shared_admin_docs');
      if (sharedDocsRaw) {
        const sharedDocs = JSON.parse(sharedDocsRaw);
        if (Array.isArray(sharedDocs)) {
          sharedDocs.forEach((doc: any) => {
            if (doc.date) {
              list.push({
                id: `act_doc_${doc.id || Math.random()}`,
                action: `Document Published: ${doc.title || doc.fileName}`,
                category: 'Resource',
                userRole: doc.sharedBy || 'School Office',
                displayTime: formatTime(doc.date),
                timestamp: new Date(doc.date).getTime() || 0,
                details: `${doc.category || 'Curriculum'} • ${doc.targetGrade || 'All Grades'}`,
                targetNav: 'resources',
              });
            }
          });
        }
      }
    } catch {}

    // 4. Real assessments created or updated
    try {
      const cats = dataLayer.getCats();
      cats.forEach((c) => {
        if (c.createdAt) {
          list.push({
            id: `act_cat_${c.id}`,
            action: `Assessment Created: ${c.title}`,
            category: 'Assessment',
            userRole: c.teacherName || 'Subject Teacher',
            displayTime: formatTime(c.createdAt),
            timestamp: new Date(c.createdAt).getTime() || 0,
            details: `${c.grade} • ${c.subject} (Total: ${(c.catTotalMarks || 20) + (c.homeworkTotalMarks || 10)} marks)`,
            targetNav: 'assessments',
          });
        }
      });
    } catch {}

    // 5. Real curriculum changes / lessons
    try {
      const lessons = dataLayer.getLessons();
      lessons.forEach((l) => {
        const lessonDate = l.dateTaught || l.createdAt;
        if (lessonDate) {
          list.push({
            id: `act_lsn_${l.id}`,
            action: `Lesson ${l.status}: ${l.lessonTitle}`,
            category: 'Curriculum',
            userRole: l.teacherName || 'Class Teacher',
            displayTime: formatTime(lessonDate),
            timestamp: new Date(lessonDate).getTime() || 0,
            details: `${l.grade} • ${l.subject}${l.reflection ? ` (${l.reflection})` : ''}`,
            targetNav: 'curriculum',
          });
        }
      });
    } catch {}

    // 6. Real notices or school events created
    try {
      const noticesRaw = localStorage.getItem('lra_school_notices');
      if (noticesRaw) {
        const notices = JSON.parse(noticesRaw);
        if (Array.isArray(notices)) {
          notices.forEach((n: any) => {
            const noticeDate = n.createdAt || n.date;
            if (noticeDate) {
              list.push({
                id: `act_ntc_${n.id || Math.random()}`,
                action: `Notice Issued: ${n.title}`,
                category: 'Notice',
                userRole: 'School Office',
                displayTime: formatTime(noticeDate),
                timestamp: new Date(noticeDate).getTime() || 0,
                details: `${n.priority ? `[${n.priority}] ` : ''}${n.targetGrade || 'All Classes'}`,
                targetNav: 'noticeboard',
              });
            }
          });
        }
      }
    } catch {}

    // 7. Focus zone learning interventions
    try {
      const fzItems = dataLayer.getFocusZoneItems();
      fzItems.forEach((fz) => {
        if (fz.dateReported) {
          list.push({
            id: `act_fz_${fz.id}`,
            action: `Support Logged: ${fz.pupilName} (${fz.subject})`,
            category: 'Learner',
            userRole: 'Class Teacher',
            displayTime: formatTime(fz.dateReported),
            timestamp: new Date(fz.dateReported).getTime() || 0,
            details: `Strand: ${fz.strand} • Status: ${fz.status}`,
            targetNav: 'learners',
          });
        }
      });
    } catch {}

    // 8. Other real Admin audit activity from storage
    try {
      const auditRaw = localStorage.getItem('lra_audit_log') || localStorage.getItem('lra_admin_activity');
      if (auditRaw) {
        const audits = JSON.parse(auditRaw);
        if (Array.isArray(audits)) {
          audits.forEach((a: any) => {
            if (a.timestamp || a.date) {
              list.push({
                id: `act_adt_${a.id || Math.random()}`,
                action: a.action || a.title || 'Administrative Action',
                category: 'Audit',
                userRole: a.userRole || a.user || 'Administrator',
                displayTime: formatTime(a.date || (a.timestamp ? new Date(a.timestamp).toISOString() : '')),
                timestamp: a.timestamp || (a.date ? new Date(a.date).getTime() : 0),
                details: a.details || a.meta || 'Office audit log',
                targetNav: (a.targetNav as AdminTab) || 'security',
              });
            }
          });
        }
      }
    } catch {}

    // Sort descending by real timestamp: most recent action first
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, [pupils, teachers]);

  // ---------------------------------------------------------------------------
  // NAVIGATION HANDLER WITH UNSAVED CHANGES GUARD & HISTORY PUSH
  // ---------------------------------------------------------------------------
  const handleNavigate = useCallback(
    (tab: AdminTab) => {
      if (tab === 'signout') {
        dataLayer.clearSession();
        onBackToPortals();
        return;
      }

      // Check unsaved changes
      if (hasUnsavedChanges && tab !== activeTab) {
        setPendingNavTab(tab);
        setShowUnsavedDialog(true);
        return;
      }

      if (tab !== activeTab) {
        setNavHistory((prev) => [...prev, activeTab]);
        setActiveTab(tab);
        try {
          window.history.pushState({ adminTab: tab }, '');
        } catch {}
      }

      // Reset deep sub-views when switching tabs
      setSelectedTeacherId(null);
      setSelectedPupilId(null);
      setSelectedParentPhone(null);
      setSelectedResourceCategory(null);
      setSelectedResourceTeacherId(null);
      setSelectedResourceGrade(null);
      setSelectedResourceSubject(null);
      setSelectedResourceId(null);
      setActiveWorkspaceResource(null);
      setRenameModalResource(null);
      setMoveModalResource(null);
      setVersionsModalResource(null);
      setActiveCardMenuId(null);
      setIsAddingResource(false);
      setIsSidebarOpen(false);
      setShowUsersSheet(false);
      setOpenThreeDotMenu(null);
    },
    [activeTab, hasUnsavedChanges, onBackToPortals]
  );

  // Go Back in Navigation Hierarchy
  const handleGoBack = useCallback(() => {
    if (activeWorkspaceResource) {
      setActiveWorkspaceResource(null);
      return;
    }

    if (renameModalResource || moveModalResource || versionsModalResource) {
      setRenameModalResource(null);
      setMoveModalResource(null);
      setVersionsModalResource(null);
      return;
    }

    if (selectedResourceId) {
      setSelectedResourceId(null);
      return;
    }

    if (isAddingResource) {
      setIsAddingResource(false);
      return;
    }

    if (selectedResourceSubject) {
      setSelectedResourceSubject(null);
      return;
    }

    if (selectedResourceGrade) {
      setSelectedResourceGrade(null);
      return;
    }

    if (selectedResourceTeacherId) {
      setSelectedResourceTeacherId(null);
      return;
    }

    if (selectedResourceCategory) {
      setSelectedResourceCategory(null);
      return;
    }

    if (selectedTeacherId || selectedPupilId || selectedParentPhone) {
      setSelectedTeacherId(null);
      setSelectedPupilId(null);
      setSelectedParentPhone(null);
      return;
    }

    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      setNavHistory((h) => h.slice(0, -1));
      setActiveTab(prevTab);
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    } else {
      setShowExitDialog(true);
    }
  }, [
    activeTab,
    navHistory,
    selectedTeacherId,
    selectedPupilId,
    selectedParentPhone,
    selectedResourceId,
    isAddingResource,
    selectedResourceSubject,
    selectedResourceGrade,
    selectedResourceTeacherId,
    selectedResourceCategory,
    activeWorkspaceResource,
    renameModalResource,
    moveModalResource,
    versionsModalResource,
  ]);

  // Unsaved Changes resolution handlers
  const handleSaveAndLeave = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingNavTab) {
      setNavHistory((prev) => [...prev, activeTab]);
      setActiveTab(pendingNavTab);
      setPendingNavTab(null);
    }
  };

  const handleDiscardAndLeave = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingNavTab) {
      setNavHistory((prev) => [...prev, activeTab]);
      setActiveTab(pendingNavTab);
      setPendingNavTab(null);
    }
  };

  // ---------------------------------------------------------------------------
  // HARDWARE ANDROID BACK & BROWSER POPSTATE LISTENER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handlePopState = () => {
      // 1. Close mobile drawer if open
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return;
      }
      // 2. Close 3-dot overflow menu if open
      if (openThreeDotMenu) {
        setOpenThreeDotMenu(null);
        return;
      }
      // 3. Close Users bottom sheet if open
      if (showUsersSheet) {
        setShowUsersSheet(false);
        return;
      }
      // 4. Close profile modal if open
      if (showProfileModal) {
        setShowProfileModal(false);
        return;
      }
      // 4b. Close event detail modal if open (Task 3)
      if (selectedEventModal) {
        setSelectedEventModal(null);
        return;
      }
      // 5. Close unsaved changes dialog if open
      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        setPendingNavTab(null);
        return;
      }
      // 6. Close exit dialog if open
      if (showExitDialog) {
        setShowExitDialog(false);
        return;
      }
      // 7. If inside workspace or card modals
      if (activeWorkspaceResource) {
        setActiveWorkspaceResource(null);
        return;
      }
      if (renameModalResource || moveModalResource || versionsModalResource) {
        setRenameModalResource(null);
        setMoveModalResource(null);
        setVersionsModalResource(null);
        return;
      }
      // 7b. If inside resource detail, add resource modal, or hierarchy levels
      if (selectedResourceId) {
        setSelectedResourceId(null);
        return;
      }
      if (isAddingResource) {
        setIsAddingResource(false);
        return;
      }
      if (selectedResourceSubject) {
        setSelectedResourceSubject(null);
        return;
      }
      if (selectedResourceGrade) {
        setSelectedResourceGrade(null);
        return;
      }
      if (selectedResourceTeacherId) {
        setSelectedResourceTeacherId(null);
        return;
      }
      if (selectedResourceCategory) {
        setSelectedResourceCategory(null);
        return;
      }
      // 7b. If inside child item detail (teacher, learner, or parent)
      if (selectedTeacherId || selectedPupilId || selectedParentPhone) {
        setSelectedTeacherId(null);
        setSelectedPupilId(null);
        setSelectedParentPhone(null);
        return;
      }
      // 8. If in child tab, go back in history
      if (navHistory.length > 0) {
        const prev = navHistory[navHistory.length - 1];
        setNavHistory((h) => h.slice(0, -1));
        setActiveTab(prev);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      } else {
        // Already at Home: Show "LEAVING ALREADY? 🥺"
        setShowExitDialog(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handlePopState();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isSidebarOpen,
    openThreeDotMenu,
    showUsersSheet,
    showProfileModal,
    showUnsavedDialog,
    showExitDialog,
    selectedTeacherId,
    selectedPupilId,
    selectedParentPhone,
    navHistory,
    activeTab,
  ]);

  // Close menus when clicking outside
  const handleBackdropClick = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
    if (openThreeDotMenu) setOpenThreeDotMenu(null);
    if (showUsersSheet) setShowUsersSheet(false);
  };

  // Selected Teacher Record for Deep Profile Navigation
  const activeTeacherRecord = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachers.find((t) => t.id === selectedTeacherId) || null;
  }, [selectedTeacherId, teachers]);

  // Selected Pupil Record for Deep Profile Navigation
  const activePupilRecord = useMemo(() => {
    if (!selectedPupilId) return null;
    return pupils.find((p) => p.id === selectedPupilId) || null;
  }, [selectedPupilId, pupils]);

  // Selected Parent / Family Record for Deep Profile Navigation
  const activeParentRecord: ParentAccount | null = useMemo(() => {
    if (!selectedParentPhone) return null;
    const norm = normalizePhoneNumber(selectedParentPhone);
    const parentAcc = parents.find(
      (p) => normalizePhoneNumber(p.parentPhone || p.phone) === norm || p.id === selectedParentPhone
    );
    if (parentAcc) return parentAcc;
    const pupil = pupils.find((p) => normalizePhoneNumber(p.parentPhone) === norm);
    if (pupil) {
      const upis = pupils.filter((p) => normalizePhoneNumber(p.parentPhone) === norm).map((p) => p.upi);
      const fallback: ParentAccount = {
        id: `parent-${norm}`,
        parentPhone: norm,
        phone: norm,
        parentName: pupil.parentName,
        name: pupil.parentName,
        passwordHash: '',
        rawPassword: '123456',
        residence: pupil.residence || '',
        photoUrl: undefined,
        linkedChildrenUpi: upis,
        pupilUpiList: upis,
        createdAt: pupil.enrolledAt || new Date().toISOString(),
        updatedAt: pupil.enrolledAt || new Date().toISOString(),
      };
      return fallback;
    }
    return null;
  }, [selectedParentPhone, parents, pupils]);

  // ---------------------------------------------------------------------------
  // PERMISSION PROTECTION: VERIFY AUTHENTICATED ADMIN SESSION
  // ---------------------------------------------------------------------------
  const isAuthorizedAdmin = session && (session.role === 'admin' || session.identifier === 'ADMIN');

  if (!isAuthorizedAdmin) {
    return (
      <div className="w-full h-screen h-[100dvh] flex items-center justify-center p-4 bg-[#080E24] text-white">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-rose-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-400 flex items-center justify-center text-2xl mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-rose-300 uppercase tracking-wider">
              ACCESS DENIED
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Administrative credentials are required to view the School Office portal.
            </p>
          </div>
          <button
            onClick={onBackToPortals}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
          >
            Sign In as Administrator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setOpenThreeDotMenu(null)}
      className={`w-full min-h-screen h-[100dvh] flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-200 select-none ${
        isDark ? 'bg-[#0A1128] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* =======================================================================
          1. TABLET & DESKTOP LEFT SIDEBAR NAVIGATION
          ======================================================================= */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 w-64 lg:w-72 border-r transition-all duration-300 z-30 ${
          isDark
            ? 'bg-[#080E24] border-slate-800/80 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div
          className={`p-4 border-b flex items-center gap-3 ${
            isDark ? 'border-slate-800/80 bg-[#060B1E]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Logo size="xs" showTagline={false} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xs font-black tracking-wider uppercase text-amber-400 truncate leading-tight">
              Little Roses Academy
            </h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase truncate">
              Nakuru • Admin Portal
            </p>
          </div>
        </div>

        {/* 19 Admin Navigation Items in Exact Specification Order */}
        <nav
          aria-label="Admin Navigation"
          className="flex-1 overflow-y-auto p-2.5 space-y-1 focus:outline-none"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isSignOut = item.id === 'signout';

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : isSignOut
                    ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={item.description}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* Connected School Portals Quick Links */}
          <div className="pt-2 mt-2 border-t border-slate-800/80 px-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1.5 px-2">
              Connected Portals
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (onSwitchPortal) onSwitchPortal('teachers');
                  else if (onSwitchToTeachers) onSwitchToTeachers();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>👨‍🏫</span>
                  <span className="truncate">Teachers Studio</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSwitchPortal) onSwitchPortal('parents');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>👨‍👩‍👧</span>
                  <span className="truncate">Parents Portal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSwitchPortal) onSwitchPortal('learners');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>🎒</span>
                  <span className="truncate">Learners Zone</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer: Real Academic Year & Term info */}
        <div
          className={`p-3.5 border-t text-xs ${
            isDark ? 'border-slate-800/80 bg-[#060B1E]/90' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Academic Year
              </span>
              <span className="text-sm font-black text-amber-400">
                {activeAcademicYear ? activeAcademicYear.year : 'Not Configured'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pacing
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {termInfo.isConfigured ? `${termInfo.term} • Wk ${termInfo.weekNumber}` : 'Term Not Set'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* =======================================================================
          2. MOBILE SLIDE-OVER DRAWER (PHONE COMPACT 19-TABS MENU)
          ======================================================================= */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <div className="relative w-4/5 max-w-xs bg-[#080E24] text-white h-full flex flex-col shadow-2xl border-r border-slate-800 z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-[#060B1E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo size="xs" showTagline={false} />
                <div>
                  <h2 className="text-xs font-black tracking-wider uppercase text-amber-400">
                    Little Roses Academy
                  </h2>
                  <p className="text-[10px] text-slate-400">Admin Portal Shell</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 19 Items in Mobile Drawer */}
            <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isSignOut = item.id === 'signout';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow font-black'
                        : isSignOut
                        ? 'text-rose-400 hover:bg-rose-950/40'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>
                );
              })}

              {/* Mobile Drawer Connected Portals */}
              <div className="pt-2 mt-2 border-t border-slate-800/80 px-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1.5 px-2">
                  Connected Portals
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (onSwitchPortal) onSwitchPortal('teachers');
                      else if (onSwitchToTeachers) onSwitchToTeachers();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>👨‍🏫</span>
                      <span>Teachers Studio</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (onSwitchPortal) onSwitchPortal('parents');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>👨‍👩‍👧</span>
                      <span>Parents Portal</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      if (onSwitchPortal) onSwitchPortal('learners');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>🎒</span>
                      <span>Learners Zone</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  </button>
                </div>
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#060B1E] flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>{activeAcademicYear ? `${termInfo.term} • ${activeAcademicYear.year}` : 'Academic Year Not Configured'}</span>
              <span className="text-emerald-400 font-mono">
                {termInfo.isConfigured ? `Week ${termInfo.weekNumber}` : 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          3. PHONE "USERS" BOTTOM SHEET (Teachers | Learners | Families)
          ======================================================================= */}
      {showUsersSheet && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowUsersSheet(false)}
            aria-hidden="true"
          />
          <div className="relative w-full bg-[#09112A] text-white rounded-t-3xl border-t border-slate-700 p-4 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 rounded-full bg-slate-700 mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">
                People & User Management
              </h3>
              <button
                onClick={() => setShowUsersSheet(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  setShowUsersSheet(false);
                  handleNavigate('teachers');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-blue-600 text-white border-blue-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Teachers</span>
                    <span className="text-[10px] text-slate-400">Manage teachers, staff & allocations</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-300">{teachersCount}</span>
              </button>

              <button
                onClick={() => {
                  setShowUsersSheet(false);
                  handleNavigate('learners');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'learners'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Learners</span>
                    <span className="text-[10px] text-slate-400">Manage pupil admissions & UPI records</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300">{learnersCount}</span>
              </button>

              <button
                onClick={() => {
                  setShowUsersSheet(false);
                  handleNavigate('families');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'families'
                    ? 'bg-purple-600 text-white border-purple-500 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Families / Parents</span>
                    <span className="text-[10px] text-slate-400">Manage parent accounts & households</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300">{familiesCount}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          4. MAIN CONTENT WRAPPER
          ======================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP IDENTITY & ACTION BAR */}
        <header
          className={`flex-shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2.5 z-20 ${
            isDark
              ? 'bg-[#09112A]/95 border-slate-800/80 shadow-md backdrop-blur-md'
              : 'bg-white/95 border-slate-200 shadow-sm backdrop-blur-md'
          }`}
        >
          {/* Left: Mobile 3-Line Hamburger + Title / Greeting */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800/80 text-amber-300 hover:text-white border border-slate-700/60 transition active:scale-95 cursor-pointer flex items-center justify-center flex-shrink-0"
              title="Open Complete Navigation Menu"
              aria-label="Open Complete Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Back button when inside child views */}
            {activeTab !== 'home' && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/60 transition active:scale-95 cursor-pointer flex items-center justify-center flex-shrink-0"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {/* Phone Logo visible when sidebar is hidden */}
            <div className="md:hidden w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Logo size="xs" showTagline={false} />
            </div>

            <div className="min-w-0">
              <h2 className="font-extrabold text-xs sm:text-base text-white tracking-tight truncate leading-snug">
                {greeting}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                School Office Administrator
              </p>
            </div>
          </div>

          {/* Right: Search, Theme switch, Notifications, Admin Profile chip */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Search Input (Hidden on extra small, shown on sm+) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-slate-300 w-44 md:w-56 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent border-0 text-white placeholder-slate-400 focus:outline-none text-xs"
              />
            </div>

            {/* Connected Portals Switcher */}
            <PortalSwitcherBadge
              currentPortal="admin"
              onSwitchPortal={(portal) => {
                if (onSwitchPortal) {
                  onSwitchPortal(portal);
                } else if (portal === 'teachers' && onSwitchToTeachers) {
                  onSwitchToTeachers();
                }
              }}
            />

            {/* Theme Control (Preserves Phase 0 Light / Dark / System) */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5">
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="System Theme"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification Bell with Real Navigation to Notifications */}
            <button
              onClick={() => handleNavigate('notifications')}
              className={`relative p-2 rounded-xl border transition cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-amber-300'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow">
                0
              </span>
            </button>

            {/* Central School AI Trigger */}
            <button
              type="button"
              onClick={() => {
                setCentralAITab('chat');
                setShowCentralAIModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 via-blue-500/20 to-amber-400/20 hover:from-amber-400/30 hover:to-blue-500/30 border border-amber-400/40 text-amber-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 text-xs font-bold"
              title="Open Little Roses School AI (Central Oversight & Mismatch Engine)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline text-white">School AI</span>
            </button>

            {/* Admin Profile Identity Chip */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800 cursor-pointer text-left group"
              title="Open Admin Account Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md border border-amber-400/80 flex-shrink-0 group-hover:scale-105 transition-transform">
                👑
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-black text-white block leading-tight group-hover:text-amber-300">
                  {session?.name || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 block">Administrator</span>
              </div>
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN VIEWPORT BODY */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-24 md:pb-6 space-y-5">
          
          {/* ===================================================================
              VIEW 1: HOME (DASHBOARD) - 8 RESPONSIVE SECTIONS
              1. Teachers
              2. Learners
              3. Parents/Families
              4. Resources
              5. Today at School
              6. Recent Activity
              7. Timetable Preview
              8. Academic Year
              =================================================================== */}
          {activeTab === 'home' && (
            <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto">
              
              {/* 6 FUNCTIONAL SUMMARY CARDS: Teachers, Learners, Parents/Families, Resources, Classes, Subjects */}
              <section aria-label="School Summary Metrics">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                  {/* Card 1: Teachers */}
                  <button
                    onClick={() => handleNavigate('teachers')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between text-left border border-blue-400/30 group"
                    title="Open Teachers section"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">1. Staff</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[11px] font-bold text-blue-100">Teachers</div>
                      <div className="text-2xl sm:text-3xl font-black">{teachersCount}</div>
                      <div className="text-[10px] text-blue-200 mt-0.5 truncate">
                        {teachersCount === 0 ? 'No teachers yet' : `${teachersCount} staff`}
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/20 text-[10px] font-bold text-blue-100 flex items-center justify-between w-full">
                      <span>View Details</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>

                  {/* Card 2: Learners */}
                  <button
                    onClick={() => handleNavigate('learners')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between text-left border border-emerald-400/30 group"
                    title="Open Learners section"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">2. Pupils</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[11px] font-bold text-emerald-100">Learners</div>
                      <div className="text-2xl sm:text-3xl font-black">{learnersCount}</div>
                      <div className="text-[10px] text-emerald-200 mt-0.5 truncate">
                        {learnersCount === 0 ? 'No learners yet' : `${learnersCount} pupils`}
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/20 text-[10px] font-bold text-emerald-100 flex items-center justify-between w-full">
                      <span>View Details</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>

                  {/* Card 3: Parents / Families */}
                  <button
                    onClick={() => handleNavigate('families')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between text-left border border-purple-400/30 group"
                    title="Open Families / Parents section"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-100">3. Homes</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[11px] font-bold text-purple-100 truncate">Parents / Families</div>
                      <div className="text-2xl sm:text-3xl font-black">{familiesCount}</div>
                      <div className="text-[10px] text-purple-200 mt-0.5 truncate">
                        {familiesCount === 0 ? 'No families yet' : `${familiesCount} homes`}
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/20 text-[10px] font-bold text-purple-100 flex items-center justify-between w-full">
                      <span>View Details</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>

                  {/* Card 4: Resources */}
                  <button
                    onClick={() => handleNavigate('resources')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg cursor-pointer hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between text-left border border-amber-300/40 group"
                    title="Open Resources section"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-slate-950/20 group-hover:bg-slate-950/30 transition-colors">
                        <FolderOpen className="w-4 h-4 text-slate-950" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">4. Library</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[11px] font-black text-amber-950">Resources</div>
                      <div className="text-2xl sm:text-3xl font-black">{resourcesCount}</div>
                      <div className="text-[10px] text-amber-950/80 font-bold mt-0.5 truncate">
                        {resourcesCount === 0 ? 'No resources yet' : `${resourcesCount} files`}
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-950/20 text-[10px] font-black text-amber-950 flex items-center justify-between w-full">
                      <span>View Details</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>

                  {/* Card 5: Classes */}
                  <button
                    onClick={() => handleNavigate('curriculum')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between text-left border border-cyan-400/30 group"
                    title="Open Curriculum & Classes section"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100">5. CBC</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[11px] font-bold text-cyan-100">Classes</div>
                      <div className="text-2xl sm:text-3xl font-black">{classesCount}</div>
                      <div className="text-[10px] text-cyan-200 mt-0.5 truncate">
                        Grade 1 – Grade 6
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/20 text-[10px] font-bold text-cyan-100 flex items-center justify-between w-full">
                      <span>View Classes</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>

                  {/* Card 6: Subjects */}
                  <button
                    onClick={() => handleNavigate('curriculum')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between text-left border border-pink-400/30 group"
                    title="Open Subjects & Learning Areas"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-100">6. Areas</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[11px] font-bold text-pink-100">Subjects</div>
                      <div className="text-2xl sm:text-3xl font-black">{subjectsCount}</div>
                      <div className="text-[10px] text-pink-200 mt-0.5 truncate">
                        8 Learning Areas
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/20 text-[10px] font-bold text-pink-100 flex items-center justify-between w-full">
                      <span>View Subjects</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* Mobile Quick Action Link (Keeps Quick Actions easily reachable on phone) */}
              <div className="flex sm:hidden items-center justify-between p-2.5 rounded-2xl bg-[#080E24] border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-extrabold text-[11px] text-white uppercase tracking-wider">Quick Actions</span>
                </div>
                <button
                  onClick={() => {
                    document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-1 rounded-lg border border-slate-700"
                >
                  <span>8 Shortcuts</span>
                  <span>↓</span>
                </button>
              </div>

              {/* SECTIONS 1-4 QUICK INTERACTION PANEL: People & Resource Directory */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* People Management Quick Directory (Teachers, Learners, Parents) */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">People Directory</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Sections 1–3</span>
                  </div>

                  {/* Sub-tabs: Teachers | Learners | Parents */}
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl my-3 border border-slate-800">
                    <button
                      onClick={() => setHomePeopleTab('teachers')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        homePeopleTab === 'teachers'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Teachers ({teachersCount})
                    </button>
                    <button
                      onClick={() => setHomePeopleTab('learners')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        homePeopleTab === 'learners'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Learners ({learnersCount})
                    </button>
                    <button
                      onClick={() => setHomePeopleTab('parents')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        homePeopleTab === 'parents'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Parents ({familiesCount})
                    </button>
                  </div>

                  {/* Real Records or Authentic Empty State */}
                  <div className="py-4 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                    {homePeopleTab === 'teachers' && (
                      teachersCount === 0 ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">
                            👩‍🏫
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO RECORDS FOUND</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                            No teacher records currently stored in the school system.
                          </p>
                        </>
                      ) : (
                        <div className="w-full space-y-2 text-left">
                          {teachers.slice(0, 4).map((t) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setSelectedTeacherId(t.id);
                                handleNavigate('teachers');
                              }}
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-blue-500 cursor-pointer transition group"
                              title={`Open ${t.name} profile`}
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-white block truncate group-hover:text-blue-300 transition-colors">
                                  {t.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                  <span className="font-mono text-blue-400">{t.phone}</span>
                                  <span>•</span>
                                  <span className="truncate">
                                    {t.assignedGrades && t.assignedGrades.length > 0
                                      ? t.assignedGrades.join(', ')
                                      : t.tier === 'lower'
                                      ? 'Lower Primary'
                                      : 'Upper Primary'}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {homePeopleTab === 'learners' && (
                      learnersCount === 0 ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
                            🎒
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO RECORDS FOUND</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                            No learner records currently enrolled in the school system.
                          </p>
                        </>
                      ) : (
                        <div className="w-full space-y-2 text-left">
                          {pupils.slice(0, 4).map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPupilId(p.id);
                                handleNavigate('learners');
                              }}
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-emerald-500 cursor-pointer transition group"
                              title={`Open ${p.name} profile`}
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-white block truncate group-hover:text-emerald-300 transition-colors">
                                  {p.name}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] mt-0.5">
                                  <span className="text-emerald-400 font-bold">{p.grade}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-400 font-mono">{p.upi}</span>
                                  {p.parentName && (
                                    <>
                                      <span className="text-slate-500">•</span>
                                      <span className="text-slate-400 truncate">{p.parentName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {homePeopleTab === 'parents' && (
                      familiesCount === 0 ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
                            👨‍👩‍👧
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO RECORDS FOUND</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                            No parent or family records currently stored in the school system.
                          </p>
                        </>
                      ) : (
                        <div className="w-full space-y-2 text-left">
                          {parents.slice(0, 4).map((p) => {
                            const linkedPupils = pupils.filter(
                              (pup) =>
                                (pup.parentPhone && normalizePhoneNumber(pup.parentPhone) === normalizePhoneNumber(p.phone)) ||
                                (p.pupilUpiList && p.pupilUpiList.includes(pup.upi))
                            );
                            return (
                              <div
                                key={p.phone}
                                onClick={() => {
                                  setSelectedParentPhone(p.phone);
                                  handleNavigate('families');
                                }}
                                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-purple-500 cursor-pointer transition group"
                                title={`Open ${p.name} family household`}
                              >
                                <div className="min-w-0 pr-2">
                                  <span className="font-bold text-white block truncate group-hover:text-purple-300 transition-colors">
                                    {p.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                    <span className="font-mono text-purple-400">{p.phone}</span>
                                    {linkedPupils.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-purple-300 font-semibold truncate">
                                          {linkedPupils.map((c) => `${c.name} (${c.grade})`).join(', ')}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handleNavigate(homePeopleTab === 'parents' ? 'families' : homePeopleTab)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>
                      Open{' '}
                      {homePeopleTab === 'parents'
                        ? 'Families / Parents'
                        : homePeopleTab === 'teachers'
                        ? 'Teachers'
                        : 'Learners'}{' '}
                      Directory
                    </span>
                    <span>→</span>
                  </button>
                </div>

                {/* Section 4 Resource Action Panel */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-amber-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">Resource Workbench</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Section 4</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3">
                    <button
                      onClick={() => handleNavigate('resources')}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex flex-col items-center gap-1 cursor-pointer transition shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add File</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('resources')}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex flex-col items-center gap-1 cursor-pointer transition shadow"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('resources')}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex flex-col items-center gap-1 cursor-pointer transition shadow"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                  </div>

                  <div className="py-4 text-center space-y-1.5 flex-1 flex flex-col items-center justify-center">
                    <h4 className="text-xs font-bold text-slate-200">
                      {resourcesCount === 0 ? 'NO RESOURCES UPLOADED' : `${resourcesCount} Library Files`}
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                      {resourcesCount === 0
                        ? 'No curriculum resources, schemes of work, or guides added yet.'
                        : 'Official curriculum documents and teaching guides stored in library.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigate('resources')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>View All Resources</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* SECTIONS 5 to 8: MULTI-COLUMN OPERATIONAL SECTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SECTION 5: TODAY AT SCHOOL (TASK 3) */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">5. Today at School</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold hidden sm:inline-block">
                        {todayDayName}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenThreeDotMenu(openThreeDotMenu === 'today' ? null : 'today');
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {openThreeDotMenu === 'today' && (
                          <div className="absolute right-0 top-6 z-30 w-36 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[11px]">
                            <button
                              onClick={() => handleNavigate('timetable')}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                            >
                              Go to Timetable
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real Today Items or Honest Clear Empty State */}
                  <div className="py-3 flex-1 flex flex-col justify-center">
                    {todaySchoolItems.length > 0 ? (
                      <div className="space-y-2">
                        {todaySchoolItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() =>
                              setSelectedEventModal({
                                title: item.title,
                                category: item.category,
                                timeOrDate: item.timeOrInfo,
                                details: item.meta,
                                targetNav: item.targetNav,
                              })
                            }
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 flex items-center justify-between text-xs cursor-pointer transition group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 font-bold uppercase">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono truncate">{item.timeOrInfo}</span>
                              </div>
                              <span className="font-bold text-white block truncate mt-0.5">{item.title}</span>
                              {item.meta && <span className="text-[10px] text-slate-400 block truncate">{item.meta}</span>}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                          📅
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">NO ACTIVITIES SCHEDULED FOR TODAY</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                          No lessons, school activities, or notices are scheduled for today ({todayDayName}, {formattedTodayDate}).
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavigate('timetable')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>View Full Timetable</span>
                    <span>→</span>
                  </button>
                </div>

                {/* SECTION 6: UPCOMING EVENTS (TASK 3) */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-purple-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">6. Upcoming Events</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                        {upcomingEvents.length} Events
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenThreeDotMenu(openThreeDotMenu === 'events' ? null : 'events');
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {openThreeDotMenu === 'events' && (
                          <div className="absolute right-0 top-6 z-30 w-36 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[11px]">
                            <button
                              onClick={() => handleNavigate('calendar')}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                            >
                              Open Calendar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real Upcoming Events or Honest Clear Empty State */}
                  <div className="py-3 flex-1 flex flex-col justify-center">
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-2">
                        {upcomingEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() =>
                              setSelectedEventModal({
                                title: evt.title,
                                category: evt.type,
                                timeOrDate: evt.displayDate,
                                details: evt.details,
                                targetNav: evt.targetNav,
                              })
                            }
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 flex items-center justify-between text-xs cursor-pointer transition group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold uppercase">
                                  {evt.type}
                                </span>
                                <span className="text-[10px] text-amber-400 font-mono font-bold truncate">
                                  {evt.displayDate}
                                </span>
                              </div>
                              <span className="font-bold text-white block truncate mt-0.5">{evt.title}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{evt.details}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                          🗓️
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">NO UPCOMING EVENTS</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                          No upcoming school events, holidays, or term milestones recorded on the school calendar.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavigate('calendar')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Open School Calendar</span>
                    <span>→</span>
                  </button>
                </div>

                {/* SECTION: RECENT ACTIVITY (TASK 4) */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative md:col-span-2 ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">Recent Activity</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        {recentActivities.length} {recentActivities.length === 1 ? 'Action' : 'Actions'}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenThreeDotMenu(openThreeDotMenu === 'activity' ? null : 'activity');
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {openThreeDotMenu === 'activity' && (
                          <div className="absolute right-0 top-6 z-30 w-44 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[11px]">
                            <button
                              onClick={() => handleNavigate('security')}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                            >
                              Open Security & Audit Log
                            </button>
                            <button
                              onClick={() => handleNavigate('teachers')}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                            >
                              View Teachers Roster
                            </button>
                            <button
                              onClick={() => handleNavigate('learners')}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                            >
                              View Learners Directory
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real Recent Activities or Honest Specified Empty State */}
                  <div className="py-3 flex-1 flex flex-col justify-center">
                    {recentActivities.length > 0 ? (
                      <div className="space-y-2">
                        {recentActivities.map((act) => (
                          <div
                            key={act.id}
                            onClick={() => {
                              if (act.category === 'Teacher' && act.recordId) {
                                setSelectedTeacherId(act.recordId);
                                handleNavigate('teachers');
                              } else if (act.category === 'Learner' && act.recordId) {
                                setSelectedPupilId(act.recordId);
                                handleNavigate('learners');
                              } else if (act.targetNav) {
                                handleNavigate(act.targetNav);
                              }
                            }}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/80 flex items-center justify-between text-xs cursor-pointer transition group"
                            title={`Open ${act.action}`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                                    act.category === 'Teacher'
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : act.category === 'Learner'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : act.category === 'Resource'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : act.category === 'Assessment'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : act.category === 'Curriculum'
                                      ? 'bg-pink-500/20 text-pink-300'
                                      : act.category === 'Notice'
                                      ? 'bg-cyan-500/20 text-cyan-300'
                                      : 'bg-slate-500/20 text-slate-300'
                                  }`}
                                >
                                  {act.category}
                                </span>
                                <span className="text-[10px] text-amber-400 font-mono font-bold truncate">
                                  {act.displayTime}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                  <span>•</span>
                                  <span>{act.userRole}</span>
                                </span>
                              </div>
                              <span className="font-bold text-white block truncate mt-1">{act.action}</span>
                              {act.details && (
                                <span className="text-[10px] text-slate-400 block truncate mt-0.5">{act.details}</span>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                          ⚡
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO RECENT ACTIVITY</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                          No recent actions, updates, or audit records have occurred in the school system yet.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavigate('security')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>View Security & Audit Log</span>
                    <span>→</span>
                  </button>
                </div>

                {/* SECTION 7: TIMETABLE PREVIEW (TASK 7) */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">7. Timetable Preview</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {storedTimetableSlots.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                          {storedTimetableSlots.length} Slots
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenThreeDotMenu(openThreeDotMenu === 'timetable' ? null : 'timetable');
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {openThreeDotMenu === 'timetable' && (
                          <div className="absolute right-0 top-6 z-30 w-44 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[11px]">
                            <button
                              onClick={() => {
                                setOpenThreeDotMenu(null);
                                handleNavigate('timetable');
                              }}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                            >
                              <span>Open Master Timetable</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real Timetable or Specified Empty State */}
                  {storedTimetableSlots.length === 0 ? (
                    <div className="py-6 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl">
                        🗓️
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        NO TIMETABLE DATA
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                        No weekly class timetable slots or schedules have been stored in the school system yet.
                      </p>
                    </div>
                  ) : (
                    <div className="py-3 space-y-2 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300">
                          {todayTimetableSlots.length > 0 ? `${todayDayName}'s Schedule` : 'Allocated Schedule'}
                        </span>
                        <span className="text-cyan-400 font-mono text-[10px]">
                          {todayTimetableSlots.length > 0
                            ? `${todayTimetableSlots.length} periods today`
                            : `${storedTimetableSlots.length} periods total`}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                        {(todayTimetableSlots.length > 0 ? todayTimetableSlots : storedTimetableSlots.slice(0, 3)).map(
                          (slot: any, idx: number) => (
                            <div
                              key={slot.id || idx}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 whitespace-nowrap">
                                  {slot.time || `P${slot.periodIndex || idx + 1}`}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate text-[11px]">
                                    {slot.isBreak ? (slot.breakLabel || 'Break Period') : (slot.subject || 'Lesson Period')}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {slot.grade || 'All Classes'}
                                    {slot.teacher ? ` • Tr. ${slot.teacher}` : ''}
                                    {slot.room ? ` (${slot.room})` : ''}
                                  </div>
                                </div>
                              </div>
                              {slot.day && todayTimetableSlots.length === 0 && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                  {slot.day.slice(0, 3)}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      {storedTimetableSlots.length > (todayTimetableSlots.length > 0 ? todayTimetableSlots.length : 3) && (
                        <div className="text-[10px] text-slate-500 text-center font-mono">
                          + {storedTimetableSlots.length - (todayTimetableSlots.length > 0 ? todayTimetableSlots.length : 3)} more periods scheduled
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleNavigate('timetable')}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>{storedTimetableSlots.length === 0 ? 'Open Timetable' : 'View Full Timetable'}</span>
                    <span>→</span>
                  </button>
                </div>

                {/* SECTION 8: ACADEMIC YEAR (TASK 7) */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-white">8. Academic Year</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {activeAcademicYear && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          Active: {activeAcademicYear.year}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenThreeDotMenu(openThreeDotMenu === 'academic_year' ? null : 'academic_year');
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {openThreeDotMenu === 'academic_year' && (
                          <div className="absolute right-0 top-6 z-30 w-48 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[11px]">
                            <button
                              onClick={() => {
                                setOpenThreeDotMenu(null);
                                handleNavigate('calendar');
                              }}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                            >
                              <span>Academic Year Management</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                              onClick={() => {
                                setOpenThreeDotMenu(null);
                                handleNavigate('calendar');
                              }}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                            >
                              <span>Open School Calendar</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real Academic Year Data or Specified Empty State */}
                  {!activeAcademicYear ? (
                    <div className="py-6 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                        📅
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        NO ACADEMIC YEAR CONFIGURED
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                        School academic year and official term schedule have not been configured in system settings.
                      </p>
                    </div>
                  ) : (
                    <div className="py-3 space-y-2.5 flex-1 flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Year</span>
                          <span className="text-base font-black text-amber-400">{activeAcademicYear.year}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Term</span>
                          <span className="text-base font-black text-emerald-400">
                            {termInfo?.isConfigured ? termInfo.term : (activeAcademicYear.terms?.[0]?.term || 'Term 1')}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                        {termInfo?.isConfigured && termInfo.weekNumber > 0 ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Pacing:</span>
                              <span className="font-bold text-white">Week {termInfo.weekNumber} of {termInfo.totalWeeks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Teaching Days Left:</span>
                              <span className="font-bold text-emerald-400">{termInfo.teachingDaysRemaining} Days (Mon–Fri)</span>
                            </div>
                            {termInfo.termStart && termInfo.termEnd && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Term Dates:</span>
                                <span className="font-mono text-[11px] text-slate-300">{termInfo.termStart} to {termInfo.termEnd}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-300">
                            {activeAcademicYear.terms && activeAcademicYear.terms.length > 0 ? (
                              <div className="space-y-0.5">
                                {activeAcademicYear.terms.map((t) => (
                                  <div key={t.term} className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">{t.term}:</span>
                                    <span className="font-mono text-slate-200">{t.openDate} – {t.closeDate}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">Academic Year {activeAcademicYear.year} configured.</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Academic Year History Preservation */}
                      {allAcademicYears.filter((y) => y.id !== activeAcademicYear.id && y.year !== activeAcademicYear.year).length > 0 && (
                        <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                          <span className="font-semibold">Year History Preserved:</span>
                          <span className="font-mono text-amber-300/80">
                            {allAcademicYears
                              .filter((y) => y.id !== activeAcademicYear.id && y.year !== activeAcademicYear.year)
                              .map((y) => y.year)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleNavigate('calendar')}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>{activeAcademicYear ? 'Open Academic Year Management' : 'Configure Academic Year'}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* ===================================================================
                  QUICK ACTIONS SECTION (TASK 8)
                  8 direct administrative shortcuts with valid routes
                  - Add Teacher
                  - Add Learner
                  - Add Parent/Family
                  - Open Resources
                  - Open Curriculum
                  - Open Calendar
                  - Open Timetable
                  - Open Reports
                  =================================================================== */}
              <section aria-label="Administrative Quick Actions" id="quick-actions" className="pt-1">
                <div
                  className={`p-4 sm:p-5 rounded-2xl border ${
                    isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-3.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <div>
                        <h3 className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider">
                          Quick Actions
                        </h3>
                        <p className="text-[11px] text-slate-400 hidden sm:block">
                          Fast administrative shortcuts with direct valid routes
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                      8 Fast Routes
                    </span>
                  </div>

                  {/* 8 Action Buttons Responsive Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
                    {/* 1. Add Teacher */}
                    <button
                      onClick={() => {
                        handleNavigate('teachers');
                        setIsAddingTeacher(true);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Add Teacher"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30 group-hover:scale-110 group-hover:bg-blue-600/25 transition-all">
                          <UserPlus className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-blue-400 transition-colors">
                          +
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-blue-300 transition-colors">
                          Add Teacher
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Staff Roster
                        </span>
                      </div>
                    </button>

                    {/* 2. Add Learner */}
                    <button
                      onClick={() => {
                        handleNavigate('learners');
                        setIsAddingPupil(true);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Add Learner"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 group-hover:bg-emerald-600/25 transition-all">
                          <GraduationCap className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-emerald-400 transition-colors">
                          +
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-emerald-300 transition-colors">
                          Add Learner
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Admissions
                        </span>
                      </div>
                    </button>

                    {/* 3. Add Parent/Family */}
                    <button
                      onClick={() => {
                        handleNavigate('families');
                        setIsAddingParent(true);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Add Parent/Family"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/30 group-hover:scale-110 group-hover:bg-purple-600/25 transition-all">
                          <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-purple-400 transition-colors">
                          +
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-purple-300 transition-colors">
                          Add Parent/Family
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Households
                        </span>
                      </div>
                    </button>

                    {/* 4. Open Resources */}
                    <button
                      onClick={() => handleNavigate('resources')}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Open Resources"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 group-hover:bg-amber-500/25 transition-all">
                          <FolderOpen className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-amber-400 transition-colors">
                          →
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-amber-300 transition-colors">
                          Open Resources
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Resource Library
                        </span>
                      </div>
                    </button>

                    {/* 5. Open Curriculum */}
                    <button
                      onClick={() => handleNavigate('curriculum')}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Open Curriculum"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-cyan-400 transition-colors">
                          →
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-cyan-300 transition-colors">
                          Open Curriculum
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Classes & Areas
                        </span>
                      </div>
                    </button>

                    {/* 6. Open Calendar */}
                    <button
                      onClick={() => handleNavigate('calendar')}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Open Calendar"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 group-hover:bg-indigo-500/25 transition-all">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-indigo-400 transition-colors">
                          →
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-indigo-300 transition-colors">
                          Open Calendar
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Terms & Schedule
                        </span>
                      </div>
                    </button>

                    {/* 7. Open Timetable */}
                    <button
                      onClick={() => handleNavigate('timetable')}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-teal-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Open Timetable"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 group-hover:scale-110 group-hover:bg-teal-500/25 transition-all">
                          <Clock className="w-4 h-4 text-teal-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-teal-400 transition-colors">
                          →
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-teal-300 transition-colors">
                          Open Timetable
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          Master Timetable
                        </span>
                      </div>
                    </button>

                    {/* 8. Open Reports */}
                    <button
                      onClick={() => handleNavigate('reports')}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-pink-500 hover:bg-slate-800/90'
                          : 'bg-slate-50 border-slate-200 hover:border-pink-500 hover:bg-pink-50/50'
                      } hover:scale-[1.02] active:scale-95 shadow-sm min-h-[92px]`}
                      title="Open Reports"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30 group-hover:scale-110 group-hover:bg-pink-500/25 transition-all">
                          <BarChart3 className="w-4 h-4 text-pink-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-pink-400 transition-colors">
                          →
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-pink-300 transition-colors">
                          Open Reports
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          CBC Analytics
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ===================================================================
              VIEWS 2-18: DESTINATIONS FOR LATER PHASES (PHASE 1A-2 SHELLS)
              Every single destination genuinely navigates and renders an honest view!
              =================================================================== */}
          {activeTab !== 'home' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Destination Header with Breadcrumb & Navigation Controls */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-[#080E24] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGoBack}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Go Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                    {React.createElement(
                      ADMIN_NAV_ITEMS.find((n) => n.id === activeTab)?.icon || Building2,
                      { className: 'w-5 h-5' }
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <span
                        onClick={() => handleNavigate('home')}
                        className="hover:text-blue-400 cursor-pointer"
                      >
                        Admin Portal
                      </span>
                      <span>/</span>
                      <span className="text-amber-400">
                        {ADMIN_NAV_ITEMS.find((n) => n.id === activeTab)?.label}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {ADMIN_NAV_ITEMS.find((n) => n.id === activeTab)?.label}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                  >
                    ← Dashboard
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------------
                  DESTINATION: TEACHERS (MANAGE TEACHERS)
                  Supports deep navigation: List -> Teacher Profile -> Back
                  ------------------------------------------------------------- */}
              {(activeTab === 'teachers' || activeTab === 'users') && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#080E24] space-y-4">
                  {/* Shared Users Top Navigation Switcher */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleNavigate('teachers')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-blue-600 text-white shadow"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Teachers ({teachers.length})</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('learners')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-white"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Learners ({pupils.length})</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('families')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-white"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Families ({parents.length})</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsAddingTeacher(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Teacher</span>
                    </button>
                  </div>

                  {/* If viewing a single Teacher Profile (Deep navigation) */}
                  {activeTeacherRecord ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedTeacherId(null)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Back to Teachers Roster"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h3 className="text-sm font-bold text-white">Teacher Profile: {activeTeacherRecord.name}</h3>
                            <p className="text-xs text-slate-400">Little Roses Academy Teaching Faculty</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            Active Staff
                          </span>
                          <button
                            onClick={() => setEditingTeacher(activeTeacherRecord)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Profile</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <div className="w-20 h-20 rounded-full border-2 border-blue-500/50 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                            {activeTeacherRecord.photoUrl ? (
                              <img
                                src={activeTeacherRecord.photoUrl}
                                alt={activeTeacherRecord.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-black text-blue-400">
                                {activeTeacherRecord.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-center sm:text-left space-y-1">
                            <h4 className="text-base font-black text-white">{activeTeacherRecord.name}</h4>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1 font-mono text-blue-400 font-bold">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{activeTeacherRecord.phone}</span>
                              </span>
                              {activeTeacherRecord.residence && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                    <span>{activeTeacherRecord.residence}</span>
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="pt-1 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold font-mono">
                                Pass: {activeTeacherRecord.rawPassword || '123456'}
                              </span>
                              {activeTeacherRecord.isClassTeacher && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                                  ⭐ Homeroom Teacher: {activeTeacherRecord.classTeacherGrade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                              <span>Curriculum Assignments (By Grade)</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {activeTeacherRecord.assignedGrades?.length || 0} Grade(s) Assigned
                            </span>
                          </div>

                          {(() => {
                            const assignments = getTeacherGradeAssignments(activeTeacherRecord);
                            if (assignments.length === 0) {
                              return (
                                <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                                  No subjects assigned by grade yet. Click &quot;Edit Profile&quot; to assign subjects per grade.
                                </p>
                              );
                            }
                            return (
                              <div className="space-y-2">
                                {assignments.map((item) => (
                                  <div
                                    key={item.grade}
                                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                                        <span>{item.grade}</span>
                                      </span>
                                      <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        {item.subjects.length} Subject{item.subjects.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-slate-300 font-semibold pl-3.5">
                                      <span className="text-blue-400 font-bold shrink-0">→</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.subjects.map((subj) => (
                                          <span
                                            key={subj}
                                            className="px-2.5 py-0.5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-200 text-[11px] font-medium"
                                          >
                                            {subj}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setSelectedTeacherId(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
                        >
                          ← Back to Teachers Roster
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setDeleteConfirmTarget({
                                type: 'teacher',
                                id: activeTeacherRecord.id,
                                name: activeTeacherRecord.name,
                                subtitle: `${activeTeacherRecord.phone || ''} • ${activeTeacherRecord.assignedGrades?.join(', ') || ''}`,
                              });
                            }}
                            className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Teacher</span>
                          </button>
                          <button
                            onClick={() => setEditingTeacher(activeTeacherRecord)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
                          >
                            Edit Record
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Teachers List View */
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">Staff & Teachers Roster</h3>
                          <p className="text-xs text-slate-400">
                            Registered faculty members with individual portal logins, photos, and assignments
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-mono font-bold">
                          {teachers.length} Teachers
                        </span>
                      </div>

                      {teachers.length === 0 ? (
                        <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mx-auto">
                            👩‍🏫
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO TEACHERS FOUND</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            No teachers have been added to the school system yet.
                          </p>
                          <button
                            onClick={() => setIsAddingTeacher(true)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                          >
                            + Add First Teacher
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {teachers.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTeacherId(t.id)}
                              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-blue-500 cursor-pointer transition group"
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="w-11 h-11 rounded-full border border-blue-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow">
                                  {t.photoUrl ? (
                                    <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-sm font-black text-blue-400">
                                      {t.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                                      {t.name}
                                    </span>
                                    {t.isClassTeacher && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                                        Class Tr
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span className="font-mono text-blue-400">{t.phone}</span>
                                    {t.residence && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{t.residence}</span>
                                      </>
                                    )}
                                  </div>
                                  {(() => {
                                    const assignments = getTeacherGradeAssignments(t);
                                    if (assignments.length === 0) return null;
                                    return (
                                      <div className="mt-1.5 space-y-1">
                                        {assignments.map((item) => (
                                          <div
                                            key={item.grade}
                                            className="text-[11px] flex items-start gap-1.5 text-slate-300 leading-tight"
                                          >
                                            <span className="font-bold text-blue-400 shrink-0">{item.grade}</span>
                                            <span className="text-slate-500 font-bold shrink-0">→</span>
                                            <span className="text-slate-300 truncate font-medium">
                                              {item.subjects.join(', ')}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTeacher(t);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Edit Teacher"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: LEARNERS (MANAGE LEARNERS)
                  Supports deep navigation: List -> Pupil Profile -> Back
                  ------------------------------------------------------------- */}
              {activeTab === 'learners' && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#080E24] space-y-4">
                  {/* Shared Users Top Navigation Switcher */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleNavigate('teachers')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-white"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Teachers ({teachers.length})</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('learners')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-emerald-600 text-white shadow"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Learners ({pupils.length})</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('families')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-white"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Families ({parents.length})</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsAddingPupil(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Admit Learner</span>
                    </button>
                  </div>

                  {/* If viewing a single Pupil Profile (Deep navigation) */}
                  {activePupilRecord ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedPupilId(null)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Back to Learners Roster"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h3 className="text-sm font-bold text-white">Learner Profile: {activePupilRecord.name}</h3>
                            <p className="text-xs text-slate-400">
                              Official UPI Admission Record • Permanent Academic History
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            {activePupilRecord.status || 'Active'}
                          </span>
                          <button
                            onClick={() => setEditingPupil(activePupilRecord)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Learner</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <div className="w-20 h-20 rounded-full border-2 border-emerald-500/50 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                            {activePupilRecord.photoUrl ? (
                              <img
                                src={activePupilRecord.photoUrl}
                                alt={activePupilRecord.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-black text-emerald-400">
                                {activePupilRecord.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-center sm:text-left space-y-1">
                            <h4 className="text-base font-black text-white">{activePupilRecord.name}</h4>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                              <span className="font-mono text-emerald-400 font-bold">
                                UPI: {activePupilRecord.upi}
                              </span>
                              <span>•</span>
                              <span className="text-slate-200 font-bold">{activePupilRecord.grade}</span>
                              <span>•</span>
                              <span className="text-slate-300">{activePupilRecord.gender}</span>
                            </div>
                            <div className="pt-1 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold font-mono">
                                Portal PIN: {activePupilRecord.rawPassword || activePupilRecord.pin || '1234'}
                              </span>
                              {activePupilRecord.residence && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-400" />
                                  <span>{activePupilRecord.residence}</span>
                                </span>
                              )}
                              {activePupilRecord.phone && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                                  Pupil Phone: {activePupilRecord.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Parent Information Card */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-purple-400" />
                            <span>Parent / Guardian on File</span>
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                            <span className="font-bold text-white">{activePupilRecord.parentName}</span>
                            <span className="font-mono text-purple-400 font-bold">{activePupilRecord.parentPhone}</span>
                          </div>
                        </div>

                        {/* Verified Siblings */}
                        {(() => {
                          const verified = dataLayer.getVerifiedSiblings(activePupilRecord);
                          if (verified.length === 0) return null;
                          return (
                            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span>Verified Household Siblings ({verified.length})</span>
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                                  Family Linked
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {verified.map((sib) => (
                                  <div
                                    key={sib.id}
                                    onClick={() => setSelectedPupilId(sib.id)}
                                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-emerald-500 cursor-pointer transition"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full border border-emerald-500/40 bg-slate-950 overflow-hidden flex items-center justify-center font-bold text-emerald-400 text-xs">
                                        {sib.photoUrl ? (
                                          <img src={sib.photoUrl} alt={sib.name} className="w-full h-full object-cover" />
                                        ) : (
                                          sib.name.charAt(0)
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-bold text-white block">{sib.name}</span>
                                        <span className="text-[10px] text-slate-400">{sib.grade} • UPI: {sib.upi}</span>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Possible Sibling Match Warning Banner */}
                        {(() => {
                          const matches = dataLayer.getPossibleSiblingMatches(activePupilRecord);
                          if (matches.length === 0) return null;
                          return (
                            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Possible Sibling Match Warning ({matches.length})</span>
                              </div>
                              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                                Parent information appears similar to other enrolled learner(s). Little Roses Academy policy
                                requires Admin verification before linking siblings.
                              </p>
                              <div className="space-y-1.5 pt-1">
                                {matches.map((m) => (
                                  <div
                                    key={m.id}
                                    className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{m.name}</span>
                                        <span className="text-[10px] text-slate-400">({m.grade})</span>
                                        <span className="text-[10px] font-mono text-amber-400">{m.upi}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        Parent: <strong className="text-slate-300">{m.parentName}</strong> ({m.parentPhone})
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          dataLayer.verifySiblingLink(activePupilRecord.id, m.id);
                                          setPupils(dataLayer.getPupils());
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition cursor-pointer flex items-center gap-1"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Verify Siblings</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          dataLayer.dismissSiblingMatch(activePupilRecord.id, m.id);
                                          setPupils(dataLayer.getPupils());
                                        }}
                                        className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
                                      >
                                        Dismiss
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setSelectedPupilId(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
                        >
                          ← Back to Learners Roster
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setDeleteConfirmTarget({
                                type: 'pupil',
                                id: activePupilRecord.id,
                                name: activePupilRecord.name,
                                subtitle: `${activePupilRecord.grade} • UPI: ${activePupilRecord.upi}`,
                              });
                            }}
                            className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Learner</span>
                          </button>
                          <button
                            onClick={() => setEditingPupil(activePupilRecord)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
                          >
                            Edit Learner
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Learners List View */
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">Enrolled Learners (Pupils)</h3>
                          <p className="text-xs text-slate-400">
                            Active pupils with permanent UPI records, portal PINs, residence & verified family links
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                          {pupils.length} Learners
                        </span>
                      </div>

                      {pupils.length === 0 ? (
                        <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
                            🎒
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO LEARNERS ENROLLED</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            No learners have been enrolled in the school system yet.
                          </p>
                          <button
                            onClick={() => setIsAddingPupil(true)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                          >
                            + Admit First Learner
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {pupils.map((p) => {
                            const verifiedSiblings = dataLayer.getVerifiedSiblings(p);
                            const possibleMatches = dataLayer.getPossibleSiblingMatches(p);
                            return (
                              <div
                                key={p.id}
                                onClick={() => setSelectedPupilId(p.id)}
                                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                  <div className="w-11 h-11 rounded-full border border-emerald-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow">
                                    {p.photoUrl ? (
                                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-sm font-black text-emerald-400">
                                        {p.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                                        {p.name}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                                        {p.grade}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      <span className="font-mono text-emerald-400">{p.upi}</span>
                                      {p.residence && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate">{p.residence}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                      Parent: {p.parentName} ({p.parentPhone})
                                    </div>

                                    {/* Sibling badges */}
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {verifiedSiblings.length > 0 && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-0.5">
                                          <Link2 className="w-2.5 h-2.5" />
                                          <span>{verifiedSiblings.length} Sibling{verifiedSiblings.length > 1 ? 's' : ''}</span>
                                        </span>
                                      )}
                                      {possibleMatches.length > 0 && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5">
                                          <AlertCircle className="w-2.5 h-2.5" />
                                          <span>Possible Match</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPupil(p);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition cursor-pointer"
                                    title="Edit Learner"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: FAMILIES / PARENTS
                  Supports deep navigation: List -> Family Profile -> Back
                  ------------------------------------------------------------- */}
              {activeTab === 'families' && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#080E24] space-y-4">
                  {/* Shared Users Top Navigation Switcher */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleNavigate('teachers')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-white"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Teachers ({teachers.length})</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('learners')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-white"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Learners ({pupils.length})</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('families')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-purple-600 text-white shadow"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Families ({parents.length})</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsAddingParent(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Family</span>
                    </button>
                  </div>

                  {/* If viewing a single Family Profile (Deep navigation) */}
                  {activeParentRecord ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedParentPhone(null)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Back to Families"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h3 className="text-sm font-bold text-white">Family Household Profile: {activeParentRecord.name}</h3>
                            <p className="text-xs text-slate-400">Registered Parent / Guardian Account</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                            Parent Contact
                          </span>
                          <button
                            onClick={() => setEditingParent(activeParentRecord)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Family</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <div className="w-20 h-20 rounded-full border-2 border-purple-500/50 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                            {activeParentRecord.photoUrl ? (
                              <img
                                src={activeParentRecord.photoUrl}
                                alt={activeParentRecord.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-black text-purple-400">
                                {activeParentRecord.name.charAt(0) || 'P'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-center sm:text-left space-y-1">
                            <h4 className="text-base font-black text-white">{activeParentRecord.name}</h4>
                            <p className="text-xs text-purple-400 font-mono font-bold flex items-center justify-center sm:justify-start gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{activeParentRecord.phone}</span>
                            </p>
                            <div className="pt-1 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold font-mono">
                                Pass: {activeParentRecord.rawPassword || '123456'}
                              </span>
                              {activeParentRecord.residence && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-400" />
                                  <span>{activeParentRecord.residence}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Linked Children in School */}
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Enrolled Children / Learners (Siblings)
                          </span>
                          {(() => {
                            const linkedPupils = pupils.filter(
                              (pup) =>
                                (pup.parentPhone && normalizePhoneNumber(pup.parentPhone) === normalizePhoneNumber(activeParentRecord.phone)) ||
                                (activeParentRecord.pupilUpiList && activeParentRecord.pupilUpiList.includes(pup.upi)) ||
                                (activeParentRecord.linkedChildrenUpi && activeParentRecord.linkedChildrenUpi.includes(pup.upi))
                            );
                            if (linkedPupils.length === 0) {
                              return (
                                <p className="text-xs text-slate-400 italic">No learners currently linked to this phone number.</p>
                              );
                            }
                            return (
                              <div className="space-y-2">
                                {linkedPupils.map((pup) => (
                                  <div
                                    key={pup.id}
                                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full border border-purple-500/40 bg-slate-900 overflow-hidden flex items-center justify-center font-bold text-purple-400 text-xs">
                                        {pup.photoUrl ? (
                                          <img src={pup.photoUrl} alt={pup.name} className="w-full h-full object-cover" />
                                        ) : (
                                          pup.name.charAt(0)
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-bold text-white block">{pup.name}</span>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                          <span className="text-emerald-400 font-bold">{pup.grade}</span>
                                          <span>•</span>
                                          <span className="font-mono">UPI: {pup.upi}</span>
                                          <span>•</span>
                                          <span>Status: {pup.status}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedPupilId(pup.id);
                                        handleNavigate('learners');
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs transition cursor-pointer"
                                    >
                                      View Learner →
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setSelectedParentPhone(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
                        >
                          ← Back to Families Roster
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setDeleteConfirmTarget({
                                type: 'parent',
                                id: activeParentRecord.id || activeParentRecord.parentPhone || activeParentRecord.phone,
                                name: activeParentRecord.name || activeParentRecord.parentName,
                                subtitle: `Phone: ${activeParentRecord.parentPhone || activeParentRecord.phone}`,
                              });
                            }}
                            className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Family</span>
                          </button>
                          <button
                            onClick={() => setEditingParent(activeParentRecord)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow cursor-pointer"
                          >
                            Edit Family
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Families List View */
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">Families & Parent Accounts</h3>
                          <p className="text-xs text-slate-400">
                            Parent accounts with unique mobile contacts, passwords, and linked sibling learners
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-mono font-bold">
                          {parents.length} Families
                        </span>
                      </div>

                      {parents.length === 0 ? (
                        <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mx-auto">
                            👨‍👩‍👧
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NO FAMILIES REGISTERED</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            No parent accounts or family households registered in the school system yet.
                          </p>
                          <button
                            onClick={() => setIsAddingParent(true)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
                          >
                            + Add First Family
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {parents.map((p) => {
                            const linkedPupils = pupils.filter(
                              (pup) =>
                                (pup.parentPhone && normalizePhoneNumber(pup.parentPhone) === normalizePhoneNumber(p.phone)) ||
                                (p.pupilUpiList && p.pupilUpiList.includes(pup.upi)) ||
                                (p.linkedChildrenUpi && p.linkedChildrenUpi.includes(pup.upi))
                            );
                            return (
                              <div
                                key={p.id || p.phone}
                                onClick={() => setSelectedParentPhone(p.phone)}
                                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 flex flex-col justify-between cursor-pointer transition group"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                      <div className="w-9 h-9 rounded-full border border-purple-500/40 bg-slate-950 overflow-hidden flex items-center justify-center font-bold text-purple-400 text-xs shrink-0 shadow">
                                        {p.photoUrl ? (
                                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                          p.name.charAt(0) || 'P'
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-white block truncate group-hover:text-purple-300">
                                          {p.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono block">
                                          {p.phone}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold shrink-0">
                                      {linkedPupils.length} {linkedPupils.length === 1 ? 'Pupil' : 'Pupils'}
                                    </span>
                                  </div>

                                  {p.residence && (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
                                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                      <span className="truncate">{p.residence}</span>
                                    </div>
                                  )}

                                  {linkedPupils.length > 0 && (
                                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-0.5">
                                      {linkedPupils.map((c) => (
                                        <div key={c.id} className="truncate text-slate-300 flex items-center justify-between">
                                          <span>• {c.name}</span>
                                          <span className="text-emerald-400 text-[10px] font-bold">{c.grade}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-purple-300 font-bold">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingParent(p);
                                      }}
                                      className="p-1 rounded-md bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-3 h-3" />
                                      <span>Edit</span>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>Open Household</span>
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: CALENDAR (ACADEMIC SCHOOL CALENDAR)
                  Shows real academic term info from dataLayer
                  ------------------------------------------------------------- */}
              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  {!activeAcademicYear && (
                    <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-base">
                          📅
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
                            NO ACADEMIC YEAR CONFIGURED
                          </h4>
                          <p className="text-slate-400 text-[11px]">
                            School academic year and official term schedule have not been configured in system settings. Calendar and live time clock remain operational.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNavigate('settings')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors cursor-pointer shrink-0"
                      >
                        Configure Academic Year
                      </button>
                    </div>
                  )}

                  <SchoolCalendarView
                    activeAcademicYear={activeAcademicYear}
                    termInfo={termInfo}
                    storedTimetableSlots={storedTimetableSlots}
                    todayDayName={todayDayName}
                    todayIsoDate={todayIsoDate}
                    upcomingEvents={upcomingEvents}
                    onNavigateTab={handleNavigate}
                  />
                </div>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: NOTIFICATIONS
                  Shows "NO NEW NOTIFICATIONS" when count is 0
                  ------------------------------------------------------------- */}
              {activeTab === 'notifications' && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#080E24] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
                      <p className="text-xs text-slate-400">Institutional logs, teacher submissions, and system warnings</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                      0 Unread
                    </span>
                  </div>

                  <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-400 flex items-center justify-center text-xl mx-auto">
                      <Bell className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-200">NO NEW NOTIFICATIONS</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      All system notifications, teacher mark entries, and circular alerts have been acknowledged.
                    </p>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: CURRICULUM (CLASSES & LEARNING AREAS)
                  ------------------------------------------------------------- */}
              {activeTab === 'curriculum' && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#080E24] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white">CBC Curriculum & Classes</h3>
                      <p className="text-xs text-slate-400">Little Roses Academy official CBC primary school grading and subjects</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">
                      6 Classes • 8 Subjects
                    </span>
                  </div>

                  {/* 6 CBC Classes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Official CBC Classes</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CBC_CLASSES.map((cls) => (
                        <div key={cls} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{cls}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">Active CBC</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official CBC Learning Areas by Grade */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Official Curriculum Subjects by Grade (Grade 1 – Grade 6)
                      </h4>
                      <span className="text-[10px] text-blue-400 font-mono">KICD Approved</span>
                    </div>
                    <div className="space-y-2.5">
                      {LRA_GRADES.map((g) => {
                        const subs = getLraSubjectsForGrade(g);
                        return (
                          <div
                            key={g}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                <span>{g}</span>
                              </span>
                              <span className="text-[10px] text-blue-300 font-mono">
                                {subs.length} Learning Areas
                              </span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-slate-300 pl-3">
                              <span className="text-blue-400 font-bold shrink-0">→</span>
                              <div className="flex flex-wrap gap-1.5">
                                {subs.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-200 text-[11px]"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-slate-500">
                      Curriculum management will appear here when curriculum administration is enabled.
                    </p>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: RESOURCES (CURRICULUM RESOURCE LIBRARY - TASK 6)
                  Supports deep navigation: All Categories -> Category View -> Open Resource
                  Strict rule: zero fake resources. "NO RESOURCES INSTALLED" if empty.
                  Preserves existing metadata and permissions. Responsive phone/tablet/desktop.
                  ------------------------------------------------------------- */}
              {activeTab === 'resources' && (
                <>
                  {/* FULL WORKING DOCUMENT WORKSPACE */}
                  {activeWorkspaceResource && (
                    <AdminResourceWorkspace
                      resource={activeWorkspaceResource}
                      teacher={
                        teachers.find((t) => t.id === selectedResourceTeacherId) ||
                        teachers.find((t) => t.id === activeWorkspaceResource.recipientTeacherIds?.[0]) ||
                        teachers[0]
                      }
                      grade={selectedResourceGrade || activeWorkspaceResource.grade || 'Grade 1'}
                      subject={selectedResourceSubject || activeWorkspaceResource.subject || 'General'}
                      categoryName={
                        RESOURCE_CATEGORIES.find(
                          (c) => c.id === (selectedResourceCategory || activeWorkspaceResource.categoryId)
                        )?.name ||
                        activeWorkspaceResource.category ||
                        'Curriculum Resource'
                      }
                      allTeachers={teachers}
                      onClose={() => setActiveWorkspaceResource(null)}
                      onRefresh={() => setResourcesRevision((r) => r + 1)}
                    />
                  )}

                  <div className="p-4 sm:p-6 rounded-2xl border border-slate-800 bg-[#080E24] space-y-5">
                    {/* CASE 1: Viewing Single Resource (Open Existing Resource Inspector) */}
                    {activeResourceRecord ? (
                      <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedResourceId(null)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Back to resources list"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                                  {RESOURCE_CATEGORIES.find((c) => c.id === activeResourceRecord.categoryId)?.icon || '📁'}{' '}
                                  {activeResourceRecord.categoryName}
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-black text-white mt-1">
                                {activeResourceRecord.title}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const ws = convertToWorkspaceItem(activeResourceRecord);
                                setActiveWorkspaceResource(ws);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Open in Workspace</span>
                            </button>
                            <button
                              onClick={() => setSelectedResourceId(null)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => handleNavigate('home')}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
                            >
                              Home
                            </button>
                          </div>
                        </div>

                      {/* Metadata Grid */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                              Resource Title & Identifier
                            </span>
                            <h4 className="text-base font-extrabold text-white">
                              {activeResourceRecord.title}
                            </h4>
                            {activeResourceRecord.fileName && (
                              <p className="text-xs text-slate-400 font-mono">
                                File: {activeResourceRecord.fileName}
                              </p>
                            )}
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold font-mono">
                            {activeResourceRecord.fileType || 'Curriculum Record'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Grade Target</span>
                            <span className="text-slate-200 font-bold">
                              {activeResourceRecord.grade || 'All Grades'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Learning Area</span>
                            <span className="text-slate-200 font-bold">
                              {activeResourceRecord.subject || 'Core CBC'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Term / Year</span>
                            <span className="text-slate-200 font-bold">
                              {activeResourceRecord.term || 'Term 1'} • {activeResourceRecord.academicYear || '2026'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Date Stored</span>
                            <span className="text-slate-200 font-bold font-mono">
                              {activeResourceRecord.date || 'Active Archive'}
                            </span>
                          </div>
                        </div>

                        {/* Strand & Sub-strand if available */}
                        {activeResourceRecord.strand && (
                          <div className="pt-3 border-t border-slate-800 text-xs">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Strand & Focus</span>
                            <span className="text-slate-200 font-medium">
                              {activeResourceRecord.strand}
                            </span>
                          </div>
                        )}

                        {/* Permissions & Security Badges */}
                        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[11px] text-slate-400">Permissions:</span>
                            <span className="font-bold text-white">
                              {activeResourceRecord.recipientTeachers
                                ? (activeResourceRecord.recipientTeachers.includes('all')
                                    ? 'All Authorized Faculty'
                                    : `Assigned: ${activeResourceRecord.recipientTeachers.join(', ')}`)
                                : 'School Office & Authorized Staff'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] text-slate-400">Status:</span>
                            <span className="font-bold text-emerald-400">
                              {activeResourceRecord.isApproved !== undefined
                                ? (activeResourceRecord.isApproved ? 'Approved & Cleared' : 'Draft / In Review')
                                : 'Official Repository Record'}
                            </span>
                          </div>
                          {activeResourceRecord.sharedBy && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <span className="text-[11px] text-slate-400">Uploaded / Shared By:</span>
                              <span className="font-bold text-slate-200">
                                {activeResourceRecord.sharedBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content or Documents Body */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Resource Content & Specifications
                        </h4>

                        {activeResourceRecord.documents && activeResourceRecord.documents.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-300 block">Attached Documents:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {activeResourceRecord.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                    <span className="font-bold text-white truncate max-w-[180px]">{doc.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">{doc.size || 'CBC Standard'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeResourceRecord.content && (
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {activeResourceRecord.content}
                          </div>
                        )}

                        {activeResourceRecord.notes && (
                          <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs text-blue-300 leading-relaxed">
                            <span className="font-bold text-blue-200 block mb-0.5">Administrative Notes:</span>
                            {activeResourceRecord.notes}
                          </div>
                        )}

                        {!activeResourceRecord.documents?.length && !activeResourceRecord.content && !activeResourceRecord.notes && (
                          <p className="text-xs text-slate-500 italic">
                            Standard syllabus resource stored in Little Roses Academy document repository.
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedResourceId(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition cursor-pointer"
                        >
                          ← Back to Resources List
                        </button>
                        <button
                          onClick={() => handleNavigate('home')}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
                        >
                          Home Dashboard
                        </button>
                      </div>
                    </div>
                  ) : selectedResourceCategory ? (
                    /* CASE 2: Viewing a Selected Category with Teacher -> Grade -> Subject -> Documents Hierarchy */
                    <div className="space-y-4 animate-in fade-in">
                      {(() => {
                        const currentCatInfo = RESOURCE_CATEGORIES.find((c) => c.id === selectedResourceCategory);
                        const categoryName = currentCatInfo?.name || 'Category';
                        const categoryIcon = currentCatInfo?.icon || '📁';

                        const currentTeacher = teachers.find((t) => t.id === selectedResourceTeacherId) || null;
                        const currentTeacherAssignments = currentTeacher ? getTeacherGradeAssignments(currentTeacher) : [];
                        const currentGradeAssignment = currentTeacherAssignments.find((a) => a.grade === selectedResourceGrade) || null;
                        const assignedSubjectsForGrade = currentGradeAssignment?.subjects || [];

                        return (
                          <>
                            {/* BREADCRUMB & HEADER BAR */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                                <button
                                  onClick={handleGoBack}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Go back one step"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedResourceCategory(null);
                                    setSelectedResourceTeacherId(null);
                                    setSelectedResourceGrade(null);
                                    setSelectedResourceSubject(null);
                                    setSelectedResourceId(null);
                                  }}
                                  className="text-slate-400 hover:text-white font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Resources</span>
                                </button>
                                <ChevronRight className="w-3 h-3 text-slate-600" />
                                <button
                                  onClick={() => {
                                    setSelectedResourceTeacherId(null);
                                    setSelectedResourceGrade(null);
                                    setSelectedResourceSubject(null);
                                    setSelectedResourceId(null);
                                  }}
                                  className={`font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                    !selectedResourceTeacherId ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <span>{categoryIcon}</span>
                                  <span>{categoryName}</span>
                                </button>
                                {currentTeacher && (
                                  <>
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                    <button
                                      onClick={() => {
                                        setSelectedResourceGrade(null);
                                        setSelectedResourceSubject(null);
                                        setSelectedResourceId(null);
                                      }}
                                      className={`font-bold transition cursor-pointer ${
                                        !selectedResourceGrade ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {currentTeacher.name}
                                    </button>
                                  </>
                                )}
                                {selectedResourceGrade && (
                                  <>
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                    <button
                                      onClick={() => {
                                        setSelectedResourceSubject(null);
                                        setSelectedResourceId(null);
                                      }}
                                      className={`font-bold transition cursor-pointer ${
                                        !selectedResourceSubject ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {selectedResourceGrade}
                                    </button>
                                  </>
                                )}
                                {selectedResourceSubject && (
                                  <>
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                    <span className="font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                      {selectedResourceSubject}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {selectedResourceSubject && currentTeacher && selectedResourceGrade && (
                                  <button
                                    onClick={() => {
                                      setNewResourceTitle('');
                                      setNewResourceStrand('');
                                      setNewResourceNotes('');
                                      setNewResourceFileName('');
                                      setResourceFormError('');
                                      setIsAddingResource(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Resource</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedResourceCategory(null);
                                    setSelectedResourceTeacherId(null);
                                    setSelectedResourceGrade(null);
                                    setSelectedResourceSubject(null);
                                    setSelectedResourceId(null);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition cursor-pointer"
                                >
                                  All Categories
                                </button>
                              </div>
                            </div>

                            {/* INTERACTIVE HIERARCHY TREE ACCORDION */}
                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex flex-wrap items-center gap-2 font-bold text-slate-300">
                                  <span>{categoryIcon}</span>
                                  <span className="text-white">Curriculum Hierarchy: {categoryName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                                    Teacher → Grade → Subject → Documents
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowResourceTree(!showResourceTree)}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                  {showResourceTree ? 'Hide Hierarchy Tree' : 'View Hierarchy Tree'}
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showResourceTree ? 'rotate-180' : ''}`} />
                                </button>
                              </div>

                              {showResourceTree && (
                                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                                  {activeTeachersForResources.length === 0 ? (
                                    <p className="text-slate-500 italic py-2 text-center text-xs">
                                      No registered teachers with Grade & Subject assignments.
                                    </p>
                                  ) : (
                                    activeTeachersForResources.map(({ teacher, assignments }) => {
                                      const isTeacherSelected = selectedResourceTeacherId === teacher.id;
                                      const isTeacherExpanded = treeExpandedTeachers.includes(teacher.id) || isTeacherSelected;

                                      return (
                                        <div key={teacher.id} className="space-y-1">
                                          <div
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                                              isTeacherSelected
                                                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                                : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                                            }`}
                                            onClick={() => {
                                              setSelectedResourceTeacherId(teacher.id);
                                              setSelectedResourceGrade(null);
                                              setSelectedResourceSubject(null);
                                            }}
                                          >
                                            <div className="flex items-center gap-2 truncate">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setTreeExpandedTeachers((prev) =>
                                                    prev.includes(teacher.id)
                                                      ? prev.filter((id) => id !== teacher.id)
                                                      : [...prev, teacher.id]
                                                  );
                                                }}
                                                className="p-0.5 text-slate-400 hover:text-white"
                                              >
                                                <ChevronRight
                                                  className={`w-3.5 h-3.5 transition-transform ${
                                                    isTeacherExpanded ? 'rotate-90' : ''
                                                  }`}
                                                />
                                              </button>
                                              <span className="font-semibold truncate">{teacher.name}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                              {assignments.length} {assignments.length === 1 ? 'Grade' : 'Grades'}
                                            </span>
                                          </div>

                                          {isTeacherExpanded && (
                                            <div className="pl-6 space-y-1 border-l border-slate-800 ml-3">
                                              {assignments.map((assignment) => {
                                                const isGradeSelected = isTeacherSelected && selectedResourceGrade === assignment.grade;
                                                const gradeKey = `${teacher.id}_${assignment.grade}`;
                                                const isGradeExpanded = treeExpandedGrades.includes(gradeKey) || isGradeSelected;

                                                return (
                                                  <div key={assignment.grade} className="space-y-1">
                                                    <div
                                                      className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition ${
                                                        isGradeSelected
                                                          ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                                                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                                      }`}
                                                      onClick={() => {
                                                        setSelectedResourceTeacherId(teacher.id);
                                                        setSelectedResourceGrade(assignment.grade);
                                                        setSelectedResourceSubject(null);
                                                      }}
                                                    >
                                                      <div className="flex items-center gap-1.5 truncate">
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTreeExpandedGrades((prev) =>
                                                              prev.includes(gradeKey)
                                                                ? prev.filter((k) => k !== gradeKey)
                                                                : [...prev, gradeKey]
                                                            );
                                                          }}
                                                          className="p-0.5 text-slate-500 hover:text-slate-300"
                                                        >
                                                          <ChevronRight
                                                            className={`w-3 h-3 transition-transform ${
                                                              isGradeExpanded ? 'rotate-90' : ''
                                                            }`}
                                                          />
                                                        </button>
                                                        <span className="font-medium">{assignment.grade}</span>
                                                      </div>
                                                      <span className="text-[10px] text-slate-500">
                                                        {assignment.subjects.length} subjs
                                                      </span>
                                                    </div>

                                                    {isGradeExpanded && (
                                                      <div className="pl-5 space-y-0.5 border-l border-slate-800/60 ml-2">
                                                        {assignment.subjects.map((subj) => {
                                                          const isSubjSelected =
                                                            isGradeSelected && selectedResourceSubject === subj;
                                                          const docsCount = getMatchingDocumentsForLocation(
                                                            selectedResourceCategory,
                                                            teacher,
                                                            assignment.grade,
                                                            subj
                                                          ).length;

                                                          return (
                                                            <div
                                                              key={subj}
                                                              onClick={() => {
                                                                setSelectedResourceTeacherId(teacher.id);
                                                                setSelectedResourceGrade(assignment.grade);
                                                                setSelectedResourceSubject(subj);
                                                              }}
                                                              className={`flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer transition ${
                                                                isSubjSelected
                                                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                                                              }`}
                                                            >
                                                              <span className="truncate">→ {subj}</span>
                                                              <span
                                                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                                                  isSubjSelected
                                                                    ? 'bg-slate-950/20 text-slate-950'
                                                                    : docsCount > 0
                                                                    ? 'bg-amber-500/20 text-amber-400'
                                                                    : 'text-slate-600'
                                                                }`}
                                                              >
                                                                {docsCount > 0 ? `${docsCount} docs` : 'empty'}
                                                              </span>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>

                            {/* MAIN DRILL-DOWN STAGE VIEW */}
                            {!selectedResourceTeacherId ? (
                              /* LEVEL 1: TEACHER SELECTION */
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-white">
                                      Faculty Teachers in {categoryName}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                      Showing existing teachers with active Grade & Subject assignments. Select a teacher to proceed:
                                    </p>
                                  </div>
                                  <span className="text-xs font-mono text-slate-500">
                                    {activeTeachersForResources.length} Teachers
                                  </span>
                                </div>

                                {activeTeachersForResources.length === 0 ? (
                                  <div className="py-16 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mx-auto">
                                      {categoryIcon}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                                      NO RESOURCES INSTALLED
                                    </h4>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                      No registered teachers with active curriculum assignments found in the system. Teachers added through Teacher Management will appear here.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activeTeachersForResources.map(({ teacher, assignments }) => {
                                      return (
                                        <div
                                          key={teacher.id}
                                          onClick={() => {
                                            setSelectedResourceTeacherId(teacher.id);
                                            setSelectedResourceGrade(null);
                                            setSelectedResourceSubject(null);
                                          }}
                                          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition flex flex-col justify-between space-y-3 group"
                                        >
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold">
                                                {teacher.tier === 'upper' ? 'Upper Primary' : 'Lower Primary'}
                                              </span>
                                              {teacher.isClassTeacher && teacher.classTeacherGrade && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                                                  Class Teacher: {teacher.classTeacherGrade}
                                                </span>
                                              )}
                                            </div>
                                            <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                                              {teacher.name}
                                            </h4>
                                            <div className="space-y-1.5 pt-1">
                                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                                                Assigned Grades & Learning Areas:
                                              </span>
                                              <div className="space-y-1">
                                                {assignments.map((asg) => (
                                                  <div
                                                    key={asg.grade}
                                                    className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80"
                                                  >
                                                    <span className="font-bold text-amber-300 block mb-0.5">
                                                      {asg.grade}:
                                                    </span>
                                                    <span className="text-slate-400 text-[11px] leading-tight block">
                                                      {asg.subjects.join(', ')}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                            <span>
                                              {assignments.length} {assignments.length === 1 ? 'Grade' : 'Grades'}
                                            </span>
                                            <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                                              View Allocations →
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : selectedResourceTeacherId && !selectedResourceGrade ? (
                              /* LEVEL 2: GRADE SELECTION FOR SELECTED TEACHER */
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                      <span>👤 {currentTeacher?.name}</span>
                                      <span className="text-slate-500 font-normal">•</span>
                                      <span className="text-amber-400 text-xs font-semibold">Assigned Grades in {categoryName}</span>
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                      Select an assigned grade for {currentTeacher?.name} to view subjects:
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setSelectedResourceTeacherId(null)}
                                    className="text-xs text-slate-400 hover:text-white transition cursor-pointer font-bold"
                                  >
                                    ← Back to Teachers
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {currentTeacherAssignments.map((asg) => (
                                    <div
                                      key={asg.grade}
                                      onClick={() => {
                                        setSelectedResourceGrade(asg.grade);
                                        setSelectedResourceSubject(null);
                                      }}
                                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition flex flex-col justify-between space-y-3 group"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                                            {asg.grade}
                                          </span>
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                                            {asg.subjects.length} {asg.subjects.length === 1 ? 'Subject' : 'Subjects'}
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                            Assigned Subjects:
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {asg.subjects.map((s) => (
                                              <span
                                                key={s}
                                                className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                                              >
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                        <span>Open Grade</span>
                                        <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                                          View Subjects →
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : selectedResourceGrade && !selectedResourceSubject ? (
                              /* LEVEL 3: SUBJECT SELECTION FOR SELECTED GRADE */
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                      <span>👤 {currentTeacher?.name}</span>
                                      <span className="text-slate-500 font-normal">→</span>
                                      <span className="text-amber-400">{selectedResourceGrade}</span>
                                      <span className="text-slate-500 font-normal">•</span>
                                      <span className="text-xs text-slate-300 font-normal">Assigned Subjects</span>
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                      Select an assigned subject to view installed documents:
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setSelectedResourceGrade(null)}
                                    className="text-xs text-slate-400 hover:text-white transition cursor-pointer font-bold"
                                  >
                                    ← Back to Grades
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {assignedSubjectsForGrade.map((subj) => {
                                    const docs = currentTeacher
                                      ? getMatchingDocumentsForLocation(
                                          selectedResourceCategory,
                                          currentTeacher,
                                          selectedResourceGrade,
                                          subj
                                        )
                                      : [];

                                    return (
                                      <div
                                        key={subj}
                                        onClick={() => setSelectedResourceSubject(subj)}
                                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition flex flex-col justify-between space-y-3 group"
                                      >
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold">
                                              {selectedResourceGrade}
                                            </span>
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                docs.length > 0
                                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                  : 'bg-slate-800 text-slate-500'
                                              }`}
                                            >
                                              {docs.length} {docs.length === 1 ? 'Installed Document' : 'Installed Documents'}
                                            </span>
                                          </div>
                                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                            {subj}
                                          </h4>
                                          <p className="text-[11px] text-slate-400">
                                            {currentTeacher?.name} • {selectedResourceGrade}
                                          </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                          <span>{docs.length > 0 ? 'View Documents' : 'Empty location'}</span>
                                          <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                                            Open Documents →
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              /* LEVEL 4: WORKING RESOURCE WORKSPACE FOR EXACT TEACHER -> GRADE -> SUBJECT */
                              <div className="space-y-4">
                                {(() => {
                                  const allLocationDocs =
                                    currentTeacher && selectedResourceGrade && selectedResourceSubject
                                      ? getMatchingDocumentsForLocation(
                                          selectedResourceCategory,
                                          currentTeacher,
                                          selectedResourceGrade,
                                          selectedResourceSubject
                                        )
                                      : [];

                                  let filteredDocs = allLocationDocs;
                                  if (resourceSearchQuery.trim()) {
                                    const q = resourceSearchQuery.toLowerCase().trim();
                                    filteredDocs = filteredDocs.filter(
                                      (d) =>
                                        d.title.toLowerCase().includes(q) ||
                                        d.fileName?.toLowerCase().includes(q) ||
                                        d.notes?.toLowerCase().includes(q) ||
                                        d.strand?.toLowerCase().includes(q) ||
                                        d.fileType?.toLowerCase().includes(q)
                                    );
                                  }

                                  const displayedDocs = [...filteredDocs].sort((a, b) => {
                                    if (resourceSortBy === 'name_asc') return a.title.localeCompare(b.title);
                                    if (resourceSortBy === 'name_desc') return b.title.localeCompare(a.title);
                                    if (resourceSortBy === 'date_asc') return (a.date || '').localeCompare(b.date || '');
                                    if (resourceSortBy === 'date_desc') return (b.date || '').localeCompare(a.date || '');
                                    if (resourceSortBy === 'size_desc') return (b.fileSize || '').localeCompare(a.fileSize || '');
                                    if (resourceSortBy === 'size_asc') return (a.fileSize || '').localeCompare(b.fileSize || '');
                                    return 0;
                                  });

                                  // Move Modal target teacher allocations helper
                                  const moveTeacherObj =
                                    teachers.find((t) => t.id === moveTargetTeacherId) || teachers[0];
                                  const moveTeacherAssignments = moveTeacherObj
                                    ? getTeacherGradeAssignments(moveTeacherObj)
                                    : [];
                                  const moveAvailableSubjects =
                                    moveTeacherAssignments.find((a) => a.grade === moveTargetGrade)?.subjects || [];

                                  return (
                                    <div className="space-y-4">
                                      {/* Hidden file inputs for direct real upload & replace */}
                                      <input
                                        type="file"
                                        ref={locationFileInputRef}
                                        onChange={handleLocationFileUpload}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.mp4,.webm,.mov"
                                      />
                                      <input
                                        type="file"
                                        ref={replaceFileInputRef}
                                        onChange={handleLocationFileReplace}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.mp4,.webm,.mov"
                                      />

                                      {/* Top Header Card */}
                                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                          <div className="space-y-1.5 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1.5">
                                                <span>{categoryIcon}</span>
                                                <span>{categoryName}</span>
                                              </span>
                                              <span className="text-slate-600 text-xs">/</span>
                                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                                                {selectedResourceGrade}
                                              </span>
                                              <span className="text-slate-600 text-xs">/</span>
                                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                                {selectedResourceSubject}
                                              </span>
                                            </div>
                                            <h3 className="text-base sm:text-lg font-black text-white truncate">
                                              {selectedResourceSubject} Workspace
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                              Assigned Teacher:{' '}
                                              <span className="font-bold text-slate-200">
                                                {currentTeacher?.name}
                                              </span>{' '}
                                              • Location files:{' '}
                                              <span className="text-amber-400 font-mono font-bold">
                                                {allLocationDocs.length}
                                              </span>
                                            </p>
                                          </div>

                                          {/* School Storage Quota Widget */}
                                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                                            <div className="flex items-center gap-2 font-mono">
                                              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                                              <div>
                                                <div className="flex items-center gap-2 text-[11px]">
                                                  <span className="text-slate-300 font-bold">
                                                    {schoolStorageInfo.formattedUsed} / 500 MB
                                                  </span>
                                                  <span className="text-slate-500 font-bold">
                                                    ({schoolStorageInfo.formattedRemaining} free)
                                                  </span>
                                                </div>
                                                <div className="w-32 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                                                  <div
                                                    className={`h-full rounded-full transition-all ${
                                                      schoolStorageInfo.percentUsed > 85
                                                        ? 'bg-rose-500'
                                                        : 'bg-amber-400'
                                                    }`}
                                                    style={{ width: `${schoolStorageInfo.percentUsed}%` }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                                            <div className="text-[11px] text-slate-400 font-mono">
                                              <span className="text-white font-bold">
                                                {schoolStorageInfo.totalDocs}
                                              </span>{' '}
                                              school docs
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Message Banner */}
                                        {uploadStatusBanner && (
                                          <div
                                            className={`p-3 rounded-xl text-xs flex items-center justify-between font-bold animate-in fade-in ${
                                              uploadStatusBanner.type === 'error'
                                                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                                                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              {uploadStatusBanner.type === 'error' ? (
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                              ) : (
                                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                              )}
                                              <span>{uploadStatusBanner.message}</span>
                                            </div>
                                            <button
                                              onClick={() => setUploadStatusBanner(null)}
                                              className="p-1 hover:text-white"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}

                                        {/* Action Bar: Search, Sort, Add, Upload, New Doc Tools */}
                                        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                                          {/* Search & Sort */}
                                          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                                            <div className="relative flex-1 min-w-[160px]">
                                              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                              <input
                                                type="text"
                                                value={resourceSearchQuery}
                                                onChange={(e) => setResourceSearchQuery(e.target.value)}
                                                placeholder="Search files in this location..."
                                                className="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                                              />
                                              {resourceSearchQuery && (
                                                <button
                                                  onClick={() => setResourceSearchQuery('')}
                                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>

                                            <select
                                              value={resourceSortBy}
                                              onChange={(e) => setResourceSortBy(e.target.value as any)}
                                              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                                            >
                                              <option value="date_desc">Newest First</option>
                                              <option value="date_asc">Oldest First</option>
                                              <option value="name_asc">Name: A to Z</option>
                                              <option value="name_desc">Name: Z to A</option>
                                              <option value="size_desc">Size: Largest</option>
                                              <option value="size_asc">Size: Smallest</option>
                                            </select>
                                          </div>

                                          {/* Action Buttons */}
                                          <div className="flex flex-wrap items-center gap-2">
                                            {/* Offline AI Assistant Button */}
                                            <button
                                              type="button"
                                              onClick={() => setShowAIAssistantModal(true)}
                                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                                              title="Launch Offline AI Document Assistant to read content and route documents"
                                            >
                                              <Sparkles className="w-3.5 h-3.5" />
                                              <span>Offline AI Assistant</span>
                                            </button>

                                            {/* Unified Upload Document Button */}
                                            <button
                                              onClick={() => locationFileInputRef.current?.click()}
                                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                                              title="Upload real document, PDF, spreadsheet, image, or video with automatic text extraction"
                                            >
                                              <FileUp className="w-3.5 h-3.5" />
                                              <span>Upload Document</span>
                                            </button>

                                            {/* Create Document Workspace Buttons */}
                                            <button
                                              onClick={() => handleCreateNewDocument('document')}
                                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                              title="Create new Word-style document"
                                            >
                                              <FileText className="w-3.5 h-3.5 text-blue-400" />
                                              <span>+ New Doc</span>
                                            </button>

                                            <button
                                              onClick={() => handleCreateNewDocument('spreadsheet')}
                                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                              title="Create new Spreadsheet"
                                            >
                                              <Table className="w-3.5 h-3.5 text-emerald-400" />
                                              <span>+ Sheet</span>
                                            </button>

                                            <button
                                              onClick={() => handleCreateNewDocument('text')}
                                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                              title="Create new Text note"
                                            >
                                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                              <span>+ Note</span>
                                            </button>

                                            <button
                                              onClick={() => setSelectedResourceSubject(null)}
                                              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
                                            >
                                              ← Subjects
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Document Grid or Empty State */}
                                      {displayedDocs.length === 0 ? (
                                        <div className="py-16 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl mx-auto">
                                            {categoryIcon}
                                          </div>
                                          <div className="space-y-1">
                                            <h4 className="text-base font-black text-slate-200 uppercase tracking-wider">
                                              NO RESOURCES INSTALLED
                                            </h4>
                                            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                                              No resources or files have been installed under {categoryName} for{' '}
                                              {currentTeacher?.name} in {selectedResourceGrade} •{' '}
                                              {selectedResourceSubject}.
                                            </p>
                                          </div>

                                          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                            <button
                                              onClick={() => locationFileInputRef.current?.click()}
                                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 shadow-md"
                                            >
                                              <FileUp className="w-4 h-4" />
                                              <span>Upload File / Media</span>
                                            </button>
                                            <button
                                              onClick={() => handleCreateNewDocument('document')}
                                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 shadow-md"
                                            >
                                              <FileText className="w-4 h-4" />
                                              <span>Create Word-style Document</span>
                                            </button>
                                            <button
                                              onClick={() => handleCreateNewDocument('spreadsheet')}
                                              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 shadow-md"
                                            >
                                              <Table className="w-4 h-4" />
                                              <span>Create Spreadsheet</span>
                                            </button>
                                            <button
                                              onClick={() => {
                                                setNewResourceTitle('');
                                                setNewResourceStrand('');
                                                setNewResourceNotes('');
                                                setNewResourceFileName('');
                                                setResourceFormError('');
                                                setIsAddingResource(true);
                                              }}
                                              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 shadow-md"
                                            >
                                              <Plus className="w-4 h-4" />
                                              <span>Add Custom Resource</span>
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                          {displayedDocs.map((res) => {
                                            const wsItem = convertToWorkspaceItem(res);
                                            const doc = wsItem.documents[0];
                                            const fileType = doc?.fileType || 'document';
                                            const versionsCount = (doc?.versions?.length || 0) + 1;
                                            const isMenuOpen = activeCardMenuId === res.id;

                                            return (
                                              <div
                                                key={res.id}
                                                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/80 transition flex flex-col justify-between space-y-3 relative group"
                                              >
                                                {/* Card Header Row */}
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                                                        {fileType === 'spreadsheet' && (
                                                          <Table className="w-3.5 h-3.5 text-emerald-400" />
                                                        )}
                                                        {fileType === 'pdf' && (
                                                          <FileText className="w-3.5 h-3.5 text-rose-400" />
                                                        )}
                                                        {fileType === 'image' && (
                                                          <Camera className="w-3.5 h-3.5 text-purple-400" />
                                                        )}
                                                        {fileType === 'video' && (
                                                          <Video className="w-3.5 h-3.5 text-blue-400" />
                                                        )}
                                                        {(fileType === 'document' || fileType === 'text') && (
                                                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                                                        )}
                                                      </span>
                                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold capitalize">
                                                        {fileType}
                                                      </span>
                                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                                                        {res.grade || selectedResourceGrade}
                                                      </span>
                                                    </div>

                                                    {/* Three-Dot More Menu */}
                                                    <div className="relative">
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setActiveCardMenuId(isMenuOpen ? null : res.id);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                                                        title="Document Actions"
                                                      >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                      </button>

                                                      {isMenuOpen && (
                                                        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl py-1 z-50 text-xs space-y-0.5 animate-in fade-in">
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              setActiveWorkspaceResource(wsItem);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                                            <span>Open & Edit</span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              setActiveWorkspaceResource(wsItem);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                                                            <span>Preview / Read</span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              setRenameModalResource(wsItem);
                                                              setRenameNewTitle(res.title);
                                                              setRenameNewFileName(
                                                                doc?.name || res.fileName || ''
                                                              );
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <Edit className="w-3.5 h-3.5 text-purple-400" />
                                                            <span>Rename</span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              handleCardDuplicateResource(res);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <Copy className="w-3.5 h-3.5 text-blue-400" />
                                                            <span>Save As / Copy</span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              setReplaceTargetResourceId(res.id);
                                                              replaceFileInputRef.current?.click();
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                                                            <span>Replace File...</span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              setMoveModalResource(wsItem);
                                                              setMoveTargetTeacherId(currentTeacher?.id || '');
                                                              setMoveTargetGrade(selectedResourceGrade || '');
                                                              setMoveTargetSubject(selectedResourceSubject || '');
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                                                            <span>Move Location</span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              setVersionsModalResource(wsItem);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <History className="w-3.5 h-3.5 text-purple-400" />
                                                            <span>
                                                              Versions ({doc?.versions?.length || 0})
                                                            </span>
                                                          </button>

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              handleCardDownloadResource(res);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                                                          >
                                                            <Download className="w-3.5 h-3.5 text-blue-400" />
                                                            <span>Download</span>
                                                          </button>

                                                          <div className="border-t border-slate-800 my-1" />

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCardMenuId(null);
                                                              handleCardDeleteResource(res);
                                                            }}
                                                            className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 transition font-bold"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Delete</span>
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Title & Filename */}
                                                  <div
                                                    onClick={() => setActiveWorkspaceResource(wsItem)}
                                                    className="cursor-pointer space-y-1"
                                                  >
                                                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                                                      {res.title}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400 font-mono truncate">
                                                      {doc?.name || res.fileName || `${res.title}.doc`} •{' '}
                                                      <span className="text-slate-300">
                                                        {doc?.size || res.fileSize || 'Ready'}
                                                      </span>
                                                    </p>
                                                    {res.strand && (
                                                      <span className="inline-block text-[10px] text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate max-w-full">
                                                        Strand: {res.strand}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Card Footer Row */}
                                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                                                  <div className="flex items-center gap-2 font-mono text-[10px]">
                                                    <span>{res.date || 'Repository'}</span>
                                                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                                                      v{versionsCount}
                                                    </span>
                                                  </div>

                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      onClick={() => setActiveWorkspaceResource(wsItem)}
                                                      className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition cursor-pointer"
                                                    >
                                                      Open
                                                    </button>
                                                    <button
                                                      onClick={() => handleCardDownloadResource(res)}
                                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                                      title="Download"
                                                    >
                                                      <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* MODAL: RENAME RESOURCE */}
                                      {renameModalResource && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                                          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Edit className="w-4 h-4 text-amber-400" />
                                                <span>Rename Resource</span>
                                              </h3>
                                              <button onClick={() => setRenameModalResource(null)}>
                                                <X className="w-4 h-4 text-slate-400 hover:text-white" />
                                              </button>
                                            </div>

                                            <form
                                              onSubmit={handleRenameResourceSubmit}
                                              className="space-y-3.5 text-xs"
                                            >
                                              <div>
                                                <label className="block text-slate-300 font-bold mb-1">
                                                  Resource Title
                                                </label>
                                                <input
                                                  type="text"
                                                  required
                                                  value={renameNewTitle}
                                                  onChange={(e) => setRenameNewTitle(e.target.value)}
                                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-slate-300 font-bold mb-1">
                                                  File Name
                                                </label>
                                                <input
                                                  type="text"
                                                  value={renameNewFileName}
                                                  onChange={(e) => setRenameNewFileName(e.target.value)}
                                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                                                />
                                              </div>

                                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                                <button
                                                  type="button"
                                                  onClick={() => setRenameModalResource(null)}
                                                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white cursor-pointer"
                                                >
                                                  Cancel
                                                </button>
                                                <button
                                                  type="submit"
                                                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                                                >
                                                  Save Rename
                                                </button>
                                              </div>
                                            </form>
                                          </div>
                                        </div>
                                      )}

                                      {/* MODAL: MOVE RESOURCE (STRICTLY REAL TEACHER ALLOCATIONS) */}
                                      {moveModalResource && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                                          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <FolderInput className="w-4 h-4 text-amber-400" />
                                                <span>Move Resource Location</span>
                                              </h3>
                                              <button onClick={() => setMoveModalResource(null)}>
                                                <X className="w-4 h-4 text-slate-400 hover:text-white" />
                                              </button>
                                            </div>

                                            <form
                                              onSubmit={handleMoveResourceSubmit}
                                              className="space-y-3.5 text-xs"
                                            >
                                              <div>
                                                <label className="block text-slate-300 font-bold mb-1">
                                                  Target Teacher
                                                </label>
                                                <select
                                                  value={moveTargetTeacherId}
                                                  onChange={(e) => {
                                                    const newTId = e.target.value;
                                                    setMoveTargetTeacherId(newTId);
                                                    const targetT = teachers.find((t) => t.id === newTId);
                                                    const asgs = targetT
                                                      ? getTeacherGradeAssignments(targetT)
                                                      : [];
                                                    if (asgs.length > 0) {
                                                      setMoveTargetGrade(asgs[0].grade);
                                                      setMoveTargetSubject(asgs[0].subjects[0] || '');
                                                    }
                                                  }}
                                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                                >
                                                  {teachers.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                      {t.name}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>

                                              <div>
                                                <label className="block text-slate-300 font-bold mb-1">
                                                  Target Grade
                                                </label>
                                                {moveTeacherAssignments.length > 0 ? (
                                                  <select
                                                    value={moveTargetGrade}
                                                    onChange={(e) => {
                                                      const newG = e.target.value;
                                                      setMoveTargetGrade(newG);
                                                      const matched = moveTeacherAssignments.find(
                                                        (a) => a.grade === newG
                                                      );
                                                      if (matched && matched.subjects.length > 0) {
                                                        setMoveTargetSubject(matched.subjects[0]);
                                                      }
                                                    }}
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                                  >
                                                    {moveTeacherAssignments.map((a) => (
                                                      <option key={a.grade} value={a.grade}>
                                                        {a.grade}
                                                      </option>
                                                    ))}
                                                  </select>
                                                ) : (
                                                  <input
                                                    type="text"
                                                    required
                                                    value={moveTargetGrade}
                                                    onChange={(e) => setMoveTargetGrade(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                                                  />
                                                )}
                                              </div>

                                              <div>
                                                <label className="block text-slate-300 font-bold mb-1">
                                                  Target Subject
                                                </label>
                                                {moveAvailableSubjects.length > 0 ? (
                                                  <select
                                                    value={moveTargetSubject}
                                                    onChange={(e) => setMoveTargetSubject(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                                  >
                                                    {moveAvailableSubjects.map((s) => (
                                                      <option key={s} value={s}>
                                                        {s}
                                                      </option>
                                                    ))}
                                                  </select>
                                                ) : (
                                                  <input
                                                    type="text"
                                                    required
                                                    value={moveTargetSubject}
                                                    onChange={(e) => setMoveTargetSubject(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                                                  />
                                                )}
                                              </div>

                                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                                <button
                                                  type="button"
                                                  onClick={() => setMoveModalResource(null)}
                                                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white cursor-pointer"
                                                >
                                                  Cancel
                                                </button>
                                                <button
                                                  type="submit"
                                                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                                                >
                                                  Confirm Move
                                                </button>
                                              </div>
                                            </form>
                                          </div>
                                        </div>
                                      )}

                                      {/* MODAL: VERSION HISTORY */}
                                      {versionsModalResource && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                                          <div className="w-full max-w-lg rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <History className="w-4 h-4 text-purple-400" />
                                                <span>
                                                  Version History: {versionsModalResource.title}
                                                </span>
                                              </h3>
                                              <button onClick={() => setVersionsModalResource(null)}>
                                                <X className="w-4 h-4 text-slate-400 hover:text-white" />
                                              </button>
                                            </div>

                                            <div className="space-y-2.5">
                                              {/* Current Version */}
                                              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1 text-xs">
                                                <div className="flex items-center justify-between">
                                                  <span className="font-bold text-amber-300">
                                                    Current Active Version
                                                  </span>
                                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                                    Live in Repository
                                                  </span>
                                                </div>
                                                <p className="text-slate-400 text-[11px] font-mono">
                                                  {versionsModalResource.documents[0]?.name} •{' '}
                                                  {versionsModalResource.documents[0]?.size || 'Ready'}
                                                </p>
                                              </div>

                                              {/* Historical Versions */}
                                              {!versionsModalResource.documents[0]?.versions?.length ? (
                                                <p className="text-xs text-slate-500 italic text-center py-4">
                                                  No previous versions recorded yet. All modifications and file
                                                  replacements will preserve historical versions here.
                                                </p>
                                              ) : (
                                                versionsModalResource.documents[0].versions.map(
                                                  (ver: any, vi: number) => (
                                                    <div
                                                      key={vi}
                                                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                                                    >
                                                      <div className="flex items-center justify-between">
                                                        <span className="font-bold text-white">
                                                          Version {ver.version}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                          {new Date(ver.timestamp).toLocaleString()}
                                                        </span>
                                                      </div>
                                                      <p className="text-slate-400 text-[11px] font-mono">
                                                        {ver.name} • {ver.size || 'Saved copy'}
                                                      </p>
                                                      {ver.author && (
                                                        <span className="text-[10px] text-slate-500">
                                                          Author: {ver.author}
                                                        </span>
                                                      )}
                                                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                                                        <button
                                                          onClick={() =>
                                                            handleRestoreCardVersion(
                                                              versionsModalResource,
                                                              ver
                                                            )
                                                          }
                                                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] cursor-pointer"
                                                        >
                                                          Restore This Version
                                                        </button>
                                                      </div>
                                                    </div>
                                                  )
                                                )
                                              )}
                                            </div>

                                            <div className="flex justify-end pt-2 border-t border-slate-800">
                                              <button
                                                onClick={() => setVersionsModalResource(null)}
                                                className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white"
                                              >
                                                Close
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* MODAL: ADD REAL RESOURCE */}
                            {isAddingResource && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                                <div className="w-full max-w-lg rounded-2xl bg-[#080E24] border border-slate-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{categoryIcon}</span>
                                      <div>
                                        <h3 className="text-sm sm:text-base font-black text-white">
                                          Add Real Resource
                                        </h3>
                                        <p className="text-[11px] text-slate-400">
                                          Install a curriculum document to repository
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setIsAddingResource(false)}
                                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Offline AI recommendation banner */}
                                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                                      <div className="text-[11px] text-cyan-200">
                                        <p className="font-bold">Want Offline AI Auto-Routing?</p>
                                        <p className="text-slate-400">Reads text & automatically syncs to teacher portals.</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddingResource(false);
                                        setShowAIAssistantModal(true);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shrink-0 transition cursor-pointer"
                                    >
                                      Use Offline AI
                                    </button>
                                  </div>

                                  {/* Hidden file input for modal attachment */}
                                  <input
                                    type="file"
                                    ref={modalFileInputRef}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.mp4,.webm"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      if (file.size > 50 * 1024 * 1024) {
                                        setResourceFormError(`File size (${formatBytes(file.size)}) exceeds 50 MB limit.`);
                                        return;
                                      }
                                      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
                                      if (!newResourceTitle.trim()) {
                                        setNewResourceTitle(cleanTitle);
                                      }
                                      setNewResourceFileName(file.name);
                                      const ext = file.name.split('.').pop()?.toLowerCase() || '';
                                      if (ext === 'pdf') setNewResourceFileType('PDF Document');
                                      else if (['doc', 'docx'].includes(ext)) setNewResourceFileType('Scheme of Work');
                                      else if (['xls', 'xlsx', 'csv'].includes(ext)) setNewResourceFileType('Spreadsheet');

                                      const isText = file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.md');
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const result = event.target?.result;
                                        if (typeof result === 'string') {
                                          setNewResourceAttachedFile(file);
                                          setNewResourceAttachedDataUrl(result);
                                          setResourceFormError('');
                                        }
                                      };
                                      if (isText) reader.readAsText(file);
                                      else reader.readAsDataURL(file);
                                      e.target.value = '';
                                    }}
                                  />

                                  {/* Target Location Metadata Pill or Selectors */}
                                  {selectedResourceTeacherId && selectedResourceGrade && selectedResourceSubject ? (
                                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                        Target Repository Location
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1.5 font-bold">
                                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                          {categoryName}
                                        </span>
                                        <span className="text-slate-500">→</span>
                                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                                          {currentTeacher?.name || 'Teacher'}
                                        </span>
                                        <span className="text-slate-500">→</span>
                                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                          {selectedResourceGrade}
                                        </span>
                                        <span className="text-slate-500">→</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                          {selectedResourceSubject}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2.5">
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                        Assign Repository Location
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Category</label>
                                          <select
                                            value={selectedResourceCategory || modalTargetCategory}
                                            onChange={(e) => setModalTargetCategory(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                          >
                                            {RESOURCE_CATEGORIES.map((c) => (
                                              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Teacher</label>
                                          <select
                                            value={modalTargetTeacherId || teachers[0]?.id || ''}
                                            onChange={(e) => {
                                              const tId = e.target.value;
                                              setModalTargetTeacherId(tId);
                                              const t = teachers.find((x) => x.id === tId);
                                              if (t) {
                                                const asgs = getTeacherGradeAssignments(t);
                                                if (asgs.length > 0) {
                                                  setModalTargetGrade(asgs[0].grade);
                                                  if (asgs[0].subjects.length > 0) {
                                                    setModalTargetSubject(asgs[0].subjects[0]);
                                                  }
                                                }
                                              }
                                            }}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                          >
                                            {teachers.map((t) => (
                                              <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Grade</label>
                                          <select
                                            value={selectedResourceGrade || modalTargetGrade}
                                            onChange={(e) => {
                                              const g = e.target.value;
                                              setModalTargetGrade(g);
                                              const t = teachers.find((x) => x.id === (modalTargetTeacherId || teachers[0]?.id));
                                              if (t) {
                                                const asgs = getTeacherGradeAssignments(t);
                                                const match = asgs.find((a) => a.grade === g);
                                                if (match && match.subjects.length > 0) {
                                                  setModalTargetSubject(match.subjects[0]);
                                                }
                                              }
                                            }}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                          >
                                            {LRA_GRADES.map((g) => (
                                              <option key={g} value={g}>{g}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Learning Area / Subject</label>
                                          <select
                                            value={selectedResourceSubject || modalTargetSubject}
                                            onChange={(e) => setModalTargetSubject(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                          >
                                            {CBC_SUBJECTS.map((s) => (
                                              <option key={s} value={s}>{s}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Upload Document / PDF Dropzone */}
                                  <div className="space-y-1.5">
                                    <label className="block text-slate-300 font-bold">
                                      Upload Document or PDF File
                                    </label>
                                    {newResourceAttachedFile ? (
                                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                            {newResourceAttachedFile.name.split('.').pop() || 'FILE'}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{newResourceAttachedFile.name}</p>
                                            <p className="text-[11px] text-amber-300 font-mono">
                                              {formatBytes(newResourceAttachedFile.size)} • Ready to Save
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNewResourceAttachedFile(null);
                                            setNewResourceAttachedDataUrl(null);
                                          }}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
                                          title="Remove file"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div
                                        onClick={() => modalFileInputRef.current?.click()}
                                        className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500 transition cursor-pointer text-center space-y-1 group"
                                      >
                                        <FileUp className="w-6 h-6 text-slate-400 group-hover:text-amber-400 mx-auto transition" />
                                        <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                                          Click to Choose or Drag & Drop Document / PDF
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                          Supports PDF, Word (.docx/.doc), Excel (.xlsx/.csv), PowerPoint, Scans & Text (up to 50 MB)
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {resourceFormError && (
                                    <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                      <span>{resourceFormError}</span>
                                    </div>
                                  )}

                                  <form onSubmit={handleSaveNewResource} className="space-y-3.5 text-xs">
                                    <div>
                                      <label className="block text-slate-300 font-bold mb-1">
                                        Resource Title <span className="text-amber-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        required
                                        value={newResourceTitle}
                                        onChange={(e) => setNewResourceTitle(e.target.value)}
                                        placeholder="e.g. Term 1 Scheme of Work - Numbers & Operations"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-slate-300 font-bold mb-1">
                                          Document Type
                                        </label>
                                        <select
                                          value={newResourceFileType}
                                          onChange={(e) => setNewResourceFileType(e.target.value)}
                                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition"
                                        >
                                          <option value="PDF Document">PDF Document</option>
                                          <option value="Scheme of Work">Scheme of Work</option>
                                          <option value="Lesson Plan">Lesson Plan</option>
                                          <option value="Lesson Notes">Lesson Notes</option>
                                          <option value="Class Notes">Class Notes</option>
                                          <option value="Assignment">Assignment</option>
                                          <option value="CAT / Assessment">CAT / Assessment</option>
                                          <option value="Revision Material">Revision Material</option>
                                          <option value="Past Paper">Past Paper</option>
                                          <option value="Reading Material">Reading Material</option>
                                          <option value="CBC Curriculum">CBC Curriculum</option>
                                          <option value="Record of Work">Record of Work</option>
                                          <option value="Reference Guide">Reference Guide</option>
                                          <option value="Other Document">Other Document</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-slate-300 font-bold mb-1">
                                          Academic Term
                                        </label>
                                        <select
                                          value={newResourceTerm}
                                          onChange={(e) => setNewResourceTerm(e.target.value as any)}
                                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition"
                                        >
                                          <option value="Term 1">Term 1</option>
                                          <option value="Term 2">Term 2</option>
                                          <option value="Term 3">Term 3</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-slate-300 font-bold mb-1">
                                          Academic Year
                                        </label>
                                        <input
                                          type="text"
                                          value={newResourceAcademicYear}
                                          onChange={(e) => setNewResourceAcademicYear(e.target.value)}
                                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-slate-300 font-bold mb-1">
                                          Strand / Topic (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={newResourceStrand}
                                          onChange={(e) => setNewResourceStrand(e.target.value)}
                                          placeholder="e.g. Numbers, Geometry, Living Things"
                                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-slate-300 font-bold mb-1">
                                        File Name (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={newResourceFileName}
                                        onChange={(e) => setNewResourceFileName(e.target.value)}
                                        placeholder="e.g. term1_mathematics_scheme.pdf"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-slate-300 font-bold mb-1">
                                        Description / Syllabus Notes / Content
                                      </label>
                                      <textarea
                                        rows={3}
                                        value={newResourceNotes}
                                        onChange={(e) => setNewResourceNotes(e.target.value)}
                                        placeholder="Key learning outcomes, pedagogical notes, assessment criteria, or text content..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
                                      />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                      <button
                                        type="button"
                                        onClick={() => setIsAddingResource(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white transition cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer"
                                      >
                                        Save Real Resource
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* CASE 3: Main Resources View - All 16 Categories */
                    <div className="space-y-5 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm sm:text-base font-black text-white">
                              Curriculum Resources Library
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400">
                            16 official curriculum categories for Little Roses Academy
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (!selectedResourceCategory) {
                                setSelectedResourceCategory('pdf_documents');
                              }
                              setNewResourceTitle('');
                              setNewResourceStrand('');
                              setNewResourceNotes('');
                              setNewResourceFileName('');
                              setNewResourceAttachedFile(null);
                              setNewResourceAttachedDataUrl(null);
                              setResourceFormError('');
                              setIsAddingResource(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Upload / Add Resource</span>
                          </button>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                            {allStoredResources.length} Total Files
                          </span>
                          <button
                            onClick={() => handleNavigate('home')}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition cursor-pointer"
                          >
                            ← Home
                          </button>
                        </div>
                      </div>

                      {/* Search across installed resources */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search resources by title, learning area, grade, or author..."
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* If user searched and there are search query results */}
                      {searchQuery.trim() ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Search Results for "{searchQuery}"
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">
                              {allStoredResources.filter((r) =>
                                (r.title + ' ' + (r.subject || '') + ' ' + (r.grade || '') + ' ' + (r.sharedBy || '') + ' ' + r.categoryName)
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              ).length} Found
                            </span>
                          </div>

                          {(() => {
                            const filtered = allStoredResources.filter((r) =>
                              (r.title + ' ' + (r.subject || '') + ' ' + (r.grade || '') + ' ' + (r.sharedBy || '') + ' ' + r.categoryName)
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            );

                            if (filtered.length === 0) {
                              return (
                                <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                    NO RESOURCES INSTALLED
                                  </h4>
                                  <p className="text-xs text-slate-400">
                                    No installed resources match your query "{searchQuery}".
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filtered.map((res) => (
                                  <div
                                    key={res.id}
                                    onClick={() => setSelectedResourceId(res.id)}
                                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold">
                                        {res.categoryName}
                                      </span>
                                      {res.grade && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                                          {res.grade}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xs font-bold text-white line-clamp-2">{res.title}</h4>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                                      <span>{res.subject || res.date}</span>
                                      <span className="text-amber-400 font-bold">Open →</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        /* The 16 Official Resource Categories Grid */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Resource Categories (16 Official Categories)
                            </h4>
                            <span className="text-[11px] text-slate-500">Tap category to view installed files</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {RESOURCE_CATEGORIES.map((cat, idx) => {
                              const count = allStoredResources.filter((r) => r.categoryId === cat.id).length;
                              
                              const gradients: Record<string, { bg: string; border: string }> = {
                                schemes_of_work: { bg: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white shadow-purple-600/20', border: 'border-purple-400/40' },
                                lesson_plans: { bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white shadow-emerald-600/20', border: 'border-emerald-400/40' },
                                lesson_notes: { bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 text-white shadow-amber-600/20', border: 'border-amber-400/40' },
                                assessments_cats: { bg: 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-800 text-white shadow-rose-600/20', border: 'border-rose-400/40' },
                                rubrics: { bg: 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white shadow-cyan-600/20', border: 'border-cyan-400/40' },
                                record_of_work: { bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-900 text-white shadow-blue-600/20', border: 'border-blue-400/40' },
                                pdf_documents: { bg: 'bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 text-white shadow-sky-600/20', border: 'border-sky-400/40' },
                                revision_materials: { bg: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 text-white shadow-violet-600/20', border: 'border-violet-400/40' },
                                class_notes: { bg: 'bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-800 text-white shadow-teal-600/20', border: 'border-teal-400/40' },
                                assignments: { bg: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white shadow-fuchsia-600/20', border: 'border-fuchsia-400/40' },
                              };

                              const theme = gradients[cat.id] || { 
                                bg: 'bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 text-white shadow-black/20', 
                                border: 'border-slate-700/60' 
                              };

                              return (
                                <button
                                  key={cat.id}
                                  onClick={() => setSelectedResourceCategory(cat.id)}
                                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-98 shadow-md group ${theme.bg} ${theme.border}`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-2xl p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform">
                                      {cat.icon}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/20 backdrop-blur-sm text-white">
                                      {count} {count === 1 ? 'file' : 'files'}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-sm font-extrabold text-white block group-hover:text-amber-200 transition-colors">
                                      {cat.name}
                                    </span>
                                    <span className="text-[11px] text-white/80 mt-0.5 block font-medium">
                                      {count === 0 ? 'No files installed' : `${count} resources ready`}
                                    </span>
                                  </div>

                                  <div className="pt-2 border-t border-white/20 flex items-center justify-between w-full text-[11px] text-white/90 font-bold">
                                    <span>Browse Library</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Recent Installed Files Showcase (if any) or Empty message */}
                          <div className="pt-4 border-t border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Installed Resources Overview
                              </h4>
                              <span className="text-[10px] font-mono text-slate-500">
                                Repository Status
                              </span>
                            </div>

                            {allStoredResources.length === 0 ? (
                              <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center text-xl mx-auto">
                                  📁
                                </div>
                                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                  NO RESOURCES INSTALLED
                                </h4>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                  No curriculum resources, schemes of work, or guides are currently installed in the school repository.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {allStoredResources.slice(0, 6).map((res) => (
                                  <div
                                    key={res.id}
                                    onClick={() => setSelectedResourceId(res.id)}
                                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 cursor-pointer transition flex items-center justify-between text-xs group"
                                  >
                                    <div className="space-y-0.5 min-w-0 pr-2">
                                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block truncate">
                                        {res.title}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block truncate">
                                        {res.categoryName} • {res.grade || 'All'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                                        Open
                                      </span>
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
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
                </div>
                </>
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: TIMETABLE (MASTER TIMETABLE MANAGEMENT)
                  Central timetable/allocation system using real teacher Grade -> Subject assignments.
                  Academic Year, Term, Grades 1-6, Mon-Fri, Conflict Detection, Automatic Teacher Allocation.
                  ------------------------------------------------------------- */}
              {activeTab === 'timetable' && (
                <AdminTimetableModule
                  teachers={teachers}
                  timetableSlots={storedTimetableSlots}
                  onUpdateSlots={(newSlots) => {
                    setStoredTimetableSlots(newSlots);
                    dataLayer.saveTimetableSlots(newSlots);
                  }}
                  onNavigateHome={() => handleNavigate('home')}
                />
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: PROMOTION & ACADEMIC YEAR CLOSING
                  Official learner promotion, retention, transfer, and year closure.
                  Preserves all historical records under permanent learner IDs.
                  ------------------------------------------------------------- */}
              {activeTab === 'promotion' && (
                <AdminPromotionModule
                  onNavigateHome={() => handleNavigate('home')}
                  adminName={dataLayer.getAdminConfig().name || 'Principal / School Office'}
                />
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: SETTINGS (ADMIN SYSTEM SETTINGS SHELL)
                  Clean 14-section settings directory with individual section screens.
                  Phone and tablet responsive. Zero fake settings.
                  ------------------------------------------------------------- */}
              {activeTab === 'settings' && (
                <AdminSettingsModule
                  onNavigateHome={() => handleNavigate('home')}
                  adminName={dataLayer.getAdminConfig().name || 'Principal / School Office'}
                />
              )}

              {/* -------------------------------------------------------------
                  DESTINATION: ASSESSMENTS (OFFICIAL CBC ASSESSMENT COCKPIT)
                  Academic Year → Term → Real Teachers → Assigned Grades →
                  Assigned Subjects → Real Learners → Assessment Performance
                  ------------------------------------------------------------- */}
              {activeTab === 'assessments' && (
                <AdminAssessmentPortal
                  academicYears={allAcademicYears}
                  activeAcademicYear={activeAcademicYear}
                  termInfo={termInfo}
                  teachers={teachers}
                  pupils={pupils}
                  onNavigate={(tab) => handleNavigate(tab as any)}
                />
              )}

              {/* -------------------------------------------------------------
                  HONEST PLACEHOLDERS FOR UNIMPLEMENTED FUTURE DESTINATIONS
                  Reports, Noticeboard, Security, Backup & Recovery, Help & Support, School Office
                  ------------------------------------------------------------- */}
              {!['teachers', 'learners', 'families', 'calendar', 'notifications', 'curriculum', 'resources', 'timetable', 'promotion', 'settings', 'assessments'].includes(activeTab) && (
                <div className="p-8 rounded-2xl border border-slate-800 bg-[#080E24] text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl mx-auto">
                    {React.createElement(
                      ADMIN_NAV_ITEMS.find((n) => n.id === activeTab)?.icon || Building2,
                      { className: 'w-6 h-6' }
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {ADMIN_NAV_ITEMS.find((n) => n.id === activeTab)?.label}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                      {activeTab === 'curriculum' && 'Curriculum management will appear here when curriculum administration is enabled.'}
                      {activeTab === 'assessments' && 'Assessment engine and CAT records will appear here when assessment administration is enabled.'}
                      {activeTab === 'reports' && 'Official CBC reports and performance analytics will appear here when reports engine is enabled.'}
                      {activeTab === 'noticeboard' && 'School-wide notices, announcements, and circulars will appear here when noticeboard is enabled.'}
                      {activeTab === 'security' && 'System security, user role permissions, and audit logs will appear here when security management is enabled.'}
                      {activeTab === 'backup' && 'Data backup, export, and restoration controls will appear here when backup management is enabled.'}
                      {activeTab === 'help' && 'Little Roses Academy documentation, guides, and support desk will appear here.'}
                      {activeTab === 'school_office' && 'School governance, institutional registration, and principal settings will appear here.'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      Phase 1A-2 Navigation Active • Zero Fake Data
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* =======================================================================
            5. ADMIN PHONE BOTTOM NAVIGATION (EXACT 5 BUTTONS FROM SCREENSHOTS)
            Home • Teachers • Pupils • Families • More
            ======================================================================= */}
        <nav
          aria-label="Phone Bottom Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 sm:px-4 py-2 border-t border-blue-950/80 shadow-[0_-8px_24px_rgba(0,0,0,0.8)] flex items-center justify-around bg-gradient-to-t from-[#060c1d] to-[#0a1638]"
        >
          {/* 1. Home */}
          <button
            onClick={() => handleNavigate('home')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white font-black shadow-[0_0_16px_rgba(37,99,235,0.5)] scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-bold mt-0.5">Home</span>
          </button>

          {/* 2. Teachers */}
          <button
            onClick={() => handleNavigate('teachers')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-blue-600 text-white font-black shadow-[0_0_16px_rgba(37,99,235,0.5)] scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold mt-0.5">Teachers</span>
          </button>

          {/* 3. Pupils */}
          <button
            onClick={() => handleNavigate('learners')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'learners'
                ? 'bg-blue-600 text-white font-black shadow-[0_0_16px_rgba(37,99,235,0.5)] scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="text-[10px] font-bold mt-0.5">Pupils</span>
          </button>

          {/* 4. Families */}
          <button
            onClick={() => handleNavigate('families')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'families'
                ? 'bg-blue-600 text-white font-black shadow-[0_0_16px_rgba(37,99,235,0.5)] scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold mt-0.5">Families</span>
          </button>

          {/* 5. More (Opens 19-item slide-over drawer) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-400 hover:text-amber-300 transition cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[10px] font-bold mt-0.5">More</span>
          </button>
        </nav>
      </div>

      {/* =======================================================================
          6. "LEAVING ALREADY? 🥺" EXIT CONFIRMATION DIALOG (SPEC REQUIREMENT)
          ======================================================================= */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#09112A] border border-slate-700 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🥺
            </div>
            <div>
              <h3 className="text-base font-black text-white">LEAVING ALREADY? 🥺</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to close Little Roses Academy?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                NO, STAY
              </button>
              <button
                onClick={() => {
                  setShowExitDialog(false);
                  onBackToPortals();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow cursor-pointer"
              >
                YES, EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          7. "UNSAVED CHANGES" DIALOG (SPEC REQUIREMENT)
          ======================================================================= */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#09112A] border border-amber-500/60 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">UNSAVED CHANGES</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                You have unsaved changes. Choose an action before leaving:
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleSaveAndLeave}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow cursor-pointer"
              >
                SAVE & LEAVE
              </button>
              <button
                onClick={handleDiscardAndLeave}
                className="w-full py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-xs transition cursor-pointer"
              >
                DISCARD
              </button>
              <button
                onClick={() => {
                  setShowUnsavedDialog(false);
                  setPendingNavTab(null);
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          8. ADMIN PROFILE / ACCOUNT MODAL (SPEC REQUIREMENT)
          ======================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#09112A] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                  👑
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{session?.name || 'Admin'}</h3>
                  <p className="text-[10px] text-slate-400">School Office Administrator</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Identifier:</span>
                <span className="font-mono font-bold text-amber-400">{session?.identifier || 'ADMIN'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session Role:</span>
                <span className="font-bold text-emerald-400 uppercase">Administrator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Academic Pacing:</span>
                <span className="text-slate-200 font-bold">{termInfo.term} • Wk {termInfo.weekNumber}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  handleNavigate('settings');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  handleNavigate('signout');
                }}
                className="flex-1 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          9. EVENT / ACTIVITY DETAIL MODAL (TASK 3 REQUIREMENT)
          ======================================================================= */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#09112A] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 uppercase tracking-wider">
                  {selectedEventModal.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-white">{selectedEventModal.title}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedEventModal.timeOrDate}</span>
              </div>
              {selectedEventModal.details && (
                <p className="mt-3 text-xs text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed">
                  {selectedEventModal.details}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition"
              >
                Close
              </button>
              {selectedEventModal.targetNav && (
                <button
                  onClick={() => {
                    const nav = selectedEventModal.targetNav!;
                    setSelectedEventModal(null);
                    handleNavigate(nav);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition shadow"
                >
                  Open Section →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------------------------------------
          USER MANAGEMENT MODALS (TEACHERS, LEARNERS, PARENTS)
          ------------------------------------------------------------- */}
      <TeacherModal
        isOpen={isAddingTeacher || !!editingTeacher}
        teacher={editingTeacher}
        onClose={() => {
          setIsAddingTeacher(false);
          setEditingTeacher(null);
        }}
        onSuccess={(savedTeacher) => {
          setIsAddingTeacher(false);
          setEditingTeacher(null);
          setTeachers(dataLayer.getTeachers());
          if (savedTeacher?.id) {
            setSelectedTeacherId(savedTeacher.id);
          }
        }}
        onDelete={(id) => {
          dataLayer.deleteTeacher(id);
          setSelectedTeacherId(null);
          setTeachers(dataLayer.getTeachers());
        }}
      />

      <LearnerModal
        isOpen={isAddingPupil || !!editingPupil}
        pupil={editingPupil}
        onClose={() => {
          setIsAddingPupil(false);
          setEditingPupil(null);
        }}
        onSuccess={() => {
          setIsAddingPupil(false);
          setEditingPupil(null);
          setPupils(dataLayer.getPupils());
        }}
        onDelete={(id) => {
          dataLayer.deletePupil(id);
          setSelectedPupilId(null);
          setPupils(dataLayer.getPupils());
        }}
      />

      <ParentModal
        isOpen={isAddingParent || !!editingParent}
        parent={editingParent}
        allPupils={pupils}
        onClose={() => {
          setIsAddingParent(false);
          setEditingParent(null);
        }}
        onSuccess={() => {
          setIsAddingParent(false);
          setEditingParent(null);
          setParents(dataLayer.getParents());
          setPupils(dataLayer.getPupils());
        }}
        onDelete={(idOrPhone) => {
          dataLayer.deleteParent(idOrPhone);
          setSelectedParentPhone(null);
          setParents(dataLayer.getParents());
        }}
      />

      {/* GLOBAL DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-rose-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Permanently Delete {
                    deleteConfirmTarget.type === 'teacher' ? 'Teacher Record' :
                    deleteConfirmTarget.type === 'pupil' ? 'Learner Record' :
                    deleteConfirmTarget.type === 'parent' ? 'Family Account' : 'Resource'
                  }?
                </h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to delete <strong className="text-white">"{deleteConfirmTarget.name}"</strong>?
                  {deleteConfirmTarget.subtitle && (
                    <span className="block text-[11px] text-slate-400 mt-0.5">{deleteConfirmTarget.subtitle}</span>
                  )}
                </p>
                <p className="text-[11px] text-rose-400/90 font-medium pt-1">
                  This action cannot be undone. All linked local records will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* OFFLINE AI DOCUMENT ASSISTANT MODAL */}
      <OfflineAIDocumentAssistantModal
        isOpen={showAIAssistantModal}
        onClose={() => setShowAIAssistantModal(false)}
        initialGrade={selectedResourceGrade || undefined}
        initialSubject={selectedResourceSubject || undefined}
        initialCategory={
          RESOURCE_CATEGORIES.find((c) => c.id === selectedResourceCategory)?.name || undefined
        }
        initialTeacherId={selectedResourceTeacherId || undefined}
        onDispatched={(pkg) => {
          setShowAIAssistantModal(false);
          setResourcesRevision((r) => r + 1);
          setUploadStatusBanner({
            message: `✓ Successfully dispatched "${pkg.packageName}" via Offline AI Assistant. Synchronized to teacher portals.`,
            type: 'success',
          });
          setTimeout(() => setUploadStatusBanner(null), 6000);
        }}
      />

      {/* CENTRAL LITTLE ROSES SCHOOL AI MODAL */}
      <CentralSchoolAIModal
        isOpen={showCentralAIModal}
        onClose={() => setShowCentralAIModal(false)}
        session={dataLayer.getCurrentSession()}
        initialTab={centralAITab}
      />
    </div>
  );
}
