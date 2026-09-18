'use client';

import { useEffect } from 'react';

interface WakeLockSentinelLike { release: () => Promise<void> }

/** Keep the phone awake while a session is running. Best effort. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined') return;
    const api = (navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> };
    }).wakeLock;
    if (!api) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const s = await api.request('screen');
        if (cancelled) { void s.release(); return; }
        sentinel = s;
      } catch {
        /* Denied or unsupported: the session still works, the screen just dims. */
      }
    };

    // iOS drops the lock when the app is backgrounded, so take it again on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [active]);
}
