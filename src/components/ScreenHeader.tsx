import { ArrowLeft } from 'lucide-react';
import { useNav } from '../nav';
import type { ReactNode } from 'react';

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}) {
  const nav = useNav();
  return (
    <div className="mb-6 flex items-center gap-3">
      {showBack && nav.canBack && (
        <button
          onClick={() => nav.back()}
          aria-label="Go back"
          className="-ml-2 rounded-lg p-2 text-[var(--ui-brown)] transition-colors hover:text-wayfind-amber"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="section-header truncate">{title}</h1>
        {subtitle && <p className="caption mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
