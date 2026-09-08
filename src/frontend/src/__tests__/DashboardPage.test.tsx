import { DayType } from "@/backend";
import type { Day, Program, UserProgressView } from "@/lib/types";
import { DashboardPage } from "@/pages/DashboardPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const program: Program = {
  days: [
    { dayNumber: 1n, dayType: DayType.workout, week: 1n, exercises: [] },
    { dayNumber: 2n, dayType: DayType.workout, week: 1n, exercises: [] },
    { dayNumber: 3n, dayType: DayType.recovery, week: 1n, exercises: [] },
    { dayNumber: 4n, dayType: DayType.workout, week: 1n, exercises: [] },
    { dayNumber: 5n, dayType: DayType.workout, week: 1n, exercises: [] },
    { dayNumber: 6n, dayType: DayType.rest, week: 1n, exercises: [] },
    { dayNumber: 7n, dayType: DayType.recovery, week: 1n, exercises: [] },
    { dayNumber: 8n, dayType: DayType.workout, week: 2n, exercises: [] },
  ],
};

const progress: UserProgressView = {
  completedDays: [1n],
  streak: 1n,
  completionPercentage: 12n,
  dailyCalorieTarget: 2000n,
  mealLogs: [],
};

const useProgram = vi.fn();
const useProgress = vi.fn();
const useDay = vi.fn();
const useIsDayUnlocked = vi.fn();
const useAuth = vi.fn();

vi.mock("@/hooks/useProgram", () => ({
  useProgram: (...args: unknown[]) => useProgram(...args),
  useProgress: (...args: unknown[]) => useProgress(...args),
  useDay: (...args: unknown[]) => useDay(...args),
  useIsDayUnlocked: (...args: unknown[]) => useIsDayUnlocked(...args),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: (...args: unknown[]) => useAuth(...args),
}));

vi.mock("@tanstack/react-router", () => ({
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
      <DashboardPage />
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    useProgram.mockReturnValue({ data: program, isLoading: false });
    useProgress.mockReturnValue({ data: progress, isLoading: false });
    useAuth.mockReturnValue({ profile: { name: "Aarav" } });
    // currentDayNumber is the first incomplete day (2), which is unlocked.
    useDay.mockReturnValue({
      data: {
        dayNumber: 2n,
        dayType: DayType.workout,
        week: 1n,
        exercises: [],
      } as Day,
      isLoading: false,
    });
    useIsDayUnlocked.mockReturnValue({ data: true, isLoading: false });
  });

  it("renders the 45-day program grid grouped by week", () => {
    renderPage();
    expect(screen.getByText("45-Day Program")).toBeInTheDocument();
    expect(screen.getByText("Week 1")).toBeInTheDocument();
    expect(screen.getByText("Week 2")).toBeInTheDocument();
  });

  it("marks day 1 as complete and day 2 as the current unlocked day", () => {
    renderPage();
    // Day 1 is complete (shows a check), day 2 is current ("Today").
    expect(screen.getByText("Today")).toBeInTheDocument();
    // Day 1 shows the completion check icon.
    expect(
      document.querySelector('[data-ocid="dashboard.day.1"]'),
    ).toBeTruthy();
  });

  it("renders locked days as visually distinct and non-navigable", () => {
    renderPage();
    // Day 8 (week 2) is locked because day 7 is not complete.
    const day8 = document.querySelector('[data-ocid="dashboard.day.8"]');
    expect(day8).toBeTruthy();
    // Locked days render as a div (not a link) with a lock icon.
    expect(day8!.tagName).toBe("DIV");
    expect(day8!.querySelector("svg")).toBeTruthy();
  });

  it("shows the completion stats from progress", () => {
    renderPage();
    expect(screen.getByText("1 of 8 days done")).toBeInTheDocument();
    expect(screen.getByText("day in a row")).toBeInTheDocument();
  });
});
