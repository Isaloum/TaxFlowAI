import { useEffect, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const POLL_INTERVAL = 60_000; // 60 seconds

export function useVersionCheck() {
  const knownVersion = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/version`, { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!version) return;

        if (knownVersion.current === null) {
          // First load — store the current version
          knownVersion.current = version;
        } else if (knownVersion.current !== version) {
          // New deploy detected — reload silently
          window.location.reload();
        }
      } catch {
        // Network error — ignore, try again next interval
      }
    };

    check();
    timer = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);
}
