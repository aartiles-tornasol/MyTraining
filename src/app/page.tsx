import Link from 'next/link';
import { Shell, Card, Chip } from '@/components/ui/Shell';
import { DailyCheckCard } from '@/components/DailyCheckCard';
import { SessionCard } from '@/components/SessionCard';
import { TomorrowCard } from '@/components/TomorrowCard';
import { getToday, streakFrom } from '@/lib/data';
import { longDate } from '@/lib/dates';
import { PHASES, readTrend, readZoneAlerts, sessionMinutes } from '@/lib/program/plan';
import { ZONES } from '@/lib/program/zones';
import { SESSIONS } from '@/lib/program/sessions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { day, plan, tomorrow, check, history, checks, dbConfigured } = await getToday();
  const streak = streakFrom(history, day);
  const trend = readTrend(checks.map((c) => ({ date: c.day, achillesAM: c.achilles_am })));
  const zoneAlerts = readZoneAlerts(
    checks.map((c) => ({ day: c.day, scores: Object.fromEntries(ZONES.map((z) => [z.column, c[z.column]])) })),
  );
  const phase = PHASES[plan.phase];
  const doneToday = history.some((h) => h.day === day);
  const needsCheck = check?.achilles_am == null;

  return (
    <Shell
      title="Hoy"
      subtitle={longDate(day)}
      action={
        streak > 0 ? (
          <div className="shrink-0 rounded-xl border border-lime-core/35 bg-lime-core/10 px-3 py-1.5 text-center">
            <p className="text-lg font-bold leading-none text-lime-glow tabular-nums">{streak}</p>
            <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-lime-glow/80">
              {streak === 1 ? 'día' : 'días'}
            </p>
          </div>
        ) : null
      }
    >
      {!dbConfigured ? (
        <Card tone="warn" className="mb-4">
          <p className="text-base font-semibold">Sin base de datos</p>
          <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-300">
            No hay <code className="text-signal-warn">DATABASE_URL</code> configurada, así que la app
            funciona pero no guarda nada. Los entrenamientos se ven igual.
          </p>
        </Card>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip tone="lime">Semana {plan.week}</Chip>
        <Chip tone="info">Fase {plan.phase} · {phase.name}</Chip>
        {doneToday ? <Chip tone="lime">Entrenado hoy ✓</Chip> : null}
      </div>

      <DailyCheckCard check={check} day={day} />

      {needsCheck ? (
        <Card className="mb-4">
          <p className="text-[1.0rem] leading-relaxed text-ink-200">
            Puntúa el chequeo de arriba y la sesión de hoy se ajusta sola a cómo has amanecido.
          </p>
        </Card>
      ) : (
        <SessionCard
          session={plan.session}
          items={plan.items}
          phase={plan.phase}
          mode={plan.mode}
          reason={plan.reason}
          href={`/sesion/${plan.sessionKey}`}
          cta={doneToday ? 'Repetir sesión' : 'Empezar sesión'}
        />
      )}

      {plan.warnings.length > 0 ? (
        <Card tone="warn" className="mb-4">
          <ul className="space-y-1.5">
            {plan.warnings.map((w) => (
              <li key={w} className="text-[1.0rem] leading-relaxed text-ink-100">
                {w}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {plan.suggestExtras.length > 0 ? (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {plan.suggestExtras.map((key) => {
            const s = SESSIONS[key];
            return (
              <Link
                key={key}
                href={`/sesion/${key}`}
                className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-3.5 transition active:scale-[0.98]"
              >
                <p className="text-[0.95rem] font-bold leading-tight">{s.name}</p>
                <p className="mt-0.5 text-[0.82rem] leading-snug text-ink-300">{s.tagline}</p>
                <p className="mt-2 text-[0.88rem] font-semibold text-lime-glow">
                  {sessionMinutes(s.items[1])} min →
                </p>
              </Link>
            );
          })}
        </div>
      ) : null}

      {trend ? (
        <Card
          tone={trend.tone === 'back-off' ? 'alert' : trend.tone === 'watch' ? 'warn' : 'default'}
          className="mb-4"
        >
          <p className="text-base font-bold">{trend.title}</p>
          <p className="mt-1 text-[1.0rem] leading-relaxed text-ink-200">{trend.body}</p>
        </Card>
      ) : null}

      {zoneAlerts.length > 0 ? (
        <Card
          tone={zoneAlerts.some((a) => a.tone === 'back-off') ? 'alert' : 'warn'}
          className="mb-4"
        >
          <ul className="space-y-1.5">
            {zoneAlerts.map((a) => (
              <li key={a.zone} className="text-[1.0rem] leading-relaxed text-ink-100">{a.text}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <p className="text-base font-bold">Fase {plan.phase} · {phase.name}</p>
        <p className="mt-0.5 text-[0.88rem] font-semibold text-ink-300">{phase.weeks} · {phase.goal}</p>
        <p className="mt-2 text-[1.0rem] leading-relaxed text-ink-200">{phase.detail}</p>
      </Card>

      <TomorrowCard day={tomorrow.day} plan={tomorrow.plan} />
    </Shell>
  );
}
