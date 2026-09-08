import { Construction, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Temporary shell for pages whose bodies are built by dedicated page tasks.
 * Renders a consistent, intentional view within the app shell so every route
 * is reachable while the foundation is in place.
 */
export function PagePlaceholder({
  title,
  description,
  icon: Icon,
}: PagePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center"
    >
      <div className="bg-secondary flex size-14 items-center justify-center rounded-2xl">
        <Icon className="size-7 text-primary" />
      </div>
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Construction className="size-4" />
        This section is being built
      </div>
    </motion.div>
  );
}
