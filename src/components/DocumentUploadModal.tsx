/**
 * Little Roses Academy - Unified Document Upload Modal
 * 
 * Single consolidated component for all document uploads across Admin and Teacher portals:
 * - Direct drag & drop or file selection
 * - Automatic client-side extraction via Universal Document Engine (PDF text, Mammoth DOCX, SheetJS XLSX)
 * - Validation: 50 MB limit, supported format detection, sanitized metadata
 * - Contextual preselection of teacher, grade (1-6), subject, term, and category
 * - Four-portal visibility controls (Approved for Learners, Parent Visible)
 * - Eliminates duplicate upload handlers and duplicate record creation
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Table,
  Eye,
  Check,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  dataLayer,
  TeacherAccountRecord,
  ResourcePackageRecord,
} from '../services/dataLayer';
import {
  processDocumentFile,
  formatBytes,
  fileToDataUrl,
  SupportedFileType
} from '../services/universalDocumentService';
import { CANONICAL_CBC_SUBJECTS, CANONICAL_RESOURCE_CATEGORIES } from '../services/aiDocumentAssistant';
import { schoolAIService, DocumentMismatchReport } from '../services/schoolAIService';

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pkg: ResourcePackageRecord) => void;
  // Contextual preselection:
  initialGrade?: string;
  initialSubject?: string;
  initialCategory?: string;
  initialTeacherId?: string;
  initialTerm?: string;
  uploaderRole?: 'admin' | 'teacher';
  uploaderId?: string;
  uploaderName?: string;
  lockTeacher?: boolean;
}

const LRA_PRIMARY_GRADES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
] as const;

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialGrade,
  initialSubject,
  initialCategory,
  initialTeacherId,
  initialTerm = 'Term 1',
  uploaderRole = 'admin',
  uploaderId,
  uploaderName,
  lockTeacher = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(initialCategory || 'Lesson Notes');
  const [grade, setGrade] = useState<string>(initialGrade || 'Grade 4');
  const [subject, setSubject] = useState<string>(initialSubject || 'Mathematics Activities');
  const [term, setTerm] = useState<string>(initialTerm || 'Term 1');
  const [academicYear, setAcademicYear] = useState<string>('2026');
  const [strand, setStrand] = useState<string>('');
  const [assignedTeacherId, setAssignedTeacherId] = useState<string>(initialTeacherId || 'all');
  const [isLearnerApproved, setIsLearnerApproved] = useState<boolean>(false);
  const [isParentVisible, setIsParentVisible] = useState<boolean>(false);

  // Extracted data cache
  const [extractedRawText, setExtractedRawText] = useState<string>('');
  const [extractedHtml, setExtractedHtml] = useState<string | undefined>(undefined);
  const [detectedType, setDetectedType] = useState<string>('document');
  const [worksheetsData, setWorksheetsData] = useState<any[] | undefined>(undefined);
  const [slidesData, setSlidesData] = useState<any[] | undefined>(undefined);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const teachers = dataLayer.getTeachers();

  // Reset or initialize on modal open
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileDataUrl(null);
      setIsProcessing(false);
      setProcessingError(null);
      setTitle('');
      setDescription('');
      setCategory(initialCategory || 'Lesson Notes');
      setGrade(initialGrade || 'Grade 4');
      setSubject(initialSubject || 'Mathematics Activities');
      setTerm(initialTerm || 'Term 1');
      setStrand('');
      setAssignedTeacherId(initialTeacherId || (teachers[0]?.id || 'all'));
      setIsLearnerApproved(
        Boolean(initialCategory && ['Lesson Notes', 'Revision Materials', 'Reading Materials', 'Assignments'].includes(initialCategory))
      );
      setIsParentVisible(
        Boolean(initialCategory && ['Reading Materials', 'Revision Materials'].includes(initialCategory))
      );
    }
  }, [isOpen, initialGrade, initialSubject, initialCategory, initialTeacherId, initialTerm]);

  // Handle file selection and extract via Universal Document Engine
  const handleFileChosen = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setProcessingError(`File size (${formatBytes(selectedFile.size)}) exceeds the maximum 50 MB limit.`);
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setProcessingError(null);

    // Auto-fill title if empty
    const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
    if (!title.trim()) {
      setTitle(cleanTitle);
    }

    try {
      // 1. Process document and extract content offline
      const [processedResult, dataUrl] = await Promise.all([
        processDocumentFile(selectedFile),
        fileToDataUrl(selectedFile),
      ]);

      setFileDataUrl(dataUrl);
      setExtractedRawText(processedResult.rawText || '');
      setExtractedHtml(processedResult.htmlPreview);
      setDetectedType(processedResult.fileType);
      setWorksheetsData(processedResult.worksheets);
      setSlidesData(processedResult.slides);
      setPageCount(processedResult.pageCount);

      if (processedResult.status === 'error' && processedResult.errorMessage) {
        setProcessingError(processedResult.errorMessage);
      }

      setIsProcessing(false);
    } catch (err: any) {
      console.warn('[DocumentUploadModal] Error processing file:', err);
      setIsProcessing(false);
      setProcessingError(`Could not read file contents: ${err?.message || 'Read error'}. Original file will still be preserved.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChosen(droppedFile);
    }
  };

  // Submit and create single centralized resource record in dataLayer
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setProcessingError('Please provide a resource title.');
      return;
    }

    try {
      const recipientIds =
        assignedTeacherId === 'all'
          ? ['all']
          : assignedTeacherId
          ? [assignedTeacherId]
          : ['all'];

      const fileName = file?.name || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.doc`;
      const sizeFormatted = file ? formatBytes(file.size) : 'Ready';

      const newPackage = dataLayer.addResourcePackage({
        packageName: title.trim(),
        description: description.trim() || undefined,
        category,
        grade,
        subject,
        strand: strand.trim() || undefined,
        academicYear,
        term,
        recipientTeacherIds: recipientIds,
        uploaderRole,
        uploaderId,
        uploaderName,
        isLearnerApproved,
        isParentVisible: isParentVisible || isLearnerApproved,
        status: 'active',
        documents: [
          {
            id: `doc_${Date.now()}`,
            name: fileName,
            size: sizeFormatted,
            sizeBytes: file?.size,
            fileData: fileDataUrl || undefined,
            content: extractedRawText || undefined,
            htmlContent: extractedHtml,
            fileType: detectedType,
            worksheets: worksheetsData,
            slides: slidesData,
            pageCount,
            extractionStatus: processingError ? 'failed' : 'success',
            extractionError: processingError || undefined,
            versions: [],
          },
        ],
      });

      onSuccess(newPackage);
      onClose();
    } catch (err: any) {
      setProcessingError(`Failed to save resource: ${err?.message || 'Storage error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-[#0B152E] border border-slate-800 text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#070D1E] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Upload & Route Curriculum Document
              </h3>
              <p className="text-[11px] text-slate-400">
                Single central repository • Reflects automatically across all 4 school portals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* File Picker / Dropzone */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              Select or Drop Document <span className="text-amber-400">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChosen(f);
                e.target.value = '';
              }}
            />

            {file ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {file.name.split('.').pop() || 'DOC'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{file.name}</p>
                    <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                      {formatBytes(file.size)} • {detectedType.toUpperCase()}
                      {isProcessing ? ' • Extracting readable text...' : ' • Ready to Save'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileDataUrl(null);
                      setExtractedRawText('');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition cursor-pointer text-center space-y-2 ${
                  isDragOver
                    ? 'border-amber-400 bg-amber-500/15'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <FileUp className="w-8 h-8 text-amber-400 mx-auto" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Drop your document here, or <span className="text-amber-400 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Supported: PDF, Word (.docx/.doc), Excel (.xlsx/.csv), PowerPoint (.pptx), Text, Scans (up to 50 MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {processingError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{processingError}</span>
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Resource Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grade 5 Mathematics Term 1 Scheme of Work"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Description & Learning Objectives (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of learning outcomes, strands, and pedagogical purpose..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs resize-none"
              />
            </div>
          </div>

          {/* Curriculum Classification Grid */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
              Curriculum & Portal Routing
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                  Category / Document Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                >
                  {CANONICAL_RESOURCE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                  Primary Grade Level (1–6)
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                >
                  {LRA_PRIMARY_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="all">All Primary Grades</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                  Learning Area / CBC Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                >
                  {CANONICAL_CBC_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="General Activities">General School Activities</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                  Academic Term
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                >
                  <option value="Term 1">Term 1 (Current)</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="All Terms">Full Academic Year</option>
                </select>
              </div>
            </div>

            {/* Teacher Allocation */}
            <div className="pt-1">
              <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                Assigned Teacher (Immediate Delivery)
              </label>
              <select
                disabled={lockTeacher}
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold disabled:opacity-60"
              >
                <option value="all">All Relevant Teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.assignedGrades?.join(', ') || 'Faculty'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                The document appears in this teacher&apos;s curriculum workbench automatically.
              </p>
            </div>
          </div>

          {/* Visibility and Portal Permissions Controls */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
              Four-Portal Visibility & Student Access Controls
            </span>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLearnerApproved}
                  onChange={(e) => setIsLearnerApproved(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 mt-0.5 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-white block">
                    Approve for Learners ({grade})
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Pupils in this grade can view, search, and study this document in their CBC Study Zone.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={isParentVisible || isLearnerApproved}
                  onChange={(e) => setIsParentVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 mt-0.5 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-bold text-white block">
                    Visible to Parents & Guardians
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Parents with children in this grade can inspect this material when viewing their child.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !title.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              <span>{isProcessing ? 'Processing File...' : 'Upload & Route Resource'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
