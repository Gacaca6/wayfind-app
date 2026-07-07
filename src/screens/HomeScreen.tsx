import { Heart, BookOpen, Music, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { useNav } from '../nav';
import { dailyVerse } from '../lib/daily';
import { VerseCard } from '../components/VerseCard';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { profile, saved } = useStore();
  const nav = useNav();
  const verse = dailyVerse();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <p className="caption mb-1">{today}</p>
        <h1 className="section-header text-2xl">
          {profile.name ? `${greeting()}, ${profile.name}` : greeting()}
        </h1>
      </div>

      {/* Verse of the day */}
      <div className="mb-7">
        <p className="caption mb-2">Verse of the day</p>
        <div
          className="wayfind-card cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => nav.navigate('verse', { verse })}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && nav.navigate('verse', { verse })}
        >
          <p className="verse-text mb-3">{verse.text}</p>
          <p className="verse-reference">{verse.reference} · KJV</p>
        </div>
      </div>

      {/* Primary actions */}
      <div className="space-y-3">
        <button
          onClick={() => nav.navigate('feel')}
          className="flex w-full items-center justify-between rounded-2xl bg-wayfind-brown px-6 py-5 text-left font-dmsans font-semibold text-white transition-all hover:bg-wayfind-brown/90 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <Heart className="h-5 w-5" aria-hidden="true" />
            <span>
              Find verses by feeling
              <span className="block text-sm font-normal text-white/70">Tell us how you’re feeling right now</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/80" aria-hidden="true" />
        </button>

        <button
          onClick={() => nav.navigate('reader')}
          className="flex w-full items-center justify-between rounded-2xl bg-wayfind-amber px-6 py-5 text-left font-dmsans font-semibold text-white transition-all hover:bg-wayfind-amber/90 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span>
              Read the Bible
              <span className="block text-sm font-normal text-white/80">All 66 books · KJV & easy-read WEB</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/80" aria-hidden="true" />
        </button>

        <button
          onClick={() => nav.navigate('hymns')}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-wayfind-amber/40 bg-[var(--ui-surface)] px-6 py-5 text-left font-dmsans font-semibold text-[var(--ui-brown)] transition-all hover:border-wayfind-amber active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <Music className="h-5 w-5 text-wayfind-amber" aria-hidden="true" />
            <span>
              Indirimbo zo mu Gitabo
              <span className="block text-sm font-normal text-[var(--ui-muted)]">Gushimisha & Agakiza · 552 hymns</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-wayfind-amber" aria-hidden="true" />
        </button>
      </div>

      {/* Recently saved */}
      {saved.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="caption">Recently saved</p>
            <button onClick={() => nav.navigate('saved')} className="btn-text text-sm">
              See all
            </button>
          </div>
          <VerseCard
            verse={saved[0]}
            onOpen={() => nav.navigate('verse', { verse: saved[0] })}
          />
        </div>
      )}
    </div>
  );
}
