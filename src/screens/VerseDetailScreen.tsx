import { useEffect, useState } from 'react';
import { Bookmark, Share2, Copy, BookOpen, Landmark, Lightbulb, Heart, MessageCircle } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { useNav } from '../nav';
import { useStore, type SavedVerse } from '../store';
import { useToast } from '../components/Toast';
import { getPassage, type Translation } from '../lib/bible';
import { getStudy, type StudyNote } from '../lib/studies';
import { shareVerse, copyText, formatVerse } from '../lib/share';
import type { VerseLike } from '../components/VerseCard';

export function VerseDetailScreen() {
  const nav = useNav();
  const { translation, isSaved, toggleSave } = useStore();
  const toast = useToast();

  const verse = nav.params.verse as VerseLike;
  const related = ((nav.params.related as VerseLike[]) || []).filter((v) => v.reference !== verse?.reference).slice(0, 3);

  const [display, setDisplay] = useState<Translation>(translation);
  // Text fetched for an alternate translation (e.g. WEB). Keyed by translation so
  // we never need to synchronously reset state inside the effect.
  const [override, setOverride] = useState<{ t: Translation; text: string } | null>(null);

  const hasLocation = !!(verse?.book && verse?.chapter && verse?.verseStart);
  const curatedIsKjv = (verse?.translation || 'KJV') === 'KJV';

  // Study note ("Understand this verse") for this reference, when one exists.
  // Keyed by reference so stale notes never show for a different verse.
  const [studyFor, setStudyFor] = useState<{ ref: string; note: StudyNote | null } | null>(null);
  useEffect(() => {
    if (!verse?.reference) return;
    let cancelled = false;
    getStudy(verse.reference).then((note) => {
      if (!cancelled) setStudyFor({ ref: verse.reference, note });
    });
    return () => {
      cancelled = true;
    };
  }, [verse?.reference]);
  const study = studyFor && studyFor.ref === verse?.reference ? studyFor.note : null;

  useEffect(() => {
    // The in-hand curated text already covers KJV; only fetch when showing another translation.
    if (display === 'KJV' && curatedIsKjv) return;
    if (!hasLocation) return;
    let cancelled = false;
    getPassage(display, verse.book!, verse.chapter!, verse.verseStart!, verse.verseEnd || verse.verseStart!)
      .then((t) => !cancelled && setOverride({ t: display, text: t || verse.text }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [display, verse, hasLocation, curatedIsKjv]);

  if (!verse) return null;

  const text = override && override.t === display ? override.text : verse.text;
  const saved = isSaved(verse.reference);

  const asSaved = (): SavedVerse => ({
    id: verse.reference,
    reference: verse.reference,
    text,
    translation: display,
    reflection: verse.reflection,
    emotion: verse.emotion,
    book: verse.book,
    chapter: verse.chapter,
    verseStart: verse.verseStart,
    verseEnd: verse.verseEnd,
  });

  return (
    <div className="animate-fade-in">
      <ScreenHeader title={verse.reference} />

      {/* Translation toggle */}
      <div className="mb-6 inline-flex rounded-full border border-[var(--ui-border)] p-1">
        {(['KJV', 'WEB', 'KIN'] as Translation[]).map((t) => (
          <button
            key={t}
            onClick={() => setDisplay(t)}
            aria-pressed={display === t}
            className={`rounded-full px-4 py-1.5 font-dmsans text-sm transition-colors ${
              display === t ? 'bg-wayfind-amber text-white' : 'text-[var(--ui-muted)]'
            }`}
          >
            {t === 'WEB' ? 'WEB · easier' : t === 'KIN' ? 'Ikinyarwanda' : 'KJV'}
          </button>
        ))}
      </div>

      {/* Verse */}
      <blockquote className="mb-6 text-center">
        <p
          className="verse-text text-balance leading-loose"
          style={{ fontSize: 'calc(var(--verse-size, 19px) + 4px)' }}
          lang={display === 'KIN' ? 'rw' : 'en'}
        >
          {text}
        </p>
        <cite className="verse-reference mt-4 block not-italic text-base">
          {verse.reference} · {display === 'KIN' ? 'Bibiliya Yera' : display}
        </cite>
      </blockquote>

      {/* Actions */}
      <div className="mb-7 grid grid-cols-3 gap-2">
        <ActionButton
          label={saved ? 'Saved' : 'Save'}
          active={saved}
          icon={<Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />}
          onClick={() => {
            toggleSave(asSaved());
            toast.show(saved ? 'Removed from saved' : 'Saved');
          }}
        />
        <ActionButton
          label="Copy"
          icon={<Copy className="h-5 w-5" aria-hidden="true" />}
          onClick={async () => {
            const ok = await copyText(formatVerse({ text, reference: verse.reference, translation: display }));
            toast.show(ok ? 'Copied to clipboard' : 'Could not copy');
          }}
        />
        <ActionButton
          label="Share"
          icon={<Share2 className="h-5 w-5" aria-hidden="true" />}
          onClick={async () => {
            const r = await shareVerse({ text, reference: verse.reference, translation: display });
            if (r === 'copied') toast.show('Copied to clipboard');
            else if (r === 'failed') toast.show('Could not share');
          }}
        />
      </div>

      {/* Reflection */}
      {verse.reflection && (
        <div className="wayfind-card mb-6">
          <p className="caption mb-2 font-semibold uppercase tracking-wide">Reflection</p>
          <p className="body-text leading-relaxed">{verse.reflection}</p>
        </div>
      )}

      {/* Understand this verse — beginner-friendly study note */}
      {study && (
        <div className="mb-6">
          <h2 className="section-header mb-3">Understand this verse</h2>
          <div className="space-y-3">
            <StudyBlock
              icon={<Landmark className="h-4 w-4" aria-hidden="true" />}
              title="The story behind it"
              text={study.story}
            />
            <StudyBlock
              icon={<Lightbulb className="h-4 w-4" aria-hidden="true" />}
              title="What it means"
              text={study.meaning}
            />
            <StudyBlock
              icon={<Heart className="h-4 w-4" aria-hidden="true" />}
              title="For you today"
              text={study.you}
            />
            <div className="rounded-2xl border-2 border-wayfind-amber/30 bg-wayfind-amber/5 p-5">
              <p className="caption mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-wayfind-amber">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Pray it
              </p>
              <p className="font-lora italic leading-relaxed text-[var(--ui-text)]" style={{ fontSize: 'var(--verse-size, 19px)' }}>
                {study.prayer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Read in context */}
      {hasLocation && (
        <button
          onClick={() =>
            nav.navigate('reader', {
              book: verse.book,
              chapter: verse.chapter,
              highlight: verse.verseStart,
              translation: display,
            })
          }
          className="mb-7 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-wayfind-brown/15 px-6 py-3.5 font-dmsans font-medium text-wayfind-brown transition-colors hover:bg-wayfind-brown/5"
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          Read {verse.book} {verse.chapter} in context
        </button>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <p className="caption mb-3">You might also like</p>
          <div className="space-y-2">
            {related.map((r) => (
              <button
                key={r.reference}
                onClick={() => nav.navigate('verse', { verse: r, related })}
                className="wayfind-card block w-full text-left"
              >
                <p className="verse-text mb-1 line-clamp-2 text-base">{r.text}</p>
                <p className="verse-reference">{r.reference}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudyBlock({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="wayfind-card">
      <p className="caption mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
        <span className="text-wayfind-amber">{icon}</span> {title}
      </p>
      <p className="body-text leading-relaxed">{text}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex flex-col items-center gap-1.5 rounded-xl border border-[var(--ui-border)] py-3 font-dmsans text-xs transition-colors hover:border-wayfind-amber/40 ${
        active ? 'text-wayfind-amber' : 'text-[var(--ui-brown)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
