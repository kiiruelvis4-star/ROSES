import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  FolderInput,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Printer,
  X,
  Search,
  ChevronRight,
  User,
  BookOpen,
  MapPin,
  Coffee,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  dataLayer,
  TeacherAccountRecord,
  TimetableSlotItem,
  getTeacherGradeAssignments,
  LRA_GRADES,
  LRA_GRADE_SUBJECTS,
  getLraSubjectsForGrade,
} from '../services/dataLayer.ts';

// -----------------------------------------------------------------------------
// STANDARD CBC TIMETABLE PERIOD DEFINITION
// -----------------------------------------------------------------------------
export interface TimetablePeriodConfig {
  index: number;
  label: string;
  timeRange: string;
  isBreak?: boolean;
  breakLabel?: string;
  durationMins: number;
}

export const DEFAULT_TIMETABLE_PERIODS: TimetablePeriodConfig[] = [
  { index: 1, label: 'Period 1', timeRange: '08:20 - 09:00', durationMins: 40 },
  { index: 2, label: 'Period 2', timeRange: '09:00 - 09:40', durationMins: 40 },
  { index: 3, label: 'Break', timeRange: '09:40 - 10:00', isBreak: true, breakLabel: 'Health & Fruit Break', durationMins: 20 },
  { index: 4, label: 'Period 3', timeRange: '10:00 - 10:40', durationMins: 40 },
  { index: 5, label: 'Period 4', timeRange: '10:40 - 11:20', durationMins: 40 },
  { index: 6, label: 'Break', timeRange: '11:20 - 11:40', isBreak: true, breakLabel: 'Tea & Mid-Morning Break', durationMins: 20 },
  { index: 7, label: 'Period 5', timeRange: '11:40 - 12:20', durationMins: 40 },
  { index: 8, label: 'Period 6', timeRange: '12:20 - 13:00', durationMins: 40 },
  { index: 9, label: 'Lunch', timeRange: '13:00 - 14:00', isBreak: true, breakLabel: 'Lunch & Relaxation Break', durationMins: 60 },
  { index: 10, label: 'Period 7', timeRange: '14:00 - 14:40', durationMins: 40 },
  { index: 11, label: 'Period 8', timeRange: '14:40 - 15:20', durationMins: 40 },
  { index: 12, label: 'Activity', timeRange: '15:20 - 16:00', durationMins: 40, breakLabel: 'Games / Clubs / Assembly' },
];

export const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type TimetableDay = (typeof TIMETABLE_DAYS)[number];

// -----------------------------------------------------------------------------
// HELPER: AUTOMATIC TEACHER ALLOCATION
// Filter ONLY teachers who actually have this exact Grade + Subject assigned
// -----------------------------------------------------------------------------
export function getEligibleTeachersForGradeSubject(
  teachers: TeacherAccountRecord[],
  grade: string,
  subject: string
): TeacherAccountRecord[] {
  if (!grade || !subject) return [];
  const cleanGrade = grade.trim().toLowerCase();
  const cleanSubj = subject.trim().toLowerCase();

  return teachers.filter((t) => {
    const assignments = getTeacherGradeAssignments(t);
    return assignments.some((asg) => {
      if (asg.grade.trim().toLowerCase() !== cleanGrade) return false;
      return asg.subjects.some((s) => {
        const sLower = s.trim().toLowerCase();
        return sLower === cleanSubj || sLower.includes(cleanSubj) || cleanSubj.includes(sLower);
      });
    });
  });
}

// -----------------------------------------------------------------------------
// HELPER: CONFLICT DETECTION
// Checks if a teacher is already allocated to another class at the same day & time
// -----------------------------------------------------------------------------
export interface TimetableConflict {
  slotA: TimetableSlotItem;
  slotB: TimetableSlotItem;
  teacherName: string;
  day: string;
  time: string;
  description: string;
}

export function detectTimetableConflicts(
  slots: TimetableSlotItem[],
  academicYear = '2026',
  term = 'Term 1'
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];
  const relevantSlots = slots.filter(
    (s) =>
      !s.isBreak &&
      s.teacher &&
      s.day &&
      s.time &&
      (s.academicYear ? s.academicYear === academicYear : true) &&
      (s.term ? s.term === term : true)
  );

  for (let i = 0; i < relevantSlots.length; i++) {
    for (let j = i + 1; j < relevantSlots.length; j++) {
      const a = relevantSlots[i];
      const b = relevantSlots[j];

      // Same day, same time range, same teacher, but different grade
      const sameDay = a.day?.toLowerCase().trim() === b.day?.toLowerCase().trim();
      const sameTime = a.time?.toLowerCase().trim() === b.time?.toLowerCase().trim();
      const sameTeacher =
        (a.teacherId && b.teacherId && a.teacherId === b.teacherId) ||
        (a.teacher && b.teacher && a.teacher.toLowerCase().trim() === b.teacher.toLowerCase().trim());
      const differentGrade = a.grade?.toLowerCase().trim() !== b.grade?.toLowerCase().trim();

      if (sameDay && sameTime && sameTeacher && differentGrade) {
        conflicts.push({
          slotA: a,
          slotB: b,
          teacherName: a.teacher || 'Teacher',
          day: a.day || '',
          time: a.time || '',
          description: `${a.teacher} is scheduled simultaneously for ${a.grade} (${a.subject}) and ${b.grade} (${b.subject}) on ${a.day} at ${a.time}.`,
        });
      }
    }
  }

  return conflicts;
}

// -----------------------------------------------------------------------------
// SEED DEFAULT CBC TIMETABLE SLOTS ACCORDING TO REAL TEACHER ASSIGNMENTS
// -----------------------------------------------------------------------------
export function generateCompliantDefaultSlots(
  teachers: TeacherAccountRecord[],
  academicYear = '2026',
  term = 'Term 1'
): TimetableSlotItem[] {
  const slots: TimetableSlotItem[] = [];

  LRA_GRADES.forEach((grade) => {
    const gradeSubjects = getLraSubjectsForGrade(grade);

    TIMETABLE_DAYS.forEach((day, dayIndex) => {
      DEFAULT_TIMETABLE_PERIODS.forEach((period) => {
        if (period.isBreak) {
          slots.push({
            id: `break_${grade}_${day}_${period.index}`,
            grade,
            day,
            time: period.timeRange,
            periodIndex: period.index,
            isBreak: true,
            breakLabel: period.breakLabel || 'Break',
            academicYear,
            term,
          });
          return;
        }

        // For regular teaching periods, pick a valid subject and its eligible teacher
        const subjectIndex = (dayIndex * 2 + period.index) % gradeSubjects.length;
        const subject = gradeSubjects[subjectIndex];
        const eligible = getEligibleTeachersForGradeSubject(teachers, grade, subject);
        const assignedTeacher = eligible.length > 0 ? eligible[0] : null;

        slots.push({
          id: `slot_${grade}_${day}_${period.index}`,
          grade,
          day,
          time: period.timeRange,
          periodIndex: period.index,
          periodLabel: period.label,
          subject,
          teacher: assignedTeacher ? assignedTeacher.name : undefined,
          teacherId: assignedTeacher ? assignedTeacher.id : undefined,
          room: `Classroom ${grade.replace('Grade ', '')}`,
          activity: period.breakLabel ? period.breakLabel : undefined,
          academicYear,
          term,
        });
      });
    });
  });

  return slots;
}

// -----------------------------------------------------------------------------
// COMPONENT PROPS
// -----------------------------------------------------------------------------
interface AdminTimetableModuleProps {
  teachers: TeacherAccountRecord[];
  timetableSlots: TimetableSlotItem[];
  onUpdateSlots: (newSlots: TimetableSlotItem[]) => void;
  onNavigateHome: () => void;
}

export function AdminTimetableModule({
  teachers,
  timetableSlots,
  onUpdateSlots,
  onNavigateHome,
}: AdminTimetableModuleProps) {
  // Navigation / Filter State
  const [academicYear, setAcademicYear] = useState('2026');
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [viewMode, setViewMode] = useState<'grade' | 'teacher' | 'week'>('grade');
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<TimetableDay>('Monday');
  const [searchFilter, setSearchFilter] = useState('');

  // Modals State
  const [editingSlot, setEditingSlot] = useState<TimetableSlotItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [movingSlot, setMovingSlot] = useState<TimetableSlotItem | null>(null);
  const [duplicatingSlot, setDuplicatingSlot] = useState<TimetableSlotItem | null>(null);
  const [showConfigPeriodsModal, setShowConfigPeriodsModal] = useState(false);

  // Periods Config State
  const [periodsConfig, setPeriodsConfig] = useState<TimetablePeriodConfig[]>(() => {
    try {
      const saved = localStorage.getItem('lra_timetable_period_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TIMETABLE_PERIODS;
  });

  // Entry Form State
  const [formGrade, setFormGrade] = useState('Grade 1');
  const [formDay, setFormDay] = useState<TimetableDay>('Monday');
  const [formTime, setFormTime] = useState('08:20 - 09:00');
  const [formPeriodLabel, setFormPeriodLabel] = useState('Period 1');
  const [formIsBreak, setFormIsBreak] = useState(false);
  const [formBreakLabel, setFormBreakLabel] = useState('Tea & Mid-Morning Break');
  const [formSubject, setFormSubject] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formRoom, setFormRoom] = useState('Main Classroom');
  const [formActivity, setFormActivity] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Target Move State
  const [moveTargetDay, setMoveTargetDay] = useState<TimetableDay>('Monday');
  const [moveTargetTime, setMoveTargetTime] = useState('08:20 - 09:00');

  // Target Duplicate State
  const [duplicateTargetDays, setDuplicateTargetDays] = useState<TimetableDay[]>(['Tuesday', 'Wednesday']);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // AUTO-INITIALIZE TIMETABLE IF EMPTY
  // ---------------------------------------------------------------------------
  const currentSlots = useMemo(() => {
    if (timetableSlots && timetableSlots.length > 0) {
      return timetableSlots;
    }
    // If completely empty, auto-generate standard compliant slots
    const generated = generateCompliantDefaultSlots(teachers, academicYear, selectedTerm);
    onUpdateSlots(generated);
    return generated;
  }, [timetableSlots, teachers, academicYear, selectedTerm, onUpdateSlots]);

  // ---------------------------------------------------------------------------
  // DETECT ALL CONFLICTS ACROSS THE CURRENT TIMETABLE
  // ---------------------------------------------------------------------------
  const allConflicts = useMemo(() => {
    return detectTimetableConflicts(currentSlots, academicYear, selectedTerm);
  }, [currentSlots, academicYear, selectedTerm]);

  // Quick lookup map for slot conflicts: slotId -> conflict description
  const conflictMap = useMemo(() => {
    const map = new Map<string, string>();
    allConflicts.forEach((c) => {
      if (c.slotA.id) map.set(c.slotA.id, c.description);
      if (c.slotB.id) map.set(c.slotB.id, c.description);
    });
    return map;
  }, [allConflicts]);

  // ---------------------------------------------------------------------------
  // FILTERED ELIGIBLE TEACHERS FOR THE CURRENT MODAL SELECTION
  // ---------------------------------------------------------------------------
  const eligibleTeachersForModal = useMemo(() => {
    if (formIsBreak) return [];
    return getEligibleTeachersForGradeSubject(teachers, formGrade, formSubject);
  }, [teachers, formGrade, formSubject, formIsBreak]);

  // Real-time conflict preview in entry form
  const modalConflictWarning = useMemo(() => {
    if (formIsBreak || !formTeacherId || !formDay || !formTime) return null;
    const teacherObj = teachers.find((t) => t.id === formTeacherId);
    if (!teacherObj) return null;

    const conflicting = currentSlots.find((s) => {
      if (editingSlot && s.id === editingSlot.id) return false;
      if (s.isBreak) return false;
      const sameDay = s.day?.toLowerCase().trim() === formDay.toLowerCase().trim();
      const sameTime = s.time?.toLowerCase().trim() === formTime.toLowerCase().trim();
      const sameTeacher = s.teacherId === formTeacherId || s.teacher === teacherObj.name;
      const differentGrade = s.grade?.toLowerCase().trim() !== formGrade.toLowerCase().trim();
      return sameDay && sameTime && sameTeacher && differentGrade;
    });

    if (conflicting) {
      return `⚠️ CONFLICT DETECTED: ${teacherObj.name} is already scheduled for ${conflicting.grade} (${conflicting.subject || 'Lesson'}) on ${formDay} at ${formTime}.`;
    }
    return null;
  }, [formIsBreak, formTeacherId, formDay, formTime, formGrade, teachers, currentSlots, editingSlot]);

  // ---------------------------------------------------------------------------
  // OPEN ADD / EDIT MODAL
  // ---------------------------------------------------------------------------
  const handleOpenAddModal = (grade?: string, day?: TimetableDay, timeRange?: string, periodLabel?: string) => {
    const targetGrade = grade || selectedGrade;
    const targetDay = day || selectedDay;
    const targetTime = timeRange || periodsConfig[0].timeRange;
    const targetLabel = periodLabel || periodsConfig[0].label;
    const subjectsForG = getLraSubjectsForGrade(targetGrade);
    const initialSubj = subjectsForG[0] || '';

    setEditingSlot(null);
    setIsAddingNew(true);
    setFormGrade(targetGrade);
    setFormDay(targetDay);
    setFormTime(targetTime);
    setFormPeriodLabel(targetLabel);
    setFormIsBreak(false);
    setFormBreakLabel('Tea & Mid-Morning Break');
    setFormSubject(initialSubj);

    const eligible = getEligibleTeachersForGradeSubject(teachers, targetGrade, initialSubj);
    setFormTeacherId(eligible[0]?.id || '');
    setFormRoom(`Classroom ${targetGrade.replace('Grade ', '')}`);
    setFormActivity('');
    setFormNotes('');
    setFormError('');
  };

  const handleOpenEditModal = (slot: TimetableSlotItem) => {
    setEditingSlot(slot);
    setIsAddingNew(false);
    setFormGrade(slot.grade || selectedGrade);
    setFormDay((slot.day as TimetableDay) || 'Monday');
    setFormTime(slot.time || periodsConfig[0].timeRange);
    setFormPeriodLabel(slot.periodLabel || 'Period');
    setFormIsBreak(slot.isBreak || false);
    setFormBreakLabel(slot.breakLabel || 'Break');
    setFormSubject(slot.subject || '');
    setFormTeacherId(slot.teacherId || '');
    setFormRoom(slot.room || 'Main Classroom');
    setFormActivity(slot.activity || '');
    setFormNotes(slot.notes || '');
    setFormError('');
  };

  // ---------------------------------------------------------------------------
  // SAVE ENTRY HANDLER
  // ---------------------------------------------------------------------------
  const handleSaveEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formIsBreak) {
      if (!formSubject.trim()) {
        setFormError('Please select a valid CBC learning area / subject.');
        return;
      }
      if (eligibleTeachersForModal.length === 0) {
        setFormError('NO TEACHER ASSIGNED TO THIS SUBJECT FOR THIS GRADE. Please assign this subject to a teacher in Teacher Management first.');
        return;
      }
      if (!formTeacherId) {
        setFormError('Please select an eligible assigned teacher.');
        return;
      }
    }

    const assignedTeacherObj = teachers.find((t) => t.id === formTeacherId);

    const newSlot: TimetableSlotItem = {
      id: editingSlot ? editingSlot.id : `slot_${Date.now()}`,
      grade: formGrade,
      day: formDay,
      time: formTime,
      periodLabel: formPeriodLabel,
      isBreak: formIsBreak,
      breakLabel: formIsBreak ? formBreakLabel : undefined,
      subject: formIsBreak ? undefined : formSubject,
      teacher: formIsBreak ? undefined : assignedTeacherObj?.name,
      teacherId: formIsBreak ? undefined : formTeacherId,
      room: formRoom.trim() || undefined,
      activity: formActivity.trim() || undefined,
      notes: formNotes.trim() || undefined,
      academicYear,
      term: selectedTerm,
      updatedAt: new Date().toISOString(),
    };

    let updatedSlots: TimetableSlotItem[];
    if (editingSlot) {
      updatedSlots = currentSlots.map((s) => (s.id === editingSlot.id ? newSlot : s));
      showToast(`Updated period: ${newSlot.grade} • ${newSlot.subject || newSlot.breakLabel}`);
    } else {
      updatedSlots = [...currentSlots, newSlot];
      showToast(`Added period to timetable: ${newSlot.grade} • ${newSlot.day} ${newSlot.time}`);
    }

    onUpdateSlots(updatedSlots);
    setEditingSlot(null);
    setIsAddingNew(false);
  };

  // ---------------------------------------------------------------------------
  // DELETE ENTRY HANDLER
  // ---------------------------------------------------------------------------
  const handleDeleteSlot = (slotId?: string) => {
    if (!slotId) return;
    const updated = currentSlots.filter((s) => s.id !== slotId);
    onUpdateSlots(updated);
    showToast('Period deleted from timetable');
    setEditingSlot(null);
  };

  // ---------------------------------------------------------------------------
  // MOVE ENTRY HANDLER
  // ---------------------------------------------------------------------------
  const handleConfirmMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingSlot) return;

    const updated = currentSlots.map((s) => {
      if (s.id === movingSlot.id) {
        return {
          ...s,
          day: moveTargetDay,
          time: moveTargetTime,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    onUpdateSlots(updated);
    showToast(`Moved period to ${moveTargetDay} at ${moveTargetTime}`);
    setMovingSlot(null);
  };

  // ---------------------------------------------------------------------------
  // DUPLICATE ENTRY HANDLER
  // ---------------------------------------------------------------------------
  const handleConfirmDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicatingSlot || duplicateTargetDays.length === 0) return;

    const newCopies: TimetableSlotItem[] = duplicateTargetDays.map((d) => ({
      ...duplicatingSlot,
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      day: d,
      updatedAt: new Date().toISOString(),
    }));

    onUpdateSlots([...currentSlots, ...newCopies]);
    showToast(`Duplicated to ${duplicateTargetDays.join(', ')}`);
    setDuplicatingSlot(null);
  };

  // ---------------------------------------------------------------------------
  // SAVE PERIOD SCHEDULE CONFIG
  // ---------------------------------------------------------------------------
  const handleSavePeriodConfig = (newConfig: TimetablePeriodConfig[]) => {
    setPeriodsConfig(newConfig);
    try {
      localStorage.setItem('lra_timetable_period_config', JSON.stringify(newConfig));
    } catch {}
    setShowConfigPeriodsModal(false);
    showToast('Updated school timetable period timings');
  };

  // ---------------------------------------------------------------------------
  // RESET ALL TIMETABLE SLOTS TO FRESH STANDARD CBC TEMPLATE
  // ---------------------------------------------------------------------------
  const handleResetToStandard = () => {
    const generated = generateCompliantDefaultSlots(teachers, academicYear, selectedTerm);
    onUpdateSlots(generated);
    showToast('Timetable reset to standard compliant CBC schedule');
  };

  // ---------------------------------------------------------------------------
  // PRINT TIMETABLE HANDLER
  // ---------------------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: ACADEMIC YEAR, TERM, VIEWS, ACTIONS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                Admin Master Timetable
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                CBC Schedule Engine
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Curriculum Timetable & Teacher Allocation
            </h2>
            <p className="text-xs text-slate-400">
              Central schedule connecting Grade learning areas strictly with authorized teacher allocations.
            </p>
          </div>

          {/* Academic Year & Term Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">Year:</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="2026" className="bg-slate-900">2026</option>
                <option value="2025" className="bg-slate-900">2025</option>
                <option value="2027" className="bg-slate-900">2027</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">Term:</span>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as any)}
                className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Term 1" className="bg-slate-900">Term 1</option>
                <option value="Term 2" className="bg-slate-900">Term 2</option>
                <option value="Term 3" className="bg-slate-900">Term 3</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Print Timetable"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS & CONFLICT ALERT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Periods</span>
            <span className="text-base font-black text-white font-mono">
              {currentSlots.filter((s) => !s.isBreak).length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Faculty Teachers</span>
            <span className="text-base font-black text-white font-mono">
              {teachers.length} Assigned
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">CBC Grades</span>
            <span className="text-base font-black text-blue-400 font-mono">
              6 Classes (Gr. 1–6)
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              allConflicts.length > 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">
              {allConflicts.length > 0 ? 'Conflicts Found' : 'Schedule Integrity'}
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              {allConflicts.length > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="font-mono">{allConflicts.length} Conflicts</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>0 Conflicts • Clean</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONFLICT WARNING BANNER (IF ANY) */}
        {allConflicts.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs space-y-1.5 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Timetable Overlap Warning — The following teacher allocations clash simultaneously:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-100">
              {allConflicts.map((c, i) => (
                <li key={i}>{c.description}</li>
              ))}
            </ul>
          </div>
        )}

        {/* VIEW SELECTOR & MAIN CONTROLS */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setViewMode('grade')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grade'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grade Timetable</span>
            </button>

            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'teacher'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Teacher Schedule</span>
            </button>

            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mon–Fri Master View</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Period</span>
            </button>

            <button
              onClick={() => setShowConfigPeriodsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Period Timings</span>
            </button>

            <button
              onClick={handleResetToStandard}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 font-medium text-xs transition cursor-pointer"
              title="Reset to compliant standard CBC pairings"
            >
              Template Sync
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          VIEW 1: GRADE TIMETABLE VIEW
          ------------------------------------------------------------- */}
      {viewMode === 'grade' && (
        <div className="space-y-4">
          {/* Grade Selector Tabs: Grade 1 through Grade 6 */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            {LRA_GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedGrade === g
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{g}</span>
                {allConflicts.some((c) => c.slotA.grade === g || c.slotB.grade === g) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Grade Schedule Matrix: Monday through Friday */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 overflow-x-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">{selectedGrade}</span>
                  <span className="text-slate-500">•</span>
                  <span>Weekly CBC Timetable Schedule</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Monday to Friday allocated lessons. Click any slot to edit, duplicate, move, or delete.
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {currentSlots.filter((s) => s.grade === selectedGrade && !s.isBreak).length} weekly lessons
              </div>
            </div>

            {/* Matrix Table */}
            <div className="min-w-[760px] border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <th className="p-2.5 w-32 border-r border-slate-800">Period & Time</th>
                    {TIMETABLE_DAYS.map((day) => (
                      <th key={day} className="p-2.5 text-center font-black text-slate-200">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {periodsConfig.map((period) => {
                    if (period.isBreak) {
                      return (
                        <tr key={period.index} className="bg-slate-900/40 text-center font-bold">
                          <td className="p-2.5 text-slate-400 font-mono text-[11px] border-r border-slate-800">
                            {period.timeRange}
                          </td>
                          <td
                            colSpan={5}
                            className="p-2 text-amber-300 text-[11px] bg-amber-500/10 border-y border-amber-500/20 tracking-wider uppercase font-extrabold"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Coffee className="w-3.5 h-3.5 text-amber-400" />
                              <span>{period.breakLabel || 'School Break'}</span>
                              <span className="text-slate-400 font-normal">({period.durationMins} mins)</span>
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={period.index} className="hover:bg-slate-900/50 transition">
                        <td className="p-2.5 text-slate-300 font-mono text-[11px] border-r border-slate-800 bg-slate-900/30">
                          <div className="font-bold text-white">{period.label}</div>
                          <div className="text-[10px] text-slate-500">{period.timeRange}</div>
                        </td>

                        {TIMETABLE_DAYS.map((day) => {
                          const slot = currentSlots.find(
                            (s) =>
                              s.grade === selectedGrade &&
                              s.day === day &&
                              s.time === period.timeRange
                          );

                          const hasConflict = slot && slot.id && conflictMap.has(slot.id);
                          const conflictDesc = slot && slot.id ? conflictMap.get(slot.id) : null;

                          if (!slot) {
                            return (
                              <td
                                key={day}
                                onClick={() =>
                                  handleOpenAddModal(selectedGrade, day, period.timeRange, period.label)
                                }
                                className="p-2 text-center text-slate-600 hover:text-amber-400 hover:bg-slate-800/40 cursor-pointer transition border-r border-slate-800/60 last:border-r-0"
                              >
                                <span className="text-[10px] italic flex items-center justify-center gap-1">
                                  <Plus className="w-3 h-3" /> Add
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={day}
                              className={`p-2 border-r border-slate-800/60 last:border-r-0 align-top transition ${
                                hasConflict ? 'bg-rose-500/10' : ''
                              }`}
                            >
                              <div
                                onClick={() => handleOpenEditModal(slot)}
                                className={`p-2 rounded-lg cursor-pointer transition flex flex-col justify-between space-y-1.5 group ${
                                  hasConflict
                                    ? 'bg-rose-950/40 border border-rose-500/40 hover:border-rose-400'
                                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-black text-white text-[11px] group-hover:text-amber-400 truncate">
                                      {slot.subject || 'Lesson'}
                                    </span>
                                    {hasConflict && (
                                      <span
                                        className="text-rose-400"
                                        title={conflictDesc || 'Teacher conflict detected'}
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-amber-300 font-medium truncate">
                                    👤 {slot.teacher || 'Unassigned'}
                                  </div>
                                  {slot.room && (
                                    <div className="text-[9px] text-slate-400 truncate">
                                      📍 {slot.room}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px] text-slate-500">
                                  <span>{period.label}</span>
                                  <span className="text-amber-400 group-hover:inline hidden font-bold">
                                    Edit →
                                  </span>
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
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 2: TEACHER SCHEDULE VIEW
          Shows a specific teacher's allocations across grades
          ------------------------------------------------------------- */}
      {viewMode === 'teacher' && (
        <div className="space-y-4">
          {/* Teacher Selector Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Select Faculty Teacher</h3>
                <p className="text-xs text-slate-400">
                  View individual timetable pacing, assigned grades, teaching periods, and conflict checks.
                </p>
              </div>

              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.assignedGrades?.join(', ') || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Teacher Details Pill */}
            {(() => {
              const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
              if (!activeTeacher) return null;

              const teacherAssignments = getTeacherGradeAssignments(activeTeacher);
              const teacherSlots = currentSlots.filter(
                (s) =>
                  !s.isBreak &&
                  (s.teacherId === activeTeacher.id || s.teacher === activeTeacher.name)
              );
              const teacherConflictCount = allConflicts.filter(
                (c) => c.slotA.teacherId === activeTeacher.id || c.slotB.teacherId === activeTeacher.id
              ).length;

              return (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-extrabold text-white text-sm">{activeTeacher.name}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherAssignments.map((a) => (
                        <span
                          key={a.grade}
                          className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold"
                        >
                          {a.grade}: {a.subjects.join(', ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-300">
                      Total: <b className="text-amber-400">{teacherSlots.length}</b> periods / week
                    </span>
                    {teacherConflictCount > 0 ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {teacherConflictCount} conflicts
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Allocations Clean
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Teacher Weekly Table */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 overflow-x-auto">
            {(() => {
              const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
              if (!activeTeacher) {
                return (
                  <p className="text-slate-500 italic py-8 text-center text-xs">
                    No teacher selected.
                  </p>
                );
              }

              return (
                <div className="min-w-[760px] border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                        <th className="p-2.5 w-32 border-r border-slate-800">Period & Time</th>
                        {TIMETABLE_DAYS.map((day) => (
                          <th key={day} className="p-2.5 text-center font-black text-slate-200">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {periodsConfig.map((period) => {
                        if (period.isBreak) {
                          return (
                            <tr key={period.index} className="bg-slate-900/40 text-center font-bold">
                              <td className="p-2 text-slate-400 font-mono text-[11px] border-r border-slate-800">
                                {period.timeRange}
                              </td>
                              <td
                                colSpan={5}
                                className="p-2 text-amber-300 text-[11px] bg-amber-500/10 border-y border-amber-500/20 uppercase font-bold"
                              >
                                {period.breakLabel || 'Break'}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={period.index} className="hover:bg-slate-900/40 transition">
                            <td className="p-2.5 text-slate-300 font-mono text-[11px] border-r border-slate-800 bg-slate-900/30">
                              <div className="font-bold text-white">{period.label}</div>
                              <div className="text-[10px] text-slate-500">{period.timeRange}</div>
                            </td>

                            {TIMETABLE_DAYS.map((day) => {
                              const matchingSlots = currentSlots.filter(
                                (s) =>
                                  !s.isBreak &&
                                  (s.teacherId === activeTeacher.id || s.teacher === activeTeacher.name) &&
                                  s.day === day &&
                                  s.time === period.timeRange
                              );

                              if (matchingSlots.length === 0) {
                                return (
                                  <td
                                    key={day}
                                    className="p-2 text-center text-slate-700 border-r border-slate-800/60 last:border-r-0 font-mono text-[10px]"
                                  >
                                    — Free Period —
                                  </td>
                                );
                              }

                              const isClash = matchingSlots.length > 1;

                              return (
                                <td
                                  key={day}
                                  className={`p-2 border-r border-slate-800/60 last:border-r-0 align-top ${
                                    isClash ? 'bg-rose-500/20' : ''
                                  }`}
                                >
                                  {matchingSlots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      onClick={() => handleOpenEditModal(slot)}
                                      className={`p-2 rounded-lg cursor-pointer transition mb-1 last:mb-0 space-y-1 ${
                                        isClash
                                          ? 'bg-rose-950 border border-rose-500 text-rose-200'
                                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                                          {slot.grade}
                                        </span>
                                        {isClash && (
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500 text-white font-bold">
                                            CLASH!
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-bold text-white text-[11px] truncate">
                                        {slot.subject}
                                      </div>
                                      {slot.room && (
                                        <div className="text-[9px] text-slate-400">
                                          📍 {slot.room}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 3: MON–FRI MASTER OVERVIEW
          School-wide matrix showing all classes on any chosen day
          ------------------------------------------------------------- */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Day Selector Tabs */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {TIMETABLE_DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedDay === d
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono px-3 hidden sm:inline">
              Master School Day Overview
            </span>
          </div>

          {/* Master Day Grid */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 overflow-x-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                All Classes Schedule for <span className="text-amber-400">{selectedDay}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {currentSlots.filter((s) => s.day === selectedDay && !s.isBreak).length} total lessons scheduled
              </span>
            </div>

            <div className="min-w-[800px] border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <th className="p-2.5 w-28 border-r border-slate-800">Class Grade</th>
                    {periodsConfig
                      .filter((p) => !p.isBreak)
                      .map((p) => (
                        <th key={p.index} className="p-2 text-center text-slate-300 font-bold text-[11px]">
                          <div>{p.label}</div>
                          <div className="text-[9px] text-slate-500 font-normal">{p.timeRange}</div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {LRA_GRADES.map((grade) => (
                    <tr key={grade} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-extrabold text-white text-xs border-r border-slate-800 bg-slate-900/30">
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold block text-center">
                          {grade}
                        </span>
                      </td>

                      {periodsConfig
                        .filter((p) => !p.isBreak)
                        .map((period) => {
                          const slot = currentSlots.find(
                            (s) =>
                              s.grade === grade &&
                              s.day === selectedDay &&
                              s.time === period.timeRange
                          );

                          if (!slot) {
                            return (
                              <td
                                key={period.index}
                                onClick={() =>
                                  handleOpenAddModal(grade, selectedDay, period.timeRange, period.label)
                                }
                                className="p-2 text-center text-slate-700 hover:text-amber-400 hover:bg-slate-800/40 cursor-pointer transition border-r border-slate-800/60 last:border-r-0 text-[10px]"
                              >
                                +
                              </td>
                            );
                          }

                          const hasConflict = slot.id ? conflictMap.has(slot.id) : false;

                          return (
                            <td
                              key={period.index}
                              onClick={() => handleOpenEditModal(slot)}
                              className={`p-1.5 border-r border-slate-800/60 last:border-r-0 align-top cursor-pointer ${
                                hasConflict ? 'bg-rose-500/10' : ''
                              }`}
                            >
                              <div className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 text-[10px] space-y-0.5 transition">
                                <div className="font-bold text-white truncate">{slot.subject}</div>
                                <div className="text-amber-300/90 truncate">
                                  {slot.teacher ? slot.teacher.split(' ').slice(-1)[0] : 'Unassigned'}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 1: ADD / EDIT TIMETABLE ENTRY (WITH STRICT TEACHER FILTERING)
          ============================================================= */}
      {(editingSlot || isAddingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#080E24] border border-slate-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {editingSlot ? 'Edit Timetable Entry' : 'Add New Period to Timetable'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {formGrade} • {formDay} • {formTime}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingSlot(null);
                  setIsAddingNew(false);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Real-time Conflict Warning in Modal */}
            {modalConflictWarning && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-bold animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{modalConflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveEntrySubmit} className="space-y-3.5">
              {/* Row 1: Grade & Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Grade Class <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => {
                      const newG = e.target.value;
                      setFormGrade(newG);
                      const validSubjs = getLraSubjectsForGrade(newG);
                      if (validSubjs.length > 0) {
                        setFormSubject(validSubjs[0]);
                        const eligible = getEligibleTeachersForGradeSubject(teachers, newG, validSubjs[0]);
                        setFormTeacherId(eligible[0]?.id || '');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {LRA_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Day of Week <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as TimetableDay)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {TIMETABLE_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Period & Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Period Label
                  </label>
                  <input
                    type="text"
                    value={formPeriodLabel}
                    onChange={(e) => setFormPeriodLabel(e.target.value)}
                    placeholder="e.g. Period 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Time Range (Start – End) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 08:20 - 09:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Break Toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">School Break Period</span>
                  <span className="text-[10px] text-slate-400">
                    Check if this slot is a Tea Break, Health Break, or Lunch
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsBreak}
                  onChange={(e) => setFormIsBreak(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </div>

              {formIsBreak ? (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Break Name / Type</label>
                  <select
                    value={formBreakLabel}
                    onChange={(e) => setFormBreakLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="Health & Fruit Break">Health & Fruit Break (20 mins)</option>
                    <option value="Tea & Mid-Morning Break">Tea & Mid-Morning Break (20 mins)</option>
                    <option value="Lunch & Relaxation Break">Lunch & Relaxation Break (60 mins)</option>
                    <option value="Games / Clubs / Assembly">Games / Clubs / Assembly</option>
                    <option value="Custom Break">Custom School Break</option>
                  </select>
                </div>
              ) : (
                <>
                  {/* Subject Selector */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      CBC Learning Area / Subject <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formSubject}
                      onChange={(e) => {
                        const newSubj = e.target.value;
                        setFormSubject(newSubj);
                        const eligible = getEligibleTeachersForGradeSubject(teachers, formGrade, newSubj);
                        setFormTeacherId(eligible[0]?.id || '');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {getLraSubjectsForGrade(formGrade).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AUTOMATIC ELIGIBLE TEACHER SELECTOR */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                      <span>
                        Assigned Teacher <span className="text-amber-400">*</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-normal">
                        Filtered strictly by {formGrade} + {formSubject}
                      </span>
                    </label>

                    {eligibleTeachersForModal.length > 0 ? (
                      <select
                        value={formTeacherId}
                        onChange={(e) => setFormTeacherId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {eligibleTeachersForModal.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (Assigned to {formGrade} {formSubject})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>NO TEACHER ASSIGNED TO THIS SUBJECT FOR THIS GRADE.</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">
                          Only faculty teachers authorized for {formGrade} • {formSubject} through Teacher
                          Management can be allocated.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Location & Activity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Location / Room
                      </label>
                      <input
                        type="text"
                        value={formRoom}
                        onChange={(e) => setFormRoom(e.target.value)}
                        placeholder="e.g. Science Lab, Field"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Activity Focus (Optional)
                      </label>
                      <input
                        type="text"
                        value={formActivity}
                        onChange={(e) => setFormActivity(e.target.value)}
                        placeholder="e.g. Practical, Assessment"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Curriculum Notes / Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Notes for class pacing or syllabus tracking..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  {editingSlot && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMovingSlot(editingSlot);
                          setMoveTargetDay(editingSlot.day as TimetableDay);
                          setMoveTargetTime(editingSlot.time || '');
                          setEditingSlot(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                        title="Move to another day or time"
                      >
                        <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                        <span>Move</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDuplicatingSlot(editingSlot);
                          setEditingSlot(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                        title="Duplicate across days"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(editingSlot.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlot(null);
                      setIsAddingNew(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-md cursor-pointer"
                  >
                    {editingSlot ? 'Save Changes' : 'Add to Timetable'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 2: MOVE ENTRY MODAL
          ============================================================= */}
      {movingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderInput className="w-4 h-4 text-amber-400" />
                <span>Move Period: {movingSlot.subject || movingSlot.breakLabel}</span>
              </h3>
              <button onClick={() => setMovingSlot(null)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmMove} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Day</label>
                <select
                  value={moveTargetDay}
                  onChange={(e) => setMoveTargetDay(e.target.value as TimetableDay)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  {TIMETABLE_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Period / Time Range</label>
                <select
                  value={moveTargetTime}
                  onChange={(e) => setMoveTargetTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                >
                  {periodsConfig
                    .filter((p) => !p.isBreak)
                    .map((p) => (
                      <option key={p.index} value={p.timeRange}>
                        {p.label} ({p.timeRange})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMovingSlot(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 3: DUPLICATE ENTRY MODAL
          ============================================================= */}
      {duplicatingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Copy className="w-4 h-4 text-blue-400" />
                <span>Duplicate Period: {duplicatingSlot.subject}</span>
              </h3>
              <button onClick={() => setDuplicatingSlot(null)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmDuplicate} className="space-y-3.5">
              <p className="text-slate-400 text-[11px]">
                Copy this lesson ({duplicatingSlot.grade} • {duplicatingSlot.subject} • {duplicatingSlot.time}) across other days of the week:
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {TIMETABLE_DAYS.map((d) => {
                  const isOrigin = d === duplicatingSlot.day;
                  const isChecked = duplicateTargetDays.includes(d);

                  return (
                    <label
                      key={d}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer ${
                        isOrigin ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-900'
                      }`}
                    >
                      <span className="font-bold text-white">
                        {d} {isOrigin ? '(Source Day)' : ''}
                      </span>
                      <input
                        type="checkbox"
                        disabled={isOrigin}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDuplicateTargetDays([...duplicateTargetDays, d]);
                          } else {
                            setDuplicateTargetDays(duplicateTargetDays.filter((x) => x !== d));
                          }
                        }}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDuplicatingSlot(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={duplicateTargetDays.length === 0}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50"
                >
                  Duplicate to Selected Days
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 4: PERIOD SCHEDULE TIMINGS CONFIGURATION
          ============================================================= */}
      {showConfigPeriodsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Configure Standard Period Timings</span>
              </h3>
              <button onClick={() => setShowConfigPeriodsModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <p className="text-slate-400 text-[11px]">
              Set school-wide lesson times, start/end hours, and break durations.
            </p>

            <div className="space-y-2">
              {periodsConfig.map((p, idx) => (
                <div
                  key={p.index}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="w-24 font-bold text-white">
                    {p.label}
                    {p.isBreak && <span className="text-[10px] text-amber-400 block font-normal">(Break)</span>}
                  </div>

                  <input
                    type="text"
                    value={p.timeRange}
                    onChange={(e) => {
                      const newCfg = [...periodsConfig];
                      newCfg[idx] = { ...newCfg[idx], timeRange: e.target.value };
                      setPeriodsConfig(newCfg);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                  />

                  <div className="w-20 text-slate-400 font-mono text-[11px] text-right">
                    {p.durationMins} mins
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSavePeriodConfig(DEFAULT_TIMETABLE_PERIODS)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Reset Default Periods
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigPeriodsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePeriodConfig(periodsConfig)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500"
                >
                  Save Timings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
