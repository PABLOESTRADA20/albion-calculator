export function formatSilver(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toLocaleString("es-ES");
  return `${sign}${digits}`;
}

export function marketPriceOrDash(value: number): string {
  if (value <= 0) return "—";
  return formatSilver(value);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} %`;
}

export function profitClass(value: number): string {
  if (value > 0) return "text-[var(--color-profit)]";
  if (value < 0) return "text-[var(--color-loss)]";
  return "text-[var(--color-text-dim)]";
}
