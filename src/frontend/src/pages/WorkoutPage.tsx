import {
  useDay,
  useIsDayUnlocked,
  useMarkDayComplete,
  useProgress,
  useSubscriptionStatus,
} from "@/hooks/useProgram";
import { DAY_TYPE_LABELS } from "@/lib/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Lock,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Number of days a user can access before subscribing. */
const FREE_PREVIEW_DAYS = 3;

type Phase = "idle" | "work" | "rest" | "done";

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Circular session-progress ring with an amber active stroke. */
function ProgressRing({ value }: { value: number }) {
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="relative size-32">
      <svg
        viewBox="0 0 128 128"
        className="size-32 -rotate-90"
        role="img"
        aria-label={`${value}% session complete`}
      >
        <title>{`${value}% session complete`}</title>
        <circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          className="stroke-accent transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold">{value}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Session
        </span>
      </div>
    </div>
  );
}

export function WorkoutPage() {
  const { dayNumber: dayNumberParam } = useParams({
    from: "/app/workout/$dayNumber",
  });
  const dayNumber = BigInt(dayNumberParam);

  const dayQuery = useDay(dayNumber);
  const unlockedQuery = useIsDayUnlocked(dayNumber);
  const subscriptionQuery = useSubscriptionStatus();
  const progressQuery = useProgress();
  const markComplete = useMarkDayComplete();

  const day = dayQuery.data;
  const exercises = day?.exercises ?? [];
  const isUnlocked = unlockedQuery.data ?? false;
  const isSubscribed = subscriptionQuery.data?.active ?? false;
  const completedDays = progressQuery.data?.completedDays ?? [];

  const isAlreadyComplete = completedDays.some((d) => d === dayNumber);

  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const stateRef = useRef({ currentIndex, phase, secondsLeft, isRunning });
  stateRef.current = { currentIndex, phase, secondsLeft, isRunning };

  // Reset the player whenever the route's day changes.
  useEffect(() => {
    setCurrentIndex(0);
    setPhase("idle");
    setSecondsLeft(0);
    setIsRunning(false);
    void dayNumber;
  }, [dayNumber]);

  // Drive the countdown and auto-advance between work and rest phases.
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      const {
        currentIndex: idx,
        phase: ph,
        secondsLeft: sec,
      } = stateRef.current;
      if (sec > 1) {
        setSecondsLeft(sec - 1);
        return;
      }
      // Current phase finished this tick.
      if (ph === "work") {
        const rest = Number(exercises[idx]?.restSec ?? 0);
        if (rest > 0) {
          setPhase("rest");
          setSecondsLeft(rest);
        } else if (idx < exercises.length - 1) {
          setCurrentIndex(idx + 1);
          setSecondsLeft(Number(exercises[idx + 1]?.durationSec ?? 0));
        } else {
          setPhase("done");
          setIsRunning(false);
        }
      } else if (ph === "rest") {
        if (idx < exercises.length - 1) {
          setCurrentIndex(idx + 1);
          setSecondsLeft(Number(exercises[idx + 1]?.durationSec ?? 0));
        } else {
          setPhase("done");
          setIsRunning(false);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, exercises]);

  const handleStart = useCallback(() => {
    setPhase("work");
    setSecondsLeft(Number(exercises[0]?.durationSec ?? 0));
    setIsRunning(true);
  }, [exercises]);

  const handlePause = useCallback(() => setIsRunning(false), []);
  const handleResume = useCallback(() => setIsRunning(true), []);

  const handleSkip = useCallback(() => {
    const { currentIndex: idx } = stateRef.current;
    if (idx < exercises.length - 1) {
      setCurrentIndex(idx + 1);
      setPhase("work");
      setSecondsLeft(Number(exercises[idx + 1]?.durationSec ?? 0));
      setIsRunning(true);
    } else {
      setPhase("done");
      setIsRunning(false);
    }
  }, [exercises]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setPhase("idle");
    setSecondsLeft(0);
    setIsRunning(false);
  }, []);

  const handleMarkComplete = useCallback(() => {
    markComplete.mutate(dayNumber);
  }, [markComplete, dayNumber]);

  // Session progress: completed exercises plus the current phase's fraction.
  const total = exercises.length;
  const currentFraction =
    phase === "work"
      ? (Number(exercises[currentIndex]?.durationSec ?? 0) - secondsLeft) /
        Math.max(1, Number(exercises[currentIndex]?.durationSec ?? 0))
      : phase === "rest" || phase === "done"
        ? 1
        : 0;
  const sessionProgress =
    total === 0
      ? 0
      : Math.round(((currentIndex + currentFraction) / total) * 100);
  const exerciseProgress =
    phase === "work"
      ? Math.round(
          ((Number(exercises[currentIndex]?.durationSec ?? 0) - secondsLeft) /
            Math.max(1, Number(exercises[currentIndex]?.durationSec ?? 0))) *
            100,
        )
      : phase === "rest"
        ? 100
        : 0;

  const currentExercise = exercises[currentIndex];
  const nextExercise = exercises[currentIndex + 1];

  // ---- Loading state ----
  if (dayQuery.isLoading || unlockedQuery.isLoading) {
    return (
      <div className="space-y-4" data-ocid="workout.loading_state">
        <div className="bg-card h-40 animate-pulse rounded-2xl" />
        <div className="bg-card h-64 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // ---- Day not found ----
  if (!day) {
    return (
      <div
        className="bg-card flex flex-col items-center justify-center gap-4 rounded-2xl border border-border px-6 py-20 text-center"
        data-ocid="workout.error_state"
      >
        <div className="bg-secondary flex size-14 items-center justify-center rounded-2xl">
          <Dumbbell className="size-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold">Day not found</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          We couldn't find Day {dayNumberParam} in your program.
        </p>
        <Link
          to="/program"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          data-ocid="workout.back_to_program_button"
        >
          Back to program <ChevronRight className="size-4" />
        </Link>
      </div>
    );
  }

  // ---- Locked state ----
  if (!isUnlocked) {
    return (
      <div
        className="bg-card flex flex-col items-center justify-center gap-4 rounded-2xl border border-border px-6 py-20 text-center"
        data-ocid="workout.locked_state"
      >
        <div className="bg-muted flex size-14 items-center justify-center rounded-2xl">
          <Lock className="size-7 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          Day {dayNumberParam} is locked
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Complete the previous day's workout to unlock this one. Keep the
          momentum going!
        </p>
        <Link
          to="/program"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          data-ocid="workout.back_to_program_button"
        >
          View program <ChevronRight className="size-4" />
        </Link>
      </div>
    );
  }

  // ---- Subscription gate ----
  if (!isSubscribed && dayNumber > BigInt(FREE_PREVIEW_DAYS)) {
    return (
      <div
        className="bg-card flex flex-col items-center justify-center gap-4 rounded-2xl border border-border px-6 py-20 text-center"
        data-ocid="workout.upgrade_prompt"
      >
        <div className="bg-gradient-primary flex size-14 items-center justify-center rounded-2xl">
          <Sparkles className="size-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          Unlock Day {dayNumberParam}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          This workout is part of the full 45-day program. Subscribe for 90 days
          of access to every workout and diet plan.
        </p>
        <Link
          to="/paywall"
          className="bg-gradient-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          data-ocid="workout.upgrade_button"
        >
          <Flame className="size-4" /> Upgrade now
        </Link>
      </div>
    );
  }

  // ---- Rest / recovery day with no exercises ----
  if (total === 0) {
    return (
      <div
        className="bg-card flex flex-col items-center justify-center gap-4 rounded-2xl border border-border px-6 py-20 text-center"
        data-ocid="workout.rest_day"
      >
        <div className="bg-secondary flex size-14 items-center justify-center rounded-2xl">
          <Trophy className="size-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          Day {dayNumberParam} — {DAY_TYPE_LABELS[day.dayType]}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Today is a {DAY_TYPE_LABELS[day.dayType].toLowerCase()} day. Rest up
          and come back stronger tomorrow.
        </p>
        <Link
          to="/program"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          data-ocid="workout.back_to_program_button"
        >
          View program <ChevronRight className="size-4" />
        </Link>
      </div>
    );
  }

  const isDone = phase === "done";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      data-ocid="workout.page"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">
              Day {dayNumberParam}
            </h1>
            <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {DAY_TYPE_LABELS[day.dayType]}
            </span>
            {isAlreadyComplete && (
              <span className="bg-success/15 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                <Check className="size-3" /> Completed
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {total} exercises · guided timer
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Flame className="size-4 text-accent" />
          <span className="font-semibold">
            {progressQuery.data?.streak?.toString() ?? "0"} day streak
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Player */}
        <div className="bg-card flex flex-col gap-5 rounded-2xl border border-border p-5 lg:col-span-3">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <ProgressRing value={sessionProgress} />
            <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  phase === "rest"
                    ? "bg-accent/15 text-accent"
                    : phase === "done"
                      ? "bg-success/15 text-success"
                      : "bg-primary/15 text-primary"
                }`}
                data-ocid="workout.phase_badge"
              >
                {phase === "idle"
                  ? "Ready"
                  : phase === "work"
                    ? "Work"
                    : phase === "rest"
                      ? "Rest"
                      : "Complete"}
              </span>
              <h2 className="font-display text-xl font-bold">
                {isDone ? "Session complete!" : currentExercise?.name}
              </h2>
              {!isDone && (
                <p className="text-muted-foreground text-sm">
                  {phase === "rest"
                    ? "Catch your breath — next up:"
                    : phase === "idle"
                      ? "Press start when you're ready."
                      : "Keep going, you've got this!"}{" "}
                  {phase === "rest" && nextExercise && (
                    <span className="text-foreground font-semibold">
                      {nextExercise.name}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`font-mono text-6xl font-bold tabular-nums sm:text-7xl ${
                phase === "rest" ? "text-accent" : "text-foreground"
              }`}
              data-ocid="workout.timer"
            >
              {isDone ? "00:00" : formatTime(secondsLeft)}
            </div>
            <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                  phase === "rest" ? "bg-accent" : "bg-primary"
                }`}
                style={{ width: `${exerciseProgress}%` }}
                data-ocid="workout.exercise_progress"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {phase === "rest"
                ? "Rest period"
                : phase === "work"
                  ? `${currentExercise?.reps?.toString() ?? "—"} reps · ${currentExercise?.durationSec?.toString() ?? "—"}s work`
                  : phase === "idle"
                    ? "Ready to begin"
                    : "All done"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {phase === "idle" && (
              <button
                type="button"
                onClick={handleStart}
                className="bg-gradient-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                data-ocid="workout.start_button"
              >
                <Play className="size-4" /> Start workout
              </button>
            )}
            {phase === "work" && !isRunning && (
              <button
                type="button"
                onClick={handleResume}
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                data-ocid="workout.resume_button"
              >
                <Play className="size-4" /> Resume
              </button>
            )}
            {phase === "work" && isRunning && (
              <button
                type="button"
                onClick={handlePause}
                className="bg-secondary text-secondary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                data-ocid="workout.pause_button"
              >
                <Pause className="size-4" /> Pause
              </button>
            )}
            {(phase === "work" || phase === "rest") && (
              <button
                type="button"
                onClick={handleSkip}
                className="bg-secondary text-secondary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                data-ocid="workout.skip_button"
              >
                <SkipForward className="size-4" /> Skip
              </button>
            )}
            {isDone && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={markComplete.isPending}
                className="bg-gradient-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                data-ocid="workout.mark_complete_button"
              >
                <Trophy className="size-4" />
                {markComplete.isPending ? "Saving…" : "Mark complete"}
              </button>
            )}
            {isDone && (
              <button
                type="button"
                onClick={handleRestart}
                className="bg-secondary text-secondary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                data-ocid="workout.restart_button"
              >
                <RotateCcw className="size-4" /> Replay
              </button>
            )}
          </div>

          {markComplete.isError && (
            <p
              className="text-center text-sm font-medium text-destructive"
              data-ocid="workout.error_state"
            >
              Couldn't save your progress. Please try again.
            </p>
          )}
          {markComplete.isSuccess && (
            <p
              className="text-center text-sm font-medium text-success"
              data-ocid="workout.success_state"
            >
              Day {dayNumberParam} complete — the next day is now unlocked!
            </p>
          )}
        </div>

        {/* Exercise queue */}
        <div className="bg-card rounded-2xl border border-border p-5 lg:col-span-2">
          <h3 className="font-display mb-4 text-lg font-bold">Exercises</h3>
          <ol className="space-y-2.5" data-ocid="workout.exercise_list">
            {exercises.map((exercise, index) => {
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;
              return (
                <li
                  key={`${exercise.name}-${index}`}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                    isCurrent
                      ? "border-primary/40 bg-primary/5"
                      : isPast
                        ? "border-border bg-muted/40"
                        : "border-border"
                  }`}
                  data-ocid={`workout.exercise_item.${index + 1}`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      isPast
                        ? "bg-success/15 text-success"
                        : isCurrent
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast ? (
                      <Check className="size-4" />
                    ) : (
                      <span className="font-mono text-sm font-bold">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${
                        isCurrent ? "text-foreground" : "text-foreground"
                      }`}
                    >
                      {exercise.name}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <Clock className="size-3" />
                      {exercise.durationSec?.toString() ?? "—"}s ·{" "}
                      {exercise.reps?.toString() ?? "—"} reps ·{" "}
                      {exercise.restSec?.toString() ?? "—"}s rest
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      Now
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
