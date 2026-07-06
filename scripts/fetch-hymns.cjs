// Downloads the hymn dataset from the Indirimbo Zikundwa open repo and keeps
// ONLY the two Kinyarwanda church hymnbooks used by Wayfind's audience:
//   - Gushimisha (Indirimbo zo Gushimisha Imana) — ~442 hymns
//   - Agakiza (Indirimbo z'Agakiza)              — ~110 hymns
// Output: public/hymns/hymns.json  { books: [...], songs: [...] }
//
// LICENSING NOTE: these are mission-era church hymnbook compilations. The
// source repo claims the underlying hymnals are public domain, but carries no
// explicit license. Like the Kinyarwanda Bible text, the generated file is
// gitignored (never committed to the public repo) and is fetched at build time
// so locally built/deployed apps include it. See docs/ for the permission trail.
//
// Run: node scripts/fetch-hymns.cjs   (idempotent, non-fatal on failure)
const fs = require('fs');
const path = require('path');
const https = require('https');

const CANDIDATE_URLS = [
  'https://raw.githubusercontent.com/Reneuwumuhire/indirimbo-zikundwa/master/app/assets/data/hymns.json',
  'https://raw.githubusercontent.com/Reneuwumuhire/indirimbo-zikundwa/main/app/assets/data/hymns.json',
];

const KEEP = {
  Gushimisha: 'Gushimisha',
  Agakiza: 'Agakiza',
};

const OUT_DIR = path.join(__dirname, '..', 'public', 'hymns');
const OUT_FILE = path.join(OUT_DIR, 'hymns.json');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      let d = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

(async () => {
  if (fs.existsSync(OUT_FILE) && fs.statSync(OUT_FILE).size > 100_000) {
    console.log('Hymns hymns.json already present — skipping download.');
    return;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let raw = null;
  for (const url of CANDIDATE_URLS) {
    try {
      process.stdout.write(`Fetching hymn dataset ... `);
      raw = await get(url);
      console.log(`${(raw.length / 1024 / 1024).toFixed(1)} MB`);
      break;
    } catch (e) {
      console.log(`miss (${e.message})`);
    }
  }
  if (!raw) throw new Error('no source URL worked');

  const src = JSON.parse(raw);
  const books = [];
  const songs = [];

  for (const col of src.collections) {
    if (!KEEP[col.id]) continue;
    const colSongs = src.songs.filter((s) => s.series === col.id);
    books.push({ id: col.id, name: KEEP[col.id], count: colSongs.length });
    for (const s of colSongs) {
      // A few numbers exist twice as variants (e.g. 18 and 18b) — use the source
      // label (which distinguishes variants) in the id so ids are unique.
      const label = String(s.label || s.number).trim();
      songs.push({
        id: `${col.id}-${label}`,
        book: col.id,
        number: s.number,
        label,
        title: (s.title || '').trim(),
        // compact stanzas: t = 'v' (verse) | 'c' (chorus), x = text
        stanzas: (s.stanzas || []).map((st) => ({
          t: st.type === 'chorus' ? 'c' : 'v',
          x: (st.text || '').replace(/\s+/g, ' ').trim(),
        })).filter((st) => st.x),
      });
    }
  }

  songs.sort((a, b) => (a.book === b.book ? a.number - b.number : a.book.localeCompare(b.book)));

  // Guarantee unique ids even if the source labels ever collide.
  const seen = new Set();
  for (const s of songs) {
    let id = s.id, i = 2;
    while (seen.has(id)) id = `${s.id}-${i++}`;
    seen.add(id);
    s.id = id;
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify({ books, songs }));
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0);
  console.log(
    `Hymns: ${books.map((b) => `${b.name} ${b.count}`).join(', ')} -> ${songs.length} songs, ${kb} KB`
  );
})().catch((e) => {
  // Non-fatal: the app simply shows no hymns if this could not be fetched.
  console.warn('WARN: could not fetch hymns (app will work without them):', e.message);
  process.exit(0);
});
