import { useState, useEffect, useRef } from 'react';
import { useTheme, THEME_CONFIGS } from './ThemeContext';
import { STUDY_CATEGORIES_CONFIG, StudyCategory, UserProfile } from '../types';
import { playSynthesizedSound, SOUND_PRESETS, BreakSoundType } from '../utils/audio';
import { Play, Pause, RotateCcw, Volume2, Trophy, AlarmClock, Sparkles } from 'lucide-react';

interface TimerProps {
  onSessionComplete: (category: StudyCategory, duration: number) => void;
  profile: UserProfile;
}

export default function Timer({ onSessionComplete, profile }: TimerProps) {
  const { theme, getCardColor } = useTheme();
  const config = THEME_CONFIGS[theme];

  const [activeCategory, setActiveCategory] = useState<StudyCategory>('dsa');
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  
  // Custom durations (configurable in UI)
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize initial times
  useEffect(() => {
    let mins = 25;
    if (sessionType === 'focus') mins = focusDuration;
    else if (sessionType === 'shortBreak') mins = shortBreakDuration;
    else if (sessionType === 'longBreak') mins = longBreakDuration;
    setTimeLeft(mins * 60);
  }, [sessionType, focusDuration, shortBreakDuration, longBreakDuration]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            clearTimer();
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [isRunning, sessionType, activeCategory]);

  const handleTimerComplete = () => {
    // Determine custom notification sound configured in Profile settings
    let soundToPlay: BreakSoundType = 'zen';
    if (sessionType === 'focus') {
      soundToPlay = profile.focusSound || 'zen';
    } else if (sessionType === 'shortBreak') {
      soundToPlay = profile.shortBreakSound || 'chime';
    } else if (sessionType === 'longBreak') {
      soundToPlay = profile.longBreakSound || 'digital';
    }

    playSynthesizedSound(soundToPlay);
    
    if (sessionType === 'focus') {
      onSessionComplete(activeCategory, focusDuration);
      alert(`🎯 Amazing work! Focus session for "${STUDY_CATEGORIES_CONFIG[activeCategory].name}" completed. Time for a well-deserved break!`);
      setSessionType('shortBreak');
    } else {
      alert(`💪 Break's over! Let's get back to your study schedule.`);
      setSessionType('focus');
    }
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    let mins = 25;
    if (sessionType === 'focus') mins = focusDuration;
    else if (sessionType === 'shortBreak') mins = shortBreakDuration;
    else if (sessionType === 'longBreak') mins = longBreakDuration;
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = () => {
    let totalSecs = 25 * 60;
    if (sessionType === 'focus') totalSecs = focusDuration * 60;
    else if (sessionType === 'shortBreak') totalSecs = shortBreakDuration * 60;
    else if (sessionType === 'longBreak') totalSecs = longBreakDuration * 60;
    return ((totalSecs - timeLeft) / totalSecs) * 100;
  };

  // Get color for active focus category
  const themeCategory = STUDY_CATEGORIES_CONFIG[activeCategory];

  return (
    <div className={`p-6 rounded-2xl ${getCardColor()} transition-all duration-300 ${config.accentGlow}`} id="pomodoro_timer">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlarmClock className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold tracking-tight">Focus Pomodoro Timer</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-850 text-zinc-400 select-none" title="Configured in Profile tab">
          <Volume2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="text-[10px] font-black uppercase">
            Alert: {
              SOUND_PRESETS.find(s => s.id === (
                sessionType === 'focus' 
                  ? (profile.focusSound || 'zen') 
                  : (sessionType === 'shortBreak' ? (profile.shortBreakSound || 'chime') : (profile.longBreakSound || 'digital'))
              ))?.name.split(' ')[0] || 'Zen'
            }
          </span>
        </div>
      </div>

      {/* Timer Display Circle */}
      <div className="flex flex-col items-center justify-center my-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Radial progress background */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle 
              cx="128" 
              cy="128" 
              r="112" 
              className="stroke-zinc-800" 
              strokeWidth="8" 
              fill="transparent" 
            />
            <circle 
              cx="128" 
              cy="128" 
              r="112" 
              className={`transition-all duration-100 ease-linear ${
                sessionType === 'focus' ? 'stroke-violet-500' : 'stroke-teal-400'
              }`} 
              strokeWidth="8" 
              fill="transparent"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - progressPercentage() / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text centered */}
          <div className="text-center z-10">
            <span className="text-sm uppercase tracking-widest text-zinc-400 font-semibold block mb-1">
              {sessionType === 'focus' ? 'Session' : 'Break Time'}
            </span>
            <span className="text-5xl font-extrabold tracking-tight font-mono text-white">
              {formatTime(timeLeft)}
            </span>
            <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{themeCategory.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={toggleRunning}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition shadow-lg ${
            isRunning 
              ? 'bg-zinc-700 hover:bg-zinc-650 text-white' 
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40'
          }`}
          id="btn_play_pause"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
        <button
          onClick={resetTimer}
          className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition"
          title="Reset Timer"
          id="btn_reset_timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-950/50 p-1.5 rounded-xl border border-zinc-900 mb-6">
        <button
          onClick={() => { setIsRunning(false); setSessionType('focus'); }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            sessionType === 'focus' 
              ? 'bg-violet-900/60 text-violet-200 shadow' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Focus Session
        </button>
        <button
          onClick={() => { setIsRunning(false); setSessionType('shortBreak'); }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            sessionType === 'shortBreak' 
              ? 'bg-teal-950/60 text-teal-200 shadow' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => { setIsRunning(false); setSessionType('longBreak'); }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            sessionType === 'longBreak' 
              ? 'bg-teal-950/60 text-teal-200 shadow' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Timer Config sliders */}
      <div className="border-t border-zinc-800/80 pt-5 mt-5">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-4">Duration Presets (Minutes)</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Focus Mode</label>
            <input 
              type="number" 
              value={focusDuration} 
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setFocusDuration(val);
              }}
              className="text-center w-full bg-zinc-950 border border-zinc-850 py-1 px-1.5 text-xs text-white rounded focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Short Break</label>
            <input 
              type="number" 
              value={shortBreakDuration} 
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setShortBreakDuration(val);
              }}
              className="text-center w-full bg-zinc-950 border border-zinc-850 py-1 px-1.5 text-xs text-white rounded focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Long Break</label>
            <input 
              type="number" 
              value={longBreakDuration} 
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setLongBreakDuration(val);
              }}
              className="text-center w-full bg-zinc-950 border border-zinc-850 py-1 px-1.5 text-xs text-white rounded focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Study Subject Target selector */}
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">Topic Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(STUDY_CATEGORIES_CONFIG).map(([key, item]) => {
            const isSelected = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key as StudyCategory);
                }}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected 
                    ? 'bg-violet-950/40 border-violet-500/80 text-violet-200' 
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-xs font-bold leading-tight line-clamp-1">{item.name}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 leading-none">{item.targetDuration} target</span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
