import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function GlassCard({
  children,
  className,
  ...rest
}: ComponentProps<"div"> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "glass card-shadow rounded-2xl p-6 transition-all hover:border-foreground/15",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("mx-auto w-full max-w-7xl px-4 py-10", className)}>{children}</section>;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="grid h-11 w-11 place-items-center rounded-xl brand-gradient text-primary-foreground glow-shadow">
            {icon}
          </div>
        )}
        <div>
          <h1
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
