import {
  useActivateSubscription,
  useSubscriptionStatus,
} from "@/hooks/useProgram";
import { timestampToDate } from "@/lib/types";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Crown,
  Flame,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";

const FREE_PREVIEW_DAYS = 3;

const PLAN_FEATURES = [
  "All 45 days of guided workouts",
  "Full Indian diet plan with calorie targets",
  "Every exercise with animated demos",
  "Progress tracking, streaks & calorie log",
  "90 days of access — plenty of time to finish",
];

const SAMPLE_DAYS = [
  { day: 1, label: "Day 1 · Full Body Kickoff", type: "Workout" },
  { day: 2, label: "Day 2 · Core & Mobility", type: "Recovery" },
  { day: 3, label: "Day 3 · Lower Body Burn", type: "Workout" },
];

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PaywallPage() {
  const { data: status, isLoading, isError } = useSubscriptionStatus();
  const activate = useActivateSubscription();

  const isActive = status?.active ?? false;
  const daysRemaining = status?.daysRemaining ?? 0n;

  const handleUpgrade = () => {
    activate.mutate();
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <span className="bg-gradient-primary inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
          <Crown className="size-3.5" />
          Subscription
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Unlock your full{" "}
          <span className="text-gradient-primary">45-day transformation</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Get complete access to every workout, the full Indian diet plan, and
          progress tracking — all for a single 90-day access window.
        </p>
      </header>

      {/* Active subscription banner */}
      {isActive && (
        <section
          data-ocid="paywall.active_banner"
          className="bg-gradient-primary flex flex-col gap-4 rounded-2xl p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary-foreground/15 flex size-12 shrink-0 items-center justify-center rounded-xl">
              <BadgeCheck className="size-6" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">
                Subscription active
              </p>
              <p className="text-sm text-primary-foreground/80">
                You have full access to the entire 45-day program.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-3xl font-bold">
                {daysRemaining.toString()}
              </p>
              <p className="text-xs text-primary-foreground/80">days left</p>
            </div>
            <div className="hidden h-10 w-px bg-primary-foreground/25 sm:block" />
            <div className="text-center">
              <p className="font-display text-sm font-semibold">
                {formatDate(timestampToDate(status?.endTime ?? 0n))}
              </p>
              <p className="text-xs text-primary-foreground/80">access until</p>
            </div>
          </div>
        </section>
      )}

      {/* Free preview */}
      {!isActive && (
        <section
          data-ocid="paywall.free_preview"
          className="bg-card border-border rounded-2xl border p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">
                Try the first {FREE_PREVIEW_DAYS} days free
              </h2>
              <p className="text-sm text-muted-foreground">
                A taste of what your transformation looks like.
              </p>
            </div>
            <span className="bg-accent/15 text-accent-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              Free preview
            </span>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {SAMPLE_DAYS.map((sample) => (
              <li
                key={sample.day}
                data-ocid={`paywall.preview_day.${sample.day}`}
                className="border-border bg-muted/40 flex flex-col gap-2 rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-gradient-primary flex size-9 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground">
                    {sample.day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {sample.type}
                  </span>
                </div>
                <p className="text-sm font-medium">{sample.label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            Days 4–45 are locked. Upgrade to unlock the full program.
          </div>
        </section>
      )}

      {/* Plan card */}
      <section
        data-ocid="paywall.plan_card"
        className="bg-card border-border relative overflow-hidden rounded-2xl border p-6 sm:p-8"
      >
        <div className="bg-gradient-primary absolute -right-16 -top-16 size-48 rounded-full opacity-20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="bg-accent/15 text-accent-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                <Zap className="size-3.5" />
                Full program
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold">
              {isActive ? "Your plan is active" : "45-Day Transformation"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              Everything you need to build a stronger, healthier you — with
              Indian food options and workouts that fit your life.
            </p>

            <ul className="mt-6 space-y-3">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-border bg-muted/40 flex flex-col rounded-2xl border p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span className="text-sm font-medium">90-day access</span>
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="font-display text-4xl font-bold">₹499</span>
              <span className="mb-1 text-sm text-muted-foreground">
                one-time
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              ≈ ₹5.5 per day of transformation
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span>Valid for 90 days from activation</span>
            </div>

            {isActive ? (
              <div
                data-ocid="paywall.active_state"
                className="bg-primary/15 text-primary mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                <BadgeCheck className="size-4" />
                Access unlocked
              </div>
            ) : (
              <button
                type="button"
                data-ocid="paywall.upgrade_button"
                onClick={handleUpgrade}
                disabled={activate.isPending}
                className="bg-gradient-primary text-primary-foreground mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activate.isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Activating…
                  </>
                ) : (
                  <>
                    <Crown className="size-4" />
                    Unlock full program
                  </>
                )}
              </button>
            )}

            {activate.isError && (
              <p
                data-ocid="paywall.upgrade_error"
                className="mt-3 text-center text-sm text-destructive"
              >
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Loading / error states */}
      {isLoading && (
        <div
          data-ocid="paywall.loading_state"
          className="bg-card border-border animate-pulse rounded-2xl border p-6"
        >
          <div className="bg-muted h-6 w-48 rounded" />
          <div className="bg-muted mt-4 h-4 w-72 rounded" />
          <div className="bg-muted mt-3 h-4 w-56 rounded" />
        </div>
      )}

      {isError && !isLoading && (
        <div
          data-ocid="paywall.error_state"
          className="border-border bg-card flex items-center gap-3 rounded-2xl border p-6 text-sm text-muted-foreground"
        >
          <Flame className="size-5 text-warning" />
          We couldn't load your subscription status. Please refresh to try
          again.
        </div>
      )}
    </div>
  );
}
