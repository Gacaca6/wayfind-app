// Lazy access to the full bundled Bible (KJV + WEB). The ~4MB translation JSON
// is fetched on first use and cached in memory (and by the service worker on
// disk), so the app shell stays light and everything works offline after first load.
import { bookIndexByName, books } from '../data/books';

// KIN is the Bibiliya Yera text imported from Bibiliya.com with user-confirmed
// permission. The source manifest records the import date, hash and book counts.
// Chapter counts come from the selected translation, not another edition.
export type Translation = 'KJV' | 'WEB' | 'KIN';

export const TRANSLATIONS: { id: Translation; label: string; description: string }[] = [
  { id: 'KJV', label: 'KJV', description: 'King James Version' },
  { id: 'WEB', label: 'WEB', description: 'World English Bible · easier to read' },
  { id: 'KIN', label: 'KIN', description: 'Bibiliya Yera · Ikinyarwanda' },
];

interface BibleData {
  t: string;
  r?: Record<string, [number, number][]>;
  b: string[][][]; // [bookIndex][chapterIndex][verseIndex] -> verse text
}

const cache: Partial<Record<Translation, BibleData>> = {};
const inflight: Partial<Record<Translation, Promise<BibleData>>> = {};

// Vite serves /public at the app base. import.meta.env.BASE_URL handles sub-paths.
// First 16 hex of the committed kin.json SHA-256 (Bibiliya.com snapshot
// 2026-10-07). Used to cache-bust KIN so the CacheFirst service worker cannot
// keep serving a previous edition. vite.config may override this via
// VITE_KIN_REVISION (computed from the file at build time); the literal fallback
// keeps the loader correct even when that define is absent.
const KIN_REVISION = '84d32e1b06fa527c';

function url(t: Translation): string {
  const base = import.meta.env.BASE_URL || '/';
  const resource = `${base}bible/${t.toLowerCase()}.json`.replace(/\/\//g, '/');
  const rev = import.meta.env.VITE_KIN_REVISION || KIN_REVISION;
  return t === 'KIN' ? `${resource}?v=${rev}` : resource;
}

export async function loadTranslation(t: Translation): Promise<BibleData> {
  if (cache[t]) return cache[t]!;
  if (inflight[t]) return inflight[t]!;
  const p = fetch(url(t))
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${t} (${r.status})`);
      return r.json() as Promise<BibleData>;
    })
    .then((data) => {
      cache[t] = data;
      delete inflight[t];
      return data;
    })
    .catch((e) => {
      delete inflight[t];
      throw e;
    });
  inflight[t] = p;
  return p;
}

export function isLoaded(t: Translation): boolean {
  return !!cache[t];
}

// A single chapter as an array of verse strings (index 0 = verse 1).
export async function getChapter(t: Translation, bookName: string, chapter: number): Promise<string[]> {
  const data = await loadTranslation(t);
  const bi = bookIndexByName[bookName];
  if (bi === undefined) return [];
  const ch = data.b[bi]?.[chapter - 1];
  return ch ? [...ch] : [];
}

// Text for a (possibly multi-verse) reference, e.g. getPassage('WEB','Psalms',103,1,2).
export async function getPassage(
  t: Translation,
  bookName: string,
  chapter: number,
  verseStart: number,
  verseEnd: number
): Promise<string> {
  await loadTranslation(t);
  return getPassageSync(t, bookName, chapter, verseStart, verseEnd) || '';

}

// Chapter counts per book for a translation (KIN's printed structure differs
// from KJV/WEB in a few OT books). Falls back to books.json metadata counts.
export async function getChapterCounts(t: Translation): Promise<number[]> {
  try {
    const data = await loadTranslation(t);
    return books.map((meta, i) => data.b[i]?.length || meta.chapters);
  } catch {
    return books.map((meta) => meta.chapters);
  }
}

// Synchronous read from the in-memory cache only (returns null if not loaded yet).
// Used for instant render of already-loaded translations (e.g. Kinyarwanda on cards).
export function getPassageSync(
  t: Translation,
  bookName: string,
  chapter: number,
  verseStart: number,
  verseEnd: number
): string | null {
  const data = cache[t];
  if (!data) return null;
  const bi = bookIndexByName[bookName];
  if (bi === undefined) return null;
  const ch = data.b[bi]?.[chapter - 1];
  if (!ch) return null;
  const parts: string[] = [];
  for (let v = verseStart; v <= verseEnd; v++) {
    const span = verseSpan(t, bookName, chapter, v);
    if (span[0] < verseStart && v === verseStart && ch[span[0] - 1]) parts.push(ch[span[0] - 1]);
    if (ch[v - 1]) parts.push(ch[v - 1]);
  }
  const s = parts.join(' ').trim();
  return s || null;
}

// Combined source verses share one text; selecting either number includes it.
export function verseSpan(t: Translation, book: string, chapter: number, verse: number): [number, number] {
  const bi = bookIndexByName[book];
  return cache[t]?.r?.[`${bi}:${chapter}`]?.find(([start, end]) => verse >= start && verse <= end) || [verse, verse];
}

export function formatReference(bookName: string, chapter: number, vStart: number, vEnd: number): string {
  return vEnd > vStart ? `${bookName} ${chapter}:${vStart}-${vEnd}` : `${bookName} ${chapter}:${vStart}`;
}

export { books };
