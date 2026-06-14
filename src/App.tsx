import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

import { auth, db, googleProvider, OperationType, handleFirestoreError } from './firebase';
import { UserProfile, DailyLog, Session, Task, StudyCategory, DBTheme } from './types';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import Timer from './components/Timer';
import Stats from './components/Stats';
import DailyLogEditor from './components/DailyLogEditor';
import TaskPlanner from './components/TaskPlanner';
import ProfileViewer from './components/ProfileViewer';
import TimetableGuide from './components/TimetableGuide';

import {
  loadLocalProfile,
  saveLocalProfile,
  loadLocalDailyLogs,
  saveLocalDailyLogs,
  loadLocalSessions,
  saveLocalSessions,
  loadLocalTasks,
  saveLocalTasks,
} from './utils/localStorageDb';

import { 
  BookOpen, 
  CalendarCheck, 
  Sparkles, 
  Award, 
  Heart, 
  ChevronRight, 
  CheckSquare, 
  Flame, 
  Timer as TimerIcon, 
  BarChart2, 
  CheckCircle, 
  Settings, 
  Wifi, 
  WifiOff, 
  LogOut,
  User as UserIcon
} from 'lucide-react';

function DashboardShell() {
  const { theme, getBgColor, getCardColor } = useTheme();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logger' | 'planner' | 'analytics' | 'profile'>('dashboard');

  // Application general states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Core study progress records
  const [profile, setProfile] = useState<UserProfile>(loadLocalProfile());
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(loadLocalDailyLogs());
  const [sessions, setSessions] = useState<Session[]>(loadLocalSessions());
  const [tasks, setTasks] = useState<Task[]>(loadLocalTasks());

  // Listen for online status Changes
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Fetch Firestore records whenever user logs in
  const syncWithCloud = useCallback(async (user: FirebaseUser) => {
    try {
      // 1. Fetch user settings
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let fetchedProfile = profile;
      if (userSnap.exists()) {
        fetchedProfile = {
          focusSound: 'zen',
          shortBreakSound: 'chime',
          longBreakSound: 'digital',
          ...(userSnap.data() as UserProfile)
        };
        setProfile(fetchedProfile);
        saveLocalProfile(fetchedProfile);
      } else {
        // Create user in firestore if not exists
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || 'offline@reva.edu.in',
          displayName: user.displayName || 'REVA Scholar',
          college: 'REVA University',
          cgpa: 7.13,
          targetSGPA: 8.5,
          targetLeetcode: 150,
          theme: 'cosmic',
          focusSound: 'zen',
          shortBreakSound: 'chime',
          longBreakSound: 'digital',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, initialProfile);
        setProfile(initialProfile);
        saveLocalProfile(initialProfile);
      }

      // 2. Sync Daily Logs
      const logsPath = `users/${user.uid}/daily_logs`;
      const logsSnap = await getDocs(collection(db, logsPath));
      const fetchedLogs: Record<string, DailyLog> = {};
      logsSnap.forEach((docSnap) => {
        fetchedLogs[docSnap.id] = docSnap.data() as DailyLog;
      });
      if (Object.keys(fetchedLogs).length > 0) {
        setDailyLogs(fetchedLogs);
        saveLocalDailyLogs(fetchedLogs);
      } else {
        // Upload local daily logs initially if offline entries exist
        const batch = writeBatch(db);
        const localLogs = loadLocalDailyLogs();
        Object.entries(localLogs).forEach(([dateStr, log]) => {
          const docRef = doc(db, `users/${user.uid}/daily_logs`, dateStr);
          batch.set(docRef, { ...log, userId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        });
        await batch.commit();
      }

      // 3. Sync Sessions
      const sessionsPath = `users/${user.uid}/sessions`;
      const sessionsSnap = await getDocs(collection(db, sessionsPath));
      const fetchedSessions: Session[] = [];
      sessionsSnap.forEach((docSnap) => {
        fetchedSessions.push(docSnap.data() as Session);
      });
      if (fetchedSessions.length > 0) {
        setSessions(fetchedSessions);
        saveLocalSessions(fetchedSessions);
      } else {
        // Upload local sessions if offline entries exist
        const batch = writeBatch(db);
        const localSessions = loadLocalSessions();
        localSessions.forEach((sess) => {
          const docRef = doc(db, `users/${user.uid}/sessions`, sess.id);
          batch.set(docRef, { ...sess, userId: user.uid, createdAt: serverTimestamp() });
        });
        await batch.commit();
      }

      // 4. Sync Tasks
      const tasksPath = `users/${user.uid}/tasks`;
      const tasksSnap = await getDocs(collection(db, tasksPath));
      const fetchedTasks: Task[] = [];
      tasksSnap.forEach((docSnap) => {
        fetchedTasks.push(docSnap.data() as Task);
      });
      if (fetchedTasks.length > 0) {
        setTasks(fetchedTasks);
        saveLocalTasks(fetchedTasks);
      } else {
        // Upload local tasks if offline entries exist
        const batch = writeBatch(db);
        const localTasks = loadLocalTasks();
        localTasks.forEach((tsk) => {
          const docRef = doc(db, `users/${user.uid}/tasks`, tsk.id);
          batch.set(docRef, { ...tsk, userId: user.uid, createdAt: serverTimestamp() });
        });
        await batch.commit();
      }

    } catch (err) {
      console.error('Error synchronizing with cloud:', err);
    }
  }, [profile]);

  // Handle Authentication Change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user) {
        await syncWithCloud(user);
      } else {
        // Default anonymous profile reset
        setProfile(loadLocalProfile());
        setDailyLogs(loadLocalDailyLogs());
        setSessions(loadLocalSessions());
        setTasks(loadLocalTasks());
      }
    });

    return () => unsubscribe();
  }, [syncWithCloud]);

  const handleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        alert(`👋 Welcome ${res.user.displayName || 'scholar'}! Syncing study progress across devices.`);
      }
    } catch (err) {
      alert('Login cancelled or failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out? Your records will remain safe and stored locally.')) {
      await signOut(auth);
      alert('Signed out successfully.');
    }
  };

  // 1. Increment study metrics via completed Pomodoro focus timer
  const handleSessionComplete = async (category: StudyCategory, duration: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userUid = firebaseUser?.uid || 'anonymous';

    // A. Record Focus session item
    const newSession: Session = {
      id: 'session_' + Math.random().toString(36).substring(2, 9),
      userId: userUid,
      category,
      duration,
      date: todayStr,
      createdAt: new Date().toISOString(),
    };

    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    saveLocalSessions(nextSessions);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, `users/${firebaseUser.uid}/sessions`, newSession.id), {
          ...newSession,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/sessions/${newSession.id}`);
      }
    }

    // B. Automatically update focus hours in today's daily log!
    const updatedLogs = { ...dailyLogs };
    if (!updatedLogs[todayStr]) {
      updatedLogs[todayStr] = {
        userId: userUid,
        date: todayStr,
        completedTasks: [],
        dsaSolved: 0,
        focusMinutes: duration,
        notes: `Focus timer completed for ${category}!`,
      };
    } else {
      updatedLogs[todayStr] = {
        ...updatedLogs[todayStr],
        focusMinutes: (updatedLogs[todayStr].focusMinutes || 0) + duration,
      };
    }

    // Automatically check non-negotiable tasks completion
    const targetConfig = updatedLogs[todayStr];
    if (targetConfig.focusMinutes >= 60 && !targetConfig.completedTasks.includes('college')) {
      // Checked college subject focus
      if (category === 'college') targetConfig.completedTasks.push('college');
    }

    setDailyLogs(updatedLogs);
    saveLocalDailyLogs(updatedLogs);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, `users/${firebaseUser.uid}/daily_logs`, todayStr), {
          ...updatedLogs[todayStr],
          userId: firebaseUser.uid,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/daily_logs/${todayStr}`);
      }
    }
  };

  // 2. Save Daily Progress Log via Logger Checklists.
  const handleSaveLog = async (log: DailyLog) => {
    const userUid = firebaseUser?.uid || 'anonymous';
    const logToSave = { ...log, userId: userUid };

    const updatedLogs = { ...dailyLogs, [log.date]: logToSave };
    setDailyLogs(updatedLogs);
    saveLocalDailyLogs(updatedLogs);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, `users/${firebaseUser.uid}/daily_logs`, log.date), {
          ...logToSave,
          userId: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/daily_logs/${log.date}`);
      }
    }
  };

  // 3. Planner Action: Create Task
  const handleAddTask = async (taskFields: Omit<Task, 'id' | 'userId'>) => {
    const userUid = firebaseUser?.uid || 'anonymous';
    const newTask: Task = {
      ...taskFields,
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      userId: userUid,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, `users/${firebaseUser.uid}/tasks`, newTask.id), {
          ...newTask,
          userId: firebaseUser.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/tasks/${newTask.id}`);
      }
    }
  };

  // 4. Planner Action: Toggle State
  const handleToggleTask = async (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);

    const targetTask = updatedTasks.find(t => t.id === id);
    if (firebaseUser && targetTask) {
      try {
        await setDoc(doc(db, `users/${firebaseUser.uid}/tasks`, id), {
          ...targetTask,
          userId: firebaseUser.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/tasks/${id}`);
      }
    }
  };

  // 5. Planner Action: Delete Task
  const handleDeleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);

    if (firebaseUser) {
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, `users/${firebaseUser.uid}/tasks`, id));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/tasks/${id}`);
      }
    }
  };

  // 6. Profile Action: Save configuration setting
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    saveLocalProfile(updatedProfile);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...updatedProfile,
          userId: firebaseUser.uid,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }
    }
  };

  // Allows timetable cards to easily start custom focus preset clocks
  const handleStartSmartFocus = (category: string) => {
    setActiveTab('dashboard');
    // Start session type or preset
  };

  return (
    <div className={`min-h-screen ${getBgColor()} transition-colors duration-300 font-sans pb-12`}>
      {/* Top Header bar with college details */}
      <header className="border-b border-zinc-900 bg-zinc-950/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black shadow-lg shadow-violet-950/50">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                REVA Placement Progress Tracker
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-900">
                  Target 8.5+ SGPA
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 font-semibold leading-none">3rd Year ISE • 6-Month Study Routiner</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection state */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-300 hidden sm:inline">Online Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-300 hidden sm:inline">Offline Mode</span>
                </>
              )}
            </div>

            {/* Profile sign in option */}
            {authLoading ? (
              <div className="w-24 h-8 bg-zinc-900 rounded-lg animate-pulse" />
            ) : firebaseUser ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-zinc-300 hidden md:inline">
                  {firebaseUser.displayName?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="py-1.5 px-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Sync Progress
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Structural Grid Section */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Unified Study Sidebar controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`p-4 rounded-2xl ${getCardColor()} space-y-2`}>
              <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider block px-2 mb-3">Study Navigation</span>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <TimerIcon className="w-4.5 h-4.5" />
                <span className="text-xs">Dashboard & Focus</span>
              </button>

              <button
                onClick={() => setActiveTab('logger')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'logger' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <CheckSquare className="w-4.5 h-4.5" />
                <span className="text-xs">Daily progress Logger</span>
              </button>

              <button
                onClick={() => setActiveTab('planner')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'planner' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <CalendarCheck className="w-4.5 h-4.5" />
                <span className="text-xs">Tasks & College Goals</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <BarChart2 className="w-4.5 h-4.5" />
                <span className="text-xs">Streaks & Statistics</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/40' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Settings className="w-4.5 h-4.5" />
                <span className="text-xs">Academic Targets</span>
              </button>
            </div>

            {/* Goal focus breakdown widget */}
            <div className={`p-4 rounded-xl ${getCardColor()} space-y-3.5`}>
              <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Placement Strategy Map</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Placements Readiness</span>
                  <span className="text-emerald-400 font-extrabold">50% Priority</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '50%' }} />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">7th Sem CGPA Growth</span>
                  <span className="text-violet-400 font-extrabold">25% Priority</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-violet-500 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Unified Content Frame */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* CONDITIONAL RENDER CHANNELS */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                  <Timer onSessionComplete={handleSessionComplete} profile={profile} />
                </div>
                <div className="md:col-span-3">
                  <TimetableGuide onStartPomodoroWithCategory={handleStartSmartFocus} />
                </div>
              </div>
            )}

            {activeTab === 'logger' && (
              <DailyLogEditor logs={dailyLogs} onSaveLog={handleSaveLog} />
            )}

            {activeTab === 'planner' && (
              <TaskPlanner 
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'analytics' && (
              <Stats 
                logs={dailyLogs}
                sessions={sessions}
                targetLeetcode={profile.targetLeetcode}
                currentCGPA={profile.cgpa}
                targetSGPA={profile.targetSGPA}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileViewer 
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                isOnline={isOnline}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            )}

          </div>

        </div>
      </main>

      {/* Professional developer credits footer */}
      <footer className="mt-16 text-center text-[11px] text-zinc-600">
        <p>© 2026 REVA University ISE study progress habit system. No zero days allowed. 🚀</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardShell />
    </ThemeProvider>
  );
}
