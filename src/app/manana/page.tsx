import { Shell, Card, Chip } from '@/components/ui/Shell';
import { SessionCard } from '@/components/SessionCard';
import { TomorrowDetail } from '@/components/TomorrowCard';
import { PlayTomorrow } from '@/components/PlayTomorrow';
import { getToday } from '@/lib/data';
import { longDate } from '@/lib/dates';
import { PHASES, sessionMinutes } from '@/lib/program/plan';
import { SESSIONS } from '@/lib/program/sessions';

export const dynamic = 'force-dynamic';

/**
 * Mañana, para dejarlo preparado la noche antes: la misma tarjeta de sesión que
 * en Hoy, con sus figuras, y debajo las series y el material. Entrenar a primera
 * hora significa decidir lo de hoy por la noche, y la app ya sabía la respuesta
 * sin llegar a decirla nunca.
 */
export default async function Manana() {
  const { tomorrow, checks } = await getToday();
  const { day, plan } = tomorrow;
  const check = checks.find((c) => c.day === day) ?? null;
  const phase = PHASES[plan.phase];

  return (
    <Shell title="Mañana" subtitle={longDate(day)}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip tone="lime">Semana {plan.week}</Chip>
        <Chip tone="info">Fase {plan.phase} · {phase.name}</Chip>
      </div>

      <PlayTomorrow day={day} playing={check?.playing_today ?? false} />

      <SessionCard
        session={plan.session}
        items={plan.items}
        phase={plan.phase}
        mode={plan.mode}
        href={`/sesion/${plan.sessionKey}`}
        cta={null}
      />

      {plan.warnings.length > 0 ? (
        <Card tone="warn" className="mb-4">
          <ul className="space-y-1.5">
            {plan.warnings.map((w) => (
              <li key={w} className="text-[1.0rem] leading-relaxed text-ink-100">{w}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {plan.suggestExtras.length > 0 ? (
        <Card className="mb-4">
          <p className="mb-1.5 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
            Además, porque juegas
          </p>
          <ul className="space-y-1.5">
            {plan.suggestExtras.map((key) => {
              const s = SESSIONS[key];
              if (!s) return null;
              return (
                <li key={key} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-[1.0rem] font-semibold">{s.name}</span>
                    <span className="block text-[0.85rem] leading-snug text-ink-300">{s.tagline}</span>
                  </span>
                  <span className="shrink-0 text-[0.9rem] font-semibold text-lime-glow tabular-nums">
                    {sessionMinutes(s.items[plan.phase])} min
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <TomorrowDetail plan={plan} />
    </Shell>
  );
}
