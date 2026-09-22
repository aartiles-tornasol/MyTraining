'use client';

/* Same palette as StiffnessChart: the 7-day mean is the series you read, the
   raw days sit behind it, and the 0-2 band is where you want to live. */
const LINE = '#b9dd1f';
const GOOD = '#3ddc97';
const WARN = '#ffc043';
const ALERT = '#ff6b6b';
const SESSION = '#a78bfa';   // el dolor sentido al entrenar, no al levantarse

export interface ZoneSeries {
  label: string;
  short: string;
  /** One entry per day, oldest first; null where nothing was logged. */
  values: (number | null)[];
  /** Dolor al entrenar ese día, alineado con `values`. */
  session?: (number | null)[];
}

const toneFor = (v: number | null) =>
  v === null ? '#7488a0' : v <= 2 ? GOOD : v <= 4 ? WARN : ALERT;

/** Compact 42-day read for the zones that are not the Achilles. */
export function ZoneSparklines({ series }: { series: ZoneSeries[] }) {
  /* La leyenda del dolor al entrenar solo cuando hay alguno: anunciar un
     símbolo que no aparece en ninguna gráfica es ruido. */
  const anySession = series.some((s) => (s.session ?? []).some((v) => v !== null && v !== undefined));
  return (
    <>
      <ul className="space-y-3.5">
        {series.map((s) => (
          <ZoneRow key={s.short} series={s} />
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-4 text-[0.68rem] text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: LINE }} />
          media de 7 días por la mañana
        </span>
        {anySession ? (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2"
              style={{ background: SESSION, transform: 'rotate(45deg)' }}
            />
            al entrenar
          </span>
        ) : null}
      </div>
    </>
  );
}

function ZoneRow({ series }: { series: ZoneSeries }) {
  const w = 300;
  const h = 34;
  const n = Math.max(series.values.length, 2);

  const rolling = series.values.map((_, i) => {
    const window = series.values
      .slice(Math.max(0, i - 6), i + 1)
      .filter((v): v is number => v !== null);
    return window.length ? window.reduce((a, b) => a + b, 0) / window.length : null;
  });

  const logged = series.values.filter((v): v is number => v !== null);
  const last7 = rolling.reduce<number | null>((best, v) => (v !== null ? v : best), null);

  const x = (i: number) => (i * w) / (n - 1);
  const y = (v: number) => h - 2 - (v * (h - 4)) / 10;

  const path = rolling.reduce(
    (d, v, i) => (v === null ? d : d + (d ? ' L ' : 'M ') + `${x(i).toFixed(1)} ${y(v).toFixed(1)}`),
    '',
  );

  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[0.92rem] font-semibold">{series.label}</span>
        <span className="text-[0.85rem] font-bold tabular-nums" style={{ color: toneFor(last7) }}>
          {last7 === null ? 'sin datos' : `${last7.toFixed(1)}/10 · media 7 d`}
        </span>
      </div>
      {logged.length === 0 ? (
        <div className="h-[34px] rounded-md bg-ink-800/60" />
      ) : (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
          aria-label={`${series.label}, últimas seis semanas`}>
          <rect x="0" y={y(2)} width={w} height={y(0) - y(2)} fill={GOOD} opacity="0.1" />
          <line x1="0" y1={y(0)} x2={w} y2={y(0)} stroke="#222e3c" strokeWidth="0.8" />
          <path d={path} fill="none" stroke={LINE} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
          {series.values.map((v, i) =>
            v === null ? null : (
              <circle key={i} cx={x(i)} cy={y(v)} r="1.4" fill="#4c5f72" />
            ),
          )}
          {/* Rombo para el dolor al entrenar, igual que en el gráfico grande. */}
          {(series.session ?? []).map((v, i) =>
            v === null || v === undefined ? null : (
              <path
                key={`s-${i}`}
                d={`M ${x(i)} ${y(v) - 2.2} L ${x(i) + 2.2} ${y(v)} L ${x(i)} ${y(v) + 2.2} L ${x(i) - 2.2} ${y(v)} Z`}
                fill={SESSION}
              />
            ),
          )}
        </svg>
      )}
    </li>
  );
}
