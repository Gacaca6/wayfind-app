import { Home, Heart, BookOpen, Bookmark, Settings } from 'lucide-react';
import { useNav, type Route } from '../nav';

const ITEMS: { route: Route; label: string; icon: typeof Home; match: Route[] }[] = [
  { route: 'home', label: 'Home', icon: Home, match: ['home'] },
  { route: 'feel', label: 'Feel', icon: Heart, match: ['feel', 'results', 'verse'] },
  { route: 'reader', label: 'Bible', icon: BookOpen, match: ['reader'] },
  { route: 'saved', label: 'Saved', icon: Bookmark, match: ['saved'] },
  { route: 'settings', label: 'Settings', icon: Settings, match: ['settings'] },
];

export function BottomNav() {
  const nav = useNav();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--ui-border)] bg-[var(--ui-bg)]/95 backdrop-blur px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match.includes(nav.route);
          return (
            <button
              key={item.route}
              onClick={() => nav.navigate(item.route)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                active ? 'text-wayfind-amber' : 'text-[var(--ui-muted)] hover:text-wayfind-amber'
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="font-dmsans text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
