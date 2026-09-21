"use client";

import { FilterState } from "@/types";
import { ISO_STANDARDS } from "@/lib/constants";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  departments?: { id: string; name: string }[];
  showPeriod?: boolean;
}

export default function FilterBar({
  filters,
  onChange,
  departments = [],
  showPeriod = true,
}: FilterBarProps) {
  const { t } = useI18n();
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.standard !== "all" ||
    filters.department !== "all" ||
    filters.status !== "all" ||
    filters.period !== "all";

  const reset = () => {
    onChange({
      standard: "all",
      department: "all",
      status: "all",
      period: "all",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        id="filter-standard"
        name="standard"
        value={filters.standard}
        onChange={(e) => update("standard", e.target.value)}
        className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
      >
        <option value="all">{t.common.allStandards}</option>
        {ISO_STANDARDS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.code}
          </option>
        ))}
      </select>

      {departments.length > 0 && (
        <select
          id="filter-department"
          name="department"
          value={filters.department}
          onChange={(e) => update("department", e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
        >
          <option value="all">{t.common.allDepartments}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      <select
        id="filter-status"
        name="status"
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
      >
        <option value="all">{t.common.allStatus}</option>
        <option value="open">{t.status.open}</option>
        <option value="closed">{t.status.closed}</option>
        <option value="overdue">{t.status.overdue}</option>
        <option value="compliant">{t.status.compliant}</option>
        <option value="non_compliant">{t.status.non_compliant}</option>
      </select>

      {showPeriod && (
        <select
          id="filter-period"
          name="period"
          value={filters.period}
          onChange={(e) => update("period", e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
        >
          <option value="all">{t.common.allTime}</option>
          <option value="30d">{t.common.last30Days}</option>
          <option value="90d">{t.common.last90Days}</option>
          <option value="ytd">{t.common.yearToDate}</option>
        </select>
      )}

      {hasActiveFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <X className="h-3.5 w-3.5" />
          {t.common.clear}
        </button>
      )}
    </div>
  );
}
