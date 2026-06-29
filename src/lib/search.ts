// Natural-language feeling search. Maps a free-text query like
// "I feel completely overwhelmed and can't cope" to the right emotion(s)
// and returns curated verses. Fully offline, no dependencies.
import { synonyms } from '../data/synonyms';
import { emotions, emotionById, type EmotionMeta } from '../data/emotions';
import { versesByEmotion, uniqueCuratedVerses, type CuratedVerse } from '../data/verses';

export interface FeelingResult {
  query: string;
  matchedEmotions: EmotionMeta[]; // best-matching emotions, ranked (may be empty)
  verses: CuratedVerse[];         // verses to show
  mode: 'emotion' | 'keyword' | 'none';
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’`]/g, '')        // drop apostrophes: can't -> cant
    .replace(/[^a-z0-9]+/g, ' ')  // everything else -> space
    .replace(/\s+/g, ' ')
    .trim();
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word(s) match so "low" doesn't match inside "below".
function containsPhrase(haystack: string, phrase: string): boolean {
  const re = new RegExp(`(^| )${escapeRegex(phrase)}( |$)`);
  return re.test(haystack);
}

// Rank emotions by how strongly the query matches their synonym phrases.
// Longer phrases score higher (more specific signal).
export function rankEmotions(query: string): { emotion: EmotionMeta; score: number }[] {
  const q = normalize(query);
  if (!q) return [];
  const scores: Record<string, number> = {};

  for (const emo of emotions) {
    let score = 0;
    // the label itself is a strong signal
    if (containsPhrase(q, normalize(emo.label))) score += 3;
    for (const phrase of synonyms[emo.id] || []) {
      const p = normalize(phrase);
      if (!p) continue;
      if (containsPhrase(q, p)) {
        score += p.includes(' ') ? p.split(' ').length + 1 : 1;
      }
    }
    if (score > 0) scores[emo.id] = score;
  }

  return Object.entries(scores)
    .map(([id, score]) => ({ emotion: emotionById[id], score }))
    .sort((a, b) => b.score - a.score);
}

// Keyword fallback: search the curated verse texts, references, reflections.
function keywordSearch(query: string): CuratedVerse[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(' ').filter((t) => t.length > 2);
  if (!terms.length) return [];
  return uniqueCuratedVerses.filter((v) => {
    const hay = normalize(`${v.text} ${v.reference} ${v.reflection}`);
    return terms.some((t) => hay.includes(t));
  });
}

// Merge verses from the top emotions, primary first, deduped by reference.
function gatherVerses(emotionIds: string[]): CuratedVerse[] {
  const out: CuratedVerse[] = [];
  const seen = new Set<string>();
  for (const id of emotionIds) {
    for (const v of versesByEmotion[id] || []) {
      if (seen.has(v.reference)) continue;
      seen.add(v.reference);
      out.push(v);
    }
  }
  return out;
}

export function searchFeeling(query: string): FeelingResult {
  const ranked = rankEmotions(query);

  if (ranked.length) {
    // Use the top match, plus a strong secondary if it's close behind.
    const top = ranked[0];
    const ids = [top.emotion.id];
    if (ranked[1] && ranked[1].score >= Math.max(2, top.score * 0.5)) {
      ids.push(ranked[1].emotion.id);
    }
    return {
      query,
      matchedEmotions: ids.map((id) => emotionById[id]),
      verses: gatherVerses(ids),
      mode: 'emotion',
    };
  }

  const kw = keywordSearch(query);
  if (kw.length) {
    return { query, matchedEmotions: [], verses: kw, mode: 'keyword' };
  }

  return { query, matchedEmotions: [], verses: [], mode: 'none' };
}

// Verses for an explicit emotion tile tap.
export function versesForEmotion(emotionId: string): CuratedVerse[] {
  return versesByEmotion[emotionId] || [];
}
