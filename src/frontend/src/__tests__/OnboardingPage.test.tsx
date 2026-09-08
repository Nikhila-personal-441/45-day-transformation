import { OnboardingPage } from "@/pages/OnboardingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const completeOnboarding = vi.fn();

vi.mock("@/hooks/useBackend", () => ({
  useBackend: () => ({
    actor: { completeOnboarding },
    isFetching: false,
  }),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OnboardingPage />
    </QueryClientProvider>,
  );
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    completeOnboarding.mockReset();
    completeOnboarding.mockResolvedValue({
      id: "aaaaa-aa",
      name: "Aarav",
      fitnessGoal: "loseWeight",
      startingLevel: "beginner",
      onboardingComplete: true,
    });
  });

  it("renders the onboarding form with name, goal, and level fields", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /let's set you up/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByText("Lose weight")).toBeInTheDocument();
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it("disables submit until name, goal, and level are all chosen", async () => {
    const user = userEvent.setup();
    renderPage();

    const submit = screen.getByRole("button", { name: /start my program/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/your name/i), "Aarav");
    expect(submit).toBeDisabled();

    await user.click(screen.getByText("Lose weight"));
    expect(submit).toBeDisabled();

    await user.click(screen.getByText("Beginner"));
    expect(submit).toBeEnabled();
  });

  it("calls completeOnboarding with the captured values on submit", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/your name/i), "Aarav");
    await user.click(screen.getByText("Build muscle"));
    await user.click(screen.getByText("Intermediate"));
    await user.click(screen.getByRole("button", { name: /start my program/i }));

    expect(completeOnboarding).toHaveBeenCalledWith(
      "Aarav",
      "buildMuscle",
      "intermediate",
    );
  });
});
