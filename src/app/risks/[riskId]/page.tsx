"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { riskRepo } from "@/data/repositories";
import { departments } from "@/data/mock/departments";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { ArrowLeft, Shield, Building, User, AlertTriangle } from "lucide-react";

export default function RiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.riskId as string;

  const risk = useMemo(() => riskRepo.findById(id), [id]);

  if (!risk) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Risk not found</p>
        <button onClick={() => router.push("/risks")} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Back to Risks
        </button>
      </div>
    );
  }

  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Critical", color: "text-red-600", bg: "bg-red-50" };
    if (score >= 10) return { label: "High", color: "text-orange-600", bg: "bg-orange-50" };
    if (score >= 5) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  const inherent = getRiskLevel(risk.inherentScore);
  const residual = getRiskLevel(risk.residualScore);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6">
          <button
            onClick={() => router.push("/risks")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Risks
          </button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {risk.id}
                </span>
                <StatusBadge status={risk.status} size="md" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{risk.title}</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Building className="h-4 w-4" />
              Department
            </div>
            <p className="mt-2 font-semibold text-slate-900">
              {departments.find((d) => d.id === risk.departmentId)?.name || risk.departmentId}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              Owner
            </div>
            <p className="mt-2 font-semibold text-slate-900">{risk.ownerId}</p>
          </div>
          <div className={`rounded-xl border p-4 ${inherent.bg}`}>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              Inherent Risk
            </div>
            <p className={`mt-2 text-2xl font-black ${inherent.color}`}>{risk.inherentScore}</p>
            <p className={`mt-1 text-xs font-bold ${inherent.color}`}>{inherent.label}</p>
          </div>
          <div className={`rounded-xl border p-4 ${residual.bg}`}>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield className="h-4 w-4" />
              Residual Risk
            </div>
            <p className={`mt-2 text-2xl font-black ${residual.color}`}>{risk.residualScore}</p>
            <p className={`mt-1 text-xs font-bold ${residual.color}`}>{residual.label}</p>
          </div>
        </div>

        <Panel title="Description" className="mt-6">
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{risk.description}</p>
        </Panel>

        <Panel title="Risk Assessment Details" className="mt-4">
          <div className="mt-3 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Likelihood</p>
              <div className="mt-2">
                <ProgressBar value={risk.likelihood} max={5} color="#3b82f6" showValue={true} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Impact</p>
              <div className="mt-2">
                <ProgressBar value={risk.impact} max={5} color="#ef4444" showValue={true} />
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
