/**
 * Little Roses Academy (LRA) - Phase 0 Storage & Data Architecture
 * 
 * SPECIFICATION RULES:
 * - Permanent IDs for every major entity
 * - Shared data architecture across the 4 portals (ADMIN, TEACHER, LEARNER, PARENT)
 * - Academic Year & Term models (no hardcoded dates)
 * - Grade 1-6 model (no Grade 7+, no streams)
 * - ZERO fake/demo data (no demo teachers, pupils, schemes, CATs, marks)
 * - Password rule: never plaintext, salted SHA-256 hash
 * - Rate limiting & account lockout architecture
 * - Biometric login architecture
 * - Full Audit Logging for every administrative action
 */

import {
  SchoolInfo,
  AcademicYear,
  AcademicYearId,
  Term,
  TermId,
  Grade,
  GradeLevel,
  SubjectConfig,
  CurriculumVersion,
  CurriculumId,
  User,
  UserId,
  TeacherProfile,
  TeacherId,
  LearnerProfile,
  LearnerId,
  ParentProfile,
  ParentId,
  FamilyId,
  UserSession,
  AuditLog,
  AuditLogId,
  Role,
  PortalType,
  Permission,
} from '../types/phase0.ts';
import { INITIAL_CONFIGURABLE_SUBJECTS } from './subjectColorSystem.ts';

// Storage keys
const STORAGE_PREFIX = 'lra_phase0_';
const KEYS = {
  SCHOOL: `${STORAGE_PREFIX}school_info`,
  ACADEMIC_YEARS: `${STORAGE_PREFIX}academic_years`,
  TERMS: `${STORAGE_PREFIX}terms`,
  GRADES: `${STORAGE_PREFIX}grades`,
  SUBJECTS: `${STORAGE_PREFIX}subjects`,
  CURRICULA: `${STORAGE_PREFIX}curricula`,
  USERS: `${STORAGE_PREFIX}users`,
  TEACHERS: `${STORAGE_PREFIX}teachers`,
  LEARNERS: `${STORAGE_PREFIX}learners`,
  PARENTS: `${STORAGE_PREFIX}parents`,
  SESSION: `${STORAGE_PREFIX}session`,
  AUDIT_LOGS: `${STORAGE_PREFIX}audit_logs`,
  BIOMETRIC_PREF: `${STORAGE_PREFIX}biometric_pref`,
  ATTACHED_LOGO: `${STORAGE_PREFIX}attached_logo`,
};

// Permanent ID Generator
export function generatePermanentId(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}_${timestamp}_${randomPart}`;
}

// Cryptographic Salted SHA-256 Hashing
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:LRA_PHASE_0_SECURITY_KEY`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Initial Grades (1 to 6 Only, as required by Phase 0 Specification)
const INITIAL_GRADES: Grade[] = [
  { id: 'grade_1', level: 1, name: 'Grade 1', stage: 'lower_primary', isEnabled: true },
  { id: 'grade_2', level: 2, name: 'Grade 2', stage: 'lower_primary', isEnabled: true },
  { id: 'grade_3', level: 3, name: 'Grade 3', stage: 'lower_primary', isEnabled: true },
  { id: 'grade_4', level: 4, name: 'Grade 4', stage: 'upper_primary', isEnabled: true },
  { id: 'grade_5', level: 5, name: 'Grade 5', stage: 'upper_primary', isEnabled: true },
  { id: 'grade_6', level: 6, name: 'Grade 6', stage: 'upper_primary', isEnabled: true },
];

export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  schoolId: 'lra_inst_nakuru_001',
  name: 'Little Roses Academy',
  motto: 'MUCH FROM LITTLE',
  pillars: ['LEARN', 'LOVE', 'LEAD'],
  tagline: 'LEARN TODAY BUILD TOMORROW',
  county: 'Nakuru',
  country: 'Kenya',
  systemType: 'CBC',
  establishedYear: 2018,
};

type Listener = () => void;

class Phase0Storage {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    // Ensure school info exists
    if (!this.getSchoolInfo()) {
      this.save(KEYS.SCHOOL, INITIAL_SCHOOL_INFO);
    }
    // Ensure grades 1-6 foundation exists
    if (!this.getGrades() || this.getGrades().length === 0) {
      this.save(KEYS.GRADES, INITIAL_GRADES);
    }
    // Ensure subject configurations exist
    if (!this.getSubjects() || this.getSubjects().length === 0) {
      this.save(KEYS.SUBJECTS, INITIAL_CONFIGURABLE_SUBJECTS);
    }
    // Note: Users, Academic Years, Terms, Curricula, Learners, Teachers, Parents START EMPTY!
    // NO FAKE OR DEMO USERS!
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error(`Error saving to localStorage key ${key}:`, e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error in storage listener:', err);
      }
    });
  }

  // ==========================================
  // LOGO STORAGE
  // ==========================================
  public getAttachedLogo(): string | null {
    return localStorage.getItem(KEYS.ATTACHED_LOGO);
  }

  public setAttachedLogo(dataUrl: string) {
    localStorage.setItem(KEYS.ATTACHED_LOGO, dataUrl);
    this.notify();
  }

  // ==========================================
  // SCHOOL INFO
  // ==========================================
  public getSchoolInfo(): SchoolInfo {
    return this.load<SchoolInfo>(KEYS.SCHOOL, INITIAL_SCHOOL_INFO);
  }

  // ==========================================
  // ACADEMIC YEAR FOUNDATION
  // ==========================================
  public getAcademicYears(): AcademicYear[] {
    return this.load<AcademicYear[]>(KEYS.ACADEMIC_YEARS, []);
  }

  public getAcademicYear(id: AcademicYearId): AcademicYear | undefined {
    return this.getAcademicYears().find((y) => y.id === id);
  }

  public createAcademicYear(year: number, startDate = '', endDate = ''): AcademicYear {
    const years = this.getAcademicYears();
    // Verify not duplicate
    const existing = years.find((y) => y.year === year);
    if (existing) {
      throw new Error(`Academic Year ${year} already exists.`);
    }

    const newYear: AcademicYear = {
      id: generatePermanentId('ay'),
      year,
      status: years.length === 0 ? 'active' : 'planning',
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    years.push(newYear);
    years.sort((a, b) => a.year - b.year);
    this.save(KEYS.ACADEMIC_YEARS, years);

    this.logAudit(
      'CREATE_ACADEMIC_YEAR',
      'AcademicYear',
      newYear.id,
      `Configured Academic Year ${year} (Status: ${newYear.status})`
    );

    return newYear;
  }

  public updateAcademicYearStatus(id: AcademicYearId, status: 'planning' | 'active' | 'archived') {
    const years = this.getAcademicYears().map((y) => {
      if (y.id === id) {
        return { ...y, status, updatedAt: new Date().toISOString() };
      }
      // If setting to active, other active years become planning or archived
      if (status === 'active' && y.status === 'active') {
        return { ...y, status: 'planning' as const, updatedAt: new Date().toISOString() };
      }
      return y;
    });
    this.save(KEYS.ACADEMIC_YEARS, years);
    this.logAudit('UPDATE_ACADEMIC_YEAR_STATUS', 'AcademicYear', id, `Status updated to ${status}`);
  }

  public updateAcademicYearDates(id: AcademicYearId, startDate: string, endDate: string) {
    const years = this.getAcademicYears().map((y) =>
      y.id === id ? { ...y, startDate, endDate, updatedAt: new Date().toISOString() } : y
    );
    this.save(KEYS.ACADEMIC_YEARS, years);
    this.logAudit('UPDATE_ACADEMIC_YEAR_DATES', 'AcademicYear', id, `Dates: ${startDate} to ${endDate}`);
  }

  // ==========================================
  // TERM FOUNDATION
  // ==========================================
  public getTerms(academicYearId?: AcademicYearId): Term[] {
    const all = this.load<Term[]>(KEYS.TERMS, []);
    return academicYearId ? all.filter((t) => t.academicYearId === academicYearId) : all;
  }

  public configureTerm(
    academicYearId: AcademicYearId,
    name: 'TERM 1' | 'TERM 2' | 'TERM 3',
    startDate: string,
    endDate: string,
    status: 'upcoming' | 'active' | 'completed' = 'upcoming'
  ): Term {
    const all = this.getTerms();
    const existingIndex = all.findIndex((t) => t.academicYearId === academicYearId && t.name === name);

    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        startDate,
        endDate,
        status,
        updatedAt: new Date().toISOString(),
      };
      this.save(KEYS.TERMS, all);
      this.logAudit('UPDATE_TERM', 'Term', all[existingIndex].id, `Updated ${name} dates for year ${academicYearId}`);
      return all[existingIndex];
    } else {
      const newTerm: Term = {
        id: generatePermanentId('term'),
        academicYearId,
        name,
        startDate,
        endDate,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      all.push(newTerm);
      this.save(KEYS.TERMS, all);
      this.logAudit('CREATE_TERM', 'Term', newTerm.id, `Created ${name} for academic year ${academicYearId}`);
      return newTerm;
    }
  }

  // ==========================================
  // GRADES & SUBJECTS FOUNDATION
  // ==========================================
  public getGrades(): Grade[] {
    return this.load<Grade[]>(KEYS.GRADES, INITIAL_GRADES);
  }

  public getSubjects(): SubjectConfig[] {
    return this.load<SubjectConfig[]>(KEYS.SUBJECTS, INITIAL_CONFIGURABLE_SUBJECTS);
  }

  public getSubjectsForGrade(gradeLevel: GradeLevel): SubjectConfig[] {
    return this.getSubjects().filter((s) => s.applicableGrades.includes(gradeLevel) && s.isEnabled);
  }

  public toggleSubjectEnabled(subjectId: string, enabled: boolean) {
    const subjects = this.getSubjects().map((s) =>
      s.id === subjectId ? { ...s, isEnabled: enabled } : s
    );
    this.save(KEYS.SUBJECTS, subjects);
    this.logAudit('TOGGLE_SUBJECT', 'SubjectConfig', subjectId, `Set isEnabled to ${enabled}`);
  }

  // ==========================================
  // CURRICULUM ARCHITECTURE (Structure Only)
  // ==========================================
  public getCurricula(): CurriculumVersion[] {
    return this.load<CurriculumVersion[]>(KEYS.CURRICULA, []);
  }

  public createCurriculumStructure(academicYearId: AcademicYearId, versionName = 'KICD CBC v2026'): CurriculumVersion {
    const list = this.getCurricula();
    const grades = this.getGrades();
    const subjects = this.getSubjects();

    const gradeNodes = grades.map((g) => {
      const gradeSubjects = subjects
        .filter((s) => s.applicableGrades.includes(g.level))
        .map((s) => ({
          subjectId: s.id,
          subjectName: s.name,
          stage: s.stage,
          strands: [], // Empty container structure - NO INVENTED CURRICULUM
        }));

      return {
        gradeLevel: g.level,
        subjects: gradeSubjects,
      };
    });

    const newCurriculum: CurriculumVersion = {
      id: generatePermanentId('curric'),
      academicYearId,
      versionName,
      framework: 'KICD_CBC',
      status: 'active',
      grades: gradeNodes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.push(newCurriculum);
    this.save(KEYS.CURRICULA, list);
    this.logAudit('CREATE_CURRICULUM_STRUCTURE', 'CurriculumVersion', newCurriculum.id, `Created structure for year ${academicYearId}`);
    return newCurriculum;
  }

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================
  public getUsers(): User[] {
    return this.load<User[]>(KEYS.USERS, []);
  }

  public getUserByRole(role: Role): User[] {
    return this.getUsers().filter((u) => u.role === role);
  }

  public findUserByIdentifier(identifier: string): User | undefined {
    const normalized = identifier.trim().toLowerCase();
    return this.getUsers().find((u) => u.identifier.trim().toLowerCase() === normalized);
  }

  public async registerUser(params: {
    role: Role;
    identifier: string;
    fullName: string;
    passwordPlain: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    const users = this.getUsers();
    const existing = this.findUserByIdentifier(params.identifier);
    if (existing) {
      throw new Error(`An account with identifier "${params.identifier}" already exists.`);
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(params.passwordPlain, salt);

    const newUser: User = {
      id: generatePermanentId('usr'),
      schoolId: this.getSchoolInfo().schoolId,
      role: params.role,
      identifier: params.identifier.trim(),
      fullName: params.fullName.trim(),
      email: params.email?.trim(),
      phone: params.phone?.trim(),
      passwordHash,
      salt,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.save(KEYS.USERS, users);

    this.logAudit('REGISTER_USER', 'User', newUser.id, `Created ${params.role} account: ${newUser.fullName} (${newUser.identifier})`);

    return newUser;
  }

  // Rate Limiting & Account Lockout
  public checkAccountLock(user: User): { isLocked: boolean; remainingMinutes?: number } {
    if (!user.lockedUntil) return { isLocked: false };
    const lockTime = new Date(user.lockedUntil).getTime();
    const now = Date.now();
    if (lockTime > now) {
      const remainingMinutes = Math.ceil((lockTime - now) / 60000);
      return { isLocked: true, remainingMinutes };
    }
    return { isLocked: false };
  }

  public recordFailedAttempt(user: User) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === user.id);
    if (!target) return;

    target.failedLoginAttempts = (target.failedLoginAttempts || 0) + 1;
    if (target.failedLoginAttempts >= 5) {
      // Lock for 15 minutes
      target.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      this.logAudit('ACCOUNT_LOCKED', 'User', target.id, `Account locked for 15 minutes due to 5 failed login attempts.`);
    }
    this.save(KEYS.USERS, users);
  }

  public resetFailedAttempts(user: User) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === user.id);
    if (!target) return;
    target.failedLoginAttempts = 0;
    target.lockedUntil = undefined;
    this.save(KEYS.USERS, users);
  }

  public async authenticate(identifier: string, passwordPlain: string, targetPortal?: PortalType): Promise<UserSession> {
    const user = this.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('Account not found. Please check your identifier.');
    }

    if (targetPortal && user.role !== targetPortal) {
      throw new Error(`This account is registered as ${user.role}, not ${targetPortal}.`);
    }

    const lockStatus = this.checkAccountLock(user);
    if (lockStatus.isLocked) {
      throw new Error(`Account temporarily locked for security. Please try again in ${lockStatus.remainingMinutes} minute(s).`);
    }

    const testHash = await hashPassword(passwordPlain, user.salt);
    if (testHash !== user.passwordHash) {
      this.recordFailedAttempt(user);
      throw new Error('Incorrect password or PIN. Please try again.');
    }

    // Success: clear failed attempts
    this.resetFailedAttempts(user);

    const permissions = this.getPermissionsForRole(user.role);
    const session: UserSession = {
      sessionId: generatePermanentId('sess'),
      userId: user.id,
      role: user.role,
      portal: targetPortal || user.role,
      fullName: user.fullName,
      identifier: user.identifier,
      permissions,
      loginTimestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      biometricUsed: false,
    };

    this.save(KEYS.SESSION, session);
    this.logAudit('USER_LOGIN', 'Session', session.sessionId, `Successful login by ${user.fullName} (${user.role})`);
    return session;
  }

  public async authenticateBiometric(userId: string): Promise<UserSession> {
    const user = this.getUsers().find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const permissions = this.getPermissionsForRole(user.role);
    const session: UserSession = {
      sessionId: generatePermanentId('sess'),
      userId: user.id,
      role: user.role,
      portal: user.role,
      fullName: user.fullName,
      identifier: user.identifier,
      permissions,
      loginTimestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      biometricUsed: true,
    };

    this.save(KEYS.SESSION, session);
    this.logAudit('BIOMETRIC_LOGIN', 'Session', session.sessionId, `Biometric authentication for ${user.fullName}`);
    return session;
  }

  public getPermissionsForRole(role: Role): Permission[] {
    switch (role) {
      case 'ADMIN':
        return [
          'system:manage',
          'curriculum:configure',
          'academics:manage',
          'users:manage',
          'audit:view',
          'reports:generate',
        ];
      case 'TEACHER':
        return ['teaching:record', 'assessments:enter', 'reports:generate'];
      case 'LEARNER':
        return ['learning:view'];
      case 'PARENT':
        return ['parent:view_children', 'parent:messages'];
    }
  }

  // Session
  public getCurrentSession(): UserSession | null {
    const sess = this.load<UserSession | null>(KEYS.SESSION, null);
    if (!sess) return null;
    if (new Date(sess.expiresAt).getTime() < Date.now()) {
      this.clearSession();
      return null;
    }
    return sess;
  }

  public clearSession() {
    const current = this.getCurrentSession();
    if (current) {
      this.logAudit('USER_LOGOUT', 'Session', current.sessionId, `User ${current.fullName} signed out.`);
    }
    localStorage.removeItem(KEYS.SESSION);
    this.notify();
  }

  // ==========================================
  // SHARED LEARNER RECORDS FOUNDATION
  // ==========================================
  public getLearners(): LearnerProfile[] {
    return this.load<LearnerProfile[]>(KEYS.LEARNERS, []);
  }

  public getLearner(learnerId: LearnerId): LearnerProfile | undefined {
    return this.getLearners().find((l) => l.id === learnerId);
  }

  public async admitLearner(params: {
    fullName: string;
    gender: 'MALE' | 'FEMALE';
    grade: GradeLevel;
    pin: string;
    parentId?: ParentId;
  }): Promise<{ learner: LearnerProfile; user: User }> {
    const academicYears = this.getAcademicYears();
    const activeYear = academicYears.find((y) => y.status === 'active')?.year || new Date().getFullYear();
    const learners = this.getLearners();
    const seq = (learners.length + 1).toString().padStart(4, '0');
    const upi = `LRA-${activeYear}-${seq}`;

    // Create authentic user credential
    const user = await this.registerUser({
      role: 'LEARNER',
      identifier: upi,
      fullName: params.fullName,
      passwordPlain: params.pin,
    });

    const learner: LearnerProfile = {
      id: generatePermanentId('lrn'), // Permanent stable ID
      userId: user.id,
      upi,
      fullName: params.fullName,
      gender: params.gender,
      currentGrade: params.grade,
      dateOfAdmission: new Date().toISOString().split('T')[0],
      parentId: params.parentId,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    learners.push(learner);
    this.save(KEYS.LEARNERS, learners);

    // If parentId provided, link immediately
    if (params.parentId) {
      this.linkLearnerToParent(learner.id, params.parentId);
    }

    this.logAudit('ADMIT_LEARNER', 'LearnerProfile', learner.id, `Admitted ${learner.fullName} to Grade ${learner.currentGrade} (UPI: ${learner.upi})`);

    return { learner, user };
  }

  // ==========================================
  // TEACHERS FOUNDATION
  // ==========================================
  public getTeachers(): TeacherProfile[] {
    return this.load<TeacherProfile[]>(KEYS.TEACHERS, []);
  }

  public async registerTeacher(params: {
    fullName: string;
    phone: string;
    employeeNumber: string;
    passwordPlain: string;
    assignedGrades: GradeLevel[];
    assignedSubjectIds: string[];
    isClassTeacherOfGrade?: GradeLevel;
  }): Promise<{ teacher: TeacherProfile; user: User }> {
    const user = await this.registerUser({
      role: 'TEACHER',
      identifier: params.phone,
      phone: params.phone,
      fullName: params.fullName,
      passwordPlain: params.passwordPlain,
    });

    const teachers = this.getTeachers();
    const teacher: TeacherProfile = {
      id: generatePermanentId('tch'),
      userId: user.id,
      employeeNumber: params.employeeNumber,
      assignedGrades: params.assignedGrades,
      assignedSubjectIds: params.assignedSubjectIds,
      isClassTeacherOfGrade: params.isClassTeacherOfGrade,
      active: true,
      createdAt: new Date().toISOString(),
    };

    teachers.push(teacher);
    this.save(KEYS.TEACHERS, teachers);
    this.logAudit('REGISTER_TEACHER', 'TeacherProfile', teacher.id, `Registered teacher ${params.fullName} (${teacher.employeeNumber})`);

    return { teacher, user };
  }

  // ==========================================
  // PARENTS FOUNDATION
  // ==========================================
  public getParents(): ParentProfile[] {
    return this.load<ParentProfile[]>(KEYS.PARENTS, []);
  }

  public async registerParent(params: {
    fullName: string;
    phone: string;
    passwordPlain: string;
    relationship?: string;
  }): Promise<{ parent: ParentProfile; user: User }> {
    const user = await this.registerUser({
      role: 'PARENT',
      identifier: params.phone,
      phone: params.phone,
      fullName: params.fullName,
      passwordPlain: params.passwordPlain,
    });

    const parents = this.getParents();
    const parent: ParentProfile = {
      id: generatePermanentId('par'),
      userId: user.id,
      phone: params.phone,
      fullName: params.fullName,
      relationship: params.relationship || 'Parent/Guardian',
      learnerIds: [],
      familyId: generatePermanentId('fam'),
      active: true,
      createdAt: new Date().toISOString(),
    };

    parents.push(parent);
    this.save(KEYS.PARENTS, parents);
    this.logAudit('REGISTER_PARENT', 'ParentProfile', parent.id, `Registered parent ${params.fullName} (${params.phone})`);

    return { parent, user };
  }

  public linkLearnerToParent(learnerId: LearnerId, parentId: ParentId) {
    const parents = this.getParents();
    const p = parents.find((item) => item.id === parentId);
    if (p && !p.learnerIds.includes(learnerId)) {
      p.learnerIds.push(learnerId);
      this.save(KEYS.PARENTS, parents);

      // Also update learner profile
      const learners = this.getLearners();
      const l = learners.find((item) => item.id === learnerId);
      if (l) {
        l.parentId = parentId;
        l.familyId = p.familyId;
        this.save(KEYS.LEARNERS, learners);
      }

      this.logAudit('LINK_LEARNER_PARENT', 'ParentProfile', parentId, `Linked learner ${learnerId} to parent ${parentId}`);
    }
  }

  public getLearnersForParent(parentId: ParentId): LearnerProfile[] {
    const parent = this.getParents().find((p) => p.id === parentId);
    if (!parent) return [];
    return this.getLearners().filter((l) => parent.learnerIds.includes(l.id));
  }

  // ==========================================
  // AUDIT LOGS FOUNDATION
  // ==========================================
  public getAuditLogs(): AuditLog[] {
    return this.load<AuditLog[]>(KEYS.AUDIT_LOGS, []);
  }

  public logAudit(action: string, entityType: string, entityId: string, details: string) {
    const current = this.getCurrentSession();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: generatePermanentId('audit'),
      timestamp: new Date().toISOString(),
      userId: current?.userId || 'system',
      userRole: current?.role || 'ADMIN',
      action,
      entityType,
      entityId,
      details,
    };
    logs.unshift(newLog); // newest first
    // keep maximum 1000 logs locally
    if (logs.length > 1000) logs.pop();
    this.save(KEYS.AUDIT_LOGS, logs);
  }

  // ==========================================
  // BIOMETRIC FOUNDATION (WebAuthn / Passkey)
  // ==========================================
  public isBiometricSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.PublicKeyCredential && window.navigator.credentials);
  }

  public isBiometricEnabledForUser(userId: UserId): boolean {
    const map = this.load<Record<string, boolean>>(KEYS.BIOMETRIC_PREF, {});
    return !!map[userId];
  }

  public setBiometricEnabledForUser(userId: UserId, enabled: boolean) {
    const map = this.load<Record<string, boolean>>(KEYS.BIOMETRIC_PREF, {});
    map[userId] = enabled;
    this.save(KEYS.BIOMETRIC_PREF, map);
    this.logAudit('BIOMETRIC_PREFERENCE', 'User', userId, `Biometric login ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Reset entire database to pristine empty Phase 0 state
  public resetToCleanPhase0() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.init();
    this.notify();
  }
}

export const phase0Storage = new Phase0Storage();
