import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  History,
  UserCheck,
  UserX,
  ArrowRight,
  Filter,
  Search,
  FileText,
  ShieldAlert,
  Printer,
  ChevronRight,
  RefreshCw,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  TrendingUp,
  X,
  FileCheck,
  Users,
  Edit2,
  Copy,
  Info,
} from 'lucide-react';
import {
  dataLayer,
  PupilRecord,
  AcademicYearRecord,
  CatAssessmentRecord,
  DailyAttendanceRecord,
  LessonRecord,
  FocusZoneRecord,
  PromotionDecisionRecord,
  PromotionDecisionType,
  PromotionAuditLog,
  NEXT_GRADE_MAP,
  LRA_GRADES,
} from '../services/dataLayer.ts';

interface AdminPromotionModuleProps {
  onNavigateHome: () => void;
  adminName?: string;
}

export function AdminPromotionModule({
  onNavigateHome,
  adminName = 'Principal / School Office',
}: AdminPromotionModuleProps) {
  // ---------------------------------------------------------------------------
  // 1. DATA STATE
  // ---------------------------------------------------------------------------
  const [pupils, setPupils] = useState<PupilRecord[]>(() => dataLayer.getPupils());
  const [academicYears, setAcademicYears] = useState<AcademicYearRecord[]>(() => dataLayer.getAcademicYears());
  const [activeYearRec, setActiveYearRec] = useState<AcademicYearRecord | null>(() => dataLayer.getActiveAcademicYear());

  // Determine selected academic year for promotion review
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const act = dataLayer.getActiveAcademicYear();
    return act?.year || '2026';
  });

  // Target next academic year (e.g. 2027 if current is 2026)
  const [nextYear, setNextYear] = useState<string>(() => {
    const act = dataLayer.getActiveAcademicYear();
    const currNum = parseInt(act?.year || '2026', 10);
    return isNaN(currNum) ? '2027' : (currNum + 1).toString();
  });

  // Official Closing Date
  const [closingDate, setClosingDate] = useState<string>(() => {
    const act = dataLayer.getActiveAcademicYear();
    const t3 = act?.terms?.find((t) => t.term === 'Term 3');
    return t3?.closeDate || new Date().toISOString().split('T')[0];
  });

  const [closingNotes, setClosingNotes] = useState<string>('');

  // Decisions & Audit Logs from dataLayer
  const [decisions, setDecisions] = useState<PromotionDecisionRecord[]>(() =>
    dataLayer.getPromotionDecisions(selectedYear)
  );
  const [auditLogs, setAuditLogs] = useState<PromotionAuditLog[]>(() =>
    dataLayer.getPromotionAuditLogs(selectedYear)
  );

  // Active Tab
  const [activeModuleTab, setActiveModuleTab] = useState<'roster' | 'checklist' | 'wizard' | 'archives'>('roster');

  // Filters & Search
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [decisionFilter, setDecisionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Learners for Batch Actions
  const [selectedPupilIds, setSelectedPupilIds] = useState<string[]>([]);

  // Modals
  const [dossierPupil, setDossierPupil] = useState<PupilRecord | null>(null);
  const [correctionPupil, setCorrectionPupil] = useState<PupilRecord | null>(null);
  const [correctionGrade, setCorrectionGrade] = useState<string>('Grade 1');
  const [correctionDecision, setCorrectionDecision] = useState<PromotionDecisionType>('Promote');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [correctionAdmin, setCorrectionAdmin] = useState<string>(adminName);

  const [notesModalPupil, setNotesModalPupil] = useState<{ id: string; name: string; notes: string } | null>(null);

  // Year Closure Dialog State
  const [showConfirmCloseDialog, setShowConfirmCloseDialog] = useState<boolean>(false);
  const [adminAuthConfirmCode, setAdminAuthConfirmCode] = useState<string>('');
  const [closeError, setCloseError] = useState<string>('');
  const [closeSuccessResult, setCloseSuccessResult] = useState<{
    promotedCount: number;
    retainedCount: number;
    transferredCount: number;
    alumniCount: number;
    message: string;
  } | null>(null);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Re-sync with dataLayer when selectedYear changes
  const reloadData = () => {
    setPupils(dataLayer.getPupils());
    setAcademicYears(dataLayer.getAcademicYears());
    setActiveYearRec(dataLayer.getActiveAcademicYear());
    setDecisions(dataLayer.getPromotionDecisions(selectedYear));
    setAuditLogs(dataLayer.getPromotionAuditLogs(selectedYear));
  };

  useEffect(() => {
    reloadData();
  }, [selectedYear]);

  // Check if selected academic year is closed/locked
  const currentSelectedYearRecord = useMemo(() => {
    return academicYears.find((y) => y.year === selectedYear);
  }, [academicYears, selectedYear]);

  const isYearClosed = Boolean(currentSelectedYearRecord?.isClosed || currentSelectedYearRecord?.isLocked);

  // Unified available academic year options with unique keys
  const availableAcademicYearOptions = useMemo(() => {
    const yearsSet = new Set<string>();
    academicYears.forEach((ay) => {
      if (ay.year) yearsSet.add(ay.year);
    });
    yearsSet.add('2026');
    yearsSet.add('2025');
    const sorted = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    return sorted.map((y) => {
      const match = academicYears.find((ay) => ay.year === y);
      return {
        year: y,
        label: `${y}${match?.isCurrent ? ' (Active)' : ''}${match?.isClosed ? ' 🔒' : ''}`,
      };
    });
  }, [academicYears]);

  // ---------------------------------------------------------------------------
  // 2. REAL LEARNER ACADEMIC METRICS COMPUTATION (NO FAKE DATA)
  // ---------------------------------------------------------------------------
  const allCatsForYear = useMemo(() => {
    return dataLayer.getCats({ academicYear: selectedYear });
  }, [selectedYear]);

  const allAttendanceForYear = useMemo(() => {
    return dataLayer.getAttendance();
  }, []);

  const allLessonsForYear = useMemo(() => {
    return dataLayer.getLessons({ academicYear: selectedYear });
  }, [selectedYear]);

  const allFocusZone = useMemo(() => {
    return dataLayer.getFocusZoneRecords();
  }, []);

  // Map each pupil to their computed academic standing for this year
  const pupilAcademicSummaries = useMemo(() => {
    const summaryMap = new Map<
      string,
      {
        averageScore: number | null;
        band: 'EE' | 'ME' | 'AE' | 'BE' | null;
        totalAssessments: number;
        attendancePercentage: number | null;
        activeFocusIssues: number;
      }
    >();

    pupils.forEach((pupil) => {
      // 1. CAT Scores
      let scoreSum = 0;
      let count = 0;
      allCatsForYear.forEach((cat) => {
        const pScore = cat.scores[pupil.upi] || cat.scores[pupil.id];
        if (pScore && typeof pScore.total === 'number') {
          scoreSum += pScore.total;
          count++;
        }
      });

      const avgScore = count > 0 ? Math.round((scoreSum / count) * 10) / 10 : null;
      let band: 'EE' | 'ME' | 'AE' | 'BE' | null = null;
      if (avgScore !== null) {
        if (avgScore >= 80) band = 'EE';
        else if (avgScore >= 60) band = 'ME';
        else if (avgScore >= 40) band = 'AE';
        else band = 'BE';
      }

      // 2. Attendance
      let presentDays = 0;
      let totalLoggedDays = 0;
      allAttendanceForYear.forEach((att) => {
        if (att.grade === pupil.grade && att.records) {
          const status = att.records[pupil.upi] || att.records[pupil.id];
          if (status) {
            totalLoggedDays++;
            if (status === 'Present') presentDays++;
          }
        }
      });
      const attPct = totalLoggedDays > 0 ? Math.round((presentDays / totalLoggedDays) * 100) : null;

      // 3. Focus Zone
      const focusIssues = allFocusZone.filter(
        (fz) => (fz.pupilUpi === pupil.upi || fz.pupilName === pupil.name) && fz.status === 'Active'
      ).length;

      summaryMap.set(pupil.id, {
        averageScore: avgScore,
        band,
        totalAssessments: count,
        attendancePercentage: attPct,
        activeFocusIssues: focusIssues,
      });
    });

    return summaryMap;
  }, [pupils, allCatsForYear, allAttendanceForYear, allFocusZone]);

  // Active learners (those in Grade 1 to 6)
  const activeLearners = useMemo(() => {
    return pupils.filter((p) => p.status === 'Active' || (isYearClosed && p.promotionStatus === 'Year Closed'));
  }, [pupils, isYearClosed]);

  // Ensure every active learner has a corresponding decision record in state
  const enrichedLearners = useMemo(() => {
    return activeLearners.map((pupil) => {
      const existingDec = decisions.find((d) => d.pupilId === pupil.id || d.pupilUpi === pupil.upi);
      const metrics = pupilAcademicSummaries.get(pupil.id);

      const recommendedNext = NEXT_GRADE_MAP[pupil.grade] || (pupil.grade === 'Grade 6' ? 'Alumni' : pupil.grade);

      // Decision defaults to Pending (requires authorized School Office decision)
      const currentDecision: PromotionDecisionType = existingDec?.decision || 'Pending';
      const targetGrade = existingDec?.targetGrade || (currentDecision === 'Promote' ? recommendedNext : pupil.grade);
      const status = isYearClosed ? 'Year Closed' : (existingDec?.status || 'Pending');

      return {
        pupil,
        decision: currentDecision,
        targetGrade,
        status,
        notes: existingDec?.notes || '',
        decidedBy: existingDec?.decidedBy || '',
        decidedAt: existingDec?.decidedAt || '',
        isExecuted: existingDec?.isExecuted || isYearClosed,
        metrics: metrics || {
          averageScore: null,
          band: null,
          totalAssessments: 0,
          attendancePercentage: null,
          activeFocusIssues: 0,
        },
      };
    });
  }, [activeLearners, decisions, pupilAcademicSummaries, isYearClosed]);

  // ---------------------------------------------------------------------------
  // 3. PRE-FLIGHT CHECKLIST COMPUTATIONS
  // ---------------------------------------------------------------------------
  const checklist = useMemo(() => {
    // 1. Pending Decisions
    const pendingLearners = enrichedLearners.filter((l) => l.decision === 'Pending');

    // 2. Missing Assessment Records
    // Check which grades have zero CAT records in this academic year
    const gradesWithoutCats = LRA_GRADES.filter(
      (g) => !allCatsForYear.some((c) => c.grade === g)
    );
    // Count learners with zero CAT scores
    const learnersWithNoCats = enrichedLearners.filter((l) => l.metrics.totalAssessments === 0);

    // 3. Unfinished Record of Work
    const unfinishedLessons = allLessonsForYear.filter((l) => l.status !== 'Taught');

    // 4. Attendance Coverage
    const hasAttendanceRecords = allAttendanceForYear.length > 0;

    // 5. Active Focus Zone items
    const unresolvedFocusZone = allFocusZone.filter((fz) => fz.status === 'Active');

    // Checklist status flags
    const item1Resolved = pendingLearners.length === 0;
    const item2Resolved = gradesWithoutCats.length === 0 && learnersWithNoCats.length === 0;
    const item3Resolved = unfinishedLessons.length === 0;
    const item4Resolved = hasAttendanceRecords;
    const item5Resolved = unresolvedFocusZone.length === 0;

    const allPassed = item1Resolved && item4Resolved; // Critical must-pass

    return {
      pendingLearners,
      gradesWithoutCats,
      learnersWithNoCats,
      unfinishedLessons,
      hasAttendanceRecords,
      unresolvedFocusZone,
      item1Resolved,
      item2Resolved,
      item3Resolved,
      item4Resolved,
      item5Resolved,
      allPassed,
    };
  }, [enrichedLearners, allCatsForYear, allLessonsForYear, allAttendanceForYear, allFocusZone]);

  // ---------------------------------------------------------------------------
  // 4. FILTERED ROSTER FOR TABLE
  // ---------------------------------------------------------------------------
  const filteredLearners = useMemo(() => {
    return enrichedLearners.filter((item) => {
      // Grade Filter
      if (gradeFilter !== 'All' && item.pupil.grade !== gradeFilter) return false;

      // Decision Filter
      if (decisionFilter !== 'All') {
        if (decisionFilter === 'Pending' && item.decision !== 'Pending') return false;
        if (decisionFilter === 'Promoted' && item.decision !== 'Promote') return false;
        if (decisionFilter === 'Retained' && item.decision !== 'Retain') return false;
        if (decisionFilter === 'Transferred' && item.decision !== 'Transfer') return false;
        if (decisionFilter === 'Alumni' && item.decision !== 'Alumni') return false;
      }

      // Search Query (UPI or Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.pupil.name.toLowerCase().includes(q);
        const matchUpi = item.pupil.upi.toLowerCase().includes(q);
        const matchParent = item.pupil.parentName?.toLowerCase().includes(q);
        if (!matchName && !matchUpi && !matchParent) return false;
      }

      return true;
    });
  }, [enrichedLearners, gradeFilter, decisionFilter, searchQuery]);

  // Stats summary counts
  const stats = useMemo(() => {
    const total = enrichedLearners.length;
    const pending = enrichedLearners.filter((l) => l.decision === 'Pending').length;
    const promoted = enrichedLearners.filter((l) => l.decision === 'Promote').length;
    const retained = enrichedLearners.filter((l) => l.decision === 'Retain').length;
    const transferred = enrichedLearners.filter((l) => l.decision === 'Transfer').length;
    const alumni = enrichedLearners.filter((l) => l.decision === 'Alumni').length;
    return { total, pending, promoted, retained, transferred, alumni };
  }, [enrichedLearners]);

  // ---------------------------------------------------------------------------
  // 5. INDIVIDUAL DECISION HANDLER
  // ---------------------------------------------------------------------------
  const handleSetDecision = (
    pupilId: string,
    newDecision: PromotionDecisionType,
    customTargetGrade?: string
  ) => {
    if (isYearClosed) {
      showToast('Cannot change decisions directly: Academic year is officially closed. Use Admin Correction instead.');
      return;
    }

    const learnerItem = enrichedLearners.find((l) => l.pupil.id === pupilId);
    if (!learnerItem) return;

    const pupil = learnerItem.pupil;
    const recommendedNext = NEXT_GRADE_MAP[pupil.grade] || (pupil.grade === 'Grade 6' ? 'Alumni' : pupil.grade);
    const targetGrade =
      customTargetGrade ||
      (newDecision === 'Promote' ? recommendedNext : newDecision === 'Alumni' ? 'Alumni' : pupil.grade);

    const newRecord: PromotionDecisionRecord = {
      id: `dec_${pupil.id}_${selectedYear}`,
      pupilId: pupil.id,
      pupilUpi: pupil.upi,
      pupilName: pupil.name,
      currentGrade: pupil.grade,
      targetGrade,
      academicYear: selectedYear,
      nextAcademicYear: nextYear,
      decision: newDecision,
      status: newDecision === 'Pending' ? 'Pending' : 'Pending',
      notes: learnerItem.notes,
      decidedBy: adminName,
      decidedAt: new Date().toISOString(),
      averageCatScore: learnerItem.metrics.averageScore || undefined,
      overallBand: learnerItem.metrics.band || undefined,
      assessmentsCount: learnerItem.metrics.totalAssessments,
      attendanceRate: learnerItem.metrics.attendancePercentage || undefined,
    };

    dataLayer.savePromotionDecision(newRecord);
    dataLayer.addPromotionAuditLog({
      action: 'DECISION_CHANGED',
      academicYear: selectedYear,
      nextAcademicYear: nextYear,
      pupilId: pupil.id,
      pupilUpi: pupil.upi,
      pupilName: pupil.name,
      adminName,
      oldValue: learnerItem.decision,
      newValue: newDecision,
      details: `Promotion decision for ${pupil.name} (${pupil.upi}) updated to ${newDecision} (Target: ${targetGrade}).`,
    });

    setDecisions(dataLayer.getPromotionDecisions(selectedYear));
    setAuditLogs(dataLayer.getPromotionAuditLogs(selectedYear));
    showToast(`Decision updated: ${pupil.name} → ${newDecision}`);
  };

  // ---------------------------------------------------------------------------
  // 6. BATCH ACTIONS
  // ---------------------------------------------------------------------------
  const handleBatchSetRecommended = () => {
    if (isYearClosed) {
      showToast('Academic year is closed. Batch adjustments disabled.');
      return;
    }

    const targets = selectedPupilIds.length > 0
      ? enrichedLearners.filter((l) => selectedPupilIds.includes(l.pupil.id))
      : filteredLearners;

    if (targets.length === 0) return;

    const updatedDecisions: PromotionDecisionRecord[] = targets.map((item) => {
      const p = item.pupil;
      const isGrad = p.grade === 'Grade 6';
      const dec: PromotionDecisionType = isGrad ? 'Alumni' : 'Promote';
      const targetGrade = isGrad ? 'Alumni' : (NEXT_GRADE_MAP[p.grade] || p.grade);

      return {
        id: `dec_${p.id}_${selectedYear}`,
        pupilId: p.id,
        pupilUpi: p.upi,
        pupilName: p.name,
        currentGrade: p.grade,
        targetGrade,
        academicYear: selectedYear,
        nextAcademicYear: nextYear,
        decision: dec,
        status: 'Pending',
        notes: item.notes || 'Batch standard progression authorized by School Office',
        decidedBy: adminName,
        decidedAt: new Date().toISOString(),
        averageCatScore: item.metrics.averageScore || undefined,
        overallBand: item.metrics.band || undefined,
        assessmentsCount: item.metrics.totalAssessments,
        attendanceRate: item.metrics.attendancePercentage || undefined,
      };
    });

    dataLayer.savePromotionDecisions(updatedDecisions);
    dataLayer.addPromotionAuditLog({
      action: 'BATCH_DECISION',
      academicYear: selectedYear,
      nextAcademicYear: nextYear,
      adminName,
      details: `Batch progression applied to ${targets.length} learners for academic year ${selectedYear}.`,
    });

    setDecisions(dataLayer.getPromotionDecisions(selectedYear));
    setAuditLogs(dataLayer.getPromotionAuditLogs(selectedYear));
    setSelectedPupilIds([]);
    showToast(`Updated progression decisions for ${targets.length} learners.`);
  };

  const handleBatchRetain = () => {
    if (isYearClosed) return;
    const targets = selectedPupilIds.length > 0
      ? enrichedLearners.filter((l) => selectedPupilIds.includes(l.pupil.id))
      : filteredLearners;

    if (targets.length === 0) return;

    const updatedDecisions: PromotionDecisionRecord[] = targets.map((item) => {
      const p = item.pupil;
      return {
        id: `dec_${p.id}_${selectedYear}`,
        pupilId: p.id,
        pupilUpi: p.upi,
        pupilName: p.name,
        currentGrade: p.grade,
        targetGrade: p.grade,
        academicYear: selectedYear,
        nextAcademicYear: nextYear,
        decision: 'Retain',
        status: 'Pending',
        notes: item.notes || 'Retained in current grade by School Office decision',
        decidedBy: adminName,
        decidedAt: new Date().toISOString(),
        averageCatScore: item.metrics.averageScore || undefined,
        overallBand: item.metrics.band || undefined,
        assessmentsCount: item.metrics.totalAssessments,
        attendanceRate: item.metrics.attendancePercentage || undefined,
      };
    });

    dataLayer.savePromotionDecisions(updatedDecisions);
    dataLayer.addPromotionAuditLog({
      action: 'BATCH_DECISION',
      academicYear: selectedYear,
      nextAcademicYear: nextYear,
      adminName,
      details: `Batch retention applied to ${targets.length} learners for academic year ${selectedYear}.`,
    });

    setDecisions(dataLayer.getPromotionDecisions(selectedYear));
    setAuditLogs(dataLayer.getPromotionAuditLogs(selectedYear));
    setSelectedPupilIds([]);
    showToast(`Marked ${targets.length} learners as Retained.`);
  };

  // ---------------------------------------------------------------------------
  // 7. SAVE NOTES MODAL
  // ---------------------------------------------------------------------------
  const handleSaveNotes = () => {
    if (!notesModalPupil) return;
    const dec = decisions.find((d) => d.pupilId === notesModalPupil.id);
    if (dec) {
      dataLayer.savePromotionDecision({
        ...dec,
        notes: notesModalPupil.notes,
      });
    } else {
      const item = enrichedLearners.find((l) => l.pupil.id === notesModalPupil.id);
      if (item) {
        dataLayer.savePromotionDecision({
          id: `dec_${item.pupil.id}_${selectedYear}`,
          pupilId: item.pupil.id,
          pupilUpi: item.pupil.upi,
          pupilName: item.pupil.name,
          currentGrade: item.pupil.grade,
          targetGrade: item.targetGrade,
          academicYear: selectedYear,
          nextAcademicYear: nextYear,
          decision: item.decision,
          status: item.status as any,
          notes: notesModalPupil.notes,
          decidedBy: adminName,
          decidedAt: new Date().toISOString(),
        });
      }
    }
    setDecisions(dataLayer.getPromotionDecisions(selectedYear));
    setNotesModalPupil(null);
    showToast('Saved promotion remarks.');
  };

  // ---------------------------------------------------------------------------
  // 8. YEAR CLOSURE EXECUTION HANDLER
  // ---------------------------------------------------------------------------
  const handleExecuteYearClosure = (e: React.FormEvent) => {
    e.preventDefault();
    setCloseError('');

    if (checklist.pendingLearners.length > 0) {
      setCloseError(
        `Cannot close academic year: ${checklist.pendingLearners.length} learners still have pending promotion decisions. All learners must have an authorized decision.`
      );
      return;
    }

    if (!closingDate) {
      setCloseError('Please select a valid official closing date.');
      return;
    }

    if (!nextYear || nextYear === selectedYear) {
      setCloseError('Next Academic Year must be distinct from the closing year.');
      return;
    }

    // Require admin verification
    if (adminAuthConfirmCode.trim() !== 'CLOSE' && adminAuthConfirmCode.trim() !== 'LRA. 2026@little') {
      setCloseError('Please type "CLOSE" to authorize closing the academic year.');
      return;
    }

    // Execute official closing in dataLayer
    const result = dataLayer.closeAcademicYearAndPromote({
      academicYear: selectedYear,
      nextAcademicYear: nextYear,
      closingDate,
      adminName,
      closingNotes: closingNotes.trim() || undefined,
    });

    if (result.success) {
      setCloseSuccessResult(result);
      setShowConfirmCloseDialog(false);
      setAdminAuthConfirmCode('');
      reloadData();
      showToast(result.message);
    } else {
      setCloseError(result.message);
    }
  };

  // ---------------------------------------------------------------------------
  // 9. POST-CLOSURE CORRECTION HANDLER
  // ---------------------------------------------------------------------------
  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionPupil) return;

    if (!correctionReason.trim()) {
      alert('Please enter an authorized reason for this post-closure placement correction.');
      return;
    }

    const success = dataLayer.correctLearnerPlacement({
      pupilId: correctionPupil.id,
      academicYear: selectedYear,
      nextAcademicYear: nextYear,
      newGrade: correctionGrade,
      newDecision: correctionDecision,
      reason: correctionReason.trim(),
      adminName: correctionAdmin.trim() || adminName,
    });

    if (success) {
      reloadData();
      setCorrectionPupil(null);
      setCorrectionReason('');
      showToast(`Corrected placement for ${correctionPupil.name} and logged to permanent audit trail.`);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* TOP HEADER CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                School Office Promotion & Year Closure
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isYearClosed
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isYearClosed ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Year {selectedYear} Closed & Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Year {selectedYear} Open for Decisions</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Academic Year Closing & Learner Promotion
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Official CBC progression engine. Preserves permanent learner IDs, past CAT scores,
              attendance, and dossiers permanently attached to historical academic years.
            </p>
          </div>

          {/* Academic Year Selection & Closing Parameters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Academic Year Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">Academic Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
              >
                {availableAcademicYearOptions.map((opt) => (
                  <option key={opt.year} value={opt.year} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Next Academic Year Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">Next Year:</span>
              <input
                type="text"
                value={nextYear}
                onChange={(e) => setNextYear(e.target.value)}
                className="w-16 bg-transparent text-emerald-400 font-bold font-mono focus:outline-none"
                placeholder="2027"
              />
            </div>

            {/* Closing Date */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">Closing Date:</span>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Print Promotion Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Learners</span>
            <span className="text-base font-black text-white font-mono">{stats.total}</span>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              stats.pending > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-950/70 border-slate-800/80 text-slate-400'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">Pending Decision</span>
            <span className="text-base font-black font-mono">{stats.pending}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <span className="text-[10px] uppercase font-bold block">Promote (Next Grade)</span>
            <span className="text-base font-black font-mono">{stats.promoted}</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
            <span className="text-[10px] uppercase font-bold block">Retain (Same Grade)</span>
            <span className="text-base font-black font-mono">{stats.retained}</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <span className="text-[10px] uppercase font-bold block">Transfer Out</span>
            <span className="text-base font-black font-mono">{stats.transferred}</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <span className="text-[10px] uppercase font-bold block">Graduate / Alumni</span>
            <span className="text-base font-black font-mono">{stats.alumni}</span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveModuleTab('roster')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeModuleTab === 'roster'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Promotion Roster</span>
            </button>

            <button
              onClick={() => setActiveModuleTab('checklist')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeModuleTab === 'checklist'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Pre-Flight Checklist</span>
              {!checklist.allPassed && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveModuleTab('wizard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeModuleTab === 'wizard'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Official Year Closure</span>
            </button>

            <button
              onClick={() => setActiveModuleTab('archives')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeModuleTab === 'archives'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Archives & Audit Log</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {!isYearClosed && (
              <>
                <button
                  onClick={handleBatchSetRecommended}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold transition cursor-pointer flex items-center gap-1.5"
                  title="Apply standard progression: Grades 1-5 advance, Grade 6 graduates"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Recommended Progression</span>
                </button>

                <button
                  onClick={() => setShowConfirmCloseDialog(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Close Academic Year...</span>
                </button>
              </>
            )}

            {isYearClosed && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Year Closed & Locked</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL AFTER CLOSURE */}
      {closeSuccessResult && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 space-y-3 animate-in zoom-in-95">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Academic Year Officially Closed Successfully</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {closeSuccessResult.message}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Promoted to Next Grade</span>
              <span className="font-black text-emerald-400 font-mono text-sm">
                {closeSuccessResult.promotedCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Retained in Grade</span>
              <span className="font-black text-blue-400 font-mono text-sm">
                {closeSuccessResult.retainedCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Transferred</span>
              <span className="font-black text-purple-400 font-mono text-sm">
                {closeSuccessResult.transferredCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Graduated / Alumni</span>
              <span className="font-black text-cyan-400 font-mono text-sm">
                {closeSuccessResult.alumniCount}
              </span>
            </div>
          </div>
          <button
            onClick={() => setCloseSuccessResult(null)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 1: PROMOTION ROSTER
          ------------------------------------------------------------- */}
      {activeModuleTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Grade Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-bold">Grade:</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  {['All', ...LRA_GRADES].map((g) => (
                    <option key={g} value={g} className="bg-slate-900">
                      {g === 'All' ? 'All Grades' : g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status / Decision Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-bold">Status:</span>
                <select
                  value={decisionFilter}
                  onChange={(e) => setDecisionFilter(e.target.value)}
                  className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
                >
                  <option key="All" value="All" className="bg-slate-900 text-white">All Decisions</option>
                  <option key="Pending" value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                  <option key="Promoted" value="Promoted" className="bg-slate-900 text-emerald-400">Promoted</option>
                  <option key="Retained" value="Retained" className="bg-slate-900 text-blue-400">Retained</option>
                  <option key="Transferred" value="Transferred" className="bg-slate-900 text-purple-400">Transferred</option>
                  <option key="Alumni" value="Alumni" className="bg-slate-900 text-cyan-400">Alumni</option>
                </select>
              </div>

              {/* Search Query */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or UPI..."
                  className="w-full bg-transparent text-white focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Batch Controls */}
            {!isYearClosed && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchRetain}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-medium transition cursor-pointer"
                >
                  Mark Selected as Retained
                </button>
              </div>
            )}
          </div>

          {/* Roster Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedPupilIds.length > 0 &&
                          selectedPupilIds.length === filteredLearners.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPupilIds(filteredLearners.map((l) => l.pupil.id));
                          } else {
                            setSelectedPupilIds([]);
                          }
                        }}
                        className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Learner & Permanent ID</th>
                    <th className="p-3">Current Grade</th>
                    <th className="p-3">Final Academic Record</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Next Year Placement</th>
                    <th className="p-3">Official Decision</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLearners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No learners found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLearners.map((item) => {
                      const { pupil, decision, targetGrade, metrics, status } = item;
                      const isSelected = selectedPupilIds.includes(pupil.id);

                      return (
                        <tr
                          key={pupil.id}
                          className={`hover:bg-slate-800/40 transition ${
                            isSelected ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPupilIds((prev) => [...prev, pupil.id]);
                                } else {
                                  setSelectedPupilIds((prev) => prev.filter((id) => id !== pupil.id));
                                }
                              }}
                              className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Learner & Permanent ID */}
                          <td className="p-3">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{pupil.name}</span>
                                <span className="text-[10px] text-slate-500">({pupil.gender})</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400">
                                <span>{pupil.upi}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(pupil.upi);
                                    showToast(`Copied UPI: ${pupil.upi}`);
                                  }}
                                  className="text-slate-500 hover:text-slate-300"
                                  title="Copy UPI"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Current Grade */}
                          <td className="p-3 font-semibold text-slate-200">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
                              {pupil.grade}
                            </span>
                          </td>

                          {/* Final Academic Record */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {metrics.averageScore !== null ? (
                                  <>
                                    <span className="font-black font-mono text-white text-xs">
                                      {metrics.averageScore}%
                                    </span>
                                    {metrics.band && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          metrics.band === 'EE'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : metrics.band === 'ME'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : metrics.band === 'AE'
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'bg-rose-500/20 text-rose-400'
                                        }`}
                                      >
                                        {metrics.band}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-500 italic text-[11px]">
                                    No CAT scores
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {metrics.totalAssessments} assessments logged
                              </div>
                            </div>
                          </td>

                          {/* Attendance */}
                          <td className="p-3">
                            {metrics.attendancePercentage !== null ? (
                              <div className="space-y-0.5">
                                <span
                                  className={`font-mono font-bold text-xs ${
                                    metrics.attendancePercentage >= 80
                                      ? 'text-emerald-400'
                                      : metrics.attendancePercentage >= 60
                                      ? 'text-amber-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {metrics.attendancePercentage}%
                                </span>
                                <span className="text-[10px] text-slate-500 block">Attendance</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Target Next Grade */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span
                                className={`font-bold font-mono text-xs ${
                                  targetGrade === 'Alumni'
                                    ? 'text-cyan-400'
                                    : targetGrade === pupil.grade
                                    ? 'text-blue-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {targetGrade}
                              </span>
                            </div>
                          </td>

                          {/* Decision Selection Dropdown */}
                          <td className="p-3">
                            {!isYearClosed ? (
                              <select
                                value={decision}
                                onChange={(e) =>
                                  handleSetDecision(pupil.id, e.target.value as PromotionDecisionType)
                                }
                                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                                  decision === 'Promote'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : decision === 'Retain'
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                    : decision === 'Transfer'
                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                    : decision === 'Alumni'
                                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                }`}
                              >
                                <option key="Pending" value="Pending" className="bg-slate-900 text-amber-300">
                                  ⏳ Pending
                                </option>
                                <option key="Promote" value="Promote" className="bg-slate-900 text-emerald-300">
                                  ✅ Promote
                                </option>
                                <option key="Retain" value="Retain" className="bg-slate-900 text-blue-300">
                                  🔄 Retain in Grade
                                </option>
                                <option key="Transfer" value="Transfer" className="bg-slate-900 text-purple-300">
                                  📤 Transfer Out
                                </option>
                                <option key="Alumni" value="Alumni" className="bg-slate-900 text-cyan-300">
                                  🎓 Graduate / Alumni
                                </option>
                              </select>
                            ) : (
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono border ${
                                  decision === 'Promote'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : decision === 'Retain'
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                    : decision === 'Transfer'
                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                }`}
                              >
                                {decision}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setDossierPupil(pupil)}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                title="View Learner History Dossier"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {!isYearClosed && (
                                <button
                                  onClick={() =>
                                    setNotesModalPupil({
                                      id: pupil.id,
                                      name: pupil.name,
                                      notes: item.notes,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                                  title="Add/Edit Administrative Notes"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isYearClosed && (
                                <button
                                  onClick={() => {
                                    setCorrectionPupil(pupil);
                                    setCorrectionGrade(pupil.grade);
                                    setCorrectionDecision(decision);
                                    setCorrectionReason('');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold"
                                  title="Post-Closure Correction"
                                >
                                  Correct
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: PRE-FLIGHT COMPLETION CHECKLIST
          ------------------------------------------------------------- */}
      {activeModuleTab === 'checklist' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span>Pre-Closure Completion Checklist</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Audits all records for Academic Year {selectedYear} before allowing official closure.
                All promotion decisions must be authorized before finalizing.
              </p>
            </div>

            {/* Checklist Items Grid */}
            <div className="space-y-3">
              {/* Item 1: Pending Decisions */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  checklist.item1Resolved
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {checklist.item1Resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      1. Authorized Promotion Decisions
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {checklist.item1Resolved
                        ? `All ${activeLearners.length} active learners have received authorized School Office decisions.`
                        : `${checklist.pendingLearners.length} learners have no promotion decision assigned (Pending).`}
                    </p>
                    {!checklist.item1Resolved && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setDecisionFilter('Pending');
                            setActiveModuleTab('roster');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          Review Pending Learners ({checklist.pendingLearners.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                    checklist.item1Resolved
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {checklist.item1Resolved ? 'PASSED' : 'ACTION REQUIRED'}
                </span>
              </div>

              {/* Item 2: Assessment Records */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  checklist.item2Resolved
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {checklist.item2Resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      2. Assessment & CAT Records Audit
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {allCatsForYear.length > 0
                        ? `${allCatsForYear.length} CAT records logged across curriculum learning areas.`
                        : 'No official CAT assessments stored yet for this academic year.'}
                      {checklist.learnersWithNoCats.length > 0 &&
                        ` (${checklist.learnersWithNoCats.length} learners have no CAT records on file).`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400">
                  {allCatsForYear.length} Records
                </span>
              </div>

              {/* Item 3: Record of Work */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  checklist.item3Resolved
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {checklist.item3Resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      3. Teacher Record of Work Completion
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {allLessonsForYear.length} total lessons scheduled.{' '}
                      {checklist.unfinishedLessons.length === 0
                        ? 'All lessons marked as Taught.'
                        : `${checklist.unfinishedLessons.length} lessons still marked Pending/Rescheduled.`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400">
                  {allLessonsForYear.filter((l) => l.status === 'Taught').length} / {allLessonsForYear.length} Taught
                </span>
              </div>

              {/* Item 4: Outstanding Attendance Records */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  checklist.item4Resolved
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {checklist.item4Resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      4. Attendance Records Verification
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {allAttendanceForYear.length > 0
                        ? `${allAttendanceForYear.length} daily attendance logs recorded across grade classes.`
                        : 'No daily attendance registers stored yet for this academic year.'}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                    checklist.item4Resolved
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {checklist.item4Resolved ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>

              {/* Item 5: Other Required Records / Focus Zone */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  checklist.item5Resolved
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {checklist.item5Resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      5. Focus Zone & Term Dates Clearance
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {checklist.unresolvedFocusZone.length === 0
                        ? 'All Focus Zone remediation items cleared.'
                        : `${checklist.unresolvedFocusZone.length} active Focus Zone entries. These will carry forward as remediation flags.`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400">
                  {checklist.unresolvedFocusZone.length} Active Flags
                </span>
              </div>
            </div>

            {/* Ready to close banner */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">
                  {checklist.allPassed
                    ? 'All critical checks passed. You may proceed to officially close the academic year.'
                    : 'Resolve outstanding checklist items before closing the academic year.'}
                </span>
              </div>
              <button
                onClick={() => setActiveModuleTab('wizard')}
                disabled={!checklist.allPassed}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  checklist.allPassed
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Year Closure</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: YEAR CLOSURE WIZARD
          ------------------------------------------------------------- */}
      {activeModuleTab === 'wizard' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>Official Academic Year Closure Procedure</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorized action by Little Roses Academy School Office. Concludes the school year,
                archives completed records, and initializes learner placements for the next academic year.
              </p>
            </div>

            {/* Core Rules Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="text-amber-400 font-bold block uppercase tracking-wider text-[11px]">
                System Invariant Guarantees:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>
                  <strong>Permanent Learner IDs Preserved:</strong> A learner retains the exact same UPI throughout their schooling at LRA.
                </li>
                <li>
                  <strong>Zero Records Overwritten:</strong> Complete {selectedYear} assignments, CAT scores, teacher reflections, and attendance remain permanently attached to {selectedYear}.
                </li>
                <li>
                  <strong>Fresh New Year Records:</strong> Year {nextYear} begins with fresh assessment and attendance books. Previous marks never contaminate the new year.
                </li>
                <li>
                  <strong>Authorized Decision Model:</strong> Progression is an intentional School Office decision, never an automated marks threshold.
                </li>
              </ul>
            </div>

            {/* Status if already closed */}
            {isYearClosed ? (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-sm text-rose-400">
                  <Lock className="w-5 h-5" />
                  <span>Academic Year {selectedYear} is Officially Closed & Locked</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  This academic year was officially closed on{' '}
                  <span className="font-mono text-white font-bold">
                    {currentSelectedYearRecord?.closedAt || 'Recorded'}
                  </span>{' '}
                  by <span className="font-bold text-white">{currentSelectedYearRecord?.closedBy || 'School Office'}</span>.
                  All historical records are permanently preserved.
                </p>
                {currentSelectedYearRecord?.closingNotes && (
                  <p className="text-xs italic text-slate-400">
                    "{currentSelectedYearRecord.closingNotes}"
                  </p>
                )}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModuleTab('roster')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                  >
                    View Historical Roster
                  </button>
                  <button
                    onClick={() => setActiveModuleTab('archives')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-bold text-xs"
                  >
                    View Audit Logs
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteYearClosure} className="space-y-4">
                {/* Year parameters summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Closing Academic Year</span>
                    <span className="text-base font-black text-amber-400 font-mono">{selectedYear}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Closing Date</span>
                    <span className="text-base font-black text-white font-mono">{closingDate}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Activating Next Year</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{nextYear}</span>
                  </div>
                </div>

                {/* Closing Remarks */}
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">
                    Official Closing Remarks / Year-End Note
                  </label>
                  <textarea
                    rows={2}
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder="e.g. Term 3 concluded successfully. Approved by Little Roses Academy Academic Board."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* REQUIRED CLOSING NOTICE & CONFIRMATION BOX */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-100 space-y-3">
                  <div className="flex items-center gap-2 font-black text-amber-300 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>CLOSE ACADEMIC YEAR?</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed font-semibold">
                    “After closure, this year's academic records will be preserved as historical records.
                    Promotion decisions will establish the learners' placements for the next academic year.”
                  </p>
                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      To confirm closure, type <span className="font-mono text-amber-400">CLOSE</span> below:
                    </label>
                    <input
                      type="text"
                      required
                      value={adminAuthConfirmCode}
                      onChange={(e) => setAdminAuthConfirmCode(e.target.value)}
                      placeholder="Type CLOSE to authorize"
                      className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {closeError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{closeError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Authorized Administrator: <strong className="text-white">{adminName}</strong>
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-xl shadow-rose-950/40"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Officially Close Academic Year {selectedYear}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: HISTORICAL ARCHIVES & AUDIT LOG
          ------------------------------------------------------------- */}
      {activeModuleTab === 'archives' && (
        <div className="space-y-4">
          {/* Past Academic Years Archive */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Historical Academic Years Register</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {academicYears.map((ay) => (
                <div
                  key={ay.year}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                    ay.isCurrent
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : ay.isClosed
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black font-mono">{ay.year}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ay.isCurrent
                          ? 'bg-amber-500/20 text-amber-300'
                          : ay.isClosed
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ay.isCurrent ? 'Current Active' : ay.isClosed ? 'Closed & Locked' : 'Configured'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    {ay.closedAt && (
                      <div>Closed: <span className="font-mono text-slate-200">{ay.closedAt}</span></div>
                    )}
                    {ay.closedBy && <div>By: {ay.closedBy}</div>}
                    {ay.terms && <div>{ay.terms.length} CBC Terms configured</div>}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedYear(ay.year);
                      setActiveModuleTab('roster');
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-bold transition"
                  >
                    View {ay.year} Roster →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Promotion Audit Log Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>Promotion & Year-End Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Immutable administrative log tracking all decisions, year closures, and post-closure adjustments.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {auditLogs.length} events logged
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5">Target Learner</th>
                      <th className="p-2.5">Admin Authorizer</th>
                      <th className="p-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          No audit log events recorded yet for Academic Year {selectedYear}.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/50">
                          <td className="p-2.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                log.action === 'YEAR_CLOSED'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : log.action === 'POST_CLOSURE_CORRECTION'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-200">
                            {log.pupilName ? (
                              <div>
                                <span className="font-bold">{log.pupilName}</span>
                                {log.pupilUpi && (
                                  <span className="text-[10px] text-slate-500 font-mono block">
                                    {log.pupilUpi}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500">School-Wide</span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-300">{log.adminName}</td>
                          <td className="p-2.5 text-slate-300 text-[11px] max-w-md">{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: LEARNER ACADEMIC DOSSIER & HISTORY
          ------------------------------------------------------------- */}
      {dossierPupil && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">Learner Academic History Dossier</h3>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Permanent UPI: {dossierPupil.upi}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDossierPupil(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Learner Info Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Name</span>
                <span className="font-bold text-white">{dossierPupil.name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Current Grade</span>
                <span className="font-bold text-emerald-400">{dossierPupil.grade}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Parent / Guardian</span>
                <span className="font-bold text-slate-300">{dossierPupil.parentName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Admission Date</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {new Date(dossierPupil.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Historical Academic Progression Register */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Historical Academic Years & Placement Records
              </span>

              {dossierPupil.academicYearHistory && dossierPupil.academicYearHistory.length > 0 ? (
                <div className="space-y-2">
                  {dossierPupil.academicYearHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          Academic Year {hist.academicYear} • {hist.grade}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                          {hist.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                        <div>Avg Score: {hist.averageCatScore ? `${hist.averageCatScore}%` : 'N/A'}</div>
                        <div>Band: {hist.overallBand || 'N/A'}</div>
                        <div>Attendance: {hist.attendanceRate ? `${hist.attendanceRate}%` : 'N/A'}</div>
                      </div>
                      {hist.finalRemark && (
                        <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-900">
                          Note: {hist.finalRemark} (Closed by {hist.decidedBy || 'Admin'})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                  This learner is currently in their initial enrolment academic year ({selectedYear}).
                  Historical entries will be permanently archived upon year closure.
                </div>
              )}
            </div>

            {/* Current Year CAT Scores breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {selectedYear} CAT Assessments on File
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allCatsForYear
                  .filter((cat) => cat.scores[dossierPupil.upi] || cat.scores[dossierPupil.id])
                  .map((cat) => {
                    const score = cat.scores[dossierPupil.upi] || cat.scores[dossierPupil.id];
                    return (
                      <div
                        key={cat.id}
                        className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white block">{cat.subject}</span>
                          <span className="text-[10px] text-slate-400">
                            {cat.strand} • {cat.term}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-amber-400 font-mono text-sm block">
                            {score.total}%
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">Band {score.band}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDossierPupil(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADMINISTRATIVE NOTES
          ------------------------------------------------------------- */}
      {notesModalPupil && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                Administrative Promotion Remarks
              </h3>
              <button
                onClick={() => setNotesModalPupil(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Add School Office remarks or parent consultation notes for{' '}
              <strong className="text-white">{notesModalPupil.name}</strong>.
            </p>
            <textarea
              rows={4}
              value={notesModalPupil.notes}
              onChange={(e) =>
                setNotesModalPupil({ ...notesModalPupil, notes: e.target.value })
              }
              placeholder="e.g. Recommended for extension tasks in Mathematics. Parent requested placement retention."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNotesModalPupil(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: POST-CLOSURE CORRECTION WITH MANDATORY AUDIT REASON
          ------------------------------------------------------------- */}
      {correctionPupil && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Post-Closure Placement Correction</h3>
              </div>
              <button
                onClick={() => setCorrectionPupil(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Adjust placement for <strong className="text-white">{correctionPupil.name}</strong> ({correctionPupil.upi}).
              Because Academic Year {selectedYear} is locked, this correction requires authorized justification and will be permanently recorded in the audit log.
            </p>

            <form onSubmit={handleSaveCorrection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">New Corrected Grade</label>
                <select
                  value={correctionGrade}
                  onChange={(e) => setCorrectionGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  {[...LRA_GRADES, 'Alumni'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Decision Type</label>
                <select
                  value={correctionDecision}
                  onChange={(e) => setCorrectionDecision(e.target.value as PromotionDecisionType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option key="Promote" value="Promote">Promote</option>
                  <option key="Retain" value="Retain">Retain in Grade</option>
                  <option key="Transfer" value="Transfer">Transfer Out</option>
                  <option key="Alumni" value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Authorized Reason for Adjustment <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Formal parent petition granted by Principal; learner reassessed for Grade 3."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Authorizing Admin</label>
                <input
                  type="text"
                  required
                  value={correctionAdmin}
                  onChange={(e) => setCorrectionAdmin(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionPupil(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Authorize & Log Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CONFIRM CLOSE ACADEMIC YEAR DIALOG
          ------------------------------------------------------------- */}
      {showConfirmCloseDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <h3 className="font-black text-white text-base">CLOSE ACADEMIC YEAR {selectedYear}?</h3>
              </div>
              <button
                onClick={() => setShowConfirmCloseDialog(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-100 text-xs space-y-2">
              <p className="font-bold text-rose-200">
                “After closure, this year's academic records will be preserved as historical records.
                Promotion decisions will establish the learners' placements for the next academic year.”
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Academic Year {selectedYear} will be permanently locked against accidental alteration.
                New Academic Year {nextYear} will be activated as the school's current year with fresh registers.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total Active Learners:</span>
                <span className="font-mono font-bold text-white">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Pending Decisions:</span>
                <span
                  className={`font-mono font-bold ${
                    stats.pending > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {stats.pending}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Next Academic Year:</span>
                <span className="font-mono font-bold text-emerald-400">{nextYear}</span>
              </div>
            </div>

            {stats.pending > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Warning: {stats.pending} learners are still Pending. Please review and assign promotion decisions first.
                </span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-bold">
                Type <span className="font-mono text-amber-400">CLOSE</span> to authorize:
              </label>
              <input
                type="text"
                value={adminAuthConfirmCode}
                onChange={(e) => setAdminAuthConfirmCode(e.target.value)}
                placeholder="Type CLOSE"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {closeError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold">
                {closeError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmCloseDialog(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={stats.pending > 0}
                onClick={handleExecuteYearClosure}
                className={`px-5 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg ${
                  stats.pending === 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Official Year Closure</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
