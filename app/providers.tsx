'use client';

import { CookiesNextProvider } from 'cookies-next';

export function Providers({ children }: { children: React.ReactNode }) {
  return <CookiesNextProvider>{children}</CookiesNextProvider>;
}
