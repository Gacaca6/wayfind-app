// Downloads public-domain KJV + WEB full-text from getbible.net (v2) and
// normalizes them into compact bundled JSON in public/bible/.
//   KJV: King James Version (1769) — public domain.
//   WEB: World English Bible — dedicated to the public domain.
// Run: node scripts/fetch-bible.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'public', 'bible');
fs.mkdirSync(OUT, { recursive: true });

const SOURCES = {
  KJV: 'https://api.getbible.net/v2/kjv.json',
  WEB: 'https://api.getbible.net/v2/web.json',
};

const ABBR = {
  'Genesis':'Gen','Exodus':'Exo','Leviticus':'Lev','Numbers':'Num','Deuteronomy':'Deu',
  'Joshua':'Jos','Judges':'Jdg','Ruth':'Rut','1 Samuel':'1Sa','2 Samuel':'2Sa',
  '1 Kings':'1Ki','2 Kings':'2Ki','1 Chronicles':'1Ch','2 Chronicles':'2Ch','Ezra':'Ezr',
  'Nehemiah':'Neh','Esther':'Est','Job':'Job','Psalms':'Psa','Proverbs':'Pro',
  'Ecclesiastes':'Ecc','Song of Songs':'Sng','Isaiah':'Isa','Jeremiah':'Jer','Lamentations':'Lam',
  'Ezekiel':'Eze','Daniel':'Dan','Hosea':'Hos','Joel':'Joe','Amos':'Amo','Obadiah':'Oba',
  'Jonah':'Jon','Micah':'Mic','Nahum':'Nah','Habakkuk':'Hab','Zephaniah':'Zep','Haggai':'Hag',
  'Zechariah':'Zec','Malachi':'Mal','Matthew':'Mat','Mark':'Mrk','Luke':'Luk','John':'Jhn',
  'Acts':'Act','Romans':'Rom','1 Corinthians':'1Co','2 Corinthians':'2Co','Galatians':'Gal',
  'Ephesians':'Eph','Philippians':'Php','Colossians':'Col','1 Thessalonians':'1Th',
  '2 Thessalonians':'2Th','1 Timothy':'1Ti','2 Timothy':'2Ti','Titus':'Tit','Philemon':'Phm',
  'Hebrews':'Heb','James':'Jas','1 Peter':'1Pe','2 Peter':'2Pe','1 John':'1Jn','2 John':'2Jn',
  '3 John':'3Jn','Jude':'Jud','Revelation':'Rev'
};
const OT_LAST = 'Malachi';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); return; }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function normalize(raw, label) {
  const d = JSON.parse(raw);
  const out = { t: label, b: [] };
  const meta = [];
  let isOT = true;
  for (const b of d.books) {
    const chapters = b.chapters.map((c) =>
      [...c.verses].sort((x, y) => x.verse - y.verse).map((v) => v.text.trim())
    );
    out.b.push(chapters);
    meta.push({ name: b.name, abbr: ABBR[b.name] || b.name.slice(0, 3), testament: isOT ? 'OT' : 'NT', chapters: chapters.length });
    if (b.name === OT_LAST) isOT = false;
  }
  return { out, meta };
}

(async () => {
  let lastMeta = null;
  for (const [label, url] of Object.entries(SOURCES)) {
    process.stdout.write(`Fetching ${label} ... `);
    const raw = await get(url);
    const { out, meta } = normalize(raw, label);
    fs.writeFileSync(path.join(OUT, label.toLowerCase() + '.json'), JSON.stringify(out));
    lastMeta = meta;
    const verses = out.b.reduce((s, bk) => s + bk.reduce((t, ch) => t + ch.length, 0), 0);
    console.log(`${out.b.length} books, ${verses} verses`);
  }
  fs.writeFileSync(path.join(OUT, 'books.json'), JSON.stringify(lastMeta));
  console.log('Wrote public/bible/{kjv,web,books}.json');
})().catch((e) => { console.error(e); process.exit(1); });
