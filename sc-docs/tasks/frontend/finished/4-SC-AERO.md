# 4-SC-AERO: Frontend scaffold (Vite + React + TS)

**Phase**: 0 — Scaffolding
**Depends on**: 1-SC-AERO
**Ref**: implementation-plan.md § 0.5

## Description

Bootstrap the frontend application using Vite with the React + TypeScript template. Install all required dependencies (MUI component library, routing, HTTP client, mapping libraries), configure the Vite dev server to proxy API requests to the Spring Boot backend, and clean up the default boilerplate so the project starts from a clean slate.

## Acceptance Criteria

- [ ] `cd frontend && npm run dev` starts the dev server on port 5173
- [ ] `fetch('/api/auth/me')` proxies to `http://localhost:8080` and returns 401 (expected when not authenticated)
- [ ] Default Vite boilerplate is removed (no counter code, no default CSS content)
- [ ] `index.html` title is set to "AERO"
- [ ] All dependencies install without errors (`npm install` exits cleanly)

## Files to Create/Modify

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/index.html`
