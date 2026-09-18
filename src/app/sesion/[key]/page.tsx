import { notFound } from 'next/navigation';
import { SessionPlayer } from '@/components/SessionPlayer';
import { getToday } from '@/lib/data';
import { SESSIONS } from '@/lib/program/sessions';

export const dynamic = 'force-dynamic';

export default async function SessionPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const session = SESSIONS[key];
  if (!session) notFound();

  const { day, plan, progress } = await getToday();
  // Today's session carries the adaptations; anything else runs as designed.
  const isPlanned = key === plan.sessionKey;
  const items = isPlanned ? plan.items : session.items[plan.phase];

  const savedLoads = Object.fromEntries(
    Object.entries(progress).map(([k, v]) => [k, v.loadKg]),
  );
  const levelOffsets = Object.fromEntries(
    Object.entries(progress).map(([k, v]) => [k, v.levelOffset]),
  );

  return (
    <SessionPlayer
      session={session}
      items={items}
      phase={plan.phase}
      week={plan.week}
      mode={isPlanned ? plan.mode : 'normal'}
      day={day}
      savedLoads={savedLoads}
      levelOffsets={levelOffsets}
    />
  );
}
