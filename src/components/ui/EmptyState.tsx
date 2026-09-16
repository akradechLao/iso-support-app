import { FileX, SearchX, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  variant?: "no-data" | "no-results" | "error";
  title?: string;
  description?: string;
}

const variants = {
  "no-data": {
    icon: FileX,
    title: "No data available",
    description: "There are no records to display yet.",
  },
  "no-results": {
    icon: SearchX,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "An error occurred while loading the data.",
  },
};

export default function EmptyState({
  variant = "no-data",
  title,
  description,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-700">
        {title || config.title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        {description || config.description}
      </p>
    </div>
  );
}
