"use client";

import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import { BuyFinder } from "@/components/market/BuyFinder";
import { SellFinder } from "@/components/market/SellFinder";
import { ScannerSection } from "@/components/market/ScannerSection";
import { ItemPage } from "@/components/market/ItemPage";
import { AlertsPanel } from "@/components/market/AlertsPanel";
import type { HistoryProvider } from "@/lib/history/historyProvider";
import type { PriceProvider } from "@/types/albion";

interface MarketSectionProps {
  provider: PriceProvider;
  historyProvider: HistoryProvider;
}

export function MarketSection({ provider, historyProvider }: MarketSectionProps) {
  const tabs = [
    { id: "buy", label: "Comprar", content: <BuyFinder provider={provider} /> },
    { id: "sell", label: "Vender", content: <SellFinder provider={provider} /> },
    { id: "scanner", label: "Scanner", content: <ScannerSection provider={provider} /> },
    {
      id: "item",
      label: "Item",
      content: (
        <ItemPage priceProvider={provider} historyProvider={historyProvider} />
      ),
    },
    { id: "alerts", label: "Alertas", content: <AlertsPanel provider={provider} /> },
  ];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <DirectionAwareTabs tabs={tabs} />
    </div>
  );
}
