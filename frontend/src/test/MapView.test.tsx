import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';

/* ------------------------------------------------------------------ */
/*  Mock react-leaflet (Leaflet does not work in jsdom)               */
/* ------------------------------------------------------------------ */

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Polyline: ({ positions, ...props }: any) => (
    <div
      data-testid="polyline"
      data-positions={JSON.stringify(positions)}
      {...props}
    />
  ),
  Marker: ({ position, children }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
}));

vi.mock('leaflet', () => {
  const actual = {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    icon: vi.fn(),
    Icon: class FakeIcon {
      constructor() {}
      static Default = {
        prototype: {} as any,
        mergeOptions: vi.fn(),
      };
    },
    latLngBounds: vi.fn(() => ({
      isValid: () => true,
    })),
  };
  return { default: actual, ...actual };
});

/* ------------------------------------------------------------------ */
/*  Import after mocks are in place                                    */
/* ------------------------------------------------------------------ */

import MapView from '../components/MapView';

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function renderMap(overrides: Partial<React.ComponentProps<typeof MapView>> = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <MapView {...overrides} />
    </ThemeProvider>,
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('MapView', () => {
  /* ── Basic rendering ────────────────────────────────────────────── */

  it('renders the map container', () => {
    renderMap();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders the tile layer', () => {
    renderMap();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  /* ── Polylines ──────────────────────────────────────────────────── */

  it('renders polylines for given data', () => {
    const polylines = [
      [
        [52.0, 19.5],
        [52.1, 19.6],
      ],
      [
        [50.0, 20.0],
        [50.1, 20.1],
      ],
    ];

    renderMap({ polylines });

    const polylineElements = screen.getAllByTestId('polyline');
    expect(polylineElements).toHaveLength(2);
  });

  /* ── Markers ────────────────────────────────────────────────────── */

  it('renders markers for given data', () => {
    const markers = [
      { position: [52.23, 20.91] as [number, number], label: 'Warszawa Babice' },
      { position: [50.08, 19.78] as [number, number], label: 'Krakow Balice' },
    ];

    renderMap({ markers });

    const markerElements = screen.getAllByTestId('marker');
    expect(markerElements).toHaveLength(2);
  });

  /* ── Popup text ─────────────────────────────────────────────────── */

  it('renders popup text for markers with labels', () => {
    const markers = [
      { position: [52.23, 20.91] as [number, number], label: 'Odlot: Babice' },
    ];

    renderMap({ markers });

    const popup = screen.getByTestId('popup');
    expect(popup).toHaveTextContent('Odlot: Babice');
  });

  /* ── Empty state ────────────────────────────────────────────────── */

  it('renders without polylines or markers (empty state)', () => {
    renderMap();

    expect(screen.queryAllByTestId('polyline')).toHaveLength(0);
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
  });

  /* ── Default height ─────────────────────────────────────────────── */

  it('uses 400px height by default', () => {
    renderMap();

    // The wrapper div has role="application" and aria-label="Mapa".
    const wrapper = screen.getByRole('application', { name: 'Mapa' });
    expect(wrapper.style.height).toBe('400px');
  });

  /* ── Custom height (number) ─────────────────────────────────────── */

  it('applies a custom numeric height', () => {
    renderMap({ height: 600 });

    const wrapper = screen.getByRole('application', { name: 'Mapa' });
    expect(wrapper.style.height).toBe('600px');
  });

  /* ── Custom height (string) ─────────────────────────────────────── */

  it('applies a custom string height', () => {
    renderMap({ height: '50vh' });

    const wrapper = screen.getByRole('application', { name: 'Mapa' });
    expect(wrapper.style.height).toBe('50vh');
  });

  /* ── Custom className ───────────────────────────────────────────── */

  it('applies a custom className to the outer wrapper', () => {
    renderMap({ className: 'my-custom-map' });

    const wrapper = screen.getByRole('application', { name: 'Mapa' });
    expect(wrapper.className).toContain('my-custom-map');
  });

  /* ── Marker without label has no popup ──────────────────────────── */

  it('does not render a popup for markers without a label', () => {
    const markers = [
      { position: [52.23, 20.91] as [number, number] },
    ];

    renderMap({ markers });

    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
  });
});
