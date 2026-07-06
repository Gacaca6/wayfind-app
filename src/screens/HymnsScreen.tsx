import { useEffect, useMemo, useState } from 'react';
import { Search, Heart, Music } from 'lucide-react';
import { loadHymns, searchHymns, type Hymn, type HymnBook } from '../lib/hymns';
import { useNav } from '../nav';
import { useStore } from '../store';

type BookFilter = string | 'all' | 'favorites';

export function HymnsScreen() {
  const nav = useNav();
  const { favoriteHymns } = useStore();

  const [books, setBooks] = useState<HymnBook[]>([]);
  const [songs, setSongs] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [book, setBook] = useState<BookFilter>('all');

  useEffect(() => {
    let cancelled = false;
    loadHymns()
      .then((d) => {
        if (cancelled) return;
        setBooks(d.books);
        setSongs(d.songs);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const data = { books, songs };
    if (book === 'favorites') {
      const favs = songs.filter((s) => favoriteHymns.includes(s.id));
      return query.trim() ? searchHymns({ books, songs: favs }, query) : favs;
    }
    return searchHymns(data, query, book === 'all' ? undefined : book);
  }, [books, songs, query, book, favoriteHymns]);

  return (
    <div className="animate-fade-in">
      <h1 className="section-header mb-1 text-2xl">Indirimbo zo mu Gitabo</h1>
      <p className="caption mb-5">Gushimisha &amp; Agakiza · {songs.length || '…'} hymns · works offline</p>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Number, title or lyrics… e.g. “Gushimisha 256”"
          aria-label="Search hymns"
          className="wayfind-input w-full pr-12"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-wayfind-amber">
          <Search className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      {/* Book filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip label="All" active={book === 'all'} onClick={() => setBook('all')} />
        {books.map((b) => (
          <FilterChip key={b.id} label={b.name} active={book === b.id} onClick={() => setBook(b.id)} />
        ))}
        <FilterChip
          label={`Favorites${favoriteHymns.length ? ` (${favoriteHymns.length})` : ''}`}
          active={book === 'favorites'}
          onClick={() => setBook('favorites')}
        />
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-xl" />
          ))}
        </div>
      )}

      {failed && (
        <p className="body-text mt-8 text-center opacity-70">
          Hymns could not be loaded. Check your connection once — after that they work offline.
        </p>
      )}

      {!loading && !failed && (
        results.length ? (
          <ul className="space-y-1.5">
            {results.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => nav.navigate('hymn', { hymnId: h.id, resultIds: results.map((r) => r.id) })}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-wayfind-amber/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wayfind-amber-tint font-dmsans text-sm font-bold text-wayfind-brown">
                    {h.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-dmsans font-medium text-[var(--ui-text)]">{h.title}</span>
                    <span className="caption">{h.book}</span>
                  </span>
                  {favoriteHymns.includes(h.id) && (
                    <Heart className="h-4 w-4 shrink-0 fill-wayfind-amber text-wayfind-amber" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Music className="h-8 w-8 text-wayfind-amber/60" aria-hidden="true" />
            <p className="body-text opacity-70">
              {book === 'favorites' && !favoriteHymns.length
                ? 'No favorite hymns yet — tap the heart on any hymn to keep it here.'
                : 'No hymn matches that. Try a number like “256” or a word from the lyrics.'}
            </p>
          </div>
        )
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 font-dmsans text-sm transition-colors ${
        active ? 'bg-wayfind-amber text-white' : 'bg-wayfind-amber-tint text-wayfind-brown hover:bg-wayfind-amber/20'
      }`}
    >
      {label}
    </button>
  );
}
