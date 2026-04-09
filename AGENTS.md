# AGENTS.md

Guidance for AI coding agents operating in this repository.

## Project Overview

**Vue 3 + Vite** frontend with **Azure Functions v4** (Node.js) API, deployed to **Azure Static Web Apps** via GitHub Actions. A multi-page recruitment dashboard with role-based views (HR Admin, Hiring Manager, Director).

### Key Paths

| Path | Purpose |
|------|---------|
| `src/views/` | Page components (HRAdminPage, HiringManagerPage, DirectorPage) |
| `src/components/` | Shared components (CandidateDetail, CommentList, NavBar) |
| `src/router/` | Vue Router config (`index.js`) |
| `src/functions/` | **Unused legacy dir** — do NOT edit |
| `api/src/functions/` | Azure Function handlers (`.js`) |
| `api/src/index.js` | Azure Functions entry point |
| `api/src/functions/db.js` | SQL connection helper |
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

# API (Azure Functions) — run from api/ directory
cd api && func start # NOT --script-root api/src

# Database setup (one-time, after creating tables)
curl -X POST http://localhost:7071/api/setup-db      # Candidates table
curl -X POST http://localhost:7071/api/setup-db-v2   # Requisitions, Comments, FK columns

# Tests — not configured (npm test is a no-op)
# Linting — not configured
```

### CI/CD

`.github/workflows/azure-static-web-apps-orange-hill-0f44e6000.yml`:
- Triggers on push to `main` and PRs
- Runs `npm install` → `vite build` → deploys to SWA with `Azure/static-web-apps-deploy@v1`
- Config: `app_location: "/"`, `api_location: ""`, `output_location: "dist"`
- API is deployed separately to Function App via `func azure functionapp publish app-recuritment`

**Note**: The Function App (`app-recuritment`) is deployed manually using Azure Functions Core Tools. CI/CD for API deployment requires adding `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` secret to GitHub.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/get-candidates` | GET | List all candidates (with requisition title) |
| `/api/candidates-by-requisition?requisitionId=X` | GET | Candidates filtered by requisition |
| `/api/get-candidate?id=X` | GET | Single candidate |
| `/api/create-candidate` | POST | Create candidate (supports optional `requisitionId`) |
| `/api/update-candidate` | POST | Update candidate status |
| `/api/delete-candidate?id=X` | POST | Delete candidate |
| `/api/requisitions` | GET | List requisitions (optional `?status=Open`) |
| `/api/create-requisition` | POST | Create requisition |
| `/api/comments?candidateId=X` | GET | Comments for candidate |
| `/api/create-comment` | POST | Create comment (supports `rating`) |
| `/api/setup-db` | POST | Create Candidates table |
| `/api/setup-db-v2` | POST | Create Requisitions, Comments tables + FK columns |

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
- Error display pattern: `this.error` data prop + `v-if="error"` red block in template
- Success pattern: `this.success` data prop + `v-if="success"` green block

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

// API
const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.js')
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

- **Candidates**: Id, FirstName, LastName, Email (UNIQUE), Phone, Position, Status (default 'Applied'), Notes, RequisitionId (FK), CreatedAt, UpdatedAt
- **Requisitions**: Id, Title, Department, Description, HiringManagerName, Status (default 'Open'), CreatedAt, UpdatedAt
- **Comments**: Id, CandidateId (FK CASCADE), RequisitionId (FK), AuthorName, Role, CommentText, Rating, CreatedAt

---

## Architecture

### Current Setup
- **Static Web App** (orange-hill): Serves frontend at `https://www.fcecrecuritmentsite.emerson.com/`
- **Function App** (app-recuritment): Hosts API separately at `https://www.fcecrecuritmentsite.emerson.com/api/*`
- Frontend calls Function App directly via `VITE_API_URL` absolute URL

### Build / Deploy

```bash
# Frontend build with API URL
VITE_API_URL=https://www.fcecrecuritmentsite.emerson.com npx vite build

# Deploy API to Azure Function App (after az login)
cd api && func azure functionapp publish app-recuritment
```

### CI/CD

- GitHub Actions builds frontend with `VITE_API_URL` set to Function App URL
- API is deployed manually (or via Functions Core Tools)

---

## Authentication

- Azure AD authentication was **removed** (previously configured in `staticwebapp.config.json`)
- All routes are now public (no `allowedRoles` required)
- To re-enable: add `routes` and `responseOverrides` blocks per Azure SWA docs

---

## Common Issues

- **500 on API (SQL)**: Azure SQL firewall blocking SWA IP. Add CIDR ranges for your SWA region. Local IP must also be whitelisted.
- **500 on candidates-by-requisition**: Run `POST /api/setup-db-v2` to create Requisitions table and FK columns.
- **404 on API**: `api_location` must be `api` (not `api/src`) in workflow YAML.
- **PUT/DELETE rejected**: Use POST for all mutations.
- **`func start` fails**: Run from `api/` directory (not project root, not `api/src`). Set `AzureWebJobsStorage` to `UseDevelopmentStorage=true` in `api/local.settings.json`.
