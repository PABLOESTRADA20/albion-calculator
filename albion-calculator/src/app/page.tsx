"use client";

import { useCallback, useMemo, useState } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import { GridBeam } from "@/components/GridBeam";
import { ServerSelector } from "@/components/ServerSelector";
import { PriceSourceToggle } from "@/components/PriceSourceToggle";
import { MarketSection } from "@/components/market/MarketSection";
import { AlertsPanel } from "@/components/market/AlertsPanel";
import { CraftingSection } from "@/components/calculators/CraftingSection";
import { RefiningSection } from "@/components/calculators/RefiningSection";
import { FlippingSection } from "@/components/calculators/FlippingSection";
import { BuildsSection } from "@/components/builds/BuildsSection";
import { AvalonSection } from "@/components/avalon/AvalonSection";
import { PvpSection } from "@/components/pvp/PvpSection";
import { ApiPriceProvider } from "@/lib/pricing/apiPriceProvider";
import { ManualPriceProvider } from "@/lib/pricing/manualPriceProvider";
import { ApiHistoryProvider } from "@/lib/history/historyProvider";
import type { PriceProvider, ServerId } from "@/types/albion";

function Dashboard({
  provider,
  onNavigate,
}: {
  provider: PriceProvider;
  onNavigate: (section: string) => void;
}) {
  const modules: { id: string; title: string; desc: string }[] = [
    { id: "market", title: "Mercado", desc: "Dónde comprar y vender cada item" },
    { id: "builds", title: "Builds", desc: "Biblioteca PvP/PvE y coste de equipamiento" },
    { id: "crafting", title: "Crafteo", desc: "Beneficio fabricando items" },
    { id: "refining", title: "Refinado", desc: "Beneficio refinando recursos" },
    { id: "flipping", title: "Flipping", desc: "Compra y venta de órdenes" },
    { id: "avalon", title: "Roads of Avalon", desc: "Builds, mapas, rutas y riesgo del contenido de Roads" },
    {
      id: "pvp",
      title: "PvP Analytics",
      desc: "Players, matchups, counters, meta, fight history, rankings y live feed",
    },
  ];

  const trackMouse = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--mx",
      `${((e.clientX - rect.left) / rect.width) * 100}%`
    );
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onNavigate(m.id)}
            onMouseMove={trackMouse}
            className="module-card group rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-left backdrop-blur-md"
          >
            <span className="hud-corner left-1.5 top-1.5 border-l border-t" />
            <span className="hud-corner right-1.5 top-1.5 border-r border-t" />
            <span className="hud-corner bottom-1.5 left-1.5 border-b border-l" />
            <span className="hud-corner bottom-1.5 right-1.5 border-b border-r" />
            <p className="relative text-sm font-semibold tracking-wide text-[var(--color-text)] transition-colors group-hover:text-[var(--color-gold)] group-hover:drop-shadow-[0_0_10px_rgba(255,216,138,0.45)]">
              {m.title}
            </p>
            <p className="relative mt-1 text-xs leading-relaxed text-[var(--color-text-dim)]">
              {m.desc}
            </p>
          </button>
        ))}
      </div>
      <AlertsPanel provider={provider} />
    </div>
  );
}

export default function Home() {
  const [serverId, setServerId] = useState<ServerId>("europe");
  const [priceSource, setPriceSource] = useState<"api" | "manual">("api");
  const [section, setSection] = useState("dashboard");
  const [buildsWeaponFamily, setBuildsWeaponFamily] = useState<string | undefined>(undefined);

  const provider: PriceProvider = useMemo(() => {
    if (priceSource === "manual") return new ManualPriceProvider();
    return new ApiPriceProvider(serverId);
  }, [priceSource, serverId]);

  const historyProvider = useMemo(
    () => new ApiHistoryProvider(serverId),
    [serverId]
  );

  const openBuilds = useCallback(
    (weaponFamily?: string) => {
      setBuildsWeaponFamily(weaponFamily);
      setSection("builds");
    },
    []
  );

  const sections = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Inicio",
        content: <Dashboard provider={provider} onNavigate={setSection} />,
      },
      {
        id: "market",
        label: "Mercado",
        content: (
          <MarketSection provider={provider} historyProvider={historyProvider} />
        ),
      },
      {
        id: "builds",
        label: "Builds",
        content: (
          <BuildsSection
            provider={provider}
            weaponFamily={buildsWeaponFamily}
            onClearWeaponFilter={() => setBuildsWeaponFamily(undefined)}
          />
        ),
      },
      { id: "crafting", label: "Crafteo", content: <CraftingSection provider={provider} /> },
      { id: "refining", label: "Refinado", content: <RefiningSection provider={provider} /> },
      { id: "flipping", label: "Flipping", content: <FlippingSection provider={provider} /> },
      {
        id: "avalon",
        label: "Roads de Avalon",
        content: <AvalonSection provider={provider} onOpenBuilds={openBuilds} />,
      },
      {
        id: "pvp",
        label: "PvP Analytics",
        content: <PvpSection serverId={serverId} marketProvider={provider} onOpenBuilds={openBuilds} />,
      },
    ],
    [provider, historyProvider, buildsWeaponFamily, openBuilds, serverId]
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -top-16 h-56 animate-pulse rounded-full bg-[radial-gradient(50%_60%_at_50%_40%,rgba(34,211,238,0.14),transparent_70%),radial-gradient(38%_50%_at_18%_30%,rgba(255,216,138,0.1),transparent_70%),radial-gradient(38%_50%_at_82%_30%,rgba(96,165,250,0.12),transparent_70%)] blur-2xl"
          style={{ animationDuration: "6s" }}
        />
        <GridBeam
          rows={3}
          cols={5}
          strength={0.5}
          className="mb-8 rounded-lg border border-[var(--color-border)] panel-glass"
        >
          <header className="px-6 py-8">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.35em] text-[var(--color-cyan)]/80">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
              Terminal económica · Albion Online
            </p>
            <h1 className="text-gradient-gold text-4xl font-semibold tracking-tight">
              Libro de Mercader
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-dim)]">
              Inteligencia económica para Albion Online: compara precios entre
              ciudades, calcula ganancias de crafteo, refinado y flipping, y
              encuentra la mejor oportunidad disponible.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ServerSelector value={serverId} onChange={setServerId} />
              <PriceSourceToggle value={priceSource} onChange={setPriceSource} />
            </div>
          </header>
        </GridBeam>
      </div>

      <DirectionAwareTabs
        tabs={sections}
        activeId={section}
        onActiveChange={setSection}
      />
    </main>
  );
}
