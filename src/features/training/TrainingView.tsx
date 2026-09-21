"use client";

import { useState, useEffect } from "react";
import Panel from "@/components/ui/Panel";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/i18n/I18nContext";
import { GraduationCap, Users, BookOpen } from "lucide-react";

// Mock training data
const mockTrainings = [
  { id: "TR-001", title: "ISO 9001:2015 Awareness", type: "awareness", department: "quality", status: "completed", completedDate: "2026-03-15", attendees: 25 },
  { id: "TR-002", title: "Internal Audit Techniques", type: "skills", department: "quality", status: "completed", completedDate: "2026-04-20", attendees: 12 },
  { id: "TR-003", title: "Document Control Procedures", type: "compliance", department: "admin", status: "planned", plannedDate: "2026-06-01", attendees: 0 },
  { id: "TR-004", title: "Risk Management Workshop", type: "skills", department: "management", status: "in_progress", plannedDate: "2026-05-10", attendees: 8 },
  { id: "TR-005", title: "Emergency Response Drill", type: "compliance", department: "safety", status: "planned", plannedDate: "2026-07-01", attendees: 0 },
];

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

  const completed = mockTrainings.filter((t) => t.status === "completed").length;
  const planned = mockTrainings.filter((t) => t.status === "planned").length;
  const inProgress = mockTrainings.filter((t) => t.status === "in_progress").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Training Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track training programs, attendance and compliance</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 dark:bg-blue-900/30"><GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
              <div><p className="text-xs text-slate-500 dark:text-slate-400">Total Training</p><p className="text-xl font-bold text-slate-900 dark:text-white">{mockTrainings.length}</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30"><BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
              <div><p className="text-xs text-slate-500 dark:text-slate-400">Completed</p><p className="text-xl font-bold text-slate-900 dark:text-white">{completed}</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-900/30"><Users className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
              <div><p className="text-xs text-slate-500 dark:text-slate-400">Planned</p><p className="text-xl font-bold text-slate-900 dark:text-white">{planned}</p></div>
            </div>
          </div>
        </div>

        <Panel title="Training Register" subtitle="All training programs and records" className="mt-6">
          <div className="mt-4">
            <DataTable columns={columns} data={mockTrainings as unknown as Record<string, unknown>[]} searchable searchPlaceholder="Search training..." />
          </div>
        </Panel>
      </div>
    </div>
  );
}
