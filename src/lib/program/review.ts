import { EXERCISES } from './exercises';
import { SESSIONS } from './sessions';
import { levelFor } from './plan';
import type { Phase, SessionItem } from './types';

/**
 * One working screen exactly as a session shows it. The unit of review is the
 * session item, not the exercise: the same exercise carries different sets,
 * reps and cue depending on which session and phase it turns up in.
 */
export interface ReviewScreen {
  id: string;
  exercise: string;
  exerciseName: string;
  /** The line under the title in the player. */
  subtitle: string;
  phase: Phase;
  item: SessionItem;
  /** Timed hold in seconds, or 0 for a rep-counted set. */
  seconds: number;
  /** Every session and phase this identical screen appears in. */
  origins: string[];
}

const PHASES: Phase[] = [1, 2, 3];

function subtitleFor(item: SessionItem, phase: Phase): string {
  const level = levelFor(item.exercise, phase, 0);
  const side = item.work.perSide ? ' · pierna izquierda' : '';
  return `Serie 1 de ${item.sets}${side}${level ? ` · ${level.name}` : ''}`;
}

/**
 * Every distinct working screen in the programme. Screens that are identical
 * in every respect are folded together and list where they all come from, so
 * the warm-up isometric is reviewed once rather than three times.
 */
export function reviewScreens(): ReviewScreen[] {
  const byShape = new Map<string, ReviewScreen>();

  for (const session of Object.values(SESSIONS)) {
    for (const phase of PHASES) {
      for (const item of session.items[phase] ?? []) {
        const exercise = EXERCISES[item.exercise];
        if (!exercise) continue;

        // Fold screens that render identically. The subtitle carries the
        // level, which is what the phase actually changes on screen, so two
        // phases showing the same level are one screen to review, not two.
        const subtitle = subtitleFor(item, phase);
        const shape = JSON.stringify([
          item.exercise, item.sets, item.work, item.cue ?? '', item.load ?? '', subtitle,
        ]);
        const origin = `${session.name} · fase ${phase}`;
        const seen = byShape.get(shape);
        if (seen) {
          seen.origins.push(origin);
          continue;
        }

        byShape.set(shape, {
          id: `${session.key}-${phase}-${item.exercise}`,
          exercise: item.exercise,
          exerciseName: exercise.name,
          subtitle,
          phase,
          item,
          seconds: item.work.holdSec ?? item.work.timeSec ?? 0,
          origins: [origin],
        });
      }
    }
  }

  return [...byShape.values()];
}
