"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  centerLabel?: string;
  centerSubLabel?: string;
  showLegend?: boolean;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export default function DonutChart({
  data,
  centerLabel,
  centerSubLabel,
  showLegend = true,
  height = 250,
  innerRadius = 60,
  outerRadius = 90,
}: DonutChartProps) {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#0f172a";
  const labelColor = isDark ? "#f1f5f9" : "#1e293b";
  const subLabelColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="relative w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: `1px solid ${tooltipBorder}`,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              backgroundColor: tooltipBg,
              color: tooltipText,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {centerLabel && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ marginTop: -18 }}
        >
          <div className="text-center">
            <span
              className="block text-2xl font-bold"
              style={{ color: labelColor }}
            >
              {centerLabel}
            </span>
            {centerSubLabel && (
              <span
                className="block text-xs"
                style={{ color: subLabelColor }}
              >
                {centerSubLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {showLegend && (
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.map((entry) => {
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
            return (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                  {entry.name}
                </span>
                <span className={isDark ? "text-slate-400" : "text-slate-400"}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
