import { Status, Priority, RiskLevel } from "@/types";

export const STATUS_LABELS: Record<Status, string> = {
  draft: "Draft",
  pending: "Pending",
  in_progress: "In Progress",
  due_soon: "Due Soon",
  overdue: "Overdue",
  verified: "Verified",
  closed: "Closed",
  compliant: "Compliant",
  non_compliant: "Non-Compliant",
  published: "Published",
  revision_due: "Revision Due",
  obsolete: "Obsolete",
  planned: "Planned",
  finding_recorded: "Finding Recorded",
  reported: "Reported",
  follow_up: "Follow-up",
  root_cause: "Root Cause",
  action_planned: "Action Planned",
  action_in_progress: "Action In Progress",
  applicable: "Applicable",
  pending_assessment: "Pending Assessment",
  action_required: "Action Required",
  open: "Open",
};

export const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  due_soon: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  verified: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  closed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  compliant: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  non_compliant: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  published: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  revision_due: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  obsolete: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-300" },
  planned: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  finding_recorded: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  reported: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  follow_up: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  root_cause: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  action_planned: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  action_in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  applicable: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  pending_assessment: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  action_required: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  open: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: "bg-emerald-50", text: "text-emerald-700" },
  medium: { bg: "bg-amber-50", text: "text-amber-700" },
  high: { bg: "bg-orange-50", text: "text-orange-700" },
  critical: { bg: "bg-red-50", text: "text-red-700" },
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string; cell: string }> = {
  low: { bg: "bg-emerald-50", text: "text-emerald-700", cell: "bg-emerald-400 text-emerald-950" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", cell: "bg-amber-400 text-amber-950" },
  high: { bg: "bg-orange-50", text: "text-orange-700", cell: "bg-orange-400 text-white" },
  critical: { bg: "bg-red-50", text: "text-red-700", cell: "bg-red-500 text-white" },
};

export const ISO_STANDARDS = [
  { id: "9001", code: "ISO 9001", name: "Quality Management System" },
  { id: "14001", code: "ISO 14001", name: "Environmental Management System" },
  { id: "45001", code: "ISO 45001", name: "Occupational Health & Safety" },
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Executive Dashboard", icon: "LayoutDashboard" },
  { href: "/iso-progress", label: "ISO Progress", icon: "GitBranch" },
  { href: "/documents", label: "Document Control", icon: "FileText" },
  { href: "/document-revision", label: "การแก้ไขและอนุมัติเอกสาร", icon: "FileCheck2" },
  { href: "/audits", label: "การตรวจประเมินภายใน", icon: "ClipboardCheck" },
  { href: "/ncr-car", label: "NCR / CAR", icon: "AlertTriangle" },
  { href: "/legal-compliance", label: "การประเมินความสอดคล้องกับกฎหมาย", icon: "Scale" },
  { href: "/risks", label: "Risk & Opportunity", icon: "Shield" },
  { href: "/alerts", label: "Alert & Action", icon: "Bell" },
  { href: "/training", label: "Training", icon: "GraduationCap" },
] as const;

export const DATE_FORMATS = {
  short: "dd MMM yyyy",
  long: "dd MMMM yyyy",
  iso: "yyyy-MM-dd",
  buddhist: "dd MMM yyyy (BE)",
} as const;
