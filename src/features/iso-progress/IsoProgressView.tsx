"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";
import { auditRepo, actionRepo } from "@/data/repositories";
import { clauses } from "@/data/mock/clauses";
import { standards } from "@/data/mock/standards";
import { departments } from "@/data/mock/departments";
import Panel from "@/components/ui/Panel";
import FilterBar from "@/components/ui/FilterBar";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { useI18n } from "@/i18n/I18nContext";

export default function IsoProgressView() {
  const { filters, setFilters } = useFilters();
  const router = useRouter();
  const { t } = useI18n();

  const audits = useMemo(() => auditRepo.findAll(filters), [filters]);
  const actions = useMemo(() => actionRepo.findAll(filters), [filters]);

  const clauseData = useMemo(() => {
    return standards.map((std) => {
      const stdClauses = clauses.filter((c) => c.standardId === std.id && !c.parentId);
      const stdAudits = audits.filter((a) => a.standardId === std.id);
      const completedAudits = stdAudits.filter((a) => a.status === "closed");
      const progress = stdAudits.length > 0 ? Math.round((completedAudits.length / stdAudits.length) * 100) : 0;

      return {
        ...std,
        clauseCount: stdClauses.length,
        auditCount: stdAudits.length,
        completedAudits: completedAudits.length,
        progress,
        clauses: stdClauses.map((clause) => ({
          ...clause,
          childClauses: clauses.filter((c) => c.parentId === clause.id),
        })),
      };
    });
  }, [audits]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1540px]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t.isoProgress.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t.isoProgress.subtitle}
            </p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} departments={departments} />
        </div>

        {/* Standard Progress */}
        <div className="grid gap-5 lg:grid-cols-3">
          {clauseData.map((std) => (
            <Panel key={std.id} title={std.code} subtitle={std.name}>
              <div className="mt-4">
                <ProgressBar
                  label={t.isoProgress.auditCompletion}
                  value={std.progress}
                  color={std.progress >= 80 ? "#10b981" : std.progress >= 60 ? "#f59e0b" : "#ef4444"}
                  size="lg"
                />
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{t.isoProgress.clauses}</p>
                    <p className="mt-1 font-bold text-slate-900">{std.clauseCount}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{t.isoProgress.audits}</p>
                    <p className="mt-1 font-bold text-slate-900">{std.completedAudits}/{std.auditCount}</p>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        {/* Clause Tree */}
        <Panel title={t.isoProgress.clauseCoverage} subtitle={t.isoProgress.clauseHierarchy} className="mt-6">
          <div className="mt-4 space-y-4">
            {clauseData.map((std) => (
              <div key={std.id}>
                <h3 className="mb-3 text-sm font-bold text-slate-700">{std.code} — {std.name}</h3>
                <div className="space-y-2">
                  {std.clauses.map((clause) => (
                    <div key={clause.id} className="rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                            {clause.code}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{clause.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {clause.childClauses.length > 0 && (
                            <span className="text-xs text-slate-400">
                              {clause.childClauses.length} {t.isoProgress.subClauses}
                            </span>
                          )}
                        </div>
                      </div>
                      {clause.childClauses.length > 0 && (
                        <div className="mt-2 space-y-1 pl-8">
                          {clause.childClauses.map((child) => (
                            <div key={child.id} className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="font-medium text-slate-600">{child.code}</span>
                              <span>{child.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
