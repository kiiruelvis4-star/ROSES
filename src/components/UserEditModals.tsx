import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Lock,
  MapPin,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import {
  dataLayer,
  TeacherAccountRecord,
  PupilRecord,
  ParentAccount,
  normalizePhoneNumber,
  LRA_GRADES,
  LRA_GRADE_SUBJECTS,
  getLraSubjectsForGrade,
  TeacherGradeAssignment,
} from '../services/dataLayer.ts';
import { resizeImageToDataUrl } from '../services/imageUtils.ts';

// -----------------------------------------------------------------------------
// CBC CONSTANTS
// -----------------------------------------------------------------------------
const CBC_GRADES = [
  'PP1',
  'PP2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
];

// =============================================================================
// 1. TEACHER MODAL (ADD & EDIT)
// =============================================================================
interface TeacherModalProps {
  isOpen: boolean;
  teacher: TeacherAccountRecord | null; // null for add, object for edit
  onClose: () => void;
  onSuccess: (teacher: TeacherAccountRecord) => void;
  onDelete?: (id: string) => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  teacher,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const isEdit = !!teacher;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [residence, setResidence] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  // Grade-by-grade subject assignments: { [grade]: string[] }
  const [gradeAssignments, setGradeAssignments] = useState<Record<string, string[]>>({});
  // Track open/expanded grade accordions
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);

  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classTeacherGrade, setClassTeacherGrade] = useState('Grade 4');

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Initialize or reset form on open / change
  useEffect(() => {
    setIsConfirmingDelete(false);
    if (teacher) {
      setName(teacher.name || '');
      setPhone(teacher.phone || '');
      setPassword(teacher.rawPassword || '123456');
      setResidence(teacher.residence || '');
      setPhotoUrl(teacher.photoUrl);
      setIsClassTeacher(!!teacher.isClassTeacher);
      setClassTeacherGrade(teacher.classTeacherGrade || teacher.assignedGrades?.[0] || 'Grade 4');

      // Populate gradeAssignments from teacher's saved data
      const initialMap: Record<string, string[]> = {};
      if (teacher.gradeAssignments && Object.keys(teacher.gradeAssignments).length > 0) {
        Object.entries(teacher.gradeAssignments).forEach(([g, subs]) => {
          if ((LRA_GRADES as readonly string[]).includes(g)) {
            initialMap[g] = [...subs];
          }
        });
      } else if (teacher.gradeSubjectAssignments && teacher.gradeSubjectAssignments.length > 0) {
        teacher.gradeSubjectAssignments.forEach((item) => {
          if ((LRA_GRADES as readonly string[]).includes(item.grade)) {
            initialMap[item.grade] = [...item.subjects];
          }
        });
      } else if (teacher.assignedGrades && teacher.assignedGrades.length > 0) {
        teacher.assignedGrades.forEach((g) => {
          if ((LRA_GRADES as readonly string[]).includes(g)) {
            const valid = LRA_GRADE_SUBJECTS[g] || [];
            const matched = (teacher.subjects || []).filter((s) => valid.includes(s));
            initialMap[g] = matched.length > 0 ? matched : valid.slice(0, 2);
          }
        });
      }
      setGradeAssignments(initialMap);
      setExpandedGrades(Object.keys(initialMap));
    } else {
      setName('');
      setPhone('');
      setPassword('123456');
      setResidence('');
      setPhotoUrl(undefined);
      setIsClassTeacher(false);
      setClassTeacherGrade('Grade 4');
      // For new teacher: start clean so admin explicitly selects grades and subjects
      setGradeAssignments({});
      setExpandedGrades([]);
    }
    setError('');
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  // Real-time phone uniqueness check
  const cleanPhone = normalizePhoneNumber(phone);
  const isPhoneUnique = cleanPhone ? dataLayer.isTeacherPhoneUnique(phone, teacher?.id) : true;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      setError('');
      const dataUrl = await resizeImageToDataUrl(file, 256, 0.85);
      setPhotoUrl(dataUrl);
    } catch {
      setError('Could not process photo. Please choose another image.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleToggleGrade = (grade: string) => {
    setGradeAssignments((prev) => {
      const copy = { ...prev };
      if (copy[grade]) {
        delete copy[grade];
        setExpandedGrades((exp) => exp.filter((g) => g !== grade));
      } else {
        copy[grade] = [];
        setExpandedGrades((exp) => (exp.includes(grade) ? exp : [...exp, grade]));
      }
      return copy;
    });
  };

  const handleToggleSubject = (grade: string, subject: string) => {
    setGradeAssignments((prev) => {
      const current = prev[grade] || [];
      const updated = current.includes(subject)
        ? current.filter((s) => s !== subject)
        : [...current, subject];
      return {
        ...prev,
        [grade]: updated,
      };
    });
  };

  const handleToggleExpandGrade = (grade: string) => {
    setExpandedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleRemoveGrade = (grade: string) => {
    setGradeAssignments((prev) => {
      const copy = { ...prev };
      delete copy[grade];
      return copy;
    });
    setExpandedGrades((exp) => exp.filter((g) => g !== grade));
  };

  const handleRemoveSubject = (grade: string, subject: string) => {
    setGradeAssignments((prev) => ({
      ...prev,
      [grade]: (prev[grade] || []).filter((s) => s !== subject),
    }));
  };

  const selectedGrades = (LRA_GRADES as readonly string[]).filter(
    (g) => g in gradeAssignments
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Teacher full name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Teacher phone number is required.');
      return;
    }
    if (!isPhoneUnique) {
      setError('This phone number is already registered to another teacher.');
      return;
    }
    if (!password.trim()) {
      setError('A password for portal access is required.');
      return;
    }

    if (selectedGrades.length === 0) {
      setError('Please select at least one grade (Grade 1–6) for this teacher.');
      return;
    }

    for (const g of selectedGrades) {
      const subs = gradeAssignments[g] || [];
      if (subs.length === 0) {
        setError(`Please assign at least one subject for ${g}, or remove the grade.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      // Build clean explicit assignments
      const cleanAssignments: Record<string, string[]> = {};
      const gradeSubjectAssignments: TeacherGradeAssignment[] = [];
      const allUniqueSubjects: string[] = [];

      selectedGrades.forEach((g) => {
        const subs = gradeAssignments[g] || [];
        cleanAssignments[g] = subs;
        gradeSubjectAssignments.push({ grade: g, subjects: subs });
        subs.forEach((s) => {
          if (!allUniqueSubjects.includes(s)) {
            allUniqueSubjects.push(s);
          }
        });
      });

      // Determine tier based on assigned grades
      const hasLower = selectedGrades.some((g) => ['Grade 1', 'Grade 2', 'Grade 3'].includes(g));
      const hasUpper = selectedGrades.some((g) => ['Grade 4', 'Grade 5', 'Grade 6'].includes(g));
      const tier: 'lower' | 'upper' | 'all' = hasLower && hasUpper ? 'all' : hasLower ? 'lower' : 'upper';

      const passwordHash = await dataLayer.getTeachers()[0]?.passwordHash || '';

      if (isEdit && teacher) {
        // Edit existing permanent record (do NOT create new person)
        const updates: Partial<TeacherAccountRecord> = {
          name: name.trim(),
          phone: phone.trim(),
          rawPassword: password.trim(),
          residence: residence.trim(),
          photoUrl,
          assignedGrades: selectedGrades,
          subjects: allUniqueSubjects,
          gradeAssignments: cleanAssignments,
          gradeSubjectAssignments,
          tier,
          isClassTeacher,
          classTeacherGrade: isClassTeacher ? classTeacherGrade : undefined,
        };
        dataLayer.updateTeacher(teacher.id, updates);
        await dataLayer.resetTeacherPassword(teacher.id, password.trim());
        const updated = dataLayer.getTeachers().find((t) => t.id === teacher.id)!;
        onSuccess(updated);
      } else {
        // Add new teacher
        const newTeacher: TeacherAccountRecord = {
          id: `t-${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          rawPassword: password.trim(),
          passwordHash,
          residence: residence.trim(),
          photoUrl,
          assignedGrades: selectedGrades,
          subjects: allUniqueSubjects,
          gradeAssignments: cleanAssignments,
          gradeSubjectAssignments,
          tier,
          isClassTeacher,
          classTeacherGrade: isClassTeacher ? classTeacherGrade : undefined,
          isAdminDualRole: false,
          createdAt: new Date().toISOString(),
        };
        dataLayer.saveTeacher(newTeacher);
        await dataLayer.resetTeacherPassword(newTeacher.id, password.trim());
        onSuccess(newTeacher);
      }
      onClose();
    } catch {
      setError('Failed to save teacher details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#080E24] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEdit ? `Edit Teacher: ${teacher.name}` : 'Add New Teacher'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? 'Update teaching profile, credentials, and contact details'
                  : 'Register a new teaching faculty member with portal access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo & Basic Info Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            {/* Profile Photo Upload */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-blue-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name || 'Teacher Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-blue-400">
                    {name ? name.charAt(0).toUpperCase() : '👨‍🏫'}
                  </span>
                )}
              </div>
              <label
                htmlFor="teacher-photo-input"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer transition-transform active:scale-90"
                title="Upload Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="teacher-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-0 right-0 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer text-[10px]"
                  title="Remove Photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Profile Photo (DP)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload teacher photo. This will appear when they sign into the Teachers Portal.
              </p>
              {isUploadingPhoto && (
                <span className="text-[11px] text-cyan-400 font-mono">Processing photo...</span>
              )}
            </div>
          </div>

          {/* Teacher Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tr. Mary Wanjiku"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>
          </div>

          {/* Phone Number & Uniqueness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Unique Mobile Phone Number *
              </label>
              {cleanPhone && (
                <span
                  className={`text-[10px] font-semibold flex items-center gap-1 ${
                    isPhoneUnique ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPhoneUnique ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Phone Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Phone already in use</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0722123456"
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none font-mono ${
                  !isPhoneUnique ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Password & Residence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Staff Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set staff password"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Residence */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Residence / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  placeholder="e.g. Kiamunyi, Nakuru"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TEACHER ASSIGNMENT BY GRADE (EXPLICIT GRADE -> SUBJECT HIERARCHY) */}
          {/* ----------------------------------------------------------------- */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Curriculum Assignments (By Grade)</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subjects must be assigned per grade. Select grades below, then assign their subjects.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                {selectedGrades.length} Grade{selectedGrades.length === 1 ? '' : 's'} Selected
              </span>
            </div>

            {/* 1. Grade Selectors (Grade 1 to Grade 6) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                1. Select Grades (Grade 1 – Grade 6)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {LRA_GRADES.map((g) => {
                  const isSelected = selectedGrades.includes(g);
                  const count = gradeAssignments[g]?.length || 0;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleToggleGrade(g)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{g}</span>
                      {isSelected ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-900/80 text-blue-200 font-mono">
                          {count} subj
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500">+ add</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Subjects by Selected Grade (Accordions) */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                2. Assign Subjects For Each Selected Grade
              </span>

              {selectedGrades.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No grades selected yet. Click one or more grades above (Grade 1–6) to open and assign their subjects.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedGrades.map((g) => {
                    const isOpenGrade = expandedGrades.includes(g);
                    const currentAssigned = gradeAssignments[g] || [];
                    const gradeSubjects = getLraSubjectsForGrade(g);

                    return (
                      <div
                        key={g}
                        className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
                      >
                        {/* Grade Accordion Header */}
                        <div
                          onClick={() => handleToggleExpandGrade(g)}
                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{g}</span>
                            <span className="text-slate-500 text-xs">→</span>
                            {currentAssigned.length > 0 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                {currentAssigned.length} Subject{currentAssigned.length > 1 ? 's' : ''} Assigned
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                ⚠️ No subjects assigned yet
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveGrade(g);
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title={`Remove ${g}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-slate-400">
                              {isOpenGrade ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </div>
                        </div>

                        {/* Grade Accordion Body (Only subjects belonging to this grade) */}
                        {isOpenGrade && (
                          <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Select teaching subjects for <strong>{g}</strong>:</span>
                              {currentAssigned.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGradeAssignments((prev) => ({
                                      ...prev,
                                      [g]: [],
                                    }))
                                  }
                                  className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                                >
                                  Clear {g}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {gradeSubjects.map((subj) => {
                                const isSubjAssigned = currentAssigned.includes(subj);
                                return (
                                  <button
                                    key={subj}
                                    type="button"
                                    onClick={() => handleToggleSubject(g, subj)}
                                    className={`p-2 rounded-lg text-[11px] font-semibold border text-left flex items-center justify-between transition cursor-pointer ${
                                      isSubjAssigned
                                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                                  >
                                    <span className="truncate pr-1">{subj}</span>
                                    {isSubjAssigned ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Plus className="w-3 h-3 text-slate-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active Grade Preview */}
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-blue-400">{g}</span>
                              <span className="text-slate-500">→</span>
                              {currentAssigned.length > 0 ? (
                                currentAssigned.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium flex items-center gap-1"
                                  >
                                    <span>{s}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSubject(g, s)}
                                      className="text-emerald-400 hover:text-rose-400"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-amber-400 italic text-[10px]">
                                  No subjects assigned yet. Click subjects above to assign.
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Explicit Tree Structure Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Explicit Assignment Structure Preview
              </span>
              <div className="font-mono text-xs text-slate-300 space-y-1 pl-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Teacher: {name || '(Name)'}</span>
                </div>
                {selectedGrades.length === 0 ? (
                  <div className="pl-4 text-slate-600 italic">No grades assigned</div>
                ) : (
                  selectedGrades.map((g) => {
                    const subs = gradeAssignments[g] || [];
                    return (
                      <div key={g} className="pl-4 text-[11px] leading-relaxed">
                        <span className="text-blue-400 font-bold">→ {g}</span>
                        <div className="pl-4 text-slate-300">
                          {subs.length > 0 ? (
                            subs.map((s) => (
                              <div key={s} className="text-emerald-300">
                                → {s}
                              </div>
                            ))
                          ) : (
                            <span className="text-amber-400/80 italic">→ (No subjects assigned)</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Class Teacher Toggle */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Class Teacher Appointment</span>
              <span className="text-[11px] text-slate-400 block">
                Assign this teacher as an official homeroom class teacher
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isClassTeacher && (
                <select
                  value={classTeacherGrade}
                  onChange={(e) => setClassTeacherGrade(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {LRA_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="checkbox"
                checked={isClassTeacher}
                onChange={(e) => setIsClassTeacher(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isEdit && onDelete ? (
              !isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-600/50 px-2.5 py-1 rounded-xl animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-bold">Permanently delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(teacher.id);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition cursor-pointer shadow"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !isPhoneUnique}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// 2. LEARNER MODAL (ADD & EDIT WITH SIBLING MATCH WARNING)
// =============================================================================
interface LearnerModalProps {
  isOpen: boolean;
  pupil: PupilRecord | null; // null for add, object for edit
  onClose: () => void;
  onSuccess: (pupil: PupilRecord) => void;
  onDelete?: (id: string) => void;
}

export const LearnerModal: React.FC<LearnerModalProps> = ({
  isOpen,
  pupil,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const isEdit = !!pupil;

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Grade 4');
  const [gender, setGender] = useState<'Boy' | 'Girl'>('Boy');
  const [pupilPhone, setPupilPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [residence, setResidence] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    setIsConfirmingDelete(false);
    if (pupil) {
      setName(pupil.name || '');
      setGrade(pupil.grade || 'Grade 4');
      setGender(pupil.gender || 'Boy');
      setPupilPhone(pupil.phone || '');
      setParentName(pupil.parentName || '');
      setParentPhone(pupil.parentPhone || '');
      setPassword(pupil.rawPassword || pupil.pin || '1234');
      setResidence(pupil.residence || '');
      setPhotoUrl(pupil.photoUrl);
    } else {
      setName('');
      setGrade('Grade 4');
      setGender('Boy');
      setPupilPhone('');
      setParentName('');
      setParentPhone('');
      setPassword('1234');
      setResidence('');
      setPhotoUrl(undefined);
    }
    setError('');
  }, [pupil, isOpen]);

  if (!isOpen) return null;

  const [siblingTick, setSiblingTick] = useState(0);

  // Active pupil record state to react to sibling verifications immediately
  const activePupil = pupil ? dataLayer.getPupils().find((p) => p.id === pupil.id) || pupil : null;

  // Uniqueness check for pupil's own personal phone (if provided)
  const isPupilPhoneUnique = pupilPhone ? dataLayer.isPupilPhoneUnique(pupilPhone, pupil?.id) : true;

  // Sibling Detection:
  // 1. Verified siblings: already confirmed in dataLayer
  const verifiedSiblings = activePupil ? dataLayer.getVerifiedSiblings(activePupil) : [];

  // 2. Possible Sibling Matches (Warning rule: Do NOT automatically link siblings using matching names alone.
  // Show a possible-match warning when parent information appears similar and let Admin verify it.)
  const possibleSiblingMatches = activePupil ? dataLayer.getPossibleSiblingMatches(activePupil) : [];

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      setError('');
      const dataUrl = await resizeImageToDataUrl(file, 256, 0.85);
      setPhotoUrl(dataUrl);
    } catch {
      setError('Could not process photo. Please choose another image.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleVerifySibling = (otherPupilId: string) => {
    if (!pupil) return;
    dataLayer.verifySiblingLink(pupil.id, otherPupilId);
    setSiblingTick((prev) => prev + 1);
  };

  const handleDismissSibling = (otherPupilId: string) => {
    if (!pupil) return;
    dataLayer.dismissSiblingMatch(pupil.id, otherPupilId);
    setSiblingTick((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Learner full name is required.');
      return;
    }
    if (!parentName.trim()) {
      setError('Parent / Guardian name is required.');
      return;
    }
    if (!parentPhone.trim()) {
      setError('Parent / Guardian phone number is required.');
      return;
    }
    if (!password.trim()) {
      setError('A password / PIN is required for the learner to sign into the Learners Portal.');
      return;
    }
    if (!isPupilPhoneUnique) {
      setError('The learner personal phone number is already assigned to another pupil.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit && pupil) {
        // Edit existing permanent record - PRESERVE learner history & UPI intact!
        const updates: Partial<PupilRecord> = {
          name: name.trim(),
          grade,
          gender,
          phone: pupilPhone.trim() || undefined,
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          rawPassword: password.trim(),
          pin: password.trim(),
          residence: residence.trim(),
          photoUrl,
        };
        dataLayer.updatePupil(pupil.id, updates);
        const updated = dataLayer.getPupils().find((p) => p.id === pupil.id)!;
        onSuccess(updated);
      } else {
        // Admit new learner
        const newPupil = dataLayer.admitPupil({
          name: name.trim(),
          gender,
          grade,
          phone: pupilPhone.trim() || undefined,
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          residence: residence.trim(),
          photoUrl,
          rawPassword: password.trim(),
          pin: password.trim(),
          pinHash: '',
          status: 'Active',
        });
        onSuccess(newPupil);
      }
      onClose();
    } catch {
      setError('Failed to save learner details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#080E24] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEdit ? `Edit Learner: ${pupil.name}` : 'Add / Enroll New Learner'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? `UPI: ${pupil.upi} • Permanent institutional admission record`
                  : 'Enroll a new CBC pupil with admission credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo & Basic Info Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            {/* Profile Photo Upload */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-emerald-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name || 'Learner Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-emerald-400">
                    {name ? name.charAt(0).toUpperCase() : '🎒'}
                  </span>
                )}
              </div>
              <label
                htmlFor="learner-photo-input"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer transition-transform active:scale-90"
                title="Upload Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="learner-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-0 right-0 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer text-[10px]"
                  title="Remove Photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Learner Profile Photo (DP)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload student profile photo. This photo will appear when the learner signs into their Learners Portal.
              </p>
              {isUploadingPhoto && (
                <span className="text-[11px] text-cyan-400 font-mono">Processing photo...</span>
              )}
            </div>
          </div>

          {/* Learner Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Learner Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brian Mwangi Kamau"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          {/* Grade, Gender & UPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grade */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Class / Grade *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {CBC_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Gender *
              </label>
              <div className="flex gap-2">
                {(['Boy', 'Girl'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      gender === g
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI (if editing) or Learner Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                {isEdit ? 'Permanent UPI' : 'Student Phone (Optional)'}
              </label>
              {isEdit ? (
                <input
                  type="text"
                  value={pupil.upi}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono font-bold"
                />
              ) : (
                <input
                  type="tel"
                  value={pupilPhone}
                  onChange={(e) => setPupilPhone(e.target.value)}
                  placeholder="Optional learner phone"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono"
                />
              )}
            </div>
          </div>

          {/* Password / PIN & Residence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Learner Portal Password / PIN *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Residence */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Residence / Home Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  placeholder="e.g. Milimani, Nakuru"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Parent / Guardian Information */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Parent / Guardian Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">Parent Name *</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Mr. Elvis Kiiru"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">Parent Phone *</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. 0702080186"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* =========================================================
              SIBLINGS IDENTIFICATION SECTION
              Rule: Learners with the same verified parent/family record
              should be identified as siblings.
              Do NOT automatically link siblings using matching names alone.
              Show a possible-match warning when parent information appears
              similar and let Admin verify it.
              ========================================================= */}
          {/* 1. Verified Siblings */}
          {verifiedSiblings.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Family Siblings ({verifiedSiblings.length})</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Verified Linked
                </span>
              </div>
              <div className="space-y-1">
                {verifiedSiblings.map((sib) => (
                  <div
                    key={sib.id}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {sib.name.charAt(0)}
                      </div>
                      <span className="font-bold text-white">{sib.name}</span>
                      <span className="text-[10px] text-slate-400">({sib.grade})</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{sib.upi}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Possible Sibling Match Warning (Requires Admin Verification) */}
          {possibleSiblingMatches.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Possible Sibling Match Warning ({possibleSiblingMatches.length})</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Parent information appears similar to other enrolled learner(s). Little Roses Academy policy
                requires Admin verification before linking siblings.
              </p>
              <div className="space-y-1.5 pt-1">
                {possibleSiblingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{match.name}</span>
                        <span className="text-[10px] text-slate-400">({match.grade})</span>
                        <span className="text-[10px] font-mono text-amber-400">{match.upi}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Parent on file: <strong className="text-slate-300">{match.parentName}</strong> ({match.parentPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVerifySibling(match.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verify Siblings</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissSibling(match.id)}
                        className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isEdit && onDelete ? (
              !isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-600/50 px-2.5 py-1 rounded-xl animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-bold">Permanently delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(pupil.id);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition cursor-pointer shadow"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Admit Learner'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// 3. PARENT / FAMILY MODAL (ADD & EDIT)
// =============================================================================
interface ParentModalProps {
  isOpen: boolean;
  parent: ParentAccount | null; // null for add, object for edit
  allPupils: PupilRecord[];
  onClose: () => void;
  onSuccess: (parent: ParentAccount) => void;
  onDelete?: (idOrPhone: string) => void;
}

export const ParentModal: React.FC<ParentModalProps> = ({
  isOpen,
  parent,
  allPupils,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const isEdit = !!parent;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [residence, setResidence] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [selectedChildUpis, setSelectedChildUpis] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    if (parent) {
      setName(parent.parentName || parent.name || '');
      setPhone(parent.parentPhone || parent.phone || '');
      setPassword(parent.rawPassword || '123456');
      setResidence(parent.residence || '');
      setPhotoUrl(parent.photoUrl);
      setSelectedChildUpis(parent.linkedChildrenUpi || parent.pupilUpiList || []);
    } else {
      setName('');
      setPhone('');
      setPassword('123456');
      setResidence('');
      setPhotoUrl(undefined);
      setSelectedChildUpis([]);
    }
    setError('');
  }, [parent, isOpen]);

  if (!isOpen) return null;

  // Uniqueness check for parent phone
  const cleanPhone = normalizePhoneNumber(phone);
  const isPhoneUnique = cleanPhone ? dataLayer.isParentPhoneUnique(phone, parent?.id) : true;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      setError('');
      const dataUrl = await resizeImageToDataUrl(file, 256, 0.85);
      setPhotoUrl(dataUrl);
    } catch {
      setError('Could not process photo. Please choose another image.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleToggleChild = (upi: string) => {
    setSelectedChildUpis((prev) =>
      prev.includes(upi) ? prev.filter((u) => u !== upi) : [...prev, upi]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Parent / Guardian full name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Parent phone number is required.');
      return;
    }
    if (!isPhoneUnique) {
      setError('This phone number is already registered to another parent account.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required for Parents Portal access.');
      return;
    }

    setIsSaving(true);
    try {
      const savedParentId = isEdit && parent ? parent.id : `parent-${cleanPhone || Date.now()}`;

      if (isEdit && parent) {
        // Edit existing permanent parent record
        const updates: Partial<ParentAccount> = {
          parentName: name.trim(),
          name: name.trim(),
          parentPhone: phone.trim(),
          phone: phone.trim(),
          rawPassword: password.trim(),
          residence: residence.trim(),
          photoUrl,
          linkedChildrenUpi: selectedChildUpis,
          pupilUpiList: selectedChildUpis,
        };
        dataLayer.updateParent(parent.id, updates);
        await dataLayer.resetParentPassword(phone.trim(), password.trim());
        const updated = dataLayer.getParents().find((p) => p.id === parent.id)!;
        onSuccess(updated);
      } else {
        // Add new parent
        const newParent: ParentAccount = {
          id: savedParentId,
          parentName: name.trim(),
          name: name.trim(),
          parentPhone: phone.trim(),
          phone: phone.trim(),
          rawPassword: password.trim(),
          passwordHash: '',
          residence: residence.trim(),
          photoUrl,
          linkedChildrenUpi: selectedChildUpis,
          pupilUpiList: selectedChildUpis,
          createdAt: new Date().toISOString(),
        };
        dataLayer.saveParent(newParent);
        await dataLayer.resetParentPassword(phone.trim(), password.trim());
        onSuccess(newParent);
      }

      // Synchronize linked children pupils
      selectedChildUpis.forEach((childUpi) => {
        const pup = allPupils.find((p) => p.upi === childUpi);
        if (pup) {
          dataLayer.updatePupil(pup.id, {
            parentName: name.trim(),
            parentPhone: phone.trim(),
            parentAccountId: savedParentId,
            siblingGroupConfirmed: true,
          });
        }
      });
      onClose();
    } catch {
      setError('Failed to save parent details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#080E24] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEdit ? `Edit Family: ${parent.parentName || parent.name}` : 'Add Parent / Family Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? 'Update parent contact, login password, and linked learners'
                  : 'Register a new family household with Parents Portal credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo & DP Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-purple-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name || 'Parent Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-purple-400">
                    {name ? name.charAt(0).toUpperCase() : '👨‍👩‍👧'}
                  </span>
                )}
              </div>
              <label
                htmlFor="parent-photo-input"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer transition-transform active:scale-90"
                title="Upload Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="parent-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-0 right-0 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer text-[10px]"
                  title="Remove Photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Parent Profile Photo (DP)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload parent photo. This will appear when they sign into the Parents Portal.
              </p>
              {isUploadingPhoto && (
                <span className="text-[11px] text-cyan-400 font-mono">Processing photo...</span>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Parent / Guardian Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mr. Elvis Kiiru"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                required
              />
            </div>
          </div>

          {/* Phone & Uniqueness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Unique Parent Mobile Phone Number *
              </label>
              {cleanPhone && (
                <span
                  className={`text-[10px] font-semibold flex items-center gap-1 ${
                    isPhoneUnique ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPhoneUnique ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Phone Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Phone already in use</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0702080186"
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none font-mono ${
                  !isPhoneUnique ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-purple-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Password & Residence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Parents Portal Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set parent password"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Residence */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Residence / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  placeholder="e.g. Milimani, Nakuru"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Linked Enrolled Children (Siblings) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Linked Enrolled Children (Siblings in School)
              </label>
              <span className="text-[10px] text-purple-400 font-mono font-bold">
                {selectedChildUpis.length} Linked
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {allPupils.map((p) => {
                const isSelected = selectedChildUpis.includes(p.upi);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleToggleChild(p.upi)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="font-bold block truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.grade} • UPI: {p.upi}</span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                        isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isEdit && onDelete ? (
              !isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-600/50 px-2.5 py-1 rounded-xl animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-bold">Permanently delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(parent.id || parent.parentPhone || parent.phone);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition cursor-pointer shadow"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !isPhoneUnique}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Family'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
