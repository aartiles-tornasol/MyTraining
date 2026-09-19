'use client';

export const PAIN_WORDS = [
  'Nada', 'Casi nada', 'Casi nada', 'Molestia leve', 'Molestia leve',
  'Molesta', 'Molesta', 'Duele bastante', 'Duele bastante', 'Mucho dolor', 'Mucho dolor',
];

/** Green through amber to red, so the scale reads before you read the number. */
function colorFor(n: number) {
  if (n <= 2) return '#3ddc97';
  if (n <= 4) return '#b9dd1f';
  if (n <= 6) return '#ffc043';
  if (n <= 8) return '#ff8a4c';
  return '#ff6b6b';
}

export function PainScale({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[0.95rem] font-semibold">{label}</p>
          {hint ? <p className="text-xs text-ink-400">{hint}</p> : null}
        </div>
        <p
          className="text-sm font-bold tabular-nums"
          style={{ color: value === null ? '#7488a0' : colorFor(value) }}
        >
          {value === null ? '—' : `${value}/10 · ${PAIN_WORDS[value]}`}
        </p>
      </div>
      <div className="flex items-end gap-[3px]" role="group" aria-label={label}>
        {Array.from({ length: 11 }, (_, n) => {
          const on = value !== null && n <= value;
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} de 10`}
              aria-pressed={selected}
              onClick={() => onChange(n)}
              className="relative flex-1 rounded-md transition-all active:scale-95"
              style={{
                height: `${26 + n * 2.6}px`,
                background: on ? colorFor(value ?? 0) : '#222e3c',
                opacity: on ? (selected ? 1 : 0.55) : 1,
                outline: selected ? '2px solid #e6edf5' : 'none',
                outlineOffset: '1px',
              }}
            >
              <span className="sr-only">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[0.65rem] text-ink-400">
        <span>0 · nada</span>
        <span>10 · mucho</span>
      </div>
    </div>
  );
}
