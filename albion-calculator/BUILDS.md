# Builds

Biblioteca de builds con coste de equipamiento calculado contra los precios
reales del mercado. **Es la única fuente de builds del proyecto**: PvP Analytics
y Roads of Avalon la citan (flujo «VIEW BUILDS»), nunca duplican builds.

## Modelo

`src/lib/builds/types.ts`:

- `BuildMode`: `"pvp"` | `"pve"`.
- `PVP_CATEGORIES` y `PVE_CATEGORIES`: categorías `as const` (solo, grupo,
  zvz, hellgate, open world, mists, crystal, HCE…).
- `BUILD_SLOTS` y `SLOT_LABELS`: los 8 slots — arma, off-hand, cabeza, torso,
  pies, capa, comida, pociones.
- `Build`: metadatos del build (nombre, categoría, dificultad, descripción,
  rol, estilo) + `items: BuildItemSpec[]`.
- `buildItemId(base, tier, enchant)`: genera el id completo (`T5_2H_DAGGERPAIR@2`).

## Datos

- `src/data/builds/pvp.ts` — 12 builds PvP (Bloodletter, cursed solo, halberd,
  bear paws, warbow gank, fire small scale, arcane zvz, dagger pair hellgates,
  blight corrupted, frost arena, heavy mace crystal, holy healer).
- `src/data/builds/pve.ts` — 12 builds PvE (blazing solo, battleaxe solo,
  great nature solo, cursed group, holy group, dagger pair fame, bracers open
  world, dual swords mists, astral avalon, frost static, fire tracking,
  holy HCE).
- `src/data/builds/avalon-{solo,roles,dps,escape,compositions}.ts` — builds de
  Roads de Avalon (migradas desde `src/data/avalon/`, que ahora es solo un
  façade de re-export). Sus imports internos apuntan a `@/data/builds/*`.

Todos los ids usados existen en el dataset (`validate-builds` lo comprobó
contra los 16 554 items). Peculiaridades del dataset a tener en cuenta:

- `T4_CAPEITEM_FW_FORTSTERLING` — sin `_` entre FORT y STERLING.
- `T4_2H_DAGGERPAIR` — sin `_` entre DAGGER y PAIR.
- No hay comida en el dataset (la comida de builds usa `T4_FOOD_*` solo si
  existe; los slots de comida se muestran como texto).
- Pociones disponibles: `T4_POTION_ENERGY`, `T4_POTION_HEAL`, `T4_POTION_COOLDOWN`.
- Monturas disponibles: `T4_MOUNT_HORSE`, `T4_MOUNT_OX`, `T4_MOUNT_GIANTSTAG`.

## Componentes (`src/components/builds/`)

- `BuildsSection` — hub con 5 pestañas: Biblioteca, Composiciones, Comparar,
  Recomendador y Coste de build. Recibe `provider`, `weaponFamily` (filtro
  externo desde PvP/Avalon) y `onClearWeaponFilter`.
- `BuildLibrary` — biblioteca con modos PvP / PvE / Avalon (chips de categoría
  y filtro por familia de arma «Quitar filtro»).
- `CompositionSection`, `BuildCompare`, `BuildRecommender`, `BuildCostOptimizer`,
  `AvalonBuildsSection` (usada internamente en la biblioteca).

## Coste de equipamiento

`src/components/builds/BuildCostOptimizer.tsx`:

- Configuración: tier (4-8), encantamiento (0-4), calidad, cantidad de sets,
  con foco/premium.
- **Normal**: compra todo en la ciudad más barata.
- **Optimizado**: calcula el coste mínimo global (cada slot en la ciudad donde
  sale más barato) y muestra la estrategia ciudad a ciudad con el ahorro.
- Comparación con datos reales observada en desarrollo: 153 892 silver normal
  vs 117 533 optimizado @ Fort Sterling (ahorro 23,6 %).

`src/lib/builds/items.ts` — `itemName(itemId)`/`itemExists(itemId)` sobre el
dataset para mostrar nombres en español.

## Integración con PvP

`src/lib/pvp/weapons.ts` — `buildWeaponFamily(build)` resuelve la familia de
arma de un build del catálogo; `src/lib/pvp/builds.ts` — `bestBuildForFamily`
y `buildsForFamily` buscan la mejor build del catálogo para una familia
(prefieren modo PvP, orden estable). Los contadores PvP muestran la build
recomendada con su coste real (`BuildCostPanel`) y un botón VIEW BUILDS que
navega a la sección Builds con el filtro de familia aplicado (`onOpenBuilds`).
