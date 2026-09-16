import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function Panel({ title, subtitle, children, className, action }: PanelProps) {
  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
