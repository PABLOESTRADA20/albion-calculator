"use client";

import { useMemo, useState } from "react";
import { recommendAvalonBuilds } from "@/lib/avalon/recommender";
import { AVALON_ACTIVITIES, ACTIVITY_LABELS, BUILD_ROLES, ROLE_LABELS } from "@/lib/builds/types";
import type { AvalonActivity, BuildRole } from "@/lib/builds/types";
import type { PriceProvider } from "@/types/albion";
import { AvalonBuildCard } from "@/components/avalon/AvalonBuildCard";

interface BuildRecommenderProps {
  provider: PriceProvider;
}

export function BuildRecommender({ provider }: BuildRecommenderProps) {
  const [activity, setActivity] = useState<AvalonActivity>("pve");
  const [groupSize, setGroupSize] = useState<"solo" | "duo" | "group">("solo");
  const [role, setRole] = useState<BuildRole | "flex">("dps");
  const [tier, setTier] = useState(6);
  const [budget, setBudget] = useState(500_000);
  const [escapeFocus, setEscapeFocus] = useState(false);

  const results = useMemo(
    () =>
      recommendAvalonBuilds({
        activity,
        groupSize,
        role,
        tier,
        budgetMax: budget > 0 ? budget : null,
        escapeFocus,
      }),
    [activity, groupSize, role, tier, budget, escapeFocus]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Asistente de build para Roads</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Actividad</span>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as AvalonActivity)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
            >
              {AVALON_ACTIVITIES.filter((a) => a !== "gathering" && a !== "transport").map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Tamaño de grupo</span>
            <select
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value as "solo" | "duo" | "group")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="group">Grupo (3+)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Rol</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as BuildRole | "flex")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
            >
              {BUILD_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
              <option value="flex">Flexible</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Tier recomendado</span>
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
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
              Presupuesto (plata, 0 = sin límite)
            </span>
            <input
              type="number"
              min={0}
              step={50000}
              value={budget}
              onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-text)]"
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-xs text-[var(--color-text-dim)]">
            <input
              type="checkbox"
              checked={escapeFocus}
              onChange={(e) => setEscapeFocus(e.target.checked)}
              className="accent-[var(--color-gold)]"
            />
            Priorizar supervivencia / escape
          </label>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 text-sm text-[var(--color-text-dim)]">
          No hay builds en el catálogo que encajen con ese perfil. Ajusta actividad o rol.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((b) => (
            <AvalonBuildCard key={b.id} provider={provider} build={b} />
          ))}
        </div>
      )}
    </div>
  );
}