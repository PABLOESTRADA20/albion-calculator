import { describe, expect, it } from "vitest";
import {
  formatPercent,
  formatSilver,
  marketPriceOrDash,
  profitClass,
} from "./format";

describe("formatSilver", () => {
  it("redondea al entero mas cercano", () => {
    expect(formatSilver(1234.6)).toBe((1235).toLocaleString("es-ES"));
    expect(formatSilver(999.2)).toBe((999).toLocaleString("es-ES"));
  });

  it("mantiene el signo negativo y los digitos", () => {
    const out = formatSilver(-1500);
    expect(out.startsWith("-")).toBe(true);
    expect(out.replace(/\D/g, "")).toBe("1500");
  });

  it("valores no finitos devuelven guion", () => {
    expect(formatSilver(Number.NaN)).toBe("—");
    expect(formatSilver(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("marketPriceOrDash", () => {
  it("precios 0 o negativos devuelven guion", () => {
    expect(marketPriceOrDash(0)).toBe("—");
    expect(marketPriceOrDash(-5)).toBe("—");
  });

  it("precios validos se formatean como plata", () => {
    expect(marketPriceOrDash(42000)).toBe((42000).toLocaleString("es-ES"));
  });
});

describe("formatPercent", () => {
  it("un decimal y espacio antes del simbolo", () => {
    expect(formatPercent(12.34)).toBe("12.3 %");
    expect(formatPercent(-3.75)).toBe("-3.8 %");
  });

  it("valores no finitos devuelven guion", () => {
    expect(formatPercent(Number.NaN)).toBe("—");
  });
});

describe("profitClass", () => {
  it("colorea ganancia, perdida y neutro", () => {
    expect(profitClass(1)).toBe("text-[var(--color-profit)]");
    expect(profitClass(-1)).toBe("text-[var(--color-loss)]");
    expect(profitClass(0)).toBe("text-[var(--color-text-dim)]");
  });
});
