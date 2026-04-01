# AGENTS.md

This file provides guidance to AI coding agents operating in this repository.

## Project Overview

**Vue 3 + Vite** frontend with an **Azure Functions v4** (Node.js) API backend, deployed to **Azure Static Web Apps** via GitHub Actions. The frontend fetches `/api/message` on mount.

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
- **Database**: Azure SQL (`mssql` npm package), Active Directory auth
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
- Use `app.http(name, { methods, authLevel, handler })` pattern
- Always log with `context.log(...)` for info, `context.error(...)` for errors
- Return `{ body: JSON.stringify({ ... }) }` for JSON responses
- Parse input via `request.query.get()`, `request.text()`, `request.json()`
- Entry point `api/src/index.js` does global `app.setup({ enableHttpStream: true })`

### Azure SQL Database

- Connection helper at `api/src/functions/db.js` exports `{ sql, getConnection, closeConnection }`
- Connection string from `process.env.AZURE_SQL_CONNECTION_STRING` (set in `local.settings.json` for dev, Azure Portal for prod)
- Use **parameterized queries** — never interpolate user input into SQL
  ```js
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM Candidates WHERE Id = @id')
  ```
- Always wrap DB calls in `try/catch` and return proper error status codes
- Use `sql.NVarChar`, `sql.Int`, `sql.DateTime2` etc. for parameter types
- One-time setup via `POST /api/setup-db` (creates tables if not exists)

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
- Store errors in `this.error` data property; display with `v-if="error"` in template
- Log to console: `console.error('Fetch error:', err)`
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
- **Duplicate `message.js`**: `src/functions/message.js` is **NOT used**. The active API function is `api/src/functions/message.js`. The stale file in `src/` should be cleaned up.
- **Git identity not set**: If commits fail with "Author identity unknown", set:
  ```bash
  git config --global user.name "YourName"
  git config --global user.email "you@example.com"
  ```
