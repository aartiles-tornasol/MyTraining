import { Shell, Card, Chip } from '@/components/ui/Shell';
import { StiffnessChart } from '@/components/charts/StiffnessChart';
import { AdherenceStrip } from '@/components/charts/AdherenceStrip';
import { LoadChart } from '@/components/charts/LoadChart';
import { getToday, getLoadByWeek, streakFrom } from '@/lib/data';
import { addDays } from '@/lib/dates';
import { readTrend, PHASES } from '@/lib/program/plan';
import { SESSIONS } from '@/lib/program/sessions';

export const dynamic = 'force-dynamic';

function avg(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export default async function Progreso() {
  const { day, checks, history, plan } = await getToday();
  const loads = await getLoadByWeek('calf-raise-single');

  const byDay: Record<string, { sessionKey: string | null; played: boolean }> = {};
  for (const c of checks) byDay[c.day] = { sessionKey: null, played: c.played || c.playing_today };
  for (const h of history) {
    byDay[h.day] = { sessionKey: h.session_key, played: byDay[h.day]?.played ?? false };
  }

  // 42 days of points, gaps included, so a missed week shows up as a gap.
  const checkByDay = new Map(checks.map((c) => [c.day, c.achilles_am]));
  const points = Array.from({ length: 42 }, (_, i) => {
    const d = addDays(day, -(41 - i));
    return { day: d, value: checkByDay.get(d) ?? null };
  });

  const last7 = checks.filter((c) => c.day > addDays(day, -7) && c.achilles_am !== null)
    .map((c) => c.achilles_am as number);
  const prev7 = checks.filter((c) => c.day <= addDays(day, -7) && c.day > addDays(day, -14) && c.achilles_am !== null)
    .map((c) => c.achilles_am as number);
  const a7 = avg(last7);
  const p7 = avg(prev7);
  const delta = a7 !== null && p7 !== null ? a7 - p7 : null;

  const sessions30 = history.filter((h) => h.day > addDays(day, -30)).length;
  const streak = streakFrom(history, day);
  const trend = readTrend(checks.map((c) => ({ date: c.day, achillesAM: c.achilles_am })));

  const counts = history.reduce<Record<string, number>>((acc, h) => {
    acc[h.session_key] = (acc[h.session_key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Shell title="Progreso" subtitle={`Semana ${plan.week} · fase ${plan.phase}`}>
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <Stat
          value={streak}
          unit={streak === 1 ? 'día' : 'días'}
          label="Racha"
          tone={streak > 0 ? 'lime' : 'muted'}
        />
        <Stat value={sessions30} unit="ses." label="30 días" />
        <Stat
          value={a7 === null ? '—' : a7.toFixed(1)}
          unit="/10"
          label="Aquiles 7 d"
          tone={a7 === null ? 'muted' : a7 <= 2 ? 'ok' : a7 <= 4 ? 'warn' : 'alert'}
          foot={
            delta === null
              ? undefined
              : delta < -0.2 ? `▼ ${Math.abs(delta).toFixed(1)} vs 7 d antes`
              : delta > 0.2 ? `▲ ${delta.toFixed(1)} vs 7 d antes`
              : '= que la semana previa'
          }
        />
      </div>

      {trend ? (
        <Card
          tone={trend.tone === 'back-off' ? 'alert' : trend.tone === 'watch' ? 'warn' : 'accent'}
          className="mb-4"
        >
          <p className="text-sm font-bold">{trend.title}</p>
          <p className="mt-1 text-[0.82rem] leading-snug text-ink-300">{trend.body}</p>
        </Card>
      ) : null}

      <Card className="mb-4">
        <p className="text-base font-bold">Rigidez del Aquiles al levantarte</p>
        <p className="mb-3 mt-0.5 text-xs leading-snug text-ink-400">
          Es la señal que mejor dice si el tendón va mejorando. Lo que buscas es que la
          línea baje hacia la zona verde y se quede ahí.
        </p>
        <StiffnessChart points={points} />
      </Card>

      <Card className="mb-4">
        <p className="text-base font-bold">Constancia</p>
        <p className="mb-3 mt-0.5 text-xs leading-snug text-ink-400">
          Cuatro semanas. Con los tendones importa más la regularidad que la intensidad.
        </p>
        <AdherenceStrip today={day} byDay={byDay} />
      </Card>

      <Card className="mb-4">
        <p className="text-base font-bold">Carga en el ejercicio principal</p>
        <p className="mb-3 mt-0.5 text-xs leading-snug text-ink-400">
          Peso máximo por semana en la elevación de talón a una pierna.
        </p>
        <LoadChart points={loads} />
      </Card>

      <Card>
        <p className="mb-3 text-base font-bold">Sesiones por tipo</p>
        {Object.keys(counts).length === 0 ? (
          <p className="text-sm text-ink-400">Todavía no has completado ninguna sesión.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, n]) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm">
                    {SESSIONS[key]?.name ?? key}
                    <span className="ml-1.5 text-xs text-ink-400">{SESSIONS[key]?.tagline}</span>
                  </span>
                  <Chip tone="lime">{n}</Chip>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <p className="mt-4 px-1 text-[0.7rem] leading-snug text-ink-500">
        Fase {plan.phase}: {PHASES[plan.phase].goal.toLowerCase()}.
      </p>
    </Shell>
  );
}

function Stat({
  value,
  unit,
  label,
  tone = 'muted',
  foot,
}: {
  value: number | string;
  unit?: string;
  label: string;
  tone?: 'muted' | 'lime' | 'ok' | 'warn' | 'alert';
  foot?: string;
}) {
  const colors = {
    muted: '#e6edf5',
    lime: '#d6f645',
    ok: '#3ddc97',
    warn: '#ffc043',
    alert: '#ff6b6b',
  } as const;
  return (
    <div className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-3">
      <p
        className="flex items-baseline gap-0.5 text-2xl font-bold leading-none tabular-nums"
        style={{ color: colors[tone] }}
      >
        {value}
        {unit ? <span className="text-[0.7rem] font-semibold text-ink-400">{unit}</span> : null}
      </p>
      <p className="mt-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      {foot ? <p className="mt-0.5 text-[0.62rem] leading-tight text-ink-500">{foot}</p> : null}
    </div>
  );
}
