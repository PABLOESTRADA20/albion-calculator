# PvP Analytics

Módulo de analítica PvP sobre **datos reales de la API oficial de eventos y
jugadores** (`gameinfo.albiononline.com`). Nada de lo que se muestra se
inventa: si la fuente no expone un dato, la UI lo marca como `N/A` o
`Data unavailable`. Tampoco se copia Murder Ledger: es un análisis propio.

## Fuentes de datos

| Endpoint | Uso |
| --- | --- |
| `GET /api/gameinfo/players?q={query}&limit=8` | Búsqueda de jugadores (mín. 3 chars) |
| `GET /api/gameinfo/players/{id}` | Perfil (stats de por vida) |
| `GET /api/gameinfo/players/{id}/kills` y `/deaths` | Historial de combates (50) |
| `GET /api/gameinfo/events?limit=100&offset=0..N` | Muestra global de combates (4 páginas) |

Servidor: `gameinfo-ams` (Europa) / `gameinfo-ash` (América). El sample global
se fusiona y deduplica por id de evento.

## Capas

```
src/lib/pvp/types.ts       PvpPlayerSummary, PvpFight, FightActor, MatchupStat,
                           FamilyMetaStat, CounterStat, SlotStat y el contrato
                           PvPDataProvider (la UI depende de esto, no de la API)
src/lib/pvp/weapons.ts     Mapa curado id real → familia (30 familias + "Otra
                           arma"), weaponFamilyOfItemId(), buildWeaponFamily()
src/lib/pvp/gameinfo.ts    GameInfoPvpProvider: fetch con timeout 10s, retry
                           (máx. 2, backoff, 429/5xx), caché módulo 60s (5 min
                           perfiles), 404 → null, parsers de perfil/eventos
src/lib/pvp/analytics.ts   Motor PURO de agregación: matchupsFor, familyMeta,
                           countersFor, familyTrends, slotUsage, slotLabel
src/lib/pvp/builds.ts      buildsForFamily / bestBuildForFamily → catálogo de
                           Builds (nunca crea builds propias)
src/lib/pvp/usePvp.ts      Hooks (firma/completado, sin setState en efectos):
                           usePlayerSearch (debounce 400ms), usePlayerData,
                           usePvpEvents, useVisibleInterval
```

Reglas de robustez: timeout con `AbortController`, reintentos limitados,
caché + dedup de URLs en vuelo (StrictMode/remontajes no duplican requests),
estados loading/error/empty en toda la UI, y **sin inventar stats**: win
rates y K/D se calculan solo si hay muestra (`MIN_FIGHTS = 10` para
matchups/counters).

## Reglas de agregación

- `matchupsFor(events, myFamily)` — tabla WR de tu familia contra cada rival.
  Badges: 🟢 Favorable ≥ 55 %, 🟡 Neutral 45-55 %, 🔴 Desfavorable ≤ 45 %
  (con < 10 fights: «pocos datos»).
- `countersFor(events, enemyFamily)` — mejores WR contra la familia enemiga
  (min. 10 fights), con build recomendada del catálogo y su coste real.
- `familyMeta(events)` — kills/muertes/WR/uso por familia (lado killer).
- `familyTrends(prev, cur)` — tendencia 📈/📉/➡ con umbral ±25 % y mínimo de
  muestra; sin ella: «insuficiente».
- `slotUsage(events)` — ítems más usados por slot según las víctimas (min. 5).

## UI (`src/components/pvp/`)

`PvpSection` (hub, 12 pestañas con `DirectionAwareTabs`):
Dashboard, Players, Matchups, Counters, Meta, Evolución, Fight History,
Performance (build de una familia + slot usage), Rankings, Live Feed,
Profitability y Compare. Recibe `serverId`, `marketProvider` y `onOpenBuilds`.

Flujos conectados (sin duplicar datos):
- **PvP → Builds**: botones `VIEW BUILDS` → `onOpenBuilds(family)` navega a
  Builds con filtro de familia.
- **PvP → Coste**: `BuildCostPanel` muestra el coste real de la build counter
  recomendada (`bestBuildForFamily`).
- **PvP → Mercado**: Profitability valora el equipo real de las víctimas con
  `useMarketPrices` (precios en vivo de `albion-online-data.com`).

## Honestidad de los datos

- Rankings: **estimación propia** sobre la muestra (la API oficial no expone
  leaderboard global) — se indica explícitamente en la UI.
- Live Kill Feed: eventos reales con auto-refresco de 60 s solo con la pestaña
  visible (`useVisibleInterval`), sin polling agresivo.
- Profitability: etiqueta «Estimated» — valor del equipo de las víctimas
  (items reales + precios reales, calidad Normal, sin impuestos).
- Fight Analyzer: dificultad y WR del matchup según tu propio historial;
  damage/healing/habilidades **no existen en la fuente** y no se muestran.
- Meta Evolution: las pestañas 24H/7D/30D/90D solo se habilitan si la muestra
  real cubre ese rango temporal; si no, se usa la tendencia de la muestra.
