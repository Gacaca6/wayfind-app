// Lazy access to the bundled Kinyarwanda hymnal (Gushimisha + Agakiza).
// Loaded on first use from public/hymns/hymns.json (gitignored; fetched at
// build time) and cached in memory + by the service worker for offline use.

export interface HymnStanza {
  t: 'v' | 'c'; // verse | chorus
  x: string;
}

export interface Hymn {
  id: string;      // e.g. "Gushimisha-256" (unique; variants get e.g. "Gushimisha-18b")
  book: string;    // "Gushimisha" | "Agakiza"
  number: number;
  label: string;   // printed hymn number incl. variant suffix, e.g. "18b"
  title: string;
  stanzas: HymnStanza[];
}

export interface HymnBook {
  id: string;
  name: string;
  count: number;
}

interface HymnData {
  books: HymnBook[];
  songs: Hymn[];
}

let cache: HymnData | null = null;
let inflight: Promise<HymnData> | null = null;

function url(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}hymns/hymns.json`.replace(/\/\//g, '/');
}

export async function loadHymns(): Promise<HymnData> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch(url())
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load hymns (${r.status})`);
      return r.json() as Promise<HymnData>;
    })
    .then((d) => {
      cache = d;
      inflight = null;
      return d;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

const norm = (s: string) =>
  s.toLowerCase().replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Search by number ("256"), book+number ("gushimisha 256"), title, or lyrics.
export function searchHymns(data: HymnData, query: string, book?: string): Hymn[] {
  const q = norm(query);
  const pool = book ? data.songs.filter((s) => s.book === book) : data.songs;
  if (!q) return pool;

  // "gushimisha 256" / "agakiza 12" / bare number
  const m = q.match(/^(gushimisha|agakiza)?\s*(\d+)$/);
  if (m) {
    const n = parseInt(m[2], 10);
    const inBook = m[1]
      ? pool.filter((s) => s.book.toLowerCase() === m[1])
      : pool;
    const exact = inBook.filter((s) => s.number === n);
    if (exact.length) return exact;
  }

  return pool.filter((s) => {
    const hay = norm(`${s.title} ${s.stanzas.map((st) => st.x).join(' ')}`);
    return q.split(' ').every((term) => hay.includes(term));
  });
}
