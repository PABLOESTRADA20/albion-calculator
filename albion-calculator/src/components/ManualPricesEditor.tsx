"use client";

import { useState } from "react";
import type { City, Quality } from "@/types/albion";
import { CITIES } from "@/types/albion";
import type { ManualPriceProvider } from "@/lib/pricing/manualPriceProvider";
import { SelectField } from "@/components/UI";
import { ItemIcon } from "@/components/ItemIcon";

export interface ManualPriceEntry {
  itemId: string;
  label: string;
  quality: Quality;
}

interface ManualPricesEditorProps {
  provider: ManualPriceProvider;
  entries: ManualPriceEntry[];
  city: City;
  onCityChange: (city: City) => void;
  onManualChange: () => void;
}

// Editor de precios en modo manual: una ciudad y un precio de compra/venta
// por item. Cada cambio se escribe en el ManualPriceProvider y avisa al
// padre para que recalcule.
export function ManualPricesEditor({
  provider,
  entries,
  city,
  onCityChange,
  onManualChange,
}: ManualPricesEditorProps) {
  const [values, setValues] = useState<
    Record<string, { sell: string; buy: string }>
  >({});

  const handlePrice = (
    itemId: string,
    quality: Quality,
    field: "sell" | "buy",
    raw: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [`${itemId}__${quality}`]: {
        ...prev[`${itemId}__${quality}`],
        [field]: raw,
      },
    }));
    const num = Number(raw);
    provider.setPrice(
      itemId,
      city,
      quality,
      field === "sell"
        ? { sellPriceMin: Number.isFinite(num) ? num : 0 }
        : { buyPriceMax: Number.isFinite(num) ? num : 0 }
    );
    onManualChange();
  };

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <SelectField
          label="Ciudad"
          value={city}
          onChange={onCityChange}
          options={CITIES.map((c) => ({ value: c, label: c }))}
        />
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-raised)] text-left text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="w-32 px-3 py-2 font-medium">Compra (sell)</th>
              <th className="w-32 px-3 py-2 font-medium">Venta (buy)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const key = `${entry.itemId}__${entry.quality}`;
              const row = values[key] ?? { sell: "", buy: "" };
              return (
                <tr
                  key={key}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ItemIcon itemId={entry.itemId} size={20} />
                      <div className="min-w-0">
                        <p className="truncate text-[var(--color-text)]">
                          {entry.label}
                        </p>
                        <p className="truncate font-mono text-xs text-[var(--color-text-dim)]">
                          {entry.itemId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.sell}
                      placeholder="0"
                      onChange={(e) =>
                        handlePrice(
                          entry.itemId,
                          entry.quality,
                          "sell",
                          e.target.value
                        )
                      }
                      className="tabular w-full rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1 outline-none focus:border-[var(--color-gold-dim)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.buy}
                      placeholder="0"
                      onChange={(e) =>
                        handlePrice(
                          entry.itemId,
                          entry.quality,
                          "buy",
                          e.target.value
                        )
                      }
                      className="tabular w-full rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1 outline-none focus:border-[var(--color-gold-dim)]"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
