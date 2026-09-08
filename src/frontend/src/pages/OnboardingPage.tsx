import { FitnessGoal, StartingLevel } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackend } from "@/hooks/useBackend";
import { FITNESS_GOAL_LABELS, STARTING_LEVEL_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Dumbbell, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const GOALS: FitnessGoal[] = [
  FitnessGoal.loseWeight,
  FitnessGoal.buildMuscle,
  FitnessGoal.improveFitness,
  FitnessGoal.generalHealth,
];

const LEVELS: StartingLevel[] = [
  StartingLevel.beginner,
  StartingLevel.intermediate,
  StartingLevel.advanced,
];

export function OnboardingPage() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [level, setLevel] = useState<StartingLevel | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      if (!goal || !level) throw new Error("Please complete all fields");
      return actor.completeOnboarding(name.trim(), goal, level);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const canSubmit = name.trim().length > 0 && goal !== null && level !== null;

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="bg-gradient-primary absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
      />
      <div className="relative w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border bg-card/80 shadow-xl backdrop-blur">
            <CardContent className="flex flex-col gap-7 px-8 py-10">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-primary flex size-12 items-center justify-center rounded-xl">
                  <Dumbbell className="size-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">
                    Let&apos;s set you up
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Tell us a little about you to personalize your 45-day plan.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-name">Your name</Label>
                <Input
                  id="onboarding-name"
                  data-ocid="onboarding.name_input"
                  placeholder="e.g. Aarav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Fitness goal</legend>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      data-ocid={`onboarding.goal.${g}`}
                      onClick={() => setGoal(g)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        goal === g
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {FITNESS_GOAL_LABELS[g]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Starting level</legend>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      data-ocid={`onboarding.level.${l}`}
                      onClick={() => setLevel(l)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                        level === l
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {STARTING_LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
              </fieldset>

              {mutation.isError ? (
                <p
                  className="text-destructive text-sm"
                  data-ocid="onboarding.error"
                >
                  Something went wrong saving your profile. Please try again.
                </p>
              ) : null}

              <Button
                size="lg"
                className="w-full"
                disabled={!canSubmit || mutation.isPending}
                onClick={() => mutation.mutate()}
                data-ocid="onboarding.submit_button"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Start my program
                    <ArrowRight />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
