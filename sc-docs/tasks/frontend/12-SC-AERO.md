# 12-SC-AERO: Layout shell — sidebar, topbar, routing

**Phase**: 1 — Auth
**Depends on**: 10-SC-AERO
**Ref**: implementation-plan.md § 1.4

## Description

Create the main application layout with an MUI permanent Drawer sidebar and AppBar topbar. The sidebar displays navigation links organized into role-based sections with Polish labels, following PRD section 7.2 visibility rules. The topbar shows the logged-in user's name, role, and a logout button. Update App.tsx with the full route configuration wrapping authenticated pages in the Layout component.

## Acceptance Criteria

- [ ] Sidebar is a permanent MUI Drawer approximately 240px wide
- [ ] "Administracja" section (Helikoptery, Cz&#322;onkowie za&#322;ogi, L&#261;dowiska planowe, U&#380;ytkownicy) is visible to ADMIN (full), SUPERVISOR/PILOT (read-only), and hidden from PLANNER
- [ ] "Planowanie operacji" section (Lista operacji) is visible to all roles
- [ ] "Zlecenia na lot" section (Lista zlece&#324;) is visible to PILOT (full), SUPERVISOR (edit), ADMIN (read-only), and hidden from PLANNER
- [ ] Topbar displays "Imi&#281; Nazwisko (Rola)" of the logged-in user
- [ ] Topbar has a "Wyloguj" button that calls logout and redirects to `/login`
- [ ] `/login` route renders LoginPage without the Layout wrapper
- [ ] `/*` routes are wrapped in ProtectedRoute and Layout; child routes render placeholder divs
- [ ] Main content area renders `<Outlet />`

## Files to Create/Modify

- `frontend/src/components/Layout.tsx`
- `frontend/src/App.tsx`
