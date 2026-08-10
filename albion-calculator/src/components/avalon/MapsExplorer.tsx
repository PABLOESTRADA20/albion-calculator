"use client";

import { useMemo, useState } from "react";
import { AVALON_MAP_CATALOG } from "@/lib/avalon/maps";
import { CHEST_LABELS, RESOURCE_LABELS } from "@/lib/avalon/maps";
import type { AvalonMap, ChestKind, ResourceKind } from "@/lib/avalon/maps";

export function MapsExplorer() {
  const [tiers, setTiers] = useState<number[]>([]);
  const [resources, setResources] = useState<ResourceKind[]>([]);
  const [chests, setChests] = useState<ChestKind[]>([]);
  const [dungeons, setDungeons] = useState<string[]>([]);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const maps = useMemo(
    () =>
      AVALON_MAP_CATALOG.filter((m: AvalonMap) => {
        if (tiers.length > 0 && !tiers.includes(m.tier)) return false;
        if (resources.length > 0 && !resources.every((r) => m.resources.includes(r))) return false;
        if (chests.length > 0 && !chests.every((c) => m.chests.includes(c))) return false;
        if (dungeons.includes("solo") && !m.soloDungeon) return false;
        if (dungeons.includes("group") && !m.groupDungeon) return false;
        return true;
      }),
    [tiers, resources, chests, dungeons]
  );

  const statCell = (value: number | null) =>
    value === null ? (
      <span className="text-[var(--color-text-dim)]">Datos no disponibles</span>
    ) : (
      <span className="text-[var(--color-text)]">{value}</span>
    );

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-[var(--color-text-dim)]">
        Directorio de mapas de Roads of Avalon. La infraestructura estadística está
        preparada, pero no existen datos públicos estructurados de densidad por mapa:
        los campos numéricos muestran «Datos no disponibles» en lugar de inventar cifras.
      </p>

      <div className="flex flex-wrap gap-2">
        <FilterGroup label="Tier">
          {[4, 6, 8].map((t) => (
            <FilterChip key={t} active={tiers.includes(t)} onClick={() => setTiers(toggle(tiers, t))}>
              T{t}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Recursos">
          {(Object.keys(RESOURCE_LABELS) as ResourceKind[]).map((r) => (
            <FilterChip
              key={r}
              active={resources.includes(r)}
              onClick={() => setResources(toggle(resources, r))}
            >
              {RESOURCE_LABELS[r]}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Cofres">
          {(Object.keys(CHEST_LABELS) as ChestKind[]).map((c) => (
            <FilterChip key={c} active={chests.includes(c)} onClick={() => setChests(toggle(chests, c))}>
              {CHEST_LABELS[c]}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Dungeons">
          {["solo", "group"].map((d) => (
            <FilterChip key={d} active={dungeons.includes(d)} onClick={() => setDungeons(toggle(dungeons, d))}>
              {d === "solo" ? "Solo" : "Grupo"}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      {maps.length === 0 ? (
        <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 text-sm text-[var(--color-text-dim)]">
          Ningún mapa coincide con los filtros seleccionados.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                <th className="px-3 py-2">Mapa</th>
                <th className="px-3 py-2">Recursos</th>
                <th className="px-3 py-2">Cofres</th>
                <th className="px-3 py-2">Dungeons</th>
                <th className="px-3 py-2">Densidad recurso</th>
                <th className="px-3 py-2">Densidad cofres</th>
                <th className="px-3 py-2">Peligro estimado</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((m) => (
                <tr key={m.id} className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
                  <td className="px-3 py-2">
                    <p className="font-medium text-[var(--color-text)]">{m.name}</p>
                    <p className="text-[10px] text-[var(--color-text-dim)]">{m.specialLocations.join(", ")}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--color-text-dim)]">
                    {m.resources.map((r) => RESOURCE_LABELS[r]).join(", ")}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--color-text-dim)]">
                    {m.chests.map((c) => CHEST_LABELS[c]).join(", ")}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--color-text-dim)]">
                    {[
                      m.soloDungeon ? "Solo" : null,
                      m.groupDungeon ? "Grupo" : null,
                      m.portals ? "Portales" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{statCell(m.stats.resourceDensity)}</td>
                  <td className="px-3 py-2 text-xs">{statCell(m.stats.chestDensity)}</td>
                  <td className="px-3 py-2 text-xs">{statCell(m.stats.estimatedDanger)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-[var(--color-text-dim)]">{label}</span>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        active
          ? "bg-[var(--color-gold)] text-black"
          : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}