import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Table,
  Image as ImageIcon,
  Video,
  FileCode,
  Download,
  Printer,
  Copy,
  Trash2,
  Edit3,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Search,
  ChevronRight,
  MoreVertical,
  History,
  FolderInput,
  Check,
  X,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Sparkles,
  ArrowLeft,
  FileUp,
  Save,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import {
  dataLayer,
  ResourcePackageRecord,
  ResourceVersion,
  TeacherAccountRecord,
  getTeacherGradeAssignments,
  loadResourceFile,
  saveResourceFile,
} from '../services/dataLayer.ts';

// -----------------------------------------------------------------------------
// STORAGE UTILITIES (500 MB SCHOOL REPOSITORY QUOTA)
// -----------------------------------------------------------------------------
export const TOTAL_SCHOOL_STORAGE_BYTES = 500 * 1024 * 1024; // 500 MB

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function calculateStorageUsage(packages: ResourcePackageRecord[]) {
  let usedBytes = 0;
  let totalDocs = 0;

  packages.forEach((pkg) => {
    if (pkg.documents) {
      pkg.documents.forEach((doc) => {
        totalDocs++;
        if (doc.sizeBytes) {
          usedBytes += doc.sizeBytes;
        } else if (doc.fileData) {
          usedBytes += doc.fileData.length;
        } else if (doc.content) {
          usedBytes += doc.content.length;
        } else {
          usedBytes += 2048; // default 2 KB
        }

        // Add versions size
        if (doc.versions) {
          doc.versions.forEach((v) => {
            if (v.sizeBytes) usedBytes += v.sizeBytes;
            else if (v.fileData) usedBytes += v.fileData.length;
            else if (v.content) usedBytes += v.content.length;
          });
        }
      });
    }
  });

  const remainingBytes = Math.max(0, TOTAL_SCHOOL_STORAGE_BYTES - usedBytes);
  const percentUsed = Math.min(100, (usedBytes / TOTAL_SCHOOL_STORAGE_BYTES) * 100);

  return {
    usedBytes,
    remainingBytes,
    totalBytes: TOTAL_SCHOOL_STORAGE_BYTES,
    percentUsed: Number(percentUsed.toFixed(1)),
    formattedUsed: formatBytes(usedBytes),
    formattedRemaining: formatBytes(remainingBytes),
    formattedTotal: formatBytes(TOTAL_SCHOOL_STORAGE_BYTES),
    totalDocs,
  };
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  size?: string;
  sizeBytes?: number;
  content?: string;
  fileData?: string;
  fileType?: string; // 'document' | 'spreadsheet' | 'pdf' | 'image' | 'video' | 'text'
  spreadsheetData?: { headers: string[]; rows: string[][] };
  versions?: ResourceVersion[];
}

export interface WorkspaceResourceItem {
  id: string;
  title: string;
  category: string;
  categoryId?: string;
  grade: string;
  subject: string;
  strand?: string;
  term?: string;
  academicYear?: string;
  recipientTeacherIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  documents: WorkspaceDocument[];
}

interface AdminResourceWorkspaceProps {
  resource: WorkspaceResourceItem;
  teacher: TeacherAccountRecord;
  grade: string;
  subject: string;
  categoryName: string;
  allTeachers: TeacherAccountRecord[];
  onClose: () => void;
  onRefresh: () => void;
}

export function AdminResourceWorkspace({
  resource,
  teacher,
  grade,
  subject,
  categoryName,
  allTeachers,
  onClose,
  onRefresh,
}: AdminResourceWorkspaceProps) {
  // Current active document inside the package
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const currentDoc = resource.documents[activeDocIndex] || resource.documents[0] || {
    id: `doc_${Date.now()}`,
    name: `${resource.title}.doc`,
    content: '',
    fileType: 'document',
  };

  // Document state for editing
  const [docName, setDocName] = useState(currentDoc.name || resource.title);
  const [docContent, setDocContent] = useState(currentDoc.content || '');
  const [fileData, setFileData] = useState(currentDoc.fileData || '');
  const [fileType, setFileType] = useState(currentDoc.fileType || detectFileType(currentDoc.name, currentDoc.fileData));
  const [spreadsheetData, setSpreadsheetData] = useState<{ headers: string[]; rows: string[][] }>(
    currentDoc.spreadsheetData || {
      headers: ['A', 'B', 'C', 'D', 'E'],
      rows: [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
      ],
    }
  );

  const [isSaved, setIsSaved] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Rename state
  const [renameTitle, setRenameTitle] = useState(resource.title);
  const [renameFileName, setRenameFileName] = useState(currentDoc.name);

  // Move state
  const [targetTeacherId, setTargetTeacherId] = useState(teacher.id);
  const [targetGrade, setTargetGrade] = useState(grade);
  const [targetSubject, setTargetSubject] = useState(subject);

  // Dynamic target assignments for move modal based on real teacher allocations
  const targetTeacher = useMemo(() => {
    return allTeachers.find((t) => t.id === targetTeacherId) || teacher;
  }, [allTeachers, targetTeacherId, teacher]);

  const targetTeacherAssignments = useMemo(() => {
    return targetTeacher ? getTeacherGradeAssignments(targetTeacher) : [];
  }, [targetTeacher]);

  const targetAvailableSubjects = useMemo(() => {
    const matched = targetTeacherAssignments.find((a) => a.grade === targetGrade);
    return matched ? matched.subjects : [];
  }, [targetTeacherAssignments, targetGrade]);

  // When target teacher changes, auto-select their first assigned grade and subject
  useEffect(() => {
    if (targetTeacherAssignments.length > 0) {
      const first = targetTeacherAssignments[0];
      setTargetGrade(first.grade);
      if (first.subjects.length > 0) {
        setTargetSubject(first.subjects[0]);
      }
    }
  }, [targetTeacherId, targetTeacherAssignments]);

  // When target grade changes, ensure subject is valid for that grade
  useEffect(() => {
    if (targetAvailableSubjects.length > 0 && !targetAvailableSubjects.includes(targetSubject)) {
      setTargetSubject(targetAvailableSubjects[0]);
    }
  }, [targetGrade, targetAvailableSubjects, targetSubject]);

  // Hydrate full file data from IndexedDB if not already loaded in memory
  useEffect(() => {
    if (!fileData && currentDoc.id) {
      loadResourceFile(currentDoc.id).then((storedData) => {
        if (storedData) {
          setFileData(storedData);
          if (storedData.startsWith('data:application/pdf') || currentDoc.name.toLowerCase().endsWith('.pdf')) {
            setFileType('pdf');
          }
        }
      });
    }
  }, [currentDoc.id, fileData, currentDoc.name]);

  // Search in doc
  const [searchDocTerm, setSearchDocTerm] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  // Image Tools State
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageFilter, setImageFilter] = useState<'normal' | 'grayscale' | 'contrast' | 'sepia'>('normal');

  // Video Tools State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Spreadsheet calculations state
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);

  // Word Editor formatting state
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Storage Stats
  const storageInfo = useMemo(() => {
    const allPkgs = dataLayer.getResourcePackages();
    return calculateStorageUsage(allPkgs);
  }, [resource, isSaved]);

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

  // ---------------------------------------------------------------------------
  // SAVE WITH AUTOMATIC VERSION PRESERVATION (PRESERVE ORIGINALS RULE)
  // ---------------------------------------------------------------------------
  const handleSaveDocument = (createVersion = true) => {
    try {
      const allPkgs = dataLayer.getResourcePackages();
      const existingPkg = allPkgs.find((p) => p.id === resource.id);
      if (!existingPkg) return;

      const currentDocs = [...existingPkg.documents];
      const targetDoc = { ...(currentDocs[activeDocIndex] || currentDocs[0]) };

      // Preserve previous version in history before saving changes
      const versions = [...(targetDoc.versions || [])];
      if (createVersion && (targetDoc.content !== docContent || targetDoc.fileData !== fileData)) {
        versions.unshift({
          version: versions.length + 1,
          timestamp: new Date().toISOString(),
          name: targetDoc.name,
          size: targetDoc.size,
          sizeBytes: targetDoc.sizeBytes,
          content: targetDoc.content,
          fileData: targetDoc.fileData,
          fileType: targetDoc.fileType,
          author: 'Curriculum Admin',
        });
      }

      const calculatedBytes =
        (docContent?.length || 0) + (fileData?.length || 0) + (JSON.stringify(spreadsheetData).length || 0);

      const updatedDoc: WorkspaceDocument = {
        ...targetDoc,
        name: docName,
        content: docContent,
        fileData: fileData,
        fileType: fileType,
        spreadsheetData: spreadsheetData,
        size: formatBytes(calculatedBytes),
        sizeBytes: calculatedBytes,
        versions: versions,
      };

      currentDocs[activeDocIndex] = updatedDoc;

      dataLayer.updateResourcePackage(resource.id, {
        documents: currentDocs,
        updatedAt: new Date().toISOString(),
      });

      setIsSaved(true);
      setSaveMessage('All changes saved to repository');
      setTimeout(() => setSaveMessage(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving document: ${err.message || 'Storage error'}`);
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE AS / CREATE COPY
  // ---------------------------------------------------------------------------
  const handleSaveAsCopy = () => {
    try {
      const copyTitle = `Copy of ${resource.title}`;
      const copyDocName = `copy_${docName}`;

      dataLayer.addResourcePackage({
        packageName: copyTitle,
        category: resource.category,
        grade: grade,
        subject: subject,
        strand: resource.strand,
        academicYear: resource.academicYear || '2026',
        term: resource.term || 'Term 1',
        recipientTeacherIds: [teacher.id],
        documents: [
          {
            id: `doc_${Date.now()}`,
            name: copyDocName,
            content: docContent,
            fileData: fileData,
            fileType: fileType,
            spreadsheetData: spreadsheetData,
            size: formatBytes(
              (docContent?.length || 0) + (fileData?.length || 0) + (JSON.stringify(spreadsheetData).length || 0)
            ),
            sizeBytes: (docContent?.length || 0) + (fileData?.length || 0),
            versions: [],
          },
        ],
      });

      setSaveMessage(`Created duplicate copy: "${copyTitle}"`);
      setTimeout(() => setSaveMessage(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Error creating copy: ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // RENAME RESOURCE & FILE
  // ---------------------------------------------------------------------------
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim()) return;

    try {
      const allPkgs = dataLayer.getResourcePackages();
      const existingPkg = allPkgs.find((p) => p.id === resource.id);
      if (!existingPkg) return;

      const currentDocs = [...existingPkg.documents];
      if (currentDocs[activeDocIndex]) {
        currentDocs[activeDocIndex].name = renameFileName.trim() || currentDocs[activeDocIndex].name;
      }

      dataLayer.updateResourcePackage(resource.id, {
        packageName: renameTitle.trim(),
        documents: currentDocs,
        updatedAt: new Date().toISOString(),
      });

      setDocName(renameFileName.trim());
      setShowRenameModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Rename error: ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // REPLACE FILE (PRESERVE PREVIOUS FILE AS VERSION)
  // ---------------------------------------------------------------------------
  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Quota check
    if (file.size > storageInfo.remainingBytes) {
      alert(`Storage Limit Exceeded: File size (${formatBytes(file.size)}) exceeds remaining space (${storageInfo.formattedRemaining}).`);
      return;
    }

    const reader = new FileReader();
    const isText = file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.md');

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;

      const detected = detectFileType(file.name, typeof result === 'string' ? result : undefined);

      // Archive current before replace
      const versions = [...(currentDoc.versions || [])];
      versions.unshift({
        version: versions.length + 1,
        timestamp: new Date().toISOString(),
        name: currentDoc.name,
        size: currentDoc.size,
        sizeBytes: currentDoc.sizeBytes,
        content: currentDoc.content,
        fileData: currentDoc.fileData,
        fileType: currentDoc.fileType,
        author: 'Replaced by Admin',
      });

      if (isText && typeof result === 'string') {
        setDocContent(result);
        setFileData('');
      } else if (typeof result === 'string') {
        setFileData(result);
      }

      setDocName(file.name);
      setFileType(detected);
      setIsSaved(false);

      // Automatically commit replace to persistent storage
      const allPkgs = dataLayer.getResourcePackages();
      const existingPkg = allPkgs.find((p) => p.id === resource.id);
      if (existingPkg) {
        const currentDocs = [...existingPkg.documents];
        currentDocs[activeDocIndex] = {
          ...currentDocs[activeDocIndex],
          name: file.name,
          content: isText && typeof result === 'string' ? result : undefined,
          fileData: typeof result === 'string' ? result : undefined,
          fileType: detected,
          size: formatBytes(file.size),
          sizeBytes: file.size,
          versions: versions,
        };

        dataLayer.updateResourcePackage(resource.id, {
          documents: currentDocs,
          updatedAt: new Date().toISOString(),
        });
      }

      setSaveMessage(`Replaced file with "${file.name}" (archived previous version)`);
      setTimeout(() => setSaveMessage(null), 3500);
      onRefresh();
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // ---------------------------------------------------------------------------
  // MOVE RESOURCE TO DIFFERENT TEACHER / GRADE / SUBJECT
  // ---------------------------------------------------------------------------
  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dataLayer.updateResourcePackage(resource.id, {
        grade: targetGrade,
        subject: targetSubject,
        recipientTeacherIds: [targetTeacherId],
        updatedAt: new Date().toISOString(),
      });

      setShowMoveModal(false);
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Move error: ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // DELETE RESOURCE
  // ---------------------------------------------------------------------------
  const handleDeleteResource = () => {
    setShowDeleteModal(true);
  };

  // ---------------------------------------------------------------------------
  // RESTORE HISTORICAL VERSION
  // ---------------------------------------------------------------------------
  const handleRestoreVersion = (v: ResourceVersion) => {
    // Archive current before restore
    const versions = [...(currentDoc.versions || [])];
    versions.unshift({
      version: versions.length + 1,
      timestamp: new Date().toISOString(),
      name: docName,
      size: currentDoc.size,
      sizeBytes: currentDoc.sizeBytes,
      content: docContent,
      fileData: fileData,
      fileType: fileType,
      author: 'Current before Restore',
    });

    setDocName(v.name);
    setDocContent(v.content || '');
    setFileData(v.fileData || '');
    setFileType(v.fileType || detectFileType(v.name, v.fileData));

      const allPkgs = dataLayer.getResourcePackages();
      const existingPkg = allPkgs.find((p) => p.id === resource.id);
      if (existingPkg) {
        const currentDocs = [...existingPkg.documents];
        currentDocs[activeDocIndex] = {
          ...currentDocs[activeDocIndex],
          name: v.name,
          content: v.content,
          fileData: v.fileData,
          fileType: v.fileType,
          versions: versions,
        };

        dataLayer.updateResourcePackage(resource.id, {
          documents: currentDocs,
          updatedAt: new Date().toISOString(),
        });
      }

      setShowVersionsModal(false);
      setSaveMessage(`Restored version ${v.version}`);
      setTimeout(() => setSaveMessage(null), 3000);
      onRefresh();
  };

  // ---------------------------------------------------------------------------
  // NATIVE DOWNLOAD WITH PROPER EXTENSION
  // ---------------------------------------------------------------------------
  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.download = docName || `${resource.title}.txt`;

      if (fileData) {
        link.href = fileData;
      } else if (fileType === 'spreadsheet') {
        const csvContent = [
          spreadsheetData.headers.join(','),
          ...spreadsheetData.rows.map((row) => row.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        link.href = URL.createObjectURL(blob);
        link.download = docName.endsWith('.csv') ? docName : `${docName}.csv`;
      } else {
        const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8;' });
        link.href = URL.createObjectURL(blob);
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Download error: ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // PRINT / EXPORT ACTION
  // ---------------------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  // ---------------------------------------------------------------------------
  // SPREADSHEET OPERATIONS
  // ---------------------------------------------------------------------------
  const handleAddSpreadsheetRow = () => {
    setSpreadsheetData((prev) => ({
      ...prev,
      rows: [...prev.rows, new Array(prev.headers.length).fill('')],
    }));
    setIsSaved(false);
  };

  const handleDeleteSpreadsheetRow = (index: number) => {
    if (spreadsheetData.rows.length <= 1) return;
    setSpreadsheetData((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
    setIsSaved(false);
  };

  const handleAddSpreadsheetCol = () => {
    const nextColChar = String.fromCharCode(65 + (spreadsheetData.headers.length % 26));
    const colName = `${nextColChar}${spreadsheetData.headers.length >= 26 ? Math.floor(spreadsheetData.headers.length / 26) : ''}`;
    setSpreadsheetData((prev) => ({
      headers: [...prev.headers, colName],
      rows: prev.rows.map((row) => [...row, '']),
    }));
    setIsSaved(false);
  };

  const handleDeleteSpreadsheetCol = (colIndex: number) => {
    if (spreadsheetData.headers.length <= 1) return;
    setSpreadsheetData((prev) => ({
      headers: prev.headers.filter((_, i) => i !== colIndex),
      rows: prev.rows.map((row) => row.filter((_, i) => i !== colIndex)),
    }));
    setIsSaved(false);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setSpreadsheetData((prev) => {
      const newRows = prev.rows.map((r, ri) => {
        if (ri !== rowIndex) return r;
        const newCols = [...r];
        newCols[colIndex] = value;
        return newCols;
      });
      return { ...prev, rows: newRows };
    });
    setIsSaved(false);
  };

  // Quick statistics for spreadsheet column
  const columnStats = useMemo(() => {
    if (selectedColIndex === null) return null;
    const values = spreadsheetData.rows
      .map((r) => parseFloat(r[selectedColIndex]))
      .filter((n) => !isNaN(n));

    if (values.length === 0) return null;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    return {
      count: values.length,
      sum: sum.toFixed(2),
      avg: avg.toFixed(2),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [selectedColIndex, spreadsheetData]);

  // Word & character stats for Word editor
  const textStats = useMemo(() => {
    const text = docContent.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readMinutes = Math.ceil(words / 200);
    return { words, chars, readMinutes };
  }, [docContent]);

  // ---------------------------------------------------------------------------
  // FORMATTING TOOLBAR HELPERS (WORD-STYLE)
  // ---------------------------------------------------------------------------
  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDocContent(editorRef.current.innerHTML);
      setIsSaved(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050814] text-white animate-in fade-in overflow-hidden">
      {/* -------------------------------------------------------------
          TOP WORKSPACE TOOLBAR
          Clean, modern, uncluttered header with immediate working actions
          ------------------------------------------------------------- */}
      <header className="h-14 px-3 sm:px-5 border-b border-slate-800 bg-[#080E24] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Breadcrumb Hierarchy Path */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
              <span className="text-amber-400 font-bold truncate">{categoryName}</span>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-600" />
              <span className="truncate">{teacher.name}</span>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-600" />
              <span className="text-blue-400 font-semibold">{grade}</span>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-600" />
              <span className="text-emerald-400 font-semibold truncate">{subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {docName || resource.title}
              </h2>
              {isSaved ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
                  <Check className="w-3 h-3" /> Saved
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono font-bold animate-pulse">
                  ● Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Real Storage Quota Indicator */}
          <div
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono cursor-default"
            title={`Storage: ${storageInfo.formattedUsed} used of ${storageInfo.formattedTotal} (${storageInfo.formattedRemaining} free)`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-300 font-bold">{storageInfo.formattedUsed} / 500 MB</span>
                <span className="text-slate-500 font-semibold">{storageInfo.percentUsed}%</span>
              </div>
              <div className="w-24 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    storageInfo.percentUsed > 85 ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${storageInfo.percentUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Save Action */}
          <button
            onClick={() => handleSaveDocument(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Save changes and create version"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition cursor-pointer flex items-center gap-1.5"
            title="Download file to device"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Three-Dot More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs space-y-0.5 animate-in fade-in">
                <button
                  onClick={() => {
                    setShowRenameModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rename Resource</span>
                </button>

                <button
                  onClick={() => {
                    handleSaveAsCopy();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Save As / Create Copy</span>
                </button>

                <label className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer">
                  <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Replace File...</span>
                  <input
                    type="file"
                    onChange={(e) => {
                      handleReplaceFile(e);
                      setShowMoreMenu(false);
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    setShowVersionsModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  <span>Version History ({currentDoc.versions?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoveModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                  <span>Move Location</span>
                </button>

                <button
                  onClick={() => {
                    handlePrint();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print / Export</span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleDeleteResource();
                  }}
                  className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/20 flex items-center gap-2.5 transition font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Resource</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Save Notification Banner */}
      {saveMessage && (
        <div className="bg-emerald-600/90 text-white text-xs px-4 py-1.5 flex items-center justify-between font-bold animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{saveMessage}</span>
          </div>
          <button onClick={() => setSaveMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN WORKSPACE BODY: SPECIALIZED DOCUMENT EDITORS & TOOLS
          ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#030611] overflow-hidden">
        {/* =========================================================
            TOOL 1: WORD-STYLE DOCUMENT EDITOR
            ========================================================= */}
        {fileType === 'document' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Word Formatting Toolbar */}
            <div className="px-3 py-2 border-b border-slate-800 bg-[#080E24] flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                title="Bold (Ctrl+B)"
              >
                <b>B</b>
              </button>
              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white italic cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <i>I</i>
              </button>
              <button
                type="button"
                onClick={() => applyFormat('underline')}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white underline cursor-pointer"
                title="Underline (Ctrl+U)"
              >
                <u>U</u>
              </button>
              <button
                type="button"
                onClick={() => applyFormat('strikeThrough')}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white line-through cursor-pointer"
                title="Strikethrough"
              >
                <s>S</s>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                type="button"
                onClick={() => applyFormat('formatBlock', '<h1>')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => applyFormat('formatBlock', '<h2>')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => applyFormat('formatBlock', '<p>')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Paragraph"
              >
                Text
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                type="button"
                onClick={() => applyFormat('insertUnorderedList')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => applyFormat('insertOrderedList')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Numbered List"
              >
                1. List
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                type="button"
                onClick={() => applyFormat('justifyLeft')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Align Left"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => applyFormat('justifyCenter')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Align Center"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => applyFormat('justifyRight')}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Align Right"
              >
                Right
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                type="button"
                onClick={() => {
                  const now = new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                  applyFormat('insertText', ` [${now}] `);
                }}
                className="px-2 py-1 rounded hover:bg-slate-800 text-amber-400 font-semibold cursor-pointer"
                title="Insert Today's Date"
              >
                + Date
              </button>

              <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                <span>{textStats.words} words</span>
                <span>{textStats.chars} chars</span>
                <span>~{textStats.readMinutes} min read</span>
              </div>
            </div>

            {/* Editable Canvas / Document Paper */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#050814]">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  setDocContent(e.currentTarget.innerHTML);
                  setIsSaved(false);
                }}
                dangerouslySetInnerHTML={{ __html: docContent || '<p>Start typing curriculum notes, schemes, lesson plans, or assessments...</p>' }}
                className="w-full max-w-3xl min-h-[600px] p-6 sm:p-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 shadow-2xl leading-relaxed text-sm sm:text-base font-sans"
              />
            </div>
          </div>
        )}

        {/* =========================================================
            TOOL 2: SPREADSHEET-STYLE DOCUMENT WORKSPACE
            ========================================================= */}
        {fileType === 'spreadsheet' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Spreadsheet Tools Header */}
            <div className="px-3 py-2 border-b border-slate-800 bg-[#080E24] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAddSpreadsheetRow}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Row</span>
                </button>
                <button
                  onClick={handleAddSpreadsheetCol}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Add Column</span>
                </button>
                <button
                  onClick={() => handleDeleteSpreadsheetRow(spreadsheetData.rows.length - 1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  title="Remove Last Row"
                >
                  <Minus className="w-3 h-3" />
                  <span>Row</span>
                </button>
                <button
                  onClick={() => handleDeleteSpreadsheetCol(spreadsheetData.headers.length - 1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  title="Remove Last Column"
                >
                  <Minus className="w-3 h-3" />
                  <span>Col</span>
                </button>
              </div>

              {/* Column Stats Pill (Sum, Avg, Count) */}
              {columnStats && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px]">
                  <span>Col {spreadsheetData.headers[selectedColIndex!]}:</span>
                  <span>Sum: <b>{columnStats.sum}</b></span>
                  <span>Avg: <b>{columnStats.avg}</b></span>
                  <span>Count: <b>{columnStats.count}</b></span>
                </div>
              )}
            </div>

            {/* Editable Spreadsheet Table Grid */}
            <div className="flex-1 overflow-auto p-4 bg-[#030611]">
              <div className="inline-block min-w-full align-middle border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead className="bg-slate-950 font-mono text-slate-400">
                    <tr>
                      <th className="w-12 px-3 py-2 text-center text-slate-600 bg-slate-950/80 border-r border-slate-800">
                        #
                      </th>
                      {spreadsheetData.headers.map((header, colIdx) => (
                        <th
                          key={colIdx}
                          onClick={() => setSelectedColIndex(colIdx)}
                          className={`px-3 py-2 text-left font-bold border-r border-slate-800 transition cursor-pointer ${
                            selectedColIndex === colIdx ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => {
                              const newHeaders = [...spreadsheetData.headers];
                              newHeaders[colIdx] = e.target.value;
                              setSpreadsheetData((prev) => ({ ...prev, headers: newHeaders }));
                              setIsSaved(false);
                            }}
                            className="bg-transparent font-bold text-inherit w-full focus:outline-none"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                    {spreadsheetData.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-800/40 transition">
                        <td className="px-3 py-1.5 text-center text-slate-600 bg-slate-950/40 border-r border-slate-800 text-[10px]">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className={`p-1 border-r border-slate-800/80 ${
                              selectedColIndex === colIdx ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <input
                              type="text"
                              value={cell || ''}
                              onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                              className="w-full px-2 py-1 rounded bg-transparent text-slate-200 focus:bg-slate-950 focus:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TOOL 3: PDF READING AND DOCUMENT TOOLS
            ========================================================= */}
        {fileType === 'pdf' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#050814]">
            {/* PDF Toolbar */}
            <div className="px-3 py-2 border-b border-slate-800 bg-[#080E24] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 font-mono">PDF Viewer: {docName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                  {currentDoc.size || 'CBC Document'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer or Paginated Document Renderer */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center">
              {fileData && fileData.startsWith('data:application/pdf') ? (
                <iframe
                  src={fileData}
                  title={docName}
                  className="w-full max-w-4xl h-full rounded-2xl border border-slate-800 bg-white shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{resource.title}</h3>
                      <p className="text-xs text-slate-400">Official Little Roses Academy PDF Document</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                      PDF Document
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[400px]">
                    {docContent || 'This document is ready for official curriculum archiving.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            TOOL 4: IMAGE VIEWING AND BASIC IMAGE TOOLS
            ========================================================= */}
        {fileType === 'image' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#050814]">
            {/* Image Tools Header */}
            <div className="px-3 py-2 border-b border-slate-800 bg-[#080E24] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImageZoom((prev) => Math.max(0.4, prev - 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-slate-400 w-12 text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  onClick={() => setImageZoom((prev) => Math.min(3, prev + 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setImageZoom(1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                >
                  100%
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1" />

                <button
                  onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer font-bold"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rotate</span>
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1" />

                {/* Filters */}
                <select
                  value={imageFilter}
                  onChange={(e) => setImageFilter(e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="grayscale">Grayscale (B&W)</option>
                  <option value="contrast">High Contrast</option>
                  <option value="sepia">Sepia Vintage</option>
                </select>
              </div>

              <button
                onClick={handleDownload}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Save Image</span>
              </button>
            </div>

            {/* Image Preview Canvas */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[#02050f]">
              {fileData ? (
                <div className="transition-transform duration-200 ease-out">
                  <img
                    src={fileData}
                    alt={docName}
                    style={{
                      transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                      filter:
                        imageFilter === 'grayscale'
                          ? 'grayscale(100%)'
                          : imageFilter === 'contrast'
                          ? 'contrast(160%)'
                          : imageFilter === 'sepia'
                          ? 'sepia(80%)'
                          : 'none',
                    }}
                    className="max-h-[70vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-slate-800"
                  />
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-800 rounded-2xl max-w-sm">
                  <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No image data loaded for this resource.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            TOOL 5: VIDEO UPLOAD AND PLAYBACK
            ========================================================= */}
        {fileType === 'video' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#050814]">
            {/* Video Controls Header */}
            <div className="px-3 py-2 border-b border-slate-800 bg-[#080E24] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 font-mono">Video Player: {docName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                  {currentDoc.size || 'Video Media'}
                </span>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setVideoSpeed(spd);
                      if (videoRef.current) videoRef.current.playbackRate = spd;
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      videoSpeed === spd ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player Canvas */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[#02050f]">
              {fileData ? (
                <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                  <video
                    ref={videoRef}
                    src={fileData}
                    controls
                    className="w-full max-h-[70vh] object-contain"
                  />
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-800 rounded-2xl max-w-sm">
                  <Video className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No video stream or file available for playback.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            TOOL 6: TEXT DOCUMENT CREATION / EDITING
            ========================================================= */}
        {fileType === 'text' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#050814]">
            <div className="px-3 py-2 border-b border-slate-800 bg-[#080E24] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Plain Text Editor • {docContent.length} characters
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(docContent);
                    setSaveMessage('Copied all text to clipboard');
                    setTimeout(() => setSaveMessage(null), 2500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy All</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
              <textarea
                value={docContent}
                onChange={(e) => {
                  setDocContent(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Type or paste plain text curriculum records, raw notes, or syllabus content..."
                className="w-full flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              />
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          MODAL: RENAME RESOURCE
          ------------------------------------------------------------- */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Rename Resource</span>
              </h3>
              <button onClick={() => setShowRenameModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={renameFileName}
                  onChange={(e) => setRenameFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: VERSION HISTORY (PRESERVE ORIGINALS)
          ------------------------------------------------------------- */}
      {showVersionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Version History</h3>
              </div>
              <button onClick={() => setShowVersionsModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Previous versions are preserved automatically whenever you edit or replace resources.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {/* Current Active Version */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Current Active Version
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Now</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px] truncate">{docName}</p>
              </div>

              {/* Historical Versions */}
              {(!currentDoc.versions || currentDoc.versions.length === 0) ? (
                <div className="py-8 text-center text-slate-500 italic text-xs">
                  No previous versions recorded yet. As you edit or replace this file, snapshots are preserved here.
                </div>
              ) : (
                currentDoc.versions.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        Version {ver.version}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ver.timestamp).toLocaleString('en-GB')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[200px]">{ver.name}</span>
                      <span className="font-mono text-[10px]">{ver.size || 'Saved'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] cursor-pointer"
                      >
                        Restore This Version
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowVersionsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: MOVE RESOURCE TO ANOTHER TEACHER / GRADE / SUBJECT
          ------------------------------------------------------------- */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderInput className="w-4 h-4 text-amber-400" />
                <span>Move Resource Location</span>
              </h3>
              <button onClick={() => setShowMoveModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleMoveSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Teacher</label>
                <select
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                >
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Grade</label>
                {targetTeacherAssignments.length > 0 ? (
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {targetTeacherAssignments.map((a) => (
                      <option key={a.grade} value={a.grade}>
                        {a.grade}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Subject</label>
                {targetAvailableSubjects.length > 0 ? (
                  <select
                    value={targetSubject}
                    onChange={(e) => setTargetSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {targetAvailableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={targetSubject}
                    onChange={(e) => setTargetSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE RESOURCE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#080E24] border border-rose-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Permanently Delete Resource?</h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to delete <strong className="text-white">"{resource.title}"</strong>?
                </p>
                <p className="text-[11px] text-rose-400/90 font-medium pt-1">
                  This action cannot be undone. The document file and all historical versions will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dataLayer.deleteResourcePackage(resource.id);
                  onRefresh();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
