import { Shell, Card, Chip } from '@/components/ui/Shell';
import { SessionCard } from '@/components/SessionCard';
import { TomorrowDetail } from '@/components/TomorrowCard';
import type { ExtraSession } from '@/components/TomorrowCard';
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

  /* Calentamiento y vuelta a la calma, cuando hay partido: se preparan igual
     que la sesión, así que se listan enteros y su material cuenta. */
  const extras: ExtraSession[] = plan.suggestExtras
    .filter((k) => SESSIONS[k])
    .map((k) => ({
      key: k,
      session: SESSIONS[k],
      items: SESSIONS[k].items[plan.phase],
      minutes: sessionMinutes(SESSIONS[k].items[plan.phase]),
    }));

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


      <TomorrowDetail plan={plan} extras={extras} />
    </Shell>
  );
}
