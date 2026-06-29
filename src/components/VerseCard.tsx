import { Bookmark, Share2 } from 'lucide-react';
import { useStore, type SavedVerse } from '../store';
import { useToast } from './Toast';
import { shareVerse } from '../lib/share';

export interface VerseLike {
  reference: string;
  text: string;
  reflection?: string;
  translation?: string;
  emotion?: string;
  book?: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
}

export function VerseCard({ verse, onOpen }: { verse: VerseLike; onOpen?: () => void }) {
  const { isSaved, toggleSave } = useStore();
  const toast = useToast();
  const saved = isSaved(verse.reference);
  const translation = verse.translation || 'KJV';

  const asSaved = (): SavedVerse => ({
    id: verse.reference,
    reference: verse.reference,
    text: verse.text,
    translation,
    reflection: verse.reflection,
    emotion: verse.emotion,
    book: verse.book,
    chapter: verse.chapter,
    verseStart: verse.verseStart,
    verseEnd: verse.verseEnd,
  });

  return (
    <div
      className="wayfind-card cursor-pointer"
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <p className="verse-text mb-3 line-clamp-5">{verse.text}</p>
      <div className="flex items-center justify-between">
        <p className="verse-reference">
          {verse.reference} <span className="text-[var(--ui-muted)]">· {translation}</span>
        </p>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(asSaved());
              toast.show(saved ? 'Removed from saved' : 'Saved');
            }}
            aria-label={saved ? `Remove ${verse.reference} from saved` : `Save ${verse.reference}`}
            aria-pressed={saved}
            className="rounded-lg p-2 text-[var(--ui-brown)] transition-colors hover:text-wayfind-amber"
          >
            <Bookmark className={`h-5 w-5 ${saved ? 'fill-wayfind-amber text-wayfind-amber' : ''}`} aria-hidden="true" />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const r = await shareVerse({ text: verse.text, reference: verse.reference, translation });
              if (r === 'copied') toast.show('Copied to clipboard');
              else if (r === 'failed') toast.show('Could not share');
            }}
            aria-label={`Share ${verse.reference}`}
            className="rounded-lg p-2 text-[var(--ui-brown)] transition-colors hover:text-wayfind-amber"
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
