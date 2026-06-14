import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { DailyLog, STUDY_CATEGORIES_CONFIG, StudyCategory } from '../types';
import { CheckSquare, Square, Calendar, Save, Award, ClipboardList, PenTool } from 'lucide-react';

interface DailyLogEditorProps {
  logs: Record<string, DailyLog>;
  onSaveLog: (log: DailyLog) => void;
}

export default function DailyLogEditor({ logs, onSaveLog }: DailyLogEditorProps) {
  const { getCardColor } = useTheme();

  const getTodayDateStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dsaSolved, setDsaSolved] = useState<number>(0);
  const [focusMinutes, setFocusMinutes] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Load existing log if selectedDate changes
  useEffect(() => {
    const existingLog = logs[selectedDate];
    if (existingLog) {
      setCompletedTasks(existingLog.completedTasks || []);
      setDsaSolved(existingLog.dsaSolved || 0);
      setFocusMinutes(existingLog.focusMinutes || 0);
      setNotes(existingLog.notes || '');
    } else {
      // Default initialization
      setCompletedTasks([]);
      setDsaSolved(0);
      setFocusMinutes(0);
      setNotes('');
    }
  }, [selectedDate, logs]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(t => t !== taskId) 
        : [...prev, taskId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyLog = {
      userId: 'active_user', // Overridden in App level
      date: selectedDate,
      completedTasks,
      dsaSolved,
      focusMinutes,
      notes,
    };
    onSaveLog(newLog);
    alert(`🎉 Progress logged successfully for Date: ${selectedDate}! Keep up the consistent work!`);
  };

  const isToday = selectedDate === getTodayDateStr();

  return (
    <div className={`p-6 rounded-2xl ${getCardColor()} space-y-6`} id="daily_progress_logger">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold tracking-tight">Daily Progress Logger</h2>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center gap-2.5 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-850 self-start">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold bg-transparent border-none text-zinc-100 focus:outline-none"
            max={getTodayDateStr()}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">
            Daily Non-Negotiable Tasks ({completedTasks.length}/6 Completed)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(STUDY_CATEGORIES_CONFIG).map(([key, config]) => {
              const checked = completedTasks.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTask(key)}
                  className={`flex items-start text-left p-3.5 rounded-xl border cursor-pointer transition-all ${
                    checked 
                      ? 'bg-emerald-950/20 border-emerald-500/80 text-emerald-200' 
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="mr-3 mt-0.5">
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold leading-none block">{config.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-1 block leading-tight">
                      {config.description} ({config.targetDuration} target)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DSA problems solved */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
              LeetCode DSA Solved (Today)
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="0"
                value={dsaSolved}
                onChange={(e) => setDsaSolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-950/80 border border-zinc-850 px-3 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setDsaSolved(prev => prev + 1)}
                className="px-4 py-2 bg-emerald-900/60 text-emerald-300 rounded-xl font-bold border border-emerald-800 text-sm hover:bg-emerald-850/60 transition"
              >
                +1 Solved
              </button>
            </div>
          </div>

          {/* Aggregated Focus study logs for the day */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Total Focused Minutes (Today)
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="0"
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-950/80 border border-zinc-850 px-3 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-violet-500"
              />
              <span className="text-xs text-zinc-500 whitespace-nowrap">Mins</span>
            </div>
          </div>
        </div>

        {/* Written Notes / Day revision */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5" />
            Study Notes, Assignments, topics reviewed
          </label>
          <textarea 
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What arrays questions did you practice? Which ethical hacking topic did you cover on TryHackMe?"
            className="w-full bg-zinc-950/80 border border-zinc-850 p-3.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold transition shadow-lg shadow-emerald-950/40"
          id="btn_save_daily_log"
        >
          <Save className="w-4 h-4" />
          <span>Save Progress Log</span>
        </button>

        {completedTasks.length === 6 && (
          <div className="bg-emerald-950/30 border border-emerald-900 p-3.5 rounded-xl flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-semibold">
              CRITICAL MASTER ACHIEVED: "No Zero Day" completely secured! You completed all 6 non-negotiables today. Perfect placement prep!
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
