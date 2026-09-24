"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo, documentRepo, auditRepo, legalRepo, riskRepo, trainingRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import KPITrendCard from "@/components/ui/KPITrendCard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import ProgressBar from "@/components/ui/ProgressBar";
import ProcessFlow from "@/components/ui/ProcessFlow";
import DonutChart from "@/components/charts/DonutChart";
import RiskHeatmap from "@/components/charts/RiskHeatmap";
import BarChart from "@/components/charts/BarChart";
import TrendChart from "@/components/charts/TrendChart";
import {
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  Shield,
  Scale,
  ClipboardCheck,
  BookOpen,
  Printer,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { DOC_TYPES } from "@/lib/constants";

function DrillDownLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors"
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

export default function ExecutiveDashboard() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    setLastUpdated(
      new Date().toLocaleString(language === "th" ? "th-TH" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    return () => clearTimeout(timer);
  }, [language]);

  const actionKpis = useMemo(() => actionRepo.getKpis(filters), [filters, version]);
  const documentKpis = useMemo(() => documentRepo.getKpis(filters), [filters, version]);
  const auditKpis = useMemo(() => auditRepo.getKpis(filters), [filters]);
  const legalKpis = useMemo(() => legalRepo.getKpis(filters), [filters, version]);
  const riskKpis = useMemo(() => riskRepo.getKpis(filters), [filters]);
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(filters), [filters]);
  const allActions = useMemo(() => actionRepo.findAll(filters), [filters, version]);
  const allAudits = useMemo(() => auditRepo.findAll(filters), [filters]);
  const allDocuments = useMemo(() => documentRepo.findAll(filters), [filters, version]);
  const allTrainings = useMemo(() => trainingRepo.findAll(filters), [filters, version]);
  const isFiltered = filters.department !== "all" || filters.status !== "all" || filters.standard !== "all" || filters.period !== "all";

  const trainingKpis = useMemo(() => {
    const total = allTrainings.length;
    const completed = allTrainings.filter((tr) => tr.status === "closed").length;
    const expired = allTrainings.filter((tr) => tr.status === "overdue").length;
    const complianceRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, expired, complianceRate };
  }, [allTrainings]);

  const trainingByDept = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    allTrainings.forEach((tr) => {
      const entry = map.get(tr.departmentId) || { total: 0, completed: 0 };
      entry.total += 1;
      if (tr.status === "closed") entry.completed += 1;
      map.set(tr.departmentId, entry);
    });
    return Array.from(map.entries())
      .map(([deptId, v]) => ({
        dept:
          departments.find((d) => d.id === deptId)?.[
            language === "th" ? "nameTh" : "name"
          ] || deptId,
        rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [allTrainings, language]);

  const standardCompletionRates = useMemo(() => {
    const standards = ["9001", "14001", "45001"];
    return standards.map((standardId) => {
      const auditsForStandard = auditRepo.findAll({ ...filters, standard: standardId });
      const completed = auditsForStandard.filter(
        (a) => a.status === "closed"
      ).length;
      const total = auditsForStandard.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        standard: standardId,
        rate,
        label: `ISO ${standardId}`,
        color:
          standardId === "9001"
            ? "#2563eb"
            : standardId === "14001"
            ? "#10b981"
            : "#f59e0b",
      };
    });
  }, [filters]);

  const monthlyTrendData = useMemo(() => {
    const months =
      language === "th"
        ? ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, i) => ({
      month,
      documents: 72 + Math.round(Math.sin(i / 2) * 6) + i * 2,
      auditCompletion: 58 + i * 3 + Math.round(Math.sin(i) * 3),
      compliance: 82 + Math.round(Math.sin(i / 3) * 5) + Math.floor(i / 2),
    }));
  }, [language]);

  const hasAnyData =
    documentKpis.total > 0 ||
    actionKpis.total > 0 ||
    auditKpis.total > 0 ||
    legalKpis.total > 0 ||
    riskKpis.total > 0 ||
    trainingKpis.total > 0;

  const documentByType = useMemo(() => {
    return DOC_TYPES.map((type) => {
      const docs = allDocuments.filter((d) => d.type === type);
      return {
        type,
        total: docs.length,
        effective: docs.filter((d) => d.status === "published").length,
        dueReview: docs.filter((d) => d.status === "revision_due").length,
        overdue: docs.filter((d) => d.approvalStatus === "pending").length,
      };
    }).filter((d) => d.total > 0);
  }, [allDocuments]);

  const documentDonutData = useMemo(
    () => [
      {
        name: t.dashboard.effectiveLabel,
        value: documentKpis.active,
        color: "#10b981",
      },
      {
        name: t.dashboard.draftLabel,
        value: Math.max(
          documentKpis.total -
            documentKpis.active -
            documentKpis.dueReview -
            documentKpis.pendingApproval -
            documentKpis.obsolete,
          0
        ),
        color: "#94a3b8",
      },
      {
        name: t.dashboard.reviewLabel,
        value: documentKpis.dueReview,
        color: "#3b82f6",
      },
      {
        name: t.dashboard.approveLabel,
        value: documentKpis.pendingApproval,
        color: "#f59e0b",
      },
      {
        name: t.dashboard.obsoleteLabel,
        value: documentKpis.obsolete,
        color: "#64748b",
      },
    ],
    [documentKpis, t]
  );

  const auditDonutData = useMemo(
    () => [
      {
        name: t.dashboard.completedLabel,
        value: auditKpis.completed,
        color: "#10b981",
      },
      {
        name: t.dashboard.planned,
        value: auditKpis.planned,
        color: "#3b82f6",
      },
      {
        name: t.dashboard.inProgress,
        value: auditKpis.inProgress,
        color: "#f59e0b",
      },
    ],
    [auditKpis, t]
  );

  const findingsBySeverity = useMemo(() => {
    const findings = allAudits.reduce(
      (acc, a) => acc + (a.findingCount || 0),
      0
    );
    return [
      { name: t.audits.critical, value: Math.round(findings * 0.12), color: "#ef4444" },
      { name: t.audits.high, value: Math.round(findings * 0.22), color: "#f97316" },
      { name: t.audits.medium, value: Math.round(findings * 0.4), color: "#f59e0b" },
      { name: t.audits.low, value: Math.round(findings * 0.26), color: "#10b981" },
    ];
  }, [allAudits, t]);

  const actionDonutData = useMemo(
    () => [
      { name: t.dashboard.openLabel, value: actionKpis.open, color: "#3b82f6" },
      {
        name: t.dashboard.inProgressLabel,
        value: allActions.filter(
          (a) =>
            a.status === "action_in_progress" || a.status === "in_progress"
        ).length,
        color: "#f59e0b",
      },
      {
        name: t.dashboard.overdueLabel,
        value: actionKpis.overdue,
        color: "#ef4444",
      },
      {
        name: t.dashboard.closedLabel,
        value: actionKpis.closed,
        color: "#10b981",
      },
    ],
    [actionKpis, allActions, t]
  );

  const legalDonutData = useMemo(
    () => [
      { name: t.dashboard.compliant, value: legalKpis.comply, color: "#10b981" },
      {
        name: t.dashboard.nonCompliant,
        value: legalKpis.nonComply,
        color: "#ef4444",
      },
      { name: t.dashboard.pending, value: legalKpis.pending, color: "#f59e0b" },
    ],
    [legalKpis, t]
  );

  const inProgressCount = allActions.filter(
    (a) => a.status === "action_in_progress" || a.status === "in_progress"
  ).length;
  const dueSoonCount = allActions.filter((a) => a.status === "due_soon").length;
  const totalFindings = allAudits.reduce(
    (acc, a) => acc + (a.findingCount || 0),
    0
  );

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.dashboard.subtitle}
            </p>
            {lastUpdated && (
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {t.dashboard.lastUpdated}: {lastUpdated}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              {t.dashboard.print}
            </button>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              departments={departments}
            />
          </div>
        </div>

        {!hasAnyData && (
          <div className="mb-6">
            <EmptyState
              description={
                isFiltered
                  ? language === "th"
                    ? "ไม่มีข้อมูลสำหรับตัวกรองที่เลือก — กด Clear เพื่อล้างตัวกรอง"
                    : "No data for the selected filters — press Clear to reset"
                  : t.common.noData
              }
            />
          </div>
        )}

        {/* Process Flow */}
        <Panel
          title={t.dashboard.processFlow}
          subtitle={t.dashboard.processFlowSub}
          className="mb-6"
        >
          <ProcessFlow />
        </Panel>

        {/* Section 1: KPI Summary */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            {t.dashboard.kpiSummary}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <KPITrendCard
              title={t.dashboard.activeDocumentsCard}
              value={documentKpis.active}
              subtitle={t.dashboard.documentsSubtitle}
              momValue={5.6}
              momDirection="up"
              icon={<FileText className="h-5 w-5" />}
              status="good"
              href="/documents"
            />
            <KPITrendCard
              title={t.dashboard.dueReviewCard}
              value={documentKpis.dueReview}
              subtitle={t.dashboard.reviewSubtitle}
              momValue={12.5}
              momDirection="down"
              icon={<Clock className="h-5 w-5" />}
              status={documentKpis.dueReview > 3 ? "warning" : "good"}
              href="/documents"
            />
            <KPITrendCard
              title={t.dashboard.auditFindingsCard}
              value={totalFindings}
              subtitle={t.dashboard.findingsSubtitle}
              momValue={8.5}
              momDirection="down"
              icon={<ClipboardCheck className="h-5 w-5" />}
              status="warning"
              href="/audits"
            />
            <KPITrendCard
              title={t.dashboard.openCarCard}
              value={actionKpis.open}
              subtitle={t.dashboard.openSubtitle}
              momValue={9.7}
              momDirection="down"
              icon={<AlertTriangle className="h-5 w-5" />}
              status={actionKpis.overdue > 0 ? "danger" : "warning"}
              href="/ncr-car"
            />
            <KPITrendCard
              title={t.dashboard.overdueActionsCard}
              value={actionKpis.overdue}
              subtitle={t.dashboard.overdueSubtitle}
              momValue={12.5}
              momDirection="up"
              icon={<AlertCircle className="h-5 w-5" />}
              status={actionKpis.overdue > 0 ? "danger" : "good"}
              href="/alerts"
            />
            <KPITrendCard
              title={t.dashboard.trainingComplianceCard}
              value={`${trainingKpis.complianceRate}%`}
              subtitle={t.dashboard.complianceSubtitle}
              momValue={4.2}
              momDirection="up"
              icon={<Scale className="h-5 w-5" />}
              status={trainingKpis.complianceRate >= 80 ? "good" : "warning"}
              href="/training"
            />
          </div>
        </div>

        {/* Section 2: TrendChart + Standard Completion */}
        <div className="mb-6 grid gap-5 grid-cols-1 xl:grid-cols-3">
          <Panel
            title={t.dashboard.kpiTrends}
            subtitle={t.dashboard.kpiTrendsSub}
            className="xl:col-span-2"
            action={<DrillDownLink href="/iso-progress" label={t.common.view} />}
          >
            <div className="mt-4">
              {isFiltered ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  {language === "th"
                    ? "ไม่มีข้อมูลแนวโน้มรายเดือนสำหรับตัวกรองนี้"
                    : "No monthly trend data for the current filters"}
                </div>
              ) : (
                <TrendChart
                  data={monthlyTrendData}
                  xKey="month"
                  lines={[
                    {
                      key: "documents",
                      color: "#2563eb",
                      name: t.dashboard.activeDocumentsCard,
                    },
                    {
                      key: "auditCompletion",
                      color: "#f59e0b",
                      name: t.dashboard.auditCompletion,
                    },
                    {
                      key: "compliance",
                      color: "#10b981",
                      name: t.dashboard.complianceRate,
                    },
                  ]}
                  height={280}
                />
              )}
            </div>
          </Panel>

          <Panel
            title={t.dashboard.standardCompletion}
            subtitle={t.dashboard.standardCompletionSub}
            action={<DrillDownLink href="/audits" label={t.common.view} />}
          >
            <div className="mt-4 space-y-4">
              {standardCompletionRates.map((s) => (
                <div key={s.standard}>
                  <ProgressBar
                    label={s.label}
                    value={s.rate}
                    color={s.color}
                    size="md"
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Row 3: Document Control + Document Revision + Internal Audit */}
        <div className="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Document Control */}
          <Panel
            title={t.dashboard.documentControlTitle}
            subtitle={t.dashboard.documentControlSub}
            action={<DrillDownLink href="/documents" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                        {t.dashboard.docTypeHeader}
                      </th>
                      <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-300">
                        {t.dashboard.totalHeader}
                      </th>
                      <th className="py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.dashboard.effectiveHeader}
                      </th>
                      <th className="py-2 text-right font-semibold text-amber-600 dark:text-amber-400">
                        {t.dashboard.dueReviewHeader}
                      </th>
                      <th className="py-2 text-right font-semibold text-red-600 dark:text-red-400">
                        {t.dashboard.overdueHeader}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentByType.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                          {t.common.noData}
                        </td>
                      </tr>
                    )}
                    {documentByType.map((row) => (
                      <tr
                        key={row.type}
                        className="border-b border-slate-50 dark:border-slate-800"
                      >
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">
                          {row.type}
                        </td>
                        <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                          {row.total}
                        </td>
                        <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">
                          {row.effective}
                        </td>
                        <td className="py-2 text-right text-amber-600 dark:text-amber-400">
                          {row.dueReview}
                        </td>
                        <td className="py-2 text-right text-red-600 dark:text-red-400">
                          {row.overdue}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t-2 border-slate-300 dark:border-slate-600">
                      <td className="py-2 text-slate-900 dark:text-white">
                        {t.dashboard.totalRow}
                      </td>
                      <td className="py-2 text-right text-slate-900 dark:text-white">
                        {documentKpis.total}
                      </td>
                      <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">
                        {documentKpis.active}
                      </td>
                      <td className="py-2 text-right text-amber-600 dark:text-amber-400">
                        {documentKpis.dueReview}
                      </td>
                      <td className="py-2 text-right text-red-600 dark:text-red-400">
                        {documentKpis.overdueReview}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                  {t.dashboard.effectiveLabel} {documentKpis.active} (
                  {documentKpis.total > 0
                    ? Math.round(
                        (documentKpis.active / documentKpis.total) * 100
                      )
                    : 0}
                  %)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />{" "}
                  {t.dashboard.dueReviewHeader} {documentKpis.dueReview}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                  {t.dashboard.overdueHeader} {documentKpis.overdueReview}
                </span>
              </div>
            </div>
          </Panel>

          {/* Document Revision & Approval */}
          <Panel
            title={t.dashboard.documentRevisionTitle}
            subtitle={t.dashboard.documentRevisionSub}
            action={<DrillDownLink href="/document-revision" label={t.common.view} />}
          >
            <div className="mt-4 flex flex-col items-center">
              <DonutChart
                data={documentDonutData}
                centerLabel={String(documentKpis.total)}
                centerSubLabel={t.dashboard.totalHeader}
                height={200}
              />
              <p className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                ⚠ {t.dashboard.warningDocReview}
              </p>
            </div>
          </Panel>

          {/* Internal Audit */}
          <Panel
            title={t.dashboard.internalAuditTitle}
            subtitle={t.dashboard.internalAuditSub}
            action={<DrillDownLink href="/audits" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                    {auditKpis.total}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    {t.dashboard.auditPlanLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {auditKpis.completed}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {t.dashboard.completedLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2">
                  <p className="text-lg font-black text-amber-700 dark:text-amber-300">
                    {auditKpis.planned}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    {t.dashboard.pendingLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 dark:bg-violet-900/30 p-2">
                  <p className="text-lg font-black text-violet-700 dark:text-violet-300">
                    {auditKpis.completionRate}%
                  </p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400">
                    {t.dashboard.complianceLabel}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <DonutChart
                  data={auditDonutData}
                  centerLabel={`${auditKpis.completionRate}%`}
                  centerSubLabel={t.dashboard.completionLabel}
                  height={170}
                  innerRadius={55}
                  outerRadius={75}
                />
              </div>
              <div className="mt-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {t.dashboard.resultsYTD}
              </div>
              <div className="mt-2">
                <BarChart data={findingsBySeverity} height={120} />
              </div>
            </div>
          </Panel>
        </div>

        {/* Row 4: NCR/CAR + Finding Analysis + Training */}
        <div className="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* NCR/CAR Tracking */}
          <Panel
            title={t.dashboard.ncrCarTitle}
            subtitle={t.dashboard.ncrCarSub}
            action={<DrillDownLink href="/ncr-car" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                    {actionKpis.open}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    {t.dashboard.openLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2">
                  <p className="text-lg font-black text-amber-700 dark:text-amber-300">
                    {inProgressCount}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    {t.dashboard.inProgressLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2">
                  <p className="text-lg font-black text-red-700 dark:text-red-300">
                    {actionKpis.overdue}
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400">
                    {t.dashboard.overdueLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {actionKpis.closed}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {t.dashboard.closedLabel}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <DonutChart
                  data={actionDonutData}
                  centerLabel={String(actionKpis.total)}
                  centerSubLabel={t.dashboard.totalCarLabel}
                  height={180}
                  innerRadius={50}
                  outerRadius={70}
                />
              </div>
            </div>
          </Panel>

          {/* Finding & Root Cause Analysis */}
          <Panel
            title={t.dashboard.findingAnalysisTitle}
            subtitle={t.dashboard.findingAnalysisSub}
            action={<DrillDownLink href="/audits" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.dashboard.findingByCategory}
              </div>
              <div className="mt-2">
                <BarChart
                  data={[
                    {
                      name:
                        language === "th" ? "เอกสาร" : "Document",
                      value: 24,
                      color: "#3b82f6",
                    },
                    {
                      name:
                        language === "th" ? "กระบวนการ" : "Process",
                      value: 22,
                      color: "#f59e0b",
                    },
                    {
                      name:
                        language === "th" ? "การฝึกอบรม" : "Training",
                      value: 16,
                      color: "#10b981",
                    },
                    {
                      name:
                        language === "th" ? "เครื่องจักร" : "Machine",
                      value: 12,
                      color: "#ef4444",
                    },
                    {
                      name:
                        language === "th" ? "วิธีการ" : "Method",
                      value: 8,
                      color: "#8b5cf6",
                    },
                    {
                      name:
                        language === "th" ? "ความผิดพลาดของคน" : "Human Error",
                      value: 4,
                      color: "#64748b",
                    },
                  ]}
                  height={150}
                />
              </div>
              <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                💡 {t.dashboard.findingInsight}
              </div>
            </div>
          </Panel>

          {/* Training & Competency */}
          <Panel
            title={t.dashboard.trainingTitle}
            subtitle={t.dashboard.trainingSub}
            action={<DrillDownLink href="/training" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2">
                  <p className="text-lg font-black text-slate-700 dark:text-slate-200">
                    {trainingKpis.total}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {t.dashboard.requiredLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {trainingKpis.completed}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {t.dashboard.completedLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2">
                  <p className="text-lg font-black text-red-700 dark:text-red-300">
                    {trainingKpis.expired}
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400">
                    {t.dashboard.expiredLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                    {trainingKpis.complianceRate}%
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    {t.dashboard.complianceLabel}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.dashboard.trainingByDept}
                </div>
                <div className="mt-2 space-y-2">
                  {trainingByDept.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      {t.common.noData}
                    </p>
                  )}
                  {trainingByDept.map((d) => (
                    <div
                      key={d.dept}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-28 truncate text-slate-600 dark:text-slate-400">
                        {d.dept}
                      </span>
                      <div className="flex-1">
                        <ProgressBar
                          value={d.rate}
                          color={d.rate >= 90 ? "#10b981" : "#f59e0b"}
                          size="sm"
                          showValue={false}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-slate-700 dark:text-slate-300">
                        {d.rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Row 5: Risk + Legal + Alert */}
        <div className="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Risk & Opportunity */}
          <Panel
            title={t.dashboard.riskTitle}
            subtitle={t.dashboard.riskSub}
            action={<DrillDownLink href="/risks" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <DonutChart
                    data={[
                      {
                        name: t.audits.critical,
                        value: Math.max(riskKpis.high - 4, 0),
                        color: "#ef4444",
                      },
                      {
                        name: t.audits.high,
                        value: Math.min(riskKpis.high, 4),
                        color: "#f97316",
                      },
                      {
                        name: t.audits.medium,
                        value: riskKpis.medium,
                        color: "#f59e0b",
                      },
                      {
                        name: t.audits.low,
                        value: riskKpis.low,
                        color: "#10b981",
                      },
                    ]}
                    centerLabel={String(riskKpis.total)}
                    centerSubLabel={t.dashboard.risksLabel}
                    height={160}
                    innerRadius={40}
                    outerRadius={60}
                  />
                </div>
                <div>
                  <RiskHeatmap
                    data={heatmapData}
                    onCellClick={(l, i, count) => {
                      if (count > 0)
                        router.push(`/risks?likelihood=${l}&impact=${i}`);
                    }}
                    showLabels={true}
                  />
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300">
                ⚠{" "}
                {t.dashboard.highRiskCount.replace(
                  "{count}",
                  String(riskKpis.high)
                )}
              </p>
            </div>
          </Panel>

          {/* Legal Compliance */}
          <Panel
            title={t.nav.legal}
            subtitle={t.dashboard.legalCompliance}
            action={<DrillDownLink href="/legal-compliance" label={t.common.view} />}
          >
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <DonutChart
                  data={legalDonutData}
                  centerLabel={`${legalKpis.complianceRate}%`}
                  centerSubLabel={t.dashboard.complianceLabel}
                  height={160}
                  innerRadius={40}
                  outerRadius={60}
                />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                    {t.dashboard.compliant} {legalKpis.comply} (
                    {legalKpis.total > 0
                      ? Math.round((legalKpis.comply / legalKpis.total) * 100)
                      : 0}
                    %)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                    {t.dashboard.nonCompliant} {legalKpis.nonComply} (
                    {legalKpis.total > 0
                      ? Math.round(
                          (legalKpis.nonComply / legalKpis.total) * 100
                        )
                      : 0}
                    %)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />{" "}
                    {t.dashboard.pending} {legalKpis.pending} (
                    {legalKpis.total > 0
                      ? Math.round((legalKpis.pending / legalKpis.total) * 100)
                      : 0}
                    %)
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-3">
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {legalKpis.comply}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {t.dashboard.compliant}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3">
                  <p className="text-2xl font-black text-red-700 dark:text-red-300">
                    {legalKpis.nonComply}
                  </p>
                  <p className="text-[10px] font-medium text-red-600 dark:text-red-400">
                    {t.dashboard.nonCompliant}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-3">
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
                    {legalKpis.pending}
                  </p>
                  <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    {t.dashboard.pending}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  label={t.dashboard.overallComplianceLabel}
                  value={legalKpis.complianceRate}
                  color="#10b981"
                  size="lg"
                />
              </div>
            </div>
          </Panel>

          {/* ISO Alert & Action */}
          <Panel
            title={t.dashboard.alertTitle}
            subtitle={t.dashboard.alertSub}
            action={<DrillDownLink href="/alerts" label={t.common.view} />}
          >
            <div className="mt-4 space-y-2">
              {[
                {
                  icon: <FileText className="h-4 w-4" />,
                  label: t.dashboard.alertDocReview,
                  count: documentKpis.overdueReview,
                  color: "text-red-600 dark:text-red-400",
                },
                {
                  icon: <AlertTriangle className="h-4 w-4" />,
                  label: t.dashboard.alertCarDue,
                  count: dueSoonCount,
                  color: "text-amber-600 dark:text-amber-400",
                },
                {
                  icon: <ClipboardCheck className="h-4 w-4" />,
                  label: t.dashboard.alertFindingOpen,
                  count: totalFindings,
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  icon: <BookOpen className="h-4 w-4" />,
                  label: t.dashboard.alertTrainingExpired,
                  count: trainingKpis.expired,
                  color: "text-red-600 dark:text-red-400",
                },
                {
                  icon: <Shield className="h-4 w-4" />,
                  label: t.dashboard.alertHighRisk,
                  count: riskKpis.high,
                  color: "text-orange-600 dark:text-orange-400",
                },
                {
                  icon: <Clock className="h-4 w-4" />,
                  label: t.dashboard.alertAuditDue,
                  count: auditKpis.planned,
                  color: "text-violet-600 dark:text-violet-400",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${item.color}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
