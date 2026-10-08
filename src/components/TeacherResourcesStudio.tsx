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
} from 'lucide-react';
import {
  dataLayer,
  getTeacherGradeAssignments,
  getLraSubjectsForGrade,
  ResourcePackageRecord,
  loadResourceFile,
} from '../services/dataLayer.ts';
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
          pkgCat.includes(activeCategoryObj.title.toLowerCase());

        const gradeMatch = !pkg.grade || pkg.grade.trim().toLowerCase() === cleanGrade;
        const subjMatch = !pkg.subject || pkg.subject.trim().toLowerCase() === cleanSubject;

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

  // Handle uploading real file (PDF, Doc, Spreadsheet, Media)
  const processUploadFile = async (file: File) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setUploadError(`File exceeds maximum size limit (50 MB). Your file is ${formatBytes(file.size)}.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const isText =
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.md');

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    let detected = 'document';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['xlsx', 'xls', 'csv'].includes(ext)) detected = 'spreadsheet';
    else if (['pdf'].includes(ext)) detected = 'pdf';
    else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) detected = 'image';
    else if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) detected = 'video';
    else if (['txt', 'md', 'log'].includes(ext)) detected = 'text';

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        setIsUploading(false);
        setUploadError('Failed to read file content.');
        return;
      }

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
              content: isText ? result : undefined,
              fileData: result,
              fileType: detected,
              size: formatBytes(file.size),
              sizeBytes: file.size,
              versions: [],
            },
          ],
        });

        setIsUploading(false);
        setRevision((r) => r + 1);
        showToast(`✓ Uploaded "${file.name}" to ${activeCategoryObj.title}`);
      } catch (err: any) {
        setIsUploading(false);
        setUploadError(`Upload failed: ${err.message || 'Storage error'}`);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('Error reading file from disk.');
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
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

  // Open Preview Modal with on-demand IndexedDB hydration
  const handleOpenPreview = async (doc: typeof activeDocuments[0]) => {
    let dataUrl = doc.fileData;
    if (!dataUrl) {
      dataUrl = (await loadResourceFile(doc.docId)) || undefined;
    }

    setPreviewDoc({
      id: doc.docId,
      title: doc.title,
      name: doc.fileName,
      fileData: dataUrl,
      content: doc.content,
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
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{c.title}</span>
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Upload PDF, Word document, spreadsheet or notes"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload PDF / Doc</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
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
            <div className="py-10 text-center space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                No documents uploaded yet in {activeCategoryObj.title}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Use the "Upload PDF / Doc" button above to install lesson notes, schemes of work, or assignments.
              </p>
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

      {/* DOCUMENT & PDF PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl h-[85vh] rounded-2xl bg-[#080E24] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{previewDoc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{previewDoc.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
              {previewDoc.fileData && (previewDoc.fileData.startsWith('data:application/pdf') || previewDoc.name.toLowerCase().endsWith('.pdf')) ? (
                <iframe
                  src={previewDoc.fileData}
                  title={previewDoc.title}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white shadow-xl"
                />
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
