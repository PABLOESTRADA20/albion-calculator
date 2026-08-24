import { afterEach, describe, expect, it } from "vitest";
import type { City, Quality } from "@/types/albion";
import {
  evaluateAlerts,
  loadAlerts,
  saveAlerts,
  upsertAlert,
  type PriceAlert,
} from "./alerts";

function alert(partial: Partial<PriceAlert>): PriceAlert {
  return {
    id: "a1",
    itemId: "T4_METALBAR",
    quality: 1 as Quality,
    city: "Bridgewatch" as City | null,
    direction: "below",
    threshold: 100,
    active: true,
    ...partial,
  };
}

describe("upsertAlert", () => {
  it("añade la alerta con id y active sin mutar el array original", () => {
    const existing: PriceAlert[] = [alert({ id: "a0", threshold: 50 })];
    const next = upsertAlert(existing, {
      itemId: "T4_PLANKS",
      quality: 1,
      city: null,
      direction: "above",
      threshold: 200,
    });
    expect(next).toHaveLength(2);
    expect(existing).toHaveLength(1);
    expect(next[1].active).toBe(true);
    expect(next[1].id).toBeTruthy();
    expect(next[1].itemId).toBe("T4_PLANKS");
  });
});

describe("evaluateAlerts", () => {
  const alerts: PriceAlert[] = [
    alert({ id: "below-hit", direction: "below", threshold: 100 }),
    alert({ id: "below-miss", direction: "below", threshold: 50 }),
    alert({ id: "above-hit", direction: "above", threshold: 80 }),
    alert({ id: "inactive", direction: "below", threshold: 100, active: false }),
    alert({ id: "no-price", direction: "below", threshold: 100, itemId: "SIN_DATOS" }),
    alert({ id: "zero-price", direction: "below", threshold: 100, itemId: "PRECIO_CERO" }),
  ];

  it("dispara solo las alertas activas cuya condicion se cumple", () => {
    const prices = new Map<string, number>([
      ["T4_METALBAR", 90], // below-hit (90<=100) y above-hit (90>=80)
      ["PRECIO_CERO", 0],
    ]);
    const fired = evaluateAlerts(alerts, prices);
    expect(fired.map((a) => a.id)).toEqual(["below-hit", "above-hit"]);
  });

  it("direction above exige precio >= umbral", () => {
    const prices = new Map<string, number>([["T4_METALBAR", 80]]);
    expect(evaluateAlerts(alerts, prices).map((a) => a.id)).toContain(
      "above-hit"
    );
    const lower = new Map<string, number>([["T4_METALBAR", 79.99]]);
    expect(evaluateAlerts(alerts, lower).map((a) => a.id)).not.toContain(
      "above-hit"
    );
  });
});

describe("persistencia en localStorage", () => {
  const fakeStorage = (() => {
    let data = "";
    return {
      getItem: () => data,
      setItem: (_k: string, v: string) => {
        data = v;
      },
    };
  })();

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("guarda y recupera alertas redondas", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: fakeStorage,
    };
    const alerts: PriceAlert[] = [
      alert({ id: "x1", threshold: 123 }),
    ];
    saveAlerts(alerts);
    expect(loadAlerts()).toEqual(alerts);
  });

  it("sin window devuelve vacio y no guarda nada", () => {
    expect(loadAlerts()).toEqual([]);
    expect(() => saveAlerts([alert({})])).not.toThrow();
  });

  it("json corrupto no revienta y devuelve vacio", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: { getItem: () => "{corrupto", setItem: () => {} },
    };
    expect(loadAlerts()).toEqual([]);
  });

  it("un json que no es array devuelve vacio", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: { getItem: () => '{"a":1}', setItem: () => {} },
    };
    expect(loadAlerts()).toEqual([]);
  });
});
