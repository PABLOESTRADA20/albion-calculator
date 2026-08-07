"use client";

import { useMemo, useRef, useState } from "react";
import { ITEMS } from "@/data/items";
import { ItemIcon } from "@/components/ItemIcon";

export interface SelectedItem {
  id: string;
  label: string;
}

interface ItemSearchInputProps {
  value: SelectedItem | null;
  onSelect: (item: SelectedItem | null) => void;
  placeholder?: string;
}

const MAX_RESULTS = 20;

export function ItemSearchInput({
  value,
  onSelect,
  placeholder = "Buscar item...",
}: ItemSearchInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    if (q.length < 2) return [];

    const scored: { entry: (typeof ITEMS)[number]; score: number }[] = [];
    for (const entry of ITEMS) {
      const [id, nameEn, nameEs] = entry;
      const idLower = id.toLowerCase();
      const enLower = nameEn.toLowerCase();
      const esLower = (nameEs ?? "").toLowerCase();
      let score = -1;
      if (idLower === q) score = 0;
      else if (idLower.startsWith(q)) score = 1;
      else if (enLower.startsWith(q)) score = 2;
      else if (esLower.startsWith(q)) score = 3;
      else if (idLower.includes(q)) score = 4;
      else if (enLower.includes(q)) score = 5;
      else if (nameEs && esLower.includes(q)) score = 6;
      if (score >= 0) scored.push({ entry, score });
      if (scored.length >= MAX_RESULTS * 4) break;
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, MAX_RESULTS);
  }, [query]);

  const labelFor = (entry: (typeof ITEMS)[number]): string => {
    const [, nameEn, nameEs] = entry;
    return nameEs ?? nameEn;
  };

  return (
    <div ref={rootRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <ItemIcon itemId={value.id} size={24} />
            <div className="min-w-0">
              <p className="truncate text-sm text-[var(--color-text)]">
                {value.label}
              </p>
              <p className="truncate font-mono text-xs text-[var(--color-text-dim)]">
                {value.id}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="ml-3 shrink-0 rounded px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            Quitar
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder={placeholder}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2 text-sm outline-none placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-gold-dim)]"
          />
          {open && query.trim().length >= 2 && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] shadow-xl">
              {results.length === 0 && (
                <li className="px-3 py-2 text-sm text-[var(--color-text-dim)]">
                  Sin resultados
                </li>
              )}
              {results.map(({ entry }) => {
                const [id, nameEn, nameEs] = entry;
                return (
                  <li key={id}>
                    <button
                      onMouseDown={() => {
                        onSelect({ id, label: labelFor(entry) });
                        setQuery("");
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors hover:bg-[var(--color-border)]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <ItemIcon itemId={id} size={18} />
                        <span className="truncate text-sm text-[var(--color-text)]">
                          {nameEs ?? nameEn}
                          {nameEs && nameEs !== nameEn && (
                            <span className="ml-2 text-xs text-[var(--color-text-dim)]">
                              ({nameEn})
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-[var(--color-text-dim)]">
                        {id}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
