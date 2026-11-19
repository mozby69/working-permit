
import { MyApprovedPermitSummary } from "@repo/shared";
import {
  ClipboardList,
  Clock3,
  Activity,
  CheckCircle2,
} from "lucide-react";


type Props = {
  summary?: MyApprovedPermitSummary;
  isLoading?: boolean;
};

export function OngoingPermitSummary({
  summary,
  isLoading = false,
}: Props) {
  const cards = [
    {
      label: "My Approved Permits",
      value: summary?.total ?? 0,
      icon: ClipboardList,
      iconClass: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Not Finished",
      value: summary?.unfinished ?? 0,
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: summary?.inProgress ?? 0,
      icon: Activity,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed",
      value: summary?.completed ?? 0,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                {isLoading ? (
                  <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-100" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {card.value.toLocaleString()}
                  </p>
                )}
              </div>

              <div
                className={`rounded-xl p-3 ${card.iconClass}`}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
