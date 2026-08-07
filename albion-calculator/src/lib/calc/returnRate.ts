// Mecanica de Resource Return Rate de Albion:
// RRR = 1 - 1/(1 + Bonus/100), donde el bonus es la suma de:
//  - base de ciudad real: 18
//  - especializacion de ciudad (refinado +40 / crafteo +15)
//  - focus: +59
//  - bonus diario de actividades: +10 o +20

export type ActivityKind = "crafting" | "refining";

export interface ReturnRateInput {
  kind: ActivityKind;
  hasCitySpecialty: boolean;
  useFocus: boolean;
  dailyBonus: number; // 0 | 10 | 20
}

const CITY_BASE = 18;
const SPECIALTY_BONUS: Record<ActivityKind, number> = {
  crafting: 15,
  refining: 40,
};
const FOCUS_BONUS = 59;

export function productionBonus({
  kind,
  hasCitySpecialty,
  useFocus,
  dailyBonus,
}: ReturnRateInput): number {
  let bonus = CITY_BASE;
  if (hasCitySpecialty) bonus += SPECIALTY_BONUS[kind];
  if (useFocus) bonus += FOCUS_BONUS;
  bonus += dailyBonus;
  return bonus;
}

export function rrrFromBonus(bonus: number): number {
  if (bonus <= 0) return 0;
  return 1 - 1 / (1 + bonus / 100);
}

export function resourceReturnRate(input: ReturnRateInput): number {
  return rrrFromBonus(productionBonus(input));
}
