# 11-SC-AERO: LoginPage

**Phase**: 1 — Auth
**Depends on**: 10-SC-AERO
**Ref**: implementation-plan.md § 1.3

## Description

Build the login page with a centered MUI Card containing email and password fields. The form calls `authContext.login()` on submit and redirects to the appropriate landing page based on role. Error messages display inline below the form. Already-authenticated users are redirected away from the login page.

## Acceptance Criteria

- [ ] Login form is rendered as a centered MUI Card with email and password TextFields
- [ ] Submit button label is "Zaloguj si&#281;" (Polish)
- [ ] On successful login, ADMIN users are redirected to `/helicopters`; other roles are redirected to `/operations`
- [ ] On failed login, an error message is displayed below the form
- [ ] Already-authenticated users are automatically redirected away from the login page
- [ ] UI labels are in Polish

## Files to Create/Modify

- `frontend/src/pages/auth/LoginPage.tsx`
