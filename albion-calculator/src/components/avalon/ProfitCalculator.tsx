"use client";

import { useMemo, useState } from "react";
import { estimateAvalonRun } from "@/lib/avalon/profit";
import { RISK_LEVEL_LABELS, RISK_LEVEL_STYLES } from "@/lib/avalon/risk";
import type { AvalonActivity } from "@/lib/builds/types";
import { AVALON_ACTIVITIES, ACTIVITY_LABELS } from "@/lib/builds/types";

export function ProfitCalculator() {
  const [tier, setTier] = useState(6);
  const [players, setPlayers] = useState(3);
  const [activity, setActivity] = useState<AvalonActivity>("pve");
  const [durationMin, setDurationMin] = useState(60);
  const [expectedLoot, setExpectedLoot] = useState(1_500_000);
  const [buildCost, setBuildCost] = useState(400_000);
  const [mountCost, setMountCost] = useState(200_000);
  const [consumablesPerPlayer, setConsumablesPerPlayer] = useState(25_000);
  const [repairPct, setRepairPct] = useState(15);
  const [premium, setPremium] = useState(true);
  const [pvpExposure, setPvpExposure] = useState(4);
  const [distanceFromExit, setDistanceFromExit] = useState(4);

  const result = useMemo(
    () =>
      estimateAvalonRun({
        tier,
        players,
        durationMin,
        activity,
        buildCost,
        mountCost,
        expectedLoot,
        consumablesPerPlayer,
        repairPct,
        premium,
        pvpExposure,
        distanceFromExit,
      }),
    [tier, players, durationMin, activity, buildCost, mountCost, expectedLoot, consumablesPerPlayer, repairPct, premium, pvpExposure, distanceFromExit]
  );

  const fmt = (v: number) => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  const field = (label: string, value: number, onChange: (v: number) => void) => (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
      />
    </label>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Supuestos de la expedición</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Road tier</span>
            <select
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
            >
              {[4, 5, 6, 7, 8].map((t) => (
                <option key={t} value={t}>
                  T{t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Jugadores</span>
            <select
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
            >
              {[1, 2, 3, 5, 7].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Actividad</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as AvalonActivity)}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {AVALON_ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {ACTIVITY_LABELS[a]}
              </option>
            ))}
          </select>
        </label>
        {field("Duración de la sesión (min)", durationMin, setDurationMin)}
        {field("Loot esperado total (plata)", expectedLoot, setExpectedLoot)}
        {field("Coste de la build (plata)", buildCost, setBuildCost)}
        {field("Coste de la montura (plata)", mountCost, setMountCost)}
        {field("Consumibles por jugador (plata)", consumablesPerPlayer, setConsumablesPerPlayer)}
        <label className="block">
          <span className="mb-1 flex justify-between text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            <span>Reparación estimada (% del gear)</span>
            <span className="text-[var(--color-gold)]">{repairPct}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={repairPct}
            onChange={(e) => setRepairPct(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)]"
          />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            <span>Exposición PvP de la actividad</span>
            <span className="text-[var(--color-gold)]">{pvpExposure}/10</span>
          </span>
          <input
            type="range"
            min={0}
            max={10}
            value={pvpExposure}
            onChange={(e) => setPvpExposure(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)]"
          />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            <span>Distancia media a la salida</span>
            <span className="text-[var(--color-gold)]">{distanceFromExit}/10</span>
          </span>
          <input
            type="range"
            min={0}
            max={10}
            value={distanceFromExit}
            onChange={(e) => setDistanceFromExit(Number(e.target.value))}
            className="w-full accent-[var(--color-gold)]"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <input
            type="checkbox"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
            className="accent-[var(--color-gold)]"
          />
          Counter premium (impuesto de venta reducido)
        </label>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Resultado estimado</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RISK_LEVEL_STYLES[result.risk]}`}>
              Riesgo {RISK_LEVEL_LABELS[result.risk]}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Loot esperado" value={fmt(result.expectedLoot)} />
            <Stat label="Gastos (consumibles + reparación)" value={fmt(result.consumables + result.repairCost)} />
            <Stat label="Impuestos de venta" value={fmt(result.marketFees)} />
            <Stat label="Beneficio neto" value={fmt(result.net)} highlight={result.net >= 0} />
            <Stat label="Por jugador" value={fmt(result.perPlayer)} />
            <Stat label="Por hora (neto)" value={fmt(result.perHour)} />
            <Stat
              label="Neto tras comprar gear"
              value={fmt(result.netAfterBuy)}
              highlight={result.netAfterBuy >= 0}
            />
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          Estimación orientativa: el loot esperado y la reparación son supuestos que tú introduces.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md bg-[var(--color-panel)] p-3">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${highlight ? "text-emerald-400" : "text-[var(--color-text)]"}`}>
        {value}
      </p>
    </div>
  );
}