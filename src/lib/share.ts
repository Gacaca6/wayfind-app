// Share / copy helpers using native Web Share + Clipboard APIs (no libraries).

export interface ShareableVerse {
  text: string;
  reference: string;
  translation?: string;
}

export function formatVerse(v: ShareableVerse): string {
  const tr = v.translation ? ` (${v.translation})` : '';
  return `"${v.text}"\n— ${v.reference}${tr}\n\nvia Wayfind`;
}

// Returns 'shared' | 'copied' | 'failed' so the UI can show the right feedback.
export async function shareVerse(v: ShareableVerse): Promise<'shared' | 'copied' | 'failed'> {
  const payload = formatVerse(v);
  if (navigator.share) {
    try {
      await navigator.share({ title: `Wayfind — ${v.reference}`, text: payload });
      return 'shared';
    } catch (e) {
      // User cancelled the share sheet — not an error worth surfacing.
      if (e instanceof DOMException && e.name === 'AbortError') return 'shared';
      // fall through to clipboard
    }
  }
  return (await copyText(payload)) ? 'copied' : 'failed';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
