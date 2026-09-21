"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/i18n/I18nContext";
import { GraduationCap, Users, BookOpen, TrendingUp } from "lucide-react";

const mockTrainings = [
  { id: "TR-001", title: "ISO 9001:2015 Awareness", type: "awareness", department: "quality", status: "completed", completedDate: "2026-03-15", attendees: 25 },
  { id: "TR-002", title: "Internal Audit Techniques", type: "skills", department: "quality", status: "completed", completedDate: "2026-04-20", attendees: 12 },
  { id: "TR-003", title: "Document Control Procedures", type: "compliance", department: "admin", status: "planned", plannedDate: "2026-06-01", attendees: 0 },
  { id: "TR-004", title: "Risk Management Workshop", type: "skills", department: "management", status: "in_progress", plannedDate: "2026-05-10", attendees: 8 },
  { id: "TR-005", title: "Emergency Response Drill", type: "compliance", department: "safety", status: "planned", plannedDate: "2026-07-01", attendees: 0 },
];

const statBox = "rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm transition hover:shadow-md";
const statIcon = "grid h-9 w-9 place-items-center rounded-lg shrink-0";
const statLabel = "text-[11px] font-medium text-slate-500 dark:text-slate-400";
const statValue = "text-lg font-bold text-slate-900 dark:text-white";

export default function TrainingView() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const columns: Column[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "title", header: "Title", sortable: true },
    { key: "type", header: "Type", sortable: true },
    { key: "department", header: "Department", sortable: true },
    { key: "status", header: "Status", render: (item: Record<string, unknown>) => <StatusBadge status={item.status as any} /> },
    { key: "attendees", header: "Attendees", sortable: true },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  const total = mockTrainings.length;
  const completed = mockTrainings.filter((t) => t.status === "completed").length;
  const planned = mockTrainings.filter((t) => t.status === "planned").length;
  const inProgress = mockTrainings.filter((t) => t.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px] space-y-5">
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition">
          &larr; กลับไป Dashboard
        </Link>

        {/* Section Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 shadow-lg">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
          <h1 className="relative text-xl sm:text-2xl font-bold tracking-tight text-white">
            8 · การฝึกอบรม — Training &amp; Competency
          </h1>
          <p className="relative mt-1 text-xs text-blue-100">ติดตามแผนการฝึกอบรม สถานะ และจำนวนผู้เข้าร่วม</p>
        </div>

        {/* Stat Boxes */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className={`${statBox} border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40`}>
            <div className={`${statIcon} bg-blue-100 dark:bg-blue-900/50`}>
              <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={statLabel}>Total</p>
              <p className={statValue}>{total}</p>
            </div>
          </div>

          <div className={`${statBox} border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40`}>
            <div className={`${statIcon} bg-emerald-100 dark:bg-emerald-900/50`}>
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className={statLabel}>Completed</p>
              <p className={statValue}>{completed}</p>
            </div>
          </div>

          <div className={`${statBox} border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40`}>
            <div className={`${statIcon} bg-amber-100 dark:bg-amber-900/50`}>
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className={statLabel}>Planned</p>
              <p className={statValue}>{planned}</p>
            </div>
          </div>

          <div className={`${statBox} border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40`}>
            <div className={`${statIcon} bg-violet-100 dark:bg-violet-900/50`}>
              <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className={statLabel}>In Progress</p>
              <p className={statValue}>{inProgress}</p>
            </div>
          </div>
        </div>

        {/* Training Register Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Training Register</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">All training programs and records</p>
          </div>
          <div className="p-4">
            <DataTable columns={columns} data={mockTrainings as unknown as Record<string, unknown>[]} searchable searchPlaceholder="Search training..." />
          </div>
        </div>
      </div>
    </div>
  );
}
