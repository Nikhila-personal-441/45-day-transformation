import { NAV_ITEMS, type NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  type LucideIcon,
  Salad,
  TrendingUp,
} from "lucide-react";

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  program: Dumbbell,
  workout: Dumbbell,
  diet: Salad,
  progress: TrendingUp,
  paywall: Flame,
};

export function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="bg-card border-border fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
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
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
