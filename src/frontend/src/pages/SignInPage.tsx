import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Dumbbell, Flame, Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";

export function SignInPage() {
  const { login, isLoggingIn, isLoginError } = useInternetIdentity();

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="bg-gradient-primary absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border bg-card/80 shadow-xl backdrop-blur">
            <CardContent className="flex flex-col items-center gap-6 px-8 py-10 text-center">
              <div className="bg-gradient-primary flex size-16 items-center justify-center rounded-2xl shadow-lg">
                <Dumbbell className="size-8 text-primary-foreground" />
              </div>

              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  45-Day Transformation
                </h1>
                <p className="text-muted-foreground text-sm">
                  A structured 45-day fitness program with workouts, recovery,
                  and an Indian diet plan — built to keep you consistent.
                </p>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 text-center">
                <div className="bg-secondary rounded-xl p-3">
                  <Zap className="mx-auto mb-1 size-5 text-primary" />
                  <p className="text-xs font-medium">45 Days</p>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <Dumbbell className="mx-auto mb-1 size-5 text-primary" />
                  <p className="text-xs font-medium">Daily Workouts</p>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <Flame className="mx-auto mb-1 size-5 text-primary" />
                  <p className="text-xs font-medium">Indian Diet</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => login()}
                disabled={isLoggingIn}
                data-ocid="signin.button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in with Internet Identity"
                )}
              </Button>

              {isLoginError ? (
                <p
                  className="text-destructive text-sm"
                  data-ocid="signin.error"
                >
                  Sign-in failed. Please try again.
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Sign in securely with Internet Identity to start your program.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
