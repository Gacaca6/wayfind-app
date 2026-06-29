import { useState } from 'react';
import { Search } from 'lucide-react';
import { clusters, emotionsByCluster, type EmotionMeta } from '../data/emotions';
import { searchFeeling, versesForEmotion } from '../lib/search';
import { useNav } from '../nav';
import { useStore } from '../store';
import { EmotionIcon } from '../components/Icon';

export function FeelScreen() {
  const nav = useNav();
  const { recents, addRecent } = useStore();
  const [query, setQuery] = useState('');

  const runSearch = (q: string) => {
    const text = q.trim();
    if (!text) return;
    addRecent(text);
    const result = searchFeeling(text);
    const title =
      result.mode === 'emotion' && result.matchedEmotions.length
        ? result.matchedEmotions.map((e) => e.label).join(' & ')
        : `“${text}”`;
    const subtitle =
      result.mode === 'none'
        ? 'No exact match — try a feeling word'
        : result.mode === 'keyword'
        ? `${result.verses.length} verse${result.verses.length === 1 ? '' : 's'} mentioning that`
        : `${result.verses.length} verse${result.verses.length === 1 ? '' : 's'} to encourage you`;
    nav.navigate('results', { title, subtitle, verses: result.verses, matchedEmotions: result.matchedEmotions });
  };

  const openEmotion = (emo: EmotionMeta) => {
    nav.navigate('results', {
      title: emo.label,
      subtitle: emo.blurb,
      verses: versesForEmotion(emo.id),
      matchedEmotions: [emo],
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-header mb-1 text-2xl">How are you feeling?</h1>
      <p className="caption mb-5">Search in your own words, or pick one below.</p>

      {/* Natural-language search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
          placeholder="e.g. “I feel overwhelmed and anxious”"
          aria-label="Describe how you feel"
          className="wayfind-input w-full pr-12"
        />
        <button
          onClick={() => runSearch(query)}
          aria-label="Search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-wayfind-amber hover:text-wayfind-amber/80"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {recents.length > 0 && (
        <div className="mb-6">
          <p className="caption mb-2">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recents.map((r) => (
              <button
                key={r}
                onClick={() => runSearch(r)}
                className="rounded-full bg-wayfind-amber-tint px-3.5 py-1.5 font-dmsans text-sm text-wayfind-brown transition-colors hover:bg-wayfind-amber/20"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emotion grid grouped by cluster */}
      <div className="space-y-6">
        {clusters.map((cluster) => (
          <section key={cluster.id}>
            <h2 className="caption mb-3 font-semibold uppercase tracking-wide">{cluster.label}</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {emotionsByCluster[cluster.id].map((emo) => (
                <button
                  key={emo.id}
                  onClick={() => openEmotion(emo)}
                  className="emotion-tile aspect-square !p-3"
                  aria-label={`${emo.label} — ${emo.blurb}`}
                >
                  <EmotionIcon name={emo.icon} className="h-6 w-6 text-wayfind-amber" />
                  <span className="text-center font-dmsans text-xs leading-tight">{emo.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
