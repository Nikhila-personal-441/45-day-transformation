import type {
  Day,
  DayType,
  DietPlan,
  Exercise,
  FitnessGoal,
  FoodItem,
  MealLog,
  Program,
  StartingLevel,
  SubscriptionStatus,
  UserProfileView,
  UserProgressView,
} from "@/backend";

// Re-export backend domain types so pages import from a single shared module.
export type {
  Day,
  DayType,
  DietPlan,
  Exercise,
  FitnessGoal,
  FoodItem,
  MealLog,
  Program,
  StartingLevel,
  SubscriptionStatus,
  UserProfileView,
  UserProgressView,
};

/** A single navigation entry rendered in the sidebar and mobile nav. */
export interface NavItem {
  label: string;
  to: string;
  icon: "dashboard" | "program" | "workout" | "diet" | "progress" | "paywall";
}

/** The main navigation links for the authenticated app shell. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: "dashboard" },
  { label: "Program", to: "/program", icon: "program" },
  { label: "Diet", to: "/diet", icon: "diet" },
  { label: "Progress", to: "/progress", icon: "progress" },
  { label: "Subscription", to: "/paywall", icon: "paywall" },
];

/** Human-readable labels for each fitness goal. */
export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  loseWeight: "Lose weight",
  buildMuscle: "Build muscle",
  improveFitness: "Improve fitness",
  generalHealth: "General health",
};

/** Human-readable labels for each starting level. */
export const STARTING_LEVEL_LABELS: Record<StartingLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Human-readable labels for each day type. */
export const DAY_TYPE_LABELS: Record<DayType, string> = {
  workout: "Workout",
  recovery: "Recovery",
  rest: "Rest",
};

/** Convert a backend nanosecond timestamp to a JavaScript Date. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}
