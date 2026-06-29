// Deterministic "verse of the day": same verse for everyone on a given date,
// rotates at local midnight, works offline. No randomness, no server.
import { uniqueCuratedVerses, type CuratedVerse } from '../data/verses';

export function dayIndex(date = new Date()): number {
  // Local-day number since epoch.
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function dailyVerse(date = new Date()): CuratedVerse {
  const list = uniqueCuratedVerses;
  return list[dayIndex(date) % list.length];
}
