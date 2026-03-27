import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

type LatLng = [number, number];

type LocationLike = {
  name?: string;
  address?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const getCoord = (loc?: LocationLike | null): LatLng | null => {
  if (!loc) return null;
  const lat = Number(loc.latitude ?? loc.lat);
  const lng = Number(loc.longitude ?? loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    if (points.length > 1) {
      map.fitBounds(points, { padding: [24, 24] });
    }
  }, [map, points]);

  return null;
}

export const RouteMap = ({
  from,
  to,
  height = 300,
}: {
  from?: LocationLike | null;
  to?: LocationLike | null;
  height?: number;
}) => {
  const fromCoord = getCoord(from);
  const toCoord = getCoord(to);

  const points = useMemo(() => {
    const p: LatLng[] = [];
    if (fromCoord) p.push(fromCoord);
    if (toCoord) p.push(toCoord);
    return p;
  }, [fromCoord, toCoord]);

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
        Route map unavailable: source/destination coordinates are missing.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={points[0]}
        zoom={10}
        style={{ width: "100%", height }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        {fromCoord && (
          <Marker position={fromCoord} icon={markerIcon}>
            <Popup>
              <strong>From:</strong> {from?.name ?? "Origin"}
              <br />
              {from?.address ?? ""}
            </Popup>
          </Marker>
        )}

        {toCoord && (
          <Marker position={toCoord} icon={markerIcon}>
            <Popup>
              <strong>To:</strong> {to?.name ?? "Destination"}
              <br />
              {to?.address ?? ""}
            </Popup>
          </Marker>
        )}

        {fromCoord && toCoord && (
          <Polyline
            positions={[fromCoord, toCoord]}
            pathOptions={{ color: "#22d3ee", weight: 4 }}
          />
        )}
      </MapContainer>
    </div>
  );
};
