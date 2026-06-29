import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface ToastApi { show: (msg: string) => void; }
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6 transition-all duration-300 ${
          msg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {msg && (
          <div className="pointer-events-auto rounded-full bg-wayfind-near-black/90 px-5 py-2.5 text-sm font-dmsans font-medium text-white shadow-lg">
            {msg}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
