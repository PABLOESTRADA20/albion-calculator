# Sistema de mercado

Toda la lógica de mercado vive en `src/lib/market/finders.ts` (funciones puras
sobre el mapa de precios devuelto por `useMarketPrices`) y `src/lib/market/universe.ts`
(universo de items a escanear). Las ciudades y el Black Market vienen de
`CITIES` en `src/types/albion.ts`.

## Fuente de precios

API de `albion-online-data.com` (endpoint `stats/prices`). Para cada item y
ciudad se usa:

- `buy_price_min` → «Comprar ahora» (venta del vendedor más barato).
- `sell_price_min` → «Vender ahora» (mejor oferta de compra).

## Finders

- `buyFinder(priceMap, itemId, quality)` — ordena ciudades de compra más barata
  a más cara y destaca el Black Market.
- `sellFinder(priceMap, itemId, quality)` — ordena por mejor precio de venta
  (el Black Market suele dominar).
- `buildCityPriceRows(priceMap)` — tabla ciudad a ciudad para la ficha de item.

## Escalado y riesgo

`toMarketOpportunity` y `ScaleStrategy` (en `finders.ts`) calculan cuánto
capital mover entre ciudades:

- `spreadPct` y `riskOf(roiPct, spreadPct)` → riesgo bajo/medio/alto según la
  diferencia de precio (spread) y el ROI.
- `scaleOpportunity` aplica reglas de capital máximo: cuanto mayor es la
  diferencia, menos silver se mueve a la vez (para no agotar las órdenes del
  mercado).

## Scanner (`src/lib/market/universe.ts` + `ScannerSection`)

- `SCAN_UNIVERSE_IDS`: items derivados de los builds PvP/PvE más items líquidos
  (recursos, pociones), expandidos a tiers 4-6 sin encantamiento.
- `scanMarket(priceMap, filters)` — cruza todas las parejas origen/destino,
  exige mínimo de ROI/profit, descarta el Black Market como origen y devuelve
  oportunidades ordenadas por ROI.
- `BestMoveNow` — la mejor oportunidad del universo con su riesgo.
- `bestMoves(opportunities, count)` — top N.

Resultados reales observados durante el desarrollo: 21 oportunidades sobre 43
items consultados, mejor ROI 103,4 % (T4_2H_WARBOW Bridgewatch → Black Market).

## Flipping (`FlippingOptimizer`)

Órdenes de compra y venta sobre `SCAN_UNIVERSE_IDS`: el precio de compra se
estima como un porcentaje del `buy_price_min` (puja), se descuenta la comisión
del mercado (ver `src/lib/calc/fees.ts`) y se exige beneficio positivo tras
impuestos antes de recomendar el movimiento.

## Crafteo y refinado

- `src/lib/calc/crafting.ts` — `craftFamily(itemId)` detecta la familia
  (METALBAR/PLANKS/CLOTH/LEATHER) y excluye artefactos (marcadores
  `_HELL/_MORGANA/_KEEPER/_CRYSTAL/_AVALON`), capas, pociones y monturas;
  `craftingRecipe(itemId)` devuelve `{ outputItemId, ingredients, tier, enchant }`
  con la receta estándar: 2× refinado T{enchant} + 1× refinado T-1 sin encantar.
- `src/lib/calc/refining.ts` — todas las combinaciones
  grupo × tier × enchant para refinar.
- `src/lib/calc/returnRate.ts` — retorno de recursos con foco y premium.
- Los optimizadores comparan coste de materiales vs precio de venta por ciudad
  (incluido el bonus de ciudad para refinado) y muestran el beneficio neto.

## Alertas

Ver `ARCHITECTURE.md` → Alertas. `AlertsPanel` vigila el precio mínimo de
venta (calidad 1) en la ciudad elegida (o la más barata de todas) y marca las
alertas disparadas cuando cruzan el umbral.
