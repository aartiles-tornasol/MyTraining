'use client';

import { mmss } from '@/lib/dates';

export function TimerRing({
  remaining,
  total,
  color = '#d6f645',
  label,
  size = 190,
}: {
  remaining: number;
  total: number;
  color?: string;
  label?: string;
  size?: number;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#222e3c" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[2.6rem] font-bold leading-none tabular-nums" style={{ color }}>
          {mmss(remaining)}
        </span>
        {label ? (
          <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-400">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
