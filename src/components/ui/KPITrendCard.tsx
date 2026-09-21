import React from "react";
import Link from "next/link";

interface KPITrendCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  momValue?: number;
  momDirection?: "up" | "down" | "stable";
  icon: React.ReactNode;
  status?: "good" | "warning" | "danger";
  href?: string;
}

const statusBorder: Record<string, string> = {
  good: "border-l-emerald-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
};

const statusIconBg: Record<string, string> = {
  good: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

function KPITrendCard({
  title,
  value,
  subtitle,
  momValue,
  momDirection = "stable",
  icon,
  status = "good",
  href,
}: KPITrendCardProps) {
  const trendArrow =
    momDirection === "up" ? (
      <span className="text-emerald-500">▲</span>
    ) : momDirection === "down" ? (
      <span className="text-red-500">▼</span>
    ) : (
      <span className="text-slate-400 dark:text-slate-500">—</span>
    );

  const trendColor =
    momDirection === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : momDirection === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-slate-500 dark:text-slate-400";

  const card = (
    <div
      className={`
        group relative flex flex-col gap-3
        rounded-2xl border-l-4 border border-slate-200 dark:border-slate-700
        ${statusBorder[status]}
        bg-white dark:bg-slate-800
        p-5 shadow-sm
        transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
      `}
    >
      {/* Header: Title + Icon */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${statusIconBg[status]}`}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}

      {/* MoM Trend */}
      {momValue !== undefined && (
        <div className={`flex items-center gap-1.5 text-sm font-medium ${trendColor}`}>
          {trendArrow}
          <span>
            {momValue.toFixed(1)}% MoM
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl">
        {card}
      </Link>
    );
  }

  return card;
}

export default KPITrendCard;
