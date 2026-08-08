# Arquitectura

Aplicación Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.
Un solo proyecto `albion-calculator` bajo pnpm workspaces (raíz del repo).
Solo existe la página `/` (`src/app/page.tsx`), dividida en secciones con
pestañas animadas (`DirectionAwareTabs`, con `motion`).

## Capas

```
src/types/albion.ts          Tipos base: City, Quality, ServerId, PriceProvider…
src/data/items.ts            Dataset de items (id, nombre EN/ES)
src/lib/pricing/             Proveedores de precios
src/lib/market/              Lógica de mercado (finders, scanner, universo)
src/lib/builds/              Tipos e items de builds
src/data/builds/             Definiciones de builds (pvp.ts, pve.ts)
src/lib/calc/                Cálculos de crafteo/refinado/fees/return rate
src/lib/history/             Proveedor de historial de precios + hook
src/lib/alerts.ts            Alertas persistentes en localStorage
src/components/              UI por módulo (market/, builds/, calculators/)
src/app/page.tsx             Composición de secciones + cabecera
```

## Proveedores de precios

`PriceProvider` (en `src/types/albion.ts`) es la interfaz común:

- `ApiPriceProvider` (`src/lib/pricing/apiPriceProvider.ts`) — consulta
  `albion-online-data.com/api/v2/stats/prices` en chunks de 60 items por
  petición (CHUNK_SIZE), agrupa por ciudad, usa `sell_price_min` como
  referencia de venta, reintenta ante 429 y tiene caché en memoria (60 s).
- `ManualPriceProvider` (`src/lib/pricing/manualPriceProvider.ts`) — datos
  introducidos a mano.

El hook `useMarketPrices` (`src/lib/useMarketPrices.ts`) gestiona estado de
carga/error/refresco con el patrón **firma/completado**: la firma codifica
todos los parámetros de la petición y `loading = completedSignature !== signature`.

> Regla de lint del repo: `react-hooks/set-state-in-effect` prohíbe llamar a
> `setState` de forma síncrona dentro de un `useEffect`. Todo estado derivado
> de efectos debe usar el patrón firma/completado (setState solo dentro de
> callbacks asíncronos). `react-hooks/preserve-manual-memoization` prohíbe
> encadenar `useMemo` consumido por otro cálculo: usar IIFE en su lugar.

## Historial de precios

`HistoryProvider` (`src/lib/history/historyProvider.ts`) con
`ApiHistoryProvider`: consulta `api/v2/stats/history/{itemId}?locations={city}&time-scale=1&qualities={q}`,
caché de 5 min y reintento ante 429. El hook `usePriceHistory` usa el mismo
patrón firma/completado. El gráfico es SVG puro sin dependencias
(`PriceHistoryChart`). Nota: la API devuelve `[]` para combos item/ciudad/calidad
sin datos — la UI lo trata como estado vacío.

## Alertas

`src/lib/alerts.ts` — persistencia en `localStorage` (clave
`albion-calculator.alerts.v1`), `upsertAlert`/`evaluateAlerts`. Se evalúan con
calidad 1 (el precio de mercado consultado usa calidad 1): umbral sobre el
precio mínimo de venta más barato entre las ciudades vigiladas. Las alertas
con calidad ≠ 1 se guardan pero se muestran como «Calidad no evaluada».

## Estilos

Tailwind v4 con variables CSS `--color-*` (fondo, panel, borde, dorado) y
clase `text-gradient-gold`. Todo en español.

## Notas de construcción

- Sin script `typecheck`: usar `pnpm exec tsc --noEmit`.
- El endpoint de precios admite peticiones multi-item; el de historial es de un
  solo item por petición.
- `HowTo` acepta `title` opcional; `ItemIcon` usa la prop `itemId`.
