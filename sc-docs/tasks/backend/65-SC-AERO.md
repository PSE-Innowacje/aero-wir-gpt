# 65-SC-AERO: GlobalExceptionHandler

**Phase**: 5 — Polish
**Depends on**: 2-SC-AERO
**Ref**: implementation-plan.md § 5.1

## Description
Create a centralized exception handler using `@ControllerAdvice` to produce consistent, structured JSON error responses across all endpoints. Handle validation errors with field-level detail, custom not-found exceptions, access denial, illegal state/argument errors from status transitions and business rules, and a generic fallback that returns a safe message without leaking stack traces. Define the `ErrorResponse` DTO and a custom `EntityNotFoundException`.

## Acceptance Criteria
- [ ] `GlobalExceptionHandler` annotated with `@ControllerAdvice`
- [ ] `MethodArgumentNotValidException` returns 400 with field-level errors: `{field, message}[]`
- [ ] `EntityNotFoundException` (custom) returns 404 with descriptive message
- [ ] `AccessDeniedException` returns 403 with message
- [ ] `IllegalStateException` (status transitions) returns 400 with message
- [ ] `IllegalArgumentException` returns 400 with message
- [ ] Generic `Exception` returns 500 with safe message (no stack trace leaked)
- [ ] `ErrorResponse` DTO has fields: status (int), message (String), fieldErrors (nullable List)
- [ ] `EntityNotFoundException` is a custom RuntimeException with a message constructor
- [ ] All error responses use consistent JSON structure

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/exception/GlobalExceptionHandler.java
- backend/src/main/java/com/nullterrier/aero/exception/EntityNotFoundException.java
- backend/src/main/java/com/nullterrier/aero/dto/ErrorResponse.java
