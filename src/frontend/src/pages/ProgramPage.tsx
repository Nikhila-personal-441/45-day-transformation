import { useIsDayUnlocked, useProgram, useProgress } from "@/hooks/useProgram";
import { DAY_TYPE_LABELS, type Day, type DayType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Dumbbell,
  Flame,
  HeartPulse,
  Lock,
  type LucideIcon,
  Moon,
} from "lucide-react";
import { motion } from "motion/react";

const DAY_TYPE_ICONS: Record<DayType, LucideIcon> = {
  workout: Dumbbell,
  recovery: HeartPulse,
  rest: Moon,
};

const DAY_TYPE_STYLES: Record<DayType, string> = {
  workout: "bg-primary/15 text-primary",
  recovery: "bg-secondary text-chart-4",
  rest: "bg-muted text-muted-foreground",
};

const TOTAL_WEEKS = 7;

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

/** A single day card in the program grid. Renders its own unlock state. */
function DayCard({ day, completed }: { day: Day; completed: boolean }) {
  const { data: unlocked } = useIsDayUnlocked(day.dayNumber);
  const isUnlocked = unlocked ?? false;
  const dayNum = Number(day.dayNumber);
  const locked = !isUnlocked && !completed;
  const Icon = DAY_TYPE_ICONS[day.dayType];

  return (
    <Link
      to="/workout/$dayNumber"
      params={{ dayNumber: dayNum.toString() }}
      data-ocid={`program.day.${dayNum}`}
      aria-label={`Day ${dayNum} — ${DAY_TYPE_LABELS[day.dayType]}${
        completed ? ", completed" : locked ? ", locked" : ""
      }`}
      className={cn(
        "group relative flex min-h-[7.5rem] flex-col justify-between gap-3 rounded-2xl border p-4 transition-smooth",
        completed
          ? "border-primary/40 bg-primary/10"
          : locked
            ? "border-border bg-card/40"
            : "border-border bg-card hover:border-primary/40 hover:shadow-card",
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "font-display text-2xl font-bold leading-none",
            locked ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {dayNum}
        </span>
        {completed ? (
          <span className="bg-primary flex size-6 items-center justify-center rounded-full text-primary-foreground">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        ) : locked ? (
          <Lock className="size-5 text-muted-foreground" />
        ) : (
          <span className="bg-gradient-primary flex size-6 items-center justify-center rounded-full text-primary-foreground">
            <Icon className="size-3.5" />
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            DAY_TYPE_STYLES[day.dayType],
          )}
        >
          <Icon className="size-3" />
          {DAY_TYPE_LABELS[day.dayType]}
        </span>
        {locked ? (
          <p className="text-[11px] leading-tight text-muted-foreground">
            Complete Day {dayNum - 1} to unlock
          </p>
        ) : completed ? (
          <p className="text-[11px] font-medium text-primary">Completed</p>
        ) : (
          <p className="text-[11px] font-medium text-primary">Ready to start</p>
        )}
      </div>
    </Link>
  );
}

export function ProgramPage() {
  const { data: program, isLoading: programLoading } = useProgram();
  const { data: progress, isLoading: progressLoading } = useProgress();

  const loading = programLoading || progressLoading;

  const completedSet = new Set(
    (progress?.completedDays ?? []).map((d) => Number(d)),
  );
  const completion = Number(progress?.completionPercentage ?? 0);
  const streak = Number(progress?.streak ?? 0);

  const days = program?.days ?? [];
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
  const daysByWeek = weeks.map((week) =>
    days.filter((d) => Number(d.week) === week),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Your 45-Day Program
          </h1>
          <p className="text-muted-foreground text-sm">
            Seven weeks of workouts, recovery, and rest — one day at a time.
          </p>
        </div>
        <div className="bg-card border-border flex items-center gap-2 rounded-xl border px-4 py-2.5">
          <Flame className="size-4 text-accent" />
          <span className="font-display text-lg font-bold">{streak}</span>
          <span className="text-muted-foreground text-xs">day streak</span>
        </div>
      </div>

      <div className="bg-card border-border rounded-2xl border p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Overall completion</span>
          <span className="font-display text-lg font-bold text-primary">
            {completion}%
          </span>
        </div>
        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-gradient-primary h-full rounded-full transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {completedSet.size} of 45 days completed
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {weeks.map((week) => (
            <div key={week} className="space-y-3">
              <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {SKELETON_KEYS.map((key) => (
                  <div
                    key={key}
                    className="bg-muted h-28 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {daysByWeek.map((weekDays, idx) => {
            const first = weekDays[0] ? Number(weekDays[0].dayNumber) : null;
            const last = weekDays[weekDays.length - 1]
              ? Number(weekDays[weekDays.length - 1].dayNumber)
              : null;
            return (
              <section key={first ?? idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold">
                    Week {idx + 1}
                  </h2>
                  {first !== null && last !== null ? (
                    <span className="text-muted-foreground text-xs">
                      Days {first}–{last}
                    </span>
                  ) : null}
                  <div className="bg-muted h-px flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                  {weekDays.map((day) => (
                    <DayCard
                      key={Number(day.dayNumber)}
                      day={day}
                      completed={completedSet.has(Number(day.dayNumber))}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
