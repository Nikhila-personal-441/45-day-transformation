import type { UserProgressView } from "@/lib/types";
import { ProgressPage } from "@/pages/ProgressPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const progress: UserProgressView = {
  completedDays: [1n, 2n, 3n],
  streak: 3n,
  completionPercentage: 7n,
  dailyCalorieTarget: 2000n,
  mealLogs: [
    { date: "2026-09-04", totalCalories: 1800n, items: [] },
    { date: "2026-09-05", totalCalories: 2100n, items: [] },
  ],
};

const useProgress = vi.fn();
const useProgram = vi.fn();

vi.mock("@/hooks/useProgram", () => ({
  useProgress: (...args: unknown[]) => useProgress(...args),
  useProgram: (...args: unknown[]) => useProgram(...args),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProgressPage />
    </QueryClientProvider>,
  );
}

describe("ProgressPage", () => {
  beforeEach(() => {
    useProgress.mockReturnValue({ data: progress, isLoading: false });
    useProgram.mockReturnValue({ isLoading: false });
  });

  it("shows completion history, streak, and calorie target", () => {
    renderPage();
    expect(screen.getByText("3 of 45 days")).toBeInTheDocument();
    expect(screen.getByText("day streak")).toBeInTheDocument();
    expect(screen.getByText("2,000 kcal")).toBeInTheDocument();
  });

  it("renders the completion history grid grouped by week", () => {
    renderPage();
    expect(screen.getByText("Completion History")).toBeInTheDocument();
    expect(screen.getByText("Week 1")).toBeInTheDocument();
    // Completed days render a check mark.
    expect(document.querySelector('[data-ocid="progress.day.1"]')).toBeTruthy();
  });

  it("shows the calories logged over time chart when meals exist", () => {
    renderPage();
    expect(screen.getByText("Calories Logged Over Time")).toBeInTheDocument();
    expect(screen.queryByText("No meals logged yet")).not.toBeInTheDocument();
  });

  it("shows an empty state when no meals are logged", () => {
    useProgress.mockReturnValue({
      data: { ...progress, mealLogs: [] },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText("No meals logged yet")).toBeInTheDocument();
  });
});
