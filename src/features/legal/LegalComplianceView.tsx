"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { legalRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { LegalRequirement } from "@/types";
import { Scale, CheckCircle, XCircle, Clock, Download, Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/i18n/I18nContext";

export default function LegalComplianceView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => legalRepo.getKpis(filters), [filters]);
  const legal = useMemo(() => legalRepo.findAll(filters), [filters]);

  const byType = useMemo(() => {
    const map: Record<string, { total: number; comply: number }> = {};
    legal.forEach((l) => {
      if (!map[l.type]) map[l.type] = { total: 0, comply: 0 };
      map[l.type].total++;
      if (l.status === "compliant") map[l.type].comply++;
    });
    return Object.entries(map).map(([type, data]) => ({
      type,
      ...data,
      rate: data.total > 0 ? Math.round((data.comply / data.total) * 100) : 0,
    }));
  }, [legal]);

  const columns: Column<LegalRequirement>[] = [
    { key: "id", header: t.legal.id, sortable: true },
    { key: "law", header: t.legal.lawRegulation, sortable: true },
    { key: "type", header: t.legal.type, sortable: true },
    {
      key: "departmentId",
      header: t.legal.department,
      render: (item) => departments.find((d) => d.id === item.departmentId)?.name || item.departmentId,
    },
    {
      key: "status",
      header: t.legal.status,
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{t.legal.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.legal.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Download className="h-4 w-4" />
              {t.common.export}
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t.common.addNew}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard title={t.legal.totalRequirements} value={kpis.total} href="/legal-compliance" icon={<Scale className="h-6 w-6" />} />
          <KPICard title={t.legal.compliant} value={kpis.comply} status="good" icon={<CheckCircle className="h-6 w-6" />} />
          <KPICard title={t.legal.nonCompliant} value={kpis.nonComply} status={kpis.nonComply > 0 ? "danger" : "good"} icon={<XCircle className="h-6 w-6" />} />
          <KPICard title={t.legal.pendingAssessment} value={kpis.pending} status="warning" icon={<Clock className="h-6 w-6" />} />
          <KPICard title={t.legal.complianceRate} value={`${kpis.complianceRate}%`} status={kpis.complianceRate >= 90 ? "good" : "warning"} icon={<Scale className="h-6 w-6" />} />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {/* Compliance by Type */}
          <Panel title={t.legal.complianceByLawType} subtitle={t.legal.breakdownByCategory}>
            <div className="mt-4 space-y-4">
              {byType.map((item) => (
                <div key={item.type}>
                  <ProgressBar
                    label={`${item.type} (${item.comply}/${item.total})`}
                    value={item.rate}
                    color={item.rate >= 90 ? "#10b981" : item.rate >= 70 ? "#f59e0b" : "#ef4444"}
                  />
                </div>
              ))}
            </div>
          </Panel>

          {/* Overall Status */}
          <Panel title={t.legal.overallComplianceStatus} subtitle={t.legal.summaryOfAllRequirements}>
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4 text-center">
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{kpis.comply}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">{t.legal.compliant}</p>
                </div>
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 text-center">
                  <p className="text-3xl font-black text-red-700 dark:text-red-300">{kpis.nonComply}</p>
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{t.legal.nonCompliant}</p>
                </div>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 p-4 text-center">
                  <p className="text-3xl font-black text-amber-700 dark:text-amber-300">{kpis.pending}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">{t.legal.pendingAssessment}</p>
                </div>
              </div>
              <div className="mt-6">
                <ProgressBar
                  label={t.legal.overallComplianceRate}
                  value={kpis.complianceRate}
                  color="#10b981"
                  size="lg"
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* Legal Register Table */}
        <Panel title={t.legal.legalRegister} subtitle={t.legal.allLegalRequirements} className="mt-6">
          <div className="mt-4">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={legal as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/legal-compliance/${(item as unknown as LegalRequirement).id}`)}
              searchPlaceholder={t.legal.searchLegal}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
