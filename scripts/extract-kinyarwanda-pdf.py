# Extracts the full Kinyarwanda Bibiliya Yera (2001, Bible Society of Rwanda)
# from the PDF provided by the Bible Society into public/bible/kin.json.
# This PDF-derived text is the canonical Kinyarwanda version for Wayfind
# (the "Mbere na mbere" edition). Requires: pip install pymupdf
#
# Usage: python scripts/extract-kinyarwanda-pdf.py <path-to-pdf>
#
# Font-based parsing (single-column Word-exported PDF):
#   Cambria-Bold 14    -> chapter heading, e.g. "Intangiriro 1"
#   Cambria 9.5        -> superscript verse number
#   TimesNewRoman 13.6 -> verse text
#   TimesNewRoman 6 "-"-> combined-range dash, e.g. verses 11-13 share one text
#   Arial*/Calibri/Georgia/Cambria 16-18 -> headings, headers, refs (skipped)
#
# Known properties of this edition (verified):
#   - Hebrew chapter boundaries in parts of the OT (Joel has 4 chapters,
#     Malachi 3), unlike KJV/WEB — kept as printed.
#   - Psalms 115 and 129 are absent from the PDF itself; they become empty
#     chapters so all other psalm numbers stay aligned.
#   - Combined ranges (Job 21:7-8, Ps 49:9-10, Rom 9:11-13) store the shared
#     text at the first verse of the range, as printed.
import fitz, re, json, sys, os

if len(sys.argv) < 2:
    sys.exit("usage: python scripts/extract-kinyarwanda-pdf.py <path-to-pdf>")
PDF = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "bible", "kin.json")

doc = fitz.open(PDF)
books = []; cur_book = None; cur = None; cur_v = None
pending_from = None; ranges = []

for pno in range(doc.page_count):
    for b in doc[pno].get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                f, sz, tx = s["font"], s["size"], s["text"]
                t = tx.strip()
                if not t:
                    continue
                if f == "Cambria-Bold" and 13.5 < sz < 14.5:
                    m = re.match(r"^(.*?)\s*(\d+)\s*$", t)
                    if not m:
                        continue
                    name, num = m.group(1).strip(), int(m.group(2))
                    if name != cur_book:
                        cur_book = name
                        books.append({})
                    cur = ({}, [])
                    books[-1][num] = cur
                    cur_v = None
                    pending_from = None
                    continue
                if f == "Cambria" and 9.0 <= sz <= 10.0:
                    if cur is None:
                        continue
                    vt = t.replace(" ", "")
                    if vt.isdigit():
                        n = int(vt)
                        if pending_from is not None:
                            ranges.append((len(books) - 1, max(books[-1].keys()), pending_from, n))
                            pending_from = None
                        cur_v = n
                        cur[0].setdefault(n, [])
                    continue
                if f.startswith("TimesNewRoman"):
                    if cur is None:
                        continue
                    if sz < 8:
                        if t in {"-", "–", "—"} and cur_v is not None:
                            pending_from = cur_v
                        continue
                    if 12.5 < sz < 14.5:
                        (cur[1] if cur_v is None else cur[0][cur_v]).append(tx)

jp = lambda p: re.sub(r"\s+", " ", "".join(p)).strip()
out = []
for chapters in books:
    maxc = max(chapters.keys()) if chapters else 0
    ob = []
    for c in range(1, maxc + 1):
        if c not in chapters:
            ob.append([])
            continue
        chap, prefix = chapters[c]
        maxv = max(chap.keys()) if chap else 0
        vs = []
        for v in range(1, maxv + 1):
            txt = jp(chap.get(v, []))
            if v == 1 and prefix:
                txt = (jp(prefix) + " " + txt).strip()
            vs.append(txt)
        ob.append(vs)
    out.append(ob)

applied = 0
for bi, cn, fv, tv in ranges:
    ch = out[bi][cn - 1]
    if tv - 1 < len(ch) and ch[tv - 1] and fv - 1 < len(ch) and not ch[fv - 1]:
        ch[fv - 1] = ch[tv - 1]
        ch[tv - 1] = ""
        applied += 1

total = sum(1 for b in out for ch in b for v in ch if v)
assert len(out) == 66, f"expected 66 books, got {len(out)}"
json.dump({"t": "KIN", "b": out}, open(OUT, "w", encoding="utf-8"),
          ensure_ascii=False, separators=(",", ":"))
print(f"books: {len(out)}, chapters: {sum(len(b) for b in out)}, verses: {total}, "
      f"combined ranges applied: {applied}")
print("wrote", os.path.abspath(OUT))
