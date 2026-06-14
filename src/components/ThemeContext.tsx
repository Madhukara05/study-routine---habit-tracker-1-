import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DBTheme } from '../types';

interface ThemeContextType {
  theme: DBTheme;
  setTheme: (theme: DBTheme) => void;
  getBgColor: () => string;
  getAccentColor: () => string;
  getCardColor: () => string;
  getTextColor: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_CONFIGS: Record<DBTheme, {
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  accentGlow: string;
}> = {
  slate: {
    name: 'Slate Night (Graphite)',
    bg: 'bg-zinc-950 text-zinc-100',
    card: 'bg-zinc-900 border border-zinc-800',
    accent: 'emerald',
    text: 'text-zinc-100',
    accentGlow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
  },
  cosmic: {
    name: 'Cosmic Stars (Cyber Violet)',
    bg: 'bg-slate-950 text-slate-100',
    card: 'bg-slate-900/90 border border-violet-900/40',
    accent: 'violet',
    text: 'text-slate-100',
    accentGlow: 'shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)]',
  },
  emerald: {
    name: 'Cyber Forest (Aesthetic Green)',
    bg: 'bg-stone-950 text-stone-100',
    card: 'bg-neutral-900/90 border border-emerald-950',
    accent: 'emerald',
    text: 'text-stone-100',
    accentGlow: 'shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]',
  },
  amber: {
    name: 'Cozy Reading Light (Amber)',
    bg: 'bg-neutral-950 text-amber-50',
    card: 'bg-stone-900 border border-stone-850',
    accent: 'amber',
    text: 'text-amber-50',
    accentGlow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
  },
  indigo: {
    name: 'Indigo Twilight (Relaxing Calm)',
    bg: 'bg-gray-950 text-gray-100',
    card: 'bg-slate-900 border border-indigo-950',
    accent: 'indigo',
    text: 'text-gray-100',
    accentGlow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]',
  },
};

export function ThemeProvider({ children, initialTheme = 'cosmic' }: { children: ReactNode; initialTheme?: DBTheme }) {
  const [theme, setThemeState] = useState<DBTheme>(() => {
    const saved = localStorage.getItem('reva_app_theme');
    return (saved as DBTheme) || initialTheme;
  });

  const setTheme = (newTheme: DBTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('reva_app_theme', newTheme);
  };

  const getBgColor = () => THEME_CONFIGS[theme].bg;
  const getCardColor = () => THEME_CONFIGS[theme].card;
  const getAccentColor = () => THEME_CONFIGS[theme].accent;
  const getTextColor = () => THEME_CONFIGS[theme].text;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getBgColor, getAccentColor, getCardColor, getTextColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
