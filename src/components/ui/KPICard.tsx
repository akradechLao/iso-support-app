"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "good" | "warning" | "danger";
  href?: string;
  icon?: React.ReactNode;
}

const statusStyles = {
  good: "border-emerald-200 bg-emerald-50/50",
  warning: "border-amber-200 bg-amber-50/50",
  danger: "border-red-200 bg-red-50/50",
};

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  status,
  href,
  icon,
}: KPICardProps) {
  const content = (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
        href && "cursor-pointer hover:border-blue-200",
        status && statusStyles[status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {icon && <div className="shrink-0 text-slate-300">{icon}</div>}
      </div>
      {(trend || trendValue) && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          {trend === "stable" && <Minus className="h-3.5 w-3.5 text-slate-400" />}
          {trendValue && (
            <span
              className={cn(
                "text-xs font-semibold",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-600",
                trend === "stable" && "text-slate-500"
              )}
            >
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
