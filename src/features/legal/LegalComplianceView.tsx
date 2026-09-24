"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { legalRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import KPICard from "@/components/ui/KPICard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import DonutChart from "@/components/charts/DonutChart";
import Modal from "@/components/ui/Modal";
import { LegalRequirement, Status } from "@/types";
import { Scale, CheckCircle, XCircle, Clock, Download, Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/i18n/I18nContext";
import { LEGAL_TYPES } from "@/lib/constants";
import { downloadCsv } from "@/lib/export";

export default function LegalComplianceView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({
    law: "",
    type: "Labor Law",
    departmentId: "HR",
    status: "pending_assessment" as Status,
    description: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => legalRepo.getKpis(filters), [filters, version]);
  const legal = useMemo(() => legalRepo.findAll(filters), [filters, version]);

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

  const donutData = useMemo(
    () => [
      { name: t.legal.compliant, value: kpis.comply, color: "#10b981" },
      { name: t.legal.nonCompliant, value: kpis.nonComply, color: "#ef4444" },
      { name: t.legal.pendingAssessment, value: kpis.pending, color: "#f59e0b" },
    ],
    [kpis, t],
  );

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

  const handleCreate = () => {
    if (!form.law.trim()) return;
    legalRepo.create({
      law: form.law.trim(),
      type: form.type,
      departmentId: form.departmentId,
      status: form.status,
      description: form.description.trim(),
    });
    setShowAdd(false);
    setVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          ← กลับไป Dashboard
        </Link>

        {/* Section Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">5 · การประเมินความสอดคล้องกับกฎหมาย — Legal Compliance</h1>
                <p className="mt-0.5 text-sm text-blue-100">{t.legal.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
              <button
                onClick={() =>
                  downloadCsv(
                    "legal-compliance",
                    ["ID", "Law", "Type", "Department", "Status", "Description"],
                    legal.map((l) => [l.id, l.law, l.type, l.departmentId, l.status, l.description])
                  )
                }
                className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 backdrop-blur transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {t.common.export}
              </button>
              <button
                onClick={() => {
                  setForm({ law: "", type: "Labor Law", departmentId: "HR", status: "pending_assessment", description: "" });
                  setShowAdd(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.common.addNew}
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stat Boxes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <KPICard title={t.legal.totalRequirements} value={kpis.total} href="/legal-compliance" icon={<Scale className="h-6 w-6" />} />
          <KPICard title={t.legal.compliant} value={kpis.comply} status="good" icon={<CheckCircle className="h-6 w-6" />} />
          <KPICard title={t.legal.nonCompliant} value={kpis.nonComply} status={kpis.nonComply > 0 ? "danger" : "good"} icon={<XCircle className="h-6 w-6" />} />
          <KPICard title={t.legal.pendingAssessment} value={kpis.pending} status="warning" icon={<Clock className="h-6 w-6" />} />
          <KPICard title={t.legal.complianceRate} value={`${kpis.complianceRate}%`} status={kpis.complianceRate >= 90 ? "good" : "warning"} icon={<Scale className="h-6 w-6" />} />
        </div>

        {/* Donut + Compliance by Type */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Donut Chart */}
          <Panel title={t.legal.overallComplianceStatus} subtitle={t.legal.summaryOfAllRequirements}>
            <div className="flex flex-col items-center gap-6 py-4 sm:flex-row">
              <div className="h-52 w-52 shrink-0">
                <DonutChart data={donutData} showLegend={false} height={208} centerLabel={`${kpis.complianceRate}%`} />
              </div>
              <div className="grid flex-1 grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-2">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{kpis.comply}</p>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t.legal.compliant}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/30 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <div>
                    <p className="text-lg font-black text-red-700 dark:text-red-300">{kpis.nonComply}</p>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">{t.legal.nonCompliant}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-lg font-black text-amber-700 dark:text-amber-300">{kpis.pending}</p>
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t.legal.pendingAssessment}</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Compliance by Type */}
          <Panel title={t.legal.complianceByLawType} subtitle={t.legal.breakdownByCategory}>
            <div className="mt-3 space-y-3">
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
        </div>

        {/* Legal Register Table */}
        <Panel title={t.legal.legalRegister} subtitle={t.legal.allLegalRequirements}>
          <div className="mt-3">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={legal as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/legal-compliance/${(item as unknown as LegalRequirement).id}`)}
              searchPlaceholder={t.legal.searchLegal}
            />
          </div>
        </Panel>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t.legal.newRequirementTitle} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.legal.lawRegulation} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.law}
              onChange={(e) => setForm({ ...form, law: e.target.value })}
              placeholder="เช่น พระราชบัญญัติ..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.legal.type}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {LEGAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.legal.department}</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.legal.status}</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="pending_assessment">{t.legal.pendingAssessment}</option>
              <option value="compliant">{t.legal.compliant}</option>
              <option value="non_compliant">{t.legal.nonCompliant}</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.legal.description}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => setShowAdd(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.law.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <CheckCircle className="h-4 w-4" />
            {t.common.save}
          </button>
        </div>
      </Modal>
    </div>
  );
}
