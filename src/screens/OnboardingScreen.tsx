import { useState } from 'react';
import { useStore } from '../store';
import { useNav } from '../nav';

export function OnboardingScreen() {
  const { profile, setProfile } = useStore();
  const nav = useNav();
  const [name, setName] = useState(profile.name);

  const begin = () => {
    setProfile({ name: name.trim(), onboarded: true });
    nav.reset('home');
  };

  return (
    <div className="flex min-h-[82vh] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center animate-fade-in">
        <img src="/wayfind-logo.jpeg" alt="Wayfind" className="h-24 w-24 rounded-2xl object-contain shadow-sm" />
        <div>
          <h1 className="app-name mb-3">Wayfind</h1>
          <p className="font-lora text-xl leading-relaxed text-[var(--ui-brown)] max-w-xs mx-auto">
            “Find scripture for whatever you’re feeling — and learn to know the Word.”
          </p>
        </div>

        <div className="w-full max-w-xs text-left">
          <label htmlFor="wf-name" className="caption mb-2 block">
            What should we call you? <span className="opacity-60">(optional)</span>
          </label>
          <input
            id="wf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && begin()}
            placeholder="Your name"
            autoComplete="given-name"
            className="wayfind-input w-full"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <button onClick={begin} className="btn-primary w-full">
          Begin
        </button>
        <p className="caption text-center px-4">
          Free forever. Works offline. The whole Bible (KJV & WEB) is included.
        </p>
      </div>
    </div>
  );
}
