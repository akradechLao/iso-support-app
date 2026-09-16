const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const clean = dateStr.trim();

  // Handle "dd/MM/yy" Thai Buddhist format (e.g., "16/3/69")
  const buddhistMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (buddhistMatch) {
    const [, day, month, year] = buddhistMatch;
    const fullYear = parseInt(year) + 2500 - 543; // Buddhist year to AD
    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
  }

  // Handle "dd/MM/yyyy" format
  const standardMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (standardMatch) {
    const [, day, month, year] = standardMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Handle ISO format "yyyy-MM-dd..." (from NC/CAR data)
  if (clean.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function formatDate(dateStr: string, format: "short" | "long" | "iso" = "short"): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (format === "iso") {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const monthStr = format === "long" ? MONTHS_EN[month] : MONTHS_EN[month];
  return `${day} ${monthStr} ${year}`;
}

export function formatDateThai(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;

  const day = date.getDate();
  const month = MONTHS_TH[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === "closed" || status === "verified") return false;
  const date = parseDate(dueDate);
  if (!date) return false;
  return date < new Date();
}

export function isDueSoon(dueDate: string, status: string, days: number = 7): boolean {
  if (status === "closed" || status === "verified") return false;
  const date = parseDate(dueDate);
  if (!date) return false;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const daysLeft = diff / (1000 * 60 * 60 * 24);
  return daysLeft > 0 && daysLeft <= days;
}

export function daysUntil(dueDate: string): number | null {
  const date = parseDate(dueDate);
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRelativeDueLabel(dueDate: string, status: string): string {
  if (status === "closed" || status === "verified") return "Completed";
  const days = daysUntil(dueDate);
  if (days === null) return dueDate;
  if (days < 0) return `Overdue ${Math.abs(days)} days`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days} days`;
  return formatDate(dueDate, "short");
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
