"use client";

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_2px_6px_-2px_rgba(0,0,0,0.45),0_6px_18px_-6px_rgba(0,0,0,0.45),0_14px_32px_-12px_rgba(0,0,0,0.4)] ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-sm font-medium tracking-wide text-[var(--color-text)]">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--color-text-dim)]">
        {label}
      </span>
      <div className="flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] focus-within:border-[var(--color-gold-dim)]">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = e.target.valueAsNumber;
            onChange(Number.isFinite(next) ? next : 0);
          }}
          className="tabular w-full bg-transparent px-3 py-2 text-sm outline-none"
        />
        {suffix && (
          <span className="pr-3 text-xs text-[var(--color-text-dim)]">
            {suffix}
          </span>
        )}
      </div>    </label>
  );
}

interface SelectFieldProps<T extends string | number> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}

export function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: SelectFieldProps<T>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--color-text-dim)]">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          const next =
            typeof value === "number" ? (Number(raw) as T) : (raw as T);
          onChange(next);
        }}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold-dim)] disabled:opacity-40"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-gold)]"
      />
      {label}
    </label>
  );
}
