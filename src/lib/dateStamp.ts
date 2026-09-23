export function thaiDateToIso(d: string): string {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const parts = d.split(/[\/\-]/);
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  let y = parseInt(year, 10);
  if (y < 100) y += 2500;
  if (y > 2400) y -= 543;
  return `${String(y).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isoToThaiDate(iso: string): string {
  if (!iso) return "";
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const year = parseInt(y, 10);
  const buddhist = year > 1900 ? year + 543 : year;
  const short = buddhist % 100;
  return `${parseInt(d, 10)}/${parseInt(m, 10)}/${String(short).padStart(2, "0")}`;
}

export function todayStamp(): string {
  const d = new Date();
  return isoToThaiDate(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  );
}
