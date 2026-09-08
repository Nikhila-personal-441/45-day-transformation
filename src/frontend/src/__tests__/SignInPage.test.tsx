import { SignInPage } from "@/pages/SignInPage";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const login = vi.fn();

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    login,
    isLoggingIn: false,
    isLoginError: false,
  }),
}));

describe("SignInPage", () => {
  beforeEach(() => {
    login.mockReset();
  });

  it("renders the sign-in screen for signed-out users", () => {
    render(<SignInPage />);
    expect(
      screen.getByRole("heading", { name: /45-day transformation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with internet identity/i }),
    ).toBeInTheDocument();
  });

  it("calls login when the sign-in button is clicked", async () => {
    const user = userEvent.setup();
    render(<SignInPage />);
    await user.click(
      screen.getByRole("button", { name: /sign in with internet identity/i }),
    );
    expect(login).toHaveBeenCalled();
  });
});
