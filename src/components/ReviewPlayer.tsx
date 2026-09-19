'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WorkCard } from './WorkCard';
import { HowTo } from './SessionPlayer';
import { animFor } from '@/lib/program/plan';
import { mmss } from '@/lib/dates';
import { beep, buzz, countdownTick, goBeep, unlockAudio } from '@/lib/feedback';
import type { ReviewScreen } from '@/lib/program/review';

/**
 * Walks the programme's working screens one at a time. The card is the very
 * same component the session player uses, so what gets judged here is what
 * shows up mid-workout; only the timer is frozen and nothing is recorded.
 */
const STORE = 'mytraining.revision.index';

export function ReviewPlayer({ screens }: { screens: ReviewScreen[] }) {
  const [i, setI] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const screen = screens[i];
  // Reviewing a held exercise means watching the countdown do its thing —
  // the beeps, the last three seconds, whether the ring crowds anything.
  const [remaining, setRemaining] = useState<number | null>(null);

  // 113 screens is more than one sitting, so come back where you left off.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORE));
      if (Number.isInteger(saved) && saved > 0 && saved < screens.length) setI(saved);
    } catch {
      /* Private mode or blocked storage: start from the top, no harm done. */
    }
  }, [screens.length]);

  const go = (n: number) => {
    setShowInfo(false);
    setRemaining(null);
    setI((c) => {
      const next = Math.min(screens.length - 1, Math.max(0, c + n));
      try {
        localStorage.setItem(STORE, String(next));
      } catch {
        /* Nothing to do: losing the position is not worth breaking the page. */
      }
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    const onStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const edge = 28;
      t0 = t.clientX < edge || t.clientX > window.innerWidth - edge ? 0 : Date.now();
      x0 = t.clientX;
      y0 = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      if (t0 === 0 || Date.now() - t0 > 600) return;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 2) return;
      go(dx < 0 ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [screens.length]);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      goBeep();
      buzz([60, 50, 60]);
      setRemaining(null);
      return;
    }
    const id = setTimeout(() => {
      if (remaining <= 4) countdownTick();
      setRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  if (!screen) return null;

  const timed = screen.seconds > 0;

  return (
    <div
      className="no-select mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4"
      style={{ paddingTop: 'calc(var(--safe-t) + 0.75rem)', paddingBottom: 'calc(var(--safe-b) + 1rem)' }}
    >
      <div className="mb-3 flex items-center gap-3">
        <Link href="/ajustes" aria-label="Salir de la revisión" className="shrink-0 text-2xl leading-none text-ink-400">
          ×
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-signal-violet transition-all duration-300"
            style={{ width: `${Math.round(((i + 1) / screens.length) * 100)}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-400">
          {i + 1}/{screens.length}
        </span>
      </div>

      <p className="mb-2 truncate text-center text-[0.68rem] font-bold uppercase tracking-wider text-signal-violet">
        {screen.origins.join('  ·  ')}
      </p>

      <WorkCard
        name={screen.exerciseName}
        subtitle={screen.subtitle}
        anim={animFor(screen.exercise, screen.phase, 0)}
        exercise={screen.exercise}
        cue={screen.item.cue}
        timer={
          timed
            ? {
                remaining: remaining ?? screen.seconds,
                total: screen.seconds,
                label: remaining === null ? 'listo' : 'aguanta',
              }
            : undefined
        }
        reps={timed ? undefined : screen.item.work}
        loadLabel={screen.item.load}
        loadSlot={
          <span className="rounded-lg border border-ink-600 px-3 py-1.5 text-sm font-semibold text-ink-400">
            — kg
          </span>
        }
        onInfo={() => setShowInfo(true)}
      />

      <p className="mb-2 text-center text-[0.7rem] text-ink-400">
        {timed ? `Aguante de ${mmss(screen.seconds)}` : 'Serie por repeticiones'}
        {screen.item.restSec > 0 ? ` · descanso ${mmss(screen.item.restSec)}` : ''}
      </p>

      {timed ? (
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            if (remaining === null) {
              beep(780, 120);
              setRemaining(screen.seconds);
            } else {
              setRemaining(null);
            }
          }}
          className="mb-2 w-full rounded-xl border border-signal-violet/40 py-3 text-sm font-bold text-signal-violet"
        >
          {remaining === null ? 'Probar la cuenta atrás' : 'Parar'}
        </button>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          className="flex-1 rounded-xl border border-ink-600 py-4 text-sm font-semibold text-ink-300 disabled:opacity-30"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={i === screens.length - 1}
          className="flex-1 rounded-xl bg-ink-700 py-4 text-sm font-bold text-ink-100 disabled:opacity-30"
        >
          Siguiente →
        </button>
      </div>

      {showInfo ? <HowTo exerciseKey={screen.exercise} onClose={() => setShowInfo(false)} /> : null}
    </div>
  );
}
