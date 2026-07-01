// Brief branded splash shown when the app opens, before the home/onboarding screen.
export function SplashScreen() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center gap-6 animate-fade-in">
      <img
        src="/wayfind-logo.jpeg"
        alt="Wayfind"
        className="h-28 w-28 rounded-2xl object-contain shadow-sm animate-pulse"
      />
      <h1 className="app-name">Wayfind</h1>
    </div>
  );
}
