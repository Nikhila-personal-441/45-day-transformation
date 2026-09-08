import { useBackend } from "@/hooks/useBackend";
import type { UserProfileView } from "@/lib/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * Central auth hook for the app. Combines Internet Identity sign-in state with
 * the user's persisted profile so the app can gate between the sign-in screen,
 * onboarding, and the main dashboard.
 */
export function useAuth() {
  const {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    login,
    clear,
  } = useInternetIdentity();
  const { actor, isFetching } = useBackend();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfileView | null> => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && isAuthenticated && !isFetching,
  });

  const profile = profileQuery.data ?? null;
  const profileLoading = profileQuery.isLoading || isFetching;

  return {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    login,
    clear,
    profile,
    profileLoading,
    /** True once the user has completed onboarding and can enter the program. */
    isOnboarded: isAuthenticated && !!profile?.onboardingComplete,
    /** True when a signed-in user still needs to complete onboarding. */
    needsOnboarding: isAuthenticated && !profile?.onboardingComplete,
  };
}
