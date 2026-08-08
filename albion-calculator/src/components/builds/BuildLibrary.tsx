"use client";

import { useMemo, useState } from "react";
import { BuildCard } from "@/components/builds/BuildCard";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { Build, BuildMode } from "@/lib/builds/types";
import { PVE_BUILDS } from "@/data/builds/pve";
import { PVE_CATEGORIES_LIST } from "@/data/builds/pve";
import { PVP_BUILDS } from "@/data/builds/pvp";
import { PVP_CATEGORIES_LIST } from "@/data/builds/pvp";

interface BuildLibraryProps {
  onOptimize: (build: Build) => void;
}

export function BuildLibrary({ onOptimize }: BuildLibraryProps) {
  const [mode, setMode] = useState<BuildMode>("pvp");
  const [category, setCategory] = useState<string>("all");

  const builds = mode === "pvp" ? PVP_BUILDS : PVE_BUILDS;
  const categories =
    mode === "pvp" ? PVP_CATEGORIES_LIST : PVE_CATEGORIES_LIST;

  const filtered = useMemo(
    () =>
      category === "all"
        ? builds
        : builds.filter((b) => b.category === category),
    [builds, category]
  );

  const modeTabs = [
    { id: "pvp", label: "PvP", content: null },
    { id: "pve", label: "PvE", content: null },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DirectionAwareTabs
          tabs={modeTabs}
          activeId={mode}
          onActiveChange={(id) => {
            setMode(id as BuildMode);
            setCategory("all");
          }}
        />
      </div>

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
        {categories.map((c) => (
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

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((build) => (
          <BuildCard key={build.id} build={build} onOptimize={onOptimize} />
        ))}
      </div>
    </div>
  );
}
