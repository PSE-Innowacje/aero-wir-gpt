import { useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { aeroColors } from '../theme';

// ---------------------------------------------------------------------------
// Fix Leaflet default marker icons in bundled apps.
// Webpack/Vite rewrites asset paths, so the built-in icon URL resolution
// breaks. We patch the prototype once at module level.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ---------------------------------------------------------------------------
// Colored marker icons
// ---------------------------------------------------------------------------
const MARKER_ICON_COLORS = {
  blue: markerIcon,
  red: markerIcon,   // Leaflet ships a single icon image; we tint via CSS filter
  green: markerIcon,
} as const;

function createColoredIcon(color: 'blue' | 'red' | 'green'): L.Icon {
  // The default Leaflet icon is blue. For red and green we apply a CSS
  // hue-rotate filter on the <img> element via the icon's className.
  const classMap: Record<string, string> = {
    blue: '',
    red: 'leaflet-marker-icon--red',
    green: 'leaflet-marker-icon--green',
  };

  return new L.Icon({
    iconUrl: MARKER_ICON_COLORS[color],
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: classMap[color] ?? '',
  });
}

// ---------------------------------------------------------------------------
// Polyline palette (cycles when there are more polylines than colors)
// ---------------------------------------------------------------------------
const POLYLINE_COLORS = [
  aeroColors.tertiary,   // #00daf3
  aeroColors.primary,    // #abc9ef
  aeroColors.secondary,  // #ffb693
] as const;

// ---------------------------------------------------------------------------
// Default map center and zoom (Poland)
// ---------------------------------------------------------------------------
const POLAND_CENTER: L.LatLngExpression = [52.0, 19.5];
const POLAND_ZOOM = 6;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface MapViewProps {
  /** Array of polylines -- each polyline is an array of [lat, lng] pairs. */
  polylines?: number[][][];
  /** Markers to display on the map. */
  markers?: Array<{
    position: [number, number];
    label?: string;
    color?: 'blue' | 'red' | 'green';
  }>;
  /** Height of the map container. Accepts a CSS value or a number (px). Default: 400. */
  height?: string | number;
  /** Additional CSS class name for the outer wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Internal child component that reacts to prop changes and fits the map
// bounds accordingly.  Must be rendered inside <MapContainer>.
// ---------------------------------------------------------------------------
interface BoundsFitterProps {
  polylines: number[][][];
  markers: MapViewProps['markers'];
}

function BoundsFitter({ polylines, markers }: BoundsFitterProps) {
  const map = useMap();

  const bounds = useMemo(() => {
    const allPoints: L.LatLngExpression[] = [];

    for (const line of polylines) {
      for (const point of line) {
        if (point.length >= 2) {
          allPoints.push([point[0], point[1]] as L.LatLngExpression);
        }
      }
    }

    if (markers) {
      for (const m of markers) {
        allPoints.push(m.position as L.LatLngExpression);
      }
    }

    if (allPoints.length === 0) return null;
    return L.latLngBounds(allPoints as L.LatLngExpression[]);
  }, [polylines, markers]);

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView(POLAND_CENTER, POLAND_ZOOM);
    }
  }, [map, bounds]);

  return null;
}

// ---------------------------------------------------------------------------
// MapView component
// ---------------------------------------------------------------------------
export default function MapView({
  polylines = [],
  markers = [],
  height = 400,
  className,
}: MapViewProps) {
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <>
      {/* Inline styles for colored marker icon CSS filters. Kept here so the
          component is fully self-contained and does not require a separate
          stylesheet beyond leaflet.css. */}
      <style>{`
        .leaflet-marker-icon--red {
          filter: hue-rotate(140deg) saturate(2.5) brightness(0.85);
        }
        .leaflet-marker-icon--green {
          filter: hue-rotate(260deg) saturate(1.8) brightness(1.05);
        }
      `}</style>

      <div
        className={className}
        style={{
          height: resolvedHeight,
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
          border: `1px solid ${aeroColors.outlineVariant}`,
        }}
        role="application"
        aria-label="Mapa"
      >
        <MapContainer
          center={POLAND_CENTER}
          zoom={POLAND_ZOOM}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <BoundsFitter polylines={polylines} markers={markers} />

          {polylines.map((line, idx) => (
            <Polyline
              key={`polyline-${idx}`}
              positions={line.map(
                (pt) => [pt[0], pt[1]] as L.LatLngExpression,
              )}
              pathOptions={{
                color: POLYLINE_COLORS[idx % POLYLINE_COLORS.length],
                weight: 3,
                opacity: 0.85,
              }}
            />
          ))}

          {markers.map((m, idx) => (
            <Marker
              key={`marker-${idx}`}
              position={m.position}
              icon={createColoredIcon(m.color ?? 'blue')}
            >
              {m.label && <Popup>{m.label}</Popup>}
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}
