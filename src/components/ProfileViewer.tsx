import { useState } from 'react';
import { useTheme } from './ThemeContext';
import { UserProfile, DBTheme } from '../types';
import { GraduationCap, Award, Flame, User, Mail, ShieldAlert, Sparkles, BookOpen, Save, Volume2, Play } from 'lucide-react';
import { playSynthesizedSound, SOUND_PRESETS, BreakSoundType } from '../utils/audio';

interface ProfileViewerProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  isOnline: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function ProfileViewer({ profile, onUpdateProfile, isOnline, onLogin, onLogout }: ProfileViewerProps) {
  const { theme, setTheme, getCardColor } = useTheme();

  // Local state modifiers
  const [displayName, setDisplayName] = useState(profile.displayName || 'REVA Scholar');
  const [cgpa, setCgpa] = useState<number>(profile.cgpa || 7.13);
  const [targetSGPA, setTargetSGPA] = useState<number>(profile.targetSGPA || 8.5);
  const [targetLeetcode, setTargetLeetcode] = useState<number>(profile.targetLeetcode || 150);
  const [college] = useState(profile.college || 'REVA University');

  const [focusSound, setFocusSound] = useState<BreakSoundType>(profile.focusSound || 'zen');
  const [shortBreakSound, setShortBreakSound] = useState<BreakSoundType>(profile.shortBreakSound || 'chime');
  const [longBreakSound, setLongBreakSound] = useState<BreakSoundType>(profile.longBreakSound || 'digital');

  const themesList: { id: DBTheme; name: string; color: string }[] = [
    { id: 'slate', name: 'Slate Night (Graphite)', color: 'bg-zinc-800' },
    { id: 'cosmic', name: 'Cosmic Stars (Violet)', color: 'bg-indigo-900' },
    { id: 'emerald', name: 'Cyber Forest (Green)', color: 'bg-emerald-950' },
    { id: 'amber', name: 'Ambient Amber (Warm)', color: 'bg-amber-700' },
    { id: 'indigo', name: 'Calm Twilight (Indigo)', color: 'bg-blue-900' },
  ];

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      displayName,
      cgpa,
      targetSGPA,
      targetLeetcode,
      focusSound,
      shortBreakSound,
      longBreakSound,
    });
    alert('🌟 Profile settings and custom sound notifications updated successfully!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="profile_viewer">
      {/* College card & target weight indicators */}
      <div className={`p-6 rounded-2xl ${getCardColor()} md:col-span-1 space-y-6`}>
        <div className="text-center space-y-3 pb-4 border-b border-zinc-800">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-xl">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">{displayName}</h3>
            <p className="text-xs text-zinc-500 font-medium">3rd Year ISE • {college}</p>
          </div>
        </div>

        {/* Sync indicators */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Cloud Data Integration</h4>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-semibold">Database Sync</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
                {isOnline ? 'Active Online Sync' : 'Offline Cache Mode'}
              </span>
            </div>
          </div>

          {/* Authentication action details */}
          {profile.uid === 'anonymous' ? (
            <button
              onClick={onLogin}
              className="w-full text-center text-xs py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition"
            >
              Sign In with Google for Cloud Sync
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-400 text-center flex items-center justify-center gap-1">
                <Mail className="w-3 h-3 text-zinc-500" />
                Logged in: {profile.email}
              </p>
              <button
                onClick={onLogout}
                className="w-full text-center text-xs py-1.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl transition"
                id="btn_sign_out"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Placement timetable goals summary */}
        <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850/50 space-y-2.5">
          <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Placement Milestones</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Target SGPA</span>
              <span className="text-white font-bold">8.5+ 7th Sem</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Placements Start</span>
              <span className="text-red-400 font-bold">~ 6 Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Focus Areas</span>
              <span className="text-emerald-400 font-bold">Product-Based</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target config & interactive customizable theme selections */}
      <div className={`p-6 rounded-2xl ${getCardColor()} md:col-span-2 space-y-6`}>
        <h3 className="text-sm font-bold tracking-tight text-zinc-200 flex items-center gap-1.5 border-b border-zinc-800 pb-3">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          Academic Performance Targets & Customization
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-3 text-xs text-white rounded-xl focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase tracking-wider">College Name</label>
              <input 
                type="text" 
                value={college}
                disabled
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-3 text-xs text-zinc-500 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Current CGPA</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-2 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Target SGPA</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="10"
                value={targetSGPA}
                onChange={(e) => setTargetSGPA(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-2 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Target LeetCode</label>
              <input 
                type="number" 
                min="0"
                value={targetLeetcode}
                onChange={(e) => setTargetLeetcode(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-850 py-2 px-2 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Notification Sounds */}
          <div className="space-y-3 pt-3 border-t border-zinc-850/60">
            <label className="block text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-violet-400" />
              Custom Pomodoro Notification Sounds
            </label>
            <p className="text-[11px] text-zinc-500 font-medium pb-1">
              Choose beautiful sound alerts played when session timers finish. Use the play button to preview.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Focus Stage Sound */}
              <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wide">Focus Session</span>
                <div className="flex items-center gap-1.5">
                  <select 
                    value={focusSound} 
                    onChange={(e) => {
                      const val = e.target.value as BreakSoundType;
                      setFocusSound(val);
                      playSynthesizedSound(val);
                    }}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-250 py-1.5 px-2 rounded-lg focus:outline-none focus:border-violet-550 cursor-pointer"
                    id="select_focus_sound"
                  >
                    {SOUND_PRESETS.map((snd) => (
                      <option key={snd.id} value={snd.id} className="bg-zinc-900 text-zinc-200">
                        {snd.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => playSynthesizedSound(focusSound)}
                    disabled={focusSound === 'none'}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-violet-400 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Play Preview"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Short Break Sound */}
              <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wide">Short Break</span>
                <div className="flex items-center gap-1.5">
                  <select 
                    value={shortBreakSound} 
                    onChange={(e) => {
                      const val = e.target.value as BreakSoundType;
                      setShortBreakSound(val);
                      playSynthesizedSound(val);
                    }}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-250 py-1.5 px-2 rounded-lg focus:outline-none focus:border-teal-400 cursor-pointer"
                    id="select_short_break_sound"
                  >
                    {SOUND_PRESETS.map((snd) => (
                      <option key={snd.id} value={snd.id} className="bg-zinc-900 text-zinc-200">
                        {snd.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => playSynthesizedSound(shortBreakSound)}
                    disabled={shortBreakSound === 'none'}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-teal-400 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Play Preview"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Long Break Sound */}
              <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wide">Long Break</span>
                <div className="flex items-center gap-1.5">
                  <select 
                    value={longBreakSound} 
                    onChange={(e) => {
                      const val = e.target.value as BreakSoundType;
                      setLongBreakSound(val);
                      playSynthesizedSound(val);
                    }}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-250 py-1.5 px-2 rounded-lg focus:outline-none focus:border-teal-400 cursor-pointer"
                    id="select_long_break_sound"
                  >
                    {SOUND_PRESETS.map((snd) => (
                      <option key={snd.id} value={snd.id} className="bg-zinc-900 text-zinc-200">
                        {snd.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => playSynthesizedSound(longBreakSound)}
                    disabled={longBreakSound === 'none'}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-teal-400 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Play Preview"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Theme customizer */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Late-Night Theme UI Customizer
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {themesList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    theme === t.id 
                      ? 'bg-violet-950/20 border-violet-500 text-violet-200 font-bold scale-[1.02]' 
                      : 'bg-zinc-900/50 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                  }`}
                  id={`theme_select_${t.id}`}
                >
                  <div className={`w-6 h-6 rounded-full mb-2 ${t.color} border border-zinc-800`} />
                  <span className="text-[10px] leading-tight font-medium">{t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow mt-3"
            id="btn_save_profile"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Performance Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
