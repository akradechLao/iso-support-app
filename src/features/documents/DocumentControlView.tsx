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
import Modal from "@/components/ui/Modal";
import { DocumentRecord, Status } from "@/types";
import { FileText, Clock, CheckCircle, AlertTriangle, ArrowLeft, Plus, ExternalLink } from "lucide-react";
import { resolveDccUrl, hasDccLink } from "@/lib/dcc";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/i18n/I18nContext";

const DOC_TYPES = ["Manual", "Work Instruction", "Form", "Policy"];

export default function DocumentControlView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState({
    code: "",
    title: "",
    type: "Work Instruction",
    departmentId: "QA",
    revision: "Rev 1.0",
    ownerId: "U001",
    reviewDate: "",
    status: "draft" as Status,
    approvalStatus: "draft" as Status,
    dccPath: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => documentRepo.getKpis(filters), [filters, version]);
  const documents = useMemo(() => documentRepo.findAll(filters), [filters, version]);

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
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
          >
            <ExternalLink className="h-3 w-3" />
            {t.documents.openDcc}
          </a>
        );
      },
    },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  const openAdd = () => {
    setForm({
      code: "",
      title: "",
      type: "Work Instruction",
      departmentId: "QA",
      revision: "Rev 1.0",
      ownerId: "U001",
      reviewDate: "",
      status: "draft",
      approvalStatus: "draft",
      dccPath: "",
    });
    setShowAdd(true);
  };

  const handleCreate = () => {
    if (!form.code.trim() || !form.title.trim()) return;
    documentRepo.create({
      code: form.code.trim(),
      title: form.title.trim(),
      type: form.type,
      departmentId: form.departmentId,
      revision: form.revision.trim() || "Rev 1.0",
      status: form.status,
      ownerId: form.ownerId,
      reviewDate: form.reviewDate,
      approvalStatus: form.approvalStatus,
      clauseIds: [],
      dccPath: form.dccPath.trim(),
    });
    setShowAdd(false);
    setVersion((v) => v + 1);
  };

  const statusData = [
    { name: "Effective", value: kpis.active, color: "#22c55e" },
    { name: "Draft", value: kpis.dueReview, color: "#3b82f6" },
    { name: "Review", value: kpis.pendingApproval, color: "#f59e0b" },
    { name: "Approve", value: kpis.pendingApproval, color: "#f97316" },
    { name: "Obsolete", value: kpis.obsolete, color: "#94a3b8" },
  ];

  const statBoxes = [
    { label: t.documents.totalDocuments, value: kpis.total, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
    { label: t.documents.active, value: kpis.active, color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    { label: t.documents.dueReview, value: kpis.dueReview, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    { label: t.documents.pendingApproval, value: kpis.pendingApproval, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    { label: t.documents.overdueReview, value: kpis.overdueReview, color: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
    { label: t.documents.obsolete, value: kpis.obsolete, color: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-[1540px]">
        {/* Back Link */}
        <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับไป Dashboard
        </Link>

        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">3</span>
            <h1 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              ควบคุมเอกสาร — Document Control
            </h1>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.documents.addDocument}
          </button>
        </div>

        {/* Compact Stat Boxes */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {statBoxes.map((s) => (
            <div key={s.label} className={`rounded-lg border ${s.border} ${s.color} p-2.5`}>
              <p className="text-[11px] font-medium opacity-80 leading-tight">{s.label}</p>
              <p className="mt-0.5 text-xl font-bold leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart + Legend Row */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status Breakdown</p>
            <div className="flex items-center justify-center">
              <DonutChart data={statusData} showLegend={false} height={180} />
            </div>
          </div>

          {/* Legend + Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status Summary</p>
            <div className="flex flex-col gap-2">
              {statusData.map((item) => {
                const total = statusData.reduce((acc, d) => acc + d.value, 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
                    <span className="w-12 text-right text-[11px] text-slate-400 dark:text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <FilterBar filters={filters} onChange={setFilters} departments={departments} showPeriod={false} />
            </div>
          </div>
        </div>

        {/* Document Table */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.documents.documentRegister}</p>
          </div>
          <div className="p-3">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={documents as unknown as Record<string, unknown>[]}
              onRowClick={(item) => router.push(`/documents/${(item as unknown as DocumentRecord).id}`)}
              searchPlaceholder={t.documents.searchDocuments}
            />
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t.documents.newDocumentTitle} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t.documents.documentId} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. WI-QA-004"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.revision}</label>
              <input
                type="text"
                value={form.revision}
                onChange={(e) => setForm({ ...form, revision: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.documents.title_col} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.type}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {DOC_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.department}</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.owner}</label>
              <select
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.reviewDate}</label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.status}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="draft">{t.status.draft}</option>
                <option value="published">{t.status.published}</option>
                <option value="revision_due">{t.status.revision_due}</option>
                <option value="obsolete">{t.status.obsolete}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.documents.approval}</label>
              <select
                value={form.approvalStatus}
                onChange={(e) => setForm({ ...form, approvalStatus: e.target.value as Status })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="draft">{t.status.draft}</option>
                <option value="pending">{t.status.pending}</option>
                <option value="verified">{t.status.verified}</option>
                <option value="closed">{t.status.closed}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.documents.dccPath}
            </label>
            <input
              type="text"
              value={form.dccPath}
              onChange={(e) => setForm({ ...form, dccPath: e.target.value })}
              placeholder={t.documents.dccPathPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{t.documents.dccPathHint}</p>
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
            disabled={!form.code.trim() || !form.title.trim()}
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
