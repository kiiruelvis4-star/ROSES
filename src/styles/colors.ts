/**
 * Little Roses Academy - CBC Colour System
 * Reserved colours:
 * EE (Exceeding Expectations): Emerald Green
 * ME (Meeting Expectations): Blue
 * AE (Approaching Expectations): Amber/Yellow
 * BE (Below Expectations): Rose/Red
 */

export const CBC_BAND_COLORS = {
  EE: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    solid: 'bg-emerald-600 text-white',
    label: 'Exceeding Expectations (EE)',
    range: '80% – 100%',
  },
  ME: {
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    solid: 'bg-blue-600 text-white',
    label: 'Meeting Expectations (ME)',
    range: '60% – 79%',
  },
  AE: {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    solid: 'bg-amber-500 text-slate-950',
    label: 'Approaching Expectations (AE)',
    range: '40% – 59%',
  },
  BE: {
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    solid: 'bg-rose-600 text-white',
    label: 'Below Expectations (BE)',
    range: '0% – 39%',
  },
} as const;

export const CLASS_COLORS: Record<string, string> = {
  'Grade 1': 'from-blue-600 to-indigo-700',
  'Grade 2': 'from-emerald-600 to-teal-700',
  'Grade 3': 'from-amber-600 to-orange-700',
  'Grade 4': 'from-purple-600 to-pink-700',
  'Grade 5': 'from-cyan-600 to-blue-700',
  'Grade 6': 'from-rose-600 to-red-700',
};

export const SUBJECT_COLORS: Record<string, string> = {
  'Mathematical Activities': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Mathematics': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'MATHS': 'text-blue-400 bg-blue-500/15 border-blue-500/40',
  'English Language Activities': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'English': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'ENG': 'text-purple-400 bg-purple-500/15 border-purple-500/40',
  'Shughuli za Kiswahili': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Kiswahili': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'KISW': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40',
  'Environmental Activities': 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  'Science & Technology': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'SCIE': 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40',
  'Agriculture & Nutrition': 'text-lime-400 bg-lime-500/10 border-lime-500/30',
  'AGRIC': 'text-lime-400 bg-lime-500/15 border-lime-500/40',
  'Social Studies': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'S/ST': 'text-orange-400 bg-orange-500/15 border-orange-500/40',
  'CRE': 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  'RE': 'text-sky-400 bg-sky-500/15 border-sky-500/40',
  'Creative Activities': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  'Creative Arts & Sports': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'C/A': 'text-rose-400 bg-rose-500/15 border-rose-500/40',
  'PHE': 'text-indigo-400 bg-indigo-500/15 border-indigo-500/40',
  'Physical Health Education': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'H/SCI': 'text-rose-400 bg-rose-500/20 border-rose-500/50',
  'Home Science': 'text-rose-400 bg-rose-500/15 border-rose-500/40',
  'IND/L': 'text-amber-400 bg-amber-500/15 border-amber-500/40',
  'Indigenous Language': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'PPI': 'text-violet-400 bg-violet-500/15 border-violet-500/40',
  'GAMES': 'text-teal-400 bg-teal-500/15 border-teal-500/40',
  'CLUBS': 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/40',
};

export function getSubjectCardColor(subject: string): {
  bgClass: string;
  badgeClass: string;
  textClass: string;
  borderClass: string;
  shortCode: string;
} {
  const s = (subject || '').trim().toLowerCase();
  if (s.includes('math')) {
    return {
      bgClass: 'bg-blue-950/40 hover:bg-blue-900/50',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      textClass: 'text-blue-300',
      borderClass: 'border-blue-500/30',
      shortCode: 'MATHS',
    };
  }
  if (s.includes('eng')) {
    return {
      bgClass: 'bg-purple-950/40 hover:bg-purple-900/50',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      textClass: 'text-purple-300',
      borderClass: 'border-purple-500/30',
      shortCode: 'ENG',
    };
  }
  if (s.includes('kisw') || s.includes('shughuli')) {
    return {
      bgClass: 'bg-emerald-950/40 hover:bg-emerald-900/50',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textClass: 'text-emerald-300',
      borderClass: 'border-emerald-500/30',
      shortCode: 'KISW',
    };
  }
  if (s.includes('scie') || s.includes('science')) {
    return {
      bgClass: 'bg-cyan-950/40 hover:bg-cyan-900/50',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      textClass: 'text-cyan-300',
      borderClass: 'border-cyan-500/30',
      shortCode: 'SCIE',
    };
  }
  if (s.includes('agric')) {
    return {
      bgClass: 'bg-lime-950/40 hover:bg-lime-900/50',
      badgeClass: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
      textClass: 'text-lime-300',
      borderClass: 'border-lime-500/30',
      shortCode: 'AGRIC',
    };
  }
  if (s.includes('social') || s.includes('s/st') || s.includes('sst')) {
    return {
      bgClass: 'bg-orange-950/40 hover:bg-orange-900/50',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      textClass: 'text-orange-300',
      borderClass: 'border-orange-500/30',
      shortCode: 'S/ST',
    };
  }
  if (s.includes('cre') || s.includes('ire') || s.includes('re') || s.includes('relig')) {
    return {
      bgClass: 'bg-sky-950/40 hover:bg-sky-900/50',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      textClass: 'text-sky-300',
      borderClass: 'border-sky-500/30',
      shortCode: 'RE',
    };
  }
  if (s.includes('home') || s.includes('h/sci') || s.includes('hsci')) {
    return {
      bgClass: 'bg-rose-950/40 hover:bg-rose-900/50',
      badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
      textClass: 'text-rose-300',
      borderClass: 'border-rose-500/40',
      shortCode: 'H/SCI',
    };
  }
  if (s.includes('phe') || s.includes('phys')) {
    return {
      bgClass: 'bg-indigo-950/40 hover:bg-indigo-900/50',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      textClass: 'text-indigo-300',
      borderClass: 'border-indigo-500/30',
      shortCode: 'PHE',
    };
  }
  if (s.includes('art') || s.includes('c/a') || s.includes('creative')) {
    return {
      bgClass: 'bg-pink-950/40 hover:bg-pink-900/50',
      badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      textClass: 'text-pink-300',
      borderClass: 'border-pink-500/30',
      shortCode: 'C/A',
    };
  }
  if (s.includes('ind/l') || s.includes('indigenous')) {
    return {
      bgClass: 'bg-amber-950/40 hover:bg-amber-900/50',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textClass: 'text-amber-300',
      borderClass: 'border-amber-500/30',
      shortCode: 'IND/L',
    };
  }
  if (s.includes('ppi')) {
    return {
      bgClass: 'bg-violet-950/40 hover:bg-violet-900/50',
      badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      textClass: 'text-violet-300',
      borderClass: 'border-violet-500/30',
      shortCode: 'PPI',
    };
  }
  if (s.includes('game') || s.includes('club') || s.includes('activity')) {
    return {
      bgClass: 'bg-teal-950/40 hover:bg-teal-900/50',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      textClass: 'text-teal-300',
      borderClass: 'border-teal-500/30',
      shortCode: 'GAMES',
    };
  }
  return {
    bgClass: 'bg-slate-900 hover:bg-slate-800',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    textClass: 'text-slate-200',
    borderClass: 'border-slate-800',
    shortCode: subject.slice(0, 5).toUpperCase(),
  };
}

// -----------------------------------------------------------------------------
// SMART TIMETABLE SUBJECT THEMING (UNIQUE, VIBRANT & READABLE)
// -----------------------------------------------------------------------------
export interface TimetableSubjectTheme {
  name: string;
  shortCode: string;
  icon: string;
  bgGradient: string;
  accentColor: string;
  accentBarClass: string;
  borderClass: string;
  badgeClass: string;
  textClass: string;
  subTextClass: string;
  tagClass: string;
}

export function getTimetableSubjectTheme(
  subject?: string,
  isBreak?: boolean,
  breakLabel?: string
): TimetableSubjectTheme {
  if (isBreak) {
    const bLower = (breakLabel || '').toLowerCase();
    if (bLower.includes('lunch')) {
      return {
        name: breakLabel || 'Lunch Break',
        shortCode: 'LUNCH',
        icon: '🍲',
        bgGradient: 'from-orange-950/40 via-amber-950/30 to-slate-900/60',
        accentColor: '#ea580c',
        accentBarClass: 'bg-orange-500',
        borderClass: 'border-orange-500/40 hover:border-orange-400',
        badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        textClass: 'text-orange-200',
        subTextClass: 'text-orange-300/80',
        tagClass: 'bg-orange-500/20 text-orange-300',
      };
    }
    return {
      name: breakLabel || 'School Break',
      shortCode: 'BREAK',
      icon: '☕',
      bgGradient: 'from-amber-950/40 via-yellow-950/30 to-slate-900/60',
      accentColor: '#f59e0b',
      accentBarClass: 'bg-amber-400',
      borderClass: 'border-amber-500/40 hover:border-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      textClass: 'text-amber-200',
      subTextClass: 'text-amber-300/80',
      tagClass: 'bg-amber-500/20 text-amber-300',
    };
  }

  const s = (subject || '').trim().toLowerCase();

  // Mathematics
  if (s.includes('math')) {
    return {
      name: subject || 'Mathematics',
      shortCode: 'MATH',
      icon: '📐',
      bgGradient: 'from-cyan-950/50 via-slate-900/80 to-blue-950/40',
      accentColor: '#06b6d4',
      accentBarClass: 'bg-cyan-400',
      borderClass: 'border-cyan-500/40 hover:border-cyan-400',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      textClass: 'text-cyan-200',
      subTextClass: 'text-cyan-400',
      tagClass: 'bg-cyan-500/20 text-cyan-300',
    };
  }

  // English
  if (s.includes('eng')) {
    return {
      name: subject || 'English Language',
      shortCode: 'ENG',
      icon: '📖',
      bgGradient: 'from-indigo-950/50 via-slate-900/80 to-purple-950/40',
      accentColor: '#6366f1',
      accentBarClass: 'bg-indigo-400',
      borderClass: 'border-indigo-500/40 hover:border-indigo-400',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      textClass: 'text-indigo-200',
      subTextClass: 'text-indigo-400',
      tagClass: 'bg-indigo-500/20 text-indigo-300',
    };
  }

  // Kiswahili
  if (s.includes('kisw') || s.includes('shughuli za kiswahili')) {
    return {
      name: subject || 'Kiswahili Lugha',
      shortCode: 'KISW',
      icon: '🗣️',
      bgGradient: 'from-amber-950/50 via-slate-900/80 to-orange-950/40',
      accentColor: '#f59e0b',
      accentBarClass: 'bg-amber-400',
      borderClass: 'border-amber-500/40 hover:border-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textClass: 'text-amber-200',
      subTextClass: 'text-amber-400',
      tagClass: 'bg-amber-500/20 text-amber-300',
    };
  }

  // Science & Technology / Environmental Activities
  if (s.includes('scie') || s.includes('environ')) {
    return {
      name: subject || 'Science & Technology',
      shortCode: 'SCIE',
      icon: '🔬',
      bgGradient: 'from-emerald-950/50 via-slate-900/80 to-teal-950/40',
      accentColor: '#10b981',
      accentBarClass: 'bg-emerald-400',
      borderClass: 'border-emerald-500/40 hover:border-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textClass: 'text-emerald-200',
      subTextClass: 'text-emerald-400',
      tagClass: 'bg-emerald-500/20 text-emerald-300',
    };
  }

  // Agriculture and Nutrition
  if (s.includes('agric')) {
    return {
      name: subject || 'Agriculture & Nutrition',
      shortCode: 'AGRIC',
      icon: '🌱',
      bgGradient: 'from-lime-950/50 via-slate-900/80 to-emerald-950/40',
      accentColor: '#84cc16',
      accentBarClass: 'bg-lime-400',
      borderClass: 'border-lime-500/40 hover:border-lime-400',
      badgeClass: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
      textClass: 'text-lime-200',
      subTextClass: 'text-lime-400',
      tagClass: 'bg-lime-500/20 text-lime-300',
    };
  }

  // Social Studies
  if (s.includes('social') || s.includes('s/st') || s.includes('sst')) {
    return {
      name: subject || 'Social Studies',
      shortCode: 'S/ST',
      icon: '🌍',
      bgGradient: 'from-purple-950/50 via-slate-900/80 to-violet-950/40',
      accentColor: '#a855f7',
      accentBarClass: 'bg-purple-400',
      borderClass: 'border-purple-500/40 hover:border-purple-400',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      textClass: 'text-purple-200',
      subTextClass: 'text-purple-400',
      tagClass: 'bg-purple-500/20 text-purple-300',
    };
  }

  // Religious Education (CRE / IRE)
  if (s.includes('cre') || s.includes('ire') || s.includes('relig') || s.includes('re')) {
    return {
      name: subject || 'Religious Education',
      shortCode: 'CRE',
      icon: '🕊️',
      bgGradient: 'from-rose-950/50 via-slate-900/80 to-red-950/40',
      accentColor: '#f43f5e',
      accentBarClass: 'bg-rose-400',
      borderClass: 'border-rose-500/40 hover:border-rose-400',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      textClass: 'text-rose-200',
      subTextClass: 'text-rose-400',
      tagClass: 'bg-rose-500/20 text-rose-300',
    };
  }

  // Home Science
  if (s.includes('home') || s.includes('h/sci') || s.includes('hsci')) {
    return {
      name: subject || 'Home Science',
      shortCode: 'H/SCI',
      icon: '🏡',
      bgGradient: 'from-orange-950/50 via-slate-900/80 to-rose-950/40',
      accentColor: '#f97316',
      accentBarClass: 'bg-orange-400',
      borderClass: 'border-orange-500/40 hover:border-orange-400',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      textClass: 'text-orange-200',
      subTextClass: 'text-orange-400',
      tagClass: 'bg-orange-500/20 text-orange-300',
    };
  }

  // Creative Arts & Sports / Music / Art
  if (s.includes('art') || s.includes('creative') || s.includes('c/a') || s.includes('music')) {
    return {
      name: subject || 'Creative Arts & Sports',
      shortCode: 'C/A',
      icon: '🎨',
      bgGradient: 'from-fuchsia-950/50 via-slate-900/80 to-pink-950/40',
      accentColor: '#d946ef',
      accentBarClass: 'bg-fuchsia-400',
      borderClass: 'border-fuchsia-500/40 hover:border-fuchsia-400',
      badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
      textClass: 'text-fuchsia-200',
      subTextClass: 'text-fuchsia-400',
      tagClass: 'bg-fuchsia-500/20 text-fuchsia-300',
    };
  }

  // Physical Health Education (PHE)
  if (s.includes('phe') || s.includes('phys') || s.includes('pe')) {
    return {
      name: subject || 'Physical Health Education',
      shortCode: 'PHE',
      icon: '⚽',
      bgGradient: 'from-teal-950/50 via-slate-900/80 to-cyan-950/40',
      accentColor: '#14b8a6',
      accentBarClass: 'bg-teal-400',
      borderClass: 'border-teal-500/40 hover:border-teal-400',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      textClass: 'text-teal-200',
      subTextClass: 'text-teal-400',
      tagClass: 'bg-teal-500/20 text-teal-300',
    };
  }

  // Indigenous Language Activities
  if (s.includes('ind/l') || s.includes('indigenous') || s.includes('mother tongue')) {
    return {
      name: subject || 'Indigenous Language',
      shortCode: 'IND/L',
      icon: '📜',
      bgGradient: 'from-yellow-950/50 via-slate-900/80 to-amber-950/40',
      accentColor: '#eab308',
      accentBarClass: 'bg-yellow-400',
      borderClass: 'border-yellow-500/40 hover:border-yellow-400',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      textClass: 'text-yellow-200',
      subTextClass: 'text-yellow-400',
      tagClass: 'bg-yellow-500/20 text-yellow-300',
    };
  }

  // Pastoral Programme of Instruction (PPI)
  if (s.includes('ppi') || s.includes('pastoral') || s.includes('devotion') || s.includes('assembly')) {
    return {
      name: subject || 'Pastoral Programme (PPI)',
      shortCode: 'PPI',
      icon: '⛪',
      bgGradient: 'from-sky-950/50 via-slate-900/80 to-blue-950/40',
      accentColor: '#38bdf8',
      accentBarClass: 'bg-sky-400',
      borderClass: 'border-sky-500/40 hover:border-sky-400',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      textClass: 'text-sky-200',
      subTextClass: 'text-sky-400',
      tagClass: 'bg-sky-500/20 text-sky-300',
    };
  }

  // Clubs, Societies, Games
  if (s.includes('club') || s.includes('game') || s.includes('society') || s.includes('talent')) {
    return {
      name: subject || 'Clubs & Societies',
      shortCode: 'CLUBS',
      icon: '⭐',
      bgGradient: 'from-amber-950/50 via-slate-900/80 to-yellow-950/40',
      accentColor: '#fbbf24',
      accentBarClass: 'bg-amber-400',
      borderClass: 'border-amber-500/40 hover:border-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textClass: 'text-amber-200',
      subTextClass: 'text-amber-400',
      tagClass: 'bg-amber-500/20 text-amber-300',
    };
  }

  // Default fallback
  return {
    name: subject || 'Curriculum Lesson',
    shortCode: (subject || 'LESSON').slice(0, 5).toUpperCase(),
    icon: '📚',
    bgGradient: 'from-slate-900/90 via-slate-900/80 to-slate-950',
    accentColor: '#3b82f6',
    accentBarClass: 'bg-blue-400',
    borderClass: 'border-slate-800 hover:border-blue-500/50',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    textClass: 'text-slate-200',
    subTextClass: 'text-slate-400',
    tagClass: 'bg-slate-800 text-slate-300',
  };
}
