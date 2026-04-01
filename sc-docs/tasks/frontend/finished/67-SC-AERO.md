# 67-SC-AERO: Loading spinners + empty states

**Phase**: 5 — Polish
**Depends on**: 13-SC-AERO
**Ref**: implementation-plan.md § 5.2

## Description

Add consistent loading indicators and empty state messages across all list and form pages. Data tables show a loading skeleton or spinner while data is being fetched. Form pages in edit mode show a spinner while loading entity data. List pages display a Polish-language empty state message when the result set is empty after loading completes.

## Acceptance Criteria

- [ ] All DataTable usages pass the `loading` prop correctly to show a loading indicator while fetching
- [ ] Form pages in edit mode show a `CircularProgress` spinner while loading entity data
- [ ] List pages display "Brak danych" (No data) message when the list is empty after loading completes
- [ ] Loading indicators use MUI `CircularProgress`
- [ ] Empty state messages use MUI `Typography`
- [ ] No page shows stale data or an empty table during the loading phase

## Files to Create/Modify

- Modify all list pages and form pages as needed
