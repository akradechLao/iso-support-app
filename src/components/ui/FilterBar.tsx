"use client";

import { FilterState } from "@/types";
import { ISO_STANDARDS } from "@/lib/constants";
import { X } from "lucide-react";

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
        value={filters.standard}
        onChange={(e) => update("standard", e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
      >
        <option value="all">All Standards</option>
        {ISO_STANDARDS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.code}
          </option>
        ))}
      </select>

      {departments.length > 0 && (
        <select
          value={filters.department}
          onChange={(e) => update("department", e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="overdue">Overdue</option>
        <option value="compliant">Compliant</option>
        <option value="non_compliant">Non-Compliant</option>
      </select>

      {showPeriod && (
        <select
          value={filters.period}
          onChange={(e) => update("period", e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
        >
          <option value="all">All Time</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="ytd">Year to Date</option>
        </select>
      )}

      {hasActiveFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
