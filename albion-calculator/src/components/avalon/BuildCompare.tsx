"use client";

import { useMemo, useState } from "react";
import { AVALON_BUILDS } from "@/data/avalon";
import type { Build } from "@/lib/builds/types";
import { buildItemId } from "@/lib/builds/types";
import { itemName } from "@/lib/builds/items";
import type { PriceProvider } from "@/types/albion";
import { ItemIcon } from "@/components/ItemIcon";
import { BuildCostPanel } from "@/components/avalon/BuildCostPanel";
import { ACTIVITY_LABELS, AVALON_KIND_LABELS, DIFFICULTY_LABELS, ROLE_LABELS } from "@/lib/builds/types";

interface BuildCompareProps {
  provider: PriceProvider;
}

export function BuildCompare({ provider }: BuildCompareProps) {
  const [leftId, setLeftId] = useState("avalon-battleaxe");
  const [rightId, setRightId] = useState("avalon-druidic");

  const left = AVALON_BUILDS.find((b) => b.id === leftId) ?? null;
  const right = AVALON_BUILDS.find((b) => b.id === rightId) ?? null;

  const buildOptions = useMemo(
    () =>
      AVALON_BUILDS.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      )),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={leftId}
          onChange={(e) => setLeftId(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
        >
          {buildOptions}
        </select>
        <span className="text-xs text-[var(--color-text-dim)]">vs</span>
        <select
          value={rightId}
          onChange={(e) => setRightId(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
        >
          {buildOptions}
        </select>
      </div>

      {left && right && (
        <div className="grid gap-3 md:grid-cols-2">
          <CompareColumn provider={provider} build={left} accent="text-[var(--color-gold)]" />
          <CompareColumn provider={provider} build={right} accent="text-emerald-400" />
        </div>
      )}
    </div>
  );
}

function CompareColumn({
  provider,
  build,
  accent,
}: {
  provider: PriceProvider;
  build: Build;
  accent: string;
}) {
  const [showCost, setShowCost] = useState(false);
  const slotNames = ["weapon", "offhand", "head", "chest", "shoes", "cape", "potion", "mount"] as const;

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
      <h3 className={`text-sm font-semibold ${accent}`}>{build.name}</h3>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {build.kind && (
          <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
            {AVALON_KIND_LABELS[build.kind]}
          </span>
        )}
        {build.activity && (
          <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
            {ACTIVITY_LABELS[build.activity]}
          </span>
        )}
        {build.roleType && (
          <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
            {ROLE_LABELS[build.roleType]}
          </span>
        )}
        <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
          {DIFFICULTY_LABELS[build.difficulty]}
        </span>
        {build.tierRecommendation && (
          <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
            {build.tierRecommendation}
          </span>
        )}
      </div>

      {build.scores && (
        <div className="mt-3 grid grid-cols-4 gap-1 text-center">
          {(
            [
              ["PvE", build.scores.pve],
              ["PvP", build.scores.pvp],
              ["Mov", build.scores.mobility],
              ["Sup", build.scores.survivability],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--color-panel)] px-1 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{label}</p>
              <p className={`text-sm font-semibold ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <ul className="mt-3 space-y-1">
        {slotNames.map((slot) => {
          const spec = build.items.find((s) => s.slot === slot);
          if (!spec) return null;
          const id = buildItemId(spec);
          return (
            <li key={slot} className="flex items-center gap-2 rounded-md bg-[var(--color-panel)] px-2 py-1.5">
              <ItemIcon itemId={id} size={20} className="shrink-0" />
              <span className="truncate text-xs text-[var(--color-text)]">{spec.label ?? itemName(id)}</span>
              <span className="ml-auto text-[10px] text-[var(--color-text-dim)]">
                T{spec.tier}
                {spec.enchant > 0 ? `.${spec.enchant}` : ""}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setShowCost((s) => !s)}
        className="mt-3 rounded-md border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/20"
      >
        {showCost ? "Ocultar coste" : "Calcular coste de compra"}
      </button>
      {showCost && <BuildCostPanel provider={provider} items={build.items} refreshKey={`cmp-${build.id}`} />}
    </article>
  );
}