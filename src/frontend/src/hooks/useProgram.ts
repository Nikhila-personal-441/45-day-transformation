import { useBackend } from "@/hooks/useBackend";
import type {
  Day,
  DietPlan,
  FoodItem,
  Program,
  SubscriptionStatus,
  UserProgressView,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Fetch the full 45-day program. */
export function useProgram() {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["program"],
    queryFn: async (): Promise<Program> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getProgram();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single day by its day number. */
export function useDay(dayNumber: bigint | null) {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["day", dayNumber?.toString()],
    queryFn: async (): Promise<Day | null> => {
      if (!actor || dayNumber === null) return null;
      return actor.getDay(dayNumber);
    },
    enabled: !!actor && !isFetching && dayNumber !== null,
  });
}

/** Fetch all days in a given week. */
export function useDaysByWeek(week: bigint) {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["daysByWeek", week.toString()],
    queryFn: async (): Promise<Day[]> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getDaysByWeek(week);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Check whether a given day is unlocked. */
export function useIsDayUnlocked(dayNumber: bigint | null) {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["dayUnlocked", dayNumber?.toString()],
    queryFn: async (): Promise<boolean> => {
      if (!actor || dayNumber === null) return false;
      return actor.isDayUnlocked(dayNumber);
    },
    enabled: !!actor && !isFetching && dayNumber !== null,
  });
}

/** Fetch the user's overall progress (completion, streak, calorie log). */
export function useProgress() {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["progress"],
    queryFn: async (): Promise<UserProgressView> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the diet plan with Indian food options and calorie target. */
export function useDietPlan() {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["dietPlan"],
    queryFn: async (): Promise<DietPlan> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getDietPlan();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the calorie log for a specific date (YYYY-MM-DD). */
export function useCalorieLog(date: string) {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["calorieLog", date],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCalorieLog(date);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch the user's subscription status. */
export function useSubscriptionStatus() {
  const { actor, isFetching } = useBackend();
  return useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getSubscriptionStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Mark a day as complete, unlocking the next day. */
export function useMarkDayComplete() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dayNumber: bigint): Promise<boolean> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markDayComplete(dayNumber);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["program"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["day"] });
      void queryClient.invalidateQueries({ queryKey: ["dayUnlocked"] });
      void queryClient.invalidateQueries({ queryKey: ["daysByWeek"] });
    },
  });
}

/** Log a meal for a given date. */
export function useLogMeal() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      items,
    }: {
      date: string;
      items: FoodItem[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.logMeal(date, items);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["calorieLog", variables.date],
      });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

/** Activate the 90-day subscription. */
export function useActivateSubscription() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<SubscriptionStatus> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.activateSubscription();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
}
