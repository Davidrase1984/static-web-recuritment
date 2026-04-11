# AGENTS.md

Guidance for AI coding agents operating in this repository.

## Project Overview

**Vue 3 + Vite** frontend with **Azure Functions v4** (Node.js) API, deployed to **Azure Static Web Apps** via GitHub Actions. A multi-page recruitment dashboard with role-based views (HR Admin, Hiring Manager, Director) and a public **Apply** page for candidates to browse and apply for open positions.

### Key Paths

| Path | Purpose |
|------|---------|
| `src/views/` | Page components (ApplyPage, HRAdminPage, HiringManagerPage, DirectorPage) |
| `src/components/` | Shared components (CandidateDetail, CommentList, NavBar) |
| `src/router/` | Vue Router config (`index.js`) |
| `api/` | Legacy SWA functions (deprecated, not deployed) |
| `api/src/` | **Active** standalone Azure Functions (VNet integrated, linked to SWA) |
| `api/src/index.js` | Function loader (registers all functions) |
| `api/src/functions/` | Individual Azure Function handlers |
| `api/src/db.js` | SQL connection helper |
| `staticwebapp.config.json` | Azure SWA routing (SPA fallback) |

### Tech Stack

- **Frontend**: Vue 3 (Options API), Vite 6, Tailwind CSS 3, Vue Router 5
- **API**: Azure Functions v4 (Node.js, `@azure/functions`), CommonJS (`.js`)
- **Database**: Azure SQL (`mssql` package), SQL auth (password from `AZURE_SQL_PASSWORD` env var)
- **Deployment**: GitHub Actions → Azure Static Web Apps
- **No TypeScript**, no ESLint/Prettier, no test framework

---

## Build / Dev Commands

```bash
# Frontend (Vite) — run from project root
npm run dev          # Dev server, proxies /api → localhost:7071
npm run build        # Production build → dist/

# API (Azure Functions) — run from api/ directory for local dev
cd api && func start  # Runs on port 7071 by default

# Database setup (one-time, after creating tables)
curl -X POST http://localhost:7071/api/setup-db      # Candidates table
curl -X POST http://localhost:7071/api/setup-db-v2   # Requisitions, Comments, FK columns
curl -X POST http://localhost:7071/api/setup-db-v4   # JobDescriptionUrl column

# Tests — not configured (npm test is a no-op)
# Linting — not configured
```

### CI/CD

**Two separate deployments:**

1. **SWA Workflow** (`.github/workflows/azure-static-web-apps-orange-hill-0f44e6000.yml`):
   - Deploys frontend only
   - Config: `app_location: "/"`, `api_location: ""`, `output_location: "dist"`
   - `api_location: ""` disables SWA managed functions

2. **Function App** (separate GitHub Actions or `func azure functionapp publish`):
   - Deploys `api/src/` to standalone Function App
   - Function App is **linked** to SWA as backend
   - SWA routes `/api/*` to linked Function App via reverse proxy

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/get-candidates` | GET | List all candidates (with requisition title, stage name) |
| `/api/candidates-by-requisition?requisitionId=X` | GET | Candidates filtered by requisition |
| `/api/get-candidate?id=X` | GET | Single candidate (includes stage name) |
| `/api/create-candidate` | POST | Create candidate (Stage defaults to 1 - Applied) |
| `/api/update-candidate` | POST | Update candidate status |
| `/api/delete-candidate?id=X` | POST | Delete candidate |
| `/api/requisitions` | GET | List requisitions (optional `?status=Open`) |
| `/api/create-requisition` | POST | Create requisition |
| `/api/upload-jd` | POST | Upload JD document (multipart/form-data) |
| `/api/comments?candidateId=X` | GET | Comments for candidate |
| `/api/create-comment` | POST | Create comment (supports `rating`) |
| `/api/stage-transition` | POST | Move candidate to next stage (role-based) |
| `/api/get-stages` | GET | List all stages with permissions |
| `/api/get-candidate-history?candidateId=X` | GET | Get stage transition history |
| `/api/setup-db` | POST | Create Candidates table |
| `/api/setup-db-v2` | POST | Create Requisitions, Comments tables + FK columns |
| `/api/setup-db-v3` | POST | Add new Requisitions columns |
| `/api/setup-db-v4` | POST | Add JobDescriptionUrl column |
| `/api/setup-db-v5` | POST | Add Stage column + StageHistory table |

---

## Code Style

### General

- **ES modules** (`import`/`export`) in `src/`; **CommonJS** (`require`/`module.exports`) in `api/src/`
- No TypeScript, no semicolons, 2-space indent, ~120 char soft limit

### Vue 3 Components

- **Options API** only: `name`, `props`, `data`, `computed`, `methods`, `mounted`, `watch`
- PascalCase filenames (`CandidateDetail.vue`)
- Props with type/default; declare `emits` explicitly
- Data initialized with defaults (`""`, `null`, `[]`, `false`)
- `async mounted()` with `try/catch` for data fetching
- **Parallel loading in `mounted()`**: use `Promise.all()` for independent API calls (candidates, requisitions, stages)
- Error display pattern: `this.error` data prop + `v-if="error"` red block in template
- Success pattern: `this.success` data prop + `v-if="success"` green block
- **Silent refresh pattern**: after mutations (create, transition), use `silentFetch*()` methods that update data without setting `this.loading = true` — this keeps the list visible while refreshing. Only show loading spinner on initial load and manual refresh

### Styling (Tailwind)

- Utility classes directly in templates; no custom CSS classes
- Palette: `slate-*` (neutrals), `blue-*` (accents/primary), `red-*` (errors), `green-*` (success)
- Buttons: `bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200`
- Cards: `bg-white rounded-xl shadow-lg p-6`
- Status badges: conditional classes via helper methods returning Tailwind class strings

### Azure Functions

- One function per `.js` file; **filename = route** (`create-candidate.js` → `/api/create-candidate`)
- Pattern: `app.http(name, { methods, authLevel, handler })`
- **POST for all mutations** (Azure SWA doesn't reliably support PUT/DELETE)
- Logging: `context.log()` for info, `context.error()` for errors
- Return: `{ body: JSON.stringify({...}) }` or `{ status: NNN, body: JSON.stringify({...}) }`
- Input: `request.json()` for POST body, `request.query.get()` for query params

### SQL Queries

- **Always parameterized** — never interpolate user input
- Wrap in `try/catch`; return `{ status: 500, body: JSON.stringify({ error: err.message }) }`
- Use `sql.NVarChar`, `sql.Int`, `sql.DateTime2` for parameter types
- Graceful fallback: try JOIN query, catch and fall back to simpler query (see `get-candidates.js`)

### Imports

```js
// Frontend
import { createApp } from 'vue'
import MyComponent from './MyComponent.vue'
import './style.css'

// API (in api/src/functions/)
const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')
```

### Naming

| Item | Convention | Example |
|------|-----------|---------|
| Vue files | PascalCase | `CandidateDetail.vue` |
| Views | PascalCase + `Page` | `HRAdminPage.vue` |
| JS functions | camelCase | `fetchCandidates` |
| API files | kebab-case `.js` | `create-candidate.js` |
| SQL columns | PascalCase | `FirstName`, `CreatedAt` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |

### Error Handling

```js
// Frontend fetch
try {
  const res = await fetch("/api/endpoint")
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  // use data
} catch (err) {
  this.error = err.message
}

// Azure Function handler
try {
  const pool = await getConnection()
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM Candidates WHERE Id = @id')
  return { body: JSON.stringify({ candidates: result.recordset }) }
} catch (err) {
  context.error('Operation error:', err)
  return { status: 500, body: JSON.stringify({ error: err.message }) }
}
```

---

## Database Schema

- **Candidates**: Id, FirstName, LastName, Email (UNIQUE), Phone, Position, Status, Stage (1-15), Notes, RequisitionId (FK), CreatedAt, UpdatedAt
- **Requisitions**: Id, Title, Department, Description, HiringManagerName, Status (default 'Open'), CreatedAt, UpdatedAt
- **Comments**: Id, CandidateId (FK CASCADE), RequisitionId (FK), AuthorName, Role, CommentText, Rating, CreatedAt
- **StageHistory**: Id, CandidateId (FK), FromStage, ToStage, ChangedBy, Role, Notes, CreatedAt

## Pages & Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/apply` (default) | ApplyPage | Public — candidates browse open requisitions, view JD details, and submit applications |
| `/hr-admin` | HRAdminPage | HR Admin dashboard — manage requisitions, add candidates, screening, HR selection, offer release |
| `/hiring-manager` | HiringManagerPage | Hiring Manager dashboard — review candidates by requisition, technical interview/selection |
| `/director` | DirectorPage | Director dashboard — review and final selection/rejection |

### Apply Page Flow

1. **Job Listings** — card grid of all Open requisitions (department, hiring manager, hiring type, description)
2. **Job Detail** — click a card to see full description, requisition number, JD download link
3. **Application Form** — click "Apply Now" → form (First Name, Last Name, Email, Phone, Notes) → submits via `POST /api/create-candidate` with `requisitionId` and `position` set from the requisition → candidate created at Stage 1 (Applied)
4. Navigation: Job Listings ↔ Job Detail ↔ Application Form (back buttons at each step)

---

## Recruitment Pipeline Stages

| Stage | Name | Managed By |
|-------|------|------------|
| 1 | Applied | System |
| 2 | Screening | HR Admin |
| 3 | Technical Interview | Hiring Manager |
| 4 | Technical Selected | Hiring Manager |
| 5 | Technical Rejected | Hiring Manager |
| 6 | Technical Hold | Hiring Manager |
| 7 | HR Selected | HR Admin |
| 8 | HR Rejected | HR Admin |
| 9 | HR Hold | HR Admin |
| 10 | Director Review | Director |
| 11 | Director Selected | Director |
| 12 | Director Rejected | Director |
| 13 | Offer Released | HR Admin |
| 14 | Offer Accepted | HR Admin |
| 15 | Offer Revoked | HR Admin |

### Role-Based Transition Permissions

| Transition | HR Admin | Hiring Manager | Director |
|------------|----------|----------------|----------|
| Applied → Screening | ✅ | ❌ | ❌ |
| Screening → Technical/Hr/Hold | ✅ | ❌ | ❌ |
| Technical → HR Selected/Hold/Rejected | ❌ | ✅ | ❌ |
| HR → Director Review/Rejected | ✅ | ❌ | ❌ |
| Director → Offer/Rejected | ❌ | ❌ | ✅ |
| Offer → Accepted/Revoked | ✅ | ❌ | ❌ |

---

## Architecture

### Current Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER ACCESS                                       │
│                                                                             │
│  Browser ──▶ https://www.fcecrecuritmentsite.emerson.com                   │
│                         │                                                   │
│                    Application Gateway                                      │
│                    (Private VNet: 10.14.11.x)                               │
│                         │                                                   │
│                    Azure Static Web App                                     │
│                    ┌─────────────────────────────┐                           │
│                    │   Frontend (dist/)          │                           │
│                    │   Vue 3 + Vite + Tailwind │                           │
│                    └──────────────┬──────────────┘                           │
│                                   │                                          │
│                    /api/* ────────▼──────────────┐                           │
│                                   │              │                           │
│                    ┌──────────────▼──────────────▼──────────────┐          │
│                    │     Standalone Function App                │          │
│                    │     (VNet Integrated)                      │          │
│                    │     app-recuritment                        │          │
│                    └──────────────┬─────────────────────────────┘          │
│                                   │                                          │
│                    ┌──────────────▼──────────────┐                          │
│                    │   Azure Storage (Private)   │                          │
│                    │   webappstorageaccount.blob │                          │
│                    └─────────────────────────────┘                          │
│                                   │                                          │
│                    ┌──────────────▼──────────────┐                          │
│                    │   Azure SQL (Private)         │                          │
│                    │   azuresqlfcec.privatelink  │                          │
│                    │   IP: 10.14.11.103           │                          │
│                    └─────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Build / Deploy

```bash
# Frontend build with API URL (GitHub Actions does this automatically)
VITE_API_URL=https://www.fcecrecuritmentsite.emerson.com npx vite build

# Local API testing
cd api && func start
```

### CI/CD

- GitHub Actions builds frontend with `VITE_API_URL` set to the public URL
- SWA routes `/api/*` to linked Function App (reverse proxy)
- Two separate deployments: SWA (frontend) + Function App (backend)

### Environment Variables

**Function App** → Configuration → Application settings:
- `AZURE_SQL_PASSWORD` - SQL authentication password
- `AZURE_SQL_USER` - SQL username (default: `fcec`)
- `AZURE_STORAGE_CONNECTION_STRING` - Storage account connection string

**SWA** (if needed):
- No environment variables needed - uses linked backend

### Data Flow Example: Get Candidates

```
Browser                          Azure Static Web App              Function App (Linked)      Azure SQL
  │                                       │                              │                         │
  │ GET /api/get-candidates              │                              │                         │
  │─────────────────────────────────────▶│                              │                         │
  │                                       │ Reverse proxy to backend      │                         │
  │                                       │─────────────────────────────▶│                         │
  │                                       │                              │                         │
  │                                       │                              │ SQL Query              │
  │                                       │                              │────────────────────────▶│
  │                                       │                              │                         │
  │                                       │                              │    { candidates: [...] }
  │                                       │                              │◀────────────────────────│
  │                                       │      { candidates: [...] }   │                         │
  │ { candidates: [...] }                 │◀────────────────────────────│                         │
  │◀─────────────────────────────────────│                              │                         │
```

### Local Development vs Production

| Component | Local Dev | Production |
|-----------|----------|------------|
| Frontend | `npm run dev` (Vite) | GitHub Actions → SWA |
| API | `func start` (port 7071) | Standalone Function App |
| VITE_API_URL | Empty (uses proxy) | `https://www.fcecrecuritmentsite.emerson.com` |
| SQL Connection | Not available (private) | VNet → privatelink |

### API Structure (Standalone Function App)

```
api/src/
├── host.json                          # Function host config
├── local.settings.json                # Local environment vars
├── package.json                       # Dependencies (@azure/functions, mssql, @azure/storage-blob)
├── index.js                           # Loads all functions
├── db.js                              # SQL connection helper
└── functions/
    ├── health.js
    ├── get-candidates.js
    ├── get-candidate.js
    ├── create-candidate.js
    ├── update-candidate.js
    ├── delete-candidate.js
    ├── requisitions.js
    ├── create-requisition.js
    ├── comments.js
    ├── create-comment.js
    ├── candidates-by-requisition.js
    ├── upload-jd.js                   # Blob storage upload
    └── setup-db-v4.js
```

### Private Network

| Resource | Private DNS | IP Address |
|----------|-------------|------------|
| Azure SQL | `azuresqlfcec.privatelink.database.windows.net` | `10.14.11.103` |
| Storage | `webappstorageaccount.privatelink.blob.core.windows.net` | `10.14.11.106` |
| Function App | `app-recuritment-f0c6dshzdhbmcsct.southeastasia-01.privatelink.azurewebsites.net` | `10.14.11.105` |

---

## Authentication

- Azure AD authentication was **removed** (previously configured in `staticwebapp.config.json`)
- All routes are now public (no `allowedRoles` required)
- To re-enable: add `routes` and `responseOverrides` blocks per Azure SWA docs

---

## Common Issues

- **500 on API (SQL)**: Azure SQL firewall blocking Function App IP. Add CIDR ranges for your Function App region. Local IP must also be whitelisted.
- **500 on candidates-by-requisition**: Run `POST /api/setup-db-v2` to create Requisitions table and FK columns.
- **404 on API**: Verify Function App is linked to SWA. Check Azure Portal → SWA → APIs.
- **PUT/DELETE rejected**: Use POST for all mutations.
- **`func start` fails**: Run from `api/` directory (not `api/src`). Ensure `@azure/storage-blob` is installed.
- **Functions not found**: Ensure `index.js` requires all function files with correct import paths (`../db.js` not `./db.js`).
- **Upload fails (not a function)**: Use `getBlockBlobClient()` instead of `getBlobClient()` for upload operations.
- **Upload 500**: Ensure `AZURE_STORAGE_CONNECTION_STRING` is set in Function App Application settings.
