# 66-SC-AERO: Error display -- toast/snackbar

**Phase**: 5 — Polish
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 5.2

## Description

Create a global error handling mechanism using snackbar notifications and field-level validation display. An Axios response interceptor catches 4xx/5xx errors and surfaces them through a notification context. Success confirmations (e.g., after saving) use green snackbars. Validation errors from the backend (400 with field errors) are displayed inline below the corresponding form inputs.

## Acceptance Criteria

- [ ] Axios response interceptor is added to axiosInstance for 4xx/5xx responses
- [ ] Error messages are extracted from the response body
- [ ] A `useNotification()` hook or context is created with `showError(message)` and `showSuccess(message)` functions
- [ ] API errors display as a red snackbar that auto-dismisses after 5 seconds
- [ ] Success messages (e.g., "Zapisano" after save) display as a green snackbar
- [ ] Validation errors (400 responses with field errors) display as field-level messages below form inputs
- [ ] Snackbar component is integrated into the application layout

## Files to Create/Modify

- `frontend/src/components/Snackbar.tsx` or notification context file
- `frontend/src/api/axiosInstance.ts` (modify to add interceptor)
