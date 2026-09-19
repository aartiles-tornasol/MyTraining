'use client';

import { useEffect, useRef, useState } from 'react';
import { FIGURE3D } from '@/lib/program/figure3d';

/**
 * Plays a pre-rendered 3D exercise: flat WebP frames, no WebGL, no model to
 * download. The phone decodes one small image at a time and runs nothing else,
 * which is what lets this loop for 25 minutes with the screen forced on.
 *
 * One <img> whose src changes, not a stack of them. Stacking every frame and
 * toggling opacity is smoother, but 46 exercises on the gallery page would
 * decode 490 images at once — around 190 MB — and Safari on a phone will not
 * survive that. Frames are warmed into the browser cache instead, so swapping
 * the src costs a cache hit.
 *
 * The orientation word is not decoration. "De pie" or "Tumbado de lado" is the
 * question the drawings could never answer, so it is stated rather than
 * implied, and it comes from the same field that placed the body in the scene.
 */
export function Figure3D({
  exercise,
  paused = false,
  showLabel = true,
  showOrient = true,
  className,
}: {
  exercise: string;
  paused?: boolean;
  showLabel?: boolean;
  showOrient?: boolean;
  className?: string;
}) {
  const entry = FIGURE3D[exercise];
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // Warm the cache once, so changing src never waits on the network.
  useEffect(() => {
    if (!entry) return;
    const imgs = entry.frames.map((f) => {
      const img = new Image();
      img.src = `/fig3d/${exercise}/${f}`;
      return img;
    });
    return () => {
      for (const img of imgs) img.src = '';
    };
  }, [entry, exercise]);

  useEffect(() => {
    setI(0);
  }, [exercise]);

  // A gallery of 46 should not run 46 loops behind the fold.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!entry || paused || !visible) return;
    const tick = () => setI((n) => (n + 1) % entry.frames.length);
    const id = setInterval(tick, Math.max(60, entry.msPerFrame));
    const onVis = () => {
      if (document.visibilityState !== 'visible') clearInterval(id);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [entry, paused, visible]);

  if (!entry) return <div className={className} />;

  const label = entry.labels[Math.floor(i / entry.steps) % entry.labels.length];
  const orient = entry.orient.replace(/-/g, ' ');

  return (
    <div className={`flex flex-col ${className ?? ''}`}>
      <div ref={box} className="relative min-h-0 w-full flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/fig3d/${exercise}/${entry.frames[i]}`}
          alt={`${orient}. ${label}`}
          className="h-full w-full rounded-xl object-contain"
          decoding="async"
        />
        {showOrient ? (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-ink-950/80 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink-100 backdrop-blur-sm">
            {orient}
          </span>
        ) : null}
      </div>
      {showLabel ? (
        <p className="min-h-[2.5em] shrink-0 px-3 pt-1 text-center text-[0.95rem] font-semibold leading-tight text-lime-glow">
          {label}
        </p>
      ) : null}
    </div>
  );
}

export const has3D = (exercise: string) => Boolean(FIGURE3D[exercise]);
