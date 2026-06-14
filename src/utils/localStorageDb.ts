import { DailyLog, Session, Task, UserProfile, DBTheme } from '../types';

export const LOCAL_STORAGE_KEYS = {
  PROFILE: 'reva_study_profile',
  DAILY_LOGS: 'reva_study_daily_logs',
  SESSIONS: 'reva_study_sessions',
  TASKS: 'reva_study_tasks',
  OFFLINE_MUTATIONS: 'reva_study_offline_mutations',
};

export interface OfflineMutations {
  dailyLogs: Record<string, 'upsert' | 'delete'>;
  sessions: Record<string, 'upsert' | 'delete'>;
  tasks: Record<string, 'upsert' | 'delete'>;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: 'anonymous',
  email: 'offline@reva.edu.in',
  displayName: 'REVA Scholar',
  college: 'REVA University',
  cgpa: 7.13,
  targetSGPA: 8.5,
  targetLeetcode: 150,
  theme: 'cosmic',
  focusSound: 'zen',
  shortBreakSound: 'chime',
  longBreakSound: 'digital',
};

export const loadLocalProfile = (): UserProfile => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE);
  if (!data) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveLocalProfile = (profile: UserProfile) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const loadLocalDailyLogs = (): Record<string, DailyLog> => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_LOGS);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

export const saveLocalDailyLogs = (logs: Record<string, DailyLog>) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
};

export const loadLocalSessions = (): Session[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSIONS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveLocalSessions = (sessions: Session[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const loadLocalTasks = (): Task[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const loadOfflineMutations = (): OfflineMutations => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFLINE_MUTATIONS);
  if (!data) return { dailyLogs: {}, sessions: {}, tasks: {} };
  try {
    return JSON.parse(data);
  } catch {
    return { dailyLogs: {}, sessions: {}, tasks: {} };
  }
};

export const saveOfflineMutations = (mutations: OfflineMutations) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.OFFLINE_MUTATIONS, JSON.stringify(mutations));
};

export const addOfflineMutation = (type: 'dailyLogs' | 'sessions' | 'tasks', id: string, action: 'upsert' | 'delete') => {
  const mut = loadOfflineMutations();
  mut[type][id] = action;
  saveOfflineMutations(mut);
};

export const clearOfflineMutations = () => {
  saveOfflineMutations({ dailyLogs: {}, sessions: {}, tasks: {} });
};
