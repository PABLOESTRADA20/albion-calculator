# Roads of Avalon

Módulo de inteligencia para el contenido de Roads of Avalon: builds curadas,
composiciones, directorio de mapas, planificador de rutas, calculadoras de
riesgo y beneficio, gathering, optimizador de loot y recomendador.

## Principio

Nunca se inventan datos. Cuando no existe fuente pública (densidad de mapas,
tasas de drop, precios de monturas fuera del dataset), la UI muestra
«Datos no disponibles» o pide el valor al jugador. Las heurísticas están
documentadas en el código y marcadas como orientativas.

## Datos verificados contra el dataset

`src/data/avalon/*` usa 83 IDs base T4 únicos, **todos existentes** en
`src/data/items.ts` (verificado con `validate-avalon-data.mjs`).

Peculiaridades:

- `T4_2H_DOUBLEBLADEDSTAFF` existe; `T4_2H_DUALBLADEDSTAFF` no.
- Bloodletter → `T4_MAIN_DAGGER` (label «Bloodletter»); Carving →
  `T4_2H_DUALSWORD` (label «Carving»); Battle Bracers →
  `T4_2H_IRONGAUNTLETS_HELL` (Black Hands).
- Artefactos: Hallowfall `T4_MAIN_HOLYSTAFF_AVALON`, Fallen
  `T4_2H_HOLYSTAFF_HELL`, Blight `T4_2H_NATURESTAFF_HELL`, Rampant
  `T4_2H_NATURESTAFF_KEEPER`, Bloodmoon `T4_2H_SHAPESHIFTER_MORGANA`, Earthrune
  `T4_2H_SHAPESHIFTER_KEEPER`, Hellspawn `T4_2H_SHAPESHIFTER_HELL`, Incubus
  `T4_MAIN_MACE_HELL`, Black Monk `T4_2H_COMBATSTAFF_MORGANA`, Bear Paws
  `T4_2H_DUALAXE_KEEPER`.
- Pociones solo T4 y T6 (`T5/T7/T8_POTION_*` no existen): el coste clampa la
  poción a T4.
- Herramientas avalonianas `T{4-8}_2H_TOOL_{AXE,PICK,KNIFE,SICKLE,HAMMER}_AVALON`
  existen en todos los tiers.
- Armadura de gathering existe T4-T8 para wood/ore/hide/fiber. La piedra **no
  tiene armadura propia**: el optimizer lo indica y no genera IDs falsos.
- Monturas en dataset: solo `T4_MOUNT_HORSE`, `T4_MOUNT_OX`, `T4_MOUNT_GIANTSTAG`;
  el resto del directorio (Swiftclaw, Direwolf…) muestra «Datos de precio no
  disponibles».

## Catálogo

- `src/data/avalon/solo.ts` — 7 solo + 4 all-rounder.
- `src/data/avalon/roles.ts` — 7 healer + 5 tank.
- `src/data/avalon/dps.ts` — 15 DPS + 6 support.
- `src/data/avalon/escape.ts` — 5 escape.
- `src/data/avalon/compositions.ts` — 4 duo, 3 trio, 5 five-man, 8 roaming,
  con `why` por miembro, scores 1-10 y tier recomendado.
- `src/data/avalon/index.ts` — agregado `AVALON_BUILDS` + helpers de búsqueda
  + constantes de gathering.

## Lógica

- `src/lib/avalon/risk.ts` — AVALON RISK SCORE 0-100: base por actividad +
  bonos de tier, nº de jugadores, valor en juego, exposición PvP y distancia
  a la salida. Niveles Bajo/Medio/Alto/Extremo con razones legibles.
- `src/lib/avalon/profit.ts` — estimador de expedición: loot − consumibles −
  reparación − impuestos de venta (tarifas reales del mercado) = neto,
  por jugador y por hora.
- `src/lib/avalon/bestMove.ts` — decisión curada «mejor jugada» por
  actividad + tamaño de grupo, con builds recomendadas resueltas del catálogo.
- `src/lib/avalon/mounts.ts` — directorio de recomendación de monturas.
- `src/lib/avalon/gathering.ts` — plan de herramienta + armadura reales.
- `src/lib/avalon/planner.ts` — construcción de rutas por bloques.
- `src/lib/avalon/recommender.ts` — filtrado y puntuación del catálogo
  (nunca ordena builds inexistentes).
- `src/lib/avalon/cost.ts` — `useBuildCost`: igual que BuildCostOptimizer
  pero parametrizado para builds y composiciones; clampa pociones a T4.

## UI

`src/components/avalon/*`, orquestada por `AvalonSection` (8 subpestañas) y
registrada como sección raíz en `src/app/page.tsx` junto a Mercado y Builds.