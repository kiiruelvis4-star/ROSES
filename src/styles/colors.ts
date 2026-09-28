/**
 * Little Roses Academy - CBC Color System
 * 
 * SPEC RULE 5:
 * "COLOURS: each class, subject and teacher has its own colour.
 * Green, blue, yellow and red are reserved for EE/ME/AE/BE badges only.
 * Bright and friendly, with emojis for parents and learners."
 */

// RESERVED SOLELY FOR CBC PERFORMANCE BANDS
export const CBC_BAND_COLORS = {
  EE: {
    label: 'Exceeding Expectations',
    short: 'EE',
    range: '80 - 100',
    color: '#15803D', // Green-700
    bg: '#DCFCE7',    // Green-100
    border: '#86EFAC',
    text: '#14532D',
    badgeClass: 'bg-emerald-600 text-white font-bold',
  },
  ME: {
    label: 'Meeting Expectations',
    short: 'ME',
    range: '60 - 79',
    color: '#1D4ED8', // Blue-700
    bg: '#DBEAFE',    // Blue-100
    border: '#93C5FD',
    text: '#1E3A8A',
    badgeClass: 'bg-blue-600 text-white font-bold',
  },
  AE: {
    label: 'Approaching Expectations',
    short: 'AE',
    range: '40 - 59',
    color: '#A16207', // Yellow/Amber-700
    bg: '#FEF9C3',    // Yellow-100
    border: '#FDE047',
    text: '#713F12',
    badgeClass: 'bg-amber-500 text-slate-950 font-bold',
  },
  BE: {
    label: 'Below Expectations',
    short: 'BE',
    range: '0 - 39',
    color: '#B91C1C', // Red-700
    bg: '#FEE2E2',    // Red-100
    border: '#FCA5A5',
    text: '#7F1D1D',
    badgeClass: 'bg-rose-600 text-white font-bold',
  },
} as const;

// CLASS COLOURS (Grade 1-6) - avoiding pure green, blue, yellow, red
export const CLASS_COLORS: Record<string, { bg: string; text: string; border: string; accent: string; emoji: string }> = {
  'Grade 1': {
    bg: '#EDE9FE',
    text: '#5B21B6',
    border: '#C4B5FD',
    accent: '#7C3AED', // Violet
    emoji: '🌱',
  },
  'Grade 2': {
    bg: '#CCFBF1',
    text: '#115E59',
    border: '#5EEAD4',
    accent: '#0D9488', // Teal
    emoji: '⭐',
  },
  'Grade 3': {
    bg: '#FFEDD5',
    text: '#9A3412',
    border: '#FDBA74',
    accent: '#EA580C', // Orange
    emoji: '🚀',
  },
  'Grade 4': {
    bg: '#F3E8FF',
    text: '#6B21A8',
    border: '#D8B4FE',
    accent: '#9333EA', // Purple
    emoji: '📚',
  },
  'Grade 5': {
    bg: '#CFFAFE',
    text: '#155E75',
    border: '#67E8F9',
    accent: '#0891B2', // Cyan
    emoji: '🏆',
  },
  'Grade 6': {
    bg: '#FCE7F3',
    text: '#9D174D',
    border: '#F9A8D4',
    accent: '#DB2777', // Pink
    emoji: '🎓',
  },
};

// SUBJECT COLOURS
export const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; accent: string; emoji: string }> = {
  // Lower Primary (Grades 1-3)
  'Mathematical Activities': { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE', accent: '#7C3AED', emoji: '🔢' },
  'English Language Activities': { bg: '#F0FDFA', text: '#115E59', border: '#99F6E4', accent: '#0D9488', emoji: '📖' },
  'Shughuli za Kiswahili': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', accent: '#EA580C', emoji: '🗣️' },
  'Environmental Activities': { bg: '#ECFEFF', text: '#164E63', border: '#A5F3FC', accent: '#0891B2', emoji: '🌍' },
  'CRE': { bg: '#FAF5FF', text: '#581C87', border: '#E9D5FF', accent: '#9333EA', emoji: '🙏' },
  'Creative Activities': { bg: '#FDF2F8', text: '#831843', border: '#FBCFE8', accent: '#DB2777', emoji: '🎨' },

  // Upper Primary (Grades 4-6)
  'Mathematics': { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE', accent: '#7C3AED', emoji: '📐' },
  'English': { bg: '#F0FDFA', text: '#115E59', border: '#99F6E4', accent: '#0D9488', emoji: '📚' },
  'Kiswahili': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', accent: '#EA580C', emoji: '🇰🇪' },
  'Science & Technology': { bg: '#ECFEFF', text: '#164E63', border: '#A5F3FC', accent: '#0891B2', emoji: '🔬' },
  'Agriculture & Nutrition': { bg: '#FEF2F2', text: '#78350F', border: '#FDE68A', accent: '#D97706', emoji: '🌽' },
  'Social Studies': { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', accent: '#64748B', emoji: '🗺️' },
  'Creative Arts & Sports': { bg: '#FDF2F8', text: '#831843', border: '#FBCFE8', accent: '#DB2777', emoji: '⚽' },
};

// TEACHER ASSIGNED PALETTES
const TEACHER_PALETTE = [
  { accent: '#8B5CF6', bg: '#EDE9FE', text: '#5B21B6' },
  { accent: '#14B8A6', bg: '#CCFBF1', text: '#0F766E' },
  { accent: '#F97316', bg: '#FFEDD5', text: '#C2410C' },
  { accent: '#06B6D4', bg: '#CFFAFE', text: '#0E7490' },
  { accent: '#EC4899', bg: '#FCE7F3', text: '#BE185D' },
  { accent: '#6366F1', bg: '#EEF2FF', text: '#4338CA' },
];

export function getTeacherColor(teacherIdOrName: string) {
  let hash = 0;
  for (let i = 0; i < teacherIdOrName.length; i++) {
    hash = teacherIdOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TEACHER_PALETTE.length;
  return TEACHER_PALETTE[index];
}

export function getClassColor(grade: string) {
  return CLASS_COLORS[grade] || {
    bg: '#F1F5F9',
    text: '#334155',
    border: '#CBD5E1',
    accent: '#64748B',
    emoji: '🏫',
  };
}

export function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || {
    bg: '#F1F5F9',
    text: '#334155',
    border: '#CBD5E1',
    accent: '#64748B',
    emoji: '📝',
  };
}

export function getCbcBand(score: number): keyof typeof CBC_BAND_COLORS {
  if (score >= 80) return 'EE';
  if (score >= 60) return 'ME';
  if (score >= 40) return 'AE';
  return 'BE';
}
