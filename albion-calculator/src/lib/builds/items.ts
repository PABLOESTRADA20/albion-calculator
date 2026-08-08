import { ITEMS } from "@/data/items";

const ITEM_NAMES = new Map<string, string>();
for (const [id, nameEn] of ITEMS) {
  if (!ITEM_NAMES.has(id)) ITEM_NAMES.set(id, nameEn);
}

/** Nombre en ingles (canonico) de un id de item; si no esta en el dataset, devuelve el id. */
export function itemName(id: string): string {
  return ITEM_NAMES.get(id) ?? id;
}

/** El dataset local solo cubre una parte de los items del juego. */
export function itemExists(id: string): boolean {
  return ITEM_NAMES.has(id);
}
