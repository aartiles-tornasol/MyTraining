import Link from 'next/link';
import { Shell, Card } from '@/components/ui/Shell';
import { ProfileForm } from '@/components/ProfileForm';
import { getToday } from '@/lib/data';
import { PHASES } from '@/lib/program/plan';
import { SESSION_LIST } from '@/lib/program/sessions';
import { sessionMinutes } from '@/lib/program/plan';

export const dynamic = 'force-dynamic';

export default async function Ajustes() {
  const { profile, plan, dbConfigured } = await getToday();

  return (
    <Shell title="Ajustes" subtitle="El programa y tus datos">
      <Card className="mb-4">
        <p className="mb-3 text-base font-bold">Tus datos</p>
        <ProfileForm
          startDate={profile.start_date}
          heightCm={profile.height_cm}
          weightKg={profile.weight_kg === null ? null : Number(profile.weight_kg)}
          disabled={!dbConfigured}
        />
        <p className="mt-3 text-[0.7rem] leading-snug text-ink-400">
          La fecha de inicio decide en qué semana y fase estás. Ahora mismo: semana{' '}
          {plan.week}, fase {plan.phase}.
        </p>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-base font-bold">Las tres fases</p>
        <ol className="space-y-3">
          {[1, 2, 3].map((n) => {
            const p = PHASES[n as 1 | 2 | 3];
            const active = plan.phase === n;
            return (
              <li
                key={n}
                className={`rounded-lg border px-3 py-2.5 ${
                  active ? 'border-lime-core/50 bg-lime-core/10' : 'border-ink-700 bg-ink-800/50'
                }`}
              >
                <p className="text-[0.85rem] font-bold">
                  Fase {n} · {p.name}
                </p>
                <p className="text-[0.7rem] font-semibold text-ink-400">{p.weeks}</p>
                <p className="mt-1 text-[0.78rem] leading-snug text-ink-300">{p.detail}</p>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="mb-4">
        <p className="mb-1 text-base font-bold">La semana</p>
        <p className="mb-3 text-xs leading-snug text-ink-400">
          Cinco sesiones que rotan. La app elige cada día mirando cómo has amanecido y si
          juegas, y nunca pone dos sesiones pesadas seguidas.
        </p>
        <ul className="space-y-2">
          {SESSION_LIST.map((s) => (
            <li key={s.key} className="flex items-baseline justify-between gap-3">
              <span className="text-[0.85rem]">
                <span className="font-semibold">{s.name}</span>
                <span className="ml-1.5 text-xs text-ink-400">{s.tagline}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-lime-glow">
                {sessionMinutes(s.items[plan.phase])}′
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <p className="mb-1 text-base font-bold">Repasar las pantallas de sesión</p>
        <p className="mb-3 text-xs leading-snug text-ink-400">
          Recorre una a una todas las pantallas que verás mientras entrenas, tal cual
          salen, sin cronómetro y sin guardar nada. Para revisar los dibujos y los textos.
        </p>
        <Link
          href="/revision"
          className="block rounded-xl border border-signal-violet/40 bg-signal-violet/10 py-3 text-center text-sm font-bold text-signal-violet"
        >
          Abrir modo revisión
        </Link>
        <Link
          href="/revision/figuras"
          className="mt-2 block rounded-xl border border-lime-core/50 bg-lime-core/15 py-3 text-center text-sm font-bold text-lime-glow"
        >
          Ver las 46 figuras en 3D
        </Link>
      </Card>

      <Card tone="warn">
        <p className="text-sm font-bold">Esto no sustituye a un fisio</p>
        <p className="mt-1 text-[0.8rem] leading-snug text-ink-200">
          El programa está construido sobre lo que mejor funciona en tendinopatía de
          Aquiles y prevención de lesiones de ingle, pero nadie te ha explorado. Si el
          dolor sube por encima de 6/10 varios días seguidos, si notas un bulto en el
          tendón o si aparece dolor que baja por la pierna, que lo vea un profesional.
        </p>
      </Card>
    </Shell>
  );
}
