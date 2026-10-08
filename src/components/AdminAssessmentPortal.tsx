import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  Search,
  Calendar,
  Layers,
  Sparkles,
  User,
  Target,
  Clock,
  Tag,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import {
  dataLayer,
  TeacherAccountRecord,
  PupilRecord,
  AcademicYearRecord,
  AcademicTermInfo,
  CatAssessmentRecord,
  AssignmentRecord,
  FocusZoneRecord,
  getTeacherGradeAssignments,
  getTeacherSubjectsForGrade,
} from '../services/dataLayer.ts';
import { CBC_BAND_COLORS, getTimetableSubjectTheme } from '../styles/colors.ts';

// -----------------------------------------------------------------------------
// CBC BAND HELPER (EE, ME, AE, BE)
// -----------------------------------------------------------------------------
export type CBCBand = 'EE' | 'ME' | 'AE' | 'BE';

export function calculateCBCBandFromPercentage(percentage: number): CBCBand {
  if (percentage >= 80) return 'EE';
  if (percentage >= 60) return 'ME';
  if (percentage >= 40) return 'AE';
  return 'BE';
}

export function getCBCBandBadge(band: CBCBand | null) {
  if (!band) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider font-mono">
        NO RESULTS RECORDED
      </span>
    );
  }

  const config = CBC_BAND_COLORS[band];
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider font-mono border ${config.badgeClass}`}
      title={config.label}
    >
      {band} — {band === 'EE' ? 'Exceeding' : band === 'ME' ? 'Meeting' : band === 'AE' ? 'Approaching' : 'Below'}
    </span>
  );
}

// -----------------------------------------------------------------------------
// PROPS INTERFACE
// -----------------------------------------------------------------------------
export interface AdminAssessmentPortalProps {
  academicYears: AcademicYearRecord[];
  activeAcademicYear: AcademicYearRecord | null;
  termInfo: AcademicTermInfo;
  teachers: TeacherAccountRecord[];
  pupils: PupilRecord[];
  onNavigate?: (tab: string) => void;
}

export const AdminAssessmentPortal: React.FC<AdminAssessmentPortalProps> = ({
  academicYears,
  activeAcademicYear,
  termInfo,
  teachers: initialTeachers,
  pupils: initialPupils,
  onNavigate,
}) => {
  // ---------------------------------------------------------------------------
  // 1. NAVIGATION STATE ENGINE
  // ---------------------------------------------------------------------------
  // Step 1: Teacher Selection (default when teacher is null)
  // Step 2: Grade Selection (when teacher is picked, grade is null)
  // Step 3: Subject Selection (when grade is picked, subject is null)
  // Step 4: Learners List & Performance (when subject is picked, learner is null)
  // Step 5: Learner Details & Evidence (when learner is picked)

  const [academicYear, setAcademicYear] = useState<string>(
    activeAcademicYear?.year || '2026'
  );
  const [term, setTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(
    termInfo?.term || 'Term 1'
  );

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLearnerUpi, setSelectedLearnerUpi] = useState<string | null>(null);

  // Search filter states
  const [teacherSearch, setTeacherSearch] = useState('');
  const [learnerSearch, setLearnerSearch] = useState('');

  // Live state from dataLayer with live subscription
  const [teachersList, setTeachersList] = useState<TeacherAccountRecord[]>(() =>
    dataLayer.getTeachers()
  );
  const [pupilsList, setPupilsList] = useState<PupilRecord[]>(() =>
    dataLayer.getPupils()
  );
  const [catsList, setCatsList] = useState<CatAssessmentRecord[]>(() =>
    dataLayer.getCats()
  );
  const [assignmentsList, setAssignmentsList] = useState<AssignmentRecord[]>(() =>
    dataLayer.getAssignments()
  );
  const [focusList, setFocusList] = useState<FocusZoneRecord[]>(() =>
    dataLayer.getFocusZoneRecords()
  );

  useEffect(() => {
    const unsub = dataLayer.subscribe(() => {
      setTeachersList(dataLayer.getTeachers());
      setPupilsList(dataLayer.getPupils());
      setCatsList(dataLayer.getCats());
      setAssignmentsList(dataLayer.getAssignments());
      setFocusList(dataLayer.getFocusZoneRecords());
    });
    return unsub;
  }, []);

  // Selected entities
  const selectedTeacher = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachersList.find((t) => t.id === selectedTeacherId) || null;
  }, [selectedTeacherId, teachersList]);

  const selectedLearner = useMemo(() => {
    if (!selectedLearnerUpi) return null;
    return pupilsList.find((p) => p.upi === selectedLearnerUpi) || null;
  }, [selectedLearnerUpi, pupilsList]);

  // ---------------------------------------------------------------------------
  // 2. REAL ASSIGNED GRADES (ONLY GRADES ASSIGNED TO SELECTED TEACHER)
  // ---------------------------------------------------------------------------
  const assignedGradesForTeacher = useMemo(() => {
    if (!selectedTeacher) return [];
    const assignments = getTeacherGradeAssignments(selectedTeacher);
    const grades = assignments.map((a) => a.grade);
    return Array.from(new Set(grades));
  }, [selectedTeacher]);

  // ---------------------------------------------------------------------------
  // 3. REAL ASSIGNED SUBJECTS (ONLY SUBJECTS ASSIGNED TO TEACHER FOR GRADE)
  // ---------------------------------------------------------------------------
  const assignedSubjectsForTeacherGrade = useMemo(() => {
    if (!selectedTeacher || !selectedGrade) return [];
    const subjects = getTeacherSubjectsForGrade(selectedTeacher, selectedGrade);
    return Array.from(new Set(subjects));
  }, [selectedTeacher, selectedGrade]);

  // ---------------------------------------------------------------------------
  // 4. REAL LEARNERS BELONGING TO SELECTED GRADE
  // ---------------------------------------------------------------------------
  const learnersInGrade = useMemo(() => {
    if (!selectedGrade) return [];
    return pupilsList.filter(
      (p) => p.grade === selectedGrade && p.status === 'Active'
    );
  }, [selectedGrade, pupilsList]);

  // Filtered learners
  const filteredLearners = useMemo(() => {
    if (!learnerSearch.trim()) return learnersInGrade;
    const q = learnerSearch.toLowerCase().trim();
    return learnersInGrade.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.upi.toLowerCase().includes(q) ||
        (l.parentName && l.parentName.toLowerCase().includes(q))
    );
  }, [learnersInGrade, learnerSearch]);

  // ---------------------------------------------------------------------------
  // 5. ASSESSMENT CALCULATIONS (STRICT ZERO-FAKE DATA)
  // ---------------------------------------------------------------------------
  // Relevant CAT records for current selection
  const relevantCats = useMemo(() => {
    if (!selectedGrade || !selectedSubject) return [];
    const cleanSubj = selectedSubject.trim().toLowerCase();
    return catsList.filter((c) => {
      if (c.grade !== selectedGrade) return false;
      if (c.academicYear && c.academicYear !== academicYear) return false;
      if (c.term && c.term !== term) return false;
      const cSubj = c.subject.trim().toLowerCase();
      return (
        cSubj === cleanSubj ||
        cSubj.includes(cleanSubj) ||
        cleanSubj.includes(cSubj)
      );
    });
  }, [catsList, selectedGrade, selectedSubject, academicYear, term]);

  // Relevant assignments for current selection
  const relevantAssignments = useMemo(() => {
    if (!selectedGrade || !selectedSubject) return [];
    const cleanSubj = selectedSubject.trim().toLowerCase();
    return assignmentsList.filter((a) => {
      if (a.grade !== selectedGrade) return false;
      if (a.academicYear && a.academicYear !== academicYear) return false;
      if (a.term && a.term !== term) return false;
      const aSubj = a.subject.trim().toLowerCase();
      return (
        aSubj === cleanSubj ||
        aSubj.includes(cleanSubj) ||
        cleanSubj.includes(aSubj)
      );
    });
  }, [assignmentsList, selectedGrade, selectedSubject, academicYear, term]);

  // Helper: compute learner's assessment metrics for current subject
  const computeLearnerMetrics = (learner: PupilRecord) => {
    // 1. Gather CAT scores recorded for this pupil
    const learnerCatScores: Array<{
      cat: CatAssessmentRecord;
      catScore: number;
      hwScore: number;
      total: number;
      percentage: number;
      band: CBCBand;
      remark?: string;
    }> = [];

    relevantCats.forEach((cat) => {
      const scoreObj = cat.scores?.[learner.upi] || cat.scores?.[learner.id];
      if (scoreObj !== undefined && scoreObj !== null) {
        const catTotal = cat.catTotalMarks || 20;
        const hwTotal = cat.homeworkTotalMarks || 10;
        const totalPossible = catTotal + hwTotal;
        const totalAchieved = scoreObj.total ?? (scoreObj.catScore + scoreObj.hwScore);
        const percentage = totalPossible > 0 ? (totalAchieved / totalPossible) * 100 : 0;
        const band = scoreObj.band || calculateCBCBandFromPercentage(percentage);

        learnerCatScores.push({
          cat,
          catScore: scoreObj.catScore,
          hwScore: scoreObj.hwScore,
          total: totalAchieved,
          percentage,
          band,
          remark: scoreObj.remark,
        });
      }
    });

    // 2. Gather assignments submitted / marked
    const learnerAssignments = relevantAssignments.filter((asg) => {
      return (
        asg.submissions &&
        (asg.submissions[learner.upi] || asg.submissions[learner.id])
      );
    });

    const hasAnyResults = learnerCatScores.length > 0;

    let overallBand: CBCBand | null = null;
    let averagePercentage = 0;
    let averageScoreOutOf30 = 0;

    if (hasAnyResults) {
      const totalPct = learnerCatScores.reduce((sum, s) => sum + s.percentage, 0);
      averagePercentage = Math.round(totalPct / learnerCatScores.length);
      const totalPts = learnerCatScores.reduce((sum, s) => sum + s.total, 0);
      averageScoreOutOf30 = Math.round((totalPts / learnerCatScores.length) * 10) / 10;
      overallBand = calculateCBCBandFromPercentage(averagePercentage);
    }

    // Status description
    let assessmentStatus = 'NO RESULTS RECORDED';
    if (hasAnyResults) {
      assessmentStatus = `Assessed (${learnerCatScores.length} CAT${learnerCatScores.length > 1 ? 's' : ''}${learnerAssignments.length > 0 ? `, ${learnerAssignments.length} Assignment` : ''})`;
    } else if (learnerAssignments.length > 0) {
      assessmentStatus = `Submitted (${learnerAssignments.length} Assignment)`;
    }

    return {
      hasResults: hasAnyResults,
      overallBand,
      averagePercentage,
      averageScoreOutOf30,
      catScores: learnerCatScores,
      assignments: learnerAssignments,
      assessmentStatus,
    };
  };

  // Helper for Learner Details view
  const learnerDetailsMetrics = useMemo(() => {
    if (!selectedLearner) return null;
    return computeLearnerMetrics(selectedLearner);
  }, [selectedLearner, relevantCats, relevantAssignments]);

  // Focus areas for selected learner in current subject
  const learnerFocusAreas = useMemo(() => {
    if (!selectedLearner || !selectedSubject) return [];
    const cleanSubj = selectedSubject.trim().toLowerCase();
    return focusList.filter((f) => {
      if (f.pupilUpi !== selectedLearner.upi) return false;
      if (!f.subject) return true;
      const fSubj = f.subject.trim().toLowerCase();
      return (
        fSubj === cleanSubj ||
        fSubj.includes(cleanSubj) ||
        cleanSubj.includes(fSubj)
      );
    });
  }, [selectedLearner, selectedSubject, focusList]);

  // ---------------------------------------------------------------------------
  // 6. NAVIGATION ACTIONS & BREADCRUMBS
  // ---------------------------------------------------------------------------
  const handleSelectTeacher = (teacher: TeacherAccountRecord) => {
    setSelectedTeacherId(teacher.id);
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSelectedLearnerUpi(null);
    setLearnerSearch('');
  };

  const handleSelectGrade = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSubject(null);
    setSelectedLearnerUpi(null);
    setLearnerSearch('');
  };

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedLearnerUpi(null);
    setLearnerSearch('');
  };

  const handleSelectLearner = (learner: PupilRecord) => {
    setSelectedLearnerUpi(learner.upi);
  };

  const handleResetToTeachers = () => {
    setSelectedTeacherId(null);
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSelectedLearnerUpi(null);
  };

  const handleResetToGrades = () => {
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSelectedLearnerUpi(null);
  };

  const handleResetToSubjects = () => {
    setSelectedSubject(null);
    setSelectedLearnerUpi(null);
  };

  const handleResetToLearners = () => {
    setSelectedLearnerUpi(null);
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return teachersList;
    const q = teacherSearch.toLowerCase().trim();
    return teachersList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.assignedGrades?.some((g) => g.toLowerCase().includes(q)) ||
        t.subjects?.some((s) => s.toLowerCase().includes(q))
    );
  }, [teachersList, teacherSearch]);

  const subjectTheme = useMemo(() => {
    if (!selectedSubject) return null;
    return getTimetableSubjectTheme(selectedSubject);
  }, [selectedSubject]);

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* =============================================================
          TOP BREADCRUMB & CONTEXT BAR
          ============================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#080E24] border border-slate-800 shadow-xl space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ClipboardList className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                Admin Assessment Console
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[10px] font-bold text-amber-400 font-mono">
                Official Kenya CBC Assessment Book
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              Curriculum Assessment & Performance Cockpit
            </h2>
            <p className="text-xs text-slate-400">
              Strict authority hierarchy: Academic Year → Term → Real Teachers → Assigned Grades → Assigned Subjects → Real Learners.
            </p>
          </div>

          {/* Academic Year & Term Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Academic Year Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 font-bold">Year:</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.year} className="bg-slate-900">
                    {ay.year} {ay.isCurrent ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Term Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">Term:</span>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as any)}
                className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Term 1" className="bg-slate-900">Term 1</option>
                <option value="Term 2" className="bg-slate-900">Term 2</option>
                <option value="Term 3" className="bg-slate-900">Term 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step-by-Step Interactive Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1 scrollbar-none">
          <button
            onClick={handleResetToTeachers}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-bold cursor-pointer ${
              !selectedTeacher
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teachers ({teachersList.length})</span>
          </button>

          {selectedTeacher && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={handleResetToGrades}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-bold cursor-pointer truncate max-w-[180px] ${
                  !selectedGrade
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
                }`}
                title={selectedTeacher.name}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{selectedTeacher.name}</span>
              </button>
            </>
          )}

          {selectedGrade && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={handleResetToSubjects}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-bold cursor-pointer ${
                  !selectedSubject
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{selectedGrade}</span>
              </button>
            </>
          )}

          {selectedSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={handleResetToLearners}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-bold cursor-pointer truncate max-w-[200px] ${
                  !selectedLearner
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
                }`}
                title={selectedSubject}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{selectedSubject}</span>
              </button>
            </>
          )}

          {selectedLearner && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 truncate max-w-[200px]">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{selectedLearner.name}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =============================================================
          STAGE 1: REAL TEACHERS VIEW (When no teacher is selected)
          ============================================================= */}
      {!selectedTeacher && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>1. Select Teaching Faculty Member</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                  {filteredTeachers.length} Registered
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every teacher created in Little Roses Academy appears dynamically below. Select a teacher to view their authorized CBC grades.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Search teacher by name or grade..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No teachers found</h4>
              <p className="text-xs text-slate-500">
                No faculty members matched "{teacherSearch}". Add new teachers in Teacher Management.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeachers.map((teacher) => {
                const assignedGrades = getTeacherGradeAssignments(teacher);
                const uniqueGrades = Array.from(new Set(assignedGrades.map((a) => a.grade)));
                const allSubjectsCount = assignedGrades.reduce(
                  (sum, a) => sum + (a.subjects?.length || 0),
                  0
                );

                return (
                  <div
                    key={teacher.id}
                    onClick={() => handleSelectTeacher(teacher)}
                    className="p-4 rounded-2xl bg-[#09112A] hover:bg-[#0E1A3D] border border-slate-800 hover:border-blue-500/60 shadow-lg cursor-pointer transition-all group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-black text-sm group-hover:scale-105 transition">
                            {teacher.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition leading-snug">
                              {teacher.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              📱 {teacher.phone}
                            </span>
                          </div>
                        </div>

                        {teacher.isAdminDualRole && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 shrink-0">
                            Admin Dual
                          </span>
                        )}
                      </div>

                      {/* Authorized Grades Chips */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Assigned CBC Grades ({uniqueGrades.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueGrades.length > 0 ? (
                            uniqueGrades.map((g) => (
                              <span
                                key={g}
                                className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold"
                              >
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              No classes assigned yet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px] font-mono">
                        {allSubjectsCount} learning area assignments
                      </span>
                      <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px]">
                        <span>Select Teacher</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          STAGE 2: REAL ASSIGNED GRADES (When teacher is selected, grade is null)
          ============================================================= */}
      {selectedTeacher && !selectedGrade && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToTeachers}
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Back to Teachers"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-black text-white">
                  2. Select Grade Assigned to <span className="text-amber-400">{selectedTeacher.name}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Rule 2 strictly enforced: Displaying ONLY the classes assigned to {selectedTeacher.name}.
              </p>
            </div>

            <button
              onClick={handleResetToTeachers}
              className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1"
            >
              <span>Switch Teacher</span>
            </button>
          </div>

          {assignedGradesForTeacher.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Grades Assigned</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {selectedTeacher.name} currently does not have any authorized classes assigned in Teacher Management.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignedGradesForTeacher.map((grade) => {
                const subjectsForGrade = getTeacherSubjectsForGrade(selectedTeacher, grade);
                const pupilsCount = pupilsList.filter(
                  (p) => p.grade === grade && p.status === 'Active'
                ).length;

                return (
                  <div
                    key={grade}
                    onClick={() => handleSelectGrade(grade)}
                    className="p-4 rounded-2xl bg-[#09112A] hover:bg-[#0E1A3D] border border-slate-800 hover:border-blue-500/60 shadow-lg cursor-pointer transition-all group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-black">
                          {grade}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {pupilsCount} Enrolled Learners
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-white mt-2 group-hover:text-amber-400 transition">
                        {grade} Curriculum Cohort
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-1">
                        {selectedTeacher.name} teaches{' '}
                        <b className="text-slate-200">{subjectsForGrade.length} subject{subjectsForGrade.length > 1 ? 's' : ''}</b> in this class.
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1">
                        {subjectsForGrade.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {subjectsForGrade.length > 2 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                            +{subjectsForGrade.length - 2} more
                          </span>
                        )}
                      </div>

                      <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px] shrink-0">
                        <span>Open Grade</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          STAGE 3: REAL ASSIGNED SUBJECTS (When grade is selected, subject is null)
          ============================================================= */}
      {selectedTeacher && selectedGrade && !selectedSubject && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToGrades}
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Back to Grades"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-black text-white">
                  3. Select Assigned Learning Area for <span className="text-blue-400">{selectedGrade}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Rule 3 strictly enforced: Displaying ONLY subjects assigned to {selectedTeacher.name} for {selectedGrade}. No generic school subjects shown.
              </p>
            </div>

            <button
              onClick={handleResetToGrades}
              className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1"
            >
              <span>Switch Grade</span>
            </button>
          </div>

          {assignedSubjectsForTeacherGrade.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Subjects Assigned</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No specific subjects are assigned to {selectedTeacher.name} for {selectedGrade}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignedSubjectsForTeacherGrade.map((subject) => {
                const theme = getTimetableSubjectTheme(subject);
                const recordedCatsCount = catsList.filter(
                  (c) =>
                    c.grade === selectedGrade &&
                    c.subject.toLowerCase() === subject.toLowerCase() &&
                    c.academicYear === academicYear &&
                    c.term === term
                ).length;

                const recordedAssignmentsCount = assignmentsList.filter(
                  (a) =>
                    a.grade === selectedGrade &&
                    a.subject.toLowerCase() === subject.toLowerCase() &&
                    a.academicYear === academicYear &&
                    a.term === term
                ).length;

                return (
                  <div
                    key={subject}
                    onClick={() => handleSelectSubject(subject)}
                    className={`p-4 rounded-2xl border shadow-lg cursor-pointer transition-all group flex flex-col justify-between space-y-3 bg-gradient-to-br ${theme.bgGradient} ${theme.borderClass}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl">{theme.icon}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.badgeClass}`}>
                          {theme.shortCode}
                        </span>
                      </div>

                      <h4 className="font-black text-base text-white group-hover:text-amber-400 transition">
                        {subject}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span>Teacher: <b>{selectedTeacher.name}</b></span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{recordedCatsCount} CAT{recordedCatsCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{recordedAssignmentsCount} Assignment{recordedAssignmentsCount !== 1 ? 's' : ''}</span>
                      </div>

                      <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px]">
                        <span>View Learners</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          STAGE 4: REAL LEARNERS & ASSESSMENT PERFORMANCE
          (When teacher, grade & subject are selected; learner is null)
          ============================================================= */}
      {selectedTeacher && selectedGrade && selectedSubject && !selectedLearner && (
        <div className="space-y-4">
          {/* Context Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleResetToSubjects}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    title="Back to Subjects"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs">
                    {selectedGrade}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-white font-extrabold text-xs sm:text-sm">
                    {selectedSubject}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 text-xs font-medium">
                    Instructor: {selectedTeacher.name}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Learners & Continuous Assessment Performance
                </h3>
                <p className="text-xs text-slate-400">
                  Real registered learners in {selectedGrade}. Levels computed strictly from genuine CAT tests and homework submissions.
                </p>
              </div>

              {/* Search & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={learnerSearch}
                    onChange={(e) => setLearnerSearch(e.target.value)}
                    placeholder="Search pupil name or UPI..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Assessment Scale Quick Reference Banner */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                CBC 4-Level Performance Standard:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold font-mono text-[10px]">
                  EE: 80% – 100% (24–30 / 30)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold font-mono text-[10px]">
                  ME: 60% – 79% (18–23 / 30)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold font-mono text-[10px]">
                  AE: 40% – 59% (12–17 / 30)
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold font-mono text-[10px]">
                  BE: 0% – 39% (0–11 / 30)
                </span>
              </div>
            </div>
          </div>

          {/* Learners List */}
          {filteredLearners.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Learners Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active pupils in {selectedGrade} match your current filter. Enrolled learners in this class appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLearners.map((learner) => {
                const metrics = computeLearnerMetrics(learner);

                return (
                  <div
                    key={learner.upi}
                    onClick={() => handleSelectLearner(learner)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#080E24] hover:bg-[#0D173A] border border-slate-800 hover:border-amber-400/60 shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 group-hover:scale-105 transition">
                        {learner.gender === 'Boy' ? '👦' : '👧'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition truncate">
                            {learner.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-semibold">
                            {learner.upi}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{learner.grade}</span>
                          {learner.parentName && (
                            <>
                              <span>•</span>
                              <span className="truncate">Parent: {learner.parentName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <div className="text-left sm:text-right space-y-1">
                        <div className="flex items-center sm:justify-end gap-2">
                          {getCBCBandBadge(metrics.overallBand)}
                          {metrics.hasResults && (
                            <span className="text-xs font-mono font-bold text-white">
                              {metrics.averagePercentage}%
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {metrics.assessmentStatus}
                        </div>
                      </div>

                      <span className="text-amber-400 group-hover:translate-x-0.5 transition hidden sm:inline">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          STAGE 5: LEARNER DETAILS & ASSESSMENT EVIDENCE
          (When a specific learner is selected)
          ============================================================= */}
      {selectedTeacher && selectedGrade && selectedSubject && selectedLearner && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header & Return Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetToLearners}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Back to Learners List"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                      {selectedGrade}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-amber-400 font-bold">
                      {selectedSubject}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {selectedLearner.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    UPI: {selectedLearner.upi} • Parent: {selectedLearner.parentName || 'Registered Family'} ({selectedLearner.parentPhone || '—'})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Overall CBC Level ({selectedSubject})
                </span>
                {getCBCBandBadge(learnerDetailsMetrics?.overallBand || null)}
              </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Score</span>
                <span className="text-base font-black text-white font-mono">
                  {learnerDetailsMetrics?.hasResults
                    ? `${learnerDetailsMetrics.averagePercentage}%`
                    : 'NO RESULTS'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Standardized /30</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {learnerDetailsMetrics?.hasResults
                    ? `${learnerDetailsMetrics.averageScoreOutOf30} / 30`
                    : 'NO RESULTS'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">CATs Recorded</span>
                <span className="text-base font-black text-blue-400 font-mono">
                  {learnerDetailsMetrics?.catScores.length || 0} Test{learnerDetailsMetrics?.catScores.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Assignments</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {learnerDetailsMetrics?.assignments.length || 0} Submissions
                </span>
              </div>
            </div>
          </div>

          {/* Actual Evidence Block 1: Continuous Assessment Tests (CATs) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-black text-white">
                  Continuous Assessment Tests (CATs Evidence)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {academicYear} • {term}
              </span>
            </div>

            {(!learnerDetailsMetrics || learnerDetailsMetrics.catScores.length === 0) ? (
              <div className="p-8 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1.5">
                <span className="text-xl block">📋</span>
                <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  NO RESULTS RECORDED
                </h5>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  No CAT assessment records have been recorded yet for {selectedLearner.name} in {selectedSubject} for {term}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {learnerDetailsMetrics.catScores.map((item, idx) => (
                  <div
                    key={item.cat.id || idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-white text-sm">
                            {item.cat.title}
                          </h5>
                          {getCBCBandBadge(item.band)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Strand: <b className="text-slate-200">{item.cat.strand}</b>
                          {item.cat.teacherName && (
                            <span> • Assessor: {item.cat.teacherName}</span>
                          )}
                        </div>
                      </div>

                      {/* Score Metrics */}
                      <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">CAT (/20)</span>
                          <span className="font-bold text-white">{item.catScore}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">HW (/10)</span>
                          <span className="font-bold text-white">{item.hwScore}</span>
                        </div>
                        <div className="text-right px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <span className="text-[10px] block opacity-80">Total /30</span>
                          <span className="font-black text-sm">{item.total}</span>
                        </div>
                      </div>
                    </div>

                    {item.remark && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                        <span className="text-slate-400 font-bold mr-1">Teacher Qualitative Remark:</span>
                        <span>"{item.remark}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actual Evidence Block 2: Assignments & Homework */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  Curriculum Homework & Assignments
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {learnerDetailsMetrics?.assignments.length || 0} Recorded
              </span>
            </div>

            {(!learnerDetailsMetrics || learnerDetailsMetrics.assignments.length === 0) ? (
              <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
                <span className="text-lg block">📝</span>
                <p className="text-xs text-slate-400">
                  No homework assignments submitted or marked for this learner in {selectedSubject}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {learnerDetailsMetrics.assignments.map((asg) => {
                  const submission = asg.submissions?.[selectedLearner.upi] || asg.submissions?.[selectedLearner.id];

                  return (
                    <div
                      key={asg.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-xs">{asg.title}</h5>
                          {submission?.status && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                submission.status === 'Marked'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {submission.status}
                            </span>
                          )}
                        </div>
                        {asg.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {asg.description}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          Due Date: {asg.dueDate}
                        </span>
                      </div>

                      {submission?.score !== undefined && (
                        <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs shrink-0 self-end sm:self-center">
                          Score: {submission.score} / 10
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actual Evidence Block 3: Diagnosed Focus Areas (Strengths & Needs) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-black text-white">
                  Diagnosed Learner Focus Areas (Subject Support Plan)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {learnerFocusAreas.length} Flagged
              </span>
            </div>

            {learnerFocusAreas.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
                <span className="text-lg block">🎯</span>
                <p className="text-xs text-slate-400">
                  No active learning difficulties or focus alerts flagged for {selectedLearner.name} in {selectedSubject}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {learnerFocusAreas.map((fz) => (
                  <div
                    key={fz.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          {fz.status}
                        </span>
                        <h5 className="font-bold text-white text-xs">
                          {fz.strand} {fz.subStrand ? `• ${fz.subStrand}` : ''}
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {fz.dateReported?.split('T')[0]}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="text-slate-300">
                        <span className="text-slate-400 font-bold">Teacher Diagnosis: </span>
                        {fz.teacherNote}
                      </div>
                      {fz.suggestedPractice && (
                        <div className="text-amber-300">
                          <span className="text-amber-400/80 font-bold">Suggested Remedial Practice: </span>
                          {fz.suggestedPractice}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
