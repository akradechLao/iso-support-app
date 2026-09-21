"use client";

import { cn } from "@/lib/utils";

interface RiskHeatmapProps {
  data: number[][];
  onCellClick?: (likelihood: number, impact: number, count: number) => void;
  showLabels?: boolean;
}

const getCellColor = (score: number): string => {
  if (score >= 15) return "bg-red-500 text-white";
  if (score >= 10) return "bg-orange-400 text-white";
  if (score >= 5) return "bg-amber-400 text-amber-950";
  if (score > 0) return "bg-emerald-400 text-emerald-950";
  return "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500";
};

export default function RiskHeatmap({
  data,
  onCellClick,
  showLabels = true,
}: RiskHeatmapProps) {
  const likelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
  const impactLabels = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"];

  return (
    <div className="w-full">
      {showLabels && (
        <div className="mb-2 flex items-center">
          <div className="w-20" />
          <div className="flex-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            Impact →
          </div>
        </div>
      )}
      <div className="grid gap-1" style={{ gridTemplateColumns: showLabels ? "auto repeat(5, 1fr)" : "repeat(5, 1fr)" }}>
        {data.map((row, likelihoodIdx) =>
          row.map((count, impactIdx) => {
            const score = (likelihoodIdx + 1) * (impactIdx + 1);
            return (
              <div key={`${likelihoodIdx}-${impactIdx}`} className="contents">
                {showLabels && impactIdx === 0 && (
                  <div className="flex items-center justify-end pr-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {likelihoodLabels[likelihoodIdx]}
                  </div>
                )}
                <button
                  onClick={() => onCellClick?.(likelihoodIdx + 1, impactIdx + 1, count)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-lg text-xs font-bold transition-transform hover:scale-105",
                    getCellColor(count)
                  )}
                >
                  {count}
                </button>
              </div>
            );
          })
        )}
      </div>
      {showLabels && (
        <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: "auto repeat(5, 1fr)" }}>
          <div className="w-20" />
          {impactLabels.map((label) => (
            <div key={label} className="text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
