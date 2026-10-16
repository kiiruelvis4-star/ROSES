import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  Search,
  Upload,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Info,
  Clock,
  Sliders,
  FileCheck,
  Zap,
  Volume2,
  VolumeX,
  Award,
  Star,
  Brain,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  HeartHandshake
} from 'lucide-react';
import {
  schoolAIService,
  DocumentMismatchReport,
  GeneratedAssessmentPackage,
  GeneratedLessonPlanPackage,
  AuditedResourceItem,
  LearnerProgressInsight
} from '../services/schoolAIService';
import {
  dataLayer,
  CurrentUserSession,
  CANONICAL_GRADES,
  LRA_GRADES,
  CANONICAL_CBC_SUBJECTS,
  ResourcePackageRecord,
  PupilRecord
} from '../services/dataLayer';
import { extractTextFromFile } from '../services/aiDocumentAssistant';

export type CentralSchoolAITab =
  | 'chat'
  | 'lesson_planner'
  | 'assessment_generator'
  | 'document_intelligence'
  | 'document_audit'
  | 'parent_guide'
  | 'practice_quiz'
  | 'progress_analyzer';

export interface CentralSchoolAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CurrentUserSession | null;
  initialTab?: CentralSchoolAITab;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'local_rag';
  sourceDocs?: string[];
  isError?: boolean;
}

export function CentralSchoolAIModal({
  isOpen,
  onClose,
  session,
  initialTab = 'chat',
}: CentralSchoolAIModalProps) {
  const role = session?.role || 'guest';
  const [activeTab, setActiveTab] = useState<CentralSchoolAITab>(initialTab);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Document Intelligence state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [extractedDocText, setExtractedDocText] = useState('');
  const [declaredGrade, setDeclaredGrade] = useState('Grade 2');
  const [declaredSubject, setDeclaredSubject] = useState('Mathematics Activities');
  const [declaredCategory, setDeclaredCategory] = useState('schemes');
  const [mismatchReport, setMismatchReport] = useState<DocumentMismatchReport | null>(null);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  // Assessment Generator state
  const [genGrade, setGenGrade] = useState(session?.role === 'teacher' ? 'Grade 3' : 'Grade 4');
  const [genSubject, setGenSubject] = useState('Mathematics Activities');
  const [genType, setGenType] = useState<'assignment' | 'cat' | 'revision' | 'remedial'>('assignment');
  const [genStrand, setGenStrand] = useState('Numbers & Operations');
  const [genSubstrand, setGenSubstrand] = useState('Fractions & Decimals');
  const [genCount, setGenCount] = useState(5);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedAssessmentPackage | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Lesson Plan Generator state
  const [lpGrade, setLpGrade] = useState(session?.role === 'teacher' ? 'Grade 3' : 'Grade 2');
  const [lpSubject, setLpSubject] = useState('Mathematics Activities');
  const [lpStrand, setLpStrand] = useState('Numbers');
  const [lpSubstrand, setLpSubstrand] = useState('Addition of 2-digit numbers with regrouping');
  const [lpDuration, setLpDuration] = useState(40);
  const [lpResources, setLpResources] = useState('Counters, bottle tops, abacus, number chart, flashcards');
  const [isGeneratingLessonPlan, setIsGeneratingLessonPlan] = useState(false);
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState<GeneratedLessonPlanPackage | null>(null);
  const [copiedLp, setCopiedLp] = useState(false);

  // Admin Document Audit state
  const [auditedResources, setAuditedResources] = useState<AuditedResourceItem[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'mismatch_only'>('mismatch_only');
  const [auditNotice, setAuditNotice] = useState<string | null>(null);

  // Parent Guide state
  const [selectedChildUpi, setSelectedChildUpi] = useState<string>(session?.activeChildUpi || '');
  const [childProgress, setChildProgress] = useState<LearnerProgressInsight | null>(null);

  // Learner Quiz state
  const [quizGrade, setQuizGrade] = useState('Grade 4');
  const [quizSubject, setQuizSubject] = useState('Mathematics Activities');
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Voice speech synthesis
  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`•]/g, ' ').replace(/\s+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Setup tabs and welcome message on open
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    setActiveTab(initialTab);

    // Initial audit load if admin
    if (role === 'admin') {
      const results = schoolAIService.auditAllSchoolResources();
      setAuditedResources(results);
    }

    // Initial child progress load if parent
    if (role === 'parent') {
      const allPupils = dataLayer.getPupils();
      const currentParent = dataLayer.getParents().find((p) => p.id === session?.id || p.phone === session?.identifier);
      const childUpis = currentParent?.linkedChildrenUpi || currentParent?.pupilUpiList || currentParent?.childrenUpi || (session?.activeChildUpi ? [session.activeChildUpi] : []);
      const upi = selectedChildUpi || childUpis[0] || (allPupils[0]?.upi ?? '');
      setSelectedChildUpi(upi);
      const pupil = allPupils.find((p) => p.upi === upi);
      if (pupil) {
        setChildProgress(schoolAIService.analyzePupilProgress(pupil));
      }
    }

    if (messages.length === 0) {
      let welcome = '';
      if (role === 'admin') {
        welcome = `Welcome to Little Roses School AI (Admin Oversight). I can audit school resources, detect curriculum classification mismatches, and assist with institutional operations under our motto "Much from Little".`;
      } else if (role === 'teacher') {
        welcome = `Hello Mwalimu! I am your CBC Teaching & Assessment Assistant. I can help generate official 9-step CBC lesson plans, 40% assignments and 60% CATs, evaluate student performance across strands, or analyze your teaching schemes.`;
      } else if (role === 'parent') {
        welcome = `Jambo! Welcome to your Parent AI Guide. I can explain your child's assessment marks, summarize teachers' feedback, and suggest helpful revision exercises tailored to their progress.`;
      } else if (role === 'learner') {
        welcome = `Jambo learner! Welcome to your Little Roses Learning Buddy! Ask me any question about your lessons, words, numbers, or storybooks. Let's learn together! 🌟`;
      } else {
        welcome = `Welcome to Little Roses Academy Central School AI. Please log in to access personalized curriculum guidance.`;
      }

      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: welcome,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'local_rag',
          sourceDocs: ['Little Roses Academy Central System'],
        },
      ]);
    }
  }, [isOpen, session, initialTab, role]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isQuerying]);

  if (!isOpen) return null;

  // Role-specific suggested prompts
  const getSuggestedPrompts = () => {
    switch (role) {
      case 'admin':
        return [
          'Show summary of school resources and teachers',
          'Audit document classification mismatches',
          'Check active academic year and terms',
        ];
      case 'teacher':
        return [
          'Help me plan a Grade 3 Math lesson on Fractions',
          'Explain the 40% assignment and 60% CAT weighting',
          'What are my assigned classes and subjects?',
        ];
      case 'parent':
        return [
          "Explain my child's latest assessment marks",
          "What are my child's strongest subjects this term?",
          "How can I help my child improve in Mathematics at home?",
        ];
      case 'learner':
        return [
          'How do I add fractions with the same denominator?',
          'What does the word "Courage" mean in English?',
          'Tell me an inspiring short CBC story with a lesson',
        ];
      default:
        return ['Tell me about Little Roses Academy'];
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isQuerying) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsQuerying(true);

    try {
      const response = await schoolAIService.askSchoolAI(q, session);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        sourceDocs: response.sourceDocs,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving that record. Please try again or verify your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  // Document File Upload & Mismatch Analysis
  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFile(file);
    setIsAnalyzingDoc(true);
    setMismatchReport(null);
    setResolutionNotice(null);

    try {
      const extracted = await extractTextFromFile(file);
      setExtractedDocText(extracted.text);

      const report = await schoolAIService.analyzeDocumentMismatch(
        file.name,
        declaredGrade,
        declaredSubject,
        declaredCategory,
        extracted.text
      );

      setMismatchReport(report);
    } catch (err: any) {
      setResolutionNotice(`Document extraction failed: ${err.message || 'Unsupported format'}`);
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const handleApplyResolution = (adoptDetected: boolean) => {
    if (!mismatchReport) return;

    if (adoptDetected && mismatchReport.detected.grade) {
      setDeclaredGrade(mismatchReport.detected.grade);
      if (mismatchReport.detected.subject) setDeclaredSubject(mismatchReport.detected.subject);
      if (mismatchReport.detected.category) setDeclaredCategory(mismatchReport.detected.category);
      setResolutionNotice(`Approved! Document classification updated to ${mismatchReport.detected.grade} · ${mismatchReport.detected.subject}.`);
    } else {
      setResolutionNotice(`Confirmed. Original declared classification retained.`);
    }

    setMismatchReport(null);
  };

  // Assessment Generation Handler
  const handleGenerateAssessment = async () => {
    setIsGeneratingAssessment(true);
    setGeneratedPackage(null);

    try {
      const pkg = await schoolAIService.generateCBCAssessment({
        type: genType,
        grade: genGrade,
        subject: genSubject,
        strand: genStrand,
        substrand: genSubstrand,
        questionCount: genCount,
        sourceMaterial: extractedDocText.slice(0, 2000),
      });
      setGeneratedPackage(pkg);
    } catch (err: any) {
      alert(`Assessment generation failed: ${err.message}`);
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  // Lesson Plan Generation Handler
  const handleGenerateLessonPlan = async () => {
    setIsGeneratingLessonPlan(true);
    setGeneratedLessonPlan(null);

    try {
      const lp = await schoolAIService.generateCBCLessonPlan({
        grade: lpGrade,
        subject: lpSubject,
        strand: lpStrand,
        substrand: lpSubstrand,
        durationMinutes: lpDuration,
        learningResources: lpResources,
      });
      setGeneratedLessonPlan(lp);
    } catch (err: any) {
      alert(`Lesson plan generation failed: ${err.message}`);
    } finally {
      setIsGeneratingLessonPlan(false);
    }
  };

  // Copy Lesson Plan
  const handleCopyLessonPlan = () => {
    if (!generatedLessonPlan) return;
    const text = `${generatedLessonPlan.title}
Grade: ${generatedLessonPlan.grade} | Subject: ${generatedLessonPlan.subject}
Strand: ${generatedLessonPlan.strand} | Substrand: ${generatedLessonPlan.substrand}
Duration: ${generatedLessonPlan.durationMinutes} Minutes

SPECIFIC LEARNING OUTCOMES:
${generatedLessonPlan.specificOutcomes.join('\n')}

KEY INQUIRY QUESTION (KIQ):
${generatedLessonPlan.keyInquiryQuestion}

CORE COMPETENCIES:
${generatedLessonPlan.coreCompetencies.join(' • ')}

VALUES:
${generatedLessonPlan.values.join(' • ')}

LEARNING RESOURCES:
${generatedLessonPlan.learningResources.join('\n')}

ORGANIZATION OF LEARNING:
${generatedLessonPlan.steps
  .map(
    (s) =>
      `[${s.phase} - ${s.minutes} mins]\nTeacher: ${s.teacherActivity}\nLearner: ${s.learnerActivity}`
  )
  .join('\n\n')}

${generatedLessonPlan.assessmentRubric}

${generatedLessonPlan.extendedActivity}`;

    navigator.clipboard.writeText(text);
    setCopiedLp(true);
    setTimeout(() => setCopiedLp(false), 2500);
  };

  // Reclassify audited item
  const handleReclassifyAuditItem = (item: AuditedResourceItem) => {
    const pkg = dataLayer.getResourcePackages().find((p) => p.id === item.packageId);
    if (!pkg) return;

    dataLayer.updateResourcePackage(item.packageId, {
      grade: item.detectedGrade,
      subject: item.detectedSubject,
      category: item.detectedCategory,
    });

    setAuditedResources(schoolAIService.auditAllSchoolResources());
    setAuditNotice(`Resource "${item.title}" successfully reclassified to ${item.detectedGrade} • ${item.detectedSubject}.`);
    setTimeout(() => setAuditNotice(null), 4000);
  };

  // Sample Interactive Learner Quiz Questions
  const sampleQuizQuestions = [
    {
      q: 'Which of the following is a prime number?',
      options: ['4', '7', '9', '12'],
      correct: 1,
      hint: 'A prime number can only be divided by 1 and itself without remainder.',
    },
    {
      q: 'What is the place value of digit 5 in 3,524?',
      options: ['Thousands', 'Hundreds', 'Tens', 'Ones'],
      correct: 1,
      hint: 'Count from the right: Ones (4), Tens (2), Hundreds (5)...',
    },
    {
      q: 'Complete: 3/8 + 2/8 = ?',
      options: ['5/16', '5/8', '6/8', '1/8'],
      correct: 1,
      hint: 'When denominators are the same, just add the numerators: 3 + 2 = 5.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[94vh] flex flex-col bg-[#0B152E] border border-blue-900/60 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-blue-900/40 bg-[#070D1E]/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 to-blue-500/25 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">
                  Little Roses School AI
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {role} Portal
                </span>
                <span className="text-[10px] text-amber-400/80 font-serif italic hidden md:inline">
                  &quot;Much from Little&quot;
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Central Kenyan CBC Primary Education Engine • Nakuru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#081026] border-b border-blue-900/30 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'chat'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>School AI Chat</span>
          </button>

          {(role === 'teacher' || role === 'admin') && (
            <button
              onClick={() => setActiveTab('lesson_planner')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                activeTab === 'lesson_planner'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>CBC Lesson Plan Studio</span>
            </button>
          )}

          {(role === 'teacher' || role === 'admin') && (
            <button
              onClick={() => setActiveTab('assessment_generator')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                activeTab === 'assessment_generator'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Assessment & CATs (40/60)</span>
            </button>
          )}

          {(role === 'teacher' || role === 'admin') && (
            <button
              onClick={() => setActiveTab('document_intelligence')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                activeTab === 'document_intelligence'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Mismatch & OCR</span>
            </button>
          )}

          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('document_audit')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                activeTab === 'document_audit'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Resource Audit & Mismatches</span>
            </button>
          )}

          {role === 'parent' && (
            <button
              onClick={() => setActiveTab('parent_guide')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                activeTab === 'parent_guide'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Child CBC Progress & Home Guide</span>
            </button>
          )}

          {role === 'learner' && (
            <button
              onClick={() => setActiveTab('practice_quiz')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                activeTab === 'practice_quiz'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quick Practice Quiz (Stars)</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* ================================================================= */}
          {/* TAB 1: CHAT */}
          {/* ================================================================= */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                          : msg.isError
                          ? 'bg-rose-950/80 border border-rose-800 text-rose-200 rounded-bl-none'
                          : 'bg-[#070D1E] border border-blue-900/50 text-slate-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <div className="flex items-center justify-between gap-3 pt-2 mt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-2">
                          {msg.sender === 'ai' && (
                            <>
                              <span className="flex items-center gap-1 text-emerald-400">
                                <ShieldCheck className="w-3 h-3" />
                                <span>{msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Verified School Records (Local RAG)'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSpeak(msg.text, msg.id)}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white transition cursor-pointer"
                                title="Listen to AI answer (Audio Read Aloud)"
                              >
                                {isSpeaking === msg.id ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-rose-400" />
                                    <span>Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3" />
                                    <span>Read Aloud</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                        <span>{msg.timestamp}</span>
                      </div>

                      {msg.sourceDocs && msg.sourceDocs.length > 0 && (
                        <div className="mt-1 pt-1 text-[9px] text-slate-500 font-mono">
                          Evidence Source: {msg.sourceDocs.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isQuerying && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-mono p-3 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-xs animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>School AI consulting verified records...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Questions */}
              <div className="px-4 py-2 border-t border-blue-900/30 bg-[#070D1E]/60 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-500 font-bold shrink-0">Ask:</span>
                {getSuggestedPrompts().map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-4 border-t border-blue-900/40 bg-[#070D1E]/90">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={
                      role === 'parent'
                        ? "Ask about your child's CBC marks, strengths, or home homework..."
                        : role === 'teacher'
                        ? 'Ask about assigned schemes, student performance, or CBC rubrics...'
                        : role === 'learner'
                        ? 'Ask a question about your lessons, numbers, or words...'
                        : 'Ask about school records, teachers, pupils, or resources...'
                    }
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/90 border border-blue-900/60 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isQuerying}
                    className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 transition cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: CBC LESSON PLAN STUDIO (Teachers & Admin) */}
          {/* ================================================================= */}
          {activeTab === 'lesson_planner' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3 text-xs text-purple-200">
                <BookOpen className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white">Kenyan CBC Lesson Plan Generator: </span>
                  Generates standardized, KICD-compliant primary school lesson plans complete with 5-phase learning progression, key inquiry questions, core competencies, and 4-level assessment rubrics.
                </div>
              </div>

              {/* Lesson Plan Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Grade Level</label>
                  <select
                    value={lpGrade}
                    onChange={(e) => setLpGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    {CANONICAL_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Learning Area / Subject</label>
                  <select
                    value={lpSubject}
                    onChange={(e) => setLpSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    {CANONICAL_CBC_SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Duration (Minutes)</label>
                  <select
                    value={lpDuration}
                    onChange={(e) => setLpDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value={35}>35 Minutes (Single Period)</option>
                    <option value={40}>40 Minutes (Standard CBC)</option>
                    <option value={70}>70 Minutes (Double Period)</option>
                    <option value={80}>80 Minutes (Practical Block)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Curriculum Strand</label>
                  <input
                    type="text"
                    value={lpStrand}
                    onChange={(e) => setLpStrand(e.target.value)}
                    placeholder="e.g. Numbers"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Sub-strand / Specific Concept</label>
                  <input
                    type="text"
                    value={lpSubstrand}
                    onChange={(e) => setLpSubstrand(e.target.value)}
                    placeholder="e.g. Addition of 2-digit numbers with regrouping"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Available Learning Resources / Realia</label>
                  <input
                    type="text"
                    value={lpResources}
                    onChange={(e) => setLpResources(e.target.value)}
                    placeholder="e.g. Counters, bottle tops, charts, abacus, flashcards"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateLessonPlan}
                disabled={isGeneratingLessonPlan}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer"
              >
                {isGeneratingLessonPlan ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing CBC Lesson Plan...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Generate Official CBC Lesson Plan</span>
                  </>
                )}
              </button>

              {/* Generated Lesson Plan View */}
              {generatedLessonPlan && (
                <div className="p-5 rounded-2xl bg-[#070D1E] border border-purple-500/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white">{generatedLessonPlan.title}</h4>
                      <p className="text-xs text-purple-300 font-semibold mt-0.5">
                        {generatedLessonPlan.grade} • {generatedLessonPlan.subject} • {generatedLessonPlan.durationMinutes} Mins
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyLessonPlan}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition cursor-pointer"
                    >
                      {copiedLp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLp ? 'Copied Lesson Plan' : 'Copy Full Plan'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-amber-400 text-[11px] uppercase block">Specific Learning Outcomes</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        {generatedLessonPlan.specificOutcomes.map((out, idx) => (
                          <li key={idx}>{out}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-blue-400 text-[11px] uppercase block">Key Inquiry Question & Competencies</span>
                      <p className="text-white font-medium text-[11px] italic">
                        &quot;{generatedLessonPlan.keyInquiryQuestion}&quot;
                      </p>
                      <div className="pt-1 flex flex-wrap gap-1">
                        {generatedLessonPlan.coreCompetencies.map((comp, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] border border-blue-500/30">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Lesson Development */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Organization of Learning (Step-by-Step Flow)
                    </span>
                    <div className="space-y-2">
                      {generatedLessonPlan.steps.map((st, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-purple-300 text-[11px]">
                            <span>{st.phase}</span>
                            <span className="text-slate-400 font-mono">{st.minutes} mins</span>
                          </div>
                          <p className="text-slate-300 text-[11px]"><strong className="text-white">Teacher: </strong>{st.teacherActivity}</p>
                          <p className="text-slate-400 text-[11px]"><strong className="text-white">Learner: </strong>{st.learnerActivity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rubric */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-emerald-400 block uppercase text-[10px]">Assessment Rubric</span>
                    <pre className="text-slate-300 text-[11px] whitespace-pre-wrap font-sans">
                      {generatedLessonPlan.assessmentRubric}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: CBC ASSESSMENT GENERATOR (40% Assignment / 60% CAT) */}
          {/* ================================================================= */}
          {activeTab === 'assessment_generator' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs text-emerald-200">
                <GraduationCap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white">Kenyan CBC Assessment Alignment: </span>
                  Generates classroom formative assessments and Continuous Assessment Tests strictly adhering to the 40% Assignments / 60% CATs formula, with teacher marking schemes and rubrics.
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Assessment Type</label>
                  <select
                    value={genType}
                    onChange={(e: any) => setGenType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value="assignment">Formative Assignment (40% Weight)</option>
                    <option value="cat">Continuous Assessment Test - CAT (60% Weight)</option>
                    <option value="revision">Termly Revision Practice</option>
                    <option value="remedial">Targeted Remedial Exercise</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Grade Level</label>
                  <select
                    value={genGrade}
                    onChange={(e) => setGenGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    {CANONICAL_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Subject / Learning Area</label>
                  <select
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    {CANONICAL_CBC_SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Questions Count</label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value={3}>3 Questions (Quick Drill)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={8}>8 Questions (Full Assessment)</option>
                    <option value={10}>10 Questions (Termly CAT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Curriculum Strand</label>
                  <input
                    type="text"
                    value={genStrand}
                    onChange={(e) => setGenStrand(e.target.value)}
                    placeholder="e.g. Numbers & Operations"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Curriculum Sub-Strand</label>
                  <input
                    type="text"
                    value={genSubstrand}
                    onChange={(e) => setGenSubstrand(e.target.value)}
                    placeholder="e.g. Whole Numbers Addition with Trading"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAssessment}
                disabled={isGeneratingAssessment}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {isGeneratingAssessment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing CBC Assessment & Rubrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Grounded CBC {genType.toUpperCase()}</span>
                  </>
                )}
              </button>

              {/* Generated Assessment Package View */}
              {generatedPackage && (
                <div className="p-5 rounded-2xl bg-[#070D1E] border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white">{generatedPackage.title}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        {generatedPackage.weightingNotice} • Total Marks: {generatedPackage.totalMarks}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const text = `${generatedPackage.title}\n${generatedPackage.weightingNotice}\n\nQUESTIONS:\n${generatedPackage.questions
                          .map((q) => `Question ${q.questionNumber} (${q.marks} marks):\n${q.questionText}\n[Marking Guide: ${q.markingGuide}]`)
                          .join('\n\n')}\n\n${generatedPackage.teacherMarkingGuide}`;
                        navigator.clipboard.writeText(text);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2500);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Copied to Clipboard' : 'Copy Assessment'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {generatedPackage.questions.map((q) => (
                      <div key={q.questionNumber} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Question {q.questionNumber}</span>
                          <span className="font-mono text-amber-400">{q.marks} Marks</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 font-medium">{q.questionText}</p>
                        <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
                          <span className="text-emerald-400 font-bold">Marking Scheme: </span>
                          {q.markingGuide}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-white block">Official Assessment Rubric</span>
                    <pre className="text-slate-300 text-[11px] whitespace-pre-wrap font-sans">
                      {generatedPackage.teacherMarkingGuide}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: DOCUMENT INTELLIGENCE & OCR */}
          {/* ================================================================= */}
          {activeTab === 'document_intelligence' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white">Smart Document Classification: </span>
                  Upload any PDF, DOCX, TXT, or scan. The AI reads actual internal contents and compares it with your declared category to detect mismatches (e.g., Grade 2 title containing Grade 4 fractions).
                </div>
              </div>

              {/* Upload & Declaration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Declared Grade</label>
                  <select
                    value={declaredGrade}
                    onChange={(e) => setDeclaredGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    {CANONICAL_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Declared Subject</label>
                  <select
                    value={declaredSubject}
                    onChange={(e) => setDeclaredSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    {CANONICAL_CBC_SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Category</label>
                  <select
                    value={declaredCategory}
                    onChange={(e) => setDeclaredCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="schemes">Schemes of Work</option>
                    <option value="lesson_plans">Lesson Plans</option>
                    <option value="lesson_notes">Lesson Notes</option>
                    <option value="assignments">Assignments (40%)</option>
                    <option value="cats_assessments">CATs / Assessments (60%)</option>
                    <option value="reading_materials">Reading Materials</option>
                  </select>
                </div>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-3xl p-6 text-center space-y-3 bg-slate-950/40 transition">
                <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Choose a school document to inspect</h4>
                  <p className="text-xs text-slate-400">Supports PDF, DOCX, TXT, and scanned document images</p>
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition shadow-md">
                  <span>Browse Document...</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.csv,.png,.jpg,.jpeg"
                    onChange={handleDocFileUpload}
                    className="hidden"
                  />
                </label>
                {docFile && (
                  <p className="text-xs text-emerald-400 font-mono">
                    Loaded: {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {isAnalyzingDoc && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting text and running CBC mismatch detection...</span>
                </div>
              )}

              {resolutionNotice && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resolutionNotice}</span>
                </div>
              )}

              {/* Mismatch Alert Card */}
              {mismatchReport && (
                <div
                  className={`p-5 rounded-2xl border transition ${
                    mismatchReport.hasMismatch
                      ? 'bg-amber-950/40 border-amber-600/60 text-amber-100'
                      : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {mismatchReport.hasMismatch ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {mismatchReport.hasMismatch
                            ? 'Classification Mismatch Detected'
                            : 'Document Verified — Ready for Allocation'}
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {mismatchReport.explanation}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 border border-slate-700">
                      Confidence: {mismatchReport.confidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Declared by User</span>
                      <p className="text-white font-semibold">Grade: {mismatchReport.declared.grade}</p>
                      <p className="text-slate-300">Subject: {mismatchReport.declared.subject}</p>
                      <p className="text-slate-400 text-[11px]">Category: {mismatchReport.declared.category}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Detected from Content</span>
                      <p className="text-white font-semibold">Grade: {mismatchReport.detected.grade}</p>
                      <p className="text-slate-300">Subject: {mismatchReport.detected.subject}</p>
                      <p className="text-amber-300 text-[11px]">Recommended: {mismatchReport.recommendedAction}</p>
                    </div>
                  </div>

                  {mismatchReport.hasMismatch && (
                    <div className="flex flex-wrap items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => handleApplyResolution(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Keep Declared Classification
                      </button>
                      <button
                        onClick={() => handleApplyResolution(true)}
                        className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Reclassify to {mismatchReport.detected.grade}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Text Preview */}
              {extractedDocText && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-white">Extracted Document Text Preview</span>
                    <span className="font-mono">{extractedDocText.length} characters</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                    {extractedDocText.slice(0, 1500)}
                    {extractedDocText.length > 1500 ? '...\n[Truncated for preview]' : ''}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: ADMIN RESOURCE AUDIT & MISMATCHES (Admin Only) */}
          {/* ================================================================= */}
          {activeTab === 'document_audit' && role === 'admin' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm">Document Classification Audit</h4>
                  <p className="text-slate-300 mt-0.5">
                    Scans uploaded schemes, notes, and assessments across the school repository to verify grade and subject consistency.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAuditFilter(auditFilter === 'mismatch_only' ? 'all' : 'mismatch_only')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
                  >
                    {auditFilter === 'mismatch_only' ? 'Show All Packages' : 'Show Mismatches Only'}
                  </button>
                  <button
                    onClick={() => setAuditedResources(schoolAIService.auditAllSchoolResources())}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-scan Repository</span>
                  </button>
                </div>
              </div>

              {auditNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{auditNotice}</span>
                </div>
              )}

              {/* Audited List */}
              <div className="space-y-3">
                {auditedResources
                  .filter((item) => (auditFilter === 'mismatch_only' ? item.hasMismatch : true))
                  .map((item) => (
                    <div
                      key={item.packageId}
                      className={`p-4 rounded-2xl border transition ${
                        item.hasMismatch
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-slate-950/60 border-slate-800/80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {item.hasMismatch ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Declared: {item.declaredGrade} • {item.declaredSubject}
                        </span>
                      </div>

                      {item.hasMismatch ? (
                        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="text-amber-200 text-xs">{item.explanation}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              Recommended: <strong className="text-white">{item.detectedGrade}</strong> • <strong className="text-white">{item.detectedSubject}</strong> ({item.detectedCategory})
                            </p>
                          </div>
                          <button
                            onClick={() => handleReclassifyAuditItem(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 shadow-md flex items-center gap-1.5 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Reclassify to {item.detectedGrade}</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-2">
                          Matches declared curriculum classification perfectly. Ready for learner and teacher access.
                        </p>
                      )}
                    </div>
                  ))}

                {auditedResources.filter((item) => (auditFilter === 'mismatch_only' ? item.hasMismatch : true)).length === 0 && (
                  <div className="p-8 text-center bg-slate-950/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="font-bold text-white text-sm">All Resources Aligned!</p>
                    <p className="text-slate-400 mt-1">Zero curriculum mismatches detected across school records.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: PARENT CBC PROGRESS & HOME GUIDE (Parents Only) */}
          {/* ================================================================= */}
          {activeTab === 'parent_guide' && role === 'parent' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Linked Child Selector */}
              {(() => {
                const allPupils = dataLayer.getPupils();
                const currentParent = dataLayer.getParents().find((p) => p.id === session?.id || p.phone === session?.identifier);
                const childUpis = currentParent?.linkedChildrenUpi || currentParent?.pupilUpiList || currentParent?.childrenUpi || (session?.activeChildUpi ? [session.activeChildUpi] : []);
                const myChildren = allPupils.filter((p) => childUpis.includes(p.upi));

                return (
                  <div className="p-4 rounded-2xl bg-[#070D1E] border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                        Active Child Record
                      </span>
                      <h4 className="text-base font-extrabold text-white">
                        {childProgress?.pupilName || 'Child Progress Overview'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {childProgress?.grade || 'Grade 4'} • UPI: {childProgress?.upi || selectedChildUpi}
                      </p>
                    </div>

                    {myChildren.length > 1 && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Switch Child:</label>
                        <select
                          value={selectedChildUpi}
                          onChange={(e) => {
                            const newUpi = e.target.value;
                            setSelectedChildUpi(newUpi);
                            const p = allPupils.find((x) => x.upi === newUpi);
                            if (p) setChildProgress(schoolAIService.analyzePupilProgress(p));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                        >
                          {myChildren.map((c) => (
                            <option key={c.upi} value={c.upi}>
                              {c.name} ({c.grade})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* CBC Weighting & Performance Summary Cards */}
              {childProgress && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Formative Assignments (40%)</span>
                      <p className="text-2xl font-black text-amber-400">{childProgress.formativeScore40} / 40</p>
                      <p className="text-[10px] text-slate-400">Continuous homework & tasks</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Continuous Tests - CATs (60%)</span>
                      <p className="text-2xl font-black text-blue-400">{childProgress.summativeScore60} / 60</p>
                      <p className="text-[10px] text-slate-400">Termly assessment papers</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall CBC Level</span>
                      <p className="text-base font-black text-emerald-400 mt-1">{childProgress.overallCBCBand}</p>
                      <p className="text-[10px] text-slate-400">Total: {childProgress.averageScore}%</p>
                    </div>
                  </div>

                  {/* Rubric Plain-English Explanation */}
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-teal-300">
                      <Info className="w-4 h-4" />
                      <span>Understanding Your Child&apos;s CBC Rubric:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      Under Kenya&apos;s Competency-Based Curriculum, learners are evaluated on skills and understanding rather than just exam positions.
                      <strong className="text-white"> {childProgress.overallCBCBand}</strong> means your child meets core learning outcomes and is demonstrating steady intellectual growth under our school motto &quot;Much from Little&quot;.
                    </p>
                  </div>

                  {/* Strengths and Remedial Recommendations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-400">
                        <Award className="w-4 h-4" />
                        <span>Key Strengths & Mastery Areas:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {childProgress.strongStrands.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Recommended Home Practice Activities:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {childProgress.recommendedRemedialTopics.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Direct Inquiry Prompt */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-blue-900/40 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-bold text-white">Have a specific question about your child?</p>
                      <p className="text-slate-400">Ask Little Roses School AI to explain specific concepts or suggest weekend drills.</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage(`Explain ${childProgress.pupilName}'s marks in detail and how we can support them at home.`);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 shadow-md transition"
                    >
                      Ask AI in Chat
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: LEARNER PRACTICE QUIZ & STARS (Learners Only) */}
          {/* ================================================================= */}
          {activeTab === 'practice_quiz' && role === 'learner' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                    Daily CBC Challenge
                  </span>
                  <h4 className="text-base font-extrabold text-white">
                    Fun Practice Quiz • Earn Stars! ⭐
                  </h4>
                  <p className="text-xs text-slate-300">
                    Solve questions step-by-step. Get stars added to your learner profile!
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{quizScore} Stars Earned</span>
                </div>
              </div>

              {!quizCompleted ? (
                <div className="p-5 rounded-2xl bg-[#070D1E] border border-blue-900/60 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-bold text-white">Question {quizStep + 1} of {sampleQuizQuestions.length}</span>
                    <span className="font-mono text-amber-400">+1 Star on correct answer</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {sampleQuizQuestions[quizStep].q}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {sampleQuizQuestions[quizStep].options.map((opt, optIdx) => {
                      const isSelected = quizAnswerSelected === optIdx;
                      const isCorrect = sampleQuizQuestions[quizStep].correct === optIdx;
                      const showFeedback = quizAnswerSelected !== null;

                      let btnStyle = 'bg-slate-900/90 border-slate-800 hover:border-amber-400/60 text-slate-200';
                      if (showFeedback) {
                        if (isCorrect) btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                        else if (isSelected) btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={showFeedback}
                          onClick={() => {
                            setQuizAnswerSelected(optIdx);
                            if (optIdx === sampleQuizQuestions[quizStep].correct) {
                              setQuizScore((prev) => prev + 1);
                              dataLayer.addStarReward(session?.identifier || '', 1);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showFeedback && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswerSelected !== null && (
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <p className="text-xs text-slate-300">
                        <strong className="text-amber-400">Hint: </strong>
                        {sampleQuizQuestions[quizStep].hint}
                      </p>

                      <button
                        onClick={() => {
                          if (quizStep + 1 < sampleQuizQuestions.length) {
                            setQuizStep((prev) => prev + 1);
                            setQuizAnswerSelected(null);
                          } else {
                            setQuizCompleted(true);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 transition"
                      >
                        {quizStep + 1 < sampleQuizQuestions.length ? 'Next Question →' : 'Finish Quiz 🌟'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#070D1E] rounded-3xl border border-blue-900/60 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-400/20">
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Hongera! Quiz Completed!</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      You scored {quizScore} out of {sampleQuizQuestions.length}! Stars have been saved to your learner profile!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQuizStep(0);
                      setQuizScore(0);
                      setQuizAnswerSelected(null);
                      setQuizCompleted(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
