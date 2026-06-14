import { BreakSoundType } from './utils/audio';

export type DBTheme = 'slate' | 'cosmic' | 'emerald' | 'amber' | 'indigo';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  college: string;
  cgpa: number;
  targetSGPA: number;
  targetLeetcode: number;
  theme: DBTheme;
  focusSound?: BreakSoundType;
  shortBreakSound?: BreakSoundType;
  longBreakSound?: BreakSoundType;
  createdAt?: any;
  updatedAt?: any;
}

export interface DailyLog {
  userId: string;
  date: string; // YYYY-MM-DD
  completedTasks: string[]; // e.g. ["dsa", "java", "college", "cyber", "communication", "sleep"]
  dsaSolved: number; // custom number input
  focusMinutes: number; // focus session aggregate
  notes: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Session {
  id: string;
  userId: string;
  category: StudyCategory;
  duration: number; // minutes
  date: string; // YYYY-MM-DD
  createdAt: any;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: StudyCategory;
  dueDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  isRecurring: boolean;
  recurrence: 'none' | 'daily' | 'weekly';
  createdAt?: any;
}

export type StudyCategory = 'dsa' | 'java' | 'college' | 'cyber' | 'communication' | 'sleep';

export interface StudyItemConfig {
  id: StudyCategory;
  name: string;
  description: string;
  targetDuration: string;
  targetMinutes: number;
  color: string;
  icon: string;
}

export const STUDY_CATEGORIES_CONFIG: Record<StudyCategory, StudyItemConfig> = {
  dsa: {
    id: 'dsa',
    name: 'DSA Coding Practice',
    description: 'Arrays, Strings, Linked Lists, LeetCode focus',
    targetDuration: '1 Hour',
    targetMinutes: 60,
    color: 'emerald',
    icon: 'Code2',
  },
  java: {
    id: 'java',
    name: 'Java & Placement Prep',
    description: 'OOPs, Collections, SQL, Mock tests',
    targetDuration: '1.5 Hours',
    targetMinutes: 90,
    color: 'amber',
    icon: 'FileCode',
  },
  college: {
    id: 'college',
    name: 'College Subjects',
    description: 'Classes, Notes, Assignments, SGPA improvements',
    targetDuration: '1 Hour (Self Study)',
    targetMinutes: 60,
    color: 'sky',
    icon: 'GraduationCap',
  },
  cyber: {
    id: 'cyber',
    name: 'Ethical Hacking & Cybersecurity',
    description: 'Networking, Linux, TryHackMe, OWASP',
    targetDuration: '1 Hour',
    targetMinutes: 60,
    color: 'red',
    icon: 'ShieldAlert',
  },
  communication: {
    id: 'communication',
    name: 'Communication & Interview',
    description: 'Word of the day, speaking aloud, HR prep',
    targetDuration: '30 Mins',
    targetMinutes: 30,
    color: 'purple',
    icon: 'MessageSquareShare',
  },
  sleep: {
    id: 'sleep',
    name: 'Optimal Sleep',
    description: 'Rest of at least 6-7.5+ hours',
    targetDuration: '7.5 Hours',
    targetMinutes: 450,
    color: 'indigo',
    icon: 'Moon',
  },
};
