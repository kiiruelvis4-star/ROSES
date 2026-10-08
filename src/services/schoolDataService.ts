/**
 * Little Roses Academy - School Data Service
 * Teachers, Shared Admin Documents, Sibling Detection, and Data Normalization
 */

export interface TeacherRecord {
  id: string;
  name: string;
  phone: string;
  password?: string;
  subjects: string[];
  assignedGrades: string[];
  assignedGrade?: string;
  gradeAssignments?: Record<string, string[]>;
  gradeSubjectAssignments?: Array<{ grade: string; subjects: string[] }>;
  tier: 'lower' | 'upper' | 'all';
  isClassTeacher: boolean;
  classTeacherGrade?: string;
  isAdminDualRole?: boolean;
  isDualAdmin?: boolean;
  photoUrl?: string;
  avatarUrl?: string;
  lessonsTaughtCount?: number;
  assignmentsUploaded?: boolean;
  marksEntered?: boolean;
}

export interface AdminSharedDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx';
  category: 'Syllabus' | 'Circular' | 'Assessment Guide' | 'Scheme of Work';
  date: string;
  targetGrade: string;
  sharedBy: string;
  fileUrl?: string;
  notes?: string;
  fileSize?: string;
}

export interface SiblingGroup {
  parentPhone: string;
  parentName: string;
  pupils: any[];
  isConfirmed: boolean;
}

export const DEFAULT_OFFICE_TEACHERS: TeacherRecord[] = [
  {
    id: 't-elvis',
    name: 'Mr. Elvis Kiiru',
    phone: '0702080186',
    subjects: ['Mathematics', 'English Language Activities', 'Science and Technology'],
    assignedGrades: ['Grade 4', 'Grade 5'],
    gradeAssignments: {
      'Grade 4': ['Mathematics', 'English Language Activities'],
      'Grade 5': ['Mathematics', 'Science and Technology'],
    },
    gradeSubjectAssignments: [
      { grade: 'Grade 4', subjects: ['Mathematics', 'English Language Activities'] },
      { grade: 'Grade 5', subjects: ['Mathematics', 'Science and Technology'] },
    ],
    tier: 'upper',
    isClassTeacher: true,
    classTeacherGrade: 'Grade 4',
    isAdminDualRole: true,
    lessonsTaughtCount: 38,
    assignmentsUploaded: true,
    marksEntered: true,
  },
  {
    id: 't-mary',
    name: 'Tr. Mary Wanjiku',
    phone: '0722123456',
    subjects: ['Mathematical Activities', 'Kiswahili Language Activities', 'Religious Education (CRE)'],
    assignedGrades: ['Grade 2', 'Grade 3'],
    gradeAssignments: {
      'Grade 2': ['Mathematical Activities', 'Kiswahili Language Activities'],
      'Grade 3': ['Mathematical Activities', 'Religious Education (CRE)'],
    },
    gradeSubjectAssignments: [
      { grade: 'Grade 2', subjects: ['Mathematical Activities', 'Kiswahili Language Activities'] },
      { grade: 'Grade 3', subjects: ['Mathematical Activities', 'Religious Education (CRE)'] },
    ],
    tier: 'lower',
    isClassTeacher: true,
    classTeacherGrade: 'Grade 3',
    isAdminDualRole: false,
    lessonsTaughtCount: 42,
    assignmentsUploaded: true,
    marksEntered: true,
  },
  {
    id: 't-kelvin',
    name: 'Tr. Kelvin Otieno',
    phone: '0733987654',
    subjects: ['Agriculture and Nutrition', 'Science and Technology', 'Social Studies'],
    assignedGrades: ['Grade 5', 'Grade 6'],
    gradeAssignments: {
      'Grade 5': ['Agriculture and Nutrition', 'Social Studies'],
      'Grade 6': ['Science and Technology', 'Social Studies'],
    },
    gradeSubjectAssignments: [
      { grade: 'Grade 5', subjects: ['Agriculture and Nutrition', 'Social Studies'] },
      { grade: 'Grade 6', subjects: ['Science and Technology', 'Social Studies'] },
    ],
    tier: 'upper',
    isClassTeacher: true,
    classTeacherGrade: 'Grade 6',
    isAdminDualRole: true,
    lessonsTaughtCount: 35,
    assignmentsUploaded: true,
    marksEntered: true,
  },
];

export const DEFAULT_SHARED_DOCS: AdminSharedDocument[] = [];

const TEACHERS_KEY = 'lra_office_teachers';
const TEACHER_SESSION_KEY = 'lra_remembered_teacher_session';
const SHARED_DOCS_KEY = 'lra_shared_admin_docs';

export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return '0' + cleaned.slice(3);
  }
  return cleaned;
}

export function getOfficeTeachers(): TeacherRecord[] {
  try {
    const saved = localStorage.getItem(TEACHERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(DEFAULT_OFFICE_TEACHERS));
  return DEFAULT_OFFICE_TEACHERS;
}

export const getRegisteredTeachers = getOfficeTeachers;

export function findTeacherByPhoneOrName(query: string): TeacherRecord | null {
  const teachers = getOfficeTeachers();
  const cleanQ = query.trim().toLowerCase();
  const cleanPhone = normalizePhone(query);
  return (
    teachers.find(
      (t) =>
        t.name.toLowerCase().includes(cleanQ) ||
        (cleanPhone && normalizePhone(t.phone) === cleanPhone)
    ) || null
  );
}

export function checkTeacherIsParent(teacherPhone: string, parents?: any[]): { isParent: boolean; linkedChildren: any[] } {
  const clean = normalizePhone(teacherPhone);
  const pList = parents || [];
  let matched = pList.find((p) => normalizePhone(p.parentPhone) === clean);
  if (!matched) {
    try {
      const savedPupils = localStorage.getItem('lra_db_pupils') || localStorage.getItem('lra_office_pupils');
      if (savedPupils) {
        const pupils = JSON.parse(savedPupils);
        const children = pupils.filter((p: any) => normalizePhone(p.parentPhone) === clean);
        if (children.length > 0) {
          return { isParent: true, linkedChildren: children };
        }
      }
    } catch {}
  }
  return {
    isParent: !!matched,
    linkedChildren: matched ? (matched.linkedChildren || matched.pupils || []) : [],
  };
}

export function saveOfficeTeachers(teachers: TeacherRecord[]): void {
  try {
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
  } catch {}
}

export function getRememberedTeacherSession(): TeacherRecord | null {
  try {
    const saved = localStorage.getItem(TEACHER_SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function setRememberedTeacherSession(teacher: TeacherRecord | null): void {
  try {
    if (!teacher) {
      localStorage.removeItem(TEACHER_SESSION_KEY);
    } else {
      localStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(teacher));
    }
  } catch {}
}

export const saveRememberedTeacherSession = setRememberedTeacherSession;

export function getSharedAdminDocuments(): AdminSharedDocument[] {
  try {
    const saved = localStorage.getItem(SHARED_DOCS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return DEFAULT_SHARED_DOCS;
}

export function saveSharedAdminDocuments(docs: AdminSharedDocument[]): void {
  try {
    localStorage.setItem(SHARED_DOCS_KEY, JSON.stringify(docs));
  } catch {}
}

export function addSharedAdminDocument(doc: Omit<AdminSharedDocument, 'id'>): AdminSharedDocument {
  const current = getSharedAdminDocuments();
  const newDoc: AdminSharedDocument = {
    ...doc,
    id: `doc-${Date.now()}`,
  };
  const updated = [newDoc, ...current];
  saveSharedAdminDocuments(updated);
  return newDoc;
}

export function detectSiblingGroups(pupils: any[]): SiblingGroup[] {
  const map = new Map<string, any[]>();
  pupils.forEach((p) => {
    const clean = normalizePhone(p.parentPhone);
    if (!clean || clean.length < 5) return;
    if (!map.has(clean)) map.set(clean, []);
    map.get(clean)!.push(p);
  });

  const groups: SiblingGroup[] = [];
  map.forEach((list, phone) => {
    if (list.length >= 2) {
      groups.push({
        parentPhone: phone,
        parentName: list[0].parentName || 'Parent',
        pupils: list,
        isConfirmed: list.every((p) => p.siblingGroupConfirmed),
      });
    }
  });

  return groups;
}
