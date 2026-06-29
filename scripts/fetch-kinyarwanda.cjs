// Downloads the Kinyarwanda Bible (BIR — "Bibiliya Ijambo ry'Imana", 2001) from
// the Beblia Holy-Bible-XML-Format repo and normalizes it into compact
// public/bible/kin.json (same shape as kjv/web: { t, b[book][chapter][verse] }).
//
// LICENSING NOTE (read before redistributing):
//   The underlying text is "Bibiliya Yera © Bible Society of Rwanda, 2001".
//   Beblia re-hosts it with a blanket "use freely" note, but Beblia is not the
//   rights holder. It is bundled here at the project owner's informed decision
//   for a free, non-commercial Scripture app; a permission request to the Bible
//   Society of Rwanda is on file (see docs/kinyarwanda-permission-request.md).
//
// Run: node scripts/fetch-kinyarwanda.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');

const SRC = 'https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/KinyarwandaBIRBible.xml';
const OUT = path.join(__dirname, '..', 'public', 'bible');
fs.mkdirSync(OUT, { recursive: true });

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let d = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

// Lightweight, structure-specific XML parse (no dependency). The Beblia format is
// flat and regular: <book number><chapter number><verse number>text</verse>...
function parse(xml) {
  const books = [];
  let totalV = 0, totalC = 0;
  const bookRe = /<book number="(\d+)">([\s\S]*?)<\/book>/g;
  let bm;
  while ((bm = bookRe.exec(xml))) {
    const bnum = parseInt(bm[1], 10);
    const chapters = [];
    const chRe = /<chapter number="(\d+)">([\s\S]*?)<\/chapter>/g;
    let cm;
    while ((cm = chRe.exec(bm[2]))) {
      const verses = [];
      const vRe = /<verse number="(\d+)">([\s\S]*?)<\/verse>/g;
      let vm, maxN = 0;
      const tmp = {};
      while ((vm = vRe.exec(cm[2]))) {
        const n = parseInt(vm[1], 10);
        tmp[n] = decodeEntities(vm[2]).replace(/\s+/g, ' ').trim();
        if (n > maxN) maxN = n;
      }
      // index by verse number (1-based) so it aligns with English versification;
      // any gap becomes an empty string.
      for (let i = 1; i <= maxN; i++) verses[i - 1] = tmp[i] || '';
      chapters[cm ? parseInt(cm[1], 10) - 1 : chapters.length] = verses;
      totalV += Object.keys(tmp).length;
      totalC++;
    }
    books[bnum - 1] = chapters;
  }
  return { books, totalV, totalC };
}

(async () => {
  process.stdout.write('Fetching Kinyarwanda (BIR) ... ');
  const xml = await get(SRC);
  console.log(`${(xml.length / 1024 / 1024).toFixed(1)} MB`);
  const { books, totalV, totalC } = parse(xml);
  const out = { t: 'KIN', b: books };
  fs.writeFileSync(path.join(OUT, 'kin.json'), JSON.stringify(out));
  const kb = (fs.statSync(path.join(OUT, 'kin.json')).size / 1024).toFixed(0);
  console.log(`KIN: ${books.length} books, ${totalC} chapters, ${totalV} verses -> ${kb} KB`);
})().catch((e) => { console.error(e); process.exit(1); });
