import { Bookmark } from 'lucide-react';
import { useStore } from '../store';
import { useNav } from '../nav';
import { VerseCard } from '../components/VerseCard';

export function SavedScreen() {
  const { saved } = useStore();
  const nav = useNav();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-header text-2xl">Saved verses</h1>
        {saved.length > 0 && (
          <span className="rounded-full bg-wayfind-amber px-3 py-1 font-dmsans text-xs font-semibold text-white">
            {saved.length}
          </span>
        )}
      </div>

      {saved.length > 0 ? (
        <div className="space-y-3">
          {saved.map((v) => (
            <VerseCard key={v.reference} verse={v} onOpen={() => nav.navigate('verse', { verse: v })} />
          ))}
        </div>
      ) : (
        <div className="mt-24 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wayfind-amber-tint">
            <Bookmark className="h-8 w-8 text-wayfind-amber" aria-hidden="true" />
          </div>
          <h2 className="section-header">Nothing saved yet</h2>
          <p className="body-text max-w-xs opacity-70">
            When a verse speaks to you, tap the bookmark to keep it here for whenever you need it.
          </p>
          <button onClick={() => nav.navigate('feel')} className="btn-primary mt-2">
            Find a verse
          </button>
        </div>
      )}
    </div>
  );
}
