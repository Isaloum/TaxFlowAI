import { useEffect, useRef } from 'react';

const POLL_INTERVAL = 30_000; // 30 seconds

export function useVersionCheck() {
  const knownVersion = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      // Skip if tab is hidden
      if (document.visibilityState === 'hidden') return;

      try {
        // Calls Next.js own API route — same domain, no auth, no CORS
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!version) return;

        if (knownVersion.current === null) {
          // First load — store build ID
          knownVersion.current = version;
        } else if (knownVersion.current !== version) {
          // New deploy detected — reload silently
          window.location.reload();
        }
      } catch {
        // Network error — ignore
      }
    };

    check();
    timer = setInterval(check, POLL_INTERVAL);

    // Instant check when user switches back to tab
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
