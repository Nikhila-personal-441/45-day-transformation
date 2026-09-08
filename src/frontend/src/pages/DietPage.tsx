import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCalorieLog,
  useDietPlan,
  useLogMeal,
  useProgress,
} from "@/hooks/useProgram";
import type { FoodItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Check,
  Flame,
  Minus,
  Plus,
  Salad,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";

/** Format a bigint calorie value as a plain number string. */
function formatCalories(value: bigint): string {
  return value.toString();
}

const FOOD_SKELETON_KEYS = ["f1", "f2", "f3", "f4", "f5", "f6"];

/** Today's date as YYYY-MM-DD in local time. */
function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function DietPage() {
  const date = useMemo(todayKey, []);
  const { data: dietPlan, isLoading: planLoading } = useDietPlan();
  const { data: progress } = useProgress();
  const { data: calorieLog } = useCalorieLog(date);
  const logMeal = useLogMeal();

  // Local selection of food items to log for today.
  const [selection, setSelection] = useState<Map<string, number>>(new Map());

  const target =
    dietPlan?.dailyCalorieTarget ?? progress?.dailyCalorieTarget ?? 0n;
  const loggedCalories = calorieLog?.totalCalories ?? 0n;
  const remaining = target - loggedCalories;

  const selectedItems = useMemo<FoodItem[]>(() => {
    if (!dietPlan) return [];
    return Array.from(selection.entries())
      .map(([name, qty]) => {
        const food = dietPlan.foodOptions.find((f) => f.name === name);
        return food
          ? { name: food.name, calories: food.calories * BigInt(qty) }
          : null;
      })
      .filter((f): f is FoodItem => f !== null);
  }, [dietPlan, selection]);

  const selectedCount = Array.from(selection.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const selectedCalories = selectedItems.reduce((a, b) => a + b.calories, 0n);

  const addItem = (name: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      next.set(name, (next.get(name) ?? 0) + 1);
      return next;
    });
  };

  const removeItem = (name: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      const qty = next.get(name) ?? 0;
      if (qty <= 1) next.delete(name);
      else next.set(name, qty - 1);
      return next;
    });
  };

  const handleLog = () => {
    if (selectedItems.length === 0) return;
    logMeal.mutate({ date, items: selectedItems });
    setSelection(new Map());
  };

  const percentLogged =
    target > 0n ? Math.min(100, Number((loggedCalories * 100n) / target)) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Diet Plan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Indian food options and daily calorie targets to fuel your 45-day
          transformation.
        </p>
      </div>

      {/* Calorie target + today's log */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card data-ocid="diet.target_card" className="bg-gradient-subtle">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <Flame className="size-4 text-accent" />
              Daily Calorie Target
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-accent/15 text-accent-foreground"
            >
              {planLoading ? "…" : `${formatCalories(target)} kcal`}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Logged today
                </p>
                <p className="font-display text-3xl font-bold">
                  {formatCalories(loggedCalories)}
                  <span className="text-muted-foreground ml-1 text-base font-normal">
                    / {formatCalories(target)} kcal
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Remaining
                </p>
                <p
                  className={cn(
                    "font-display text-xl font-bold",
                    remaining < 0n ? "text-destructive" : "text-accent",
                  )}
                >
                  {remaining < 0n ? "Over" : formatCalories(remaining)} kcal
                </p>
              </div>
            </div>
            <Progress value={percentLogged} className="h-2.5" />
            {remaining >= 0n && remaining < target / 4n && (
              <p className="text-accent flex items-center gap-1.5 text-sm font-medium">
                <Flame className="size-4" />
                Almost there — keep fueling up for your workout!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Today's meal log summary */}
        <Card data-ocid="diet.log_card">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <UtensilsCrossed className="size-4 text-primary" />
              Today&apos;s Meals
            </CardTitle>
            <Badge variant="secondary">
              {calorieLog?.items.length ?? 0} item
              {(calorieLog?.items.length ?? 0) === 1 ? "" : "s"}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {calorieLog && calorieLog.items.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {calorieLog.items.map((item, i) => (
                  <li
                    key={`${item.name}-${i}`}
                    data-ocid={`diet.log_item.${i}`}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {formatCalories(item.calories)} kcal
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No meals logged yet today. Pick items below to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meal logging tray */}
      {selectedCount > 0 && (
        <Card data-ocid="diet.log_tray" className="border-primary/40 bg-card">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
              </span>
              <span className="text-muted-foreground text-sm">
                {formatCalories(selectedCalories)} kcal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelection(new Map())}
                data-ocid="diet.clear_button"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleLog}
                disabled={logMeal.isPending}
                data-ocid="diet.log_button"
              >
                {logMeal.isPending ? (
                  "Logging…"
                ) : (
                  <>
                    <Check className="size-4" />
                    Log meals
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Food options gallery */}
      <section data-ocid="diet.food_gallery" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            Suggested Indian Foods
          </h2>
          <Badge variant="secondary" className="text-muted-foreground">
            Tap + to add
          </Badge>
        </div>

        {planLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {FOOD_SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {dietPlan?.foodOptions.map((food, i) => {
              const qty = selection.get(food.name) ?? 0;
              return (
                <div
                  key={food.name}
                  data-ocid={`diet.food_item.${i}`}
                  className="bg-card border-border flex flex-col justify-between gap-3 rounded-xl border p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="bg-gradient-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Salad className="size-4 text-primary-foreground" />
                    </div>
                    {qty > 0 && (
                      <Badge className="bg-accent text-accent-foreground">
                        ×{qty}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-display text-sm font-semibold leading-tight">
                      {food.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatCalories(food.calories)} kcal
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {qty > 0 ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => removeItem(food.name)}
                          aria-label={`Remove one ${food.name}`}
                          data-ocid={`diet.food_remove.${i}`}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => addItem(food.name)}
                          aria-label={`Add one ${food.name}`}
                          data-ocid={`diet.food_add.${i}`}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addItem(food.name)}
                        data-ocid={`diet.food_add.${i}`}
                      >
                        <Plus className="size-3.5" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
