'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ExerciseNeighbours } from '@/lib/program/exercises';

type Side = { key: string; name: string } | null;

const href = (key: string) => `/ejercicios/${key}`;

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
      <path
        d={dir === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Stepping through the catalogue, next to the way out of it. The arrows live in
 * the header rather than around the figure because the space around the figure
 * belongs to the exercise's own images.
 *
 * This also carries the keyboard and swipe shortcuts, mounted once per page.
 */
export function ExerciseHeaderNav({ nav }: { nav: ExerciseNeighbours }) {
  const router = useRouter();
  const { prev, next } = nav;

  useEffect(() => {
    const go = (side: Side) => {
      if (side) router.push(href(side.key));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') go(prev);
      else if (e.key === 'ArrowRight') go(next);
    };

    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    const onStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      // Safari on iOS owns the first few pixels of each edge for its own back
      // and forward swipes; starting there means the gesture is not ours.
      const edge = 28;
      t0 = t.clientX < edge || t.clientX > window.innerWidth - edge ? 0 : Date.now();
      x0 = t.clientX;
      y0 = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      // Only a deliberate sideways flick counts; anything else was a scroll.
      if (t0 === 0 || Date.now() - t0 > 600) return;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 2) return;
      go(dx < 0 ? next : prev);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [prev, next, router]);

  const arrow =
    'flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-90';
  const live = 'border-ink-700 bg-ink-800 text-ink-100';
  const dead = 'border-ink-800/60 text-ink-700';

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {prev ? (
        <Link href={href(prev.key)} aria-label={`Anterior: ${prev.name}`} className={`${arrow} ${live}`}>
          <Chevron dir="left" />
        </Link>
      ) : (
        <span className={`${arrow} ${dead}`} aria-hidden>
          <Chevron dir="left" />
        </span>
      )}
      {next ? (
        <Link href={href(next.key)} aria-label={`Siguiente: ${next.name}`} className={`${arrow} ${live}`}>
          <Chevron dir="right" />
        </Link>
      ) : (
        <span className={`${arrow} ${dead}`} aria-hidden>
          <Chevron dir="right" />
        </span>
      )}
      <Link href="/ejercicios" className="pl-1 text-sm font-semibold text-ink-400">
        Volver
      </Link>
    </div>
  );
}

/** The named jump at the foot of the page, for when you have read to the end. */
export function ExerciseNav({ nav }: { nav: ExerciseNeighbours }) {
  const box =
    'flex min-h-[4.25rem] flex-col justify-center rounded-xl2 border border-ink-700/70 bg-ink-850 px-3 py-2.5 transition active:scale-[0.98]';

  return (
    <nav className="mt-4" aria-label="Ejercicio anterior y siguiente">
      <p className="mb-2 text-center text-[0.72rem] font-semibold text-ink-400">
        <span className="text-ink-300">{nav.index}</span> de {nav.total} · {nav.groupName}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {nav.prev ? (
          <Link href={href(nav.prev.key)} className={box}>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink-400">
              ← Anterior
            </span>
            <span className="mt-0.5 line-clamp-2 text-[0.82rem] font-semibold leading-tight">
              {nav.prev.name}
            </span>
          </Link>
        ) : (
          <span className={`${box} opacity-40`}>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink-400">
              Primero
            </span>
            <span className="mt-0.5 text-[0.82rem] font-semibold leading-tight text-ink-400">
              No hay anterior
            </span>
          </span>
        )}

        {nav.next ? (
          <Link href={href(nav.next.key)} className={`${box} text-right`}>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink-400">
              Siguiente →
            </span>
            <span className="mt-0.5 line-clamp-2 text-[0.82rem] font-semibold leading-tight">
              {nav.next.name}
            </span>
          </Link>
        ) : (
          <span className={`${box} text-right opacity-40`}>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-ink-400">
              Último
            </span>
            <span className="mt-0.5 text-[0.82rem] font-semibold leading-tight text-ink-400">
              Fin del catálogo
            </span>
          </span>
        )}
      </div>
    </nav>
  );
}
