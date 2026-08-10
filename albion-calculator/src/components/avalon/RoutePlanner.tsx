"use client";

import { useMemo, useState } from "react";
import { plannerSections, buildRoute } from "@/lib/avalon/planner";
import type { PlannerOption, PlannerSection } from "@/lib/avalon/planner";
import { ACTIVITY_LABELS } from "@/lib/builds/types";
import { RISK_LEVEL_LABELS, RISK_LEVEL_STYLES } from "@/lib/avalon/risk";
import type { PriceProvider } from "@/types/albion";
import { AvalonBuildCard } from "@/components/avalon/AvalonBuildCard";
import { resolveRecommendedBuilds } from "@/lib/avalon/bestMove";

const PLAYER_OPTIONS = [1, 2, 3, 5, 7];

export function RoutePlanner({ provider }: { provider: PriceProvider }) {
  const [players, setPlayers] = useState(3);
  const [tier, setTier] = useState(6);
  const [picked, setPicked] = useState<Record<string, PlannerOption["id"] | null>>({});

  const sections = useMemo(() => plannerSections(players), [players]);

  const plan = useMemo(
    () =>
      buildRoute(
        players,
        tier,
        sections
          .filter((s) => picked[s.activity])
          .map((s) => ({ section: s, option: s.options.find((o) => o.id === picked[s.activity])! }))
      ),
    [players, tier, sections, picked]
  );

  const recommendedBuilds = useMemo(
    () => (plan.bestMove ? resolveRecommendedBuilds(plan.bestMove.recommendedBuildIds) : []),
    [plan.bestMove]
  );

  const pick = (section: PlannerSection, option: PlannerOption) =>
    setPicked((p) => (p[section.activity] === option.id ? { ...p, [section.activity]: null } : { ...p, [section.activity]: option.id }));

  const cleared = Object.values(picked).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Jugadores</span>
          <select
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {PLAYER_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === 1 ? "Solo" : p === 7 ? "7 jugadores" : `${p} jugadores`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Road tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(Number(e.target.value))}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {[4, 5, 6, 7, 8].map((t) => (
              <option key={t} value={t}>
                T{t}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setPicked({})}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
        >
          Limpiar ruta
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const activeId = picked[s.activity];
          return (
            <div key={s.activity} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-gold)]">
                {ACTIVITY_LABELS[s.activity]}
              </p>
              <div className="mt-2 space-y-1.5">
                {s.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => pick(s, o)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      activeId === o.id
                        ? "bg-[var(--color-gold)] text-black"
                        : "bg-[var(--color-panel)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          Ruta de la sesión {cleared > 0 ? `(${plan.totalDurationMin} min totales)` : ""}
        </h3>
        {plan.steps.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--color-text-dim)]">
            Elige al menos un bloque de actividad para construir la ruta.
          </p>
        ) : (
          <>
            <ol className="mt-3 space-y-1.5">
              {plan.steps.map((step, i) => (
                <li key={step.id} className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/10 text-[10px] font-semibold text-[var(--color-gold)]">
                    {i + 1}
                  </span>
                  <span className="font-medium text-[var(--color-text)]">{ACTIVITY_LABELS[step.activity]}</span>
                  <span>{step.label}</span>
                  <span className="ml-auto text-[var(--color-text-dim)]">{step.durationMin} min</span>
                </li>
              ))}
            </ol>

            {plan.bestMove && (
              <div className="mt-4 rounded-md bg-[var(--color-panel)] p-3">
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  Mejor jugada: {plan.bestMove.activityLabel} · {plan.bestMove.recommendedTier}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${RISK_LEVEL_STYLES[plan.bestMove.risk]}`}>
                    Riesgo {RISK_LEVEL_LABELS[plan.bestMove.risk]}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-dim)]">{plan.bestMove.summary}</p>
              </div>
            )}

            {recommendedBuilds.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {recommendedBuilds.map((b) => (
                  <AvalonBuildCard key={b.id} provider={provider} build={b} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}