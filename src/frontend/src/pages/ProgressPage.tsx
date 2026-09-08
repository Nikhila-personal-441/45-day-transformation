import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useProgram, useProgress } from "@/hooks/useProgram";
import { DAY_TYPE_LABELS } from "@/lib/types";
import { Flame, Lock, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const TOTAL_DAYS = 45;

/** A circular progress ring with a green-to-amber gradient stroke. */
function ProgressRing({
  percentage,
  size = 132,
}: {
  percentage: number;
  size?: number;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(percentage)}% completed`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <title>Progress ring showing {Math.round(percentage)}% completed</title>
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="oklch(0.68 0.18 155)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 70)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.27 0.03 155)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">
          {Math.round(percentage)}%
        </span>
        <span className="text-muted-foreground text-xs font-medium">
          completed
        </span>
      </div>
    </div>
  );
}

/** A single day tile in the completion history grid. */
function DayTile({
  dayNumber,
  completed,
  isCurrent,
}: {
  dayNumber: number;
  completed: boolean;
  isCurrent: boolean;
}) {
  return (
    <div
      data-ocid={`progress.day.${dayNumber}`}
      className={[
        "flex aspect-square items-center justify-center rounded-xl text-xs font-semibold transition-smooth",
        completed
          ? "bg-gradient-primary text-primary-foreground"
          : isCurrent
            ? "bg-accent text-accent-foreground ring-2 ring-accent/60"
            : "bg-muted text-muted-foreground",
      ].join(" ")}
      title={
        completed
          ? `Day ${dayNumber} completed`
          : isCurrent
            ? `Day ${dayNumber} — current`
            : `Day ${dayNumber} — upcoming`
      }
    >
      {completed ? (
        <span className="text-sm">✓</span>
      ) : isCurrent ? (
        <span className="text-sm">•</span>
      ) : (
        <Lock className="size-3.5" />
      )}
    </div>
  );
}

export function ProgressPage() {
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { isLoading: programLoading } = useProgram();

  const isLoading = progressLoading || programLoading;

  const completedDays = progress?.completedDays ?? [];
  const completedSet = new Set(completedDays.map((d) => Number(d)));
  const streak = Number(progress?.streak ?? 0n);
  const completionPercentage = Number(progress?.completionPercentage ?? 0n);
  const dailyTarget = Number(progress?.dailyCalorieTarget ?? 0n);
  const mealLogs = progress?.mealLogs ?? [];

  // Determine the current day as the highest completed day + 1 (capped at 45).
  const highestCompleted = completedDays.length
    ? Math.max(...completedDays.map((d) => Number(d)))
    : 0;
  const currentDay = Math.min(highestCompleted + 1, TOTAL_DAYS);

  // Build the calorie-over-time series from meal logs, sorted by date.
  const calorieSeries = [...mealLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      calories: Number(log.totalCalories),
    }));

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "oklch(0.68 0.18 155)",
    },
  } satisfies ChartConfig;

  // Group the 45 days into weeks of 7 for the completion grid.
  const weeks: { week: number; days: number[] }[] = [];
  for (let week = 1; week <= Math.ceil(TOTAL_DAYS / 7); week++) {
    const start = (week - 1) * 7 + 1;
    const days: number[] = [];
    for (let d = start; d <= Math.min(start + 6, TOTAL_DAYS); d++) {
      days.push(d);
    }
    weeks.push({ week, days });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Your Progress
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your completion, calories, and streak across the 45 days.
          </p>
        </div>
        <div className="bg-accent/15 text-accent-foreground flex items-center gap-2 self-start rounded-full px-4 py-2">
          <Flame className="size-5" />
          <span className="font-display text-lg font-bold">{streak}</span>
          <span className="text-sm font-medium">day streak</span>
        </div>
      </div>

      {isLoading ? (
        <div
          data-ocid="progress.loading_state"
          className="grid gap-6 lg:grid-cols-3"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-card h-40 animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card data-ocid="progress.completion_card" className="gap-3">
              <CardContent className="flex items-center gap-4 px-6 py-5">
                <ProgressRing percentage={completionPercentage} size={96} />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Program completion
                  </p>
                  <p className="font-display mt-1 text-xl font-bold">
                    {completedDays.length} of {TOTAL_DAYS} days
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {Math.round(completionPercentage)}% done
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-ocid="progress.streak_card" className="gap-3">
              <CardContent className="flex items-center gap-4 px-6 py-5">
                <div className="bg-accent/15 flex size-16 shrink-0 items-center justify-center rounded-2xl">
                  <Flame className="size-8 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Current streak
                  </p>
                  <p className="font-display mt-1 text-xl font-bold">
                    {streak} day{streak === 1 ? "" : "s"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Keep the momentum going
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-ocid="progress.calories_card" className="gap-3">
              <CardContent className="flex items-center gap-4 px-6 py-5">
                <div className="bg-gradient-primary flex size-16 shrink-0 items-center justify-center rounded-2xl">
                  <Trophy className="size-8 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Daily calorie target
                  </p>
                  <p className="font-display mt-1 text-xl font-bold">
                    {dailyTarget.toLocaleString()} kcal
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {mealLogs.length} day{mealLogs.length === 1 ? "" : "s"}{" "}
                    logged
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completion history */}
          <Card data-ocid="progress.history_card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Completion History
              </CardTitle>
              <CardDescription>
                Your 45-day journey — completed days are highlighted, the
                current day is marked in amber.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {weeks.map(({ week, days }) => (
                <div key={week} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Week {week}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {days.filter((d) => completedSet.has(d)).length}/
                      {days.length} complete
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((dayNumber) => (
                      <DayTile
                        key={dayNumber}
                        dayNumber={dayNumber}
                        completed={completedSet.has(dayNumber)}
                        isCurrent={dayNumber === currentDay}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calories logged over time */}
          <Card data-ocid="progress.calories_chart_card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Calories Logged Over Time
              </CardTitle>
              <CardDescription>
                Daily intake compared against your{" "}
                {dailyTarget.toLocaleString()} kcal target.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calorieSeries.length === 0 ? (
                <div
                  data-ocid="progress.calories_empty_state"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center"
                >
                  <Flame className="size-8 text-muted-foreground" />
                  <p className="font-display font-semibold">
                    No meals logged yet
                  </p>
                  <p className="text-muted-foreground max-w-xs text-sm">
                    Log your meals in the Diet section to see your calorie
                    intake trend here.
                  </p>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <AreaChart
                    data={calorieSeries}
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="calorieFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.68 0.18 155)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.68 0.18 155)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: string) => {
                        const [, month, day] = value.split("-");
                        return `${Number(month)}/${Number(day)}`;
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={44}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ stroke: "oklch(0.27 0.03 155)" }}
                    />
                    <Area
                      dataKey="calories"
                      type="monotone"
                      stroke="oklch(0.68 0.18 155)"
                      strokeWidth={2}
                      fill="url(#calorieFill)"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
