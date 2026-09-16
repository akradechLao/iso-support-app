import { Status, Priority, FilterState } from "@/types";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStatusColor(status: Status): string {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    pending: "bg-amber-50 text-amber-700",
    in_progress: "bg-blue-50 text-blue-700",
    due_soon: "bg-orange-50 text-orange-700",
    overdue: "bg-red-50 text-red-700",
    verified: "bg-emerald-50 text-emerald-700",
    closed: "bg-emerald-50 text-emerald-700",
    compliant: "bg-emerald-50 text-emerald-700",
    non_compliant: "bg-red-50 text-red-700",
    published: "bg-emerald-50 text-emerald-700",
    revision_due: "bg-amber-50 text-amber-700",
    obsolete: "bg-slate-100 text-slate-500",
    planned: "bg-blue-50 text-blue-700",
    finding_recorded: "bg-orange-50 text-orange-700",
    reported: "bg-amber-50 text-amber-700",
    follow_up: "bg-violet-50 text-violet-700",
    root_cause: "bg-orange-50 text-orange-700",
    action_planned: "bg-blue-50 text-blue-700",
    action_in_progress: "bg-blue-50 text-blue-700",
    applicable: "bg-blue-50 text-blue-700",
    pending_assessment: "bg-amber-50 text-amber-700",
    action_required: "bg-red-50 text-red-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-orange-50 text-orange-700",
    critical: "bg-red-50 text-red-700",
  };
  return map[priority];
}

export function getRiskColor(score: number): string {
  if (score >= 15) return "bg-red-500 text-white";
  if (score >= 10) return "bg-orange-400 text-white";
  if (score >= 5) return "bg-amber-400 text-amber-950";
  return "bg-emerald-400 text-emerald-950";
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 15) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function createFilterParams(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.standard && filters.standard !== "all") params.set("standard", filters.standard);
  if (filters.department && filters.department !== "all") params.set("department", filters.department);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.period && filters.period !== "all") params.set("period", filters.period);
  return params.toString();
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
