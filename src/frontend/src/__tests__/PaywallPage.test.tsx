import { PaywallPage } from "@/pages/PaywallPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useSubscriptionStatus = vi.fn();
const useActivateSubscription = vi.fn();
const activate = { mutate: vi.fn(), isPending: false, isError: false };

vi.mock("@/hooks/useProgram", () => ({
  useSubscriptionStatus: (...args: unknown[]) => useSubscriptionStatus(...args),
  useActivateSubscription: (...args: unknown[]) =>
    useActivateSubscription(...args),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PaywallPage />
    </QueryClientProvider>,
  );
}

describe("PaywallPage", () => {
  beforeEach(() => {
    useSubscriptionStatus.mockReturnValue({
      data: { active: false, daysRemaining: 0n, startTime: 0n, endTime: 0n },
      isLoading: false,
      isError: false,
    });
    useActivateSubscription.mockReturnValue(activate);
    activate.mutate.mockReset();
  });

  it("shows the free preview and upgrade prompt when not subscribed", () => {
    renderPage();
    expect(screen.getByText(/try the first 3 days free/i)).toBeInTheDocument();
    expect(screen.getByText(/days 4–45 are locked/i)).toBeInTheDocument();
    expect(screen.getByText("90-day access")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unlock full program/i }),
    ).toBeInTheDocument();
  });

  it("activates the subscription on upgrade", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      screen.getByRole("button", { name: /unlock full program/i }),
    );
    expect(activate.mutate).toHaveBeenCalled();
  });

  it("shows the active banner with days remaining when subscribed", () => {
    useSubscriptionStatus.mockReturnValue({
      data: { active: true, daysRemaining: 88n, startTime: 0n, endTime: 0n },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByText("Subscription active")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("days left")).toBeInTheDocument();
  });
});
