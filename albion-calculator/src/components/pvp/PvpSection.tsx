"use client";

import { useMemo, useState } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { DirectionTab } from "@/components/DirectionAwareTabs";
import { PvPDashboard } from "@/components/pvp/PvPDashboard";
import { PlayerAnalytics } from "@/components/pvp/PlayerAnalytics";
import { MatchupAnalyzer } from "@/components/pvp/MatchupAnalyzer";
import { CounterFinder } from "@/components/pvp/CounterFinder";
import { MetaTracker } from "@/components/pvp/MetaTracker";
import { MetaEvolution } from "@/components/pvp/MetaEvolution";
import { FightHistory } from "@/components/pvp/FightHistory";
import { BuildPerformance } from "@/components/pvp/BuildPerformance";
import { SlotPerformance } from "@/components/pvp/SlotPerformance";
import { PvPRankings } from "@/components/pvp/PvPRankings";
import { LiveKillFeed } from "@/components/pvp/LiveKillFeed";
import { PvpProfitability } from "@/components/pvp/PvpProfitability";
import { PlayerCompare } from "@/components/pvp/PlayerCompare";
import type { PriceProvider, ServerId } from "@/types/albion";
import { WEAPON_FAMILIES, UNKNOWN_WEAPON } from "@/lib/pvp/weapons";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";

interface PvpSectionProps {
  serverId: ServerId;
  marketProvider: PriceProvider;
  onOpenBuilds: (weaponFamily?: string) => void;
}

export function PvpSection({ serverId, marketProvider, onOpenBuilds }: PvpSectionProps) {
  const [tab, setTab] = useState("dashboard");
  const [perfFamily, setPerfFamily] = useState<WeaponFamilyKey>("Bloodletter");

  const tabs = useMemo<DirectionTab[]>(
    () => [
      { id: "dashboard", label: "Dashboard", content: <PvPDashboard serverId={serverId} onOpenBuilds={onOpenBuilds} /> },
      { id: "players", label: "Players", content: <PlayerAnalytics serverId={serverId} /> },
      { id: "matchups", label: "Matchups", content: <MatchupAnalyzer serverId={serverId} /> },
      { id: "counters", label: "Counters", content: <CounterFinder serverId={serverId} marketProvider={marketProvider} onOpenBuilds={onOpenBuilds} /> },
      { id: "meta", label: "Meta", content: <MetaTracker serverId={serverId} onOpenBuilds={onOpenBuilds} /> },
      { id: "evolution", label: "Evolución", content: <MetaEvolution serverId={serverId} onOpenBuilds={onOpenBuilds} /> },
      { id: "fights", label: "Fight History", content: <FightHistory serverId={serverId} /> },
      {
        id: "performance",
        label: "Performance",
        content: (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                  Familia de arma
                </span>
                <select
                  value={perfFamily}
                  onChange={(e) => setPerfFamily(e.target.value as WeaponFamilyKey)}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
                >
                  {WEAPON_FAMILIES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                  <option value={UNKNOWN_WEAPON}>Otra arma</option>
                </select>
              </label>
            </div>
            <BuildPerformance serverId={serverId} weaponFamily={perfFamily} onOpenBuilds={onOpenBuilds} />
            <SlotPerformance serverId={serverId} />
          </div>
        ),
      },
      { id: "rankings", label: "Rankings", content: <PvPRankings serverId={serverId} /> },
      { id: "live", label: "Live Feed", content: <LiveKillFeed serverId={serverId} /> },
      {
        id: "profit",
        label: "Profitability",
        content: <PvpProfitability serverId={serverId} marketProvider={marketProvider} />,
      },
      { id: "compare", label: "Compare", content: <PlayerCompare serverId={serverId} /> },
    ],
    [serverId, marketProvider, onOpenBuilds, perfFamily]
  );

  return <DirectionAwareTabs tabs={tabs} activeId={tab} onActiveChange={setTab} />;
}