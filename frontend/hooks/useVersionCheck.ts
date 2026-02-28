import { useEffect, useRef } from 'react';

// NEXT_PUBLIC_API_URL already includes /api (e.g. https://xxx/prod/api)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const POLL_INTERVAL = 30_000; // 30 seconds

export function useVersionCheck() {
  const knownVersion = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      // Skip if tab is hidden — no point checking when user isn't looking
      if (document.visibilityState === 'hidden') return;

      try {
        const res = await fetch(`${API_BASE}/version`, { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!version) return;

        if (knownVersion.current === null) {
          knownVersion.current = version;
        } else if (knownVersion.current !== version) {
          window.location.reload();
        }
      } catch {
        // Network error — ignore, try again next interval
      }
    };

    // Check immediately on load, then every 30s
    check();
    timer = setInterval(check, POLL_INTERVAL);

    // Also check instantly when user switches back to the tab
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
