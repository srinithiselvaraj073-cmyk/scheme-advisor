import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { EligibilityStatus } from "@/lib/eligibility";

const MAP: Record<
  EligibilityStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  eligible: {
    label: "Eligible",
    icon: CheckCircle2,
    className: "bg-success/15 text-success border-success/40",
  },
  potentially_eligible: {
    label: "Potentially eligible",
    icon: HelpCircle,
    className: "bg-warning/15 text-warning border-warning/40",
  },
  not_eligible: {
    label: "Not eligible",
    icon: XCircle,
    className: "bg-destructive/15 text-destructive border-destructive/40",
  },
};

export function StatusPill({ status }: { status: EligibilityStatus }) {
  const config = MAP[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
