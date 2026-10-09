import React, { useState, useRef, useId } from 'react';
import {
  Sparkles,
  FileText,
  UploadCloud,
  CheckCircle2,
  Users,
  Send,
  Eye,
  FileCheck,
  AlertCircle,
  X,
  Search,
  BookOpen,
  Layers,
  Award,
  Clock,
  Copy,
  Check,
  RefreshCw,
  FolderPlus,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  analyzeAndRouteDocument,
  dispatchResourceToTeachers,
  ExtractedDocumentContent,
  CANONICAL_CBC_SUBJECTS,
  CANONICAL_GRADES,
  CANONICAL_RESOURCE_CATEGORIES,
} from '../services/aiDocumentAssistant';
import { dataLayer, TeacherAccountRecord, ResourcePackageRecord } from '../services/dataLayer';
import { formatBytes } from './AdminResourceWorkspace';

export interface OfflineAIDocumentAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: (newPkg: ResourcePackageRecord) => void;
  initialTeacherId?: string;
  initialGrade?: string;
  initialSubject?: string;
  initialCategory?: string;
}

// Built-in offline CBC sample documents for instant testing
const SAMPLE_DOCUMENTS = [
  {
    name: 'Grade_4_Mathematics_Term1_Scheme_of_Work.docx',
    label: 'Math Scheme of Work (Grade 4)',
    type: 'docx',
    text: `LITTLE ROSES ACADEMY
DEPARTMENT OF MATHEMATICS & NUMERACY
COMPETENCY-BASED CURRICULUM (CBC) - SCHEMES OF WORK 2026
GRADE: GRADE 4
SUBJECT: MATHEMATICS ACTIVITIES
TERM: TERM 1
STRAND: NUMBERS & OPERATIONS
SUB-STRAND: WHOLE NUMBERS (PLACE VALUES & ADDITION OF UP TO 5-DIGIT NUMBERS)

LESSON SPECIFIC LEARNING OUTCOMES:
1. By the end of the lesson, the learner should be able to identify place value of digits up to ten thousands in given numeral models.
2. Read, write and represent whole numbers up to 10,000 using number charts and abacus.
3. Solve real-life practical addition word problems involving trading/regrouping.

CORE COMPETENCIES:
- Critical thinking and problem solving during abacus representations.
- Communication and collaboration in group place value trading exercises.
- Digital literacy when exploring interactive counters.

FORMATIVE ASSESSMENT STRATEGIES:
- Observation checklists during small-group abacus exercises.
- Learner workbook exercises and mental arithmetic drills.
- Rubrics: Exceeding Expectations (4), Meeting Expectations (3), Approaching Expectations (2), Below Expectations (1).`,
  },
  {
    name: 'Grade_3_English_Reading_Comprehension_CAT.pdf',
    label: 'English CAT Assessment (Grade 3)',
    type: 'pdf',
    text: `LITTLE ROSES ACADEMY - NAKURU
PRIMARY ASSESSMENT UNIT
ENGLISH LANGUAGE ACTIVITIES - CONTINUOUS ASSESSMENT TEST (CAT 1)
GRADE: GRADE 3
TERM: TERM 1, 2026
STRAND: LISTENING, SPEAKING & READING COMPREHENSION
SUB-STRAND: VOCABULARY & GUIDED STORY READING

SECTION A: COMPREHENSION PASSAGE (THE BUSY SATURDAY AT LAKE NAKURU)
Read the story below carefully and answer the questions that follow:
Amina and her younger brother Kiptoo visited the park with their parents. They spotted flamingos wading near the alkaline waters and white rhinos grazing quietly beneath the acacia canopy. Amina reminded Kiptoo to collect all discarded wrappers to preserve the ecosystem.

QUESTIONS:
1. Who did Amina travel with to Lake Nakuru?
2. Which bird species did the children observe in the water?
3. Why is it important not to litter the game reserve?
4. Identify two naming words (nouns) and two action words (verbs) from the passage.

ASSESSMENT RUBRIC:
- Fluency, accuracy, contextual vocabulary usage, and grammatical sentence structure.`,
  },
  {
    name: 'Grade_5_Science_and_Technology_Lesson_Notes.doc',
    label: 'Science Notes (Grade 5)',
    type: 'doc',
    text: `LITTLE ROSES ACADEMY
SCIENCE AND TECHNOLOGY COMPREHENSIVE LESSON NOTES
GRADE: GRADE 5
STRAND: LIVING THINGS AND THEIR ENVIRONMENT
SUB-STRAND: CLASSIFICATION OF INVERTEBRATES AND VERTEBRATES

1. KEY SCIENTIFIC CONCEPTS:
Animals are divided into vertebrates (animals with backbones) and invertebrates (animals without backbones).
Vertebrate Groups: Mammals, Birds, Reptiles, Amphibians, Fish.
Invertebrate Groups: Insects, Arachnids, Crustaceans, Mollusks, Myriapods.

2. LEARNER PRACTICAL INVESTIGATION:
Learners will explore the school nature garden with hand lenses, observing external body parts of garden snails and ants without harming them.
Record findings on the biological classification table:
- Number of legs
- Presence of wings
- Body segmentation (head, thorax, abdomen).

3. ENVIRONMENTAL STEWARDSHIP & SAFETY:
Handle living organisms gently and return them to their natural habitats after observation. Wash hands thoroughly with soap.`,
  },
];

export function OfflineAIDocumentAssistantModal({
  isOpen,
  onClose,
  onDispatched,
  initialTeacherId,
  initialGrade,
  initialSubject,
  initialCategory,
}: OfflineAIDocumentAssistantModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Workflow state: 'select' | 'analyzing' | 'review' | 'success'
  const [step, setStep] = useState<'select' | 'analyzing' | 'review' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExtractedDocumentContent | null>(null);

  // Editable parameters for dispatch
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState(initialGrade || 'Grade 4');
  const [subject, setSubject] = useState(initialSubject || 'Mathematics Activities');
  const [category, setCategory] = useState(initialCategory || 'Schemes of Work');
  const [strand, setStrand] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'routing' | 'extracted_content'>('routing');
  const [copiedText, setCopiedText] = useState(false);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [dispatchedSummary, setDispatchedSummary] = useState<{ title: string; count: number; teacherNames: string[] } | null>(null);

  if (!isOpen) return null;

  const allStaff = dataLayer.getTeachers();

  // Reset assistant
  const handleReset = () => {
    setStep('select');
    setSelectedFile(null);
    setFileDataUrl(null);
    setAnalysisResult(null);
    setTitle('');
    setStrand('');
    setSelectedTeacherIds([]);
    setActiveTab('routing');
    setDispatchedSummary(null);
  };

  // Run offline AI analysis on a file
  const processFile = async (file: File) => {
    setSelectedFile(file);
    setStep('analyzing');
    setIsProcessing(true);

    // Read Data URL for offline caching & download
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = (e.target?.result as string) || '';
      setFileDataUrl(dataUrl);

      try {
        // Run offline AI analysis & teacher matching
        const result = await analyzeAndRouteDocument(file, dataUrl);
        setAnalysisResult(result);

        // Pre-fill fields based on AI detection
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        setGrade(initialGrade || result.detectedGrade || 'Grade 4');
        setSubject(initialSubject || result.detectedSubject || 'Mathematics Activities');
        setCategory(initialCategory || result.detectedCategory || 'Schemes of Work');
        setStrand(result.detectedStrand || 'Core Competency Strand');

        // Pre-select matched teachers (exact matches first, or all matched)
        const recipientIds: string[] = [];
        if (initialTeacherId) {
          recipientIds.push(initialTeacherId);
        } else if (result.matchedTeachers.length > 0) {
          // Select high confidence matches
          result.matchedTeachers.forEach((m) => {
            if (m.confidence >= 80) recipientIds.push(m.teacher.id);
          });
          if (recipientIds.length === 0 && result.matchedTeachers[0]) {
            recipientIds.push(result.matchedTeachers[0].teacher.id);
          }
        }

        setSelectedTeacherIds(recipientIds);
        setStep('review');
      } catch (err) {
        console.error('Error analyzing document:', err);
        setStep('select');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setStep('select');
    };

    reader.readAsDataURL(file);
  };

  // Test with built-in sample document
  const handleLoadSample = (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    const blob = new Blob([sample.text], { type: 'text/plain' });
    const file = new File([blob], sample.name, { type: 'text/plain' });
    processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    );
  };

  const handleSelectAllMatched = () => {
    if (!analysisResult) return;
    const ids = analysisResult.matchedTeachers.map((m) => m.teacher.id);
    setSelectedTeacherIds(Array.from(new Set(ids)));
  };

  const handleSelectAllStaff = () => {
    setSelectedTeacherIds(allStaff.map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTeacherIds([]);
  };

  // Copy extracted text
  const handleCopyText = () => {
    if (analysisResult?.rawText) {
      navigator.clipboard.writeText(analysisResult.rawText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Execute dispatch to teachers
  const handleDispatch = () => {
    if (!analysisResult) return;

    const recipients = selectedTeacherIds.length > 0 ? selectedTeacherIds : ['all'];
    const recipientTeachers = allStaff.filter((t) => recipients.includes(t.id));
    const recipientNames = recipientTeachers.length > 0 ? recipientTeachers.map((t) => t.name) : ['All Allocated Staff'];

    const newPkg = dispatchResourceToTeachers({
      title: title.trim() || analysisResult.fileName,
      category,
      grade,
      subject,
      strand: strand.trim() || undefined,
      fileName: analysisResult.fileName,
      fileData: fileDataUrl || undefined,
      content: analysisResult.rawText,
      fileSizeBytes: analysisResult.fileSizeBytes,
      recipientTeacherIds: recipients,
      academicYear: '2026',
      term: 'Term 1',
    });

    setDispatchedSummary({
      title: title.trim() || analysisResult.fileName,
      count: recipients.includes('all') ? allStaff.length : recipients.length,
      teacherNames: recipientNames,
    });

    setStep('success');

    if (onDispatched) {
      onDispatched(newPkg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#080E24] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden text-white my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  Offline AI Document Assistant & Curriculum Router
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
                  <Zap className="w-2.5 h-2.5 text-cyan-400" /> 100% Offline
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Reads document contents, classifies CBC learning areas, and synchronizes directly to teacher portals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: SELECT DOCUMENT */}
          {step === 'select' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-cyan-950/10 to-slate-900/40 hover:bg-cyan-950/20 text-center transition cursor-pointer flex flex-col items-center justify-center gap-4"
              >
                <div className="p-4 rounded-2xl bg-cyan-500/10 group-hover:scale-110 border border-cyan-500/30 text-cyan-400 transition shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    Drop document to analyze offline, or <span className="text-cyan-400 underline">browse device</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Supports <b>PDF</b>, <b>Word (.docx, .doc)</b>, <b>Excel/Spreadsheets</b>, <b>Notes (.txt, .md)</b>, and scan images up to 50 MB.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 font-mono">
                  <span className="px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800">📄 PDF Stream Extraction</span>
                  <span className="px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800">📝 Word XML Parsing</span>
                  <span className="px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800">🔒 0 KB Network Required</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />

              {/* Instant Testing Samples */}
              <div className="rounded-2xl p-4 bg-slate-950/50 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Quick Test: Instant CBC Curriculum Samples
                  </span>
                  <span className="text-[10px] text-slate-500">1-click simulation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_DOCUMENTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="p-3 text-left rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold uppercase">
                            {sample.type}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                        </div>
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {sample.label}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2 truncate font-mono">
                        {sample.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white">Full Content Reader</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Extracts text and summaries directly from binary PDF & DOCX streams.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white">CBC Curriculum Alignment</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Detects Grade PP1-6, learning area, and official folder category.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white">Portal Synchronization</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Reflects in recipient teacher accounts immediately with zero buffering.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING STATE */}
          {step === 'analyzing' && (
            <div className="py-16 text-center space-y-6 animate-in fade-in">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-8 h-8 text-cyan-400 absolute" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-white">Offline AI Engine Reading Document...</h4>
                <p className="text-xs text-slate-400">
                  Parsing stream objects, detecting CBC learning objectives, and matching allocated teaching staff.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-cyan-400">
                  <span>● Binary text extraction</span>
                  <span>100%</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span>● CBC learning area alignment</span>
                  <span>Active</span>
                </div>
                <div className="flex items-center justify-between text-purple-400">
                  <span>● Roster teacher routing</span>
                  <span>Matching</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & ROUTING */}
          {step === 'review' && analysisResult && (
            <div className="space-y-6 animate-in fade-in">
              {/* AI Detection Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 font-mono">
                      {analysisResult.confidenceScore}% Match Confidence
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {analysisResult.fileSizeFormatted} • {analysisResult.wordCount} words • ~{analysisResult.readingMinutes} min read
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>{analysisResult.fileName}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {analysisResult.aiExplanation}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change File</span>
                  </button>
                </div>
              </div>

              {/* Tabs: Teacher Routing vs Extracted Content */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('routing')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'routing'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Teacher Recipients & Portal Routing ({selectedTeacherIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('extracted_content')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'extracted_content'
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Extracted Document Content ({analysisResult.wordCount} words)</span>
                  </button>
                </div>

                {activeTab === 'extracted_content' && (
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* TAB 1: TEACHER ROUTING & SPECIFICATIONS */}
              {activeTab === 'routing' && (
                <div className="space-y-6">
                  {/* Curriculum Metadata Configuration */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Curriculum Specifications & Destination Folder
                      </span>
                      <span className="text-[10px] text-slate-500">Auto-detected by offline AI (editable)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Resource Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                          placeholder="Resource title"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Target Grade Level
                        </label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                        >
                          {CANONICAL_GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Subject / Learning Area
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                        >
                          {CANONICAL_CBC_SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Resource Category / Folder
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                        >
                          {CANONICAL_RESOURCE_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Strand / Sub-Strand
                        </label>
                        <input
                          type="text"
                          value={strand}
                          onChange={(e) => setStrand(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                          placeholder="e.g. Numbers, Geometry, Living Things"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Academic Period
                        </label>
                        <div className="px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/80 text-slate-300 text-xs font-mono">
                          Term 1 • Academic Year 2026
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Teacher Selection */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>Matched School Teachers for {grade} • {subject}</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Selected teachers will immediately see this resource in their Teacher Portal under this subject.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAllMatched}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold hover:text-white"
                        >
                          Select Matched
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectAllStaff}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold hover:text-white"
                        >
                          Select All Staff
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Matched Teachers List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {analysisResult.matchedTeachers.length > 0 ? (
                        analysisResult.matchedTeachers.map((match) => {
                          const isSelected = selectedTeacherIds.includes(match.teacher.id);
                          return (
                            <div
                              key={match.teacher.id}
                              onClick={() => toggleTeacher(match.teacher.id)}
                              className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                                isSelected
                                  ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="mt-1 rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                              />

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <h5 className="text-xs font-bold text-white truncate">
                                    {match.teacher.name}
                                  </h5>
                                  <span
                                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold font-mono ${
                                      match.confidence >= 90
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}
                                  >
                                    {match.confidence}% match
                                  </span>
                                </div>
                                <p className="text-[11px] text-purple-300 font-medium leading-tight">
                                  {match.reason}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  Phone: {match.teacher.phone || '07XXXXXXXX'} • {match.teacher.isClassTeacher ? `Class Teacher (${match.teacher.classTeacherGrade || ''})` : 'Allocated Teacher'}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs text-center">
                          No exact grade & subject allocations found. Use the list below to select any staff member.
                        </div>
                      )}
                    </div>

                    {/* Show All Other Staff toggle */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAllTeachers(!showAllTeachers)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{showAllTeachers ? '▲ Hide other staff members' : '▼ Include other teachers from roster...'}</span>
                      </button>

                      {showAllTeachers && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                          {allStaff.map((t) => {
                            const isSelected = selectedTeacherIds.includes(t.id);
                            return (
                              <label
                                key={t.id}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition ${
                                  isSelected
                                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white font-bold'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleTeacher(t.id)}
                                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                                />
                                <span className="truncate">{t.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Reflection Guarantee Notice */}
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-300">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <b>Portal Reflection Guarantee:</b> Any resource added here for a teacher is stored in the school data repository and reflects in real-time in the teacher's dedicated <b>{grade} • {subject}</b> workspace folder under <b>{category}</b>.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXTRACTED CONTENT READER */}
              {activeTab === 'extracted_content' && (
                <div className="space-y-4">
                  {/* Content Stats Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Total Words: <b className="text-white">{analysisResult.wordCount}</b></span>
                      <span className="text-slate-400">Reading Time: <b className="text-white">~{analysisResult.readingMinutes} min</b></span>
                      <span className="text-slate-400">File Type: <b className="text-white uppercase font-mono">{analysisResult.fileName.split('.').pop()}</b></span>
                    </div>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Parsed Completely Offline
                    </span>
                  </div>

                  {/* Document Reader Box */}
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 sm:p-6 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed space-y-4 max-h-[50vh] overflow-y-auto">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="text-base font-bold text-white">{title || analysisResult.fileName}</h4>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">
                        {grade} • {subject} • {category}
                      </p>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed space-y-2 selection:bg-cyan-500 selection:text-black">
                      {analysisResult.rawText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS SUMMARY */}
          {step === 'success' && dispatchedSummary && (
            <div className="py-12 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-lg font-black text-white">Resource Successfully Dispatched!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "<b>{dispatchedSummary.title}</b>" has been routed and stored. It is now active and immediately accessible in the teacher portals for:
                </p>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-semibold max-h-32 overflow-y-auto">
                  {dispatchedSummary.teacherNames.join(' • ')}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Analyze Another Document</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'review' && (
          <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDispatch}
              disabled={selectedTeacherIds.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                selectedTeacherIds.length > 0
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                Dispatch & Reflect in Teacher Portals ({selectedTeacherIds.length} {selectedTeacherIds.length === 1 ? 'Teacher' : 'Teachers'})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
