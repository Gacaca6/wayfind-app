"""Import the user-authorized Bibiliya.com edition. Standard library only.
Run: python scripts/import-bibiliya.py
Downloads resume from work/kinyarwanda/chapters. Output is staged, never installed
until all 66 books pass validation. Preserve source spelling and verse numbers.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from http.client import HTTPSConnection
from urllib.parse import urlsplit
from threading import local
import hashlib, json, re, time, sys, shutil

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'work' / 'kinyarwanda'
CACHE = WORK / 'chapters'
SOURCE = 'https://bibiliya.com'
CONNECTIONS = local()

class ChapterParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.verses = {}; self.links = []; self.current = None; self.depth = 0
        self.heading = ''; self.in_heading = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'): self.links.append(attrs['href'])
        if tag == 'h1': self.in_heading = True
        if tag == 'div':
            if self.current is not None: self.depth += 1
            elif re.fullmatch(r'cont-\d+', attrs.get('id', '')):
                self.current = int(attrs['id'][5:]); self.depth = 1
                if self.current in self.verses: raise ValueError('Duplicate verse number')
                self.verses[self.current] = ''
    def handle_endtag(self, tag):
        if tag == 'h1': self.in_heading = False
        if tag == 'div' and self.current is not None:
            self.depth -= 1
            if self.depth == 0: self.current = None
    def handle_data(self, data):
        if self.current is not None: self.verses[self.current] += data
        if self.in_heading: self.heading += data

def download(url):
    for attempt in range(4):
        try:
            if not getattr(CONNECTIONS, 'http', None):
                CONNECTIONS.http = HTTPSConnection('bibiliya.com', timeout=45)
            connection = CONNECTIONS.http
            connection.request('GET', urlsplit(url).path, headers={'User-Agent': 'Wayfind-Translation-Import/1.0 (authorized offline Bible import)'})
            response = connection.getresponse()
            body = response.read()
            if response.status != 200: raise ValueError(f'HTTP {response.status}: {url}')
            return body.decode('utf-8')
        except Exception:
            if getattr(CONNECTIONS, 'http', None): CONNECTIONS.http.close()
            CONNECTIONS.http = None
            if attempt == 3: raise
            time.sleep(2 ** (attempt + 1))

def parse_chapter(html, chapter):
    parser = ChapterParser(); parser.feed(html)
    match = re.search(r'(\d+):1-(\d+)', parser.heading)
    if not match or int(match[1]) != chapter: raise ValueError(f'Unexpected heading: {parser.heading}')
    expected = int(match[2])
    if sorted(parser.verses) != list(range(1, len(parser.verses) + 1)):
        raise ValueError(f'Missing or extra verse rows: {parser.heading}')
    verses = []; parser.ranges = []
    for n in sorted(parser.verses):
        text = re.sub(r'\s+', ' ', parser.verses[n]).strip()
        if not text or '\ufffd' in text: raise ValueError(f'Empty or damaged verse: {parser.heading}')
        start = len(verses) + 1
        combined = re.match(r'^[-–]\s*(\d+)\s*', text)
        if combined:
            end = int(combined[1])
            if end <= start or end > expected: raise ValueError(f'Invalid combined range: {parser.heading}')
            parser.ranges.append([start, end])
            verses.append(text[combined.end():]); verses.extend([''] * (end-start))
        else: verses.append(text)
    if len(verses) != expected: raise ValueError(f'Missing or extra verse numbers: {parser.heading}')
    return verses, parser

def fetch_chapter(slug, chapter):
    dest = CACHE / f'{slug}-{chapter}.json'
    if dest.exists(): return json.loads(dest.read_text(encoding='utf-8'))
    url = f'{SOURCE}/yera/{slug}-{chapter}/'
    html = download(url)
    verses, parser = parse_chapter(html, chapter)
    chapters = sorted({int(m[1]) for link in parser.links if (m := re.fullmatch(re.escape(f'{SOURCE}/yera/{slug}-') + r'(\d+)/', link))})
    data = {'url': url, 'verses': verses, 'chapters': chapters, 'ranges': parser.ranges}
    dest.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
    time.sleep(.3)
    return data

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    backup = WORK / 'kin-before-bibiliya.json'
    if not backup.exists(): shutil.copy2(ROOT / 'public/bible/kin.json', backup)
    sample = WORK / 'sample.html'
    if not sample.exists(): sample.write_text(download(f'{SOURCE}/yera/itangiriro-1/'), encoding='utf-8')
    parser = ChapterParser(); parser.feed(sample.read_text(encoding='utf-8'))
    slugs = list(dict.fromkeys(m[1] for link in parser.links if (m := re.fullmatch(re.escape(SOURCE) + r'/yera/([^/]+)-1/',link))))
    if len(slugs) != 66 or slugs[0] != 'itangiriro' or slugs[-1] != 'ibyahishuwe': raise ValueError('Unexpected book index')
    meta = json.loads((ROOT / 'public/bible/books.json').read_text(encoding='utf-8'))
    result = [None] * 66
    ranges = {}
    def book(index, slug):
        first = fetch_chapter(slug, 1)
        chapters = first['chapters']
        if not chapters or chapters != list(range(1, max(chapters)+1)): raise ValueError(f'Chapter gaps: {slug}')
        if abs(len(chapters) - meta[index]['chapters']) > 1: raise ValueError(f'Unexpected chapter count: {slug}')
        entries = [first] + [fetch_chapter(slug, ch) for ch in chapters[1:]]
        data = [entry['verses'] for entry in entries]
        for ch, entry in enumerate(entries,1):
            if entry.get('ranges'): ranges[f'{index}:{ch}'] = entry['ranges']
        return index, data, {'name':meta[index]['name'], 'slug':slug, 'chapters':len(data), 'verses':sum(map(len,data))}
    reports = [None] * 66
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(book, i, slug) for i, slug in enumerate(slugs)]
        for completed, future in enumerate(as_completed(futures),1):
            i, data, report = future.result(); result[i] = data; reports[i] = report
            print(f"{completed}/66 {report['name']}: {report['chapters']} chapters, {report['verses']} verses", flush=True)
    corpus = {'t':'KIN','b':result,'r':ranges}
    encoded = json.dumps(corpus,ensure_ascii=False,separators=(',',':'))
    (WORK/'kin-bibiliya.json').write_text(encoded,encoding='utf-8')
    old = json.loads((WORK/'kin-before-bibiliya.json').read_text(encoding='utf-8'))['b']
    normalize = lambda text: re.sub(r'\s+', ' ', text.replace('\u2019', "'").replace('\u2018', "'")).strip()
    changed = added = same = 0
    for bi, book in enumerate(result):
        for ci, chapter in enumerate(book):
            for vi, verse in enumerate(chapter):
                if not verse: continue
                previous = old[bi][ci][vi] if ci < len(old[bi]) and vi < len(old[bi][ci]) else ''
                if not previous: added += 1
                elif normalize(previous) == normalize(verse): same += 1
                else: changed += 1
    report = {'source':SOURCE, 'retrievedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),
        'permission':'User confirmed permission or a licensed copy in chat on 2026-10-06; confirmation is not an independently verified license.',
        'sha256':hashlib.sha256(encoded.encode()).hexdigest(), 'books':reports,
        'totals':{'books':66,'chapters':sum(len(b) for b in result),'verses':sum(len(c) for b in result for c in b)},
        'combinedRanges':ranges,
        'comparison':{'sameIgnoringApostropheStyle':same,'differentAtSameReference':changed,'newlyFilled':added}}
    (WORK/'import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'totals':report['totals'],'comparison':report['comparison']}),flush=True)
    if '--install' in sys.argv:
        destination = ROOT / 'public/bible/kin.json'
        original = destination.read_bytes()
        original_hash = hashlib.sha256(original).hexdigest()[:16]
        (WORK / f'kin-backup-{original_hash}.json').write_bytes(original)
        temp = destination.with_suffix('.json.tmp')
        temp.write_text(encoded, encoding='utf-8')
        temp.replace(destination)
        manifest = {key: report[key] for key in ['source','retrievedAt','sha256','totals','books']}
        (ROOT / 'public/bible/kin.source.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
        print('Installed validated Bibiliya.com text and source manifest.',flush=True)

if __name__ == '__main__': main()
