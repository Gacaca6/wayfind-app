import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { AppProvider, useStore } from './store';
import { ToastProvider } from './components/Toast';
import { NavContext, type Nav, type Params, type Route } from './nav';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { FeelScreen } from './screens/FeelScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { VerseDetailScreen } from './screens/VerseDetailScreen';
import { ReaderScreen } from './screens/ReaderScreen';
import { SavedScreen } from './screens/SavedScreen';
import { SettingsScreen } from './screens/SettingsScreen';

interface Entry { route: Route; params: Params; }

function Router() {
  const { profile } = useStore();
  const [stack, setStack] = useState<Entry[]>([{ route: 'splash', params: {} }]);

  const navigate = useCallback((route: Route, params: Params = {}) => {
    setStack((s) => [...s, { route, params }]);
    window.scrollTo({ top: 0 });
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    window.scrollTo({ top: 0 });
  }, []);

  const reset = useCallback((route: Route, params: Params = {}) => {
    setStack([{ route, params }]);
    window.scrollTo({ top: 0 });
  }, []);

  const top = stack[stack.length - 1];

  // Show the branded splash briefly, then move on to home (or onboarding).
  useEffect(() => {
    if (top.route !== 'splash') return;
    const t = setTimeout(() => reset(profile.onboarded ? 'home' : 'onboarding'), 2200);
    return () => clearTimeout(t);
  }, [top.route, profile.onboarded, reset]);

  const nav = useMemo<Nav>(
    () => ({ route: top.route, params: top.params, navigate, back, reset, canBack: stack.length > 1 }),
    [top, navigate, back, reset, stack.length]
  );

  const showNav = top.route !== 'onboarding' && top.route !== 'splash';

  return (
    <NavContext.Provider value={nav}>
      <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
        <main className="mx-auto max-w-md px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-28">
          <Screen route={top.route} />
        </main>
        {showNav && <BottomNav />}
      </div>
    </NavContext.Provider>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route) {
    case 'splash':
      return <SplashScreen />;
    case 'onboarding':
      return <OnboardingScreen />;
    case 'home':
      return <HomeScreen />;
    case 'feel':
      return <FeelScreen />;
    case 'results':
      return <ResultsScreen />;
    case 'verse':
      return <VerseDetailScreen />;
    case 'reader':
      return <ReaderScreen />;
    case 'saved':
      return <SavedScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </AppProvider>
  );
}
