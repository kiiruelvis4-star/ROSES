/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  X,
  AlertTriangle,
  BookOpen,
  Users,
  ClipboardList,
  MessageSquare,
  Building2,
  Download,
  Share2,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
  Sparkles,
  Phone,
  Send,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  Copy,
  Printer,
  ShieldAlert,
  ArrowRight,
  Sun,
  Moon,
  Cloud,
  HardDrive,
  Info,
  Award,
  Star,
  Plus,
  RotateCcw,
  Save,
  CheckCheck,
  Target,
  ClipboardCheck,
  Bell,
  FolderOpen
} from 'lucide-react';
import { CircularBadgeLogo } from './CircularBadgeLogo';
import { TeacherResourcesStudio } from './TeacherResourcesStudio.tsx';
import {
  TeacherRecord,
  getRegisteredTeachers,
  findTeacherByPhoneOrName,
  checkTeacherIsParent,
  getRememberedTeacherSession,
  saveRememberedTeacherSession
} from '../services/schoolDataService.ts';

export interface TeachersPortalProps {
  mode?: 'phone' | 'tablet' | 'full';
  onSwitchToAdmin?: () => void;
  onExit?: () => void;
}

// -----------------------------------------------------------------------------
// TEACHER PROFILES
// -----------------------------------------------------------------------------
export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  assignedGrades: string[];
  subjects: string[];
  badge: string;
}

export const TEACHER_PROFILES: TeacherProfile[] = [
  {
    id: 'kelvin',
    name: 'Tr. Kelvin',
    title: 'Senior CBC Teacher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    assignedGrades: ['Grade 4', 'Grade 5'],
    subjects: ['Mathematics', 'Creative Arts'],
    badge: 'Grade 4 & 5 • Mathematics'
  },
  {
    id: 'elvis',
    name: 'Mr. Elvis Kiiru',
    title: 'Director & Upper Primary Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    assignedGrades: ['Grade 5', 'Grade 6'],
    subjects: ['English', 'Science and Technology'],
    badge: 'Grade 5 & 6 • English & Science'
  }
];

// -----------------------------------------------------------------------------
// CBC ASSESSMENT CRITERIA & BANDS (THE KENYA STANDARD)
// -----------------------------------------------------------------------------
export type CBCBand = 'EE' | 'ME' | 'AE' | 'BE';

export function calculateCBCBand(total: number): CBCBand {
  if (total >= 24) return 'EE'; // 80 - 100%
  if (total >= 18) return 'ME'; // 60 - 79%
  if (total >= 12) return 'AE'; // 40 - 59%
  return 'BE'; // 0 - 39%
}

export function getCBCBandDetails(band: CBCBand) {
  switch (band) {
    case 'EE':
      return {
        label: 'Exceeding Expectations',
        short: 'EE (24–30)',
        bg: 'bg-emerald-600',
        text: 'text-emerald-300',
        border: 'border-emerald-500',
        badgeBg: 'bg-emerald-950/80',
        colorHex: '#10B981'
      };
    case 'ME':
      return {
        label: 'Meeting Expectations',
        short: 'ME (18–23)',
        bg: 'bg-blue-600',
        text: 'text-blue-300',
        border: 'border-blue-500',
        badgeBg: 'bg-blue-950/80',
        colorHex: '#3B82F6'
      };
    case 'AE':
      return {
        label: 'Approaching Expectations',
        short: 'AE (12–17)',
        bg: 'bg-amber-500',
        text: 'text-amber-300',
        border: 'border-amber-400',
        badgeBg: 'bg-amber-950/80',
        colorHex: '#F59E0B'
      };
    case 'BE':
      return {
        label: 'Below Expectations',
        short: 'BE (0–11)',
        bg: 'bg-red-600',
        text: 'text-red-300',
        border: 'border-red-500',
        badgeBg: 'bg-red-950/80',
        colorHex: '#EF4444'
      };
  }
}

// -----------------------------------------------------------------------------
// PUPILS ROSTER DATA (GRADES 1–6)
// -----------------------------------------------------------------------------
export interface PupilRecord {
  upi: string;
  name: string;
  grade: string;
  gender: 'Boy' | 'Girl';
  parentName: string;
  parentRelation: 'Mother' | 'Father' | 'Guardian';
  parentPhone: string;
  avatar: string;
  status: 'Present' | 'Absent';
  recentAttainment: CBCBand;
  recentTopic: string;
  focusZoneNotes?: string;
}

export const INITIAL_PUPILS: PupilRecord[] = [
  {
    upi: 'LRA-2026-0042',
    name: 'Brian Mwangi Kamau',
    grade: 'Grade 4',
    gender: 'Boy',
    parentName: 'Mama Brian',
    parentRelation: 'Mother',
    parentPhone: '0712 345 678',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'EE',
    recentTopic: 'Active Topic'
  },
  {
    upi: 'LRA-2026-0047',
    name: 'Aisha Njeri Odhiambo',
    grade: 'Grade 4',
    gender: 'Girl',
    parentName: 'Mr. Odhiambo',
    parentRelation: 'Father',
    parentPhone: '0723 456 789',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'ME',
    recentTopic: 'Active Topic'
  },
  {
    upi: 'LRA-2026-0019',
    name: 'Kevin Otieno Onyango',
    grade: 'Grade 4',
    gender: 'Boy',
    parentName: 'Mama Kevin',
    parentRelation: 'Mother',
    parentPhone: '0701 234 567',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'BE',
    recentTopic: 'Active Topic',
    focusZoneNotes: 'Needs assistance and additional guided practice'
  },
  {
    upi: 'LRA-2026-0033',
    name: 'Mercy Wanjiku Gitau',
    grade: 'Grade 4',
    gender: 'Girl',
    parentName: 'Mr. Gitau',
    parentRelation: 'Father',
    parentPhone: '0718 987 654',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'Absent',
    recentAttainment: 'AE',
    recentTopic: 'Active Topic',
    focusZoneNotes: 'At Emerging step in lesson mastery'
  },
  {
    upi: 'LRA-2026-0051',
    name: 'David Kiprono Cheruiyot',
    grade: 'Grade 4',
    gender: 'Boy',
    parentName: 'Mama Kiprono',
    parentRelation: 'Mother',
    parentPhone: '0720 112 233',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'ME',
    recentTopic: 'Active Topic'
  },
  {
    upi: 'LRA-2026-0055',
    name: 'Faith Chebet Mutua',
    grade: 'Grade 5',
    gender: 'Girl',
    parentName: 'Father of Faith',
    parentRelation: 'Father',
    parentPhone: '0711 445 566',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'EE',
    recentTopic: 'Active Topic'
  },
  {
    upi: 'LRA-2026-0058',
    name: 'Samuel Maina Ndung\'u',
    grade: 'Grade 5',
    gender: 'Boy',
    parentName: 'Mama Maina',
    parentRelation: 'Mother',
    parentPhone: '0702 998 877',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'AE',
    recentTopic: 'Active Topic',
    focusZoneNotes: 'Review core strand principles with visual aids'
  },
  {
    upi: 'LRA-2026-0062',
    name: 'Joy Wairimu Kinyua',
    grade: 'Grade 5',
    gender: 'Girl',
    parentName: 'Mr. Kinyua',
    parentRelation: 'Father',
    parentPhone: '0724 667 788',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    status: 'Present',
    recentAttainment: 'ME',
    recentTopic: 'Active Topic'
  }
];

// -----------------------------------------------------------------------------
// TIMETABLE LESSON COCKPIT & PERIOD SCHEDULE
// -----------------------------------------------------------------------------
export interface LessonPeriodItem {
  id: string;
  time: string;
  duration: string;
  grade: string;
  subject: string;
  room: string;
  topic: string;
  status: 'Taught' | 'Pending' | 'Rescheduled';
  taughtAt?: string;
  rescheduleReason?: string;
  assignmentAttached: boolean;
  subjectColor: string;
  homeworkSheet: {
    title: string;
    description: string;
    dueDate: string;
  };
}

export function createDefaultLessonsForTeacher(teacher?: { subjects?: string[]; assignedGrades?: string[] } | null): LessonPeriodItem[] {
  const subj1 = teacher?.subjects?.[0] || 'Subject 1';
  const subj2 = teacher?.subjects?.[1] || teacher?.subjects?.[0] || 'Subject 2';
  const grade1 = teacher?.assignedGrades?.[0] || 'Grade 4';
  const grade2 = teacher?.assignedGrades?.[1] || teacher?.assignedGrades?.[0] || 'Grade 5';

  return [
    {
      id: 'lesson-1',
      time: '08:10',
      duration: '50 mins',
      grade: grade1,
      subject: subj1,
      room: 'Room 4',
      topic: 'Topic 1 (Tap to Key In)',
      status: 'Pending',
      assignmentAttached: false,
      subjectColor: '#3B82F6',
      homeworkSheet: {
        title: "Day's Homework Worksheet",
        description: 'Answer questions in exercise workbook as directed by teacher.',
        dueDate: 'Tomorrow (08:00 AM)'
      }
    },
    {
      id: 'lesson-2',
      time: '09:00',
      duration: '50 mins',
      grade: grade2,
      subject: subj2,
      room: 'Room 5',
      topic: 'Topic 2 (Tap to Key In)',
      status: 'Pending',
      taughtAt: '',
      assignmentAttached: false,
      subjectColor: '#10B981',
      homeworkSheet: {
        title: 'Practice Assignment',
        description: 'Solve assigned practice tasks in notebooks.',
        dueDate: 'Tomorrow'
      }
    },
    {
      id: 'lesson-3',
      time: '10:50',
      duration: '50 mins',
      grade: grade1,
      subject: subj1,
      room: 'Room 2',
      topic: 'Topic 3 (Tap to Key In)',
      status: 'Pending',
      assignmentAttached: false,
      subjectColor: '#8B5CF6',
      homeworkSheet: {
        title: 'Application Activity',
        description: 'Complete project or exercise at home.',
        dueDate: 'Next lesson'
      }
    }
  ];
}

export const INITIAL_TODAY_LESSONS: LessonPeriodItem[] = createDefaultLessonsForTeacher();

// -----------------------------------------------------------------------------
// LIVING GENERAL RECORD OF WORK (QASO STANDARD)
// -----------------------------------------------------------------------------
export interface GeneralRecordOfWorkEntry {
  id: string;
  week: number;
  dateTaught: string;
  strand: string;
  subStrand: string;
  learningOutcomes: string;
  workDone: string;
  teacherSignature: string;
}

export const INITIAL_RECORD_OF_WORK: GeneralRecordOfWorkEntry[] = [
  {
    id: 'row-1',
    week: 1,
    dateTaught: '15 Jan – 19 Jan',
    strand: 'Listening & Speaking',
    subStrand: 'Comprehension',
    learningOutcomes: 'Listen to a text and answer oral questions.',
    workDone: 'Story listening: Q&A in pairs.',
    teacherSignature: 'E. Kiiru'
  },
  {
    id: 'row-2',
    week: 2,
    dateTaught: '22 Jan – 26 Jan',
    strand: 'Reading',
    subStrand: 'Fluency',
    learningOutcomes: 'Read texts aloud with fluency and expression.',
    workDone: 'Paired reading; fluency practice.',
    teacherSignature: 'E. Kiiru'
  },
  {
    id: 'row-3',
    week: 3,
    dateTaught: '29 Jan – 2 Feb',
    strand: 'Grammar',
    subStrand: 'Nouns',
    learningOutcomes: 'Identify and use common nouns in sentences.',
    workDone: 'Noun hunt; worksheet done.',
    teacherSignature: 'E. Kiiru'
  },
  {
    id: 'row-4',
    week: 4,
    dateTaught: '5 Feb – 9 Feb',
    strand: 'Writing',
    subStrand: 'Composition',
    learningOutcomes: 'Write short paragraphs using correct structure.',
    workDone: 'Guided writing; paragraphs shared.',
    teacherSignature: 'E. Kiiru'
  },
  {
    id: 'row-5',
    week: 5,
    dateTaught: '12 Feb – 16 Feb',
    strand: 'Listening & Speaking',
    subStrand: 'Oral Language',
    learningOutcomes: 'Participate in conversations using appropriate language.',
    workDone: 'Role play; peer feedback.',
    teacherSignature: 'E. Kiiru'
  }
];

// -----------------------------------------------------------------------------
// STORYBOOK ZONE ITEMS
// -----------------------------------------------------------------------------
export interface StorybookItem {
  id: string;
  title: string;
  language: 'English' | 'Kiswahili';
  strandMapping: string;
  coverEmoji: string;
  date: string;
  scorePercent: number;
  excerpt: string;
  questions: { question: string; answer: string }[];
  approvedByTeacher?: boolean;
  grade?: string;
  approvedDate?: string;
}

export interface CATQuestion {
  id: number;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  strand: string;
  subStrand: string;
  marks: number;
}

export function getCatQuestionsForSubject(subject: string, grade: string): CATQuestion[] {
  const isLower = ['Grade 1', 'Grade 2', 'Grade 3'].includes(grade);
  const cleanSubj = subject.toLowerCase();

  if (cleanSubj.includes('kiswahili')) {
    return [
      {
        id: 1,
        question: 'Kamilisha methali: "Haba na haba..."',
        options: [
          { key: 'A', text: 'hujaza kibaba' },
          { key: 'B', text: 'huvunja jungu' },
          { key: 'C', text: 'huchelewesha safari' },
          { key: 'D', text: 'hukauka maji' }
        ],
        correctKey: 'A',
        strand: 'Kusoma na Kufahamu',
        subStrand: 'Methali na Nahau',
        marks: 4
      },
      {
        id: 2,
        question: 'Neno lipi ni nomino katika sentensi: "Mwanafunzi anasoma kitabu"?',
        options: [
          { key: 'A', text: 'anasoma' },
          { key: 'B', text: 'Mwanafunzi' },
          { key: 'C', text: 'kwa haraka' },
          { key: 'D', text: 'yeye' }
        ],
        correctKey: 'B',
        strand: 'Sarufi',
        subStrand: 'Aina za Maneno (Nomino)',
        marks: 4
      },
      {
        id: 3,
        question: 'Kinyume cha neno "refu" ni nini?',
        options: [
          { key: 'A', text: 'pana' },
          { key: 'B', text: 'fupi' },
          { key: 'C', text: 'dogo' },
          { key: 'D', text: 'nene' }
        ],
        correctKey: 'B',
        strand: 'Msamiati',
        subStrand: 'Vinyume vya Maneno',
        marks: 4
      },
      {
        id: 4,
        question: 'Tegua kitendawili: "Nyumba yangu haina mlango."',
        options: [
          { key: 'A', text: 'Yai' },
          { key: 'B', text: 'Gari' },
          { key: 'C', text: 'Kiatu' },
          { key: 'D', text: 'Mti' }
        ],
        correctKey: 'A',
        strand: 'Fasihi Simulizi',
        subStrand: 'Vitendawili',
        marks: 4
      },
      {
        id: 5,
        question: 'Wingi wa sentensi: "Mtoto anacheza mpira" ni:',
        options: [
          { key: 'A', text: 'Watoto wanacheza mpira' },
          { key: 'B', text: 'Mtoto wanacheza mpira' },
          { key: 'C', text: 'Watoto anacheza mpira' },
          { key: 'D', text: 'Mtoto wacheze mipira' }
        ],
        correctKey: 'A',
        strand: 'Sarufi',
        subStrand: 'Umoja na Wingi',
        marks: 4
      }
    ];
  }

  if (cleanSubj.includes('science') || cleanSubj.includes('environment')) {
    return [
      {
        id: 1,
        question: 'Which part of a plant is primarily responsible for photosynthesis and making food?',
        options: [
          { key: 'A', text: 'Roots' },
          { key: 'B', text: 'Stem' },
          { key: 'C', text: 'Green Leaf' },
          { key: 'D', text: 'Flower' }
        ],
        correctKey: 'C',
        strand: 'Living Things',
        subStrand: 'Plants and Photosynthesis',
        marks: 4
      },
      {
        id: 2,
        question: 'Which of the following materials is translucent (lets some light through)?',
        options: [
          { key: 'A', text: 'Clear glass' },
          { key: 'B', text: 'Frosted bathroom window' },
          { key: 'C', text: 'Wood block' },
          { key: 'D', text: 'Cardboard box' }
        ],
        correctKey: 'B',
        strand: 'Matter & Energy',
        subStrand: 'Light and Shadow Properties',
        marks: 4
      },
      {
        id: 3,
        question: 'What is the main function of red blood cells in the human body?',
        options: [
          { key: 'A', text: 'Transport oxygen to body tissues' },
          { key: 'B', text: 'Fight infections' },
          { key: 'C', text: 'Digest swallowed food' },
          { key: 'D', text: 'Help in blood clotting' }
        ],
        correctKey: 'A',
        strand: 'Human Body Systems',
        subStrand: 'Circulatory System',
        marks: 4
      },
      {
        id: 4,
        question: 'Which simple machine is used in a flagpole to raise and lower the national flag?',
        options: [
          { key: 'A', text: 'Lever' },
          { key: 'B', text: 'Pulley' },
          { key: 'C', text: 'Inclined Plane' },
          { key: 'D', text: 'Wedge' }
        ],
        correctKey: 'B',
        strand: 'Force & Energy',
        subStrand: 'Simple Machines',
        marks: 4
      },
      {
        id: 5,
        question: 'Which method of soil conservation involves creating stepped ledges on steep hillsides?',
        options: [
          { key: 'A', text: 'Terracing' },
          { key: 'B', text: 'Overgrazing' },
          { key: 'C', text: 'Deforestation' },
          { key: 'D', text: 'Burning vegetation' }
        ],
        correctKey: 'A',
        strand: 'Environment & Soil',
        subStrand: 'Soil Conservation',
        marks: 4
      }
    ];
  }

  // Default: English / General CBC Learning Area questions
  return [
    {
      id: 1,
      question: 'Choose the correct synonym for the word "ENORMOUS":',
      options: [
        { key: 'A', text: 'Tiny' },
        { key: 'B', text: 'Gigantic' },
        { key: 'C', text: 'Fragile' },
        { key: 'D', text: 'Swift' }
      ],
      correctKey: 'B',
      strand: 'Reading & Comprehension',
      subStrand: 'Vocabulary Acquisition',
      marks: 4
    },
    {
      id: 2,
      question: 'Identify the conjunction in this sentence: "We wanted to play outside, but it started raining."',
      options: [
        { key: 'A', text: 'wanted' },
        { key: 'B', text: 'outside' },
        { key: 'C', text: 'but' },
        { key: 'D', text: 'started' }
      ],
      correctKey: 'C',
      strand: 'Language Structures & Functions',
      subStrand: 'Parts of Speech (Conjunctions)',
      marks: 4
    },
    {
      id: 3,
      question: 'Which punctuation mark belongs at the end of: "What a spectacular performance that was"',
      options: [
        { key: 'A', text: 'Question mark (?)' },
        { key: 'B', text: 'Exclamation mark (!)' },
        { key: 'C', text: 'Comma (,)' },
        { key: 'D', text: 'Semi-colon (;)' }
      ],
      correctKey: 'B',
      strand: 'Writing',
      subStrand: 'Punctuation and Mechanics',
      marks: 4
    },
    {
      id: 4,
      question: 'What is the plural form of the noun "child"?',
      options: [
        { key: 'A', text: 'Childs' },
        { key: 'B', text: 'Children' },
        { key: 'C', text: 'Childrens' },
        { key: 'D', text: 'Childies' }
      ],
      correctKey: 'B',
      strand: 'Language Structures',
      subStrand: 'Singular and Plural Nouns',
      marks: 4
    },
    {
      id: 5,
      question: 'Select the correct preposition: "The birds built their nest _____ the high branches of the oak tree."',
      options: [
        { key: 'A', text: 'among' },
        { key: 'B', text: 'between' },
        { key: 'C', text: 'underneath' },
        { key: 'D', text: 'across' }
      ],
      correctKey: 'A',
      strand: 'Language Structures',
      subStrand: 'Prepositions',
      marks: 4
    }
  ];
}

export const STORYBOOK_ITEMS: StorybookItem[] = [
  {
    id: 'story-1',
    title: 'The Clever Tortoise',
    language: 'English',
    grade: 'Grade 2',
    strandMapping: 'English Language Activities → Reading & Comprehension',
    coverEmoji: '🐢🌳',
    date: '12 May 2026',
    scorePercent: 82,
    approvedByTeacher: true,
    approvedDate: 'Approved by Tr. Mary',
    excerpt: 'Once upon a time in the savannah, there was a slow tortoise who was very wise...',
    questions: [
      { question: 'Who was slow but wise?', answer: 'The Tortoise' },
      { question: 'What did the tortoise do?', answer: 'Outsmarted the greedy hare' },
      { question: 'What is the moral of the story?', answer: 'Patience and wisdom conquer haste' }
    ]
  },
  {
    id: 'story-2',
    title: 'Sungura na Kobe',
    language: 'Kiswahili',
    grade: 'Grade 3',
    strandMapping: 'Shughuli za Kiswahili → Kusoma na Kufahamu',
    coverEmoji: '🐇🐢',
    date: '14 May 2026',
    scorePercent: 92,
    approvedByTeacher: true,
    approvedDate: 'Approved by Tr. Mary',
    excerpt: 'Hapo zamani za kale, Sungura alijigamba kwa mbio zake lakini Kobe hakukata tamaa...',
    questions: [
      { question: 'Nani alikuwa mjanja?', answer: 'Sungura mjanja' },
      { question: 'Nini kiliondelea kati ya Sungura na Kobe?', answer: 'Mashindano ya mbio' },
      { question: 'Tujuze somo la hadithi.', answer: 'Haba na haba hujaza kibaba' }
    ]
  },
  {
    id: 'story-3',
    title: 'Zamani za Kijijini (Village Morning)',
    language: 'Kiswahili',
    grade: 'Grade 1',
    strandMapping: 'Shughuli za Kiswahili → Kusikiliza na Kuzungumza',
    coverEmoji: '🐓🌅',
    date: 'Today',
    scorePercent: 78,
    approvedByTeacher: false,
    excerpt: 'Jogoo aliwika mapema asubuhi: Kokorikoo! Watoto waliamka kufagia uwanja...',
    questions: [
      { question: 'Nani aliwika mapema?', answer: 'Jogoo' },
      { question: 'Watoto walifanya nini asubuhi?', answer: 'Walifagia uwanja' }
    ]
  }
];

// -----------------------------------------------------------------------------
// MESSAGES & PARENT COMMUNICATION
// -----------------------------------------------------------------------------
export interface ParentThread {
  id: string;
  pupilName: string;
  parentName: string;
  parentPhone: string;
  grade: string;
  subjectContext: string;
  lastMessage: string;
  lastTime: string;
  delivered: boolean;
  messages: { sender: 'parent' | 'teacher'; text: string; time: string }[];
}

export const INITIAL_PARENT_THREADS: ParentThread[] = [
  {
    id: 'thread-1',
    pupilName: 'Brian Mwangi Kamau',
    parentName: 'Mama Brian',
    parentPhone: '0712 345 678',
    grade: 'Grade 4',
    subjectContext: 'Grade 4 homework inquiry',
    lastMessage: 'Good morning, teacher 😊 Brian had a quick question regarding question 3 of today\'s assignment. Could you advise?',
    lastTime: 'Yesterday, 6:45 PM',
    delivered: true,
    messages: [
      {
        sender: 'parent',
        text: 'Good morning, teacher 😊 Brian had a quick question regarding question 3 of today\'s assignment. Could you advise?',
        time: '6:45 PM'
      },
      {
        sender: 'teacher',
        text: 'Hello Mama Brian! Encourage him to review the key steps we practiced in his notebook. He is doing very well!',
        time: '7:10 PM'
      }
    ]
  },
  {
    id: 'thread-2',
    pupilName: 'Faith Chebet Mutua',
    parentName: 'Father of Faith',
    parentPhone: '0711 445 566',
    grade: 'Grade 5',
    subjectContext: 'Assignment clarification',
    lastMessage: 'Good afternoon, teacher. Is the science assignment due this Thursday or next week?',
    lastTime: 'Tue, 4:20 PM',
    delivered: true,
    messages: [
      {
        sender: 'parent',
        text: 'Good afternoon, teacher. Is the science assignment due this Thursday or next week?',
        time: '4:20 PM'
      },
      {
        sender: 'teacher',
        text: 'Good afternoon Mr. Mutua. It is due on Thursday morning so we can review before the weekend.',
        time: '4:35 PM'
      }
    ]
  }
];

export function TeachersPortal({
  mode = 'phone',
  onSwitchToAdmin,
  onExit
}: TeachersPortalProps) {
  // ---------------------------------------------------------------------------
  // GLOBAL APPLICATION STATE & OFFLINE MECHANICS
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<
    'timetable' | 'classes' | 'resources' | 'assessments' | 'messages'
  >('timetable');
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Push Assignment tracking per lesson
  const [pushedAssignments, setPushedAssignments] = useState<
    Record<string, { time: string; recipientCount: number }>
  >({});

  // End-of-lesson Attendance & Participation Roster state
  const [lessonRosters, setLessonRosters] = useState<
    Record<
      string,
      Record<
        string,
        { status: 'Present' | 'Absent'; understanding: 'EE' | 'ME' | 'AE' | 'BE'; remark: string }
      >
    >
  >({});

  // Active Teacher Session (WhatsApp-style persistent lock-in)
  const [currentTeacher, setCurrentTeacher] = useState<TeacherRecord | null>(() => {
    // 1. Check remembered teacher session (WhatsApp-style auto-login)
    const remembered = getRememberedTeacherSession();
    if (remembered) return remembered;
    // 2. Default to first registered teacher from admin portal
    const registered = getRegisteredTeachers();
    if (registered.length > 0) {
      saveRememberedTeacherSession(registered[0]);
      return registered[0];
    }
    return null;
  });

  // Login Screen states
  const [loginPhoneOrName, setLoginPhoneOrName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check parent status by reading teacher's registered phone number
  const parentCheck = useMemo(() => {
    if (!currentTeacher) return { isParent: false, linkedChildren: [] };
    return checkTeacherIsParent(currentTeacher.phone);
  }, [currentTeacher]);

  useEffect(() => {
    // Clear out any previously cached admin shared docs so teacher's portal is strictly teacher's own work
    try {
      localStorage.removeItem('lra_shared_admin_docs');
    } catch {
      // ignore
    }
  }, []);

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginPhoneOrName.trim()) {
      setLoginError('Please enter your registered phone number or teacher name');
      return;
    }

    const foundTeacher = findTeacherByPhoneOrName(loginPhoneOrName);
    if (!foundTeacher) {
      setLoginError(
        '⚠️ Access Denied: Phone number or name not registered by School Administration. Contact Mr. Elvis Kiiru or the School Office to receive teaching credentials.'
      );
      return;
    }

    if (foundTeacher.password && loginPassword.trim() && foundTeacher.password !== loginPassword.trim()) {
      setLoginError(`⚠️ Invalid password for Tr. ${foundTeacher.name}. Check with administration.`);
      return;
    }

    saveRememberedTeacherSession(foundTeacher);
    setCurrentTeacher(foundTeacher);
    showToast(`Welcome back, ${foundTeacher.name}! Locked to phone session 💾`);
  };

  const handleTeacherLogout = () => {
    // Only permitted if teacher is a parent or dual admin!
    if (!parentCheck.isParent && !currentTeacher?.isDualAdmin) {
      showToast('⚠️ Dedicated Classroom Device: Teacher session is locked (WhatsApp style)');
      return;
    }

    saveRememberedTeacherSession(null);
    setCurrentTeacher(null);
    setLoginPhoneOrName('');
    setLoginPassword('');
    showToast('Logged out of teacher workstation');
  };

  // Offline / Online Simulation & LocalStorage Queue
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // TAB 1: TIMETABLE STATE
  // ---------------------------------------------------------------------------
  const [selectedDay, setSelectedDay] = useState<
    'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'
  >('WED');

  const [lessons, setLessons] = useState<LessonPeriodItem[]>(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_lessons');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TODAY_LESSONS;
  });

  const [expandedLessonId, setExpandedLessonId] = useState<string | null>('lesson-1');
  const [reschedulePromptLessonId, setReschedulePromptLessonId] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState<string>('School Activity Pause / Inter-House Sports');

  // Teacher key-in and custom period editing states
  const [editingLesson, setEditingLesson] = useState<LessonPeriodItem | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [newLessonForm, setNewLessonForm] = useState({
    subject: currentTeacher?.subjects?.[0] || 'English',
    grade: currentTeacher?.assignedGrades?.[0] || 'Grade 4',
    time: '11:40',
    duration: '50 mins',
    room: 'Room 3',
    topic: '',
    homeworkTitle: '',
    homeworkDesc: '',
    dueDate: 'Tomorrow 08:00 AM'
  });

  const handleResetTimetable = () => {
    const blankLessons = createDefaultLessonsForTeacher(currentTeacher);
    setLessons(blankLessons);
    localStorage.setItem('lra_teacher_lessons', JSON.stringify(blankLessons));
    showToast(`Timetable reset to fresh periods for ${currentTeacher?.name || 'Teacher'} 🗓️`);
  };

  const handleSaveLessonEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setLessons((prev) => prev.map((l) => (l.id === editingLesson.id ? editingLesson : l)));
    showToast(`Updated lesson: ${editingLesson.subject} (${editingLesson.topic || 'Custom'}) 💾`);
    setEditingLesson(null);
  };

  const handleCreateNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const newLesson: LessonPeriodItem = {
      id: `lesson-${Date.now()}`,
      time: newLessonForm.time || '11:40',
      duration: newLessonForm.duration || '50 mins',
      grade: newLessonForm.grade || currentTeacher?.assignedGrades?.[0] || 'Grade 4',
      subject: newLessonForm.subject || currentTeacher?.subjects?.[0] || 'Mathematics',
      room: newLessonForm.room || 'Room 1',
      topic: newLessonForm.topic || 'Active Topic',
      status: 'Pending',
      assignmentAttached: false,
      subjectColor: '#10B981',
      homeworkSheet: {
        title: newLessonForm.homeworkTitle || 'Homework Task',
        description: newLessonForm.homeworkDesc || 'Complete workbook questions.',
        dueDate: newLessonForm.dueDate || 'Tomorrow 08:00 AM'
      }
    };
    setLessons((prev) => [...prev, newLesson]);
    setShowAddLessonModal(false);
    showToast(`Added new period for ${newLesson.subject} (${newLesson.grade})! 📅`);
  };

  // Save lessons to localStorage
  useEffect(() => {
    localStorage.setItem('lra_teacher_lessons', JSON.stringify(lessons));
  }, [lessons]);

  // Mark lesson as taught: updates lesson status, logs to Living Record of Work, stamps date/time
  const handleMarkAsTaught = (lessonId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = lessons.find((l) => l.id === lessonId);
    if (!target) return;

    setLessons(
      lessons.map((l) =>
        l.id === lessonId
          ? { ...l, status: 'Taught', taughtAt: timeNow }
          : l
      )
    );

    // Append to Living General Record of Work
    const newEntry: GeneralRecordOfWorkEntry = {
      id: `row-${Date.now()}`,
      week: 4,
      dateTaught: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      strand: target.subject,
      subStrand: target.topic,
      learningOutcomes: `Taught ${target.subject}: ${target.topic}`,
      workDone: `Taught ${target.subject} (${target.topic}). Class attendance marked.`,
      teacherSignature: (currentTeacher?.name || 'Staff').replace('Tr. ', '').replace('Mr. ', '')
    };

    setRecordOfWork((prev) => [newEntry, ...prev]);

    if (!isOnline) {
      setUnsyncedCount((c) => c + 1);
      showToast(`✓ Marked as Taught at ${timeNow}! Saved to phone memory 💾`);
    } else {
      showToast(`✓ Marked as Taught at ${timeNow}! Synced with School Record of Work ☁️`);
    }
  };

  const handleConfirmReschedule = () => {
    if (!reschedulePromptLessonId) return;
    setLessons(
      lessons.map((l) =>
        l.id === reschedulePromptLessonId
          ? { ...l, status: 'Rescheduled', rescheduleReason }
          : l
      )
    );
    setReschedulePromptLessonId(null);
    showToast(`Lesson rescheduled for audit records: "${rescheduleReason}"`);
  };

  // Push Assignment to Learners & Parents directly from Timetable Cockpit
  const handlePushLessonAssignment = (lesson: LessonPeriodItem) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPushedAssignments((prev) => ({
      ...prev,
      [lesson.id]: {
        time: timeNow,
        recipientCount: 24
      }
    }));

    setLessons((prev) =>
      prev.map((l) => (l.id === lesson.id ? { ...l, assignmentAttached: true } : l))
    );

    // Create a broadcast entry in Parent Messages
    const pushMsg = `📢 New ${lesson.subject} Assignment (${lesson.grade}): "${lesson.homeworkSheet.title}". Due: ${lesson.homeworkSheet.dueDate}. Please verify and guide your child.`;
    setParentThreads((prev) =>
      prev.map((t) => ({
        ...t,
        lastMessage: pushMsg,
        lastTime: 'Just now',
        messages: [
          ...t.messages,
          {
            sender: 'teacher',
            text: pushMsg,
            time: timeNow
          }
        ]
      }))
    );

    showToast(`🚀 Assignment "${lesson.homeworkSheet.title}" pushed to all ${lesson.grade} learners & parents! Broadcast recorded in Messages.`);
  };

  // Untick lesson in Record of Work: Shift lesson to following day & move subsequent work forward (not combined!)
  const handleShiftLessonForward = (lessonId: string) => {
    const targetIdx = lessons.findIndex((l) => l.id === lessonId);
    if (targetIdx === -1) return;

    const target = lessons[targetIdx];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLessons((prev) => {
      const updated = [...prev];
      updated[targetIdx] = {
        ...target,
        status: 'Rescheduled',
        rescheduleReason: 'Unticked in Record of Work: Work moved to following day (not combined)'
      };
      return updated;
    });

    // Untick / Log shift in Living Record of Work
    const shiftEntry: GeneralRecordOfWorkEntry = {
      id: `row-shift-${Date.now()}`,
      week: 4,
      dateTaught: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      strand: target.subject,
      subStrand: `${target.topic} (Unticked - Shifted Forward)`,
      learningOutcomes: 'Shifted forward: Subsequent day work moved ahead not combined',
      workDone: `Work not completed on ${target.time}. Topic squeezed to following day to ensure comprehensive mastery.`,
      teacherSignature: 'Pushed Ahead ⏩'
    };

    setRecordOfWork((prev) => [shiftEntry, ...prev]);

    showToast(`Work on "${target.topic}" unticked & moved to following day. Subsequent lessons moved forward (not combined) ⏩`);
  };

  // End of lesson attendance & roster updater
  const handleUpdatePupilRoster = (
    lessonId: string,
    pupilUpi: string,
    field: 'status' | 'understanding' | 'remark',
    value: any
  ) => {
    setLessonRosters((prev) => {
      const currentLesson = prev[lessonId] || {};
      const currentPupil = currentLesson[pupilUpi] || {
        status: 'Present',
        understanding: 'ME',
        remark: 'Participated well'
      };

      return {
        ...prev,
        [lessonId]: {
          ...currentLesson,
          [pupilUpi]: {
            ...currentPupil,
            [field]: value
          }
        }
      };
    });
  };

  // ---------------------------------------------------------------------------
  // TAB 2: MY CLASSES & PUPIL ATTENDANCE STATE
  // ---------------------------------------------------------------------------
  const [selectedClassGrade, setSelectedClassGrade] = useState<string>('Grade 4');
  const [pupils, setPupils] = useState<PupilRecord[]>(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_pupils');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PUPILS;
  });

  useEffect(() => {
    localStorage.setItem('lra_teacher_pupils', JSON.stringify(pupils));
  }, [pupils]);

  const filteredPupils = useMemo(
    () => pupils.filter((p) => p.grade === selectedClassGrade),
    [pupils, selectedClassGrade]
  );

  const presentCount = filteredPupils.filter((p) => p.status === 'Present').length;
  const boysCount = filteredPupils.filter((p) => p.gender === 'Boy').length;
  const girlsCount = filteredPupils.filter((p) => p.gender === 'Girl').length;

  const handleToggleAttendance = (upi: string) => {
    setPupils((prev) =>
      prev.map((p) => {
        if (p.upi === upi) {
          const next = p.status === 'Present' ? 'Absent' : 'Present';
          return { ...p, status: next };
        }
        return p;
      })
    );
    if (!isOnline) setUnsyncedCount((c) => c + 1);
  };

  // Pupil CBC Assessment Modal
  const [inspectingPupil, setInspectingPupil] = useState<PupilRecord | null>(null);

  // ---------------------------------------------------------------------------
  // TAB 3: ASSESSMENTS (OFFICIAL CBC 30-MARK BOOK)
  // ---------------------------------------------------------------------------
  const [assessGrade, setAssessGrade] = useState<string>(
    currentTeacher?.assignedGrades?.[0] || 'Grade 4'
  );
  const [assessSubject, setAssessSubject] = useState<string>(
    currentTeacher?.subjects?.[0] || 'English'
  );
  const [assessTerm, setAssessTerm] = useState<string>('Term 1');
  const [assessStrand, setAssessStrand] = useState<string>('Strand 1');
  const [assessSubStrand, setAssessSubStrand] = useState<string>('Sub-Strand 1');

  // Mark Book Scores mapped by pupil upi: { assignment: number | string; cat: number | string; remark: string }
  // Starts completely clean - teacher keys in everything for themselves
  const [marksState, setMarksState] = useState<
    Record<string, { assignment: number | string; cat: number | string; remark: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_marks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const handleUpdateMark = (
    upi: string,
    field: 'assignment' | 'cat' | 'remark',
    val: any
  ) => {
    setMarksState((prev) => ({
      ...prev,
      [upi]: {
        ...(prev[upi] || { assignment: '', cat: '', remark: '' }),
        [field]: val
      }
    }));
  };

  const handleClearAllMarks = () => {
    setMarksState({});
    localStorage.removeItem('lra_teacher_marks');
    showToast('Assessment mark book cleared. Ready for fresh teacher entries! 📝');
  };

  const handleSaveAllMarks = () => {
    localStorage.setItem('lra_teacher_marks', JSON.stringify(marksState));
    if (!isOnline) {
      setUnsyncedCount((c) => c + 1);
      showToast('Marks saved to phone memory 💾 (Will sync when online)');
    } else {
      showToast('All 30-Mark CBC assessment entries locked and synced to Cloud! ☁️');
    }
  };

  // Learner "My Focus" Diagnosis State (what they are poor at in subject, strand, sub-strand)
  const [focusPupil, setFocusPupil] = useState<PupilRecord | null>(null);

  // Interactive CAT Studio State (Choices A, B, C, D covering taught syllabus, Online & Offline)
  const [showCatStudio, setShowCatStudio] = useState<boolean>(false);
  const [catMode, setCatMode] = useState<'online' | 'offline'>('online');
  const [catTargetUpi, setCatTargetUpi] = useState<string>('');
  const [catAnswers, setCatAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [catScoreResult, setCatScoreResult] = useState<{ score: number; total: number } | null>(null);

  // Storybook Creator & Teacher Approval Workbench (Grades 1, 2, 3)
  const [storybooks, setStorybooks] = useState<StorybookItem[]>(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_storybooks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return STORYBOOK_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('lra_teacher_storybooks', JSON.stringify(storybooks));
    } catch {}
  }, [storybooks]);

  const [inspectingStorybook, setInspectingStorybook] = useState<StorybookItem | null>(null);

  const handleApproveStorybook = (storyId: string) => {
    const teacherName = currentTeacher?.name || 'Class Teacher';
    const updated = storybooks.map((s) => {
      if (s.id === storyId) {
        return {
          ...s,
          approvedByTeacher: true,
          approvedDate: `Approved by ${teacherName} on ${new Date().toLocaleDateString('en-GB')}`
        };
      }
      return s;
    });
    setStorybooks(updated);
    showToast(`✓ Storybook approved by ${teacherName}! Cleared for lower primary learners 📖`);
  };

  const handleGradeCat = (pupilUpi: string, questions: CATQuestion[]) => {
    let earned = 0;
    questions.forEach((q) => {
      if (catAnswers[q.id] === q.correctKey) {
        earned += q.marks;
      }
    });

    // Auto-update pupil's CAT score in marksState
    setMarksState((prev) => ({
      ...prev,
      [pupilUpi]: {
        ...(prev[pupilUpi] || { assignment: '', cat: '', remark: '' }),
        cat: earned
      }
    }));

    setCatScoreResult({ score: earned, total: 20 });
    showToast(`✓ CAT Graded by AI: ${earned}/20! Recorded into CBC 30-Mark Book 🎯`);
  };

  // ---------------------------------------------------------------------------
  // TAB 4: LEARNING MATERIALS & LIVING RECORD OF WORK
  // ---------------------------------------------------------------------------
  const [recordOfWork, setRecordOfWork] = useState<GeneralRecordOfWorkEntry[]>(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_record_of_work');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_RECORD_OF_WORK;
  });

  useEffect(() => {
    localStorage.setItem('lra_teacher_record_of_work', JSON.stringify(recordOfWork));
  }, [recordOfWork]);

  // ---------------------------------------------------------------------------
  // TAB 5: MESSAGES & PARENT COMMUNICATION
  // ---------------------------------------------------------------------------
  const [parentThreads, setParentThreads] = useState<ParentThread[]>(() => {
    try {
      const saved = localStorage.getItem('lra_teacher_threads');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PARENT_THREADS;
  });

  const [activeMessageGrade, setActiveMessageGrade] = useState<string>('Grade 4');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Class Announcement composer
  const [announceGrade, setAnnounceGrade] = useState<string>('Grade 4');
  const [announceText, setAnnounceText] = useState<string>('Bring geometrical sets tomorrow 📐✍️');

  // De-congested dashboard states: Profile & System Controls Drawer + Sub-tab per lesson
  const [showTeacherProfileModal, setShowTeacherProfileModal] = useState<boolean>(false);
  const [lessonActiveSubTab, setLessonActiveSubTab] = useState<Record<string, 'homework' | 'roster'>>({});

  const getLessonSubTab = (id: string): 'homework' | 'roster' => {
    return lessonActiveSubTab[id] || 'homework';
  };

  const setLessonSubTab = (id: string, tab: 'homework' | 'roster') => {
    setLessonActiveSubTab((prev) => ({ ...prev, [id]: tab }));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeThreadId) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setParentThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: replyText,
            lastTime: 'Just now',
            messages: [
              ...t.messages,
              { sender: 'teacher', text: replyText, time: timeNow }
            ]
          };
        }
        return t;
      })
    );
    setReplyText('');
    showToast('Message sent with simple delivery checkmarks ✓✓');
  };

  const handleSendClassAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceText.trim()) return;
    showToast(`Announcement sent to all ${announceGrade} parents via WhatsApp SMS link! 💌`);
    setAnnounceText('');
  };

  if (!currentTeacher) {
    return (
      <div className="w-full h-full min-h-screen bg-[#070D1E] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0B152E] border-2 border-emerald-500/80 rounded-3xl p-6 shadow-2xl text-white space-y-4 relative">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-[#ECD8C0] overflow-hidden flex items-center justify-center mx-auto shadow-lg">
              <CircularBadgeLogo className="w-16 h-16" />
            </div>
            <h2 className="font-extrabold text-base text-white tracking-tight">
              Little Roses Academy
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <span>👨🏾‍🏫 Teachers Command Center</span>
            </div>
            <p className="text-xs text-slate-300">
              Sign in with your registered phone number or teacher name to unlock your classroom workbench.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-medium leading-relaxed">
              {loginError}
            </div>
          )}

          <form onSubmit={handleTeacherLogin} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Registered Mobile Number / Name
              </label>
              <input
                type="text"
                value={loginPhoneOrName}
                onChange={(e) => setLoginPhoneOrName(e.target.value)}
                placeholder="e.g. 0712 345 678 or Mr. Elvis"
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Staff Password (Default: LRA4.@2025)
              </label>
              <div className="relative mt-1">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter staff password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Verify & Lock into Workstation 💾</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
            Once signed in, session locks WhatsApp-style and auto-logs in on next return.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col font-sans transition-colors duration-200 select-none overflow-hidden ${
        mode === 'phone' ? 'text-xs' : 'text-sm'
      }`}
      style={{ backgroundColor: '#070D1E', color: '#FFFFFF' }}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-amber-300">
          <CheckCircle2 className="w-4 h-4 text-neutral-950" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =======================================================================
          1. TOP NAVIGATION & IDENTITY BAR (CLEAN, AIRY & ELEGANT)
          ======================================================================= */}
      <header
        className="w-full flex-shrink-0 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800/80 shadow-md relative z-20 flex items-center justify-between gap-3"
        style={{ backgroundColor: '#0A192F' }}
      >
        {/* Left: School Crest + Clean Identity */}
        <div className="flex items-center gap-3">
          <div
            className="relative group cursor-pointer flex-shrink-0"
            onClick={() => onExit?.()}
            title="Little Roses Academy"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-amber-400/80 bg-[#ECD8C0] overflow-hidden flex items-center justify-center shadow-md">
              <CircularBadgeLogo className="w-10 h-10 sm:w-11 sm:h-11" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Tr. {currentTeacher.name}
              </h1>
              {parentCheck.isParent && (
                <span className="hidden sm:inline-block text-[10px] text-blue-300 font-medium">
                  • Parent-Teacher
                </span>
              )}
            </div>

            {/* Quiet, unboxed metadata */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
              <span>Term 1 · Week 4</span>
              <span aria-hidden="true" className="text-slate-600">/</span>
              <span className="text-amber-400 font-semibold">
                {currentTeacher.assignedGrades?.join(', ') || currentTeacher.assignedGrade || 'Grade 4 & 5'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick School Office Access + Profile & Settings Button */}
        <div className="flex items-center gap-2">
          {/* Quick Leadership Switcher for Elvis & Kelvin */}
          {currentTeacher.isDualAdmin && (
            <button
              onClick={() => onSwitchToAdmin?.()}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Switch directly to School Office Administration"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">School Office</span>
            </button>
          )}

          {/* Teacher Profile / System Controls Trigger (Avatar + Status Dot) */}
          <button
            onClick={() => setShowTeacherProfileModal(true)}
            className="flex items-center gap-2 p-1 pl-2.5 sm:pl-3 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-amber-400/60 transition-all cursor-pointer group shadow-inner"
            title="Open Teacher Profile & System Settings"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="hidden md:inline">
                {isOnline ? 'Synced' : 'Offline'}
              </span>
            </div>

            {/* Profile Avatar */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-400/80 bg-slate-800 flex-shrink-0">
              {currentTeacher.avatarUrl ? (
                <img
                  src={currentTeacher.avatarUrl}
                  alt={currentTeacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-[11px] text-white bg-emerald-700">
                  {currentTeacher.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* =======================================================================
          2. MAIN VIEWPORT (5 TABS - SELF-CONTAINED FULL-PAGE SCREENS)
          ======================================================================= */}
      <main ref={mainContentRef} className="flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 pb-24">
        {/* -------------------------------------------------------------------
            TAB 1: 📅 DAILY COCKPIT (TIMETABLE COMMAND CENTER)
            ------------------------------------------------------------------- */}
        {activeTab === 'timetable' && (
          <div className="space-y-3 max-w-3xl mx-auto animate-fadeIn">
            {/* A. Day Selector Bar */}
            <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-[#0B1736] border border-slate-800 shadow-md">
              {(
                [
                  { code: 'MON', label: '18 May' },
                  { code: 'TUE', label: '19 May' },
                  { code: 'WED', label: '20 May' },
                  { code: 'THU', label: '21 May' },
                  { code: 'FRI', label: '22 May', note: 'Sports Day 🎉' }
                ] as { code: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'; label: string; note?: string }[]
              ).map((day) => {
                const isActive = selectedDay === day.code;
                return (
                  <button
                    key={day.code}
                    onClick={() => setSelectedDay(day.code as any)}
                    className={`flex-1 py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-neutral-950 font-black shadow-lg scale-[1.02]'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-extrabold uppercase">{day.code}</div>
                    <div className={`text-[10px] ${isActive ? 'text-neutral-900 font-bold' : 'text-slate-400'}`}>
                      {day.label}
                    </div>
                    {day.note && (
                      <div className="text-[8px] font-bold text-red-400 truncate hidden sm:block">
                        {day.note}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* School Pacing Strip & Notice */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Week 4 • Active Syllabus Delivery</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-200 font-medium">
                <span>📢 Sports Day Friday: Regular periods paused ⚽</span>
              </div>
            </div>

            {/* B. Today's Period Cards & Add Button */}
            <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-300 uppercase tracking-wider">
                  Today&apos;s Periods
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({lessons.length} Scheduled · {lessons.filter((l) => l.status === 'Taught').length} Taught)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setNewLessonForm({
                      subject: currentTeacher?.subjects?.[0] || 'English',
                      grade: currentTeacher?.assignedGrades?.[0] || 'Grade 4',
                      time: '11:40',
                      duration: '50 mins',
                      room: 'Room 3',
                      topic: '',
                      homeworkTitle: '',
                      homeworkDesc: '',
                      dueDate: 'Tomorrow 08:00 AM'
                    });
                    setShowAddLessonModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Lesson Period</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson) => {
                const isExpanded = expandedLessonId === lesson.id;
                const isTaught = lesson.status === 'Taught';
                const isRescheduled = lesson.status === 'Rescheduled';

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border transition-all shadow-lg overflow-hidden ${
                      isExpanded
                        ? 'bg-white text-slate-900 border-amber-400 ring-2 ring-amber-400/30'
                        : isTaught
                        ? 'bg-[#0B152E] text-white border-emerald-500/50'
                        : 'bg-[#0B152E] text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Period Card Header */}
                    <div
                      onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                        isExpanded ? 'bg-slate-50 border-b border-slate-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Time & Duration badge */}
                        <div
                          className="px-2.5 py-1.5 rounded-xl text-center font-mono border flex-shrink-0"
                          style={{
                            borderColor: lesson.subjectColor,
                            backgroundColor: isExpanded ? '#F1F5F9' : '#060D1E'
                          }}
                        >
                          <div
                            className="font-black text-xs"
                            style={{ color: lesson.subjectColor }}
                          >
                            {lesson.time}
                          </div>
                          <div
                            className={`text-[9px] ${
                              isExpanded ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {lesson.duration}
                          </div>
                        </div>

                        {/* Subject, Grade, Room */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-black text-sm sm:text-base ${
                                isExpanded ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {lesson.grade} • {lesson.subject}
                            </h3>
                          </div>
                          <div
                            className={`text-[11px] flex items-center gap-2 mt-0.5 ${
                              isExpanded ? 'text-slate-600' : 'text-slate-300'
                            }`}
                          >
                            <span>📍 {lesson.room}</span>
                            <span aria-hidden="true" className="text-slate-500">·</span>
                            <span className="font-semibold text-blue-400">
                              Topic: {lesson.topic}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Quick Action Buttons */}
                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        {isTaught ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Taught {lesson.taughtAt ? `@ ${lesson.taughtAt}` : ''}</span>
                          </span>
                        ) : isRescheduled ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold">
                            Rescheduled
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsTaught(lesson.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                              title="Mark lesson as taught directly"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Sign Taught</span>
                            </button>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                              Pending
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold pl-1">
                          <span className="hidden md:inline">{isExpanded ? 'Close' : 'Details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* C. THE ONE-TAP LESSON DRAWER (DE-CONGESTED TABBED WORKBENCH) */}
                    {isExpanded && (
                      <div className="p-3.5 sm:p-4 space-y-3.5 bg-white text-slate-900 text-xs">
                        {/* Header with Edit Button */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                              Lesson Workbench · {lesson.subject} ({lesson.grade})
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Topic: {lesson.topic} · Room: {lesson.room}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingLesson({ ...lesson })}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Details</span>
                          </button>
                        </div>

                        {/* Segmented Sub-Tab Switcher (Prevents vertical clutter) */}
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setLessonSubTab(lesson.id, 'homework')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              getLessonSubTab(lesson.id) === 'homework'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            📝 Homework & Push
                          </button>
                          <button
                            type="button"
                            onClick={() => setLessonSubTab(lesson.id, 'roster')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              getLessonSubTab(lesson.id) === 'roster'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            👥 Attendance Roster
                          </button>
                        </div>

                        {/* SUB-TAB 1: HOMEWORK & PUSH */}
                        {getLessonSubTab(lesson.id) === 'homework' && (
                          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 space-y-2.5 animate-fadeIn">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 font-black text-rose-900 text-xs uppercase">
                                <FileText className="w-4 h-4 text-rose-600" />
                                <span>Day&apos;s Homework & Assignment Sheet</span>
                              </div>
                              {pushedAssignments[lesson.id] ? (
                                <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Pushed to Parents @ {pushedAssignments[lesson.id].time}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Ready to broadcast to parents & learners
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {lesson.homeworkSheet.title}
                            </div>
                            <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-rose-200 font-mono leading-relaxed">
                              {lesson.homeworkSheet.description}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                              <div className="text-xs text-rose-800 font-bold">
                                Due Date: {lesson.homeworkSheet.dueDate}
                              </div>
                              <button
                                onClick={() => handlePushLessonAssignment(lesson)}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Push Assignment to Learners & Parents 🚀</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 3: ATTENDANCE ROSTER */}
                        {getLessonSubTab(lesson.id) === 'roster' && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 space-y-2.5 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase">
                                <Users className="w-4 h-4 text-emerald-600" />
                                <span>Lesson Period Attendance & Attainment</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Quick period marks
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {INITIAL_PUPILS.filter((p) => p.grade === lesson.grade || lesson.grade === 'Grade 4').slice(0, 4).map((pupil) => {
                                const pRoster = lessonRosters[lesson.id]?.[pupil.upi] || {
                                  status: pupil.status,
                                  understanding: pupil.recentAttainment,
                                  remark: ''
                                };

                                return (
                                  <div
                                    key={pupil.upi}
                                    className="p-2 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-[130px]">
                                      <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-300 flex-shrink-0">
                                        <img src={pupil.avatar} alt={pupil.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900 truncate max-w-[120px]">{pupil.name}</div>
                                        <div className="text-[9px] text-slate-400 font-mono">{pupil.upi}</div>
                                      </div>
                                    </div>

                                    {/* Present / Absent Toggle */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdatePupilRoster(lesson.id, pupil.upi, 'status', 'Present')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          pRoster.status === 'Present'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                      >
                                        Present
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdatePupilRoster(lesson.id, pupil.upi, 'status', 'Absent')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          pRoster.status === 'Absent'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                      >
                                        Absent
                                      </button>
                                    </div>

                                    {/* Understanding level */}
                                    <div className="flex items-center gap-1">
                                      {(['EE', 'ME', 'AE', 'BE'] as const).map((band) => (
                                        <button
                                          key={band}
                                          type="button"
                                          onClick={() => handleUpdatePupilRoster(lesson.id, pupil.upi, 'understanding', band)}
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                            pRoster.understanding === band
                                              ? band === 'EE'
                                                ? 'bg-emerald-600 text-white'
                                                : band === 'ME'
                                                ? 'bg-blue-600 text-white'
                                                : band === 'AE'
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-red-600 text-white'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          {band}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => showToast(`Lesson roster saved for ${lesson.grade} ${lesson.subject}! 📋`)}
                              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer text-center"
                            >
                              ✓ Save Roster & Close
                            </button>
                          </div>
                        )}

                        {/* Action Bar & Record of Work Ticking */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 border-t border-slate-200">
                          <button
                            onClick={() => handleMarkAsTaught(lesson.id)}
                            className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark as Taught ✓ (Sign Record of Work)</span>
                          </button>

                          <button
                            onClick={() => handleShiftLessonForward(lesson.id)}
                            className="w-full sm:flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Work moves forward to following day, not combined"
                          >
                            <X className="w-4 h-4" />
                            <span>Not Taught ✗ (Shift Forward)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: 👥 MY CLASSES & PUPIL ATTENDANCE
            ------------------------------------------------------------------- */}
        {activeTab === 'classes' && (
          <div className="space-y-3 max-w-3xl mx-auto animate-fadeIn">
            {/* Grade Selector Chips */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B1736] border border-slate-800">
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((g) => {
                const isSelected = selectedClassGrade === g;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedClassGrade(g)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    🎓 {g}
                  </button>
                );
              })}
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-2xl bg-[#0B152E] border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold">Total Learners</div>
                <div className="text-lg font-black text-white">{filteredPupils.length || 24}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#0B152E] border border-slate-800 text-center">
                <div className="text-[10px] text-emerald-400 font-bold">Present Today</div>
                <div className="text-lg font-black text-emerald-400">{presentCount || 22}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#0B152E] border border-slate-800 text-center">
                <div className="text-[10px] text-blue-400 font-bold">Boys</div>
                <div className="text-lg font-black text-blue-400">{boysCount || 13}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#0B152E] border border-slate-800 text-center">
                <div className="text-[10px] text-pink-400 font-bold">Girls</div>
                <div className="text-lg font-black text-pink-400">{girlsCount || 11}</div>
              </div>
            </div>

            {/* Morning Attendance Quick Tap Strip */}
            <div className="p-3 rounded-2xl bg-[#0B152E] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="font-extrabold text-white flex items-center gap-1.5">
                  <span>Attendance – Quick Tap 👆</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Present
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Absent
                  </span>
                </div>
              </div>

              {/* Quick Tap Circle Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {filteredPupils.map((pupil) => {
                  const isPres = pupil.status === 'Present';
                  const initials = pupil.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <button
                      key={pupil.upi}
                      onClick={() => handleToggleAttendance(pupil.upi)}
                      className={`w-8 h-8 rounded-full font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                        isPres
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-amber-500 text-neutral-950 font-black hover:bg-amber-400 ring-2 ring-amber-300'
                      }`}
                      title={`${pupil.name} (${pupil.status}) - Tap to toggle`}
                    >
                      {initials}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                💡 Tap a circle to toggle attendance. Automatically updates School Office & prepares parent alerts.
              </p>
            </div>

            {/* Pupil Roster Cards */}
            <div className="space-y-2.5">
              {filteredPupils.map((pupil) => {
                const bandInfo = getCBCBandDetails(pupil.recentAttainment);
                const hasFocusAlert = pupil.recentAttainment === 'BE' || pupil.recentAttainment === 'AE';

                return (
                  <div
                    key={pupil.upi}
                    className="p-3.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Pupil Photo Avatar with status ring */}
                        <div
                          className={`w-12 h-12 rounded-full overflow-hidden p-0.5 border-2 ${
                            pupil.status === 'Present' ? 'border-emerald-500' : 'border-amber-500'
                          }`}
                        >
                          <img
                            src={pupil.avatar}
                            alt={pupil.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{pupil.name}</h4>
                          <div className="text-[10px] font-mono text-slate-500">
                            UPI: {pupil.upi}
                          </div>
                        </div>
                      </div>

                      {/* Parent Contact */}
                      <div className="text-right text-[11px]">
                        <div className="font-bold text-slate-800 flex items-center justify-end gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{pupil.parentPhone}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Linked to {pupil.parentRelation} ({pupil.parentName})
                        </div>
                      </div>
                    </div>

                    {/* Focus Zone Alert Banner if BE or AE */}
                    {hasFocusAlert && (
                      <div
                        className={`p-2 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-2 ${
                          pupil.recentAttainment === 'BE'
                            ? 'bg-red-50 text-red-900 border border-red-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${
                              pupil.recentAttainment === 'BE' ? 'text-red-600' : 'text-amber-600'
                            }`}
                          />
                          <span>
                            Focus Zone Alert: Recent attainment: {bandInfo.label} ({pupil.recentTopic})
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white ${bandInfo.bg}`}>
                          {pupil.recentAttainment}
                        </span>
                      </div>
                    )}

                    {/* Quick Pupil Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => setInspectingPupil(pupil)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Assessment Card</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('messages');
                          setActiveThreadId('thread-1');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Message Parent</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: 📁 RESOURCES STUDIO (16 CBC WORKFLOW FOLDERS)
            ------------------------------------------------------------------- */}
        {activeTab === 'resources' && currentTeacher && (
          <div className="space-y-3 max-w-4xl mx-auto animate-fadeIn">
            <TeacherResourcesStudio
              currentTeacher={currentTeacher}
              showToast={showToast}
            />
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 4: 📝 ASSESSMENTS (OFFICIAL CBC 30-MARK BOOK)
            ------------------------------------------------------------------- */}
        {activeTab === 'assessments' && (
          <div className="space-y-3 max-w-4xl mx-auto animate-fadeIn">
            {/* Header Title */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0C1B3E] to-[#0A1734] border border-amber-400/40 shadow-lg flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <span>📘 CBC 30-Mark Assessment Book</span>
                  <span className="text-amber-400">⭐</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Official Kenya Curriculum Framework: Homework (10) + CAT (20) = 30 Marks
                </p>
              </div>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/50 px-2 py-1 rounded-full">
                Strict Teacher Authority
              </span>
            </div>

            {/* Filter Bar with Full Teacher Key-In Customizability */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 p-3 rounded-2xl bg-[#0B152E] border border-slate-800 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Grade</label>
                <select
                  value={assessGrade}
                  onChange={(e) => setAssessGrade(e.target.value)}
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-bold"
                >
                  <option value="Grade 1">Grade 1 (Lower)</option>
                  <option value="Grade 2">Grade 2 (Lower)</option>
                  <option value="Grade 3">Grade 3 (Lower)</option>
                  <option value="Grade 4">Grade 4 (Upper)</option>
                  <option value="Grade 5">Grade 5 (Upper)</option>
                  <option value="Grade 6">Grade 6 (Upper)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Learning Area (Key In)</label>
                <input
                  type="text"
                  list="cbe-subjects-list"
                  value={assessSubject}
                  onChange={(e) => setAssessSubject(e.target.value)}
                  placeholder="Key in Subject..."
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
                <datalist id="cbe-subjects-list">
                  {currentTeacher?.subjects?.map((s) => (
                    <option key={s} value={s} />
                  ))}
                  <option value="English" />
                  <option value="Kiswahili" />
                  <option value="Mathematics" />
                  <option value="Science and Technology" />
                  <option value="Social Studies" />
                  <option value="Agriculture & Nutrition" />
                  <option value="Creative Arts & Sports" />
                  <option value="Religious Education" />
                  <option value="Environmental Activities" />
                  <option value="Creative Activities" />
                  <option value="Indigenous Language Activities" />
                </datalist>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Term</label>
                <select
                  value={assessTerm}
                  onChange={(e) => setAssessTerm(e.target.value)}
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-bold"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3 (Revision)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase"># Strand (Key In)</label>
                <input
                  type="text"
                  value={assessStrand}
                  onChange={(e) => setAssessStrand(e.target.value)}
                  placeholder="e.g. Listening & Speaking / Living Things..."
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">📊 Sub-Strand (Key In)</label>
                <input
                  type="text"
                  value={assessSubStrand}
                  onChange={(e) => setAssessSubStrand(e.target.value)}
                  placeholder="e.g. Comprehension / Plants..."
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Official 4-Level Performance Scale Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-[10px] font-extrabold uppercase">EE (Exceeding)</div>
                  <div className="text-xs font-black">24 – 30 / 30</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                  🌿
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/80 text-blue-300 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-[10px] font-extrabold uppercase">ME (Meeting)</div>
                  <div className="text-xs font-black">18 – 23 / 30</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                  ⭐
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/80 text-amber-300 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-[10px] font-extrabold uppercase">AE (Approaching)</div>
                  <div className="text-xs font-black">12 – 17 / 30</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-xs">
                  ☀️
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-300 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-[10px] font-extrabold uppercase">BE (Below)</div>
                  <div className="text-xs font-black">0 – 11 / 30</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs">
                  ❤️
                </div>
              </div>
            </div>

            {/* Teacher CAT Submission Notice & Offline-First Low-Bandwidth Indicator */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                    <span>Teacher Authority Notice: Submit CAT 1 & 2 Scores</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                      ⚡ 0 KB buffer (Offline Active)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Reminder to submit CAT marks for <strong>{assessGrade} • {assessSubject}</strong>. Offline responses cached locally and will sync when network is available without buffering.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowCatStudio(true);
                    setCatTargetUpi(filteredPupils[0]?.upi || '');
                    setCatAnswers({});
                    setCatScoreResult(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  title="Launch CAT 1 & 2 Multiple Choice Questions (Choices A, B, C, D) Online or Offline"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Interactive CAT Studio (A,B,C,D)</span>
                </button>
              </div>
            </div>

            {/* Lower Primary (Grades 1, 2, 3) English & Kiswahili Storybook Approval Workbench */}
            {['Grade 1', 'Grade 2', 'Grade 3'].includes(assessGrade) &&
              (assessSubject.toLowerCase().includes('english') || assessSubject.toLowerCase().includes('kiswahili')) && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#07241A] to-[#0A1D3A] border-2 border-emerald-500/60 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-black flex items-center justify-center flex-shrink-0 text-sm">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5">
                        <span>Lower Primary Storybook Workbench ({assessGrade} {assessSubject})</span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                          Teacher Approval Required
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Illustrated CBC reading storybooks for lower grades. Content cannot be sent to learners without your direct verification and approval.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const matched = storybooks.find((s) => s.grade === assessGrade) || storybooks[0];
                      setInspectingStorybook(matched);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer self-end sm:self-auto flex items-center gap-1.5 transition-all"
                  >
                    <span>Review & Approve Storybooks 📖</span>
                  </button>
                </div>
              )}

            {/* The Spreadsheet-Style Table View */}
            <div className="rounded-2xl border border-slate-700 bg-white text-slate-900 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#091530] text-white font-bold border-b border-slate-700">
                      <th className="p-2.5">Pupil UPI & Name</th>
                      <th className="p-2.5 w-24 text-center">Assignment /10</th>
                      <th className="p-2.5 w-24 text-center">CAT /20</th>
                      <th className="p-2.5 w-24 text-center bg-slate-800 text-amber-300">Total /30 (auto)</th>
                      <th className="p-2.5 w-20 text-center">Badge</th>
                      <th className="p-2.5 w-24 text-center">My Focus</th>
                      <th className="p-2.5">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPupils.map((pupil) => {
                      const entry = marksState[pupil.upi] || {
                        assignment: '',
                        cat: '',
                        remark: ''
                      };
                      const hasAssign = entry.assignment !== '' && entry.assignment !== undefined && !isNaN(Number(entry.assignment));
                      const hasCat = entry.cat !== '' && entry.cat !== undefined && !isNaN(Number(entry.cat));
                      const hasAnyScore = hasAssign || hasCat;
                      const total = hasAnyScore ? Math.min(30, (Number(entry.assignment) || 0) + (Number(entry.cat) || 0)) : 0;
                      const band = hasAnyScore ? calculateCBCBand(total) : null;
                      const bandDetails = band ? getCBCBandDetails(band) : null;

                      return (
                        <tr key={pupil.upi} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold">
                            <div className="text-slate-900">{pupil.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{pupil.upi}</div>
                          </td>

                          {/* Assignment /10 Input */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={entry.assignment}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  handleUpdateMark(pupil.upi, 'assignment', '');
                                } else {
                                  handleUpdateMark(
                                    pupil.upi,
                                    'assignment',
                                    Math.max(0, Math.min(10, Number(val)))
                                  );
                                }
                              }}
                              placeholder="—"
                              className="w-16 text-center font-bold text-xs p-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* CAT /20 Input */}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={entry.cat}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  handleUpdateMark(pupil.upi, 'cat', '');
                                } else {
                                  handleUpdateMark(
                                    pupil.upi,
                                    'cat',
                                    Math.max(0, Math.min(20, Number(val)))
                                  );
                                }
                              }}
                              placeholder="—"
                              className="w-16 text-center font-bold text-xs p-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* Auto Calculated Total */}
                          <td className="p-2 text-center font-black text-sm bg-slate-50 text-slate-900 font-mono">
                            {hasAnyScore ? total : <span className="text-slate-400 font-normal text-xs">—</span>}
                          </td>

                          {/* Badge */}
                          <td className="p-2 text-center">
                            {bandDetails ? (
                              <span
                                className={`px-2 py-1 rounded-md text-[10px] font-black text-white shadow-sm ${bandDetails.bg}`}
                              >
                                {band}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* My Focus Button */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => setFocusPupil(pupil)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors shadow-sm"
                              title="Learner Focus: diagnose what this pupil is poor at in Subject -> Strand -> Sub-Strand"
                            >
                              <Target className="w-3 h-3 text-indigo-600" />
                              <span>Focus</span>
                            </button>
                          </td>

                          {/* Qualitative Remark */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={entry.remark || ''}
                              onChange={(e) =>
                                handleUpdateMark(pupil.upi, 'remark', e.target.value)
                              }
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              placeholder="Teacher keys in qualitative remark..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save All Marks Button & Sync Notice */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={handleSaveAllMarks}
                  className="flex-1 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Save All Marks 💾</span>
                </button>
                <button
                  onClick={handleClearAllMarks}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear / Reset Sheet</span>
                </button>
              </div>

              <div className="p-2 rounded-xl bg-[#0B152E] border border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Saves directly to local phone memory first. Automatically syncs to School Cloud when connection is restored.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 4: 💬 MESSAGES & PARENT COMMUNICATION
            ------------------------------------------------------------------- */}
        {activeTab === 'messages' && (
          <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="p-3 rounded-2xl bg-[#0B152E] border border-slate-800 shadow-md">
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span>Messages & Parent Communication</span>
                <span className="text-amber-400">💬</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Three channels to keep our Little Roses home-school connection strong and transparent.
              </p>
            </div>

            {/* CHANNEL 1: LEARNER/PARENT THREADS */}
            <div className="p-3.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <h4 className="font-black text-sm text-slate-900">
                    Learner/Parent Threads (One-to-One)
                  </h4>
                </div>

                <select
                  value={activeMessageGrade}
                  onChange={(e) => setActiveMessageGrade(e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="Grade 4">Filtered by: Grade 4</option>
                  <option value="Grade 5">Filtered by: Grade 5</option>
                </select>
              </div>

              <div className="space-y-2">
                {parentThreads.map((thread) => {
                  const isSelected = activeThreadId === thread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setActiveThreadId(isSelected ? null : thread.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                            👩🏾
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">{thread.parentName}</div>
                            <div className="text-[10px] text-slate-500">{thread.subjectContext}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-slate-400">{thread.lastTime}</div>
                          <div className="flex items-center justify-end text-emerald-600">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-700 mt-2 italic bg-white p-2 rounded-lg border border-slate-200">
                        &quot;{thread.lastMessage}&quot;
                      </div>

                      {/* Expanded Conversation */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <div className="space-y-1.5 max-h-40 overflow-y-auto p-1">
                            {thread.messages.map((m, idx) => (
                              <div
                                key={idx}
                                className={`flex flex-col ${
                                  m.sender === 'teacher' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div
                                  className={`p-2 rounded-xl text-xs max-w-[85%] ${
                                    m.sender === 'teacher'
                                      ? 'bg-emerald-600 text-white rounded-br-none'
                                      : 'bg-slate-200 text-slate-900 rounded-bl-none'
                                  }`}
                                >
                                  {m.text}
                                </div>
                                <span className="text-[8px] text-slate-400 mt-0.5">{m.time}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply to parent..."
                              className="flex-1 p-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                            />
                            <button
                              onClick={handleSendReply}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHANNEL 2: SCHOOL OFFICE BROADCAST CHANNEL */}
            <div className="p-3.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <div className="flex items-center gap-1.5 font-black text-sm text-slate-900">
                  <span>School Office Broadcast Channel</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Official notices dispatched by Administration (Read-Only)
              </p>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-blue-950 flex items-center gap-1">
                    👤 Mr. Elvis Kiiru • School Office
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Today, 7:00 AM</span>
                </div>
                <div className="text-xs text-slate-800 font-medium">
                  Staff briefing this Friday at 3:00 PM in the Staffroom regarding KNEC portal registration readiness. 📅 🤝
                </div>
              </div>
            </div>

            {/* CHANNEL 3: CLASS ANNOUNCEMENTS */}
            <div className="p-3.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h4 className="font-black text-sm text-slate-900">
                  Class Announcements (Broadcast to Grade Parents)
                </h4>
              </div>

              <form onSubmit={handleSendClassAnnouncement} className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={announceGrade}
                    onChange={(e) => setAnnounceGrade(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </select>

                  <input
                    type="text"
                    value={announceText}
                    onChange={(e) => setAnnounceText(e.target.value)}
                    placeholder="Type an announcement for all parents of this grade..."
                    className="flex-1 p-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-purple-500 text-slate-900"
                    required
                  />

                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send to All Parents 💌</span>
                  </button>
                </div>
              </form>

              <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>
                  Messages are delivered using simple checkmarks ✓✓ so everyone stays informed easily.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =======================================================================
          3. DEDICATED BOTTOM NAVIGATION (WHATSAPP-STYLE TAB BAR)
          ======================================================================= */}
      <nav
        className="absolute bottom-0 inset-x-0 z-40 px-2 py-1.5 border-t border-slate-800/80 shadow-[0_-5px_20px_rgba(0,0,0,0.7)] flex items-center justify-around"
        style={{ backgroundColor: '#0A192F' }}
      >
        {[
          { id: 'timetable', label: 'Timetable', icon: Calendar },
          { id: 'classes', label: 'My Classes', icon: Users },
          { id: 'resources', label: 'Resources', icon: FolderOpen },
          { id: 'assessments', label: 'Assessments', icon: ClipboardList },
          { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-emerald-600 text-white font-black shadow-lg scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-bold mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* =======================================================================
          MODAL: RESCHEDULE / NOT TAUGHT REASON PROMPT
          ======================================================================= */}
      {reschedulePromptLessonId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0A1633] border-2 border-red-500 rounded-2xl p-5 shadow-2xl relative text-left">
            <h4 className="font-black text-base text-white mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Log Reschedule Reason</span>
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              Kenya MOE & QASO audit standards require documenting reasons why scheduled periods were rescheduled:
            </p>

            <div className="space-y-1.5 mb-4">
              {[
                'School Assembly / Inter-House Sports',
                'National Holiday / Gazetted Holiday',
                'External Medical Inspection',
                'Music & Drama Festival Rehearsal',
                'Teacher On Official Duty'
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRescheduleReason(reason)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-semibold transition-all ${
                    rescheduleReason === reason
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {rescheduleReason === reason ? '✓ ' : '• '} {reason}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReschedulePromptLessonId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Confirm Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: PUPIL CBC INDIVIDUAL ASSESSMENT CARD
          ======================================================================= */}
      {inspectingPupil && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-5 shadow-2xl relative border-2 border-amber-400 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectingPupil(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400">
                <img
                  src={inspectingPupil.avatar}
                  alt={inspectingPupil.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">{inspectingPupil.name}</h4>
                <div className="text-xs text-slate-500 font-mono">UPI: {inspectingPupil.upi}</div>
                <div className="text-[11px] font-bold text-blue-700">
                  {inspectingPupil.grade} • Little Roses Academy
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Official CBC Progress Scorecard (30-Mark Standard)
              </h5>

              <div className="space-y-2 text-xs">
                {[
                  { area: 'Mathematics', assign: 9, cat: 19, total: 28, band: 'EE' },
                  { area: 'English Language', assign: 8, cat: 16, total: 24, band: 'EE' },
                  { area: 'Kiswahili', assign: 7, cat: 13, total: 20, band: 'ME' },
                  { area: 'Science & Technology', assign: 6, cat: 12, total: 18, band: 'ME' },
                  { area: 'Creative Arts', assign: 9, cat: 18, total: 27, band: 'EE' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.area}</div>
                      <div className="text-[10px] text-slate-500">
                        Homework: {item.assign}/10 • CAT: {item.cat}/20
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-slate-900">{item.total} / 30</div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-white bg-emerald-600">
                        {item.band}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {inspectingPupil.focusZoneNotes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Teacher Qualitative Observation:</span>
                  </div>
                  <p>{inspectingPupil.focusZoneNotes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                showToast(`Assessment card downloaded for ${inspectingPupil.name}! 📄`);
                setInspectingPupil(null);
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Report Card</span>
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          EDIT LESSON PERIOD MODAL (KEY IN DETAILS)
          ======================================================================= */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border-2 border-blue-500 rounded-3xl w-full max-w-xl p-5 text-white shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    Edit / Key In Period Details
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Customize subject, strand, lesson plan & homework
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLessonEdit} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Subject / Learning Area
                  </label>
                  <input
                    type="text"
                    list="cbe-subjects-list"
                    value={editingLesson.subject}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, subject: e.target.value })
                    }
                    required
                    placeholder="e.g. English, Science..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Grade
                  </label>
                  <select
                    value={editingLesson.grade}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, grade: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Time & Duration
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={editingLesson.time}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, time: e.target.value })
                      }
                      placeholder="08:10"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center text-white font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={editingLesson.duration}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, duration: e.target.value })
                      }
                      placeholder="50 mins"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Topic / Concept
                  </label>
                  <input
                    type="text"
                    value={editingLesson.topic}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, topic: e.target.value })
                    }
                    placeholder="Key in lesson topic..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    value={editingLesson.room}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, room: e.target.value })
                    }
                    placeholder="e.g. Room 4, Science Lab"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                <div className="font-bold text-rose-300 text-xs uppercase flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Day&apos;s Homework / Assignment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Title</label>
                    <input
                      type="text"
                      value={editingLesson.homeworkSheet.title}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          homeworkSheet: {
                            ...editingLesson.homeworkSheet,
                            title: e.target.value
                          }
                        })
                      }
                      placeholder="e.g. Practice Exercise 4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Due Date</label>
                    <input
                      type="text"
                      value={editingLesson.homeworkSheet.dueDate}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          homeworkSheet: {
                            ...editingLesson.homeworkSheet,
                            dueDate: e.target.value
                          }
                        })
                      }
                      placeholder="e.g. Tomorrow 08:00 AM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Instructions & Tasks</label>
                  <textarea
                    rows={2}
                    value={editingLesson.homeworkSheet.description}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        homeworkSheet: {
                          ...editingLesson.homeworkSheet,
                          description: e.target.value
                        }
                      })
                    }
                    placeholder="Key in assignment questions or instructions..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes 💾</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          ADD LESSON PERIOD MODAL
          ======================================================================= */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border-2 border-emerald-500 rounded-3xl w-full max-w-xl p-5 text-white shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    + Add New Lesson Period
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Key in details for a new period in your timetable
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLesson} className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Subject / Learning Area
                  </label>
                  <input
                    type="text"
                    list="cbe-subjects-list"
                    value={newLessonForm.subject}
                    onChange={(e) =>
                      setNewLessonForm({ ...newLessonForm, subject: e.target.value })
                    }
                    required
                    placeholder="e.g. English, Science..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Grade
                  </label>
                  <select
                    value={newLessonForm.grade}
                    onChange={(e) =>
                      setNewLessonForm({ ...newLessonForm, grade: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Time & Duration
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newLessonForm.time}
                      onChange={(e) =>
                        setNewLessonForm({ ...newLessonForm, time: e.target.value })
                      }
                      placeholder="11:40"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center text-white font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={newLessonForm.duration}
                      onChange={(e) =>
                        setNewLessonForm({ ...newLessonForm, duration: e.target.value })
                      }
                      placeholder="50 mins"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-center text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Topic / Concept
                  </label>
                  <input
                    type="text"
                    value={newLessonForm.topic}
                    onChange={(e) =>
                      setNewLessonForm({ ...newLessonForm, topic: e.target.value })
                    }
                    placeholder="Key in lesson topic..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    value={newLessonForm.room}
                    onChange={(e) =>
                      setNewLessonForm({ ...newLessonForm, room: e.target.value })
                    }
                    placeholder="e.g. Room 3"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Homework Title</label>
                  <input
                    type="text"
                    value={newLessonForm.homeworkTitle}
                    onChange={(e) =>
                      setNewLessonForm({ ...newLessonForm, homeworkTitle: e.target.value })
                    }
                    placeholder="e.g. Exercise 1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Due Date</label>
                  <input
                    type="text"
                    value={newLessonForm.dueDate}
                    onChange={(e) =>
                      setNewLessonForm({ ...newLessonForm, dueDate: e.target.value })
                    }
                    placeholder="e.g. Tomorrow 08:00 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Homework Instructions</label>
                <textarea
                  rows={2}
                  value={newLessonForm.homeworkDesc}
                  onChange={(e) =>
                    setNewLessonForm({ ...newLessonForm, homeworkDesc: e.target.value })
                  }
                  placeholder="Key in assignment questions or workbook reference..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Period to Timetable</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MY FOCUS: LEARNER DIAGNOSIS MODAL (SUBJECT -> STRAND -> SUB-STRAND WEAKNESSES)
          ======================================================================= */}
      {focusPupil && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border-2 border-indigo-500 rounded-3xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-black text-base text-white">My Focus: Learner Diagnosis</h3>
                  <p className="text-[10px] text-indigo-300 font-mono">
                    {focusPupil.name} • {focusPupil.grade} ({focusPupil.upi})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFocusPupil(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">
                  🎯 Identified Learning Area Focus (Weakness Diagnosis)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Learning Area (Subject)</span>
                    <span className="font-bold text-white text-xs">{assessSubject}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Term & Pacing</span>
                    <span className="font-bold text-amber-300 text-xs">{assessTerm}</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Strand & Sub-Strand Breakdown</span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-amber-400 font-bold">{assessStrand}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400 font-bold">{assessSubStrand}</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis Finding */}
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-red-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Diagnostic Findings for {focusPupil.name}:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Learner demonstrates comprehension gaps in <strong>{assessStrand}</strong>, specifically struggling with <strong>{assessSubStrand}</strong> applications during daily exercises. Requires targeted teacher scaffolding and offline revision.
                </p>
              </div>

              {/* Remedial Recommendations */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-1.5">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  💡 Teacher Remedial Action Plan
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  <li>Reinforce core concepts using concrete manipulatives and pictorial flashcards.</li>
                  <li>Assign differentiated bite-sized practice questions in workbook.</li>
                  <li>Schedule 10 minutes peer-assisted paired reading during morning prep.</li>
                  <li>Administer an offline diagnostic CAT to verify mastery before end-of-term.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFocusPupil(null);
                  showToast(`Remedial action logged for ${focusPupil.name}! 🎯`);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider text-xs shadow-md cursor-pointer transition-all"
              >
                Close & Record Remedial Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TEACHER PROFILE & BACKGROUND SYSTEM CONTROLS MODAL
          (Pushed to the background to keep main dashboard clean & uncluttered)
          ======================================================================= */}
      {showTeacherProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border border-slate-700 rounded-3xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4 my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-800 flex-shrink-0 shadow-md">
                  {currentTeacher.avatarUrl ? (
                    <img
                      src={currentTeacher.avatarUrl}
                      alt={currentTeacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-sm text-white bg-emerald-700">
                      {currentTeacher.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Tr. {currentTeacher.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {currentTeacher.phone} · {currentTeacher.tier === 'lower' ? 'Lower Primary' : currentTeacher.tier === 'upper' ? 'Upper Primary' : 'Full School'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTeacherProfileModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3.5 text-xs">
              {/* Teaching Allocation */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Teaching Workload
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-900/50 border border-blue-500/40 text-blue-200 font-bold text-xs">
                    Classes: {currentTeacher.assignedGrades?.join(', ') || currentTeacher.assignedGrade}
                  </span>
                  {currentTeacher.subjects?.map((subj) => (
                    <span
                      key={subj}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-semibold text-xs"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Parent-Teacher Family Link */}
              {parentCheck.isParent && (
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                    <span>👨‍👧</span>
                    <span>Parent-Teacher Family Account</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Registered as parent to enrolled learners:{' '}
                    <strong>
                      {parentCheck.linkedChildren.map((c) => `${c.name} (${c.grade})`).join(', ')}
                    </strong>
                    . You can switch roles or review child homework anytime.
                  </p>
                </div>
              )}

              {/* Data Sync & Offline Simulation Mode */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Data Sync & Connectivity
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Offline-First Architecture
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#070D1E] border border-slate-800">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Cloud className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <HardDrive className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <div className="font-bold text-white text-xs">
                        {isOnline ? 'Synced with School Cloud ☁️' : 'Saved to Local Phone 💾'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isOnline
                          ? 'All attendance and marks synced automatically.'
                          : 'Working offline. Local changes stored in device memory.'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOnline(!isOnline);
                      showToast(
                        !isOnline
                          ? 'Switched to Online: Synced with School ☁️'
                          : 'Simulating Offline Mode: Saved to Phone 💾'
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isOnline
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-amber-500 text-neutral-950 font-black'
                    }`}
                  >
                    {isOnline ? 'Simulate Offline' : 'Go Online'}
                  </button>
                </div>
              </div>

              {/* Pedagogical Compliance Summary */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pedagogical Audit Compliance
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-slate-400">Lessons Marked</div>
                    <div className="text-emerald-400 font-extrabold text-xs mt-0.5">✓ Up to Date</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-slate-400">Assignments</div>
                    <div className="text-emerald-400 font-extrabold text-xs mt-0.5">✓ Uploaded</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-slate-400">CBC 30-Marks</div>
                    <div className="text-emerald-400 font-extrabold text-xs mt-0.5">✓ Recorded</div>
                  </div>
                </div>
              </div>

              {/* Reset Timetable Sheet Tool */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <div className="font-bold text-slate-300">Timetable Pacing Reset</div>
                  <div className="text-[10px] text-slate-500">Restore default subject period slots for this teacher</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleResetTimetable();
                    setShowTeacherProfileModal(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Sheet</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                {currentTeacher.isDualAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowTeacherProfileModal(false);
                      onSwitchToAdmin?.();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Switch to School Office 🏫</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowTeacherProfileModal(false);
                    handleTeacherLogout();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Log Out / Switch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          INTERACTIVE CAT STUDIO MODAL (A, B, C, D CHOICES • ONLINE & OFFLINE)
          ======================================================================= */}
      {showCatStudio && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border-2 border-amber-400 rounded-3xl w-full max-w-2xl p-5 text-white shadow-2xl space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-base text-white">Interactive CAT Studio (Choices A, B, C, D)</h3>
                  <p className="text-[10px] text-amber-300 font-mono">
                    {assessGrade} • {assessSubject} • 20 Marks Total (4 Marks per Question)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCatStudio(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode & Target Learner Bar */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                  Submission Mode
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCatMode('online')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      catMode === 'online'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 Online (AI Graded)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatMode('offline')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      catMode === 'offline'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    📝 Offline (Teacher Filled)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                  Target Learner
                </label>
                <select
                  value={catTargetUpi}
                  onChange={(e) => {
                    setCatTargetUpi(e.target.value);
                    setCatScoreResult(null);
                  }}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  {filteredPupils.map((p) => (
                    <option key={p.upi} value={p.upi}>
                      {p.name} ({p.upi})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Offline-First Low Network Notice */}
            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between">
              <span>⚡ Offline Engine Active: Responses cached locally. Consumes 0 KB network.</span>
              <span className="font-mono text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded-md text-emerald-200">
                Low Bandwidth Pacing
              </span>
            </div>

            {/* Questions List */}
            {(() => {
              const questions = getCatQuestionsForSubject(assessSubject, assessGrade);
              return (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-xs">
                          {idx + 1}. {q.question}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md flex-shrink-0">
                          {q.marks} Marks
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400">
                        Strand: {q.strand} → {q.subStrand}
                      </div>

                      {/* 4 Choices: A, B, C, D */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isSelected = catAnswers[q.id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() =>
                                setCatAnswers((prev) => ({ ...prev, [q.id]: opt.key }))
                              }
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-md font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-amber-400 text-neutral-950'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span className="text-xs">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Submission and Result */}
                  {catScoreResult && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-white flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🎉</span>
                        <div>
                          <h4 className="font-black text-sm text-emerald-300">
                            CAT Graded: {catScoreResult.score} / {catScoreResult.total} Marks!
                          </h4>
                          <p className="text-[11px] text-slate-300">
                            Recorded into official CBC 30-mark book for{' '}
                            {filteredPupils.find((p) => p.upi === catTargetUpi)?.name || catTargetUpi}.
                          </p>
                        </div>
                      </div>
                      <span className="text-base font-black font-mono text-amber-300 bg-amber-400/20 px-3 py-1 rounded-xl border border-amber-400/50">
                        {Math.round((catScoreResult.score / catScoreResult.total) * 100)}%
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleGradeCat(catTargetUpi, questions)}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{catMode === 'online' ? 'Submit & Grade with AI' : 'Lock Offline Score to Markbook'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCatStudio(false)}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* =======================================================================
          STORYBOOK APPROVAL WORKBENCH MODAL (TEACHER APPROVAL REQUIRED)
          ======================================================================= */}
      {inspectingStorybook && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B152E] border-2 border-emerald-400 rounded-3xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{inspectingStorybook.coverEmoji}</span>
                <div>
                  <h3 className="font-black text-base text-white">{inspectingStorybook.title}</h3>
                  <p className="text-[10px] text-emerald-300 font-mono">
                    {inspectingStorybook.language} Activities • {inspectingStorybook.grade || 'Lower Primary'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingStorybook(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum Alignment</span>
                <p className="text-amber-300 font-bold text-xs">{inspectingStorybook.strandMapping}</p>
              </div>

              {/* Story Excerpt */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Story Content / Reader Passage</span>
                <p className="text-slate-200 text-xs italic leading-relaxed">
                  &ldquo;{inspectingStorybook.excerpt}&rdquo;
                </p>
              </div>

              {/* Comprehension Q&A */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Comprehension Checks</span>
                {inspectingStorybook.questions.map((q, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="font-bold text-white text-xs">Q{idx + 1}: {q.question}</p>
                    <p className="text-emerald-400 text-[11px]">Ans: {q.answer}</p>
                  </div>
                ))}
              </div>

              {/* Strict Teacher Authority Notice */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/60 text-amber-200 space-y-1">
                <span className="font-bold text-xs block">🛡️ Teacher Authorization Protocol:</span>
                <p className="text-[11px] text-slate-300">
                  By clicking approve, you verify that this storybook matches KICD curriculum design and is pedagogically sound for your pupils.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {!inspectingStorybook.approvedByTeacher ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveStorybook(inspectingStorybook.id);
                      setInspectingStorybook(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Approve & Publish Storybook ✔</span>
                  </button>
                ) : (
                  <div className="flex-1 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Approved & Cleared for Learners</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setInspectingStorybook(null)}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
