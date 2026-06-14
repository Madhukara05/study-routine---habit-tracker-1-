import { useTheme } from './ThemeContext';
import { DailyLog, Session, STUDY_CATEGORIES_CONFIG, StudyCategory } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { Flame, Star, Hourglass, Calendar, Trophy, BookOpen, Smile, AlertCircle } from 'lucide-react';

interface StatsProps {
  logs: Record<string, DailyLog>;
  sessions: Session[];
  targetLeetcode: number;
  currentCGPA: number;
  targetSGPA: number;
}

export default function Stats({ logs, sessions, targetLeetcode, currentCGPA, targetSGPA }: StatsProps) {
  const { getCardColor } = useTheme();

  // 1. Calculate Streats
  const calculateStreak = () => {
    const dates = Object.keys(logs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (dates.length === 0) return { current: 0, longest: 0 };

    let current = 0;
    let longest = 0;
    let currentCount = 0;

    // Fetch chronological order
    const sortedDates = [...dates].reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Calculate current streak
    let hasTodayOrYesterday = dates.includes(todayStr) || dates.includes(yesterdayStr);
    if (hasTodayOrYesterday) {
      let checkDate = new Date();
      if (!dates.includes(todayStr) && dates.includes(yesterdayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dates.includes(checkStr)) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let tempStreak = 0;
    let prevTime: number | null = null;

    for (let i = 0; i < sortedDates.length; i++) {
      const currTime = new Date(sortedDates[i]).getTime();
      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currTime - prevTime) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      longest = Math.max(longest, tempStreak);
      prevTime = currTime;
    }

    return { current, longest: Math.max(longest, current) };
  };

  const { current: currentStreak, longest: longestStreak } = calculateStreak();

  // 2. Aggregate category study times from completed Focus Sessions
  const getCategoryCompletionData = () => {
    const dataMap: Record<StudyCategory, number> = {
      dsa: 0,
      java: 0,
      college: 0,
      cyber: 0,
      communication: 0,
      sleep: 0,
    };

    sessions.forEach(session => {
      if (dataMap[session.category] !== undefined) {
        dataMap[session.category] += session.duration;
      }
    });

    return Object.entries(STUDY_CATEGORIES_CONFIG).map(([key, config]) => ({
      name: config.name.split(' ')[0], // short name
      fullName: config.name,
      minutes: dataMap[key as StudyCategory] || 0,
      target: config.targetMinutes,
      color: config.color,
    }));
  };

  const categoryChartData = getCategoryCompletionData();

  // 3. Aggregate last 7 days daily minutes
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Daily minutes from focus logs
      const log = logs[dateStr];
      const focusMinutes = log ? log.focusMinutes : 0;
      const tasksCompletedCount = log ? log.completedTasks.length : 0;
      const dsaSolvedCount = log ? log.dsaSolved : 0;

      days.push({
        name: dayName,
        date: dateStr,
        minutes: focusMinutes,
        tasks: tasksCompletedCount,
        dsa: dsaSolvedCount,
      });
    }
    return days;
  };

  const dayChartData = getLast7DaysData();

  // 4. Cumulative placement objectives met
  const totalDsaProblemsSolved = Object.values(logs).reduce((acc, curr) => acc + (curr.dsaSolved || 0), 0);
  const totalFocusMinutes = Object.values(logs).reduce((acc, curr) => acc + (curr.focusMinutes || 0), 0) + sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

  // Study habit non-negotiable target performance average
  const totalLogEntriesCount = Object.keys(logs).length || 1;
  const averageDailyItemsCompleted = Math.round((Object.values(logs).reduce((acc, curr) => acc + (curr.completedTasks || []).length, 0) / totalLogEntriesCount) * 10) / 10;

  return (
    <div className="space-y-6" id="stats_panel">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className={`p-4 rounded-xl ${getCardColor()} flex items-center gap-3.5 border-l-4 border-l-orange-500`}>
          <div className="p-2.5 rounded-lg bg-orange-950/40 text-orange-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Active Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{currentStreak}</span>
              <span className="text-xs text-zinc-400">Days</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">Longest: {longestStreak} days</span>
          </div>
        </div>

        {/* LeetCode card */}
        <div className={`p-4 rounded-xl ${getCardColor()} flex items-center gap-3.5 border-l-4 border-l-emerald-500`}>
          <div className="p-2.5 rounded-lg bg-emerald-950/40 text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">LeetCode Problems</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{totalDsaProblemsSolved}</span>
              <span className="text-xs text-zinc-400">/ {targetLeetcode}</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              {Math.min(100, Math.round((totalDsaProblemsSolved / targetLeetcode) * 100))}% completed
            </span>
          </div>
        </div>

        {/* Focus Hours card */}
        <div className={`p-4 rounded-xl ${getCardColor()} flex items-center gap-3.5 border-l-4 border-l-blue-500`}>
          <div className="p-2.5 rounded-lg bg-blue-950/30 text-blue-400">
            <Hourglass className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Total focus study</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{totalHours}</span>
              <span className="text-xs text-zinc-400">Hours</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">From Pomodoro timer</span>
          </div>
        </div>

        {/* Academics tracker card */}
        <div className={`p-4 rounded-xl ${getCardColor()} flex items-center gap-3.5 border-l-4 border-l-rose-500`}>
          <div className="p-2.5 rounded-lg bg-rose-950/40 text-rose-400">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">7th Sem Academic</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{targetSGPA}</span>
              <span className="text-xs text-zinc-400">Target SGPA</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">Current CGPA: {currentCGPA}</span>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Focus minutes over time */}
        <div className={`p-5 rounded-2xl ${getCardColor()}`}>
          <h3 className="text-sm font-bold tracking-tight text-zinc-200 mb-4 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-violet-400" />
            7-Day Focus Time (Minutes)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={dayChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8, color: '#f4f4f5' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="minutes" name="Focus Mins" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregated distribution comparison */}
        <div className={`p-5 rounded-2xl ${getCardColor()}`}>
          <h3 className="text-sm font-bold tracking-tight text-zinc-200 mb-4 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal-400" />
            Study Topic Focus Weight
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8, color: '#f4f4f5' }}
                />
                <Bar dataKey="minutes" name="Minutes Focused" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Routine Compliance Report Card */}
      <div className={`p-5 rounded-2xl ${getCardColor()} flex flex-col sm:flex-row items-center justify-between gap-6`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-950/50 text-violet-400 border border-violet-850">
            <Smile className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Consistency score: {averageDailyItemsCompleted} / 6 daily</h4>
            <p className="text-xs text-zinc-400 max-w-md mt-1">
              On average, you are completing {averageDailyItemsCompleted} out of 6 daily non-negotiables. Never let a single day hit a ZERO study progress metric!
            </p>
          </div>
        </div>
        <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-850 text-center w-full sm:w-auto">
          <span className="text-[10px] text-zinc-500 uppercase font-black block tracking-wider">Placements goal weight</span>
          <span className="text-lg font-black text-emerald-400 font-mono">50% Priority (DSA + Java)</span>
        </div>
      </div>
    </div>
  );
}
