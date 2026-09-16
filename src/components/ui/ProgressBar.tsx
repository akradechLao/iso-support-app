import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export default function ProgressBar({
  value,
  max = 100,
  color = "#2563eb",
  label,
  showValue = true,
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && <span className="font-semibold text-slate-700">{label}</span>}
          {showValue && <span className="font-bold text-slate-900">{percentage}%</span>}
        </div>
      )}
      <div className={cn("overflow-hidden rounded-full bg-slate-100", sizeStyles[size])}>
        <div
          className={cn("rounded-full transition-all duration-500", sizeStyles[size])}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
