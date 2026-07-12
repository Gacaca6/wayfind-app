// Merges all study-note modules in scripts/studies/ into public/studies/studies.json,
// validating that every note's reference matches a curated verse reference exactly
// (so no note can point at a verse the app doesn't offer, and typos are caught).
// Run: node scripts/build-studies.cjs
const fs = require('fs');
const path = require('path');
const { curation } = require('./curation.cjs');

const STUDIES_DIR = path.join(__dirname, 'studies');
const OUT_DIR = path.join(__dirname, '..', 'public', 'studies');
fs.mkdirSync(OUT_DIR, { recursive: true });

const validRefs = new Set();
for (const entries of Object.values(curation)) {
  for (const [ref] of entries) validRefs.add(ref);
}

const REQUIRED = ['story', 'meaning', 'you', 'prayer'];
const merged = {};
const problems = [];

for (const file of fs.readdirSync(STUDIES_DIR).filter((f) => f.endsWith('.cjs')).sort()) {
  const notes = require(path.join(STUDIES_DIR, file));
  for (const [ref, note] of Object.entries(notes)) {
    if (!validRefs.has(ref)) problems.push(`${file}: "${ref}" is not a curated reference`);
    if (merged[ref]) problems.push(`${file}: duplicate note for "${ref}"`);
    for (const k of REQUIRED) {
      if (!note[k] || typeof note[k] !== 'string' || note[k].trim().length < 40) {
        problems.push(`${file}: "${ref}" field "${k}" missing or too short`);
      }
    }
    merged[ref] = note;
  }
}

if (problems.length) {
  console.error('PROBLEMS:\n' + problems.join('\n'));
  process.exit(1);
}

fs.writeFileSync(path.join(OUT_DIR, 'studies.json'), JSON.stringify(merged));
const kb = (fs.statSync(path.join(OUT_DIR, 'studies.json')).size / 1024).toFixed(0);
console.log(`studies.json: ${Object.keys(merged).length}/${validRefs.size} curated refs covered, ${kb} KB`);
