# 6-SC-AERO: SecurityConfig — session auth, CORS, CSRF

**Phase**: 1 — Auth
**Depends on**: 5-SC-AERO
**Ref**: implementation-plan.md § 1.1

## Description
Configure Spring Security for session-based authentication suitable for a React SPA frontend. Disable CSRF (the SPA sends JSON, not form submissions). Set up CORS to allow the Vite dev server origin with credentials. Secure all API endpoints except the auth endpoints. Return 401 JSON responses instead of redirects for unauthenticated requests. Implement a custom `UserDetailsService` that loads users from the database.

## Acceptance Criteria
- [ ] `SecurityConfig` class exists with `@Configuration` and `@EnableWebSecurity`
- [ ] Session-based authentication uses JSESSIONID cookie
- [ ] CSRF is disabled
- [ ] CORS allows origin `localhost:5173`, credentials, and methods GET/POST/PUT/DELETE
- [ ] `/api/auth/**` endpoints are permitted without authentication
- [ ] All other endpoints require authentication
- [ ] Unauthenticated requests receive 401 JSON response (not a redirect)
- [ ] Custom `AuthenticationEntryPoint` returns JSON error body
- [ ] Custom `UserDetailsService` loads user by email from `UserRepository`
- [ ] Unauthenticated GET to `/api/anything` returns 401 JSON
- [ ] Unauthenticated GET to `/api/auth/me` returns 401 JSON

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/config/SecurityConfig.java
- backend/src/main/java/pl/pse/aero/security/CustomUserDetailsService.java
- backend/src/main/java/pl/pse/aero/security/CustomAuthenticationEntryPoint.java
