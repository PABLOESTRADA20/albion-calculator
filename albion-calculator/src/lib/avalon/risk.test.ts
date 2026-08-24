import { describe, expect, it } from "vitest";
import { avalonRiskScore, riskLabel } from "./risk";

const base = {
  tier: 4,
  players: 7,
  activity: "pve",
  buildValue: 0,
  mountValue: 0,
  inventoryValue: 0,
  pvpExposure: 0,
  distanceFromExit: 0,
} as const;

describe("avalonRiskScore", () => {
  it("grupo grande en pve T4 cerca de la salida es riesgo bajo", () => {
    const r = avalonRiskScore({ ...base });
    expect(r.score).toBe(20); // base pve 15 + players>=7 (+5)
    expect(r.level).toBe("LOW");
  });

  it("transporte solitario en T8 con gear caro y lejos de la salida es extremo", () => {
    const r = avalonRiskScore({
      ...base,
      activity: "transport",
      tier: 8,
      players: 1,
      buildValue: 3_000_000,
      mountValue: 1_000_000,
      inventoryValue: 1_000_000,
      pvpExposure: 10,
      distanceFromExit: 10,
    });
    // 30 + 20 (T8) + 24 (solo) + 22 (5M) + 18 + 14 = 128 -> capped 100
    expect(r.score).toBe(100);
    expect(r.level).toBe("EXTREME");
    expect(r.reasons.some((x) => x.includes("Transporte"))).toBe(true);
  });

  it("niveles intermedios mapean a MEDIUM/HIGH", () => {
    const medium = avalonRiskScore({
      ...base,
      activity: "exploration",
      players: 3,
      pvpExposure: 5,
    });
    expect(medium.level).toBe("MEDIUM");

    const high = avalonRiskScore({
      ...base,
      activity: "gathering",
      tier: 6,
      players: 3,
      buildValue: 800_000,
      pvpExposure: 4,
      distanceFromExit: 3,
    });
    // 24 + 10 (T6) + 14 (3 jugadores) + 10 (800k) + 7.2 + 4.2 = 69
    expect(high.level).toBe("HIGH");
  });

  it("genera razones explicativas segun el perfil", () => {
    const r = avalonRiskScore({
      ...base,
      tier: 7,
      players: 1,
      distanceFromExit: 9,
    });
    expect(r.reasons.some((x) => x.startsWith("Road T7"))).toBe(true);
    expect(r.reasons.some((x) => x.includes("Solo"))).toBe(true);
    expect(r.reasons.some((x) => x.includes("Lejos de la salida"))).toBe(true);
  });
});

describe("riskLabel", () => {
  it("ignora el valor del equipo al calcular la etiqueta", () => {
    const withGear = riskLabel({
      tier: 4,
      players: 7,
      activity: "pve",
      pvpExposure: 0,
      distanceFromExit: 0,
    });
    expect(withGear).toBe("LOW");
  });
});
