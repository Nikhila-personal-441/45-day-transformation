import { type Backend, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Provides the authenticated backend actor for the 45-Day Transformation
 * canister. Returns `null` while the actor is being created or when the user
 * is signed out.
 */
export function useBackend(): { actor: Backend | null; isFetching: boolean } {
  return useActor(createActor);
}
