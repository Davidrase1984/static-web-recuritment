# AGENTS.md

This file provides guidance to AI coding agents operating in this repository.

## Project Overview

**Vue 3 + Vite** frontend with an **Azure Functions v4** (Node.js) API backend, deployed to **Azure Static Web Apps** via GitHub Actions. The frontend fetches `/api/get-candidates` on mount to display a recruitment dashboard.

### Key Paths

| Path | Purpose |
|------|---------|
| `src/` | Vue 3 frontend source |
| `src/functions/` | **Unused legacy dir** — do NOT edit these files |
| `api/src/` | Azure Functions entry + setup |
| `api/src/functions/` | Active Azure Function handlers (`.js`) |
| `dist/` | Vite production build output |
| `staticwebapp.config.json` | Azure SWA routing config |

### Tech Stack

- **Frontend**: Vue 3 (Options API), Vite 6, Tailwind CSS 3
- **API**: Azure Functions v4 (Node.js, `@azure/functions`), CommonJS (`.js` files)
- **Database**: Azure SQL (`mssql` npm package), SQL auth (password from env var)
- **CSS**: Tailwind CSS via `postcss` + `autoprefixer`
- **Deployment**: GitHub Actions → Azure Static Web Apps
- **No TypeScript** — plain JavaScript throughout
- **No test framework** — tests not yet configured
- **No ESLint/Prettier** — no automated linting

---

## Build / Dev Commands

### Frontend (Vite)

```bash
npm run dev        # Start Vite dev server (proxies /api → localhost:7071)
npm run build      # Build for production → dist/
```

### API (Azure Functions)

```bash
func start --script-root api/src   # Run API locally via Azure Functions Core Tools
```

Or use VS Code Azure Functions extension. The API has its own `api/package.json` with `@azure/functions` dependency.

### Tests

**No test framework configured.** `npm test` is a no-op placeholder.

To add tests (recommended: Vitest):

```bash
npm install -D vitest @vue/test-utils
npx vitest run src/components/MyComponent.test.js   # Single test file
npx vitest src/components/MyComponent.test.js        # Watch mode
```

### Linting

**Not configured.** To add ESLint:

```bash
npm install -D eslint eslint-plugin-vue
npx eslint src/           # Lint all source files
npx eslint src/ --fix     # Auto-fix fixable issues
```

### CI/CD

GitHub Actions workflow at `.github/workflows/azure-static-web-apps-gentle-beach-084b53200.yml`:
- Triggers on push to `main` and PRs
- Runs `npm install` → `npx vite build` → deploys with `Azure/static-web-apps-deploy@v1`
- Config: `app_location: "/"`, `api_location: "api"`, `output_location: "dist"`
### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check (verifies env vars are set) |
| `/api/get-candidates` | GET | List all candidates |
| `/api/get-candidate?id=X` | GET | Get single candidate |
| `/api/create-candidate` | POST | Create new candidate |
| `/api/update-candidate` | POST | Update candidate |
| `/api/delete-candidate?id=X` | POST | Delete candidate |
| `/api/setup-db` | POST | Create Candidates table (one-time) |


---

## Code Style Guidelines

### General

- **ES modules** (`import`/`export`) in `src/` — frontend code
- **CommonJS** (`require`/`module.exports`) in `api/src/` — API files use `.js` extension with `"type": "commonjs"` in `api/package.json`
- No TypeScript — plain JavaScript only
- No semicolons (existing code has none in JS files)
- 2-space indentation
- No trailing whitespace
- Max line length: ~120 characters (soft limit)

### Vue 3 Components

- Use **Options API** (`name`, `data`, `methods`, `mounted`) — matches `App.vue`
- Component names: PascalCase (e.g., `UserProfile.vue`)
- One component per file
- Handle errors in templates with `v-if="error"` and styled error blocks
- Use `async/await` in lifecycle hooks with `try/catch`
- Data properties initialized with default values (`""`, `null`)

### Styling (Tailwind CSS)

- Use Tailwind utility classes directly in templates
- Tailwind config at `tailwind.config.js` scans `src/**/*.{vue,js,ts,jsx,tsx}`
- Base styles / resets in `src/style.css` via `@layer base`
- Color palette: `slate-*` (neutrals), `blue-*` (accents), `red-*` (errors)
- Use `transition-colors duration-200` for hover effects on buttons

### Azure Functions

- Each function gets its own `.js` file under `api/src/functions/`
- **Function name IS the route path**: `create-candidate.js` → `/api/create-candidate`
- Use `app.http(name, { methods, authLevel, handler })` pattern
- **Use POST for mutations** — Azure SWA doesn't support PUT/DELETE methods reliably
- Always log with `context.log(...)` for info, `context.error(...)` for errors
- Return `{ body: JSON.stringify({ ... }) }` for JSON responses
- Parse input via `request.query.get()`, `request.text()`, `request.json()`
- Entry point `api/src/index.js` does global `app.setup({ enableHttpStream: true })`

### Azure SQL Database


- Connection helper at `api/src/functions/db.js` exports `{ sql, getConnection, closeConnection }`
- Uses SQL auth with hardcoded server/database/user; password from `process.env.AZURE_SQL_PASSWORD`
- Set `AZURE_SQL_PASSWORD` in Azure Portal → Static Web App → Configuration → Environment variables
- Use **parameterized queries** — never interpolate user input into SQL
  ```js
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM Candidates WHERE Id = @id')
  ```
- Always wrap DB calls in `try/catch` and return proper error status codes
- Use `sql.NVarChar`, `sql.Int`, `sql.DateTime2` etc. for parameter types
- One-time setup via `POST /api/setup-db` (creates tables if not exists)
### Azure SQL Firewall

Azure Static Web Apps uses a **pool of outbound IPs** that change frequently. Adding individual IPs to the firewall does NOT work. Instead, add **CIDR ranges** for the SWA region.

**How to find the correct ranges:**
1. Download Microsoft's official Azure IP ranges: `https://download.microsoft.com/download/7/1/d/71d86715-5596-4529-9b13-da13a5de5b63/ServiceTags_Public_YYYYMMDD.json`
2. Match your SWA's outbound IPs (from error messages) against `AzureCloud.<region>` entries
3. Add the matching CIDR ranges to Azure SQL firewall as Start IP / End IP rules

**For East Asia region, these 3 ranges cover all possible IPs:**
- `20.6.128.0/17` → Start: `20.6.128.0` End: `20.6.255.255`
- `20.239.0.0/16` → Start: `20.239.0.0` End: `20.239.255.255`
- `20.255.0.0/16` → Start: `20.255.0.0` End: `20.255.255.255`

Add these in Azure Portal → SQL Server → Networking → Firewall rules.


### Database Schema

**Candidates table:**
```sql
CREATE TABLE Candidates (
  Id          INT IDENTITY(1,1) PRIMARY KEY,
  FirstName   NVARCHAR(100) NOT NULL,
  LastName    NVARCHAR(100) NOT NULL,
  Email       NVARCHAR(255) NOT NULL UNIQUE,
  Phone       NVARCHAR(20),
  Position    NVARCHAR(100),
  Status      NVARCHAR(50) DEFAULT 'Applied',
  Notes       NVARCHAR(MAX),
  CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),
  UpdatedAt   DATETIME2 DEFAULT GETUTCDATE()
);
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Vue files | PascalCase | `UserProfile.vue` |
| JS functions | camelCase | `fetchUserData` |
| API function files | camelCase + `.js` | `message.js` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| CSS classes | kebab-case | `error-message` |

### Imports

**Frontend (`src/`):**
```js
import { ref, computed } from 'vue'
import MyComponent from './MyComponent.vue'
import './style.css'
```

**API (`api/src/`):**
```js
const { app } = require('@azure/functions');
```

### Error Handling

- Wrap `fetch` calls in `try/catch`; check `response.ok` before parsing
- Use safe JSON parsing — read as `text()` first, then `JSON.parse()` to handle non-JSON errors
  ```js
  if (!response.ok) {
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    } catch {
      throw new Error(`HTTP error! status: ${response.status} - ${text.substring(0, 100)}`)
    }
  }
  ```
- Store errors in `this.error` data property; display with `v-if="error"` in template
- Azure Functions: use `context.log` / `context.error`

### Git Conventions

- Commit messages: imperative mood, short first line
  - Good: `Fix Azure Static Web Apps api_location config`
  - Bad: `fixed stuff` or `Fixed the bug`
- Never commit `node_modules/`, `dist/`, `.env`, or secrets
- Run `npm run build` before pushing to verify the build succeeds

---

## Common Issues

- **404 on API calls**: Ensure `api_location` is `api` (not `api/src`) in the workflow YAML. Azure needs `host.json` in the root of the API location.
- **500 on API calls (SQL connection)**: Azure SQL firewall is blocking the SWA outbound IP. Check the error message for the IP address, then add the CIDR ranges (see Azure SQL Firewall section above).
- **PUT/DELETE not supported**: Azure Static Web Apps doesn't reliably support PUT/DELETE methods. Use POST for all mutations instead.

- **Git identity not set**: If commits fail with "Author identity unknown", set:
  ```bash
  git config --global user.name "YourName"
  git config --global user.email "you@example.com"
  ```
