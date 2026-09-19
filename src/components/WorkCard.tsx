'use client';

import { ExerciseAnimation } from './figure/ExerciseAnimation';
import { Figure3D, has3D } from './figure/Figure3D';
import { TimerRing } from './ui/TimerRing';
import type { ExerciseAnim } from './figure/anim';

/**
 * The working screen of a session: what you actually look at between the title
 * and the buttons. Shared by the player and the review mode so that what gets
 * judged in review is the same markup that runs during a session.
 */
export function WorkCard({
  name,
  subtitle,
  anim,
  exercise,
  cue,
  timer,
  reps,
  loadLabel,
  loadSlot,
  onInfo,
}: {
  name: string;
  subtitle: string;
  anim: string | ExerciseAnim;
  /** Exercise key, for the pre-rendered 3D figure. */
  exercise?: string;
  cue?: string;
  /** A timed hold; omit for a rep-counted set. */
  timer?: { remaining: number; total: number; label: string };
  reps?: { reps?: number; perSide?: boolean; tempo?: string };
  loadLabel?: string;
  loadSlot?: React.ReactNode;
  onInfo?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[1.35rem] font-bold leading-tight">{name}</p>
          <p className="text-[0.8rem] text-ink-300">{subtitle}</p>
        </div>
        {onInfo ? (
          <button
            type="button"
            onClick={onInfo}
            aria-label="Cómo se hace"
            title="Cómo se hace"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-600 text-base font-bold text-ink-300"
          >
            ?
          </button>
        ) : null}
      </div>

      {/* The figure no longer stretches, so centre what is left between the
          title and the buttons instead of letting it pool at the bottom. */}
      <div className="flex flex-1 flex-col justify-center">
        {/* Same square box as the exercise pages. Left to grow into the spare
            height the figure filled the whole screen and ran off the bottom. */}
        <div className="relative mx-auto my-2 aspect-square w-full max-w-[17rem] shrink-0">
          {exercise && has3D(exercise) ? (
            <Figure3D exercise={exercise} className="h-full w-full" />
          ) : (
            <ExerciseAnimation anim={anim} className="h-full w-full" />
          )}
        </div>

        {cue ? (
          <p className="mb-3 rounded-lg bg-ink-800/80 px-3 py-2 text-center text-[0.8rem] leading-snug text-ink-100">
            {cue}
          </p>
        ) : null}

        <div className="flex items-center justify-center">
          {timer ? (
            <TimerRing
              remaining={timer.remaining}
              total={timer.total}
              label={timer.label}
              size={168}
            />
          ) : (
            <div className="text-center">
              <p className="text-[3.4rem] font-bold leading-none text-lime-glow tabular-nums">
                {reps?.reps}
              </p>
              <p className="text-sm font-semibold text-ink-300">
                repeticiones{reps?.perSide ? ' por lado' : ''}
                {reps?.tempo ? ` · tempo ${reps.tempo}` : ''}
              </p>
            </div>
          )}
        </div>

        {loadLabel ? (
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <p className="text-xs text-ink-300">
              Recomendado: <span className="font-semibold text-ink-100">{loadLabel}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-300">Hoy he usado</span>
              {loadSlot}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
