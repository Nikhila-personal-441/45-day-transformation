import type { DietPlan } from "@/lib/types";
import { DietPage } from "@/pages/DietPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dietPlan: DietPlan = {
  dailyCalorieTarget: 2000n,
  foodOptions: [
    { name: "Dal", calories: 200n },
    { name: "Roti", calories: 120n },
    { name: "Rice", calories: 200n },
    { name: "Sabzi", calories: 150n },
    { name: "Paneer", calories: 250n },
    { name: "Curd", calories: 100n },
  ],
};

const useDietPlan = vi.fn();
const useProgress = vi.fn();
const useCalorieLog = vi.fn();
const useLogMeal = vi.fn();
const logMeal = { mutate: vi.fn(), isPending: false };

vi.mock("@/hooks/useProgram", () => ({
  useDietPlan: (...args: unknown[]) => useDietPlan(...args),
  useProgress: (...args: unknown[]) => useProgress(...args),
  useCalorieLog: (...args: unknown[]) => useCalorieLog(...args),
  useLogMeal: (...args: unknown[]) => useLogMeal(...args),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DietPage />
    </QueryClientProvider>,
  );
}

describe("DietPage", () => {
  beforeEach(() => {
    useDietPlan.mockReturnValue({ data: dietPlan, isLoading: false });
    useProgress.mockReturnValue({ data: { dailyCalorieTarget: 2000n } });
    useCalorieLog.mockReturnValue({ data: null });
    useLogMeal.mockReturnValue(logMeal);
    logMeal.mutate.mockReset();
  });

  it("shows the daily calorie target and Indian food options with calories", () => {
    renderPage();
    expect(screen.getAllByText("2000 kcal").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dal").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Roti").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paneer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Curd").length).toBeGreaterThan(0);
  });

  it("logs selected meals against the calorie target", async () => {
    const user = userEvent.setup();
    renderPage();

    // Add Dal and Roti.
    await user.click(screen.getAllByRole("button", { name: /add/i })[0]);
    await user.click(screen.getAllByRole("button", { name: /add/i })[1]);

    expect(screen.getByText("2 items selected")).toBeInTheDocument();
    expect(screen.getByText("320 kcal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /log meals/i }));
    expect(logMeal.mutate).toHaveBeenCalledWith({
      date: expect.any(String),
      items: [
        { name: "Dal", calories: 200n },
        { name: "Roti", calories: 120n },
      ],
    });
  });

  it("shows logged meals from the calorie log", () => {
    useCalorieLog.mockReturnValue({
      data: {
        date: "2026-09-06",
        totalCalories: 320n,
        items: [
          { name: "Dal", calories: 200n },
          { name: "Roti", calories: 120n },
        ],
      },
    });
    renderPage();
    expect(screen.getAllByText("Dal").length).toBeGreaterThan(0);
    expect(screen.getAllByText("200 kcal").length).toBeGreaterThan(0);
  });
});
