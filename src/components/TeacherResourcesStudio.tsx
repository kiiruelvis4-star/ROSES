/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Table as TableIcon,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Video,
  Image as ImageIcon,
  Share2,
  Download,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  Send,
  Sparkles,
  Users,
  Award,
  ChevronRight,
  ClipboardList,
  Eye,
  Sliders,
  HelpCircle,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { WordDocumentTool } from './WordDocumentTool.tsx';
import { SpreadsheetTool } from './SpreadsheetTool.tsx';
import { TeacherRecord } from '../services/schoolDataService.ts';

export interface TeacherResourcesStudioProps {
  currentTeacher: TeacherRecord;
  onPushAssignment?: (assignmentData: any) => void;
  showToast: (msg: string) => void;
}

export type DocumentCategory =
  | 'knec_cbe'
  | 'schemes'
  | 'lesson_plans'
  | 'lesson_notes'
  | 'records_of_work'
  | 'cats_assessments'
  | 'rubrics'
  | 'media_resources'
  | 'assignments'
  | 'revision_exams'
  | 'class_notes'
  | 'teacher_created'
  | 'timetables'
  | 'class_lists'
  | 'teacher_reports';

export function TeacherResourcesStudio({
  currentTeacher,
  onPushAssignment,
  showToast
}: TeacherResourcesStudioProps) {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('schemes');
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [viewTool, setViewTool] = useState<'standard' | 'word' | 'spreadsheet'>('standard');
  const [activeDocTitle, setActiveDocTitle] = useState('Blank Document Format');
  const [activeWordContent, setActiveWordContent] = useState('');

  // Dynamic Subject & Grade selection for the teacher
  const [selectedSubject, setSelectedSubject] = useState<string>(
    currentTeacher.subjects?.[0] || 'Mathematics'
  );
  const [selectedGrade, setSelectedGrade] = useState<string>(
    currentTeacher.assignedGrades?.[0] || 'Grade 4'
  );

  // ---------------------------------------------------------------------------
  // 1. SCHEMES OF WORK STATE (2 TERMS • READY TO KEY IN)
  // ---------------------------------------------------------------------------
  const [schemesRows, setSchemesRows] = useState([
    {
      id: 'scheme-1',
      term: 'Term 1',
      wkLsn: 'W1 L1',
      strand: '',
      subStrand: '',
      outcomes: '',
      experiences: '',
      kiq: '',
      resources: '',
      assessment: ''
    },
    {
      id: 'scheme-2',
      term: 'Term 1',
      wkLsn: 'W1 L2',
      strand: '',
      subStrand: '',
      outcomes: '',
      experiences: '',
      kiq: '',
      resources: '',
      assessment: ''
    },
    {
      id: 'scheme-3',
      term: 'Term 1',
      wkLsn: 'W2 L1',
      strand: '',
      subStrand: '',
      outcomes: '',
      experiences: '',
      kiq: '',
      resources: '',
      assessment: ''
    },
    {
      id: 'scheme-4',
      term: 'Term 1',
      wkLsn: 'W2 L2',
      strand: '',
      subStrand: '',
      outcomes: '',
      experiences: '',
      kiq: '',
      resources: '',
      assessment: ''
    }
  ]);

  const handleUpdateSchemeCell = (id: string, field: string, val: string) => {
    setSchemesRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );
  };

  const handleAddSchemeRow = () => {
    setSchemesRows((prev) => [
      ...prev,
      {
        id: `scheme-${Date.now()}`,
        term: selectedTerm === 'Term 3' ? 'Term 2' : selectedTerm,
        wkLsn: `W${Math.floor(prev.length / 2) + 1} L${(prev.length % 2) + 1}`,
        strand: '',
        subStrand: '',
        outcomes: '',
        experiences: '',
        kiq: '',
        resources: '',
        assessment: ''
      }
    ]);
    showToast('New scheme row added. Ready to key in!');
  };

  // ---------------------------------------------------------------------------
  // 2. LESSON PLAN STATE (BLANK CBC FORMAT READY TO KEY IN)
  // ---------------------------------------------------------------------------
  const [lessonPlanData, setLessonPlanData] = useState({
    subject: selectedSubject,
    grade: selectedGrade,
    strand: '',
    subStrand: '',
    outcomes: '',
    kiq: '',
    competencies: 'Critical thinking, Problem solving, Collaboration',
    values: 'Responsibility, Integrity, Respect',
    starter: '',
    development: '',
    plenary: '',
    extendedActivity: ''
  });

  // ---------------------------------------------------------------------------
  // 3. RECORDS OF WORK STATE (SHIFT FORWARD • READY TO KEY IN)
  // ---------------------------------------------------------------------------
  const [recordsOfWorkState, setRecordsOfWorkState] = useState([
    {
      id: 'row-1',
      date: 'Mon 18 May',
      lessonNo: 1,
      grade: selectedGrade,
      subject: selectedSubject,
      strand: '',
      subStrand: '',
      taught: false,
      signature: '',
      shifted: false
    },
    {
      id: 'row-2',
      date: 'Tue 19 May',
      lessonNo: 2,
      grade: selectedGrade,
      subject: selectedSubject,
      strand: '',
      subStrand: '',
      taught: false,
      signature: '',
      shifted: false
    },
    {
      id: 'row-3',
      date: 'Wed 20 May',
      lessonNo: 3,
      grade: selectedGrade,
      subject: selectedSubject,
      strand: '',
      subStrand: '',
      taught: false,
      signature: '',
      shifted: false
    }
  ]);

  const handleToggleRecordOfWork = (id: string) => {
    setRecordsOfWorkState((prev) => {
      const targetIdx = prev.findIndex((r) => r.id === id);
      if (targetIdx === -1) return prev;

      const current = prev[targetIdx];
      const willBeTaught = !current.taught;

      if (!willBeTaught) {
        // Teacher unticked: Work must squeeze to the following day and subsequent days move forward NOT combined!
        const updated = [...prev];
        updated[targetIdx] = {
          ...current,
          taught: false,
          signature: '',
          shifted: true
        };

        for (let i = targetIdx + 1; i < updated.length; i++) {
          updated[i] = {
            ...updated[i],
            shifted: true
          };
        }
        showToast('Unticked: Lesson moved to following day. Subsequent lessons shifted forward (not combined) ⏩');
        return updated;
      } else {
        // Ticked as taught
        const updated = [...prev];
        updated[targetIdx] = {
          ...current,
          taught: true,
          signature: currentTeacher.name,
          shifted: false
        };
        showToast(`✓ Marked as taught: Stamped with ${currentTeacher.name}'s signature`);
        return updated;
      }
    });
  };

  const handleAddRecordOfWorkRow = () => {
    setRecordsOfWorkState((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        lessonNo: prev.length + 1,
        grade: selectedGrade,
        subject: selectedSubject,
        strand: '',
        subStrand: '',
        taught: false,
        signature: '',
        shifted: false
      }
    ]);
    showToast('New Record of Work row added. Ready to key in!');
  };

  // ---------------------------------------------------------------------------
  // 4. CATs & ASSIGNMENT MARKS STATE (TEACHER KEYS IN MARKS)
  // ---------------------------------------------------------------------------
  const [assessmentMarks, setAssessmentMarks] = useState<
    Record<
      string,
      {
        cat1: string;
        cat2: string;
        cat3: string;
        assign1: string;
        assign2: string;
      }
    >
  >({
    'LRA-2026-0042': { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' },
    'LRA-2026-0047': { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' },
    'LRA-2026-0019': { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' },
    'LRA-2026-0033': { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' },
    'LRA-2026-0051': { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' }
  });

  const handleUpdateMark = (upi: string, field: string, val: string) => {
    setAssessmentMarks((prev) => ({
      ...prev,
      [upi]: {
        ...(prev[upi] || { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' }),
        [field]: val
      }
    }));
  };

  // Compute 60% CAT + 40% Assign = 100% Total dynamically
  const calculatePupilTotal = (upi: string) => {
    const entry = assessmentMarks[upi];
    if (!entry) return null;

    const cats = [parseFloat(entry.cat1), parseFloat(entry.cat2), parseFloat(entry.cat3)].filter(
      (n) => !isNaN(n)
    );
    const assigns = [parseFloat(entry.assign1), parseFloat(entry.assign2)].filter(
      (n) => !isNaN(n)
    );

    if (cats.length === 0 && assigns.length === 0) return null;

    const catAvg = cats.length > 0 ? cats.reduce((a, b) => a + b, 0) / cats.length : 0;
    const cat60 = Math.round((catAvg / 20) * 60);

    const assignAvg = assigns.length > 0 ? assigns.reduce((a, b) => a + b, 0) / assigns.length : 0;
    const assign40 = Math.round((assignAvg / 10) * 40);

    const total = Math.min(100, Math.round(cat60 + assign40));
    let band: 'EE' | 'ME' | 'AE' | 'BE' = 'BE';
    if (total >= 80) band = 'EE';
    else if (total >= 60) band = 'ME';
    else if (total >= 40) band = 'AE';

    return { cat60, assign40, total, band };
  };

  // ---------------------------------------------------------------------------
  // 5. RUBRIC / ASSESSMENT BOOK FORMAT (BLANK FORMAT READY TO BE FILLED)
  // ---------------------------------------------------------------------------
  const [rubricStrands, setRubricStrands] = useState([
    'Strand 1',
    'Strand 2',
    'Strand 3',
    'Strand 4'
  ]);

  const [rubricData, setRubricData] = useState<Record<string, Record<string, string>>>({
    'LRA-2026-0042': { 'Strand 1': '', 'Strand 2': '', 'Strand 3': '', 'Strand 4': '' },
    'LRA-2026-0047': { 'Strand 1': '', 'Strand 2': '', 'Strand 3': '', 'Strand 4': '' },
    'LRA-2026-0019': { 'Strand 1': '', 'Strand 2': '', 'Strand 3': '', 'Strand 4': '' },
    'LRA-2026-0033': { 'Strand 1': '', 'Strand 2': '', 'Strand 3': '', 'Strand 4': '' },
    'LRA-2026-0051': { 'Strand 1': '', 'Strand 2': '', 'Strand 3': '', 'Strand 4': '' }
  });

  const handleUpdateRubricCell = (upi: string, strand: string, val: string) => {
    setRubricData((prev) => ({
      ...prev,
      [upi]: {
        ...(prev[upi] || {}),
        [strand]: val
      }
    }));
  };

  // ---------------------------------------------------------------------------
  // 6. ASSIGNMENTS COMPOSER STATE
  // ---------------------------------------------------------------------------
  const [assignmentDraft, setAssignmentDraft] = useState({
    title: '',
    strand: '',
    instructions: '',
    dueDate: 'Tomorrow 08:00 AM'
  });

  // ---------------------------------------------------------------------------
  // 7. CLASS NOTES STATE
  // ---------------------------------------------------------------------------
  const [todayClassNotes, setTodayClassNotes] = useState('');

  // ---------------------------------------------------------------------------
  // 8. MEDIA RESOURCES STATE
  // ---------------------------------------------------------------------------
  const [mediaList, setMediaList] = useState<{ id: string; title: string; type: string; url: string; subject: string }[]>([]);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video' | 'notes'>('image');
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  // ---------------------------------------------------------------------------
  // 9. TEACHER REPORTS STATE
  // ---------------------------------------------------------------------------
  const [teacherReportText, setTeacherReportText] = useState('');

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim()) return;

    setMediaList((prev) => [
      {
        id: `m-${Date.now()}`,
        title: newMediaTitle.trim(),
        type: newMediaType,
        url:
          newMediaType === 'video'
            ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'
            : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
        subject: selectedSubject
      },
      ...prev
    ]);

    setNewMediaTitle('');
    setShowAddMediaModal(false);
    showToast('Teaching resource uploaded and saved to phone library 📸');
  };

  // 16 Documents Navigation Items
  const DOCUMENT_CATEGORIES: {
    id: DocumentCategory;
    title: string;
    icon: string;
    desc: string;
    badge?: string;
  }[] = [
    { id: 'knec_cbe', title: '1. KNEC/CBE Curriculum Documents', icon: '🏛️', desc: 'KICD/KNEC Curriculum Designs & Standards' },
    { id: 'schemes', title: '2. Schemes of Work (2 Terms)', icon: '📋', desc: 'Blank 2-Term Format • Ready to Key In', badge: '2 Terms' },
    { id: 'lesson_plans', title: '3. Lesson Plans', icon: '📝', desc: 'CBC Lesson Plan Template • Key in Steps', badge: 'Active' },
    { id: 'lesson_notes', title: '4. Lesson Notes (Full Book)', icon: '📖', desc: 'Upload or Write Full Subject Notes' },
    { id: 'records_of_work', title: '5. Records of Work', icon: '🌱', desc: 'Taught vs Not Taught • Shift-Forward Pacing', badge: 'QASO' },
    { id: 'cats_assessments', title: '6. CATs & Assessment Records', icon: '📊', desc: 'Key in Marks • Auto 60% CAT + 40% Assign', badge: '60/40' },
    { id: 'rubrics', title: '7. Rubrics / Assessment Books', icon: '🎨', desc: 'Blank Format • Displays 4 Colors (EE, ME, AE, BE)' },
    { id: 'media_resources', title: '8. Teaching & Learning Resources', icon: '📸', desc: 'Upload Your Photos, Videos & Notes' },
    { id: 'assignments', title: '9. Assignments (Push to Learners)', icon: '📑', desc: 'Key in Assignment • Push to Parents' },
    { id: 'revision_exams', title: '10. Revision Exams & Past Papers', icon: '🎯', desc: 'Term 3 & Remedial Focus Zone Papers' },
    { id: 'class_notes', title: '11. Class Notes (Day\'s Summary)', icon: '✏️', desc: 'Key in Today\'s Chalkboard Notes' },
    { id: 'teacher_created', title: '12. Teacher-created Documents', icon: '📓', desc: 'Teacher\'s Diary & Pedagogical Reflections' },
    { id: 'timetables', title: '13. Timetables (Teacher & Class)', icon: '⏱️', desc: 'Editable Teacher Timetable + Class Timetable', badge: '2 Tables' },
    { id: 'class_lists', title: '14. Class Lists / Learner Records', icon: '👥', desc: 'Learner Credentials, UPI & Rosters' },
    { id: 'teacher_reports', title: '15. Teacher Reports (AI Focus Zone)', icon: '🧠', desc: 'Key in Observations • Auto-Sync Focus Zone' }
  ];

  const handleOpenInWord = (title: string, content: string = '') => {
    setActiveDocTitle(title);
    setActiveWordContent(content);
    setViewTool('word');
  };

  const handleOpenInSpreadsheet = (title: string) => {
    setActiveDocTitle(title);
    setViewTool('spreadsheet');
  };

  const handlePushAssignmentToParents = (title: string, dueDate: string) => {
    if (!title.trim()) {
      showToast('⚠️ Please enter an assignment title before pushing.');
      return;
    }

    const payload = {
      title,
      subject: selectedSubject,
      grade: selectedGrade,
      date: new Date().toLocaleDateString('en-GB'),
      dueDate: dueDate || 'Tomorrow 08:00 AM',
      sender: currentTeacher.name
    };

    if (onPushAssignment) {
      onPushAssignment(payload);
    }

    showToast(`🚀 Assignment "${title}" pushed to ${selectedGrade} learners & parents! Dispatched via SMS link.`);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8 font-sans text-slate-900">
      {/* =========================================================================
          TOP BANNER: RESOURCES STUDIO & TEACHER SELECTION
          ========================================================================= */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0C1A38] to-[#081226] text-white border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resources & Living Documents Studio</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
              2 Terms Format • Teacher Keys in Everything
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Teacher Document Studio & Productivity Hub</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            All 16 standard teacher documents in clean, blank formats ready for you to key in your specific subjects, strands, schemes, lesson plans, CAT marks, and assignments.
          </p>
        </div>

        {/* Built-in Tool Switchers */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setViewTool('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewTool === 'standard' ? 'bg-amber-400 text-neutral-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            📋 Shelf View
          </button>
          <button
            onClick={() => {
              setActiveDocTitle(`${selectedSubject} - Document (${selectedGrade})`);
              setActiveWordContent(
                `# ${selectedSubject.toUpperCase()} • ${selectedGrade.toUpperCase()}\nTeacher: ${currentTeacher.name}\nTerm: ${selectedTerm}\n\n[Teacher to type or paste document content here...]`
              );
              setViewTool('word');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewTool === 'word' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
            title="Open Full Word Document Editor & Reader"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Word Document Tool</span>
          </button>
          <button
            onClick={() => {
              setActiveDocTitle(`${selectedSubject} - Spreadsheet Grid`);
              setViewTool('spreadsheet');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewTool === 'spreadsheet' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
            title="Open Interactive Spreadsheet Tool"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Spreadsheet Tool</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOOL VIEWS (IF USER OPENS DEDICATED WORD OR SPREADSHEET TOOL)
          ========================================================================= */}
      {viewTool === 'word' && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-2 rounded-xl text-xs font-bold text-blue-900">
            <span>Editing Word Document: &ldquo;{activeDocTitle}&rdquo;</span>
            <button
              onClick={() => setViewTool('standard')}
              className="text-blue-700 hover:text-blue-950 underline cursor-pointer"
            >
              ← Back to Documents Shelf
            </button>
          </div>
          <WordDocumentTool
            initialTitle={activeDocTitle}
            initialContent={activeWordContent}
            onSave={(title, content) => {
              showToast(`Document "${title}" saved to local phone storage 💾`);
            }}
          />
        </div>
      )}

      {viewTool === 'spreadsheet' && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs font-bold text-emerald-900">
            <span>Editing CBC Spreadsheet: &ldquo;{activeDocTitle}&rdquo;</span>
            <button
              onClick={() => setViewTool('standard')}
              className="text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
            >
              ← Back to Documents Shelf
            </button>
          </div>
          <SpreadsheetTool
            initialTitle={activeDocTitle}
            onSave={(title) => {
              showToast(`Spreadsheet "${title}" saved and synced locally 📊`);
            }}
          />
        </div>
      )}

      {/* =========================================================================
          STANDARD SHELF VIEW: 16 DOCUMENTS WITH QUICK SEARCH & TERM CONTROL
          ========================================================================= */}
      {viewTool === 'standard' && (
        <div className="space-y-4">
          {/* Controls Bar: Dynamic Subject & Grade Key-in / Term Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            {/* Subject & Grade Selectors (Customizable for ANY teacher) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase">Subject:</span>
                {(() => {
                  const isLowerGrade = ['Grade 1', 'Grade 2', 'Grade 3'].includes(selectedGrade);
                  const lowerGradeSubjectList = [
                    'Social Studies',
                    'Social Studies Activities',
                    'Mathematics Activities',
                    'English Language Activities',
                    'Kiswahili Language Activities',
                    'Environmental Activities',
                    'Creative Activities',
                    'Religious Activities (CRE/IRE)',
                    'Movement Activities'
                  ];
                  const upperGradeSubjectList = [
                    'Social Studies',
                    'Mathematics',
                    'English',
                    'Kiswahili',
                    'Science and Technology',
                    'Agriculture & Nutrition',
                    'Creative Arts & Sports',
                    'Religious Education'
                  ];

                  return (
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {currentTeacher.subjects && currentTeacher.subjects.length > 0 && (
                        <optgroup label="Teacher Allocated Subjects">
                          {currentTeacher.subjects.map((s) => (
                            <option key={`alloc-${s}`} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label={isLowerGrade ? "Lower Primary (Grade 1 - 3)" : "Upper Primary (Grade 4 - 6)"}>
                        {(isLowerGrade ? lowerGradeSubjectList : upperGradeSubjectList).map((s) => (
                          <option key={`grade-subj-${s}`} value={s}>{s}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Other CBC Subjects">
                        <option value="Social Studies">Social Studies</option>
                        <option value="Social Studies Activities">Social Studies Activities</option>
                        <option value="Environmental Activities">Environmental Activities</option>
                        <option value="Mathematics Activities">Mathematics Activities</option>
                        <option value="English">English</option>
                        <option value="Kiswahili">Kiswahili</option>
                        <option value="Science and Technology">Science and Technology</option>
                        <option value="Mathematics">Mathematics</option>
                      </optgroup>
                    </select>
                  );
                })()}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase">Grade:</span>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setSelectedGrade(newGrade);
                    if (currentTeacher.gradeSubjects?.[newGrade]?.length) {
                      setSelectedSubject(currentTeacher.gradeSubjects[newGrade][0]);
                    }
                  }}
                  className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Term selector (2 Terms prominent, 3rd Term is Revision) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Term Pacing:
              </span>
              {(['Term 1', 'Term 2', 'Term 3 (Revision)'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    if (t === 'Term 3 (Revision)') {
                      setSelectedTerm('Term 3' as any);
                      showToast('Term 3 selected: Reserved exclusively for Revision Exams & Focus Zone 🎯');
                    } else {
                      setSelectedTerm(t as any);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    (t === 'Term 3 (Revision)' && selectedTerm === 'Term 3') || selectedTerm === t
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Document Categories Horizontal Scroll / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
            {DOCUMENT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{cat.icon}</span>
                    {cat.badge && (
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-white text-blue-900' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold line-clamp-2 mt-1 leading-tight">
                    {cat.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* =====================================================================
              ACTIVE CATEGORY CONTENT CARD (THE 16 DOCUMENTS RENDERER)
              ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-5 space-y-4 animate-fadeIn">
            {/* 1. KNEC/CBE CURRICULUM DOCUMENTS */}
            {activeCategory === 'knec_cbe' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🏛️ 1. KNEC / CBE Official Curriculum Documents</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kenya Institute of Curriculum Development (KICD) Approved Designs & KNEC Assessment Frameworks
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenInWord(
                        `KNEC CBE Curriculum Design - ${selectedSubject} (${selectedGrade})`,
                        `# OFFICIAL KNEC / KICD CURRICULUM DESIGN\nSubject: ${selectedSubject}\nLevel: ${selectedGrade}\nTeacher: ${currentTeacher.name}\n\n[Teacher can type or paste KICD guidelines, general outcomes, and strand indicators here...]`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Word Tool</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800">KICD Curriculum Framework Guidelines:</div>
                  <p className="text-slate-600 leading-relaxed">
                    Access official syllabus indicators for {selectedSubject} in {selectedGrade}. Formatted for direct reference during lesson planning and schemes breakdown.
                  </p>
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleOpenInWord(`Curriculum Design - ${selectedSubject}`, `# ${selectedSubject} CURRICULUM DESIGN (${selectedGrade})\n\n[Key in learning areas and specific strand outcomes]`)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                    >
                      Read & Annotate in Word
                    </button>
                    <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer">
                      Upload Syllabus PDF
                      <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) showToast(`Uploaded ${e.target.files[0].name} to curriculum shelf 📄`);
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SCHEMES OF WORK (2 TERMS, NO 3RD TERM • READY TO KEY IN) */}
            {activeCategory === 'schemes' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📋 2. Schemes of Work (2-Term Template • Ready to Key In)</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {selectedSubject} • {selectedGrade}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Broken down into 2 terms & daily lessons. Term 3 is reserved for revision. Key in your own strands and outcomes below.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAddSchemeRow}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Scheme Row</span>
                    </button>
                    <button
                      onClick={() => handleOpenInSpreadsheet(`Schemes of Work - ${selectedSubject}`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-700 cursor-pointer"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Spreadsheet Tool</span>
                    </button>
                  </div>
                </div>

                {/* Notice on 2-term breakdown */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>2-Term Daily Pacing: You can key in strands, sub-strands, and learning outcomes for each lesson.</span>
                  </span>
                  <span className="font-mono text-[10px] bg-amber-200/70 px-2 py-0.5 rounded text-amber-950 font-bold">
                    Term 3 = Revision Only
                  </span>
                </div>

                {/* Table of Schemes (Key-in Editable Cells) */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="p-2 w-16 text-center">Wk / Lsn</th>
                        <th className="p-2 w-32">Strand</th>
                        <th className="p-2 w-32">Sub-Strand</th>
                        <th className="p-2">Specific Learning Outcomes</th>
                        <th className="p-2 w-32">Key Inquiry Question</th>
                        <th className="p-2 w-28">Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {schemesRows.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/30">
                          <td className="p-2 text-center font-bold font-mono text-blue-700 bg-slate-50">
                            {row.wkLsn}
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.strand}
                              onChange={(e) => handleUpdateSchemeCell(row.id, 'strand', e.target.value)}
                              placeholder="Key in strand..."
                              className="w-full p-1 text-xs border border-slate-200 rounded font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.subStrand}
                              onChange={(e) => handleUpdateSchemeCell(row.id, 'subStrand', e.target.value)}
                              placeholder="Key in sub-strand..."
                              className="w-full p-1 text-xs border border-slate-200 rounded text-blue-700 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.outcomes}
                              onChange={(e) => handleUpdateSchemeCell(row.id, 'outcomes', e.target.value)}
                              placeholder="Specific learning outcome..."
                              className="w-full p-1 text-xs border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.kiq}
                              onChange={(e) => handleUpdateSchemeCell(row.id, 'kiq', e.target.value)}
                              placeholder="Key question..."
                              className="w-full p-1 text-xs border border-slate-200 rounded italic text-slate-600 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.assessment}
                              onChange={(e) => handleUpdateSchemeCell(row.id, 'assessment', e.target.value)}
                              placeholder="e.g. Oral, Written"
                              className="w-full p-1 text-xs border border-slate-200 rounded text-emerald-700 font-semibold focus:outline-none focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Entries save automatically into local device memory.</span>
                  <button
                    onClick={() => showToast('Schemes of work saved locally 💾')}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500"
                  >
                    Save Schemes of Work
                  </button>
                </div>
              </div>
            )}

            {/* 3. LESSON PLANS (BLANK CBC FORMAT READY TO KEY IN) */}
            {activeCategory === 'lesson_plans' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📝 3. Lesson Plans (CBC Format • Ready to Key In)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard CBC format for 2 terms. Key in your strand, outcomes, and lesson development steps.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenInWord(
                        `CBC Daily Lesson Plan - ${selectedSubject}`,
                        `# OFFICIAL CBC DAILY LESSON PLAN\nSchool: Little Roses Academy\nTeacher: ${currentTeacher.name}\nSubject: ${selectedSubject} | Grade: ${selectedGrade}\n\nStrand: ${lessonPlanData.strand || '[Key in Strand]'}\nSub-Strand: ${lessonPlanData.subStrand || '[Key in Sub-Strand]'}\n\nSpecific Learning Outcomes:\n${lessonPlanData.outcomes || '[Teacher to key in outcomes]'}\n\nKey Inquiry Question:\n${lessonPlanData.kiq || '[Teacher to key in question]'}\n\nLesson Development Steps:\n• Introduction: ${lessonPlanData.starter || '[Key in Starter]'}\n• Main Activity: ${lessonPlanData.development || '[Key in Activity]'}\n• Conclusion: ${lessonPlanData.plenary || '[Key in Plenary]'}`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Word Tool</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Strand</label>
                      <input
                        type="text"
                        value={lessonPlanData.strand}
                        onChange={(e) => setLessonPlanData({ ...lessonPlanData, strand: e.target.value })}
                        placeholder="e.g. Listening and Speaking / Numbers / Living Things"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sub-Strand</label>
                      <input
                        type="text"
                        value={lessonPlanData.subStrand}
                        onChange={(e) => setLessonPlanData({ ...lessonPlanData, subStrand: e.target.value })}
                        placeholder="Key in specific sub-strand topic..."
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Specific Learning Outcomes</label>
                    <textarea
                      rows={2}
                      value={lessonPlanData.outcomes}
                      onChange={(e) => setLessonPlanData({ ...lessonPlanData, outcomes: e.target.value })}
                      placeholder="By the end of the lesson, the learner should be able to..."
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Key Inquiry Question</label>
                    <input
                      type="text"
                      value={lessonPlanData.kiq}
                      onChange={(e) => setLessonPlanData({ ...lessonPlanData, kiq: e.target.value })}
                      placeholder="e.g. Why is this concept important in our daily lives?"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white italic text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="font-extrabold text-slate-900 uppercase">Lesson Development Steps:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">1. Starter / Intro (5–10 mins)</span>
                        <textarea
                          rows={2}
                          value={lessonPlanData.starter}
                          onChange={(e) => setLessonPlanData({ ...lessonPlanData, starter: e.target.value })}
                          placeholder="Warm-up, review..."
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">2. Main Activity (25–30 mins)</span>
                        <textarea
                          rows={2}
                          value={lessonPlanData.development}
                          onChange={(e) => setLessonPlanData({ ...lessonPlanData, development: e.target.value })}
                          placeholder="Pair work, practical tasks..."
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">3. Plenary / Conclusion (10 mins)</span>
                        <textarea
                          rows={2}
                          value={lessonPlanData.plenary}
                          onChange={(e) => setLessonPlanData({ ...lessonPlanData, plenary: e.target.value })}
                          placeholder="Summary, reflections..."
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => showToast(`Lesson plan saved for ${selectedSubject}! 💾`)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Save Lesson Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. LESSON NOTES (FULL BOOK REPOSITORY) */}
            {activeCategory === 'lesson_notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📖 4. Lesson Notes Repository (Whole Book / Module)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload your PDF/DOCX textbook or write notes in the Word tool.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenInWord(
                        `${selectedSubject} Lesson Notes Book`,
                        `# ${selectedSubject.toUpperCase()} NOTES BOOK\nTeacher: ${currentTeacher.name}\nGrade: ${selectedGrade}\n\n[Teacher can type or paste full chapter notes here...]`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Word Tool</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-800">Upload or Replace Full Lesson Notes File</div>
                    <div className="text-xs text-slate-500">
                      Supported formats: PDF, DOCX, TXT. Saved permanently in local phone memory.
                    </div>
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Upload Notes File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          showToast(`Uploaded "${file.name}" to teacher library! 💾`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 5. RECORDS OF WORK (TAUGHT VS NOT TAUGHT • SHIFT FORWARD) */}
            {activeCategory === 'records_of_work' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🌱 5. Living Records of Work (QASO Standard)</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Shift-Forward Pacing Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Unticking a lesson pushes that work to the following day and shifts subsequent work forward (not combined!).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddRecordOfWorkRow}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Work Entry</span>
                    </button>
                    <button
                      onClick={() => handleOpenInSpreadsheet('Living Record of Work')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-700 cursor-pointer"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Spreadsheet</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-emerald-950 text-white font-bold">
                        <th className="p-2.5 w-14 text-center">Taught?</th>
                        <th className="p-2.5 w-24">Date</th>
                        <th className="p-2.5 w-16 text-center">Lesson</th>
                        <th className="p-2.5">Strand</th>
                        <th className="p-2.5">Sub-Strand</th>
                        <th className="p-2.5 w-32">Status / Pacing</th>
                        <th className="p-2.5 w-32 text-center font-serif">Teacher Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {recordsOfWorkState.map((row) => (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            row.taught ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={row.taught}
                              onChange={() => handleToggleRecordOfWork(row.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">{row.date}</td>
                          <td className="p-2.5 text-center font-bold text-slate-700">L{row.lessonNo}</td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.strand}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRecordsOfWorkState((prev) =>
                                  prev.map((r) => (r.id === row.id ? { ...r, strand: val } : r))
                                );
                              }}
                              placeholder="Key in strand..."
                              className="w-full p-1 text-xs border border-slate-200 rounded font-bold text-slate-800"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.subStrand}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRecordsOfWorkState((prev) =>
                                  prev.map((r) => (r.id === row.id ? { ...r, subStrand: val } : r))
                                );
                              }}
                              placeholder="Key in sub-strand..."
                              className="w-full p-1 text-xs border border-slate-200 rounded text-blue-700"
                            />
                          </td>
                          <td className="p-2.5">
                            {row.taught ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Taught on Schedule
                              </span>
                            ) : row.shifted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                ⏩ Shifted Forward
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-600">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-serif italic text-blue-900 font-bold">
                            {row.signature || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. CATs & ASSESSMENT RECORDS (KEY IN MARKS • AUTO 60/40) */}
            {activeCategory === 'cats_assessments' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📊 6. CATs & Assessment Records (60% CAT + 40% Assignment)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Key in your CAT scores and Assignment marks directly below. Formula automatically calculates 60/40 total.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenInSpreadsheet('CATs & Assignments Spreadsheet')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Open in Spreadsheet Tool</span>
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">📐 CBC Formula:</span>
                    <span>Total = (Average CAT Score &times; 0.60) + (Average Assignment Score &times; 0.40)</span>
                  </div>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Rounded to 100%
                  </span>
                </div>

                {/* Key-in Editable Marks Grid */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="p-2">Learner Name</th>
                        <th className="p-2 text-center w-20">CAT 1 (/20)</th>
                        <th className="p-2 text-center w-20">CAT 2 (/20)</th>
                        <th className="p-2 text-center w-20">CAT 3 (/20)</th>
                        <th className="p-2 text-center w-24 bg-blue-900">CAT 60%</th>
                        <th className="p-2 text-center w-20">Assign 1 (/10)</th>
                        <th className="p-2 text-center w-20">Assign 2 (/10)</th>
                        <th className="p-2 text-center w-24 bg-purple-900">Assign 40%</th>
                        <th className="p-2 text-center w-24 bg-emerald-900">Total 100%</th>
                        <th className="p-2 text-center w-20">CBC Band</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {[
                        { upi: 'LRA-2026-0042', name: 'Brian Mwangi Kamau' },
                        { upi: 'LRA-2026-0047', name: 'Aisha Njeri Odhiambo' },
                        { upi: 'LRA-2026-0019', name: 'Kevin Otieno Onyango' },
                        { upi: 'LRA-2026-0033', name: 'Mercy Wanjiku Gitau' },
                        { upi: 'LRA-2026-0051', name: 'David Kiprono Cheruiyot' }
                      ].map((pupil) => {
                        const marks = assessmentMarks[pupil.upi] || { cat1: '', cat2: '', cat3: '', assign1: '', assign2: '' };
                        const computed = calculatePupilTotal(pupil.upi);

                        return (
                          <tr key={pupil.upi} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-800">
                              <div>{pupil.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{pupil.upi}</div>
                            </td>

                            {/* CAT 1 */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={marks.cat1}
                                onChange={(e) => handleUpdateMark(pupil.upi, 'cat1', e.target.value)}
                                placeholder="—"
                                className="w-14 p-1 text-center font-bold text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* CAT 2 */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={marks.cat2}
                                onChange={(e) => handleUpdateMark(pupil.upi, 'cat2', e.target.value)}
                                placeholder="—"
                                className="w-14 p-1 text-center font-bold text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* CAT 3 */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={marks.cat3}
                                onChange={(e) => handleUpdateMark(pupil.upi, 'cat3', e.target.value)}
                                placeholder="—"
                                className="w-14 p-1 text-center font-bold text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Auto CAT 60% */}
                            <td className="p-2 text-center font-bold text-blue-700 bg-blue-50/50">
                              {computed ? computed.cat60 : '—'}
                            </td>

                            {/* Assign 1 */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={marks.assign1}
                                onChange={(e) => handleUpdateMark(pupil.upi, 'assign1', e.target.value)}
                                placeholder="—"
                                className="w-14 p-1 text-center font-bold text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Assign 2 */}
                            <td className="p-1 text-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={marks.assign2}
                                onChange={(e) => handleUpdateMark(pupil.upi, 'assign2', e.target.value)}
                                placeholder="—"
                                className="w-14 p-1 text-center font-bold text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Auto Assign 40% */}
                            <td className="p-2 text-center font-bold text-purple-700 bg-purple-50/50">
                              {computed ? computed.assign40 : '—'}
                            </td>

                            {/* Auto Total */}
                            <td className="p-2 text-center font-black text-sm text-emerald-800 bg-emerald-50">
                              {computed ? computed.total : '—'}
                            </td>

                            {/* Band */}
                            <td className="p-2 text-center">
                              {computed ? (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                                    computed.band === 'EE'
                                      ? 'bg-emerald-600'
                                      : computed.band === 'ME'
                                      ? 'bg-blue-600'
                                      : computed.band === 'AE'
                                      ? 'bg-amber-500'
                                      : 'bg-red-600'
                                  }`}
                                >
                                  {computed.band}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => showToast('Assessment marks saved to device memory 💾')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Save All Keyed Marks
                  </button>
                </div>
              </div>
            )}

            {/* 7. RUBRICS / ASSESSMENT BOOKS (4 COLORS • BLANK FORMAT READY TO BE FILLED) */}
            {activeCategory === 'rubrics' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🎨 7. Rubrics & Assessment Book Format (4 Official Colors)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Clean blank template formatted for {selectedGrade} {selectedSubject}. Ready for you to key in or populate once CATs and assignments are done.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenInSpreadsheet(`Rubric Assessment Book - ${selectedSubject}`)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Open in Spreadsheet</span>
                  </button>
                </div>

                {/* 4 Colors Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                    <div className="font-black text-sm text-emerald-800">🟢 Exceeding Expectations (EE)</div>
                    <div className="text-[10px] text-emerald-700">80% – 100% (24–30 Marks)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-300 text-center">
                    <div className="font-black text-sm text-blue-800">🔵 Meeting Expectations (ME)</div>
                    <div className="text-[10px] text-blue-700">60% – 79% (18–23 Marks)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-center">
                    <div className="font-black text-sm text-amber-800">🟡 Approaching Expectations (AE)</div>
                    <div className="text-[10px] text-amber-700">40% – 59% (12–17 Marks)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-center">
                    <div className="font-black text-sm text-red-800">🔴 Below Expectations (BE)</div>
                    <div className="text-[10px] text-red-700">0% – 39% (0–11 Marks)</div>
                  </div>
                </div>

                {/* Blank Rubric Format Grid */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="p-2.5">Learner Name</th>
                        <th className="p-2.5">UPI</th>
                        {rubricStrands.map((strand, i) => (
                          <th key={i} className="p-2 text-center min-w-[120px]">
                            <input
                              type="text"
                              value={strand}
                              onChange={(e) => {
                                const next = [...rubricStrands];
                                next[i] = e.target.value;
                                setRubricStrands(next);
                              }}
                              className="w-full bg-transparent text-white font-bold text-center focus:outline-none focus:bg-slate-700 px-1 py-0.5 rounded"
                            />
                          </th>
                        ))}
                        <th className="p-2.5 text-center">Overall Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {[
                        { upi: 'LRA-2026-0042', name: 'Brian Mwangi Kamau' },
                        { upi: 'LRA-2026-0047', name: 'Aisha Njeri Odhiambo' },
                        { upi: 'LRA-2026-0019', name: 'Kevin Otieno Onyango' },
                        { upi: 'LRA-2026-0033', name: 'Mercy Wanjiku Gitau' },
                        { upi: 'LRA-2026-0051', name: 'David Kiprono Cheruiyot' }
                      ].map((p) => (
                        <tr key={p.upi} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{p.upi}</td>
                          {rubricStrands.map((strand, i) => {
                            const val = rubricData[p.upi]?.[strand] || '';
                            return (
                              <td key={i} className="p-1 text-center">
                                <select
                                  value={val}
                                  onChange={(e) => handleUpdateRubricCell(p.upi, strand, e.target.value)}
                                  className={`text-xs font-black px-2 py-1 rounded border focus:outline-none ${
                                    val === 'EE'
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : val === 'ME'
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : val === 'AE'
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : val === 'BE'
                                      ? 'bg-red-600 text-white border-red-600'
                                      : 'bg-white text-slate-400 border-slate-300'
                                  }`}
                                >
                                  <option value="">—</option>
                                  <option value="EE">🟢 EE</option>
                                  <option value="ME">🔵 ME</option>
                                  <option value="AE">🟡 AE</option>
                                  <option value="BE">🔴 BE</option>
                                </select>
                              </td>
                            );
                          })}
                          <td className="p-2 text-center text-slate-400 font-bold">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => showToast('Assessment book rubric saved to workstation 💾')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Save Rubric Data
                  </button>
                </div>
              </div>
            )}

            {/* 8. TEACHING & LEARNING RESOURCES (PHOTOS, VIDEOS, NOTES) */}
            {activeCategory === 'media_resources' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📸 8. Teaching & Learning Resources</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload your own notes, videos, or photos for {selectedSubject} to assist in teaching.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMediaModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Resource</span>
                  </button>
                </div>

                {mediaList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="text-3xl">📁</div>
                    <div className="font-bold text-sm text-slate-700">No resources uploaded yet for {selectedSubject}</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Tap &ldquo;Upload Resource&rdquo; above to attach pictures from your phone, link videos, or add teaching notes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {mediaList.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between"
                      >
                        <div className="relative h-32 bg-slate-800 overflow-hidden">
                          <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
                            {m.type}
                          </span>
                        </div>
                        <div className="p-3 space-y-1">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{m.title}</h4>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-400">{m.subject}</span>
                            <button
                              onClick={() => showToast(`Resource "${m.title}" ready to present in class 📽️`)}
                              className="font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                            >
                              Present →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 9. ASSIGNMENTS (COMPOSE & PUSH TO LEARNERS & PARENTS) */}
            {activeCategory === 'assignments' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📑 9. Assignments & Homework Delivery</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Key in your homework task for {selectedSubject} and push to learners & parents.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handlePushAssignmentToParents(assignmentDraft.title, assignmentDraft.dueDate)
                    }
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Push Assignment to Learners & Parents 🚀</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Assignment Title</label>
                      <input
                        type="text"
                        value={assignmentDraft.title}
                        onChange={(e) => setAssignmentDraft({ ...assignmentDraft, title: e.target.value })}
                        placeholder="Key in assignment title..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Due Date & Time</label>
                      <input
                        type="text"
                        value={assignmentDraft.dueDate}
                        onChange={(e) => setAssignmentDraft({ ...assignmentDraft, dueDate: e.target.value })}
                        placeholder="e.g. Tomorrow 08:00 AM"
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Assignment Tasks / Questions</label>
                    <textarea
                      rows={4}
                      value={assignmentDraft.instructions}
                      onChange={(e) => setAssignmentDraft({ ...assignmentDraft, instructions: e.target.value })}
                      placeholder="Key in question 1, question 2, instructions..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Dispatches to {selectedGrade} parents via WhatsApp link & student portal.
                    </span>
                    <button
                      onClick={() =>
                        handleOpenInWord(
                          `Assignment - ${selectedSubject}`,
                          `# ${selectedSubject.toUpperCase()} ASSIGNMENT\nGrade: ${selectedGrade}\nDue: ${assignmentDraft.dueDate}\n\n${assignmentDraft.instructions || '[Type questions here]'}`
                        )
                      }
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Open in Word Tool →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. REVISION EXAMS & PAST PAPERS (USED IN TERM 3 / FOCUS ZONE) */}
            {activeCategory === 'revision_exams' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🎯 10. Revision Exams & Past Papers (Term 3 Focus Zone)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Grouped by strand for {selectedSubject}. Used in 3rd term for revision under learner Focus Zone.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenInWord(
                        `${selectedSubject} Term 3 Revision Exam`,
                        `# ${selectedSubject.toUpperCase()} REVISION EXAM (TERM 3)\nLevel: ${selectedGrade}\nTeacher: ${currentTeacher.name}\n\n[Teacher keys in revision exam questions and marking scheme here...]`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Word Tool</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Term 3 Revision Bank ({selectedSubject}):</div>
                  <p className="text-slate-600">
                    Create or paste your past examination papers and marking schemes. When scheduled in Term 3, questions push directly to learners needing extra practice.
                  </p>
                  <button
                    onClick={() => showToast('Revision exam pushed to learner Focus Zone! 🎯')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                  >
                    Push Paper to Focus Zone
                  </button>
                </div>
              </div>
            )}

            {/* 11. CLASS NOTES (KEY IN TODAY'S SUMMARY) */}
            {activeCategory === 'class_notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>✏️ 11. Class Notes (Day&apos;s Specific Lesson Summary)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Key in today&apos;s chalkboard summary notes for {selectedSubject} ({selectedGrade}).
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenInWord(
                        `Day Class Notes - ${selectedSubject}`,
                        `# TODAY'S CHALKBOARD NOTES: ${selectedSubject.toUpperCase()}\nGrade: ${selectedGrade}\nTeacher: ${currentTeacher.name}\n\n${todayClassNotes || '[Teacher keys in chalkboard summary]'}`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Word Tool</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
                  <label className="font-bold text-purple-900 block">Today&apos;s Pupil Chalkboard Summary:</label>
                  <textarea
                    rows={6}
                    value={todayClassNotes}
                    onChange={(e) => setTodayClassNotes(e.target.value)}
                    placeholder="Key in the board summary for pupils to copy into their notebooks..."
                    className="w-full p-3 rounded-xl border border-purple-200 bg-white font-mono text-purple-950 focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => showToast('Class notes saved and ready for pupil presentation! ✏️')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    >
                      Save Class Notes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 12. TEACHER-CREATED DOCUMENTS (DIARY / PEDAGOGICAL NOTES) */}
            {activeCategory === 'teacher_created' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📓 12. Teacher-Created Documents (Diary & Personal Log)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Teacher&apos;s pedagogical diary, reflection notes, and custom instructional records.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenInWord(
                        `${currentTeacher.name}'s Pedagogical Diary`,
                        `# TEACHER'S DAILY PEDAGOGICAL DIARY\nTeacher: ${currentTeacher.name}\nDate: ${new Date().toLocaleDateString()}\n\nReflections:\n[Teacher to write personal notes and lesson reflections here...]`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Word Tool</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>📔</span>
                    <span>Teacher Reflection Log</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Key in your pedagogical observations, learner progress reflections, or diary entries..."
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => showToast('Diary entry saved to private teacher storage 💾')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 13. TIMETABLES (2 TIMETABLES: TEACHER'S EDITABLE & CLASS ADMIN TIMETABLE) */}
            {activeCategory === 'timetables' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>⏱️ 13. The 2 Timetables (Teacher&apos;s Editable + Class Master)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      1) Teacher&apos;s Timetable (Editable by teacher) • 2) Class Timetable (Official from School Office)
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenInSpreadsheet('Teacher & Class Timetables')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Open in Spreadsheet</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Table A: Teacher's Editable Timetable */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-900 uppercase">
                        A. Teacher&apos;s Personal Timetable (Editable)
                      </span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">
                        {currentTeacher.name}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { time: '08:10 – 09:00', grade: selectedGrade, subject: selectedSubject, room: 'Room 4' },
                        { time: '09:00 – 09:50', grade: selectedGrade, subject: selectedSubject, room: 'Room 5' }
                      ].map((period, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white border border-blue-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{period.subject} ({period.grade})</span>
                            <span className="block text-[10px] text-slate-500 font-mono">{period.time} • {period.room}</span>
                          </div>
                          <button
                            onClick={() => showToast('Period details updated!')}
                            className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table B: Class Master Timetable from Admin */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 uppercase">
                        B. Class Timetable (From School Administration)
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold bg-slate-200 px-2 py-0.5 rounded">
                        {selectedGrade} Master
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { time: '08:10 – 09:00', subject: selectedSubject, teacher: currentTeacher.name },
                        { time: '09:00 – 09:50', subject: 'Languages', teacher: 'Staff' }
                      ].map((item, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{item.subject}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">{item.time}</span>
                          </div>
                          <span className="text-[11px] text-slate-700 font-semibold">{item.teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 14. CLASS LISTS / LEARNER RECORDS */}
            {activeCategory === 'class_lists' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>👥 14. Class Lists & Learner Credentials</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Learner profiles, UPI numbers, login PINs/passwords, and roster records for {selectedGrade}.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenInSpreadsheet('Learners Credentials & Roster List')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Open in Spreadsheet</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="p-2">Learner Name</th>
                        <th className="p-2">UPI</th>
                        <th className="p-2">Gender</th>
                        <th className="p-2">Student PIN</th>
                        <th className="p-2">Parent Contact</th>
                        <th className="p-2">Parent Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {[
                        { name: 'Brian Mwangi Kamau', upi: 'LRA-2026-0042', gender: 'Boy', pin: '123', parent: 'Mama Brian (0720 112 233)', pass: '4455' },
                        { name: 'Aisha Njeri Odhiambo', upi: 'LRA-2026-0047', gender: 'Girl', pin: '234', parent: 'Mr. Odhiambo (0723 456 789)', pass: '8899' },
                        { name: 'Kevin Otieno Onyango', upi: 'LRA-2026-0019', gender: 'Boy', pin: '345', parent: 'Mama Kevin (0701 234 567)', pass: '1122' },
                        { name: 'Mercy Wanjiku Gitau', upi: 'LRA-2026-0033', gender: 'Girl', pin: '456', parent: 'Mr. Gitau (0718 987 654)', pass: '3344' },
                        { name: 'David Kiprono Cheruiyot', upi: 'LRA-2026-0051', gender: 'Boy', pin: '567', parent: 'Mama Kiprono (0720 112 233)', pass: '5566' }
                      ].map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-800">{p.name}</td>
                          <td className="p-2 font-mono text-[11px] text-blue-700">{p.upi}</td>
                          <td className="p-2 text-slate-600">{p.gender}</td>
                          <td className="p-2 font-mono font-bold text-slate-900 bg-slate-50">{p.pin}</td>
                          <td className="p-2 text-slate-700">{p.parent}</td>
                          <td className="p-2 font-mono text-slate-600">{p.pass}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 15. TEACHER REPORTS (AI KNOWLEDGE & AUTO PUSH TO FOCUS ZONE) */}
            {activeCategory === 'teacher_reports' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🧠 15. Teacher Reports & AI Focus Zone Sync</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Key in your lesson reflections for {selectedSubject}. Below Average (BE) or Approaching (AE) strands are automatically pushed to Learner Focus Zone!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast(`AI Synced: Focus Zone updated for ${selectedSubject} (${selectedGrade})! 🚀`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Focus Zone Sync</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3 text-xs">
                  <label className="font-black text-purple-900 uppercase block">
                    Teacher Lesson Reflection & Qualitative Observations:
                  </label>
                  <textarea
                    rows={4}
                    value={teacherReportText}
                    onChange={(e) => setTeacherReportText(e.target.value)}
                    placeholder={`Key in observations for ${selectedSubject} (e.g. which concepts learners understood well and which strands require targeted support)...`}
                    className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-[11px] text-purple-900 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>AI Action: Identifies struggling pupils and automatically pushes remedial practice into their student portal under Focus Zone.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD TEACHING RESOURCE (PHOTO / VIDEO / NOTES)
          ========================================================================= */}
      {showAddMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-300 w-full max-w-md p-5 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload Teaching Resource</span>
              </h3>
              <button
                onClick={() => setShowAddMediaModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource Title</label>
                <input
                  type="text"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  placeholder="Key in resource title..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-sans"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image', label: '📸 Photo / Chart' },
                    { id: 'video', label: '🎥 Video Link' },
                    { id: 'notes', label: '📝 Note / Slide' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewMediaType(t.id as any)}
                      className={`p-2 rounded-xl text-center font-bold text-xs border ${
                        newMediaType === t.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Upload File or Web Link</label>
                <input
                  type="file"
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMediaModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
