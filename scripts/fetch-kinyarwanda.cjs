// Validate the checked-in Kinyarwanda edition. Never silently substitute a
// different translation when this file is absent. Authorized source refreshes
// are explicit: python scripts/import-bibiliya.py (stages a reviewed import).
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'public', 'bible', 'kin.json');
try {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.t !== 'KIN' || !Array.isArray(data.b) || data.b.length !== 66) throw new Error('Expected 66 Kinyarwanda books');
  let chapters = 0, verses = 0;
  for (const [bi, book] of data.b.entries()) {
    if (!Array.isArray(book) || !book.length) throw new Error('Missing book');
    for (const [ci, chapter] of book.entries()) {
      if (!Array.isArray(chapter) || !chapter.length) throw new Error('Missing chapter');
      for (const [vi, text] of chapter.entries()) {
        const combined = data.r?.[`${bi}:${ci+1}`]?.some(([start, end]) => vi+1 > start && vi+1 <= end);
        if (text === '' && combined) { verses++; continue; }
        if (typeof text !== 'string' || !text.trim()) throw new Error('Missing verse');
        verses++;
      }
      chapters++;
    }
  }
  console.log(`Kinyarwanda validated: 66 books, ${chapters} chapters, ${verses} verses.`);
} catch (error) {
  console.error(`Kinyarwanda validation failed: ${error.message}. Restore the approved kin.json or complete an authorized import; no alternate edition was downloaded.`);
  process.exitCode = 1;
}
