# 46-SC-AERO: MapView shared component (react-leaflet)

**Phase**: 3 — Operations
**Depends on**: 4-SC-AERO
**Ref**: implementation-plan.md § 3.5

## Description

Create a reusable map component that wraps react-leaflet's MapContainer with OpenStreetMap tiles. The component accepts polylines (flight routes from KML data) and markers (landing sites) as props, rendering them with distinct visual styling. It auto-fits bounds to ensure all displayed features are visible. The component also fixes the well-known Leaflet marker icon issue that occurs in bundled applications where default icon image paths break.

## Acceptance Criteria

- [ ] Component wraps `MapContainer` from react-leaflet with an OpenStreetMap tile layer
- [ ] Props include `polylines?: number[][][]` (array of routes, each route an array of [lat, lng] pairs)
- [ ] Props include `markers?: { position: [number, number], label: string }[]`
- [ ] Each polyline renders as a `<Polyline>` with a distinct color
- [ ] Each marker renders as a `<Marker>` with a popup displaying the label
- [ ] Map auto-fits bounds to show all polylines and markers using `map.fitBounds()`
- [ ] Container has a fixed height of 400px by default, configurable via a `height` prop
- [ ] Leaflet CSS is imported (in the component or globally)
- [ ] Default Leaflet marker icon paths are fixed to prevent broken icons in the bundled app
- [ ] Map renders correctly with OSM tiles when given no data (empty state)

## Files to Create/Modify

- `frontend/src/components/MapView.tsx`
