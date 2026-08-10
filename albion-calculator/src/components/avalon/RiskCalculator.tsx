"use client";

import { useMemo, useState } from "react";
import { avalonRiskScore } from "@/lib/avalon/risk";
import { RISK_LEVEL_LABELS, RISK_LEVEL_STYLES } from "@/lib/avalon/risk";
import type { AvalonActivity } from "@/lib/builds/types";
import { AVALON_ACTIVITIES, ACTIVITY_LABELS } from "@/lib/builds/types";

export function RiskCalculator() {
  const [tier, setTier] = useState(6);
  const [players, setPlayers] = useState(3);
  const [activity, setActivity] = useState<AvalonActivity>("loot");
  const [buildValue, setBuildValue] = useState(400_000);
  const [mountValue, setMountValue] = useState(200_000);
  const [inventoryValue, setInventoryValue] = useState(500_000);
  const [pvpExposure, setPvpExposure] = useState(5);
  const [distanceFromExit, setDistanceFromExit] = useState(4);

  const result = useMemo(
    () =>
      avalonRiskScore({
        tier,
        players,
        activity,
        buildValue,
        mountValue,
        inventoryValue,
        pvpExposure,
        distanceFromExit,
      }),
    [tier, players, activity, buildValue, mountValue, inventoryValue, pvpExposure, distanceFromExit]
  );

  const numField = (label: string, value: number, onChange: (v: number) => void) => (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">{label}</span>
      <input
        type="number"
        min={0}
        step={50000}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
      />
    </label>
  );

  const slider = (label: string, value: number, onChange: (v: number) => void) => (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
        <span>{label}</span>
        <span className="text-[var(--color-gold)]">{value}/10</span>
      </span>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-gold)]"
      />
    </label>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Perfil de la salida</h3>
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
          <label className="block sm:col-span-2">
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
        </div>
        {numField("Valor de la build (plata)", buildValue, setBuildValue)}
        {numField("Valor de la montura (plata)", mountValue, setMountValue)}
        {numField("Valor del inventario (plata)", inventoryValue, setInventoryValue)}
        {slider("Exposición PvP", pvpExposure, setPvpExposure)}
        {slider("Distancia a la salida", distanceFromExit, setDistanceFromExit)}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">AVALON RISK SCORE</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_LEVEL_STYLES[result.level]}`}>
            {RISK_LEVEL_LABELS[result.level]}
          </span>
        </div>
        <p className="mt-4 text-4xl font-bold text-[var(--color-text)]">
          {result.score}
          <span className="text-lg font-normal text-[var(--color-text-dim)]">/100</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-panel)]">
          <div
            className={`h-full rounded-full transition-all ${
              result.level === "LOW"
                ? "bg-emerald-500"
                : result.level === "MEDIUM"
                  ? "bg-amber-500"
                  : result.level === "HIGH"
                    ? "bg-orange-500"
                    : "bg-red-500"
            }`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <ul className="mt-4 space-y-1.5">
          {result.reasons.map((r) => (
            <li key={r} className="flex items-start gap-2 text-xs text-[var(--color-text-dim)]">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          Heurística documentada basada en tu perfil; no sustituye el criterio en la road.
        </p>
      </div>
    </div>
  );
}