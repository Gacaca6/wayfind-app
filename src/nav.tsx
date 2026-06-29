import { createContext, useContext } from 'react';

export type Route =
  | 'onboarding'
  | 'home'
  | 'feel'
  | 'results'
  | 'verse'
  | 'reader'
  | 'saved'
  | 'settings';

export type Params = Record<string, unknown>;

export interface Nav {
  route: Route;
  params: Params;
  navigate: (route: Route, params?: Params) => void;
  back: () => void;
  canBack: boolean;
  reset: (route: Route, params?: Params) => void;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavContext');
  return ctx;
}
