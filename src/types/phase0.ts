/**
 * Little Roses Academy (LRA) - Phase 0 Foundation Types
 * 
 * Motto: MUCH FROM LITTLE
 * Pillars: LEARN • LOVE • LEAD
 * Tagline: LEARN TODAY BUILD TOMORROW
 * 
 * PHASE 0 RULES:
 * - Permanent IDs for every major entity
 * - Academic Year & Term models (no hardcoded dates)
 * - Grade 1-6 model (no Grade 7+, no streams)
 * - Curriculum data architecture (distinction between structure and content)
 * - Central Subject Colour System (Grades 1-3 vs 4-6)
 * - Central Assessment Colour System (EE, ME, AE, BE)
 * - Theme System (LIGHT, DARK, SYSTEM)
 * - RBAC & Permissions for the 4 Portals (ADMIN, TEACHER, LEARNER, PARENT)
 * - ZERO fake/demo data
 */

export type Role = 'ADMIN' | 'TEACHER' | 'LEARNER' | 'PARENT';

export type PortalType = 'ADMIN' | 'TEACHER' | 'LEARNER' | 'PARENT';

export type ThemePreference = 'light' | 'dark' | 'system';

// ==========================================
// 1. PERMANENT IDENTIFIERS
// ==========================================
export type SchoolId = string;
export type UserId = string;
export type TeacherId = string;
export type LearnerId = string;
export type ParentId = string;
export type FamilyId = string;
export type ResourceId = string;
export type CurriculumId = string;
export type AcademicYearId = string;
export type TermId = string;
export type GradeId = string;
export type SubjectId = string;
export type AssessmentId = string;
export type AssignmentId = string;
export type RecordOfWorkId = string;
export type NotificationId = string;
export type MessageId = string;
export type AuditLogId = string;
export type OperationId = string;

// ==========================================
// 2. CORE INSTITUTION MODEL
// ==========================================
export interface SchoolInfo {
  schoolId: SchoolId;
  name: string;
  motto: string; // MUCH FROM LITTLE
  pillars: string[]; // LEARN, LOVE, LEAD
  tagline: string; // LEARN TODAY BUILD TOMORROW
  county: string; // Nakuru
  country: string; // Kenya
  systemType: 'CBC';
  establishedYear: number;
}

// ==========================================
// 3. ACADEMIC YEAR FOUNDATION
// ==========================================
export type AcademicYearStatus = 'planning' | 'active' | 'archived';

export interface AcademicYear {
  id: AcademicYearId;
  year: number; // e.g. 2026, 2027, 2028
  status: AcademicYearStatus;
  startDate: string; // ISO date string, empty until configured
  endDate: string; // ISO date string, empty until configured
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. TERM FOUNDATION
// ==========================================
export type TermName = 'TERM 1' | 'TERM 2' | 'TERM 3';
export type TermStatus = 'upcoming' | 'active' | 'completed';

export interface Term {
  id: TermId;
  academicYearId: AcademicYearId;
  name: TermName;
  startDate: string; // ISO date string, empty until configured
  endDate: string; // ISO date string, empty until configured
  status: TermStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. GRADE FOUNDATION (Grades 1-6 Only)
// ==========================================
export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type PrimaryStage = 'lower_primary' | 'upper_primary';

export interface Grade {
  id: GradeId;
  level: GradeLevel;
  name: string; // 'Grade 1' ... 'Grade 6'
  stage: PrimaryStage;
  isEnabled: boolean;
}

// ==========================================
// 6. SUBJECT COLOUR SYSTEM
// ==========================================
export interface SubjectColorDef {
  key: string;
  name: string;
  stage: PrimaryStage;
  // Visual hex values & Tailwind utility classes
  colorName: string;
  primaryHex: string;
  lightBg: string;
  lightText: string;
  lightBorder: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
  badgeBgLight: string;
  badgeTextLight: string;
  badgeBgDark: string;
  badgeTextDark: string;
}

export interface SubjectConfig {
  id: SubjectId;
  code: string;
  name: string;
  stage: PrimaryStage;
  applicableGrades: GradeLevel[];
  colorKey: string;
  isCore: boolean;
  isEnabled: boolean;
}

// ==========================================
// 7. ASSESSMENT PERFORMANCE COLOUR SYSTEM
// ==========================================
export type PerformanceBand = 'EE' | 'ME' | 'AE' | 'BE';

export interface AssessmentBandConfig {
  band: PerformanceBand;
  label: string; // EXCEEDING EXPECTATIONS, etc.
  description: string;
  minPercent: number;
  maxPercent: number;
  colorName: string;
  hex: string;
  lightBg: string;
  lightText: string;
  darkBg: string;
  darkText: string;
}

// ==========================================
// 8. CURRICULUM ARCHITECTURE (Hierarchy Structure Only)
// ==========================================
export interface LearningOutcome {
  id: string;
  code: string;
  description: string;
}

export interface SubStrand {
  id: string;
  code: string;
  title: string;
  outcomes: LearningOutcome[];
}

export interface Strand {
  id: string;
  code: string;
  title: string;
  subStrands: SubStrand[];
}

export interface CurriculumSubjectNode {
  subjectId: SubjectId;
  subjectName: string;
  stage: PrimaryStage;
  strands: Strand[];
}

export interface CurriculumGradeNode {
  gradeLevel: GradeLevel;
  subjects: CurriculumSubjectNode[];
}

export interface CurriculumVersion {
  id: CurriculumId;
  academicYearId: AcademicYearId;
  versionName: string;
  framework: 'KICD_CBC';
  status: 'draft' | 'active' | 'archived';
  grades: CurriculumGradeNode[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 9. USERS, PROFILES & PERMANENT ENTITIES
// ==========================================
export interface User {
  id: UserId;
  schoolId: SchoolId;
  role: Role;
  identifier: string; // Admin code, Phone number, or Learner UPI
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string; // SHA-256 salted hash, NEVER plaintext
  salt: string;
  failedLoginAttempts: number;
  lockedUntil?: string; // ISO date for rate limiting
  biometricCredentialId?: string; // WebAuthn credential ID if registered
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: TeacherId;
  userId: UserId;
  employeeNumber: string;
  assignedGrades: GradeLevel[];
  assignedSubjectIds: SubjectId[];
  isClassTeacherOfGrade?: GradeLevel;
  active: boolean;
  createdAt: string;
}

export interface LearnerProfile {
  id: LearnerId; // Permanent learnerId stays unchanged throughout schooling
  userId: UserId;
  upi: string; // Official CBC UPI: e.g. LRA-2026-0001
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  currentGrade: GradeLevel;
  dateOfAdmission: string;
  familyId?: FamilyId;
  parentId?: ParentId;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id: ParentId;
  userId: UserId;
  phone: string;
  fullName: string;
  relationship: string;
  learnerIds: LearnerId[]; // Same learnerId shared across portals!
  familyId: FamilyId;
  active: boolean;
  createdAt: string;
}

// ==========================================
// 10. SESSION & RBAC
// ==========================================
export type Permission =
  | 'system:manage'
  | 'curriculum:configure'
  | 'academics:manage'
  | 'users:manage'
  | 'audit:view'
  | 'teaching:record'
  | 'assessments:enter'
  | 'reports:generate'
  | 'learning:view'
  | 'parent:view_children'
  | 'parent:messages';

export interface UserSession {
  sessionId: string;
  userId: UserId;
  role: Role;
  portal: PortalType;
  fullName: string;
  identifier: string;
  permissions: Permission[];
  loginTimestamp: string;
  expiresAt: string;
  biometricUsed: boolean;
}

// ==========================================
// 11. AUDIT LOGGING & OPERATIONS
// ==========================================
export interface AuditLog {
  id: AuditLogId;
  timestamp: string;
  userId: UserId;
  userRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipPlaceholder?: string;
}
