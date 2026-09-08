import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { Outlet } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

interface LayoutProps {
  userName?: string;
  onSignOut: () => void;
}

/**
 * The authenticated app shell. Renders the desktop sidebar, a mobile bottom
 * nav, a top header, and the routed page content via <Outlet />.
 */
export function Layout({ userName, onSignOut }: LayoutProps) {
  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar userName={userName} onSignOut={onSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card border-border sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:px-8">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="bg-gradient-primary flex size-8 items-center justify-center rounded-lg">
              <Dumbbell className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">
              45-Day Transformation
            </span>
          </div>
          <div className="hidden text-sm text-muted-foreground lg:block">
            Your 45-day journey to a stronger you
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gradient-primary rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
              Day 1 of 45
            </span>
          </div>
        </header>

        <main className="bg-background flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>

        <footer className="border-border hidden border-t px-8 py-6 text-center text-xs text-muted-foreground lg:block">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      <MobileNav />
    </div>
  );
}
