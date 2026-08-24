"use client";

import { useMemo, useState } from "react";
import { AVALON_ACTIVITIES, ACTIVITY_LABELS } from "@/lib/builds/types";
import type { AvalonActivity } from "@/lib/builds/types";
import { bestAvalonMove, resolveRecommendedBuilds } from "@/lib/avalon/bestMove";
import { RISK_LEVEL_LABELS, RISK_LEVEL_STYLES } from "@/lib/avalon/risk";
import { bestMountFor, mountsForActivity } from "@/lib/avalon/mounts";
import { MOUNT_RECOMMENDATIONS } from "@/lib/avalon/mounts";
import { buildWeaponFamily } from "@/lib/pvp/weapons";

const PLAYER_OPTIONS = [1, 2, 3, 5, 7];

interface AvalonOverviewProps {
  onOpenBuilds: (weaponFamily?: string) => void;
}

export function AvalonOverview({ onOpenBuilds }: AvalonOverviewProps) {
  const [activity, setActivity] = useState<AvalonActivity>("pve");
  const [players, setPlayers] = useState(3);
  const [tier, setTier] = useState(6);

  const move = useMemo(() => bestAvalonMove(activity, players, tier), [activity, players, tier]);
  const builds = useMemo(
    () => (move ? resolveRecommendedBuilds(move.recommendedBuildIds) : []),
    [move]
  );

  const mount = bestMountFor(activity);
  const mounts = mountsForActivity(activity);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Best Avalon Move</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as AvalonActivity)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-xs text-[var(--color-text)]"
            >
              {AVALON_ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
            <select
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-xs text-[var(--color-text)]"
            >
              {PLAYER_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p === 1 ? "Solo" : p === 7 ? "7 jugadores" : `${p} jugadores`}
                </option>
              ))}
            </select>
            <select
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-xs text-[var(--color-text)]"
            >
              {[4, 5, 6, 7, 8].map((t) => (
                <option key={t} value={t}>
                  Road T{t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {move && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--color-gold)]/10 px-2 py-0.5 text-[var(--color-gold)]">
                {move.activityLabel} · {players === 1 ? "solo" : `${players} jugadores`}
              </span>
              <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-text-dim)]">
                {move.recommendedTier}
              </span>
              <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-text-dim)]">
                ~{move.estimatedDurationMin} min estimados
              </span>
              <span className={`rounded-full px-2 py-0.5 ${RISK_LEVEL_STYLES[move.risk]}`}>
                Riesgo {RISK_LEVEL_LABELS[move.risk]}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-dim)]">{move.summary}</p>

            <div className="rounded-md bg-[var(--color-panel)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                Recommended Builds (← fuente: Builds)
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {builds.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onOpenBuilds(buildWeaponFamily(b))}
                    title="Ver build en la biblioteca de Builds"
                    className="rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 px-3 py-1 text-xs text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/15"
                  >
                    {b.name} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Montura recomendada — {ACTIVITY_LABELS[activity]}
        </h2>
        {mount && (
          <div className="mt-3 rounded-md bg-[var(--color-panel)] p-3">
            <p className="text-sm font-medium text-[var(--color-gold)]">{mount.name}</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">{mount.notes}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
              {mount.priceAvailable
                ? "Precio disponible en el dataset local"
                : "Datos de precio no disponibles para esta montura"}
            </p>
          </div>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {mounts.map((m) => (
            <div key={m.name} className="rounded-md bg-[var(--color-panel)] px-3 py-2 text-xs">
              <span className="font-medium text-[var(--color-text)]">{m.name}</span>
              <span className="text-[var(--color-text-dim)]"> — {m.notes}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          {MOUNT_RECOMMENDATIONS.length} monturas en el directorio de recomendación
        </p>
      </section>
    </div>
  );
}