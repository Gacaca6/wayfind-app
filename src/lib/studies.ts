// Lazy access to the bundled study notes ("Understand this verse") — original
// beginner-friendly commentary keyed by curated verse reference. Loaded on
// first use from public/studies/studies.json and cached (memory + SW).

export interface StudyNote {
  story: string;   // the human situation behind the verse
  meaning: string; // the verse explained in plain words
  you: string;     // what it says to the reader today
  prayer: string;  // a short prayer to make it personal
}

let cache: Record<string, StudyNote> | null = null;
let inflight: Promise<Record<string, StudyNote>> | null = null;

function url(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}studies/studies.json`.replace(/\/\//g, '/');
}

export async function loadStudies(): Promise<Record<string, StudyNote>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch(url())
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load studies (${r.status})`);
      return r.json() as Promise<Record<string, StudyNote>>;
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

export async function getStudy(reference: string): Promise<StudyNote | null> {
  try {
    const d = await loadStudies();
    return d[reference] || null;
  } catch {
    return null;
  }
}
