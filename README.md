# Nexora Analytics

### Enterprise Analytics Dashboard

A modern, responsive enterprise analytics platform built to transform business data into actionable insights through interactive dashboards, advanced visualizations, customer analytics, and reporting.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | UI development |
| TypeScript | Type safety |
| Vite | Build tooling |
| Redux Toolkit | Global state management |
| TanStack Query | Server-state management and caching |
| TanStack Table | Advanced data tables |
| Apache ECharts | Interactive data visualization |
| Tailwind CSS v4 | Styling |
| React Router | Application routing |
| Lucide React | Icons |

---

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- 

### Available Commands

```bash
npm run dev        # Start development server
npm run typecheck  # Run TypeScript checks
npm run lint       # Run ESLint
npm test           # Run test suite
npm run build      # Create production build
```

---

## Application Features

### 1. Analytics Overview

A centralized dashboard providing a comprehensive overview of business performance.

**KPI Metrics:**
- Total Revenue
- Total Users
- Active Users
- Conversion Rate
- Average Order Value
- Customer Retention

Each KPI includes performance comparisons, percentage changes, trend indicators, and sparklines.

### 2. Revenue Analytics

Detailed revenue performance and financial insights.

- Revenue trends and breakdowns.
- Daily revenue analysis.
- Product and category performance.
- Order value distribution.
- Refund analysis.
- Interactive charts and filtering.

### 3. Customer Analytics

Customer acquisition, engagement, and retention insights.

- Customer directory.
- Customer search and sorting.
- Customer segmentation.
- Retention metrics.
- Customer-level analytics.
- CSV export.

### 4. Product Performance

Analyze product-level business performance.

- Product-wise revenue.
- Product demand analysis.
- Category distribution.
- Value breakdowns.
- Refund analysis.

### 5. Orders Management

An advanced operational data table with:

- Sorting and global search.
- Status-based filtering.
- Pagination.
- Column visibility controls.
- Row selection.
- Operational KPI cards.
- Status distribution charts.
- Volume analytics.
- CSV export.

### 6. Reports

Generate and manage analytics reports.

Supported report types:

1. Orders
2. Analytics
3. Customers
4. Products
5. Regions
6. Daily Revenue
7. Order Status

Generated reports persist locally and support downloadable exports.

### 7. Settings

Manage personal workspace preferences, theme, density, and application settings.

---

## Global Filtering System

Shared filters are available across analytics pages.

**Date Filters:**
- Today
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date ranges

**Additional Filters:**
- Multi-select regions.
- Multi-select product categories.

Selected filters update analytics, KPI calculations, charts, tables, and exports.

---

## Authentication & Role-Based Access

Nexora includes a demonstration authentication flow with protected routes and three workspace roles.

| Role | Access |
|---|---|
| Admin | Full workspace access |
| Manager | Analytics, customer analytics, reports, and permitted pages |
| Analyst | Core analytics, orders, and personal settings |

### Demo Login

- Email: Any valid email address.
- Password: Minimum 6 characters.
- Role: Select Admin, Manager, or Analyst.

Authentication and browser-based role guards are demonstration features. A production backend must independently enforce authentication and authorization for private data.

---

## Data & API Architecture

The application uses a structured mock service layer designed for future backend integration.

### Mock Data

The analytics service provides:

- 36,000 deterministic records.
- Two years of historical data.
- 1,600 customer identities.
- 20 products.
- Aggregation and asynchronous data requests.

Replace `src/services/analytics.ts` to integrate a real backend.

### State Management

**Redux Toolkit** manages:
- Authentication and session.
- Global filters.
- Sidebar state.
- Theme preferences.
- Display density.

**TanStack Query** manages:
- Data fetching.
- Server-state caching.
- Query invalidation.
- Asynchronous loading and error states.

**TanStack Table** manages:
- Sorting.
- Searching.
- Filtering.
- Pagination.
- Column visibility.
- Row selection.

---

## Analytics Calculation Logic

The application follows consistent business calculation rules:

- **Revenue:** Includes completed and processing orders. Other statuses contribute no revenue.
- **Users:** Calculated using distinct customer email addresses.
- **Conversion Rate:** Represents the share of completed and processing orders.
- **Customer Retention:** Represents the share of customers with repeat orders within the selected period.
- **Traffic Sources:** Simulated order acquisition channels, not actual website tracking.

---

## Search & Discovery

The global header search supports finding charts and KPI metrics across permitted pages.

Features:
- Search charts and metrics.
- Navigate directly to matching results.
- Focus the corresponding dashboard card.
- Respect role-based page permissions.

---

## Data Export & Reporting

Nexora supports multiple export formats.

| Format | Capabilities |
|---|---|
| CSV | Full filtered datasets |
| PDF | Current analytics page snapshot |
| PowerPoint | Editable titles, KPI text and tables |

### Export Capabilities

- Export data in CSV, PDF, and PowerPoint.
- Export selected table rows when selections exist.
- Export all matching records across pages when no rows are selected.
- Capture current filters and KPI values.
- Include charts and the selected visualization.
- Switch chart visualizations to Data mode to include their data tables.
- Download reports locally.

PDF and PowerPoint exports capture the current page's KPI values, charts, selected filter context, and currently displayed table rows.

Chart visualizations are embedded as images in document exports. PowerPoint titles, KPI text, and tables remain editable.

Export libraries are loaded on demand. Exports are blocked while data is loading or showing an error.

---

## Testing & Validation

The project includes tests for:

- Analytics calculations.
- Combined filtering.
- Role-based permissions.
- CSV export safety.
- Credential validation.
- Table searching.
- Row selection.
- Column visibility.
- Pagination.
- Empty results.

### Verification Commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

All four verification commands pass.

**Browser testing:** No browser automation is installed. Visual and full browser interaction QA remain manual.

---

## Project Structure

```text
src/
├── components/
│   ├── brand/
│   ├── charts/
│   ├── common/
│   ├── search/
│   └── tables/
├── pages/
│   ├── AnalyticsPage.tsx
│   ├── CustomersPage.tsx
│   └── Login.tsx
├── services/
│   ├── analytics.ts
│   ├── customers.ts
│   └── reports.ts
├── store/
│   └── index.ts
├── styles/
│   └── index.css
├── test/
│   └── setup.ts
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

---

## Build Status

- [x] Phase 1 — Project setup and architecture.
- [x] Design tokens and utilities.
- [x] Analytics dashboard implementation.
- [x] Seven routed application pages.
- [x] State management and data fetching.
- [x] Advanced tables and filtering.
- [x] Authentication and role-based navigation.
- [x] CSV, PDF, and PowerPoint exports.
- [x] Automated test suite.
- [x] TypeScript, lint, and production build verification.
- [ ] Browser-based visual and interaction QA.

---

## Future Backend Integration

The initial implementation uses deterministic mock data.

Future integration can replace the mock service layer with real APIs while retaining the existing application architecture.

Production deployment should include:
- Secure authentication.
- Server-side role-based authorization.
- Persistent data storage.
- Backend analytics aggregation.
- Production-grade API error handling.

---

## License

This project is developed as an enterprise analytics dashboard portfolio project.

---

**Nexora Analytics — Turn data into direction.**
