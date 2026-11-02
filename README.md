# Nexora Analytics — Enterprise Analytics Dashboard

React + TypeScript + Vite · Redux Toolkit · TanStack Query · TanStack Table · Apache ECharts · Tailwind CSS v4 · React Router

## Run
Requires Node 20.19+ (or 22.12+).

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test
npm run build
```

## Build status
- [x] Phase 1 — project setup, architecture, design tokens, utilities, tests

## Completed application

- Seven routed pages: overview, revenue, customers, products, orders, reports, settings.
- Sign in at `/login` using any valid email and a password of at least six characters. Select Admin, Manager or Analyst to test page permissions. Any valid email and password with six characters works.
- Admin and Manager can access customer analytics and reports; Analyst can access core analytics, orders and personal settings.
- Shared date presets/custom ranges, multi-select regions and categories feed all analytics and exports.
- The mock service owns 36,000 deterministic records spanning two years, 1,600 customer identities and 20 products, aggregation and asynchronous requests. Replace `src/services/analytics.ts` to connect a backend.
- Redux owns session, filters, sidebar, theme and density. TanStack Query caches server data. TanStack Table handles sorting, searching, status filters, pagination, visibility and selection.
- Reports persist locally and download CSV snapshots. Table exports use selected rows when present, otherwise all matching rows across pages.
- Revenue counts completed/processing orders; other statuses contribute no revenue. Users are distinct customer emails. Conversion is the share of completed/processing orders. Retention is the share of customers with repeat orders within the selected period. Traffic channels are simulated order acquisition sources, not web tracking.
- Mock authentication and browser role guards are demonstration features; a real backend must enforce access for private data.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. Tests cover calculations, combined filters, permissions, CSV safety, credential validation, table searching, selection, visibility, pagination and empty results. No browser automation is installed; visual and full browser interaction QA remain manual.


## Expanded analytics and document exports

The header search finds charts and KPI metrics across permitted pages, navigates to the result and focuses its card. The customer directory supports searching, sorting, pagination and CSV export. Orders has operational KPIs, status distribution and volume charts; Revenue and Products include additional product, value, demand and refund breakdowns. Reports can generate seven types: orders, analytics, customers, products, regions, daily revenue and status.

Use **Export data** to select CSV, PDF or PowerPoint. PDF/PPTX exports capture the current page's KPI values, charts (including the selected visualization), selected filter context and the currently displayed table rows. Switch a chart to Data to include that data table. CSV exports include the full filtered order dataset. Charts in document exports are images; PowerPoint titles, KPI text and tables are editable. Libraries load on demand. Export is blocked while data is loading or showing an error.
