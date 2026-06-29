import { useEffect, useState } from 'react';
import { getPassage, getPassageSync } from '../lib/bible';

interface Loc {
  book?: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
  kinyarwanda?: string; // saved verses may already carry the text (device-only)
}

// Resolves the Kinyarwanda text for a verse at runtime from the bundled (gitignored)
// kin.json. Returns '' until available. Copyrighted text is never embedded in source.
export function useKinyarwanda(v: Loc | null | undefined, enabled = true): string {
  const loc = enabled && v && v.book && v.chapter && v.verseStart ? v : null;

  const [text, setText] = useState<string>(() => {
    if (v?.kinyarwanda) return v.kinyarwanda;
    if (!loc) return '';
    return getPassageSync('KIN', loc.book!, loc.chapter!, loc.verseStart!, loc.verseEnd || loc.verseStart!) || '';
  });

  useEffect(() => {
    if (v?.kinyarwanda) {
      return;
    }
    if (!loc) {
      return;
    }
    let cancelled = false;
    getPassage('KIN', loc.book!, loc.chapter!, loc.verseStart!, loc.verseEnd || loc.verseStart!)
      .then((t) => !cancelled && setText(t || ''))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v?.kinyarwanda, loc?.book, loc?.chapter, loc?.verseStart, loc?.verseEnd]);

  return v?.kinyarwanda || text;
}
