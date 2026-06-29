import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Bookmark, Share2, Copy, X } from 'lucide-react';
import { books, bookIndexByName } from '../data/books';
import { getChapter, type Translation } from '../lib/bible';
import { useStore, type SavedVerse } from '../store';
import { useNav } from '../nav';
import { useToast } from '../components/Toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { shareVerse, copyText, formatVerse } from '../lib/share';

interface Loc { book: string; chapter: number; }

export function ReaderScreen() {
  const nav = useNav();
  const { translation, setTranslation, isSaved, toggleSave } = useStore();
  const toast = useToast();

  const [loc, setLoc] = useLocalStorage<Loc>('wf.reader', { book: 'John', chapter: 1 });
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const highlightRef = useRef<HTMLParagraphElement | null>(null);
  const highlightVerse = useRef<number | null>(null);

  // Apply navigation params (e.g. "read in context") once.
  useEffect(() => {
    const p = nav.params;
    if (p.book && p.chapter) {
      setLoc({ book: p.book as string, chapter: p.chapter as number });
      highlightVerse.current = (p.highlight as number) ?? null;
    }
    if (p.translation) setTranslation(p.translation as Translation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelected(null);
    getChapter(translation, loc.book, loc.chapter)
      .then((v) => {
        if (cancelled) return;
        setVerses(v);
        setLoading(false);
        requestAnimationFrame(() => {
          if (highlightVerse.current && highlightRef.current) {
            highlightRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0 });
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setVerses([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [translation, loc.book, loc.chapter]);

  const go = (delta: number) => {
    highlightVerse.current = null;
    let bi = bookIndexByName[loc.book];
    let ch = loc.chapter + delta;
    if (ch < 1) {
      bi = (bi - 1 + books.length) % books.length;
      ch = books[bi].chapters;
    } else if (ch > books[bi].chapters) {
      bi = (bi + 1) % books.length;
      ch = 1;
    }
    setLoc({ book: books[bi].name, chapter: ch });
  };

  const verseRef = (v: number) => `${loc.book} ${loc.chapter}:${v}`;
  const selectedText = selected ? verses[selected - 1] : '';

  const saveSelected = () => {
    if (!selected) return;
    const sv: SavedVerse = {
      id: verseRef(selected),
      reference: verseRef(selected),
      text: selectedText,
      translation,
      book: loc.book,
      chapter: loc.chapter,
      verseStart: selected,
      verseEnd: selected,
    };
    const already = isSaved(sv.reference);
    toggleSave(sv);
    toast.show(already ? 'Removed from saved' : 'Saved');
  };

  return (
    <div className="animate-fade-in">
      {/* Header: book/chapter picker + translation toggle */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-wayfind-amber-tint px-4 py-2 font-dmsans font-semibold text-wayfind-brown"
        >
          {loc.book} {loc.chapter}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="inline-flex rounded-full border border-[var(--ui-border)] p-1 text-sm">
          {(['KJV', 'WEB'] as Translation[]).map((t) => (
            <button
              key={t}
              onClick={() => setTranslation(t)}
              aria-pressed={translation === t}
              className={`rounded-full px-3 py-1 font-dmsans transition-colors ${
                translation === t ? 'bg-wayfind-amber text-white' : 'text-[var(--ui-muted)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <h1 className="section-header mb-1 text-2xl">
        {loc.book} {loc.chapter}
      </h1>
      <p className="caption mb-5">{translation === 'WEB' ? 'World English Bible · easier to read' : 'King James Version'}</p>

      {/* Chapter text */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="reading">
          {verses.map((t, i) => {
            const v = i + 1;
            const isHi = highlightVerse.current === v;
            return (
              <p
                key={v}
                ref={isHi ? highlightRef : undefined}
                onClick={() => setSelected(selected === v ? null : v)}
                className={`mb-2 cursor-pointer rounded-lg px-1 transition-colors ${
                  selected === v ? 'bg-wayfind-amber/15' : isHi ? 'bg-wayfind-amber/10' : ''
                }`}
              >
                <sup className="mr-1 font-dmsans text-xs font-semibold text-wayfind-amber">{v}</sup>
                <span
                  className="font-lora text-[var(--ui-text)]"
                  style={{ fontSize: 'var(--verse-size, 19px)', lineHeight: 1.7 }}
                >
                  {t}
                </span>
              </p>
            );
          })}
        </div>
      )}

      {/* Chapter nav */}
      <div className="mt-8 flex items-center justify-between">
        <button onClick={() => go(-1)} className="btn-secondary flex items-center gap-1 !py-3" aria-label="Previous chapter">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Prev
        </button>
        <button onClick={() => go(1)} className="btn-secondary flex items-center gap-1 !py-3" aria-label="Next chapter">
          Next <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Selected-verse action bar */}
      {selected && (
        <div className="fixed inset-x-0 bottom-[4.5rem] z-40 px-4">
          <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-2xl bg-wayfind-near-black px-4 py-3 text-white shadow-lg">
            <span className="truncate font-dmsans text-sm">{verseRef(selected)}</span>
            <div className="flex items-center gap-1">
              <IconBtn label="Save" onClick={saveSelected}>
                <Bookmark className={`h-5 w-5 ${isSaved(verseRef(selected)) ? 'fill-current text-wayfind-amber' : ''}`} aria-hidden="true" />
              </IconBtn>
              <IconBtn
                label="Copy"
                onClick={async () => {
                  const ok = await copyText(formatVerse({ text: selectedText, reference: verseRef(selected), translation }));
                  toast.show(ok ? 'Copied' : 'Could not copy');
                }}
              >
                <Copy className="h-5 w-5" aria-hidden="true" />
              </IconBtn>
              <IconBtn
                label="Share"
                onClick={async () => {
                  const r = await shareVerse({ text: selectedText, reference: verseRef(selected), translation });
                  if (r === 'copied') toast.show('Copied');
                }}
              >
                <Share2 className="h-5 w-5" aria-hidden="true" />
              </IconBtn>
              <IconBtn label="Close" onClick={() => setSelected(null)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </IconBtn>
            </div>
          </div>
        </div>
      )}

      {pickerOpen && (
        <BookPicker
          current={loc}
          onPick={(book, chapter) => {
            highlightVerse.current = null;
            setLoc({ book, chapter });
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} className="rounded-lg p-2 text-white/90 hover:text-white">
      {children}
    </button>
  );
}

function BookPicker({
  current,
  onPick,
  onClose,
}: {
  current: Loc;
  onPick: (book: string, chapter: number) => void;
  onClose: () => void;
}) {
  const [book, setBook] = useState<string | null>(null);
  const chapters = book ? books[bookIndexByName[book]].chapters : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--ui-bg)]" role="dialog" aria-modal="true" aria-label="Choose a book">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-header">{book ? `${book} — choose a chapter` : 'Choose a book'}</h2>
          <button onClick={book ? () => setBook(null) : onClose} aria-label="Close" className="rounded-lg p-2 text-[var(--ui-brown)]">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {!book ? (
            (['OT', 'NT'] as const).map((t) => (
              <section key={t} className="mb-6">
                <p className="caption mb-2 font-semibold uppercase tracking-wide">
                  {t === 'OT' ? 'Old Testament' : 'New Testament'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {books.filter((b) => b.testament === t).map((b) => (
                    <button
                      key={b.name}
                      onClick={() => setBook(b.name)}
                      className={`rounded-xl px-3 py-2.5 text-left font-dmsans text-sm transition-colors ${
                        b.name === current.book ? 'bg-wayfind-amber text-white' : 'bg-wayfind-amber-tint text-wayfind-brown hover:bg-wayfind-amber/20'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: chapters }, (_, i) => i + 1).map((c) => (
                <button
                  key={c}
                  onClick={() => onPick(book, c)}
                  className={`aspect-square rounded-xl font-dmsans text-sm transition-colors ${
                    book === current.book && c === current.chapter
                      ? 'bg-wayfind-amber text-white'
                      : 'bg-wayfind-amber-tint text-wayfind-brown hover:bg-wayfind-amber/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
