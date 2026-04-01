# 13-SC-AERO: DataTable shared component

**Phase**: 2 — Admin CRUD
**Depends on**: 12-SC-AERO
**Ref**: implementation-plan.md § 2.1

## Description

Create a reusable data table component that wraps MUI DataGrid. This shared component standardizes how list pages display tabular data across the application. It supports configurable columns, default sorting, row click navigation, and a loading state.

## Acceptance Criteria

- [ ] Component accepts `columns: GridColDef[]`, `rows: any[]`, `loading: boolean`, `defaultSort?: { field, sort }`, and `onRowClick?: (id) => void` props
- [ ] Table is rendered inside a fixed-height container
- [ ] Pagination is enabled with 25 rows per page
- [ ] Column sorting is enabled
- [ ] Clicking a row fires the `onRowClick` callback with the row ID
- [ ] Loading state displays a skeleton or loading indicator

## Files to Create/Modify

- `frontend/src/components/DataTable.tsx`
