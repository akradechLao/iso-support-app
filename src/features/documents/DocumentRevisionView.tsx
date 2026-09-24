"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { documentRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import { users } from "@/data/mock/users";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import DonutChart from "@/components/charts/DonutChart";
import { DocumentRecord } from "@/types";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, FileText, ExternalLink } from "lucide-react";
import { resolveDccUrl } from "@/lib/dcc";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/i18n/I18nContext";

export default function DocumentRevisionView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => documentRepo.getKpis(filters), [filters]);
  const allDocuments = useMemo(() => documentRepo.findAll(filters), [filters]);

  const queueDocuments = useMemo(
    () =>
      allDocuments.filter(
        (d) => d.status === "revision_due" || d.approvalStatus === "pending" || d.status === "draft"
      ),
    [allDocuments]
  );

  const donutData = useMemo(
    () => [
      { name: t.dashboard.effectiveLabel, value: kpis.active, color: "#10b981" },
      {
        name: t.dashboard.draftLabel,
        value: Math.max(kpis.total - kpis.active - kpis.dueReview - kpis.pendingApproval - kpis.obsolete, 0),
        color: "#94a3b8",
      },
      { name: t.dashboard.reviewLabel, value: kpis.dueReview, color: "#3b82f6" },
      { name: t.dashboard.approveLabel, value: kpis.pendingApproval, color: "#f59e0b" },
      { name: t.dashboard.obsoleteLabel, value: kpis.obsolete, color: "#64748b" },
    ],
    [kpis, t]
  );

  const columns: Column<DocumentRecord>[] = [
    { key: "code", header: t.documents.documentId, sortable: true },
    { key: "title", header: t.documents.title_col, sortable: true },
    { key: "type", header: t.documents.type, sortable: true },
    {
      key: "departmentId",
      header: t.documents.department,
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    { key: "revision", header: t.documents.revision },
    {
      key: "status",
      header: t.documents.status,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "ownerId",
      header: t.documents.owner,
      render: (item) => users.find((u) => u.id === item.ownerId)?.name || item.ownerId,
    },
    { key: "reviewDate", header: t.documents.reviewDate, sortable: true },
    {
      key: "approvalStatus",
      header: t.documents.approval,
      render: (item) => <StatusBadge status={item.approvalStatus} />,
    },
    {
      key: "dccPath",
      header: "DCC",
      render: (item) => {
        const href = resolveDccUrl(item.dccPath);
        if (!href) return <span className="text-[11px] text-slate-400">—</span>;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
          >
            <ExternalLink className="h-3 w-3" />
            {t.documents.openDcc}
          </a>
        );
      },
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  const statBoxes = [
    {
      label: t.dashboard.dueReviewHeader,
      value: kpis.dueReview,
      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
    },
    {
      label: t.documents.pendingApproval,
      value: kpis.pendingApproval,
      color: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-800",
    },
    {
      label: t.documents.overdueReview,
      value: kpis.overdueReview,
      color: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: t.documents.active,
      value: kpis.active,
      color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: t.documents.totalDocuments,
      value: kpis.total,
      color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      label: t.documents.obsolete,
      value: kpis.obsolete,
      color: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
    },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <div className="mx-auto">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.dashboard.title}
        </Link>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {t.dashboard.documentRevisionTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dashboard.documentRevisionSub}
              </p>
            </div>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            {t.nav.documents}
          </Link>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {statBoxes.map((s) => (
            <div key={s.label} className={`rounded-lg border ${s.border} ${s.color} p-2.5`}>
              <p className="text-[11px] font-medium opacity-80 leading-tight">{s.label}</p>
              <p className="mt-0.5 text-xl font-bold leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.dashboard.documentStatus}
            </p>
            <div className="flex items-center justify-center">
              <DonutChart
                data={donutData}
                centerLabel={String(kpis.total)}
                centerSubLabel={t.dashboard.totalHeader}
                showLegend={false}
                height={200}
              />
            </div>
            <p className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
              ⚠ {t.dashboard.warningDocReview}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.documents.documentRegister}
            </p>
            <div className="space-y-2">
              {[
                {
                  icon: <Clock className="h-4 w-4" />,
                  label: t.dashboard.dueReviewHeader,
                  count: kpis.dueReview,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-900/30",
                },
                {
                  icon: <FileText className="h-4 w-4" />,
                  label: t.documents.pendingApproval,
                  count: kpis.pendingApproval,
                  color: "text-orange-600 dark:text-orange-400",
                  bg: "bg-orange-50 dark:bg-orange-900/30",
                },
                {
                  icon: <AlertTriangle className="h-4 w-4" />,
                  label: t.documents.overdueReview,
                  count: kpis.overdueReview,
                  color: "text-red-600 dark:text-red-400",
                  bg: "bg-red-50 dark:bg-red-900/30",
                },
                {
                  icon: <CheckCircle className="h-4 w-4" />,
                  label: t.documents.active,
                  count: kpis.active,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-900/30",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg p-1.5 ${item.bg} ${item.color}`}>{item.icon}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.documentRevision.queueTitle}
            </p>
          </div>
          <div className="p-3">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={queueDocuments as unknown as Record<string, unknown>[]}
              onRowClick={(item) =>
                router.push(`/documents/${(item as unknown as DocumentRecord).id}`)
              }
              searchPlaceholder={t.documents.searchDocuments}
              emptyMessage={t.documentRevision.emptyQueue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
