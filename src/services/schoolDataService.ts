/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeacherRecord {
  id: string;
  name: string;
  phone: string;
  password?: string;
  assignedGrade?: string;
  assignedGrades: string[];
  tier: 'lower' | 'upper' | 'both';
  subjects: string[];
  gradeSubjects?: Record<string, string[]>; // Grade-specific subject allocations e.g. { 'Grade 1': ['English Activities'], 'Grade 4': ['English', 'Science'] }
  avatarUrl?: string; // Passport photo / DP
  isDualAdmin?: boolean; // Can switch between School Office and Teacher (Mr. Elvis, Tr. Kelvin)
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
  grade: string;
  upi: string;
  parentName: string;
  parentPhone: string;
  pin: string;
  parentPassword: string;
  avatarUrl?: string; // DP / passport photo
  statusRingColor?: string;
  academicStanding?: 'On Track' | 'Needs Support' | 'Excelling';
  siblingGroupConfirmed?: boolean;
}

export interface SiblingGroup {
  parentPhone: string;
  parentName: string;
  pupils: PupilRecord[];
  isConfirmed: boolean;
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
  fileUrl?: string; // base64 or link
  notes?: string;
  fileSize?: string;
}

// Initial seed teachers: 2 Mr. Elvis teachers + Tr. Kelvin with Dual Admin privilege
export const DEFAULT_OFFICE_TEACHERS: TeacherRecord[] = [
  {
    id: 't-elvis',
    name: 'Mr. Elvis Kiiru',
    phone: '0712345678',
    password: 'LRA4.@2025',
    assignedGrades: ['Grade 5', 'Grade 6'],
    assignedGrade: 'Grade 5, Grade 6',
    tier: 'upper',
    subjects: ['English', 'Science and Technology'],
    gradeSubjects: {
      'Grade 5': ['English', 'Science and Technology'],
      'Grade 6': ['English', 'Science and Technology']
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    isDualAdmin: true,
    pedagogicalAudit: {
      timetableLessonsMarked: true,
      assignmentsUploaded: true,
      cbc30MarkScoresEntered: true
    }
  },
  {
    id: 't-elvis-2',
    name: 'Mr. Elvis',
    phone: '0711121142',
    password: 'LRA4.@2025',
    assignedGrades: ['Grade 4', 'Grade 5'],
    assignedGrade: 'Grade 4, Grade 5',
    tier: 'upper',
    subjects: ['Mathematics', 'Creative Arts'],
    gradeSubjects: {
      'Grade 4': ['Mathematics', 'Creative Arts'],
      'Grade 5': ['Mathematics']
    },
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80',
    isDualAdmin: true,
    pedagogicalAudit: {
      timetableLessonsMarked: true,
      assignmentsUploaded: true,
      cbc30MarkScoresEntered: true
    }
  },
  {
    id: 't-kelvin',
    name: 'Tr. Kelvin',
    phone: '0722001122',
    password: 'LRA4.@2025',
    assignedGrades: ['Grade 4', 'Grade 5'],
    assignedGrade: 'Grade 4, Grade 5',
    tier: 'upper',
    subjects: ['Social Studies', 'Creative Arts'],
    gradeSubjects: {
      'Grade 4': ['Social Studies'],
      'Grade 5': ['Creative Arts']
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    isDualAdmin: true,
    pedagogicalAudit: {
      timetableLessonsMarked: true,
      assignmentsUploaded: true,
      cbc30MarkScoresEntered: true
    }
  },
  {
    id: 't-mary',
    name: 'Tr. Mary Wanjiku',
    phone: '0720112233', // Matches parent of Brian Kamau / Mama Brian
    password: 'LRA4.@2025',
    assignedGrades: ['Grade 1', 'Grade 2'],
    assignedGrade: 'Grade 1, Grade 2',
    tier: 'lower',
    subjects: ['Mathematics Activities', 'Social Studies', 'Environmental Activities'],
    gradeSubjects: {
      'Grade 1': ['Mathematics Activities', 'Social Studies'],
      'Grade 2': ['Environmental Activities', 'Social Studies']
    },
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    isDualAdmin: false,
    pedagogicalAudit: {
      timetableLessonsMarked: true,
      assignmentsUploaded: true,
      cbc30MarkScoresEntered: false
    }
  }
];

export const DEFAULT_SHARED_DOCS: AdminSharedDocument[] = [
  {
    id: 'doc-1',
    title: 'Grade 5 English CBC Approved Syllabus',
    fileName: 'Grade 5 English Syllabus.pdf',
    fileType: 'pdf',
    category: 'Syllabus',
    date: '15 Apr 2026',
    targetGrade: 'Grade 5',
    sharedBy: 'Mr. Elvis Kiiru • Administration',
    fileSize: '1.4 MB',
    notes: 'KICD Approved curriculum design for Upper Primary English.'
  },
  {
    id: 'doc-2',
    title: 'Official CBC 30-Mark Assessment Guidelines (QASO Standard)',
    fileName: 'CBC 30-Mark Assessment Guidelines.pdf',
    fileType: 'pdf',
    category: 'Assessment Guide',
    date: '10 Apr 2026',
    targetGrade: 'All Classes',
    sharedBy: 'Administration Office',
    fileSize: '820 KB',
    notes: '10 marks assignments + 20 marks CAT standard for termly records.'
  },
  {
    id: 'doc-3',
    title: 'Term 1 Academic Pacing & Activity Circular',
    fileName: 'Term 1 Circular 2026.pdf',
    fileType: 'pdf',
    category: 'Circular',
    date: '08 Apr 2026',
    targetGrade: 'All Classes',
    sharedBy: 'Head Teacher • Little Roses Academy',
    fileSize: '450 KB',
    notes: 'Instructions on school activities, sports breaks, and exam pacing.'
  }
];

// Helper to clean phone numbers for accurate matching
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

// Get all registered teachers from administration storage
export function getRegisteredTeachers(): TeacherRecord[] {
  try {
    const saved = localStorage.getItem('lra_office_teachers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: any) => ({
          ...t,
          assignedGrades: Array.isArray(t.assignedGrades) && t.assignedGrades.length > 0
            ? t.assignedGrades
            : (t.assignedGrade ? t.assignedGrade.split(',').map((s: string) => s.trim()) : ['Grade 1']),
          isDualAdmin: t.isDualAdmin !== undefined 
            ? t.isDualAdmin 
            : (t.name?.toUpperCase().includes('ELVIS') || t.name?.toUpperCase().includes('KELVIN'))
        }));
      }
    }
  } catch (e) {
    console.error('Error reading teachers:', e);
  }
  // Initialize with default teachers if empty
  localStorage.setItem('lra_office_teachers', JSON.stringify(DEFAULT_OFFICE_TEACHERS));
  return DEFAULT_OFFICE_TEACHERS;
}

export function saveRegisteredTeachers(teachers: TeacherRecord[]): void {
  localStorage.setItem('lra_office_teachers', JSON.stringify(teachers));
}

// Find a teacher by registered phone number or exact name
export function findTeacherByPhoneOrName(identifier: string): TeacherRecord | null {
  const teachers = getRegisteredTeachers();
  const cleanId = normalizePhone(identifier);
  const lowerId = identifier.trim().toLowerCase();

  return (
    teachers.find((t) => {
      const cleanTeacherPhone = normalizePhone(t.phone);
      if (cleanId && cleanTeacherPhone && (cleanTeacherPhone === cleanId || cleanTeacherPhone.endsWith(cleanId) || cleanId.endsWith(cleanTeacherPhone))) {
        return true;
      }
      if (lowerId && t.name.toLowerCase().includes(lowerId)) {
        return true;
      }
      return false;
    }) || null
  );
}

// Check if a teacher's phone number matches a parent's phone of any pupil
export function checkTeacherIsParent(teacherPhone: string): {
  isParent: boolean;
  linkedChildren: { name: string; grade: string; upi: string; parentName: string }[];
} {
  const cleanTeacherPhone = normalizePhone(teacherPhone);
  if (!cleanTeacherPhone) return { isParent: false, linkedChildren: [] };

  let pupils: PupilRecord[] = [];
  try {
    const officePupils = localStorage.getItem('lra_office_pupils');
    const teacherPupils = localStorage.getItem('lra_teacher_pupils');
    if (officePupils) {
      pupils = JSON.parse(officePupils);
    } else if (teacherPupils) {
      pupils = JSON.parse(teacherPupils);
    }
  } catch (e) {
    console.error('Error reading pupils for parent check:', e);
  }

  // Also include the default pupils if none in localStorage
  if (pupils.length === 0) {
    pupils = [
      {
        id: 'p-1',
        name: 'Brian Kamau',
        gender: 'Boy',
        grade: 'Grade 4',
        upi: 'LRA-2026-0042',
        parentName: 'Mama Brian (Mary Wanjiku)',
        parentPhone: '0720112233',
        pin: '123',
        parentPassword: '4455'
      },
      {
        id: 'p-2',
        name: 'Faith Achieng',
        gender: 'Girl',
        grade: 'Grade 5',
        upi: 'LRA-2026-0043',
        parentName: 'Mr. Elvis Kiiru',
        parentPhone: '0712345678',
        pin: '234',
        parentPassword: '1122'
      }
    ];
  }

  const linked = pupils.filter((p) => {
    const cleanParentPhone = normalizePhone(p.parentPhone);
    return (
      cleanParentPhone &&
      (cleanParentPhone === cleanTeacherPhone ||
        cleanParentPhone.endsWith(cleanTeacherPhone) ||
        cleanTeacherPhone.endsWith(cleanParentPhone))
    );
  });

  return {
    isParent: linked.length > 0,
    linkedChildren: linked.map((p) => ({
      name: p.name,
      grade: p.grade,
      upi: p.upi,
      parentName: p.parentName
    }))
  };
}

// WhatsApp-style session lock-in: Remember authenticated teacher
const TEACHER_SESSION_KEY = 'lra_remembered_teacher_session';

export function getRememberedTeacherSession(): TeacherRecord | null {
  try {
    const saved = localStorage.getItem(TEACHER_SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Re-verify against latest teachers list from admin to reflect any profile edits!
      const currentTeachers = getRegisteredTeachers();
      const fresh = currentTeachers.find((t) => t.id === parsed.id || normalizePhone(t.phone) === normalizePhone(parsed.phone));
      if (fresh) return fresh;
      return parsed;
    }
  } catch (e) {
    console.error('Error reading remembered teacher session:', e);
  }
  return null;
}

export function saveRememberedTeacherSession(teacher: TeacherRecord | null): void {
  if (!teacher) {
    localStorage.removeItem(TEACHER_SESSION_KEY);
  } else {
    localStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(teacher));
  }
}

// Admin Document / PDF Sharing to Teachers
const SHARED_DOCS_KEY = 'lra_shared_admin_docs';

export function getSharedAdminDocuments(): AdminSharedDocument[] {
  try {
    const saved = localStorage.getItem(SHARED_DOCS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading shared documents:', e);
  }
  localStorage.setItem(SHARED_DOCS_KEY, JSON.stringify(DEFAULT_SHARED_DOCS));
  return DEFAULT_SHARED_DOCS;
}

export function saveSharedAdminDocuments(docs: AdminSharedDocument[]): void {
  localStorage.setItem(SHARED_DOCS_KEY, JSON.stringify(docs));
}

export function addSharedAdminDocument(doc: Omit<AdminSharedDocument, 'id'>): AdminSharedDocument {
  const current = getSharedAdminDocuments();
  const newDoc: AdminSharedDocument = {
    ...doc,
    id: `doc-${Date.now()}`
  };
  const updated = [newDoc, ...current];
  saveSharedAdminDocuments(updated);
  return newDoc;
}

// AI Smart Sibling Detection Engine
// Scans phone numbers and detects groups of learners sharing the exact same parent phone
export function detectSiblingGroups(pupils: PupilRecord[]): SiblingGroup[] {
  const map = new Map<string, PupilRecord[]>();
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
        isConfirmed: list.every((p) => p.siblingGroupConfirmed)
      });
    }
  });

  return groups;
}

