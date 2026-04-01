# AGENTS.md

This file provides guidance to AI coding agents operating in this repository.

## Project Overview

This is a **Vue 3 + Vite** frontend application with an **Azure Functions** (Node.js) API backend, deployed to **Azure Static Web Apps**. The frontend fetches from `/api/message` on mount.

### Key Paths

| Path | Purpose |
|------|---------|
| `src/` | Vue 3 frontend source (Vite) |
| `api/src/` | Azure Functions API source |
| `api/src/functions/` | Individual Azure Function handlers |
| `dist/` | Built frontend output (Vite build) |
| `staticwebapp.config.json` | Azure Static Web Apps routing config |

### Tech Stack

- **Frontend**: Vue 3, Vite 6, @vitejs/plugin-vue
- **API**: Azure Functions v4 (Node.js, @azure/functions)
- **Deployment**: Azure Static Web Apps CI/CD via GitHub Actions
- **No TypeScript** — plain JavaScript throughout
- **No test framework** — tests not yet configured

---

## Build / Lint / Dev Commands

### Frontend (Vite)

```bash
npm run dev        # Start Vite dev server with hot-reload (proxies /api to localhost:7071)
npm run build      # Build for production → outputs to dist/
npm run preview    # Preview the production build locally
```

### API (Azure Functions)

The API runs locally via the Azure Functions Core Tools. No npm scripts are defined for it. To run:

```bash
func start --script-root api/src
```

Or use VS Code's Azure Functions extension.

### Tests

**No test framework is configured.** The `test` script is a placeholder:

```bash
npm test           # Currently a no-op: "echo \"Error: no test specified\" && exit 1"
```

To add tests, install a framework (e.g., Vitest is recommended for Vite projects):

```bash
npm install -D vitest @vue/test-utils
```

Run a single test file with:

```bash
npx vitest run src/components/MyComponent.test.js
```

Or in watch mode:

```bash
npx vitest src/components/MyComponent.test.js
```

### Linting

**No ESLint or Prettier is configured.** The codebase has no automated linting.

If adding ESLint:

```bash
npm install -D eslint eslint-plugin-vue
npx eslint src/           # Lint all source files
npx eslint src/ --fix     # Auto-fix fixable issues
```

---

## Code Style Guidelines

### General

- Use **ES modules** (`import`/`export`) in `src/` (Vite/Vue files)
- Use **CommonJS** (`require`/`module.exports`) in `api/src/` (Azure Functions — Node.js)
- No TypeScript — plain JavaScript only
- No semicolons in new code (existing code has none in JS files)
- 2-space indentation
- No trailing whitespace
- Max line length: ~120 characters (soft limit)

### Vue 3 Components

- Use **Options API** (`name`, `data`, `methods`, `mounted`, etc.) — matches existing style in `App.vue`
- Component names: PascalCase (e.g., `UserProfile.vue`)
- One component per file
- Prefer `<script setup>` if adding new large components, but match existing Options API style for consistency in small components
- Always handle errors gracefully (e.g., `v-if="error"` in templates)
- Use `async/await` in lifecycle hooks with `try/catch`

### Azure Functions

- Each function gets its own file under `api/src/functions/`
- Use `app.http(name, { methods, authLevel, handler })` pattern
- Always log requests: `context.log(...)`
- Return `{ body: ... }` or `{ body: JSON.stringify({ ... }) }` for JSON
- Use `request.query.get()` and `request.text()` / `request.json()` for input

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Vue files | PascalCase | `UserProfile.vue` |
| JS functions | camelCase | `fetchUserData` |
| Azure function files | camelCase | `hello.js` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| CSS classes | kebab-case | `error-message` |

### Imports / Exports

**Frontend (`src/`):**

```js
import { ref, computed } from 'vue'
import MyComponent from './MyComponent.vue'
```

**API (`api/src/`):**

```js
const { app } = require('@azure/functions');
```

### Error Handling

- Always wrap `fetch` calls in `try/catch`
- Display user-facing errors in templates with `v-if="error"` and `style="color: red"`
- Log errors to console: `console.error('...', err)`
- Azure Functions: use `context.log` for info and `context.error` for errors

### Git Conventions

- Commit message format: imperative mood, short first line
  - Good: `Fix Azure Static Web Apps api_location config`
  - Bad: `fixed stuff` or `Fixed the bug`
- Never commit `node_modules/`, `dist/`, `.env`, or secrets
- Run `npm run build` before pushing to verify the production build succeeds

---

## Azure Static Web Apps Configuration

- **`staticwebapp.config.json`** controls routing and fallback behavior
- **`app_location`** (workflow): `/` — frontend root
- **`api_location`** (workflow): `api` — Azure Functions source (must contain `host.json`)
- **`output_location`** (workflow): `dist` — Vite build output

The `navigationFallback` in `staticwebapp.config.json` routes all non-asset routes to `/index.html` for SPA support.

---

## Common Issues

- **404 on API calls**: Ensure `api_location` is `api` (not `api/src`) in the workflow YAML. Azure needs `host.json` in the root of the API location.
- **Duplicate `message.js`**: There is a redundant `src/functions/message.js` that is NOT used. The active API function is in `api/src/functions/message.js`. Clean up the unused one.
- **Git identity not set**: If commits fail with "Author identity unknown", set: `git config --global user.name "YourName"` and `git config --global user.email "you@example.com"`
