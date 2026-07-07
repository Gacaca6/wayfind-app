import { BookOpen, Moon, Type, Info, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { TRANSLATIONS } from '../lib/bible';

export function SettingsScreen() {
  const { profile, setProfile, translation, setTranslation, darkMode, setDarkMode, fontSize, setFontSize } = useStore();
  const toast = useToast();

  return (
    <div className="animate-fade-in">
      <h1 className="section-header mb-6 text-2xl">Settings</h1>

      {/* Name */}
      <div className="wayfind-card mb-4">
        <label htmlFor="set-name" className="caption mb-2 block">Your name</label>
        <input
          id="set-name"
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Your name"
          className="wayfind-input w-full"
        />
      </div>

      {/* Default translation */}
      <Row icon={<BookOpen className="h-5 w-5" aria-hidden="true" />} label="Bible version">
        <div className="inline-flex rounded-full border border-[var(--ui-border)] p-1 text-sm">
          {TRANSLATIONS.map(({ id }) => (
            <button
              key={id}
              onClick={() => setTranslation(id)}
              aria-pressed={translation === id}
              className={`rounded-full px-3 py-1 font-dmsans transition-colors ${
                translation === id ? 'bg-wayfind-amber text-white' : 'text-[var(--ui-muted)]'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </Row>

      {/* Dark mode */}
      <Row icon={<Moon className="h-5 w-5" aria-hidden="true" />} label="Dark mode">
        <Switch checked={darkMode} onChange={setDarkMode} label="Dark mode" />
      </Row>

      {/* Font size */}
      <div className="wayfind-card mb-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-3 body-text">
            <Type className="h-5 w-5 text-[var(--ui-brown)]" aria-hidden="true" /> Reading size
          </span>
          <span className="font-dmsans font-medium text-wayfind-amber">{fontSize}px</span>
        </div>
        <input
          type="range"
          min={15}
          max={26}
          step={1}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          aria-label="Reading text size"
          className="w-full accent-wayfind-amber"
        />
        <p className="mt-3 font-lora text-[var(--ui-text)]" style={{ fontSize: 'var(--verse-size, 19px)' }}>
          “The Lord is my shepherd; I shall not want.”
        </p>
      </div>

      {/* About */}
      <div className="wayfind-card mb-4">
        <p className="caption mb-2 flex items-center gap-2 font-semibold uppercase tracking-wide">
          <Info className="h-4 w-4" aria-hidden="true" /> About
        </p>
        <p className="body-text text-sm leading-relaxed">
          Wayfind helps you find scripture for whatever you’re feeling, and read the whole Bible with ease.
          Three versions are included: the <strong>King James Version</strong> (familiar), the
          <strong> World English Bible</strong> (easy to read), and <strong>Bibiliya Yera</strong> in
          Kinyarwanda — so you can read God’s Word in your own language. Everything works offline.
          No accounts, no ads, no cost.
        </p>
        <p className="caption mt-3">
          Kinyarwanda Scripture: <strong>Bibiliya Yera © 2001, Bible Society of Rwanda</strong> — used
          with grateful acknowledgement of the Bible Society of Rwanda, who provided the text of this
          translation. Indirimbo: Gushimisha &amp; Agakiza hymnbooks, via the open Indirimbo Zikundwa
          dataset — with gratitude to the churches that compiled them.
        </p>
      </div>

      {/* Clear data */}
      <button
        onClick={() => {
          if (confirm('Clear saved verses and reset settings on this device?')) {
            ['wf.profile', 'wf.saved', 'wf.recents', 'wf.translation', 'wf.darkMode', 'wf.fontSize', 'wf.reader', 'wf.showKinyarwanda', 'wf.favoriteHymns'].forEach((k) =>
              localStorage.removeItem(k)
            );
            toast.show('Cleared — reloading');
            setTimeout(() => location.reload(), 600);
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-dmsans font-medium text-red-700/80 transition-colors hover:bg-red-500/10"
      >
        <Trash2 className="h-5 w-5" aria-hidden="true" /> Clear data on this device
      </button>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="wayfind-card mb-4 flex items-center justify-between">
      <span className="flex items-center gap-3 body-text">
        <span className="text-[var(--ui-brown)]">{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-wayfind-amber' : 'bg-wayfind-brown/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[1.4rem]' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
