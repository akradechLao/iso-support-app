"use client";

import { useI18n } from "@/i18n/I18nContext";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  size = "md",
  fullPage = false,
  message,
}: LoadingSpinnerProps) {
  const { t } = useI18n();

  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-slate-200 border-t-blue-600`}
      />
      {(message || size !== "sm") && (
        <p className="text-sm text-slate-500">{message || t.common.loading}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
