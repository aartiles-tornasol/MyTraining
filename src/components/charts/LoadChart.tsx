'use client';

import { useState } from 'react';

const BAR = '#b9dd1f';

export interface LoadPoint { label: string; kg: number }

/** Top load per week for the programme's anchor lift. One series, so no legend. */
export function LoadChart({ points, unit = 'kg' }: { points: LoadPoint[]; unit?: string }) {
  const [sel, setSel] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-ink-400">
        Cuando lleves un par de semanas registrando el peso de la mochila, aquí verás
        cómo sube.
      </p>
    );
  }

  const max = Math.max(...points.map((p) => p.kg), 1);
  const w = 320;
  const h = 130;
  const pad = { l: 6, r: 6, t: 18, b: 18 };
  const slot = (w - pad.l - pad.r) / points.length;
  const barW = Math.min(slot - 6, 26);
  const shown = sel ?? points.length - 1;

  return (
    <div>
      <p className="mb-1 text-xs text-ink-400">
        <span className="font-bold text-ink-100">{points[shown].label}</span>
        {' · '}
        <span className="font-bold" style={{ color: BAR }}>{points[shown].kg} {unit}</span>
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Carga por semana">
        {points.map((p, i) => {
          const barH = ((h - pad.t - pad.b) * p.kg) / max;
          const x = pad.l + i * slot + (slot - barW) / 2;
          const yTop = h - pad.b - barH;
          return (
            <g key={p.label} onClick={() => setSel(i)}>
              <rect x={x - 3} y={pad.t} width={barW + 6} height={h - pad.t} fill="transparent" />
              {/* 4px rounded data-end anchored to the baseline. */}
              <rect
                x={x} y={yTop} width={barW} height={Math.max(barH, 3)}
                rx="4" fill={BAR} opacity={i === shown ? 1 : 0.55}
              />
              {i === shown ? (
                <text x={x + barW / 2} y={yTop - 5} fontSize="9" fill="#e6edf5" textAnchor="middle" fontWeight="700">
                  {p.kg}
                </text>
              ) : null}
              <text x={x + barW / 2} y={h - 5} fontSize="8" fill="#7488a0" textAnchor="middle">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
