import { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Clock, Book, HelpCircle, Star, CalendarPlus, ChevronRight, Play } from 'lucide-react';

interface TimetableGuideProps {
  onStartPomodoroWithCategory: (category: string) => void;
}

const MON_SAT_SLOTS = [
  { time: '6:00 AM – 6:30 AM', title: 'Communication Practice', desc: 'Read English article aloud, learn 5 new words, 2-min verbal speech summary', category: 'communication' },
  { time: '6:30 AM – 7:30 AM', title: 'DSA Practice', desc: 'Arrays, Strings, Linked Lists, LeetCode focus', category: 'dsa' },
  { time: '8:30 AM – 3:30 PM', title: 'College Classes (REVA University)', desc: 'Use short breaks for Java MCQs, aptitude questions, vocabulary', category: 'college' },
  { time: '4:30 PM – 6:00 PM', title: 'Java + Placement Prep', desc: 'Mon: Basics | Tue: OOPs | Wed: Collections | Thu: SQL | Fri: DSA Rev | Sat: Mock', category: 'java' },
  { time: '6:00 PM – 7:00 PM', title: 'College Subjects Self-Study', desc: 'Notes, home assignments, internal exam files, SGPA boost', category: 'college' },
  { time: '7:30 PM – 9:00 PM', title: 'Dinner + Relax', desc: 'Healthy breaks. No coding, rest your focus.', category: 'rest' },
  { time: '9:00 PM – 10:00 PM', title: 'Cybersecurity & Ethical Hacking', desc: 'Networking, Linux, TryHackMe, OWASP, project labs', category: 'cyber' },
  { time: '10:00 PM – 10:30 PM', title: 'Interview & HR Preparation', desc: "Practice 'Tell me about yourself', record audio, review HR FAQ sheets", category: 'communication' },
];

const SUN_SLOTS = [
  { time: '7:00 AM – 9:00 AM', title: 'LeetCode Round & DSA Run', desc: 'Unbounded problems solving session', category: 'dsa' },
  { time: '10:00 AM – 12:00 PM', title: 'Cybersecurity Active Labs', desc: 'TryHackMe, Hack The Box Academy lab models', category: 'cyber' },
  { time: '2:00 PM – 4:00 PM', title: 'Semester Subjects Review', desc: 'Synthesize academic assignments & lecture notes', category: 'college' },
  { time: '5:00 PM – 6:00 PM', title: 'Mock Aptitude Test', desc: 'Solve logical, quant, and verbal test questions', category: 'java' },
  { time: '7:00 PM – 8:00 PM', title: 'Mock Technical Interview', desc: 'Simulate developer interviews and resume reviews', category: 'communication' },
];

const DAILY_JAVA_THEMES: Record<number, { day: string; topic: string }> = {
  1: { day: 'Monday', topic: 'Java Basics & Fundamentals' },
  2: { day: 'Tuesday', topic: 'Core Object-Oriented Programming (OOPs)' },
  3: { day: 'Wednesday', topic: 'Java Collections Framework' },
  4: { day: 'Thursday', topic: 'SQL Queries, Joins, Group By' },
  5: { day: 'Friday', topic: 'DSA Revision & Leetcode rerun' },
  6: { day: 'Saturday', topic: 'Mock Technical Coding Test' },
  0: { day: 'Sunday', topic: 'Weekly Mock review & Prep planning' },
};

export default function TimetableGuide({ onStartPomodoroWithCategory }: TimetableGuideProps) {
  const { getCardColor } = useTheme();
  const [activeTab, setActiveTab] = useState<'week' | 'sunday'>('week');

  // Dynamically obtain current day and recommendation topic
  const currentDate = new Date();
  const localDayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Mon...
  const localHour = currentDate.getHours();

  const getDayDetails = () => {
    return DAILY_JAVA_THEMES[localDayOfWeek] || { day: 'Weekday', topic: 'Java + Placement Preparation' };
  };

  const dayDetails = getDayDetails();

  // Smart recommender logic
  const getSmartRecommendation = () => {
    const isSunday = localDayOfWeek === 0;

    if (isSunday) {
      if (localHour >= 7 && localHour < 9) {
        return { title: 'LeetCode Round & DSA Run', category: 'dsa', msg: 'Launch custom timer for active LeetCode sessions!' };
      } else if (localHour >= 10 && localHour < 12) {
        return { title: 'Cybersecurity Labs', category: 'cyber', msg: 'Hack TryHackMe rooms! Set your custom study clock.' };
      } else if (localHour >= 14 && localHour < 16) {
        return { title: 'Semester Subjects Review', category: 'college', msg: 'Review assignments, keep your SGPA above 8.5!' };
      } else if (localHour >= 17 && localHour < 18) {
        return { title: 'Mock Aptitude Test', category: 'java', msg: 'Time to solve logical reasoning quant sheets.' };
      } else if (localHour >= 19 && localHour < 20) {
        return { title: 'Mock Technical Interview', category: 'communication', msg: 'Read out your responses clearly.' };
      }
    } else {
      // Monday to Saturday
      if (localHour === 6) {
        return { title: 'Communication Practice', category: 'communication', msg: 'Speak out loud. Learn 5 new words now!' };
      } else if (localHour === 7) {
        return { title: 'DSA Practice', category: 'dsa', msg: 'Time to code! Solve string and array challenges.' };
      } else if (localHour >= 8 && localHour < 15) {
        return { title: 'College Classes at REVA', category: 'college', msg: 'Pay active attention in classes at REVA.' };
      } else if (localHour >= 16 && localHour < 18) {
        return { title: `Java Placement: ${dayDetails.topic}`, category: 'java', msg: `Focus: ${dayDetails.topic}. Set target clock!` };
      } else if (localHour === 18) {
        return { title: 'College Subjects Self Study', category: 'college', msg: 'Improve your semester concepts.' };
      } else if (localHour === 21) {
        return { title: 'Cybersecurity Ethical Hacking', category: 'cyber', msg: 'Work on Linux commands or TryHackMe pathways.' };
      } else if (localHour === 22) {
        return { title: 'Interview & HR Prep', category: 'communication', msg: 'Record your answers and evaluate.' };
      }
    }

    return { 
      title: 'Self-Directed Focused Study', 
      category: 'dsa', 
      msg: 'No specific schedule slot right now. Keep your streak alive with a focused DSA or placement revision!' 
    };
  };

  const recommendation = getSmartRecommendation();

  return (
    <div className="space-y-6" id="smart_schedule_timetable">
      {/* Smart Scheduler Alert banner */}
      <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
            <h4 className="text-xs font-black text-violet-200 uppercase tracking-widest">Active Schedule Slot Recommendation</h4>
          </div>
          <p className="text-sm font-bold text-white">{recommendation.title}</p>
          <p className="text-xs text-zinc-400">{recommendation.msg}</p>
        </div>
        
        {recommendation.category !== 'rest' && (
          <button
            onClick={() => onStartPomodoroWithCategory(recommendation.category)}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg transition shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Focus Timer</span>
          </button>
        )}
      </div>

      {/* Routine list layout */}
      <div className={`p-6 rounded-2xl ${getCardColor()} space-y-4`}>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-zinc-100">Timetable Scheduler Guide</span>
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850">
            <button
              onClick={() => setActiveTab('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'week' 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Mon - Sat
            </button>
            <button
              onClick={() => setActiveTab('sunday')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'sunday' 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sunday
            </button>
          </div>
        </div>

        {activeTab === 'week' ? (
          <div className="space-y-3">
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-900 flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-medium">Daily Java Focus (Today Is {dayDetails.day})</span>
              <span className="text-xs text-violet-300 font-bold">{dayDetails.topic}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {MON_SAT_SLOTS.map((slot, index) => (
                <div 
                  key={index}
                  className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl hover:border-zinc-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold font-mono">{slot.time}</span>
                    <span className="text-[10px] bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-850 uppercase font-black tracking-wider text-[9px]">
                      {slot.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200">{slot.title}</h4>
                  <p className="text-[10px] text-zinc-500 leading-tight">{slot.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-900 text-center">
              <span className="text-xs text-indigo-300 font-bold">🎯 Sunday Focus is configured around Mock evaluations & active Lab sprints!</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUN_SLOTS.map((slot, index) => (
                <div 
                  key={index}
                  className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold font-mono">{slot.time}</span>
                    <span className="text-[10px] bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-850 uppercase font-bold text-[9px]">
                      {slot.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200">{slot.title}</h4>
                  <p className="text-[10px] text-zinc-500 leading-tight">{slot.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
