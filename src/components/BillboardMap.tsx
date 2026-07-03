import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Moon, RotateCcw, Sun } from "lucide-react";
import type { Billboard } from "@/data/billboards";
import { useConfirmedWindows, getEffectiveAvailability } from "@/lib/billboard-availability";

const TILE_THEMES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    background: "#14141c",
  },
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    background: "#e5e7eb",
  },
} as const;

function makeIcon(color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='46' viewBox='0 0 34 46'>
    <defs><filter id='s' x='-50%' y='-50%' width='200%' height='200%'><feDropShadow dx='0' dy='2' stdDeviation='1.5' flood-opacity='0.4'/></filter></defs>
    <path filter='url(#s)' d='M17 1C8.7 1 2 7.7 2 16c0 11 15 29 15 29s15-18 15-29C32 7.7 25.3 1 17 1z' fill='${color}' stroke='#0b0b12' stroke-width='1.5'/>
    <circle cx='17' cy='16' r='6' fill='#0b0b12'/>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [34, 46],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

const STATUS_COLORS: Record<Billboard["availability"], string> = {
  Available: "#F4C430",
  "Available Soon": "#60A5FA",
  "Coming Soon": "#9CA3AF",
  "Not Available": "#EF4444",
};
const SELECTED_COLOR = "#22D3EE";

// Fly the map to fit all given billboards: a single billboard gets a close
// zoom, several get a bounds fit, and an empty list is a no-op.
function flyToFit(map: L.Map, billboards: Billboard[]) {
  if (billboards.length === 0) return;
  if (billboards.length === 1) {
    const b = billboards[0];
    map.flyTo([b.lat, b.lng], 10, { duration: 0.6 });
    return;
  }
  const bounds = L.latLngBounds(billboards.map((b) => [b.lat, b.lng] as [number, number]));
  map.flyToBounds(bounds, { padding: [40, 40], duration: 0.6 });
}

function FitBounds({
  billboards,
  selectedId,
}: {
  billboards: Billboard[];
  selectedId: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const b = billboards.find((x) => x.id === selectedId);
      if (b) {
        map.flyTo([b.lat, b.lng], 12, { duration: 0.8 });
        return;
      }
      // Selected billboard was filtered out — fall through and fit the
      // remaining results instead of leaving the map stuck on the old view.
    }
    flyToFit(map, billboards);
  }, [map, billboards, selectedId]);
  return null;
}

function ResetViewControl({
  billboards,
  onReset,
}: {
  billboards: Billboard[];
  onReset: () => void;
}) {
  const map = useMap();

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation();
    onReset();
    flyToFit(map, billboards);
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      onDoubleClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-elegant backdrop-blur transition-colors hover:text-gold"
    >
      <RotateCcw className="h-3.5 w-3.5" /> Reset view
    </button>
  );
}

function MapThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-elegant backdrop-blur transition-colors hover:text-gold"
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {dark ? "Light map" : "Dark map"}
    </button>
  );
}

export function BillboardMap({
  billboards,
  selectedId,
  onSelect,
}: {
  billboards: Billboard[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { data: windows } = useConfirmedWindows();
  const [dark, setDark] = useState(false);
  const theme = TILE_THEMES[dark ? "dark" : "light"];

  return (
    <MapContainer
      center={[9.082, 8.6753]}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: theme.background }}
    >
      <TileLayer key={dark ? "dark" : "light"} attribution={theme.attribution} url={theme.url} />
      {billboards.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat, b.lng]}
          icon={makeIcon(
            selectedId === b.id
              ? SELECTED_COLOR
              : STATUS_COLORS[getEffectiveAvailability(b, windows ?? [])],
          )}
          alt={`${b.area}, ${b.city}`}
          title={`${b.area}, ${b.city}`}
          eventHandlers={{ click: () => onSelect(b.id) }}
        />
      ))}
      <FitBounds billboards={billboards} selectedId={selectedId} />
      <div className="absolute bottom-3 left-3 z-[500] flex items-center gap-2">
        <ResetViewControl billboards={billboards} onReset={() => onSelect(null)} />
        <MapThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
      </div>
    </MapContainer>
  );
}

export default BillboardMap;
