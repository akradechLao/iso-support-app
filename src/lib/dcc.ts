export const DCC_BASE_URL = "https://app.etc1992.com/dcc";

export function resolveDccUrl(dccPath?: string | null): string | null {
  if (!dccPath) return null;
  const trimmed = dccPath.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return DCC_BASE_URL;
}

export function hasDccLink(dccPath?: string | null): boolean {
  return Boolean(dccPath && dccPath.trim());
}
