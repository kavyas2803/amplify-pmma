# Panasonic GL Tax Classification Portal — Frontend

Frontend for the AI-powered GL Tax Classification Agent POC, built for PMMA's
Finance team (Panasonic AI Hackathon). Automates classification of GL expense
transactions into Malaysian IRB tax categories, replacing the manual
keyword-matching process against SGST exports.

## Overview

This app implements the full review workflow described in the project SOW:

1. **Upload** — SAP GL export (SGST pull) + Provision file
2. **Provision matching** — handled by the backend; matched items are tagged `Provision`
3. **AI classification** — LLM-suggested tax category with confidence + reasoning
4. **Review & correction** — Finance reviews, edits, and confirms the final tax classification per line item
5. **Re-run** — request a fresh AI classification for a single line item without affecting the rest of the run
6. **Finalize** — once 100% of line items are reviewed, generate the KPMG-format Excel output
7. **Audit trail** — every classification, edit, re-run, and status change is recorded per line item

The frontend runs entirely on **mock data** today. All mock logic sits behind
a repository/service layer so it can be swapped for the real REST API later
with no changes to pages or components (see [Architecture](#architecture)).

## Tech Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Ant Design 5 (components) + Tailwind CSS v4 (layout/utility styling)
- Axios (dormant until `VITE_USE_MOCK_DATA=false`)
- dayjs, lucide-react

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.development` as a starting point. Key variables:

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for the real backend API | (empty) |
| `VITE_USE_MOCK_DATA` | `true` = use in-memory mock services, `false` = use Axios/real API | `true` |
| `VITE_APP_ENV` | Environment label | `development` |
| `VITE_POLLING_INTERVAL_MS` | Run status polling interval | `3000` |

**Never** put secrets (API keys, credentials) in `VITE_*` variables — they are
exposed to the browser bundle.

## Local Development

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Mock login

```
Email:    admin@panasonic.com
Password: Demo@2025
```

Mock credentials live in `src/mock-data/authCredentials.ts`, isolated from
the Login page and the auth service contract — delete that file and flip
`VITE_USE_MOCK_DATA=false` once Cognito (or the real IdP) is wired up.

## Build

```bash
npm run build   # tsc -b && vite build
npm run preview # serve the production build locally
```

## Folder Structure

```
src/
├── app/                 # Router, providers (Auth), AntD theme config
├── pages/                # Route-level pages (Login, Dashboard, Classification, ClassificationResults)
├── components/
│   ├── layout/           # AppLayout, Header, Sidebar, MobileNavigation
│   ├── common/            # Reusable primitives: DataTable, StatusBadge, TruncatedText,
│   │                       IconAction, SearchBar, FilterButton, Empty/Loading/Error states
│   ├── classification/    # NewUploadModal, RunHistoryTable, RunHistoryFilters
│   └── lineItems/         # LineItemTable, EditLineItemModal, RowHistoryModal, LineItemFilters
├── services/
│   ├── api/               # axiosClient, tokenStore, real (Axios) service implementations
│   └── repositories/      # Single entry point per domain — switches mock/real via env.useMockData
├── mock-data/             # Seeded in-memory "backend": runs, line items, history, dashboard
├── hooks/                 # useRuns, useLineItems, useRunPolling
├── constants/              # statuses, classifications, navigation, labels, messages, history events
├── types/                  # run, lineItem, history, user, dashboard, api
├── utils/                   # formatting, truncation, validation
└── config/                   # environment.ts, assets.ts
```

## Architecture

### Mock ↔ Real API swap

Every domain (auth, classification, dashboard) follows the same pattern:

```
Page / Component
      ↓
Hook (useRuns, useLineItems)
      ↓
Repository (single import site for the UI)
      ↓
env.useMockData ? mock-data/* : services/api/*
```

To connect the real backend:

1. Implement the corresponding endpoints (contracts already defined in
   `services/api/classificationService.ts`, `authService.ts`, `downloadService.ts`).
2. Set `VITE_API_BASE_URL` and `VITE_USE_MOCK_DATA=false`.
3. No page or component code changes required.

### Authentication

`src/app/providers/AuthProvider.tsx` wraps the app and exposes `useAuth()`.
Session token/user are stored in `sessionStorage` via `services/api/tokenStore.ts`.
Routes under `/dashboard`, `/classification` are gated by `ProtectedRoute`.

### Centralized theme

Colors are defined once in `src/index.css` (`@theme` block, Tailwind v4) and
mirrored in `src/app/providers/antdTheme.ts` for Ant Design's `ConfigProvider`.
Update both together when the palette changes — no component should hardcode
a hex value.

### Run lifecycle

```
Processing → Ready for Review → In Review → Finalized
                                          ↘ Failed
```

Statuses, tax classification codes, and history event types are all defined
once in `src/constants/` and consumed everywhere via those constants — never
as inline strings.

## Known Limitations (POC scope)

- Mock data lives in browser memory only; it resets on every full page reload
  or new browser session (no persistence layer in this phase).
- Max 100 line items per run, per SOW.
- No live SAP / TAP / NLS integration — output is a downloadable Excel file.
- Mobile is supported but desktop is the primary target (finance back-office tool).

## Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| Blank page after `npm run build` + static serve | SPA fallback not configured | Ensure the host rewrites all paths to `index.html` (see hosting config) |
| Login always fails | Wrong mock credentials | Use `admin@panasonic.com` / `Demo@2025`, or check `mock-data/authCredentials.ts` |
| Colors look off after a palette change | Tailwind and AntD theme out of sync | Update both `src/index.css` and `src/app/providers/antdTheme.ts` |
| "Finalize" stays disabled | Not all line items reviewed | Review Progress must reach `total / total` |
