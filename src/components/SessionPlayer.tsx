'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TimerRing } from './ui/TimerRing';
import { WorkCard } from './WorkCard';
import { PainScale } from './ui/PainScale';
import { ExerciseVideo } from './ExerciseVideo';
import { ExerciseAnimation } from './figure/ExerciseAnimation';
import { Figure3D, has3D } from './figure/Figure3D';
import { EXERCISES } from '@/lib/program/exercises';
import { videoFor } from '@/lib/program/videos';
import { animFor, levelFor } from '@/lib/program/plan';
import { saveSession } from '@/lib/actions';
import { beep, buzz, countdownTick, goBeep, unlockAudio } from '@/lib/feedback';
import { mmss } from '@/lib/dates';
import { useWakeLock } from '@/lib/useWakeLock';
import type { Phase, SessionDef, SessionItem } from '@/lib/program/types';
import type { SetInput } from '@/lib/actions';

type Step =
  | { kind: 'work'; item: number; set: number; side: 'both' | 'izquierda' | 'derecha'; seconds: number }
  | { kind: 'rest'; item: number; seconds: number }
  | { kind: 'summary' };

function buildSteps(items: SessionItem[]): Step[] {
  const steps: Step[] = [];
  items.forEach((item, i) => {
    for (let s = 0; s < item.sets; s++) {
      const timed = Boolean(item.work.holdSec || item.work.timeSec);
      if (item.work.perSide && timed) {
        const sec = item.work.holdSec ?? item.work.timeSec ?? 30;
        steps.push({ kind: 'work', item: i, set: s, side: 'izquierda', seconds: sec });
        steps.push({ kind: 'work', item: i, set: s, side: 'derecha', seconds: sec });
      } else {
        steps.push({
          kind: 'work',
          item: i,
          set: s,
          side: 'both',
          seconds: timed ? (item.work.holdSec ?? item.work.timeSec ?? 30) : 0,
        });
      }
      const lastSet = s === item.sets - 1;
      const lastItem = i === items.length - 1;
      if (item.restSec > 0 && !(lastSet && lastItem)) {
        steps.push({ kind: 'rest', item: i, seconds: lastSet ? Math.round(item.restSec * 0.8) : item.restSec });
      }
    }
  });
  steps.push({ kind: 'summary' });
  return steps;
}

interface Draft {
  index: number;
  elapsed: number;
  sets: SetInput[];
  loads: Record<string, number>;
}

export function SessionPlayer({
  session,
  items,
  phase,
  week,
  mode,
  day,
  savedLoads,
  levelOffsets,
}: {
  session: SessionDef;
  items: SessionItem[];
  phase: Phase;
  week: number;
  mode: string;
  day: string;
  savedLoads: Record<string, number | null>;
  levelOffsets: Record<string, number>;
}) {
  const router = useRouter();
  const steps = useMemo(() => buildSteps(items), [items]);
  const storageKey = `mytraining:draft:${day}:${session.key}`;

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logged, setLogged] = useState<SetInput[]>([]);
  const [loads, setLoads] = useState<Record<string, number>>({});
  const [showInfo, setShowInfo] = useState(false);
  const [rpe, setRpe] = useState<number | null>(null);
  const [painDuring, setPainDuring] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const restored = useRef(false);

  useWakeLock(true);

  const step = steps[Math.min(index, steps.length - 1)];
  const item = step.kind === 'summary' ? null : items[step.item];
  const exercise = item ? EXERCISES[item.exercise] : null;

  /* ── Draft persistence: a reload on the roof must not lose the session ── */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const d = JSON.parse(raw) as Draft;
      if (d.index > 0 && d.index < steps.length) {
        setIndex(d.index);
        setElapsed(d.elapsed ?? 0);
        setLogged(d.sets ?? []);
        setLoads(d.loads ?? {});
      }
    } catch {
      /* A corrupt draft is not worth blocking the session over. */
    }
  }, [storageKey, steps.length]);

  useEffect(() => {
    if (!restored.current || index === 0) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ index, elapsed, sets: logged, loads } satisfies Draft),
      );
    } catch {
      /* Private mode: carry on without a draft. */
    }
  }, [storageKey, index, elapsed, logged, loads]);

  /* ── Clocks ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          goBeep();
          buzz([60, 50, 60]);
          setRunning(false);
          advance();
          return 0;
        }
        if (r <= 4) {
          countdownTick();
          buzz(25);
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, advance]);

  // Every new step decides whether it counts down and whether it starts itself.
  useEffect(() => {
    if (step.kind === 'summary') {
      setRunning(false);
      return;
    }
    if (step.kind === 'rest') {
      setRemaining(step.seconds);
      setRunning(true);
      return;
    }
    setRemaining(step.seconds);
    setRunning(false);
  }, [index, step]);

  const record = (skipped: boolean) => {
    if (step.kind !== 'work' || !item) return;
    const entry: SetInput = {
      exerciseKey: item.exercise,
      setIndex: step.set,
      reps: item.work.reps ?? null,
      holdS: step.seconds || null,
      loadKg: loads[item.exercise] ?? savedLoads[item.exercise] ?? null,
      skipped,
    };
    setLogged((l) => [...l, entry]);
  };

  const finishWork = (skipped = false) => {
    unlockAudio();
    record(skipped);
    buzz(30);
    advance();
  };

  /**
   * Jump past the whole exercise, not just this set. The sets left behind are
   * logged as skipped so the summary and the history say what actually
   * happened rather than quietly forgetting them.
   */
  const skipExercise = () => {
    if (step.kind !== 'work' || !item) return;
    unlockAudio();
    setRunning(false);
    const here = step.item;
    const ex = items[here];
    const pending = steps
      .slice(index)
      .filter((s) => s.kind === 'work' && s.item === here);
    setLogged((l) => [
      ...l,
      ...pending.map((s) => ({
        exerciseKey: ex.exercise,
        setIndex: s.kind === 'work' ? s.set : 0,
        reps: ex.work.reps ?? null,
        holdS: (s.kind === 'work' ? s.seconds : 0) || null,
        loadKg: loads[ex.exercise] ?? savedLoads[ex.exercise] ?? null,
        skipped: true,
      })),
    ]);
    const next = steps.findIndex(
      (s, n) => n > index && ((s.kind === 'work' && s.item !== here) || s.kind === 'summary'),
    );
    setIndex(next === -1 ? steps.length - 1 : next);
  };

  const startTimer = () => {
    unlockAudio();
    beep(780, 120);
    setRunning(true);
  };

  const submit = async () => {
    setSaving(true);
    setSaveError(false);
    const res = await saveSession({
      day,
      sessionKey: session.key,
      phase,
      week,
      mode,
      durationS: elapsed,
      rpe,
      painDuring,
      sets: logged,
    });
    if (res.ok) {
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      router.push('/');
      router.refresh();
    } else {
      setSaveError(true);
      setSaving(false);
    }
  };

  const totalWork = steps.filter((s) => s.kind === 'work').length;
  const doneWork = steps.slice(0, index).filter((s) => s.kind === 'work').length;
  const progress = totalWork ? doneWork / totalWork : 0;

  /* ── Summary ─────────────────────────────────────────────────────────── */
  if (step.kind === 'summary') {
    return (
      <div
        className="mx-auto w-full max-w-lg px-4"
        style={{ paddingTop: 'calc(var(--safe-t) + 1.5rem)', paddingBottom: 'calc(var(--safe-b) + 2rem)' }}
      >
        <div className="animate-fade-up">
          <p className="text-3xl font-bold">Sesión terminada</p>
          <p className="mt-1 text-sm text-ink-400">
            {session.name} · {mmss(elapsed)} · {logged.filter((s) => !s.skipped).length} series
          </p>

          <div className="mt-7 space-y-6 rounded-xl2 border border-ink-700/70 bg-ink-850 p-4">
            <PainScale
              label="¿Cómo de dura te ha resultado?"
              hint="1 muy suave · 10 al límite"
              value={rpe}
              onChange={setRpe}
            />
            <PainScale
              label="Dolor durante la sesión"
              hint="Hasta 5/10 en el tendón es aceptable. Lo que importa es cómo amanezcas mañana."
              value={painDuring}
              onChange={setPainDuring}
            />
          </div>

          {saveError ? (
            <p className="mt-4 rounded-lg border border-signal-alert/40 bg-signal-alert/10 px-3 py-2.5 text-sm text-signal-alert">
              No se ha podido guardar. La sesión sigue guardada en el móvil: prueba otra vez.
            </p>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="mt-5 w-full rounded-xl bg-lime-core py-4 text-base font-bold text-ink-950 transition active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar sesión'}
          </button>
          <button
            type="button"
            onClick={() => setIndex(steps.length - 2)}
            className="mt-2 w-full py-3 text-sm font-semibold text-ink-400"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  /* ── Rest ────────────────────────────────────────────────────────────── */
  if (step.kind === 'rest') {
    const next = steps.slice(index + 1).find((s) => s.kind === 'work');
    const nextEx = next && next.kind === 'work' ? EXERCISES[items[next.item].exercise] : null;
    return (
      <PlayerFrame progress={progress} elapsed={elapsed} onQuit={() => router.push('/')}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-400">Descanso</p>
          <TimerRing remaining={remaining} total={step.seconds} color="#5eb0ff" label="restante" />
          {nextEx ? (
            <div className="text-center">
              <p className="text-[0.85rem] uppercase tracking-wider text-ink-300">A continuación</p>
              <p className="mt-1 text-lg font-bold">{nextEx.name}</p>
            </div>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRemaining((r) => r + 20)}
            className="flex-1 rounded-xl border border-ink-600 py-4 text-base font-semibold text-ink-200"
          >
            +20 s
          </button>
          <button
            type="button"
            onClick={() => { setRunning(false); advance(); }}
            className="flex-[2] rounded-xl bg-lime-core py-4 text-base font-bold text-ink-950"
          >
            Saltar descanso
          </button>
        </div>
      </PlayerFrame>
    );
  }

  /* ── Work ────────────────────────────────────────────────────────────── */
  if (!item || !exercise) {
    return (
      <PlayerFrame progress={0} elapsed={elapsed} onQuit={() => router.push('/')}>
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm leading-snug text-ink-300">
            Hoy no queda nada por hacer en esta sesión: con cómo has amanecido, lo mejor
            que puedes hacer es descansar.
          </p>
        </div>
      </PlayerFrame>
    );
  }
  const level = levelFor(item.exercise, phase, levelOffsets[item.exercise] ?? 0);
  const timed = step.seconds > 0;
  const load = loads[item.exercise] ?? savedLoads[item.exercise] ?? null;

  return (
    <PlayerFrame progress={progress} elapsed={elapsed} onQuit={() => router.push('/')}>
      <WorkCard
        name={exercise.name}
        subtitle={
          `Serie ${step.set + 1} de ${item.sets}` +
          (step.side !== 'both' ? ` · pierna ${step.side}` : '') +
          (level ? ` · ${level.name}` : '')
        }
        anim={animFor(item.exercise, phase, levelOffsets[item.exercise] ?? 0)}
        exercise={item.exercise}
        cue={item.cue}
        timer={timed ? { remaining, total: step.seconds, label: running ? 'aguanta' : 'listo' } : undefined}
        reps={timed ? undefined : item.work}
        loadLabel={item.load}
        loadSlot={
          <LoadInput
            value={load}
            onChange={(kg) => setLoads((l) => ({ ...l, [item.exercise]: kg }))}
          />
        }
        onInfo={() => setShowInfo(true)}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => finishWork(true)}
          className="rounded-xl border border-ink-600 px-4 py-4 text-[0.92rem] font-semibold text-ink-300"
        >
          Saltar serie
        </button>
        {timed && !running ? (
          <button
            type="button"
            onClick={startTimer}
            className="flex-1 rounded-xl bg-lime-core py-4 text-base font-bold text-ink-950 transition active:scale-[0.98]"
          >
            Empezar {mmss(step.seconds)}
          </button>
        ) : timed && running ? (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="flex-1 rounded-xl border border-lime-core/60 py-4 text-base font-bold text-lime-glow"
          >
            Pausa
          </button>
        ) : (
          <button
            type="button"
            onClick={() => finishWork(false)}
            className="flex-1 rounded-xl bg-lime-core py-4 text-base font-bold text-ink-950 transition active:scale-[0.98]"
          >
            Serie hecha
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={skipExercise}
        className="mt-2 w-full py-2 text-[0.88rem] font-semibold text-ink-400"
      >
        Saltar el ejercicio entero →
      </button>

      {showInfo ? <HowTo exerciseKey={item.exercise} onClose={() => setShowInfo(false)} /> : null}
    </PlayerFrame>
  );
}

function PlayerFrame({
  children,
  progress,
  elapsed,
  onQuit,
}: {
  children: React.ReactNode;
  progress: number;
  elapsed: number;
  onQuit: () => void;
}) {
  return (
    <div
      className="no-select mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4"
      style={{ paddingTop: 'calc(var(--safe-t) + 0.75rem)', paddingBottom: 'calc(var(--safe-b) + 1rem)' }}
    >
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onQuit}
          aria-label="Salir de la sesión"
          className="shrink-0 text-2xl leading-none text-ink-400"
        >
          ×
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-lime-core transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-400">{mmss(elapsed)}</span>
      </div>
      {children}
    </div>
  );
}

function LoadInput({ value, onChange }: { value: number | null; onChange: (kg: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-ink-600 px-1">
      <button type="button" aria-label="Menos peso" onClick={() => onChange(Math.max(0, (value ?? 0) - 1))} className="px-2.5 py-1 text-ink-300">−</button>
      <span className="min-w-[3.2rem] text-center text-sm font-bold tabular-nums">
        {value === null ? '— kg' : `${value} kg`}
      </span>
      <button type="button" aria-label="Más peso" onClick={() => onChange((value ?? 0) + 1)} className="px-2.5 py-1 text-ink-300">+</button>
    </div>
  );
}

export function HowTo({ exerciseKey, onClose }: { exerciseKey: string; onClose: () => void }) {
  const ex = EXERCISES[exerciseKey];
  const video = videoFor(exerciseKey);
  if (!ex) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[82dvh] w-full overflow-y-auto rounded-t-xl3 border-t border-ink-700 bg-ink-900 p-5"
        style={{ paddingBottom: 'calc(var(--safe-b) + 1.5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-600" />
        <p className="text-xl font-bold">{ex.name}</p>
        <p className="mt-0.5 text-[0.95rem] text-ink-300">{ex.tagline}</p>

        {/* La figura, antes que el vídeo. Durante la sesión está detrás de esta
            hoja, pero desde Mañana no hay nada que la enseñe, y es lo primero
            que se reconoce de un ejercicio. */}
        <div className="mx-auto mt-3 aspect-square w-full max-w-[13rem]">
          {has3D(exerciseKey) ? (
            <Figure3D exercise={exerciseKey} showLabel={false} className="h-full w-full" />
          ) : (
            <ExerciseAnimation anim={animFor(exerciseKey, 1)} className="h-full w-full" />
          )}
        </div>

        {video ? (
          <Block title="Cómo se hace">
            <ExerciseVideo video={video} />
          </Block>
        ) : null}

        <Block title="Por qué lo haces">
          <p className="text-[1.05rem] leading-relaxed text-ink-100">{ex.why}</p>
        </Block>
        <Block title="Colocación">
          <Bullets items={ex.setup} />
        </Block>
        <Block title="Ejecución">
          <Bullets items={ex.execution} numbered />
        </Block>
        <Block title="Errores típicos">
          <Bullets items={ex.mistakes} tone="alert" />
        </Block>
        {ex.painRule ? (
          <div className="mt-4 rounded-lg border border-signal-warn/35 bg-signal-warn/10 px-3 py-2.5">
            <p className="text-[1.0rem] leading-relaxed text-signal-warn">{ex.painRule}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-ink-700 py-3.5 text-base font-bold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">{title}</p>
      {children}
    </div>
  );
}

function Bullets({
  items,
  numbered,
  tone,
}: {
  items: string[];
  numbered?: boolean;
  tone?: 'alert';
}) {
  return (
    <ol className="space-y-2.5">
      {items.map((t, i) => (
        <li key={t} className="flex gap-2.5 text-[1.05rem] leading-relaxed text-ink-100">
          <span className={tone === 'alert' ? 'text-signal-alert' : 'text-ink-400'}>
            {tone === 'alert' ? '×' : numbered ? `${i + 1}.` : '·'}
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  );
}
