import { useEffect, useMemo, useState } from 'react';
import { Heart, Copy, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { loadHymns, type Hymn } from '../lib/hymns';
import { useNav } from '../nav';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { copyText } from '../lib/share';

function hymnAsText(h: Hymn): string {
  const body = h.stanzas
    .map((s, i) => (s.t === 'c' ? `Chorus:\n${s.x}` : `${verseNumber(h, i)}. ${s.x}`))
    .join('\n\n');
  return `${h.book} ${h.label} — ${h.title}\n\n${body}\n\nvia Wayfind`;
}

// Count which verse (skipping choruses) a stanza index is.
function verseNumber(h: Hymn, index: number): number {
  let n = 0;
  for (let i = 0; i <= index; i++) if (h.stanzas[i].t === 'v') n++;
  return n;
}

export function HymnDetailScreen() {
  const nav = useNav();
  const { isFavoriteHymn, toggleFavoriteHymn } = useStore();
  const toast = useToast();

  const hymnId = nav.params.hymnId as string;
  const resultIdsParam = nav.params.resultIds as string[] | undefined;
  const resultIds = useMemo(() => resultIdsParam || [], [resultIdsParam]);

  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [all, setAll] = useState<Hymn[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadHymns()
      .then((d) => {
        if (cancelled) return;
        setAll(d.songs);
        setHymn(d.songs.find((s) => s.id === hymnId) || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hymnId]);

  // Prev/next within the list the user came from (fallback: whole book).
  const siblings = useMemo(() => {
    if (resultIds.length > 1) return resultIds;
    return all.filter((s) => s.book === hymn?.book).map((s) => s.id);
  }, [resultIds, all, hymn?.book]);

  const idx = siblings.indexOf(hymnId);
  const go = (delta: number) => {
    const next = siblings[idx + delta];
    if (next) nav.navigate('hymn', { hymnId: next, resultIds });
  };

  if (!hymn) {
    return (
      <div className="animate-fade-in">
        <ScreenHeader title="Indirimbo" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  const fav = isFavoriteHymn(hymn.id);

  return (
    <div className="animate-fade-in">
      <ScreenHeader
        title={`${hymn.book} ${hymn.label}`}
        right={
          <div className="flex gap-1">
            <button
              onClick={() => {
                toggleFavoriteHymn(hymn.id);
                toast.show(fav ? 'Removed from favorites' : 'Added to favorites');
              }}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={fav}
              className="rounded-lg p-2 text-[var(--ui-brown)] transition-colors hover:text-wayfind-amber"
            >
              <Heart className={`h-6 w-6 ${fav ? 'fill-wayfind-amber text-wayfind-amber' : ''}`} aria-hidden="true" />
            </button>
            <button
              onClick={async () => {
                const text = hymnAsText(hymn);
                if (navigator.share) {
                  try {
                    await navigator.share({ title: `${hymn.book} ${hymn.label}`, text });
                    return;
                  } catch {
                    /* fall through to copy */
                  }
                }
                toast.show((await copyText(text)) ? 'Copied to clipboard' : 'Could not share');
              }}
              aria-label="Share hymn"
              className="rounded-lg p-2 text-[var(--ui-brown)] transition-colors hover:text-wayfind-amber"
            >
              <Share2 className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              onClick={async () => {
                toast.show((await copyText(hymnAsText(hymn))) ? 'Copied to clipboard' : 'Could not copy');
              }}
              aria-label="Copy hymn"
              className="rounded-lg p-2 text-[var(--ui-brown)] transition-colors hover:text-wayfind-amber"
            >
              <Copy className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        }
      />

      <h2 className="verse-text mb-6 font-bold" style={{ fontSize: 'calc(var(--verse-size, 19px) + 3px)' }}>
        {hymn.title}
      </h2>

      <div className="space-y-5 pb-4">
        {hymn.stanzas.map((s, i) =>
          s.t === 'c' ? (
            <div key={i} className="rounded-xl border-l-2 border-wayfind-amber/50 bg-wayfind-amber/5 px-4 py-3">
              <p className="caption mb-1 font-semibold uppercase tracking-wide">Chorus</p>
              <p className="verse-text italic" lang="rw">{s.x}</p>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className="mt-1 shrink-0 font-dmsans text-sm font-bold text-wayfind-amber">
                {verseNumber(hymn, i)}
              </span>
              <p className="verse-text" lang="rw">{s.x}</p>
            </div>
          )
        )}
      </div>

      {/* Prev / next */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={idx <= 0}
          className="btn-secondary flex items-center gap-1 !py-3 disabled:opacity-40"
          aria-label="Previous hymn"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Prev
        </button>
        <span className="caption">{hymn.book}</span>
        <button
          onClick={() => go(1)}
          disabled={idx < 0 || idx >= siblings.length - 1}
          className="btn-secondary flex items-center gap-1 !py-3 disabled:opacity-40"
          aria-label="Next hymn"
        >
          Next <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
