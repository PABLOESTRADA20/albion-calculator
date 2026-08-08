# Libro de Mercader

Inteligencia económica para **Albion Online**: compara precios entre ciudades,
calcula ganancias de crafteo, refinado y _flipping_, y encuentra la mejor
oportunidad disponible.

## Requisitos

- Node.js 20+
- pnpm (proyecto configurado con pnpm workspaces)

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Módulos

| Pestaña     | Qué hace                                                        |
| ----------- | --------------------------------------------------------------- |
| Inicio      | Acceso a los módulos y panel de alertas de precio               |
| Mercado     | Comprar / Vender (dónde y a cuánto), Scanner de oportunidades, ficha de item con historial y alertas |
| Builds      | Biblioteca de builds PvP/PvE y coste de equipamiento optimizado por ciudad |
| Crafteo     | Beneficio fabricando items y ranking de recetas                  |
| Refinado    | Beneficio refinando recursos y ranking con bonus de ciudad       |
| Flipping    | Compra y venta de órdenes del mercado                           |

Los precios se obtienen de la API pública de
[Albion Online Data](https://www.albion-online-data.com/) (`albion-online-data.com`),
con selector de servidor (Europe/West) y posibilidad de introducir precios
manualmente.

## Comandos

```bash
pnpm lint            # ESLint
pnpm build           # Next.js build (incluye type check de TS)
pnpm exec tsc --noEmit   # Type check independiente (no hay script "typecheck")
```

## Estructura

- `src/lib/` — lógica de negocio (precios, mercado, cálculos, historial, alertas)
- `src/data/` — dataset de items y builds
- `src/components/` — UI de cada módulo
- `src/types/albion.ts` — tipos base (ciudades, servidores, calidades, proveedores)

Ver `ARCHITECTURE.md`, `MARKET_SYSTEM.md` y `BUILDS.md` para el detalle.

## Dataset

- `src/data/items.ts` — 16 554 items de Albion (id, nombre EN, nombre ES),
  incluidas variantes con encantamiento (`@1`…`@4`).
- `src/data/builds/` — builds PvP (12) y PvE (12) con sus 8 slots.

## Scripts de validación

Durante el desarrollo se usaron scripts en Node para validar builds y
oportunidades contra la API real (los resultados quedan documentados en el
historial del proyecto, no se incluyen en el repositorio).
