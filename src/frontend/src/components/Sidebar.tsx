import { NAV_ITEMS, type NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Salad,
  TrendingUp,
  Zap,
} from "lucide-react";

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  program: Dumbbell,
  workout: Zap,
  diet: Salad,
  progress: TrendingUp,
  paywall: Flame,
};

interface SidebarProps {
  userName?: string;
  onSignOut: () => void;
}

export function Sidebar({ userName, onSignOut }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside className="bg-card border-border sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="bg-gradient-primary flex size-10 items-center justify-center rounded-xl">
          <Dumbbell className="size-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-bold">45-Day</p>
          <p className="font-display text-xs font-semibold text-primary">
            Transformation
          </p>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-3"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={`nav.${item.icon}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border border-t px-3 py-4">
        {userName ? (
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="bg-gradient-primary flex size-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-muted-foreground text-xs">Member</p>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onSignOut}
          data-ocid="nav.sign_out"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="size-4.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
