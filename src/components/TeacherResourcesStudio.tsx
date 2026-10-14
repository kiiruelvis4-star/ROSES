import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TeacherRecord } from '../services/schoolDataService.ts';
import {
  FolderOpen,
  FileText,
  ChevronRight,
  Upload,
  Download,
  Eye,
  Trash2,
  X,
  Plus,
  AlertCircle,
  FileUp,
  Printer,
  FileCheck,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import {
  dataLayer,
  getTeacherGradeAssignments,
  getLraSubjectsForGrade,
  ResourcePackageRecord,
  loadResourceFile,
} from '../services/dataLayer.ts';
import { extractTextFromFile, extractTextFromDataUrl } from '../services/aiDocumentAssistant.ts';
import { OfflineAIDocumentAssistantModal } from './OfflineAIDocumentAssistantModal.tsx';
import { formatBytes } from './AdminResourceWorkspace.tsx';

export interface TeacherResourcesStudioProps {
  currentTeacher: TeacherRecord;
  onPushAssignment?: (assignmentData: any) => void;
  showToast: (msg: string) => void;
}

export interface TeacherCategoryInfo {
  id: string;
  title: string;
  icon: string;
  desc: string;
  repoCategory: string;
}

export const TEACHER_CATEGORIES: TeacherCategoryInfo[] = [
  { id: 'knec_cbe', title: '1. KNEC / CBE Curriculum', icon: '🇰🇪', desc: 'Official syllabus guidelines', repoCategory: 'CBC Curriculum' },
  { id: 'schemes', title: '2. Schemes of Work (2 Terms)', icon: '📋', desc: 'Termly CBC schemes', repoCategory: 'Schemes of Work' },
  { id: 'lesson_plans', title: '3. Lesson Plans', icon: '📝', desc: 'Standard CBC lesson format', repoCategory: 'Lesson Plans' },
  { id: 'lesson_notes', title: '4. Lesson Notes (Full Book)', icon: '📓', desc: 'Comprehensive curriculum notes', repoCategory: 'Lesson Notes' },
  { id: 'records_of_work', title: '5. Record of Work Covered', icon: '📈', desc: 'Living weekly record', repoCategory: 'Record of Work' },
  { id: 'cats_assessments', title: '6. CATs & Assessment Records', icon: '📊', desc: 'Continuous assessment tests', repoCategory: 'CATs / Assessments' },
  { id: 'rubrics', title: '7. Rubrics & Assessment Books', icon: '📑', desc: 'CBC criterion scoring rubrics', repoCategory: 'Reference Materials' },
  { id: 'media_resources', title: '8. Storybooks & Flashcards', icon: '📚', desc: 'Reading materials for learners', repoCategory: 'Reading Materials' },
  { id: 'assignments', title: '9. Daily Assignments', icon: '✍️', desc: 'Homework and tasks', repoCategory: 'Assignments' },
  { id: 'revision_exams', title: '10. Revision Exams & Past Papers', icon: '📄', desc: 'Termly revision tests', repoCategory: 'Revision Materials' },
  { id: 'class_notes', title: '11. Class Notes (Per Lesson)', icon: '📖', desc: 'Short lesson-specific notes', repoCategory: 'Class Notes' },
  { id: 'teacher_created', title: '12. Teacher-Created Documents', icon: '📁', desc: 'Custom worksheets & handouts', repoCategory: 'Other School Documents' },
  { id: 'timetables', title: '13. Class Timetables', icon: '📅', desc: 'Master weekly schedules', repoCategory: 'Other School Documents' },
  { id: 'class_lists', title: '14. Class Lists & Roll Calls', icon: '👥', desc: 'Official pupil rosters', repoCategory: 'Other School Documents' },
  { id: 'teacher_reports', title: '15. Termly Teacher Reports', icon: '🏷️', desc: 'Official learner evaluations', repoCategory: 'Other School Documents' },
];

export function TeacherResourcesStudio({
  currentTeacher,
  showToast,
}: TeacherResourcesStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('schemes');
  const [revision, setRevision] = useState(0);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Note creation modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteStrand, setNoteStrand] = useState('');

  // Delete document confirmation modal
  const [deleteDocTarget, setDeleteDocTarget] = useState<{ pkgId: string; title: string } | null>(null);

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    title: string;
    name: string;
    fileData?: string;
    content?: string;
    fileType?: string;
  } | null>(null);

  // Offline AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [previewViewTab, setPreviewViewTab] = useState<'content' | 'file'>('content');
  const [isExtractingPreview, setIsExtractingPreview] = useState(false);
  const [copiedPreviewText, setCopiedPreviewText] = useState(false);
  const [previewSearchTerm, setPreviewSearchTerm] = useState('');
  const [studioTab, setStudioTab] = useState<'category' | 'dispatched'>('category');
  const [dispatchedSearchQuery, setDispatchedSearchQuery] = useState('');

  const teacherAssignments = useMemo(() => {
    return getTeacherGradeAssignments(currentTeacher as any);
  }, [currentTeacher]);

  const assignedGrades = useMemo(() => {
    if (teacherAssignments.length > 0) {
      return teacherAssignments.map((a) => a.grade);
    }
    return currentTeacher.assignedGrades || ['Grade 4'];
  }, [teacherAssignments, currentTeacher]);

  const getSubjsForGrade = (grade: string): string[] => {
    const match = teacherAssignments.find((a) => a.grade === grade);
    if (match && match.subjects.length > 0) return match.subjects;
    if (currentTeacher.gradeAssignments?.[grade]) return currentTeacher.gradeAssignments[grade];
    const valid = getLraSubjectsForGrade(grade);
    const filtered = (currentTeacher.subjects || []).filter((s) => valid.includes(s));
    return filtered.length > 0 ? filtered : valid.slice(0, 1);
  };

  const [selectedGrade, setSelectedGrade] = useState<string>(
    assignedGrades[0] || 'Grade 4'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const initG = assignedGrades[0] || 'Grade 4';
    const subjs = getSubjsForGrade(initG);
    return subjs[0] || 'Mathematics Activities';
  });

  useEffect(() => {
    if (!assignedGrades.includes(selectedGrade)) {
      setSelectedGrade(assignedGrades[0] || 'Grade 4');
    }
  }, [assignedGrades]);

  useEffect(() => {
    const validSubjs = getSubjsForGrade(selectedGrade);
    if (!validSubjs.includes(selectedSubject)) {
      setSelectedSubject(validSubjs[0] || '');
    }
  }, [selectedGrade]);

  const activeCategoryObj = useMemo(() => {
    return TEACHER_CATEGORIES.find((c) => c.id === selectedCategory) || TEACHER_CATEGORIES[0];
  }, [selectedCategory]);

  // Compute resource counts per category for active teacher
  const categoryCounts = useMemo(() => {
    try {
      const pkgs = dataLayer.getResourcePackages(currentTeacher.id);
      const counts: Record<string, number> = {};
      TEACHER_CATEGORIES.forEach((c) => {
        counts[c.id] = 0;
      });
      pkgs.forEach((pkg) => {
        const pkgCat = pkg.category.toLowerCase().trim();
        TEACHER_CATEGORIES.forEach((c) => {
          const target = c.repoCategory.toLowerCase().trim();
          if (
            pkgCat === target ||
            pkgCat.includes(c.id) ||
            pkgCat.includes(c.title.toLowerCase()) ||
            target.includes(pkgCat) ||
            (c.id === 'schemes' && pkgCat.includes('scheme')) ||
            (c.id === 'lesson_plans' && pkgCat.includes('lesson plan')) ||
            (c.id === 'lesson_notes' && pkgCat.includes('lesson note')) ||
            (c.id === 'class_notes' && pkgCat.includes('class note')) ||
            (c.id === 'assignments' && pkgCat.includes('assignment')) ||
            (c.id === 'cats_assessments' && (pkgCat.includes('cat') || pkgCat.includes('assessment'))) ||
            (c.id === 'revision_exams' && (pkgCat.includes('revision') || pkgCat.includes('exam') || pkgCat.includes('paper'))) ||
            (c.id === 'media_resources' && (pkgCat.includes('reading') || pkgCat.includes('story') || pkgCat.includes('media'))) ||
            (c.id === 'knec_cbe' && (pkgCat.includes('curriculum') || pkgCat.includes('knec') || pkgCat.includes('cbe'))) ||
            (c.id === 'records_of_work' && pkgCat.includes('record')) ||
            (c.id === 'rubrics' && (pkgCat.includes('rubric') || pkgCat.includes('reference')))
          ) {
            counts[c.id] = (counts[c.id] || 0) + (pkg.documents?.length || 1);
          }
        });
      });
      return counts;
    } catch {
      return {};
    }
  }, [currentTeacher.id, revision]);

  // Total resources dispatched to this teacher across all folders
  const allDispatchedDocs = useMemo(() => {
    try {
      const pkgs = dataLayer.getResourcePackages(currentTeacher.id);
      const list: Array<{
        pkgId: string;
        docId: string;
        title: string;
        fileName: string;
        fileType: string;
        size: string;
        fileData?: string;
        content?: string;
        createdAt: string;
        grade: string;
        subject: string;
        category: string;
        strand?: string;
      }> = [];

      pkgs.forEach((pkg) => {
        pkg.documents?.forEach((doc) => {
          list.push({
            pkgId: pkg.id,
            docId: doc.id,
            title: pkg.packageName || doc.name,
            fileName: doc.name,
            fileType: doc.fileType || detectFileType(doc.name, doc.fileData),
            size: doc.size || (doc.sizeBytes ? formatBytes(doc.sizeBytes) : 'Document'),
            fileData: doc.fileData,
            content: doc.content,
            createdAt: pkg.createdAt,
            grade: pkg.grade,
            subject: pkg.subject,
            category: pkg.category,
            strand: pkg.strand,
          });
        });
      });
      return list;
    } catch {
      return [];
    }
  }, [currentTeacher.id, revision]);

  const findCategoryIdForPkg = (pkgCatRaw?: string): string => {
    if (!pkgCatRaw) return 'schemes';
    const clean = pkgCatRaw.toLowerCase().trim();
    const matched = TEACHER_CATEGORIES.find((c) => {
      const target = c.repoCategory.toLowerCase().trim();
      return (
        clean === target ||
        clean.includes(c.id) ||
        clean.includes(c.title.toLowerCase()) ||
        target.includes(clean) ||
        (c.id === 'schemes' && clean.includes('scheme')) ||
        (c.id === 'lesson_plans' && clean.includes('lesson plan')) ||
        (c.id === 'lesson_notes' && clean.includes('lesson note')) ||
        (c.id === 'class_notes' && clean.includes('class note')) ||
        (c.id === 'assignments' && clean.includes('assignment')) ||
        (c.id === 'cats_assessments' && (clean.includes('cat') || clean.includes('assessment'))) ||
        (c.id === 'revision_exams' && (clean.includes('revision') || clean.includes('exam') || clean.includes('paper'))) ||
        (c.id === 'media_resources' && (clean.includes('reading') || clean.includes('story') || clean.includes('media'))) ||
        (c.id === 'knec_cbe' && (clean.includes('curriculum') || clean.includes('knec') || clean.includes('cbe'))) ||
        (c.id === 'records_of_work' && clean.includes('record')) ||
        (c.id === 'rubrics' && (clean.includes('rubric') || clean.includes('reference')))
      );
    });
    return matched?.id || 'schemes';
  };

  const filteredDispatchedDocs = useMemo(() => {
    if (!dispatchedSearchQuery.trim()) return allDispatchedDocs;
    const q = dispatchedSearchQuery.toLowerCase().trim();
    return allDispatchedDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.grade.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.strand && d.strand.toLowerCase().includes(q))
    );
  }, [allDispatchedDocs, dispatchedSearchQuery]);

  const handleGoToDocFolder = (doc: (typeof allDispatchedDocs)[0]) => {
    if (doc.grade) {
      setSelectedGrade(doc.grade);
    }
    if (doc.subject) {
      setSelectedSubject(doc.subject);
    }
    const catId = findCategoryIdForPkg(doc.category);
    setSelectedCategory(catId);
    setStudioTab('category');
    showToast(`Switched to ${doc.category} for ${doc.grade} • ${doc.subject}`);
  };

  // Query documents matching active teacher, grade, subject, and category
  const activeDocuments = useMemo(() => {
    try {
      const packages = dataLayer.getResourcePackages(currentTeacher.id);
      const cleanGrade = selectedGrade.trim().toLowerCase();
      const cleanSubject = selectedSubject.trim().toLowerCase();
      const targetRepoCat = activeCategoryObj.repoCategory.toLowerCase().trim();

      const matched: Array<{
        pkgId: string;
        docId: string;
        title: string;
        fileName: string;
        fileType: string;
        size: string;
        fileData?: string;
        content?: string;
        createdAt: string;
        strand?: string;
      }> = [];

      packages.forEach((pkg) => {
        const pkgCat = pkg.category.toLowerCase().trim();
        const catMatch =
          pkgCat === targetRepoCat ||
          pkgCat.includes(activeCategoryObj.id) ||
          pkgCat.includes(activeCategoryObj.title.toLowerCase()) ||
          targetRepoCat.includes(pkgCat) ||
          (activeCategoryObj.id === 'schemes' && pkgCat.includes('scheme')) ||
          (activeCategoryObj.id === 'lesson_plans' && pkgCat.includes('lesson plan')) ||
          (activeCategoryObj.id === 'lesson_notes' && pkgCat.includes('lesson note')) ||
          (activeCategoryObj.id === 'class_notes' && pkgCat.includes('class note')) ||
          (activeCategoryObj.id === 'assignments' && pkgCat.includes('assignment')) ||
          (activeCategoryObj.id === 'cats_assessments' && (pkgCat.includes('cat') || pkgCat.includes('assessment'))) ||
          (activeCategoryObj.id === 'revision_exams' && (pkgCat.includes('revision') || pkgCat.includes('exam') || pkgCat.includes('paper'))) ||
          (activeCategoryObj.id === 'media_resources' && (pkgCat.includes('reading') || pkgCat.includes('story') || pkgCat.includes('media'))) ||
          (activeCategoryObj.id === 'knec_cbe' && (pkgCat.includes('curriculum') || pkgCat.includes('knec') || pkgCat.includes('cbe'))) ||
          (activeCategoryObj.id === 'records_of_work' && pkgCat.includes('record')) ||
          (activeCategoryObj.id === 'rubrics' && (pkgCat.includes('rubric') || pkgCat.includes('reference')));

        const gradeMatch = !pkg.grade || pkg.grade.trim().toLowerCase() === cleanGrade || pkg.grade.toLowerCase() === 'all';
        const subjMatch = !pkg.subject || pkg.subject.trim().toLowerCase() === cleanSubject || pkg.subject.toLowerCase() === 'all' || pkg.subject.toLowerCase() === 'general';

        if (catMatch && gradeMatch && subjMatch) {
          pkg.documents?.forEach((doc) => {
            matched.push({
              pkgId: pkg.id,
              docId: doc.id,
              title: pkg.packageName || doc.name,
              fileName: doc.name,
              fileType: doc.fileType || detectFileType(doc.name, doc.fileData),
              size: doc.size || (doc.sizeBytes ? formatBytes(doc.sizeBytes) : 'Document'),
              fileData: doc.fileData,
              content: doc.content,
              createdAt: pkg.createdAt,
              strand: pkg.strand,
            });
          });
        }
      });

      return matched;
    } catch {
      return [];
    }
  }, [currentTeacher.id, selectedGrade, selectedSubject, activeCategoryObj, revision]);

  function detectFileType(name?: string, data?: string): string {
    const ext = name?.split('.').pop()?.toLowerCase() || '';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'spreadsheet';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) return 'video';
    if (['txt', 'md', 'log'].includes(ext)) return 'text';
    if (data?.startsWith('data:image/')) return 'image';
    if (data?.startsWith('data:video/')) return 'video';
    if (data?.startsWith('data:application/pdf')) return 'pdf';
    return 'document';
  }

  // Handle uploading real file (PDF, Doc, Spreadsheet, Media) with offline text extraction
  const processUploadFile = async (file: File) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setUploadError(`File exceeds maximum size limit (50 MB). Your file is ${formatBytes(file.size)}.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    let detected = 'document';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['xlsx', 'xls', 'csv'].includes(ext)) detected = 'spreadsheet';
    else if (['pdf'].includes(ext)) detected = 'pdf';
    else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) detected = 'image';
    else if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) detected = 'video';
    else if (['txt', 'md', 'log'].includes(ext)) detected = 'text';

    try {
      // 1. Extract full readable text offline via AI assistant engine
      const { text } = await extractTextFromFile(file);

      // 2. Read base64 data for storage & preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        try {
          dataLayer.addResourcePackage({
            packageName: cleanTitle,
            category: activeCategoryObj.repoCategory,
            grade: selectedGrade,
            subject: selectedSubject,
            academicYear: '2026',
            term: 'Term 1',
            recipientTeacherIds: [currentTeacher.id],
            documents: [
              {
                id: `doc_${Date.now()}`,
                name: file.name,
                content: text || undefined,
                fileData: typeof result === 'string' ? result : undefined,
                fileType: detected,
                size: formatBytes(file.size),
                sizeBytes: file.size,
                versions: [],
              },
            ],
          });

          setIsUploading(false);
          setRevision((r) => r + 1);
          showToast(`✓ Uploaded "${file.name}" with offline readable content`);
        } catch (err: any) {
          setIsUploading(false);
          setUploadError(`Upload failed: ${err.message || 'Storage error'}`);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        setUploadError('Error reading file from disk.');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(`Extraction error: ${err.message || 'Could not parse document'}`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadFile(file);
    }
  };

  // Handle Note Creation
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    try {
      const cleanTitle = noteTitle.trim();
      const fileName = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.doc`;

      dataLayer.addResourcePackage({
        packageName: cleanTitle,
        category: activeCategoryObj.repoCategory,
        grade: selectedGrade,
        subject: selectedSubject,
        strand: noteStrand.trim() || undefined,
        academicYear: '2026',
        term: 'Term 1',
        recipientTeacherIds: [currentTeacher.id],
        documents: [
          {
            id: `doc_${Date.now()}`,
            name: fileName,
            content: noteContent.trim() || undefined,
            fileType: 'document',
            size: 'Curriculum Note',
            versions: [],
          },
        ],
      });

      setShowNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
      setNoteStrand('');
      setRevision((r) => r + 1);
      showToast(`✓ Created note: "${cleanTitle}"`);
    } catch (err: any) {
      alert(`Could not save note: ${err.message}`);
    }
  };

  // Handle Document Delete
  const handleDeleteDocument = (pkgId: string, title: string) => {
    setDeleteDocTarget({ pkgId, title });
  };

  // Open Preview Modal with on-demand IndexedDB hydration and text extraction
  const handleOpenPreview = async (doc: typeof activeDocuments[0]) => {
    let dataUrl = doc.fileData;
    if (!dataUrl) {
      dataUrl = (await loadResourceFile(doc.docId)) || undefined;
    }

    let textContent = doc.content;
    if (!textContent && dataUrl) {
      try {
        const res = await extractTextFromDataUrl(dataUrl, doc.fileName);
        if (res.text) textContent = res.text;
      } catch {}
    }

    setPreviewViewTab(textContent ? 'content' : 'file');
    setPreviewSearchTerm('');
    setPreviewDoc({
      id: doc.docId,
      title: doc.title,
      name: doc.fileName,
      fileData: dataUrl,
      content: textContent,
      fileType: doc.fileType,
    });
  };

  // Download document
  const handleDownloadFile = async (doc: typeof activeDocuments[0]) => {
    try {
      let dataUrl = doc.fileData;
      if (!dataUrl) {
        dataUrl = (await loadResourceFile(doc.docId)) || undefined;
      }

      const link = document.createElement('a');
      link.download = doc.fileName || `${doc.title}.doc`;

      if (dataUrl) {
        link.href = dataUrl;
      } else {
        const blob = new Blob([doc.content || ''], { type: 'text/plain;charset=utf-8;' });
        link.href = URL.createObjectURL(blob);
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloading ${doc.fileName}...`);
    } catch (err: any) {
      alert(`Could not download file: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Real Documents & PDFs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.mp4,.webm"
      />

      {/* Top View Selector: Curriculum Folders vs All Dispatched Resources */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#080E24] border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setStudioTab('category')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioTab === 'category'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Curriculum Categories</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioTab('dispatched')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioTab === 'dispatched'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-cyan-400" />
            <span>All Dispatched to Me</span>
            {allDispatchedDocs.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  studioTab === 'dispatched'
                    ? 'bg-slate-950 text-cyan-300'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {allDispatchedDocs.length}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAIAssistant(true)}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-500/20"
          title="Launch Offline AI Document Assistant to read content and route files"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offline AI Assistant</span>
        </button>
      </div>

      {studioTab === 'dispatched' ? (
        /* DISPATCHED CURRICULUM WORKBENCH */
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080E24] border border-cyan-500/30 space-y-4 animate-in fade-in shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Inbox className="w-4 h-4 text-cyan-400" />
                <span>All Documents Dispatched to Tr. {currentTeacher.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {allDispatchedDocs.length} Total
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every curriculum resource, scheme, assessment, and note routed to your portal by administration and the Offline AI Assistant.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by subject, grade, title..."
                  value={dispatchedSearchQuery}
                  onChange={(e) => setDispatchedSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-52 sm:w-64"
                />
              </div>
              {dispatchedSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDispatchedSearchQuery('')}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {filteredDispatchedDocs.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 px-4">
              <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">
                {dispatchedSearchQuery
                  ? `No resources match "${dispatchedSearchQuery}"`
                  : 'No curriculum packages dispatched yet'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {dispatchedSearchQuery
                  ? 'Try searching with another keyword or clear the search query.'
                  : 'When the administrator or the Offline AI Assistant dispatches resources for your classes, they will be listed here automatically.'}
              </p>
              {dispatchedSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setDispatchedSearchQuery('')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAIAssistant(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold transition inline-flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Offline AI Assistant</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Showing {filteredDispatchedDocs.length} dispatched resource(s)</span>
                <span className="hidden sm:inline">Click "Read Content" to view full text offline or "Go to Folder" to jump to category</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredDispatchedDocs.map((doc) => {
                  const isPdf = doc.fileType === 'pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
                  const isSheet = doc.fileType === 'spreadsheet' || doc.fileName.match(/\.(xlsx|xls|csv)$/i);

                  return (
                    <div
                      key={`${doc.pkgId}_${doc.docId}`}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isPdf
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isSheet
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {isPdf ? 'PDF' : isSheet ? 'XLS' : 'DOC'}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h5 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {doc.title}
                          </h5>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                              {doc.grade}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                              {doc.subject}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30">
                              {doc.category}
                            </span>
                            {doc.strand && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                                {doc.strand}
                              </span>
                            )}
                            <span className="font-mono text-slate-400">
                              {doc.fileName} • {doc.size}
                            </span>
                            {doc.content ? (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                📖 Text Extracted
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end lg:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="Open document, read content or preview file"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Read / Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGoToDocFolder(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-slate-700 hover:border-amber-400/50"
                          title="Open this folder in 15 curriculum categories"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Go to Folder</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.pkgId, doc.title)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                          title="Delete from portal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {allDispatchedDocs.length > 0 && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">
                    {allDispatchedDocs.length} curriculum resource(s) synchronized to your portal
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Dispatched to your account and categorized across your grade & subject folders.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudioTab('dispatched')}
                className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shrink-0 cursor-pointer self-start sm:self-auto flex items-center gap-1"
              >
                <span>View All ({allDispatchedDocs.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Top Banner & Grade/Subject Selectors */}
          <div className="p-4 rounded-2xl bg-[#080E24] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>Teacher Curriculum Studio & Workbench</span>
            </h3>
            <p className="text-xs text-slate-400">
              {currentTeacher.name} • {selectedGrade} • {selectedSubject}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
            >
              {assignedGrades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
            >
              {getSubjsForGrade(selectedGrade).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 15 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {TEACHER_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                showToast(`Opened ${c.title}`);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-xl flex-shrink-0">{c.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold block truncate">{c.title}</span>
                  {(categoryCounts[c.id] || 0) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold shrink-0">
                      {categoryCounts[c.id]}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate">{c.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE CATEGORY WORKSPACE & DOCUMENT UPLOADER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#080E24] border border-slate-800 space-y-4 animate-in fade-in">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeCategoryObj.icon}</span>
              <h4 className="text-sm sm:text-base font-black text-white">
                {activeCategoryObj.title}
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              {currentTeacher.name} • <span className="text-amber-400 font-bold">{selectedGrade}</span> • <span className="text-emerald-400 font-bold">{selectedSubject}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Upload PDF, Word document, exam paper or spreadsheet"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAIAssistant(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
              title="Launch Offline AI Document Assistant to read content and route files"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline AI Assistant</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>New Notes</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Drag & Drop Upload Banner */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-xl border-2 border-dashed transition cursor-pointer text-center space-y-1.5 ${
            isDragOver
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
          }`}
        >
          <Upload className={`w-5 h-5 mx-auto transition ${isDragOver ? 'text-amber-400' : 'text-slate-400'}`} />
          <p className="text-xs font-bold text-slate-200">
            {isUploading ? 'Reading and uploading file...' : 'Drop your PDF, Word document, or exam paper here, or click to browse'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Supported: .pdf, .docx, .doc, .xlsx, .pptx, .txt, .csv, scans (up to 50 MB)
          </p>
        </div>

        {/* Installed Documents List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Installed Documents in this Category ({activeDocuments.length})
            </span>
            <span className="font-mono text-slate-500 text-[10px]">
              {selectedGrade} • {selectedSubject}
            </span>
          </div>

          {activeDocuments.length === 0 ? (
            <div className="py-10 text-center space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 px-4">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                No documents uploaded yet in {activeCategoryObj.title}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {allDispatchedDocs.length > 0
                  ? `You have ${allDispatchedDocs.length} curriculum resource(s) in other categories or subjects.`
                  : 'Use the "Upload PDF / Doc" button above to install lesson notes, schemes of work, or assignments.'}
              </p>
              {allDispatchedDocs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStudioTab('dispatched')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 mt-1"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>View All {allDispatchedDocs.length} Dispatched Documents</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {activeDocuments.map((doc) => {
                const isPdf = doc.fileType === 'pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
                const isSheet = doc.fileType === 'spreadsheet' || doc.fileName.match(/\.(xlsx|xls|csv)$/i);

                return (
                  <div
                    key={doc.docId}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPdf
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isSheet
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {isPdf ? 'PDF' : isSheet ? 'XLS' : 'DOC'}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                          {doc.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-300">{doc.fileName}</span>
                          <span>•</span>
                          <span className="text-amber-300">{doc.size}</span>
                          {doc.strand && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{doc.strand}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(doc)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="View / Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(doc)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.pkgId, doc.title)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )}

      {/* CREATE NOTES MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#080E24] border border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeCategoryObj.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Create Curriculum Notes</h4>
                  <p className="text-[11px] text-slate-400">
                    {activeCategoryObj.title} • {selectedGrade} • {selectedSubject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Week 3 Lesson Notes - Addition of Fractions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Strand / Topic (Optional)
                </label>
                <input
                  type="text"
                  value={noteStrand}
                  onChange={(e) => setNoteStrand(e.target.value)}
                  placeholder="e.g. Numbers, Geometry, Living Things"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Notes / Syllabus Content
                </label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type syllabus notes, learning activities, or lesson outcomes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT & PDF PREVIEW MODAL WITH CONTENT READER */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl h-[88vh] rounded-3xl bg-[#080E24] border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden text-white">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{previewDoc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{previewDoc.name}</p>
                </div>
              </div>

              {/* View Mode Toggle: Read Content vs File Preview */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewViewTab('content')}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      previewViewTab === 'content'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Content</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewTab('file')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      previewViewTab === 'file'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>File Preview</span>
                  </button>
                </div>

                {/* Extract Text Button if missing */}
                <button
                  type="button"
                  disabled={isExtractingPreview}
                  onClick={async () => {
                    if (previewDoc.fileData) {
                      setIsExtractingPreview(true);
                      try {
                        const res = await extractTextFromDataUrl(previewDoc.fileData, previewDoc.name);
                        if (res.text) {
                          setPreviewDoc((prev) => (prev ? { ...prev, content: res.text } : null));
                          setPreviewViewTab('content');
                          showToast('✓ Extracted text with Offline AI');
                        }
                      } finally {
                        setIsExtractingPreview(false);
                      }
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Extract text using offline AI reader"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">{isExtractingPreview ? 'Extracting...' : 'Extract Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = previewDoc.name || `${previewDoc.title}.doc`;
                    if (previewDoc.fileData) link.href = previewDoc.fileData;
                    else link.href = URL.createObjectURL(new Blob([previewDoc.content || ''], { type: 'text/plain' }));
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex justify-center items-start">
              {previewViewTab === 'content' || (!previewDoc.fileData && previewDoc.content) ? (
                /* READABLE DOCUMENT CONTENT VIEW */
                <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-8 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{previewDoc.title}</h4>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">
                        {previewDoc.name} • {selectedGrade} • {selectedSubject}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search in text..."
                          value={previewSearchTerm}
                          onChange={(e) => setPreviewSearchTerm(e.target.value)}
                          className="pl-7 pr-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (previewDoc.content) {
                            navigator.clipboard.writeText(previewDoc.content);
                            setCopiedPreviewText(true);
                            setTimeout(() => setCopiedPreviewText(false), 2000);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPreviewText ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-slate-950 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[350px]">
                    {previewDoc.content
                      ? (previewSearchTerm
                          ? previewDoc.content
                              .split('\n')
                              .filter((line) => line.toLowerCase().includes(previewSearchTerm.toLowerCase()))
                              .join('\n') || `No matching lines for "${previewSearchTerm}".`
                          : previewDoc.content)
                      : 'No readable text extracted. Click "Extract Text" above to read this file offline.'}
                  </div>
                </div>
              ) : previewDoc.fileData && (previewDoc.fileData.startsWith('data:application/pdf') || previewDoc.name.toLowerCase().endsWith('.pdf')) ? (
                /* PDF IFRAME VIEW */
                <div className="w-full max-w-4xl h-full flex flex-col gap-2">
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.title}
                    className="w-full flex-1 rounded-2xl border border-slate-800 bg-white shadow-xl"
                  />
                  <p className="text-[11px] text-slate-400 text-center">
                    If this PDF preview does not display inside the browser sandbox, switch to{' '}
                    <button
                      type="button"
                      onClick={() => setPreviewViewTab('content')}
                      className="text-cyan-400 underline font-bold cursor-pointer"
                    >
                      Read Content
                    </button>{' '}
                    to read extracted text directly.
                  </p>
                </div>
              ) : previewDoc.fileData && previewDoc.fileData.startsWith('data:image/') ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
                />
              ) : (
                <div className="w-full max-w-2xl p-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="font-bold text-white text-sm">{previewDoc.title}</h5>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{previewDoc.name}</p>
                  </div>
                  <div className="whitespace-pre-wrap font-sans">
                    {previewDoc.content || 'This document has been archived in the school repository.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFLINE AI DOCUMENT ASSISTANT MODAL */}
      <OfflineAIDocumentAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        initialGrade={selectedGrade}
        initialSubject={selectedSubject}
        initialCategory={activeCategoryObj.repoCategory}
        initialTeacherId={currentTeacher.id}
        onDispatched={() => {
          setShowAIAssistant(false);
          setRevision((r) => r + 1);
          showToast('✓ Resource dispatched via Offline AI Assistant');
        }}
      />

      {/* DELETE DOCUMENT CONFIRMATION MODAL */}
      {deleteDocTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#080E24] border border-rose-500/30 shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Delete Document?</h3>
                <p className="text-xs text-slate-300">
                  Permanently delete <strong className="text-white">"{deleteDocTarget.title}"</strong> from your saved resources?
                </p>
                <p className="text-[11px] text-rose-400/90 font-medium pt-1">
                  This document will be removed from your offline storage.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteDocTarget(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dataLayer.deleteResourcePackage(deleteDocTarget.pkgId);
                  setRevision((r) => r + 1);
                  showToast(`Deleted "${deleteDocTarget.title}"`);
                  setDeleteDocTarget(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
