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
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onNavigate(m.id)}
            className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-left transition-colors hover:border-[var(--color-gold-dim)]"
          >
            <p className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)]">
              {m.title}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-dim)]">{m.desc}</p>
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
      <GridBeam
        rows={3}
        cols={5}
        strength={0.5}
        className="mb-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]"
      >
        <header className="px-6 py-8">
          <h1 className="text-gradient-gold text-3xl font-semibold tracking-tight">
            Libro de Mercader
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-text-dim)]">
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

      <DirectionAwareTabs
        tabs={sections}
        activeId={section}
        onActiveChange={setSection}
      />
    </main>
  );
}
