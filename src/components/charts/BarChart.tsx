"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BarChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  layout?: "vertical" | "horizontal";
  showGrid?: boolean;
}

export default function BarChart({
  data,
  height = 300,
  layout = "horizontal",
  showGrid = true,
}: BarChartProps) {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const tickColor = isDark ? "#94a3b8" : "#94a3b8";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#0f172a";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
        <XAxis
          type={layout === "horizontal" ? "category" : "number"}
          tick={{ fontSize: 12, fill: tickColor }}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
        />
        <YAxis
          type={layout === "horizontal" ? "number" : "category"}
          tick={{ fontSize: 12, fill: tickColor }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: `1px solid ${tooltipBorder}`,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            backgroundColor: tooltipBg,
            color: tooltipText,
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || "#3b82f6"} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
