import { describe, expect, it } from "vitest";
import type { PvpFight } from "./types";
import type { WeaponFamilyKey } from "./weapons";
import {
  countersFor,
  familyMeta,
  familyTrends,
  matchupsFor,
  MIN_FIGHTS,
  slotUsage,
} from "./analytics";

let seq = 0;
function fight(
  killerFamily: WeaponFamilyKey,
  victimFamily: WeaponFamilyKey,
  victimItems: { id: string; quality: number; slot: "weapon" }[] = []
): PvpFight {
  seq += 1;
  const actor = (family: WeaponFamilyKey) => ({
    id: `p-${seq}-${family}`,
    name: `Player ${seq}`,
    guildName: null,
    allianceName: null,
    fame: 0,
    killFame: 0,
    deathFame: 0,
    weaponFamily: family,
    items: [],
  });
  return {
    id: `f-${seq}`,
    timestamp: new Date(2026, 0, seq).toISOString(),
    locationId: null,
    groupMemberCount: 1,
    totalParticipants: 2,
    killer: actor(killerFamily),
    victim: { ...actor(victimFamily), items: victimItems },
  };
}

describe("matchupsFor", () => {
  const events = [
    // Sword gana 12 contra Bow
    ...Array.from({ length: 12 }, () => fight("Sword", "Bow")),
    // Sword pierde 20 contra Fire
    ...Array.from({ length: 20 }, () => fight("Fire", "Sword")),
    // Neutral vs Dagger: 5/11 = 45.45% (entre 0.45 y 0.55)
    ...Array.from({ length: 5 }, () => fight("Sword", "Dagger")),
    ...Array.from({ length: 6 }, () => fight("Dagger", "Sword")),
    // Muestra pequena vs Hammer: 2 victorias, no alcanza MIN_FIGHTS
    ...Array.from({ length: 2 }, () => fight("Sword", "Hammer")),
  ];

  it("agrega fights/wins por familia rival", () => {
    const r = matchupsFor(events, "Sword");
    expect(r.myFamily).toBe("Sword");
    expect(r.totalFights).toBe(12 + 20 + 11 + 2);
    const bow = r.matchups.find((m) => m.opponentFamily === "Bow")!;
    expect(bow).toMatchObject({ fights: 12, wins: 12, losses: 0 });
    const fire = r.matchups.find((m) => m.opponentFamily === "Fire")!;
    expect(fire).toMatchObject({ fights: 20, wins: 0 });
  });

  it("separa favorable / neutral / desfavorable con muestra minima", () => {
    const r = matchupsFor(events, "Sword");
    expect(MIN_FIGHTS).toBe(10);
    expect(r.favorable.map((m) => m.opponentFamily)).toEqual(["Bow"]);
    expect(r.unfavorable.map((m) => m.opponentFamily)).toEqual(["Fire"]);
    expect(r.neutral.map((m) => m.opponentFamily)).toEqual(["Dagger"]);
    // Hammer tiene WR 1.0 pero solo 2 fights: fuera de todas las listas
    expect(
      [...r.favorable, ...r.neutral, ...r.unfavorable].some(
        (m) => m.opponentFamily === "Hammer"
      )
    ).toBe(false);
  });

  it("sin eventos devuelve estructura vacia", () => {
    const r = matchupsFor([], "Bow");
    expect(r.matchups).toHaveLength(0);
    expect(r.totalFights).toBe(0);
    expect(r.favorable).toHaveLength(0);
  });
});

describe("familyMeta", () => {
  it("cuenta kills/deaths y calcula winRate y usage", () => {
    const events = [
      fight("Sword", "Fire"),
      fight("Sword", "Frost"),
      fight("Frost", "Sword"),
      fight("Holy", "Bow"),
    ];
    const meta = familyMeta(events);
    const sword = meta.find((m) => m.family === "Sword")!;
    expect(sword.kills).toBe(2);
    expect(sword.deaths).toBe(1);
    expect(sword.winRate).toBeCloseTo(2 / 3, 10);
    // usage sobre 4 eventos: 2 kills de Sword -> 50%
    expect(sword.usage).toBeCloseTo(50, 10);
    // ordenado por kills desc
    expect(meta[0].kills).toBeGreaterThanOrEqual(meta[meta.length - 1].kills);
  });

  it("con cero eventos no divide por cero", () => {
    const meta = familyMeta([]);
    expect(meta).toHaveLength(0);
  });
});

describe("countersFor", () => {
  it("encuentra counters con muestra minima y excluye espejos", () => {
    const events = [
      ...Array.from({ length: 15 }, () => fight("Sword", "Fire")),
      ...Array.from({ length: 3 }, () => fight("Dagger", "Fire")), // < min
      ...Array.from({ length: 4 }, () => fight("Fire", "Fire")), // mismo family, ignorado
    ];
    const counters = countersFor(events, "Fire");
    expect(counters.map((c) => c.counterFamily)).toEqual(["Sword"]);
    expect(counters[0]).toMatchObject({ fights: 15, wins: 15, losses: 0, winRate: 1 });
  });

  it("familia sin datos devuelve lista vacia", () => {
    expect(countersFor([fight("Sword", "Bow")], "Fire")).toHaveLength(0);
  });
});

describe("familyTrends", () => {
  it("clasifica rising/falling/stable segun crecimiento", () => {
    const prev = Array.from({ length: 10 }, () => fight("Bow", "Sword"));
    const risingNow = Array.from({ length: 15 }, () => fight("Bow", "Dagger"));
    const fallingPrev = Array.from({ length: 20 }, () => fight("Fire", "Sword"));
    const fallingNow = Array.from({ length: 10 }, () => fight("Fire", "Dagger"));
    const stablePrev = Array.from({ length: 10 }, () => fight("Holy", "Sword"));
    const stableNow = Array.from({ length: 11 }, () => fight("Holy", "Dagger"));

    const trends = familyTrends(prev.concat(fallingPrev, stablePrev), [
      ...risingNow,
      ...fallingNow,
      ...stableNow,
    ]);
    const byFamily = Object.fromEntries(trends.map((t) => [t.family, t]));
    expect(byFamily["Bow"].trend).toBe("rising"); // +50%
    expect(byFamily["Fire"].trend).toBe("falling"); // -50%
    expect(byFamily["Holy"].trend).toBe("stable"); // +10%
  });

  it("muestras insuficientes marcan insufficient", () => {
    const trends = familyTrends(
      Array.from({ length: 3 }, () => fight("Bow", "Sword")),
      Array.from({ length: 9 }, () => fight("Bow", "Dagger"))
    );
    expect(trends.find((t) => t.family === "Bow")!.trend).toBe("insufficient");
  });

  it("sin historial previo el growth es 1", () => {
    const trends = familyTrends(
      [],
      Array.from({ length: 12 }, () => fight("Bow", "Sword"))
    );
    const bow = trends.find((t) => t.family === "Bow")!;
    expect(bow.previousKills).toBe(0);
    expect(bow.growth).toBe(1);
    expect(bow.trend).toBe("insufficient");
  });
});

describe("slotUsage", () => {
  it("agrega items de victimas por slot con minimo de muertes", () => {
    const events = [
      ...Array.from({ length: 6 }, () =>
        fight("Sword", "Bow", [{ id: "T4_2H_BOW", quality: 1, slot: "weapon" }])
      ),
      ...Array.from({ length: 2 }, () =>
        fight("Fire", "Frost", [
          { id: "T4_2H_BOW", quality: 1, slot: "weapon" },
          { id: "T5_MAIN_FIRESTAFF", quality: 1, slot: "weapon" },
        ])
      ),
    ];
    const usage = slotUsage(events, 5);
    expect(usage.weapon![0]).toMatchObject({
      itemId: "T4_2H_BOW",
      deaths: 8,
    });
    // T5 staff solo aparece 2 veces: filtrado por minDeaths
    expect(usage.weapon!.find((s) => s.itemId === "T5_MAIN_FIRESTAFF")).toBeUndefined();
  });
});
