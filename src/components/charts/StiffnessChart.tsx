'use client';

import { useMemo, useState } from 'react';
import { shortDate } from '@/lib/dates';

/* Palette validated with the dataviz validator against the #141a22 chart
   surface (dark band L 0.48-0.67, chroma floor, CVD separation, 3:1 contrast). */
const LINE = '#b9dd1f';       // the 7-day average: the only real series
const RAW = '#4c5f72';        // individual days, deliberately recessive
const GOOD = '#3ddc97';
const SESSION = '#a78bfa';   // el dolor sentido al entrenar, no al levantarse

export interface Point { day: string; value: number | null }

export function StiffnessChart({
  points,
  sessionPoints = [],
}: {
  points: Point[];
  /** Dolor al entrenar, un valor por día, alineado con `points`. */
  sessionPoints?: (number | null)[];
}) {
  const [sel, setSel] = useState<number | null>(null);

  const { w, h, pad, xs, rolling, hasData } = useMemo(() => {
    const w = 320;
    const h = 150;
    const pad = { l: 22, r: 10, t: 10, b: 20 };
    const n = Math.max(points.length, 2);
    const xs = points.map((_, i) => pad.l + (i * (w - pad.l - pad.r)) / (n - 1));
    // A pain score is noisy day to day; the seven-day mean is what you read.
    const rolling = points.map((_, i) => {
      const window = points.slice(Math.max(0, i - 6), i + 1)
        .map((p) => p.value)
        .filter((v): v is number => v !== null);
      return window.length ? window.reduce((a, b) => a + b, 0) / window.length : null;
    });
    return { w, h, pad, xs, rolling, hasData: points.some((p) => p.value !== null) };
  }, [points]);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-ink-400">
        Aún no hay chequeos. Puntúa el Aquiles cada mañana y en dos semanas esta
        gráfica te dirá si vas bien.
      </p>
    );
  }

  const y = (v: number) => pad.t + ((10 - v) * (h - pad.t - pad.b)) / 10;

  const path = rolling.reduce((d, v, i) => {
    if (v === null) return d;
    return d + (d ? ' L ' : 'M ') + `${xs[i].toFixed(1)} ${y(v).toFixed(1)}`;
  }, '');

  const lastIdx = rolling.reduce<number>((best, v, i) => (v !== null ? i : best), -1);
  const shown = sel ?? lastIdx;
  const shownPoint = shown >= 0 ? points[shown] : null;

  return (
    <div>
      <p className="mb-2 text-xs text-ink-400">
        {shownPoint && shownPoint.value !== null ? (
          <>
            <span className="font-bold text-ink-100">{shortDate(shownPoint.day)}</span>
            {' · día '}
            <span className="font-bold text-ink-300">{shownPoint.value}/10</span>
            {sessionPoints[shown] !== null && sessionPoints[shown] !== undefined ? (
              <>
                {' · al entrenar '}
                <span className="font-bold" style={{ color: SESSION }}>
                  {sessionPoints[shown]}/10
                </span>
              </>
            ) : null}
            {rolling[shown] !== null ? (
              <>
                {' · media 7 d '}
                <span className="font-bold" style={{ color: LINE }}>
                  {rolling[shown]!.toFixed(1)}
                </span>
              </>
            ) : null}
          </>
        ) : (
          'Toca un punto para ver el día'
        )}
      </p>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="Rigidez del Aquiles por la mañana, últimos días">
        {/* The band you are trying to live in. */}
        <rect
          x={pad.l} y={y(2)} width={w - pad.l - pad.r} height={y(0) - y(2)}
          fill={GOOD} opacity="0.1"
        />
        <text x={pad.l + 3} y={y(0) - 3} fontSize="7" fill={GOOD} opacity="0.75">
          zona buena
        </text>

        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={pad.l} y1={y(v)} x2={w - pad.r} y2={y(v)} stroke="#222e3c" strokeWidth="0.8" />
            <text x="2" y={y(v) + 3} fontSize="8" fill="#7488a0">{v}</text>
          </g>
        ))}

        <path d={path} fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) =>
          p.value === null ? null : (
            <circle key={p.day} cx={xs[i]} cy={y(p.value)} r={i === shown ? 3.4 : 2}
              fill={i === shown ? '#e6edf5' : RAW} />
          ),
        )}

        {/* Rombos, no círculos: se distinguen de la mañana incluso si caen
            encima, y dicen otra cosa — cómo respondió el tendón a la carga. */}
        {sessionPoints.map((v, i) =>
          v === null || v === undefined ? null : (
            <path
              key={`s-${i}`}
              d={`M ${xs[i]} ${y(v) - 3} L ${xs[i] + 3} ${y(v)} L ${xs[i]} ${y(v) + 3} L ${xs[i] - 3} ${y(v)} Z`}
              fill={SESSION}
            />
          ),
        )}

        {/* Touch targets far bigger than the marks, as the interaction rules ask. */}
        {points.map((p, i) => (
          <rect
            key={`hit-${p.day}`}
            x={xs[i] - 6} y={pad.t} width="12" height={h - pad.t - pad.b}
            fill="transparent"
            onClick={() => setSel(i)}
          />
        ))}

        {points.length > 1 ? (
          <>
            <text x={pad.l} y={h - 6} fontSize="8" fill="#7488a0">{shortDate(points[0].day)}</text>
            <text x={w - pad.r} y={h - 6} fontSize="8" fill="#7488a0" textAnchor="end">
              {shortDate(points[points.length - 1].day)}
            </text>
          </>
        ) : null}
      </svg>

      <div className="mt-1 flex items-center gap-4 text-[0.68rem] text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: LINE }} />
          media de 7 días
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: RAW }} />
          cada mañana
        </span>
        {sessionPoints.some((v) => v !== null && v !== undefined) ? (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2"
              style={{ background: SESSION, transform: 'rotate(45deg)' }}
            />
            al entrenar
          </span>
        ) : null}
      </div>
    </div>
  );
}
