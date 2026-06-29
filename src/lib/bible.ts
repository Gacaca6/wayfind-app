// Lazy access to the full bundled Bible (KJV + WEB). The ~4MB translation JSON
// is fetched on first use and cached in memory (and by the service worker on
// disk), so the app shell stays light and everything works offline after first load.
import { bookIndexByName, books } from '../data/books';

export type Translation = 'KJV' | 'WEB';

interface BibleData {
  t: string;
  b: string[][][]; // [bookIndex][chapterIndex][verseIndex] -> verse text
}

const cache: Partial<Record<Translation, BibleData>> = {};
const inflight: Partial<Record<Translation, Promise<BibleData>>> = {};

// Vite serves /public at the app base. import.meta.env.BASE_URL handles sub-paths.
function url(t: Translation): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}bible/${t.toLowerCase()}.json`.replace(/\/\//g, '/');
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
  const ch = await getChapter(t, bookName, chapter);
  const parts: string[] = [];
  for (let v = verseStart; v <= verseEnd; v++) {
    if (ch[v - 1] !== undefined) parts.push(ch[v - 1]);
  }
  return parts.join(' ');
}

export function formatReference(bookName: string, chapter: number, vStart: number, vEnd: number): string {
  return vEnd > vStart ? `${bookName} ${chapter}:${vStart}-${vEnd}` : `${bookName} ${chapter}:${vStart}`;
}

export { books };
