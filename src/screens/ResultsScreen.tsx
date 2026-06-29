import { ScreenHeader } from '../components/ScreenHeader';
import { VerseCard, type VerseLike } from '../components/VerseCard';
import { EmotionIcon } from '../components/Icon';
import { useNav } from '../nav';
import type { EmotionMeta } from '../data/emotions';
import { versesForEmotion } from '../lib/search';

export function ResultsScreen() {
  const nav = useNav();
  const title = (nav.params.title as string) || 'Verses for you';
  const subtitle = nav.params.subtitle as string | undefined;
  const verses = (nav.params.verses as VerseLike[]) || [];
  const matched = (nav.params.matchedEmotions as EmotionMeta[]) || [];

  return (
    <div className="animate-fade-in">
      <ScreenHeader title={title} subtitle={subtitle} />

      {matched.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {matched.map((emo) => (
            <span
              key={emo.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-wayfind-amber-tint px-3 py-1.5 font-dmsans text-sm text-wayfind-brown"
            >
              <EmotionIcon name={emo.icon} className="h-4 w-4 text-wayfind-amber" />
              {emo.label}
            </span>
          ))}
        </div>
      )}

      {verses.length > 0 ? (
        <div className="space-y-3">
          {verses.map((v) => (
            <VerseCard key={v.reference} verse={v} onOpen={() => nav.navigate('verse', { verse: v, related: verses })} />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="body-text opacity-70 max-w-xs">
            We couldn’t find a match for that. Try a feeling word like “anxious”, “grateful”, or “lonely”.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(['anxious', 'hopeful', 'grateful', 'lonely', 'afraid'] as const).map((id) => (
              <button
                key={id}
                onClick={() =>
                  nav.navigate('results', {
                    title: id[0].toUpperCase() + id.slice(1),
                    verses: versesForEmotion(id),
                  })
                }
                className="rounded-full bg-wayfind-amber-tint px-3.5 py-1.5 font-dmsans text-sm capitalize text-wayfind-brown hover:bg-wayfind-amber/20"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
