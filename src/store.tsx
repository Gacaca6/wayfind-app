import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Translation } from './lib/bible';

export interface SavedVerse {
  id: string;          // stable per reference (so the same verse de-dupes)
  reference: string;
  text: string;
  kinyarwanda?: string;
  translation: string;
  reflection?: string;
  emotion?: string;
  book?: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
}

export interface Profile {
  name: string;
  onboarded: boolean;
}

interface Store {
  profile: Profile;
  setProfile: (p: Profile) => void;

  saved: SavedVerse[];
  toggleSave: (v: SavedVerse) => void;
  isSaved: (reference: string) => boolean;

  recents: string[];
  addRecent: (q: string) => void;

  translation: Translation;
  setTranslation: (t: Translation) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  showKinyarwanda: boolean;
  setShowKinyarwanda: (v: boolean) => void;
}

const StoreContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useLocalStorage<Profile>('wf.profile', { name: '', onboarded: false });
  const [saved, setSaved] = useLocalStorage<SavedVerse[]>('wf.saved', []);
  const [recents, setRecents] = useLocalStorage<string[]>('wf.recents', []);
  const [translation, setTranslation] = useLocalStorage<Translation>('wf.translation', 'KJV');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('wf.darkMode', false);
  const [fontSize, setFontSize] = useLocalStorage<number>('wf.fontSize', 19);
  const [showKinyarwanda, setShowKinyarwanda] = useLocalStorage<boolean>('wf.showKinyarwanda', true);

  // Apply theme + reading size to the document.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    const meta = document.querySelector('meta[name="theme-color"]:not([media])')
      || document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', darkMode ? '#1a1109' : '#FAF7F2');
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--verse-size', `${fontSize}px`);
  }, [fontSize]);

  const value = useMemo<Store>(() => ({
    profile,
    setProfile,
    saved,
    toggleSave: (v) =>
      setSaved((prev) =>
        prev.some((s) => s.reference === v.reference)
          ? prev.filter((s) => s.reference !== v.reference)
          : [{ ...v, id: v.reference }, ...prev]
      ),
    isSaved: (reference) => saved.some((s) => s.reference === reference),
    recents,
    addRecent: (q) =>
      setRecents((prev) => [q, ...prev.filter((s) => s !== q)].slice(0, 6)),
    translation,
    setTranslation,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    showKinyarwanda,
    setShowKinyarwanda,
  }), [profile, saved, recents, translation, darkMode, fontSize, showKinyarwanda, setProfile, setSaved, setRecents, setTranslation, setDarkMode, setFontSize, setShowKinyarwanda]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within AppProvider');
  return ctx;
}
