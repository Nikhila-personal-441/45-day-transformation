import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { DashboardPage } from "@/pages/DashboardPage";
import { DietPage } from "@/pages/DietPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PaywallPage } from "@/pages/PaywallPage";
import { ProgramPage } from "@/pages/ProgramPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { SignInPage } from "@/pages/SignInPage";
import { WorkoutPage } from "@/pages/WorkoutPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";

/**
 * The authenticated app shell. Renders the sidebar/mobile nav and the routed
 * page content. Only mounted once the user is signed in and onboarded.
 */
function AppShell() {
  const { profile, clear } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    clear();
    navigate({ to: "/" });
  };

  return <Layout userName={profile?.name} onSignOut={handleSignOut} />;
}

const rootRoute = createRootRoute({
  component: RootGate,
});

function RootGate() {
  const { isAuthenticated, isInitializing, profileLoading, needsOnboarding } =
    useAuth();

  // Wait for auth + profile to settle before deciding which screen to show.
  if (isInitializing || profileLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gradient-primary size-12 animate-pulse rounded-xl" />
          <p className="text-muted-foreground text-sm">Loading your program…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  if (needsOnboarding) {
    return <OnboardingPage />;
  }

  return <Outlet />;
}

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppShell,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: DashboardPage,
});

const programRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/program",
  component: ProgramPage,
});

const workoutRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/workout/$dayNumber",
  component: WorkoutPage,
});

const dietRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/diet",
  component: DietPage,
});

const progressRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/progress",
  component: ProgressPage,
});

const paywallRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/paywall",
  component: PaywallPage,
});

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([
    dashboardRoute,
    programRoute,
    workoutRoute,
    dietRoute,
    progressRoute,
    paywallRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
