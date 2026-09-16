import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "skeleton" | "spinner";
  rows?: number;
}

function SkeletonRow() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

export default function LoadingState({ variant = "skeleton", rows = 3 }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-8">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
