import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  useDay,
  useIsDayUnlocked,
  useProgram,
  useProgress,
} from "@/hooks/useProgram";
import { DAY_TYPE_LABELS, type Day, type DayType } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Dumbbell,
  Flame,
  HeartPulse,
  Lock,
  Moon,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";

const DAY_TYPE_ICON: Record<DayType, typeof Dumbbell> = {
  workout: Dumbbell,
  recovery: HeartPulse,
  rest: Moon,
};

const GRID_SKELETON_KEYS = [
  "g1",
  "g2",
  "g3",
  "g4",
  "g5",
  "g6",
  "g7",
  "g8",
  "g9",
  "g10",
  "g11",
  "g12",
  "g13",
  "g14",
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function ProgressRing({ value }: { value: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative size-32" data-ocid="dashboard.progress_ring">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <title>Progress ring showing {clamped}% completed</title>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{clamped}%</span>
        <span className="text-muted-foreground text-[11px] font-medium">
          complete
        </span>
      </div>
    </div>
  );
}

function DayCard({
  day,
  isComplete,
  isLocked,
  isCurrent,
}: {
  day: Day;
  isComplete: boolean;
  isLocked: boolean;
  isCurrent: boolean;
}) {
  const TypeIcon = DAY_TYPE_ICON[day.dayType];
  const dayNum = Number(day.dayNumber);

  const base =
    "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border transition-smooth";

  let stateClass = "border-border bg-card text-foreground";
  if (isComplete) {
    stateClass =
      "bg-gradient-primary border-transparent text-primary-foreground shadow-lg";
  } else if (isCurrent) {
    stateClass =
      "border-accent bg-card text-foreground ring-2 ring-accent/60 shadow-[0_0_20px_-4px_var(--accent)]";
  } else if (isLocked) {
    stateClass = "border-border bg-muted/50 text-muted-foreground";
  }

  const content = (
    <>
      <span className="font-display text-lg font-bold leading-none">
        {dayNum}
      </span>
      <TypeIcon className="size-4" />
      {isComplete ? (
        <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-background/25">
          <Check className="size-3" />
        </span>
      ) : isLocked ? (
        <Lock className="absolute right-1.5 top-1.5 size-3.5" />
      ) : null}
      {isCurrent ? (
        <span className="absolute -top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
          Today
        </span>
      ) : null}
    </>
  );

  if (isLocked) {
    return (
      <div
        className={`${base} ${stateClass} cursor-not-allowed`}
        title={`Day ${dayNum} — complete day ${dayNum - 1} to unlock`}
        data-ocid={`dashboard.day.${dayNum}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to="/workout/$dayNumber"
      params={{ dayNumber: String(dayNum) }}
      className={`${base} ${stateClass} hover:-translate-y-0.5 hover:shadow-xl`}
      data-ocid={`dashboard.day.${dayNum}`}
    >
      {content}
    </Link>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const programQuery = useProgram();
  const progressQuery = useProgress();

  const program = programQuery.data;
  const progress = progressQuery.data;

  const completedSet = useMemo(
    () => new Set((progress?.completedDays ?? []).map(String)),
    [progress],
  );

  const weeks = useMemo(() => {
    const map = new Map<number, Day[]>();
    for (const day of program?.days ?? []) {
      const w = Number(day.week);
      if (!map.has(w)) map.set(w, []);
      map.get(w)!.push(day);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(
        ([week, days]) =>
          [
            week,
            days.sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber)),
          ] as const,
      );
  }, [program]);

  const currentDayNumber = useMemo(() => {
    const next = (program?.days ?? []).find(
      (d) => !completedSet.has(String(d.dayNumber)),
    );
    return next?.dayNumber ?? null;
  }, [program, completedSet]);

  const todayQuery = useDay(currentDayNumber);
  const todayUnlockedQuery = useIsDayUnlocked(currentDayNumber);
  const today = todayQuery.data;
  const todayUnlocked = todayUnlockedQuery.data ?? false;

  const completion = Number(progress?.completionPercentage ?? 0n);
  const streak = Number(progress?.streak ?? 0n);
  const totalDays = program?.days.length ?? 45;

  const isLoading =
    programQuery.isLoading || progressQuery.isLoading || !program || !progress;

  const isDayComplete = (n: bigint) => completedSet.has(String(n));
  const isDayLocked = (n: bigint) =>
    Number(n) !== 1 && !completedSet.has(String(n - 1n));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          {greeting()}, {profile?.name?.split(" ")[0] ?? "champion"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Day {currentDayNumber ? Number(currentDayNumber) : totalDays} of{" "}
          {totalDays} — let&apos;s keep the momentum going.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <CardContent className="flex items-center gap-4 p-5">
            <ProgressRing value={completion} />
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Program progress
              </p>
              <p className="text-sm text-muted-foreground">
                {completedSet.size} of {totalDays} days done
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardContent className="flex h-full items-center gap-4 p-5">
            <div className="bg-accent/15 flex size-14 shrink-0 items-center justify-center rounded-2xl">
              <Flame className="size-7 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Current streak
              </p>
              <p className="font-display text-3xl font-bold text-accent">
                {streak}
              </p>
              <p className="text-xs text-muted-foreground">
                {streak === 1 ? "day" : "days"} in a row
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardContent className="flex h-full items-center gap-4 p-5">
            <div className="bg-primary/15 flex size-14 shrink-0 items-center justify-center rounded-2xl">
              <Trophy className="size-7 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Days completed
              </p>
              <p className="font-display text-3xl font-bold">
                {completedSet.size}
              </p>
              <p className="text-xs text-muted-foreground">
                of {totalDays} total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's activity */}
      <Card data-ocid="dashboard.today_section">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-display text-lg">
            Today&apos;s activity
          </CardTitle>
          {today ? (
            <Badge variant="secondary" className="capitalize">
              {DAY_TYPE_LABELS[today.dayType]}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="flex items-center gap-3 py-2"
              data-ocid="dashboard.loading_state"
            >
              <div className="bg-muted size-12 animate-pulse rounded-xl" />
              <div className="space-y-2">
                <div className="bg-muted h-4 w-40 animate-pulse rounded" />
                <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              </div>
            </div>
          ) : today && todayUnlocked ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                  <Dumbbell className="size-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-display text-base font-bold">
                    Day {Number(today.dayNumber)}
                  </p>
                  {today.dayType === "workout" ? (
                    <p className="text-muted-foreground text-sm">
                      {today.exercises.length} exercises ·{" "}
                      {today.exercises.reduce(
                        (sum, e) => sum + Number(e.durationSec),
                        0,
                      )}{" "}
                      sec total
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {today.dayType === "recovery"
                        ? "Active recovery — light movement and mobility."
                        : "Rest day — recover and refuel for tomorrow."}
                    </p>
                  )}
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link
                  to="/workout/$dayNumber"
                  params={{ dayNumber: String(Number(today.dayNumber)) }}
                  data-ocid="dashboard.today_button"
                >
                  {today.dayType === "workout" ? "Start workout" : "View day"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-3 py-6 text-center"
              data-ocid="dashboard.empty_state"
            >
              <div className="bg-secondary flex size-12 items-center justify-center rounded-2xl">
                <Trophy className="size-6 text-primary" />
              </div>
              <p className="font-display text-base font-bold">
                You&apos;ve finished the program!
              </p>
              <p className="text-muted-foreground max-w-sm text-sm">
                Incredible work completing all {totalDays} days. Replay any day
                from the grid below to keep training.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program grid */}
      <Card data-ocid="dashboard.program_section">
        <CardHeader>
          <CardTitle className="font-display text-lg">45-Day Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div
              className="grid grid-cols-5 gap-3 sm:grid-cols-7"
              data-ocid="dashboard.loading_state"
            >
              {GRID_SKELETON_KEYS.map((key) => (
                <div
                  key={key}
                  className="bg-muted aspect-square animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            weeks.map(([week, days]) => (
              <div key={week} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Week {week}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {days.filter((d) => isDayComplete(d.dayNumber)).length}/
                    {days.length} done
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-7">
                  {days.map((day) => (
                    <DayCard
                      key={String(day.dayNumber)}
                      day={day}
                      isComplete={isDayComplete(day.dayNumber)}
                      isLocked={isDayLocked(day.dayNumber)}
                      isCurrent={
                        currentDayNumber !== null &&
                        day.dayNumber === currentDayNumber
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
