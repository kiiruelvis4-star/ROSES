/**
 * Web Share API Helper Utility
 * Enables teachers to seamlessly share CBC lesson plans, student progress reports,
 * and curriculum documents with parents via native OS sharing (WhatsApp, Messages,
 * Gmail, AirDrop, Nearby Share, Telegram, etc.) with graceful fallbacks.
 */

export interface ShareDataPayload {
  title: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'whatsapp' | 'sms' | 'file';
  cancelled?: boolean;
  error?: string;
}

export interface PupilReportInfo {
  name: string;
  upi: string;
  grade: string;
  gender?: 'Boy' | 'Girl';
  parentName?: string;
  parentRelation?: string;
  parentPhone?: string;
  recentAttainment?: 'EE' | 'ME' | 'AE' | 'BE' | string;
  recentTopic?: string;
  focusZoneNotes?: string;
  subjects?: Array<{
    subject: string;
    cat: number;
    asg: number;
    total: number;
    band: string;
  }>;
  term?: string;
  academicYear?: string;
}

export type PupilShareData = PupilReportInfo;

export interface LessonPlanInfo {
  id?: string;
  subject: string;
  grade: string;
  time?: string;
  duration?: string;
  room?: string;
  topic: string;
  strand?: string;
  subStrand?: string;
  learningOutcomes?: string;
  learningActivities?: string;
  resources?: string;
  homeworkSheet?: {
    title: string;
    description: string;
    dueDate: string;
  };
  teacherName?: string;
}

export type LessonPlanShareData = LessonPlanInfo;

/**
 * Check if the browser environment supports the Web Share API
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Check if the browser can share specific data (including files)
 */
export function canSharePayload(data: ShareDataPayload): boolean {
  if (!isWebShareSupported()) return false;
  if (typeof navigator.canShare === 'function') {
    try {
      return navigator.canShare(data);
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Normalize a phone number to standard international WhatsApp format for Kenya (254...)
 */
export function normalizePhoneForWhatsApp(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith('7') && digits.length === 9) {
    return `254${digits}`;
  }
  return digits;
}

/**
 * Build a direct WhatsApp message URL
 */
export function getWhatsAppShareUrl(phone?: string, text?: string): string {
  const cleanPhone = normalizePhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text || '');
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Open WhatsApp with pre-filled text
 */
export function openWhatsAppShare(phone?: string, text?: string): void {
  const url = getWhatsAppShareUrl(phone, text);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Build a direct SMS URI
 */
export function getSmsShareUrl(phone?: string, text?: string): string {
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  const encodedText = encodeURIComponent(text || '');
  return `sms:${cleanPhone}?body=${encodedText}`;
}

/**
 * Open SMS client
 */
export function openSMSShare(phone?: string, text?: string): void {
  const url = getSmsShareUrl(phone, text);
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Copy text to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Format a CBC Pupil Progress Report into clean text ready for native sharing / WhatsApp
 */
export function formatStudentProgressReportText(
  pupil: PupilReportInfo,
  teacherName?: string
): string {
  const dateStr = new Date().toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subjectsList = pupil.subjects && pupil.subjects.length > 0
    ? pupil.subjects
        .map(
          (s) =>
            `  • ${s.subject}: CAT ${s.cat}/60 | Asg ${s.asg}/40 => ${s.total}% [${s.band}]`
        )
        .join('\n')
    : `  • Recent Topic: ${pupil.recentTopic || 'General CBC Learning Areas'}
  • Continuous Attainment: [${pupil.recentAttainment || 'ME'}]`;

  const attainmentDesc =
    pupil.recentAttainment === 'EE'
      ? 'Exceeding Expectations (80-100%)'
      : pupil.recentAttainment === 'ME'
      ? 'Meeting Expectations (60-79%)'
      : pupil.recentAttainment === 'AE'
      ? 'Approaching Expectations (40-59%)'
      : pupil.recentAttainment === 'BE'
      ? 'Below Expectations (0-39% - Focus Zone support in progress)'
      : 'Meeting Expectations';

  const teacherRemark = pupil.focusZoneNotes
    ? `\n📝 Teacher Qualitative Observation:\n"${pupil.focusZoneNotes}"`
    : `\n📝 Teacher Remark:\n"Consistent effort and commendable CBC classroom participation."`;

  return `🏫 LITTLE ROSES ACADEMY - NAKURU
📋 CBC LEARNER PROGRESS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Pupil: ${pupil.name}
🔢 UPI: ${pupil.upi}
📚 Grade: ${pupil.grade} | ${pupil.term || 'Term 1, 2026'}
📅 Issued: ${dateStr}

📊 CBC ATTAINMENT SUMMARY:
Rating: ${pupil.recentAttainment || 'ME'} - ${attainmentDesc}

📈 LEARNING AREA BREAKDOWN:
${subjectsList}
${teacherRemark}

👨‍👩‍👧 Parent/Guardian: ${pupil.parentName || 'Parent'} (${pupil.parentRelation || 'Guardian'})
📞 Contact: ${pupil.parentPhone || 'On File'}
👨‍🏫 Prepared by: ${teacherName || 'Class Teacher'}

📌 CBC Assessment Model: Formative Assignments (40%) + Summative CATs (60%) = 100%
Official Certified Record • Little Roses Academy, Nakuru, Kenya
━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
}

/**
 * Format a CBC Lesson Plan into an informative message for parents and learners
 */
export function formatLessonPlanShareText(
  lesson: LessonPlanInfo,
  teacherName?: string
): string {
  const dateStr = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const homework = lesson.homeworkSheet
    ? `✍️ DAY'S HOMEWORK ASSIGNMENT:
📌 Task: ${lesson.homeworkSheet.title}
📝 Instructions: ${lesson.homeworkSheet.description}
⏰ Due Date: ${lesson.homeworkSheet.dueDate}`
    : '✍️ HOMEWORK: Complete guided exercises in learner workbooks.';

  return `🏫 LITTLE ROSES ACADEMY - NAKURU
📝 CBC LESSON PLAN & HOME BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Learning Area: ${lesson.subject}
🎓 Class: ${lesson.grade} ${lesson.room ? `• ${lesson.room}` : ''}
⏰ Schedule: ${lesson.time || 'Period'} (${lesson.duration || '50 mins'})
📅 Date: ${dateStr}
👨‍🏫 Teacher: ${teacherName || lesson.teacherName || 'Subject Teacher'}

🎯 TOPIC & STRAND:
• Topic: ${lesson.topic}
${lesson.strand ? `• Strand: ${lesson.strand}\n` : ''}${lesson.subStrand ? `• Sub-Strand: ${lesson.subStrand}\n` : ''}
💡 LEARNING OUTCOMES & ACTIVITIES:
${lesson.learningOutcomes || '• Develop foundational CBC competencies and critical thinking.\n• Participate actively in hands-on group tasks and discussions.'}

${homework}

🤝 Parent Tip: Please check your child's exercise workbook and encourage them to review today's concept.
Official School Notice • Little Roses Academy
━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
}

/**
 * Core function to share content via native OS Web Share API, with automatic fallback
 */
export async function shareViaWebShareOrFallback(options: {
  title: string;
  text: string;
  url?: string;
  fileName?: string;
  recipientPhone?: string;
}): Promise<ShareResult> {
  const { title, text, url, fileName, recipientPhone } = options;

  // 1. Try Native Web Share API
  if (isWebShareSupported()) {
    try {
      // Build basic share payload
      const shareData: ShareDataPayload = {
        title,
        text,
        url: url || (typeof window !== 'undefined' ? window.location.href : undefined)
      };

      // Check if file sharing is supported
      if (fileName && typeof File !== 'undefined') {
        try {
          const file = new File([text], fileName, { type: 'text/plain;charset=utf-8' });
          if (canSharePayload({ ...shareData, files: [file] })) {
            shareData.files = [file];
          }
        } catch {
          // File creation failed, proceed with text-only share
        }
      }

      await navigator.share(shareData as ShareData);
      return { success: true, method: 'native' };
    } catch (err: any) {
      // If user cancelled the native share sheet, return cancelled without error
      if (err && (err.name === 'AbortError' || err.message?.includes('abort') || err.message?.includes('canceled'))) {
        return { success: false, method: 'native', cancelled: true };
      }
      // If share failed for other reasons, fall through to fallback
      console.warn('Native share failed, falling back:', err);
    }
  }

  // 2. Fallback: If recipient phone is provided, open WhatsApp
  if (recipientPhone) {
    const waUrl = getWhatsAppShareUrl(recipientPhone, text);
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return { success: true, method: 'whatsapp' };
    } catch {
      // If popup blocked, continue to clipboard
    }
  }

  // 3. Fallback: Copy to clipboard
  const copied = await copyToClipboard(text);
  if (copied) {
    return { success: true, method: 'clipboard' };
  }

  return {
    success: false,
    method: 'clipboard',
    error: 'Sharing could not be completed on this device.'
  };
}

export const shareViaWebShare = shareViaWebShareOrFallback;

/**
 * High-level helper: Share student progress report with parent
 */
export async function shareStudentProgressReport(
  pupil: PupilReportInfo,
  teacherName?: string
): Promise<ShareResult> {
  const text = formatStudentProgressReportText(pupil, teacherName);
  const title = `CBC Progress Report - ${pupil.name} (${pupil.upi})`;
  const fileName = `CBC_Report_${pupil.upi.replace(/\s+/g, '_')}.txt`;

  return shareViaWebShareOrFallback({
    title,
    text,
    fileName,
    recipientPhone: pupil.parentPhone
  });
}

/**
 * High-level helper: Share lesson plan with parents / learners
 */
export async function shareLessonPlanWithParents(
  lesson: LessonPlanInfo,
  teacherName?: string,
  recipientPhone?: string
): Promise<ShareResult> {
  const text = formatLessonPlanShareText(lesson, teacherName);
  const title = `Lesson Plan - ${lesson.subject} (${lesson.grade})`;
  const fileName = `Lesson_Plan_${lesson.subject.replace(/\s+/g, '_')}_${lesson.grade.replace(/\s+/g, '_')}.txt`;

  return shareViaWebShareOrFallback({
    title,
    text,
    fileName,
    recipientPhone
  });
}

export const shareLessonPlan = shareLessonPlanWithParents;

/**
 * High-level helper: Share any resource document
 */
export async function shareCurriculumDocument(doc: {
  title: string;
  category?: string;
  grade?: string;
  subject?: string;
  fileName?: string;
  content?: string;
}): Promise<ShareResult> {
  const header = `🏫 LITTLE ROSES ACADEMY\n📁 CURRICULUM RESOURCE: ${doc.title}\nGrade: ${doc.grade || 'Primary'} • Subject: ${doc.subject || 'CBC'}\nCategory: ${doc.category || 'Curriculum'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  const text = `${header}${doc.content || 'Official school curriculum material.'}`;
  const title = doc.title;
  const fileName = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.txt`;

  return shareViaWebShareOrFallback({
    title,
    text,
    fileName
  });
}
