"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { actionRepo, documentRepo, auditRepo, legalRepo, riskRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import KPITrendCard from "@/components/ui/KPITrendCard";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import ProcessFlow from "@/components/ui/ProcessFlow";
import DonutChart from "@/components/charts/DonutChart";
import RiskHeatmap from "@/components/charts/RiskHeatmap";
import BarChart from "@/components/charts/BarChart";
import {
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  Shield,
  Scale,
  ClipboardCheck,
  Eye,
  CheckCircle,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function ExecutiveDashboard() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const actionKpis = useMemo(() => actionRepo.getKpis(filters), [filters]);
  const documentKpis = useMemo(() => documentRepo.getKpis(filters), [filters]);
  const auditKpis = useMemo(() => auditRepo.getKpis(filters), [filters]);
  const legalKpis = useMemo(() => legalRepo.getKpis(filters), [filters]);
  const riskKpis = useMemo(() => riskRepo.getKpis(filters), [filters]);
  const heatmapData = useMemo(() => riskRepo.getHeatmapData(), []);
  const allActions = useMemo(() => actionRepo.findAll(filters), [filters]);
  const allAudits = useMemo(() => auditRepo.findAll(filters), [filters]);
  const allDocuments = useMemo(() => documentRepo.findAll(filters), [filters]);
  const allLegal = useMemo(() => legalRepo.findAll(filters), [filters]);
  const recentActions = useMemo(() => allActions.slice(0, 6), [allActions]);

  const standardCompletionRates = useMemo(() => {
    const standards = ["9001", "14001", "45001"];
    return standards.map((standardId) => {
      const auditsForStandard = auditRepo.findByStandard(standardId);
      const completed = auditsForStandard.filter((a) => a.status === "closed").length;
      const total = auditsForStandard.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        standard: standardId,
        rate,
        label: `ISO ${standardId}`,
        color: standardId === "9001" ? "#2563eb" : standardId === "14001" ? "#10b981" : "#f59e0b",
      };
    });
  }, []);

  const documentByType = useMemo(() => {
    const types = ["Manual", "Procedure", "Work Instruction", "Form", "Record", "Policy"];
    return types.map((type) => {
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

  const documentDonutData = useMemo(() => [
    { name: "Effective", value: documentKpis.active, color: "#10b981" },
    { name: "Draft", value: Math.max(documentKpis.total - documentKpis.active - documentKpis.dueReview - documentKpis.pendingApproval - documentKpis.obsolete, 0), color: "#94a3b8" },
    { name: "Review", value: documentKpis.dueReview, color: "#3b82f6" },
    { name: "Approve", value: documentKpis.pendingApproval, color: "#f59e0b" },
    { name: "Obsolete", value: documentKpis.obsolete, color: "#64748b" },
  ], [documentKpis]);

  const auditDonutData = useMemo(() => [
    { name: "Completed", value: auditKpis.completed, color: "#10b981" },
    { name: "Planned", value: auditKpis.planned, color: "#3b82f6" },
    { name: "In Progress", value: auditKpis.inProgress, color: "#f59e0b" },
  ], [auditKpis]);

  const findingsBySeverity = useMemo(() => {
    const findings = allAudits.reduce((acc, a) => acc + (a.findingCount || 0), 0);
    return [
      { name: "Critical", value: Math.round(findings * 0.12), color: "#ef4444" },
      { name: "High", value: Math.round(findings * 0.22), color: "#f97316" },
      { name: "Medium", value: Math.round(findings * 0.40), color: "#f59e0b" },
      { name: "Low", value: Math.round(findings * 0.26), color: "#10b981" },
    ];
  }, [allAudits]);

  const actionDonutData = useMemo(() => [
    { name: "Open", value: actionKpis.open, color: "#3b82f6" },
    { name: "In Progress", value: allActions.filter((a) => a.status === "action_in_progress" || a.status === "in_progress").length, color: "#f59e0b" },
    { name: "Overdue", value: actionKpis.overdue, color: "#ef4444" },
    { name: "Closed", value: actionKpis.closed, color: "#10b981" },
  ], [actionKpis, allActions]);

  const legalDonutData = useMemo(() => [
    { name: "Compliant", value: legalKpis.comply, color: "#10b981" },
    { name: "Non-Compliant", value: legalKpis.nonComply, color: "#ef4444" },
    { name: "Pending", value: legalKpis.pending, color: "#f59e0b" },
  ], [legalKpis]);

  const modulePerformance = useMemo(
    () => [
      { name: "Documents", value: Math.round((documentKpis.active / Math.max(documentKpis.total, 1)) * 100), color: "#2563eb" },
      { name: "Legal", value: legalKpis.complianceRate, color: "#10b981" },
      { name: "Audit", value: auditKpis.completionRate, color: "#f59e0b" },
      { name: "CAPA", value: Math.round((actionKpis.closed / Math.max(actionKpis.total, 1)) * 100), color: "#ef4444" },
    ],
    [documentKpis, legalKpis, auditKpis, actionKpis]
  );

  if (loading) return <LoadingSpinner fullPage />;
  if (!recentActions.length && !modulePerformance.length) {
    return <EmptyState description={t.common.noData} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{t.dashboard.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.dashboard.subtitle}</p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} />
        </div>

        {/* Process Flow */}
        <Panel title="" className="mb-6">
          <ProcessFlow />
        </Panel>

        {/* Section 1: KPI Summary */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            1 · {t.dashboard.title} — สรุป KPI ระบบ ISO
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <KPITrendCard
              title="Active Documents"
              value={documentKpis.active}
              subtitle="เอกสารทั้งหมด"
              momValue={5.6}
              momDirection="up"
              icon={<FileText className="h-5 w-5" />}
              status="good"
              href="/documents"
            />
            <KPITrendCard
              title="Due Review"
              value={documentKpis.dueReview}
              subtitle="รอตรวจสอบ"
              momValue={12.5}
              momDirection="down"
              icon={<Clock className="h-5 w-5" />}
              status={documentKpis.dueReview > 3 ? "warning" : "good"}
              href="/documents"
            />
            <KPITrendCard
              title="Audit Findings"
              value={allAudits.reduce((acc, a) => acc + (a.findingCount || 0), 0)}
              subtitle="ผลการตรวจ"
              momValue={8.5}
              momDirection="down"
              icon={<ClipboardCheck className="h-5 w-5" />}
              status="warning"
              href="/audits"
            />
            <KPITrendCard
              title="Open CAR"
              value={actionKpis.open}
              subtitle="เปิดอยู่"
              momValue={9.7}
              momDirection="down"
              icon={<AlertTriangle className="h-5 w-5" />}
              status={actionKpis.overdue > 0 ? "danger" : "warning"}
              href="/ncr-car"
            />
            <KPITrendCard
              title="Overdue Actions"
              value={actionKpis.overdue}
              subtitle="เลยกำหนด"
              momValue={12.5}
              momDirection="up"
              icon={<AlertCircle className="h-5 w-5" />}
              status={actionKpis.overdue > 0 ? "danger" : "good"}
              href="/alerts"
            />
            <KPITrendCard
              title="Training Compliance"
              value={`${legalKpis.complianceRate}%`}
              subtitle="อัตราการปฏิบัติตาม"
              momValue={4.2}
              momDirection="up"
              icon={<Scale className="h-5 w-5" />}
              status={legalKpis.nonComply > 0 ? "warning" : "good"}
              href="/legal-compliance"
            />
          </div>
        </div>

        {/* Row 2: Document Control + Document Revision + การตรวจประเมินภายใน */}
        <div className="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Section 2: Document Control */}
          <Panel title="Document Control" subtitle="ควบคุมเอกสาร">
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Document Type</th>
                      <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-300">Total</th>
                      <th className="py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">Effective</th>
                      <th className="py-2 text-right font-semibold text-amber-600 dark:text-amber-400">Due Review</th>
                      <th className="py-2 text-right font-semibold text-red-600 dark:text-red-400">Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentByType.map((row) => (
                      <tr key={row.type} className="border-b border-slate-50 dark:border-slate-800">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">{row.type}</td>
                        <td className="py-2 text-right font-bold text-slate-900 dark:text-white">{row.total}</td>
                        <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">{row.effective}</td>
                        <td className="py-2 text-right text-amber-600 dark:text-amber-400">{row.dueReview}</td>
                        <td className="py-2 text-right text-red-600 dark:text-red-400">{row.overdue}</td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t-2 border-slate-300 dark:border-slate-600">
                      <td className="py-2 text-slate-900 dark:text-white">รวมทั้งหมด</td>
                      <td className="py-2 text-right text-slate-900 dark:text-white">{documentKpis.total}</td>
                      <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">{documentKpis.active}</td>
                      <td className="py-2 text-right text-amber-600 dark:text-amber-400">{documentKpis.dueReview}</td>
                      <td className="py-2 text-right text-red-600 dark:text-red-400">{documentKpis.overdueReview}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Effective {documentKpis.active} ({documentKpis.total > 0 ? Math.round((documentKpis.active / documentKpis.total) * 100) : 0}%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Due Review {documentKpis.dueReview}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Overdue {documentKpis.overdueReview}</span>
              </div>
            </div>
          </Panel>

          {/* Section 3: Document Revision & Approval (Donut) */}
          <Panel title="Document Revision & Approval" subtitle="สถานะการอนุมัติเอกสาร">
            <div className="mt-4 flex flex-col items-center">
              <DonutChart
                data={documentDonutData}
                centerLabel={String(documentKpis.total)}
                centerSubLabel="Total"
                height={200}
              />
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Effective {documentKpis.active} ({documentKpis.total > 0 ? Math.round((documentKpis.active / documentKpis.total) * 100) : 0}%)</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" /> Draft {Math.max(documentKpis.total - documentKpis.active - documentKpis.dueReview - documentKpis.pendingApproval - documentKpis.obsolete, 0)}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> Review {documentKpis.dueReview}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Approve {documentKpis.pendingApproval}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-500" /> Obsolete {documentKpis.obsolete}</div>
              </div>
              <p className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                ⚠ เอกสารที่รอตรวจสอบเกิน 5 วันทำการ
              </p>
            </div>
          </Panel>

          {/* Section 4: การตรวจประเมินภายใน */}
          <Panel title="การตรวจประเมินภายใน" subtitle="Internal Audit">
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">{auditKpis.total}</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">AUDIT PLAN</p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{auditKpis.completed}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">COMPLETED</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2">
                  <p className="text-lg font-black text-amber-700 dark:text-amber-300">{auditKpis.planned}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">PENDING</p>
                </div>
                <div className="rounded-lg bg-violet-50 dark:bg-violet-900/30 p-2">
                  <p className="text-lg font-black text-violet-700 dark:text-violet-300">{auditKpis.completionRate}%</p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400">COMPLIANCE</p>
                </div>
              </div>
              <div className="mt-4">
                <DonutChart
                  data={auditDonutData}
                  centerLabel={`${auditKpis.completionRate}%`}
                  centerSubLabel="Completion"
                  height={170}
                  innerRadius={55}
                  outerRadius={75}
                />
              </div>
              <div className="mt-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                ผลการตรวจ (YTD)
              </div>
              <div className="mt-2">
                <BarChart data={findingsBySeverity} height={120} />
              </div>
            </div>
          </Panel>
        </div>

        {/* Row 3: NCR/CAR + Finding Analysis + Training */}
        <div className="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Section 5: NCR/CAR Tracking */}
          <Panel title="NCR / CAR Tracking" subtitle="ติดตามการแก้ไขและป้องกัน">
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">{actionKpis.open}</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">OPEN</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2">
                  <p className="text-lg font-black text-amber-700 dark:text-amber-300">{allActions.filter((a) => a.status === "action_in_progress" || a.status === "in_progress").length}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">IN PROGRESS</p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2">
                  <p className="text-lg font-black text-red-700 dark:text-red-300">{actionKpis.overdue}</p>
                  <p className="text-[10px] text-red-600 dark:text-red-400">OVERDUE</p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{actionKpis.closed}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">CLOSED</p>
                </div>
              </div>
              <div className="mt-4">
                <DonutChart
                  data={actionDonutData}
                  centerLabel={String(actionKpis.total)}
                  centerSubLabel="Total CAR"
                  height={180}
                  innerRadius={50}
                  outerRadius={70}
                />
              </div>
            </div>
          </Panel>

          {/* Section 6: Finding & Root Cause Analysis */}
          <Panel title="Finding & Root Cause Analysis" subtitle="การวิเคราะห์รากปัญหา">
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Finding by Category (YTD)</div>
              <div className="mt-2">
                <BarChart
                  data={[
                    { name: "Document", value: 24, color: "#3b82f6" },
                    { name: "Process", value: 22, color: "#f59e0b" },
                    { name: "Training", value: 16, color: "#10b981" },
                    { name: "Machine", value: 12, color: "#ef4444" },
                    { name: "Method", value: 8, color: "#8b5cf6" },
                    { name: "Human Error", value: 4, color: "#64748b" },
                  ]}
                  height={150}
                />
              </div>
              <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                💡 สาเหตุหลักจาก Document และ Process คิดเป็น 53.5%
              </div>
            </div>
          </Panel>

          {/* Section 7: Training & Competency */}
          <Panel title="Training & Competency" subtitle="การฝึกอบรมและความสามารถ">
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2">
                  <p className="text-lg font-black text-slate-700 dark:text-slate-200">512</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">REQUIRED</p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">472</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">COMPLETED</p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2">
                  <p className="text-lg font-black text-red-700 dark:text-red-300">28</p>
                  <p className="text-[10px] text-red-600 dark:text-red-400">EXPIRED</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">92.3%</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">COMPLIANCE</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Training Compliance by Department</div>
                <div className="mt-2 space-y-2">
                  {[
                    { dept: "Production", rate: 94.6 },
                    { dept: "Engineering", rate: 93.0 },
                    { dept: "Quality", rate: 91.2 },
                    { dept: "Maintenance", rate: 90.1 },
                    { dept: "Warehouse", rate: 88.9 },
                    { dept: "Admin", rate: 87.5 },
                  ].map((d) => (
                    <div key={d.dept} className="flex items-center gap-2 text-xs">
                      <span className="w-24 text-slate-600 dark:text-slate-400">{d.dept}</span>
                      <div className="flex-1">
                        <ProgressBar value={d.rate} color={d.rate >= 90 ? "#10b981" : "#f59e0b"} size="sm" showValue={false} />
                      </div>
                      <span className="w-10 text-right font-bold text-slate-700 dark:text-slate-300">{d.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Row 4: Risk + Legal + Alert */}
        <div className="mb-6 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Section 8: Risk & Opportunity */}
          <Panel title="Risk & Opportunity" subtitle="ความเสี่ยงและโอกาส">
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <DonutChart
                    data={[
                      { name: "Critical", value: Math.max(riskKpis.high - 4, 0), color: "#ef4444" },
                      { name: "High", value: Math.min(riskKpis.high, 4), color: "#f97316" },
                      { name: "Medium", value: riskKpis.medium, color: "#f59e0b" },
                      { name: "Low", value: riskKpis.low, color: "#10b981" },
                    ]}
                    centerLabel={String(riskKpis.total)}
                    centerSubLabel="Risks"
                    height={160}
                    innerRadius={40}
                    outerRadius={60}
                  />
                </div>
                <div>
                  <RiskHeatmap
                    data={heatmapData}
                    onCellClick={(l, i, count) => {
                      if (count > 0) router.push(`/risks?likelihood=${l}&impact=${i}`);
                    }}
                    showLabels={true}
                  />
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300">
                ⚠ ความเสี่ยงระดับสูง<strong> {riskKpis.high} รายการ</strong> ต้องมีแผนการปฏิบัติ
              </p>
            </div>
          </Panel>

          {/* Section 9: การประเมินความสอดคล้องกับกฎหมาย */}
          <Panel title="การประเมินความสอดคล้องกับกฎหมาย" subtitle="Legal Compliance">
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <DonutChart
                  data={legalDonutData}
                  centerLabel={`${legalKpis.complianceRate}%`}
                  centerSubLabel="Compliance"
                  height={160}
                  innerRadius={40}
                  outerRadius={60}
                />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Comply {legalKpis.comply} ({legalKpis.total > 0 ? Math.round((legalKpis.comply / legalKpis.total) * 100) : 0}%)</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /> Non-Comply {legalKpis.nonComply} ({legalKpis.total > 0 ? Math.round((legalKpis.nonComply / legalKpis.total) * 100) : 0}%)</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending {legalKpis.pending} ({legalKpis.total > 0 ? Math.round((legalKpis.pending / legalKpis.total) * 100) : 0}%)</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-3">
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{legalKpis.comply}</p>
                  <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">สอดคล้อง</p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3">
                  <p className="text-2xl font-black text-red-700 dark:text-red-300">{legalKpis.nonComply}</p>
                  <p className="text-[10px] font-medium text-red-600 dark:text-red-400">ไม่สอดคล้อง</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-3">
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{legalKpis.pending}</p>
                  <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">รอดำเนินการ</p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar label="Overall Compliance" value={legalKpis.complianceRate} color="#10b981" size="lg" />
              </div>
            </div>
          </Panel>

          {/* Section 10: ISO Alert & Action */}
          <Panel title="ISO Alert & Action" subtitle="แจ้งเตือนและดำเนินการ">
            <div className="mt-4 space-y-2">
              {[
                { icon: <FileText className="h-4 w-4" />, label: "Document Review Overdue", count: documentKpis.overdueReview, color: "text-red-600 dark:text-red-400" },
                { icon: <AlertTriangle className="h-4 w-4" />, label: "CAR ถึง Due Date", count: allActions.filter((a) => a.status === "due_soon").length, color: "text-amber-600 dark:text-amber-400" },
                { icon: <ClipboardCheck className="h-4 w-4" />, label: "Audit Finding รอปิด", count: allAudits.reduce((acc, a) => acc + (a.findingCount || 0), 0), color: "text-blue-600 dark:text-blue-400" },
                { icon: <BookOpen className="h-4 w-4" />, label: "Training Expired", count: 28, color: "text-red-600 dark:text-red-400" },
                { icon: <Shield className="h-4 w-4" />, label: "High Risk ไม่มี Action", count: riskKpis.high, color: "text-orange-600 dark:text-orange-400" },
                { icon: <Clock className="h-4 w-4" />, label: "Audit Plan ถึงกำหนด", count: auditKpis.planned, color: "text-violet-600 dark:text-violet-400" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
