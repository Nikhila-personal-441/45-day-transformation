import { PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
});

afterAll(async () => {
  await pic?.tearDown();
});

describe("45-day transformation canister", () => {
  it("answers an empty-state profile read instead of trapping", async () => {
    await expect(actor.getProfile()).resolves.toEqual([]);
  });

  it("returns the full 45-day program with data-driven days", async () => {
    const program = await actor.getProgram();
    expect(program.days).toHaveLength(45);
    // Day 1 is a workout with exercises; representative recovery/rest days exist.
    const day1 = program.days.find((d) => d.dayNumber === 1n);
    expect(day1?.dayType).toEqual({ workout: null });
    expect(day1?.exercises.length).toBeGreaterThan(0);
    expect(day1?.exercises[0].animationUrl).toContain("http");
    expect(program.days.some((d) => d.dayType.rest !== undefined)).toBe(true);
    expect(program.days.some((d) => d.dayType.recovery !== undefined)).toBe(true);
  });

  it("returns a single day and days by week", async () => {
    const day = await actor.getDay(1n);
    expect(day).toHaveLength(1);
    expect(day![0].dayNumber).toBe(1n);

    const week1 = await actor.getDaysByWeek(1n);
    expect(week1).toHaveLength(7);
  });

  it("unlocks day 1 but not day 2 before any completion", async () => {
    expect(await actor.isDayUnlocked(1n)).toBe(true);
    expect(await actor.isDayUnlocked(2n)).toBe(false);
  });

  it("round-trips onboarding through the real canister", async () => {
    const profile = await actor.completeOnboarding("Aarav", { loseWeight: null }, { beginner: null });
    expect(profile.name).toBe("Aarav");
    expect(profile.onboardingComplete).toBe(true);
    expect(await actor.getProfile()).toEqual([profile]);
  });

  it("marks a day complete and unlocks the next day", async () => {
    expect(await actor.markDayComplete(1n)).toBe(true);
    expect(await actor.isDayUnlocked(2n)).toBe(true);
    // Completing an already-complete day is idempotent.
    expect(await actor.markDayComplete(1n)).toBe(true);
    const progress = await actor.getProgress();
    expect(progress.completedDays).toContain(1n);
    expect(progress.streak).toBe(1n);
  });

  it("rejects completing a locked day", async () => {
    // Day 3 is still locked (only day 1 completed).
    expect(await actor.markDayComplete(3n)).toBe(false);
    expect(await actor.isDayUnlocked(3n)).toBe(false);
  });

  it("returns the diet plan with Indian food options", async () => {
    const plan = await actor.getDietPlan();
    expect(plan.dailyCalorieTarget).toBe(2000n);
    const names = plan.foodOptions.map((f) => f.name);
    for (const item of ["Dal", "Roti", "Rice", "Sabzi", "Paneer", "Curd"]) {
      expect(names).toContain(item);
    }
  });

  it("round-trips a meal log through the real canister", async () => {
    const log = await actor.logMeal("2026-09-06", [
      { name: "Dal", calories: 200n },
      { name: "Roti", calories: 120n },
    ]);
    expect(log.totalCalories).toBe(320n);
    expect(await actor.getCalorieLog("2026-09-06")).toEqual([log]);
    // Progress reflects the logged calories.
    const progress = await actor.getProgress();
    expect(progress.mealLogs).toHaveLength(1);
    expect(progress.mealLogs[0].totalCalories).toBe(320n);
  });

  it("activates a 90-day subscription", async () => {
    const status = await actor.activateSubscription();
    expect(status.active).toBe(true);
    expect(status.daysRemaining).toBeGreaterThan(0n);
    expect(status.daysRemaining).toBeLessThanOrEqual(90n);
    expect(await actor.getSubscriptionStatus()).toEqual(status);
  });
});
