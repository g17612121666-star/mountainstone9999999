import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        world: "bg-moss/12 text-moss",
        national: "bg-sand/12 text-sand",
        candidate: "bg-border text-muted",
        gssp: "bg-hematite/12 text-hematite",
        iugs: "bg-slate/12 text-slate",
        urban: "bg-slate/10 text-slate",
        muted: "bg-surface-2 text-muted",
        tick: "bg-hematite/10 text-hematite",
        free: "bg-moss/10 text-moss",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
