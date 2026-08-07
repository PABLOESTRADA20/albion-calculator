"use client";

interface PriceSourceToggleProps {
  value: "api" | "manual";
  onChange: (value: "api" | "manual") => void;
}

export function PriceSourceToggle({ value, onChange }: PriceSourceToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-[var(--color-panel)] p-1">
      {(["api", "manual"] as const).map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={[
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === option
              ? "bg-[var(--color-text)] text-[var(--color-bg)]"
              : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]",
          ].join(" ")}
        >
          {option === "api" ? "Precios de mercado (API)" : "Precios manuales"}
        </button>
      ))}
    </div>
  );
}
