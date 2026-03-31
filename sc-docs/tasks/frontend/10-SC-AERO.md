# 10-SC-AERO: AuthContext + ProtectedRoute

**Phase**: 1 — Auth
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 1.3

## Description

Implement React context-based authentication state management and route protection. The AuthContext provides the current user, loading state, and auth actions to the entire component tree. On mount, it attempts to restore the session by calling `getMe()`. The ProtectedRoute component gates access to authenticated-only areas and optionally enforces role-based restrictions.

## Acceptance Criteria

- [ ] AuthContext provides `user`, `loading`, `login(email, password)`, `logout()`, `isAuthenticated`, and `hasRole(role)`
- [ ] On mount, AuthContext calls `getMe()` — sets user on success, sets `null` on 401
- [ ] ProtectedRoute shows a spinner while `loading` is true
- [ ] ProtectedRoute redirects unauthenticated users to `/login`
- [ ] ProtectedRoute accepts an optional `requiredRoles` prop and redirects or shows 403 when the role does not match
- [ ] ProtectedRoute renders `<Outlet />` for authenticated users who pass role checks

## Files to Create/Modify

- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
