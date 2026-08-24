"use client";

import { useMemo, useState } from "react";
import { BuildCard } from "@/components/builds/BuildCard";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { Build, BuildMode } from "@/lib/builds/types";
import { PVE_BUILDS } from "@/data/builds/pve";
import { PVE_CATEGORIES_LIST } from "@/data/builds/pve";
import { PVP_BUILDS } from "@/data/builds/pvp";
import { PVP_CATEGORIES_LIST } from "@/data/builds/pvp";
import { AVALON_BUILDS, avalonBuildsByKind } from "@/data/avalon";
import { AVALON_BUILD_KINDS, AVALON_KIND_LABELS } from "@/lib/builds/types";
import { buildWeaponFamily } from "@/lib/pvp/weapons";

type LibraryMode = BuildMode | "avalon";

interface BuildLibraryProps {
  onOptimize: (build: Build) => void;
  /** Filtro de familia de arma (desde PvP Analytics / Avalon). */
  weaponFamily?: string;
  onClearWeaponFilter?: () => void;
}

export function BuildLibrary({ onOptimize, weaponFamily, onClearWeaponFilter }: BuildLibraryProps) {
  const [mode, setMode] = useState<LibraryMode>("pvp");
  const [category, setCategory] = useState<string>("all");
  const [avalonKind, setAvalonKind] = useState<string>("all");

  const isAvalon = mode === "avalon";

  const builds: Build[] = isAvalon
    ? avalonKind === "all"
      ? AVALON_BUILDS
      : avalonBuildsByKind(avalonKind as (typeof AVALON_BUILD_KINDS)[number])
    : mode === "pvp"
      ? PVP_BUILDS
      : PVE_BUILDS;

  const categories = !isAvalon
    ? mode === "pvp"
      ? PVP_CATEGORIES_LIST
      : PVE_CATEGORIES_LIST
    : null;

  const filtered = useMemo(
    () =>
      builds.filter(
        (b) =>
          (category === "all" || b.category === category) &&
          (!weaponFamily || buildWeaponFamily(b) === weaponFamily)
      ),
    [builds, category, weaponFamily]
  );

  const modeTabs = [
    { id: "pvp", label: "PvP", content: null },
    { id: "pve", label: "PvE", content: null },
    { id: "avalon", label: "Avalon", content: null },
  ];

  return (
    <div>
      {weaponFamily && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 px-3 py-2">
          <p className="text-xs text-[var(--color-text)]">
            Filtro de PvP Analytics: arma <span className="font-semibold text-[var(--color-gold)]">{weaponFamily}</span>
          </p>
          <button
            onClick={onClearWeaponFilter}
            className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
          >
            Quitar filtro
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DirectionAwareTabs
          tabs={modeTabs}
          activeId={mode}
          onActiveChange={(id) => {
            setMode(id as LibraryMode);
            setCategory("all");
            setAvalonKind("all");
          }}
        />
      </div>

      {isAvalon && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setAvalonKind("all")}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              avalonKind === "all"
                ? "bg-[var(--color-gold)] text-black"
                : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            }`}
          >
            Todas ({AVALON_BUILDS.length})
          </button>
          {AVALON_BUILD_KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setAvalonKind(k)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                avalonKind === k
                  ? "bg-[var(--color-gold)] text-black"
                  : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              {AVALON_KIND_LABELS[k]} ({avalonBuildsByKind(k).length})
            </button>
          ))}
        </div>
      )}

      {!isAvalon && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              category === "all"
                ? "bg-[var(--color-gold)] text-black"
                : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            }`}
          >
            Todas
          </button>
          {categories!.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                category === c
                  ? "bg-[var(--color-gold)] text-black"
                  : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-4 text-sm text-[var(--color-text-dim)]">
          {weaponFamily
            ? `No hay builds del catálogo con el arma «${weaponFamily}» para estos filtros.`
            : "Sin builds para estos filtros."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((build) => (
            <BuildCard key={build.id} build={build} onOptimize={onOptimize} />
          ))}
        </div>
      )}
    </div>
  );
}