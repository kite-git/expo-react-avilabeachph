// Parses a typed peso amount like "1,250.50". Returns null for anything that is not a positive amount with at most 2 decimals.
export function parseAmount(text: string): number | null {
  const s = text.replace(/,/g, '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return n > 0 ? n : null;
}
