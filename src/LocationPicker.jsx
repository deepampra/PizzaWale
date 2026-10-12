
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 17);
  }, [map, latitude, longitude]);

  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}) {
  const [mapType, setMapType] = useState("street");

  if (latitude == null || longitude == null) {
    return <p>Use My Location first to show the delivery map.</p>;
  }

  const buttonStyle = (type) => ({
    padding: "8px 14px",
    border: "1px solid #ff5733",
    borderRadius: "8px",
    cursor: "pointer",
    background: mapType === type ? "#ff5733" : "#fff",
    color: mapType === type ? "#fff" : "#222",
    fontWeight: 600,
  });

  return (
    <div style={{ marginTop: "16px" }}>
      <p>📍 Tap the map to select your delivery location.</p>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          style={buttonStyle("street")}
          onClick={() => setMapType("street")}
        >
          🗺️ Street
        </button>

        <button
          type="button"
          style={buttonStyle("satellite")}
          onClick={() => setMapType("satellite")}
        >
          🛰️ Satellite
        </button>

        <button
          type="button"
          style={buttonStyle("hybrid")}
          onClick={() => setMapType("hybrid")}
        >
          🌍 Hybrid
        </button>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        scrollWheelZoom={true}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "12px",
          zIndex: 1,
        }}
      >
        {mapType === "street" && (
          <TileLayer
            key="street"
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {(mapType === "satellite" || mapType === "hybrid") && (
          <TileLayer
            key="satellite"
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {mapType === "hybrid" && (
          <TileLayer
            key="hybrid-labels"
            attribution="Labels &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <MapUpdater latitude={latitude} longitude={longitude} />

        <MapClickHandler onLocationSelect={onLocationSelect} />

        <Marker position={[latitude, longitude]} />
      </MapContainer>
    </div>
  );
}
