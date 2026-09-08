import { DayType } from "@/backend";
import type { Day } from "@/lib/types";
import { WorkoutPage } from "@/pages/WorkoutPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const day: Day = {
  dayNumber: 1n,
  dayType: DayType.workout,
  week: 1n,
  exercises: [
    {
      name: "Squats",
      animationUrl: "https://example.com/animations/Squats.mp4",
      durationSec: 45n,
      reps: 15n,
      restSec: 30n,
    },
    {
      name: "Push-ups",
      animationUrl: "https://example.com/animations/Push-ups.mp4",
      durationSec: 45n,
      reps: 12n,
      restSec: 30n,
    },
  ],
};

const useDay = vi.fn();
const useIsDayUnlocked = vi.fn();
const useSubscriptionStatus = vi.fn();
const useProgress = vi.fn();
const useMarkDayComplete = vi.fn();
const markComplete = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
};
const useParams = vi.fn();

vi.mock("@/hooks/useProgram", () => ({
  useDay: (...args: unknown[]) => useDay(...args),
  useIsDayUnlocked: (...args: unknown[]) => useIsDayUnlocked(...args),
  useSubscriptionStatus: (...args: unknown[]) => useSubscriptionStatus(...args),
  useProgress: (...args: unknown[]) => useProgress(...args),
  useMarkDayComplete: (...args: unknown[]) => useMarkDayComplete(...args),
}));

vi.mock("@tanstack/react-router", () => ({
  useParams: (...args: unknown[]) => useParams(...args),
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WorkoutPage />
    </QueryClientProvider>,
  );
}

describe("WorkoutPage", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ dayNumber: "1" });
    useDay.mockReturnValue({ data: day, isLoading: false });
    useIsDayUnlocked.mockReturnValue({ data: true, isLoading: false });
    useSubscriptionStatus.mockReturnValue({
      data: { active: true },
      isLoading: false,
    });
    useProgress.mockReturnValue({ data: { streak: 1n, completedDays: [] } });
    useMarkDayComplete.mockReturnValue(markComplete);
    markComplete.mutate.mockReset();
  });

  it("renders the ordered exercise list with durations, reps, and rest", () => {
    renderPage();
    expect(screen.getAllByText("Squats").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Push-ups").length).toBeGreaterThan(0);
    expect(screen.getByText(/45s · 15 reps · 30s rest/)).toBeInTheDocument();
  });

  it("starts the player and shows the timer", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /start workout/i }));
    // Timer shows the first exercise's duration.
    expect(screen.getByText("00:45")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("skips to the next exercise", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /start workout/i }));
    await user.click(screen.getByRole("button", { name: /skip/i }));
    // Skipping the first exercise advances to the second (shown in the player header).
    expect(
      screen.getByRole("heading", { name: "Push-ups" }),
    ).toBeInTheDocument();
  });

  it("shows the Mark Complete action after finishing and persists completion", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /start workout/i }));
    // Skip through both exercises to reach the done phase.
    await user.click(screen.getByRole("button", { name: /skip/i }));
    await user.click(screen.getByRole("button", { name: /skip/i }));
    expect(screen.getByText("Session complete!")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /mark complete/i }));
    expect(markComplete.mutate).toHaveBeenCalledWith(1n);
  });

  it("gates days beyond the free preview behind the paywall", () => {
    useParams.mockReturnValue({ dayNumber: "4" });
    useDay.mockReturnValue({
      data: { ...day, dayNumber: 4n },
      isLoading: false,
    });
    useSubscriptionStatus.mockReturnValue({
      data: { active: false },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText(/unlock day 4/i)).toBeInTheDocument();
    expect(screen.getByText(/upgrade now/i)).toBeInTheDocument();
  });

  it("shows a locked state for an un-unlocked day", () => {
    useIsDayUnlocked.mockReturnValue({ data: false, isLoading: false });
    renderPage();
    expect(screen.getByText(/day 1 is locked/i)).toBeInTheDocument();
  });
});
