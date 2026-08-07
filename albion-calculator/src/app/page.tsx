"use client";

import { useMemo, useState } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import { GridBeam } from "@/components/GridBeam";
import { ServerSelector } from "@/components/ServerSelector";
import { PriceSourceToggle } from "@/components/PriceSourceToggle";
import { CraftingCalculator } from "@/components/calculators/CraftingCalculator";
import { RefiningCalculator } from "@/components/calculators/RefiningCalculator";
import { FlippingCalculator } from "@/components/calculators/FlippingCalculator";
import { ApiPriceProvider } from "@/lib/pricing/apiPriceProvider";
import { ManualPriceProvider } from "@/lib/pricing/manualPriceProvider";
import type { PriceProvider, ServerId } from "@/types/albion";

export default function Home() {
  const [serverId, setServerId] = useState<ServerId>("europe");
  const [priceSource, setPriceSource] = useState<"api" | "manual">("api");

  const provider: PriceProvider = useMemo(() => {
    if (priceSource === "manual") return new ManualPriceProvider();
    return new ApiPriceProvider(serverId);
  }, [priceSource, serverId]);

  const tabs = useMemo(
    () => [
      { id: "crafting", label: "Crafteo", content: <CraftingCalculator provider={provider} /> },
      { id: "refining", label: "Refinado", content: <RefiningCalculator provider={provider} /> },
      { id: "flipping", label: "Flipping", content: <FlippingCalculator provider={provider} /> },
    ],
    [provider]
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
            Compara la ganancia de craftear, refinar y hacer flipping en Albion
            Online. Elige servidor y fuente de precios, abre la pestaña que
            quieras y expande «Cómo usar».
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ServerSelector value={serverId} onChange={setServerId} />
            <PriceSourceToggle value={priceSource} onChange={setPriceSource} />
          </div>
        </header>
      </GridBeam>

      <DirectionAwareTabs tabs={tabs} />
    </main>
  );
}
