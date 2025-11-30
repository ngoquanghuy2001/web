import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { NodeLocation } from "../Dashboard";

interface AddNodeModalProps {
  isOpen: boolean;
  darkMode: boolean;
  onClose: () => void;
  onSubmitDevAddr: (devAddr: number, location: NodeLocation | null) => void;
}

const DEFAULT_CENTER: LatLngLiteral = {
  lat: 21.0278,
  lng: 105.8342,
};

const ClickToPickLocation: React.FC<{
  onSelect: (latlng: LatLngLiteral) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const FlyToLocation: React.FC<{ location: NodeLocation | null }> = ({
  location,
}) => {
  const map = useMap();
  if (location) {
    map.flyTo(location, 15, { duration: 0.6 });
  }
  return null;
};

const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  darkMode,
  onClose,
  onSubmitDevAddr,
}) => {
  const { t } = useTranslation();

  const [devAddrText, setDevAddrText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<NodeLocation | null>(null);

  if (!isOpen) return null;

  const popupBg = darkMode ? "#020617" : "#ffffff";
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const textColor = darkMode ? "#e5e7eb" : "#0f172a";
  const subtitleColor = darkMode ? "rgba(148,163,184,0.75)" : "#6b7280";

  const handleSubmit = () => {
    setError(null);

    const value = Number(devAddrText.trim());
    if (!Number.isInteger(value) || value <= 0) {
      setError(t("dashboard.addNode.invalidDevAddr"));
      return;
    }

    onSubmitDevAddr(value, location);
    setDevAddrText("");
    setLocation(null);
  };

  const handleClose = () => {
    setError(null);
    setDevAddrText("");
    setLocation(null);
    onClose();
  };

  const locationText = location
    ? t("dashboard.addNode.map.picked", {
      lat: location.lat.toFixed(5),
      lng: location.lng.toFixed(5),
    })
    : t("dashboard.addNode.map.noLocation");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "min(640px, 95vw)",
          maxHeight: "95vh",
          backgroundColor: popupBg,
          borderRadius: 18,
          border: `1px solid ${cardBorder}`,
          boxShadow: "0 24px 50px rgba(15,23,42,0.9)",
          padding: 18,
          color: textColor,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {t("dashboard.addNode.title")}
            </div>
            <div
              style={{
                fontSize: 13,
                color: subtitleColor,
              }}
            >
              {t("dashboard.addNode.description")}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"
                }`,
              background: "transparent",
              color: textColor,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* DevAddr input */}
        <div style={{ marginTop: 4 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            {t("dashboard.addNode.label")}
          </label>
          <input
            type="number"
            value={devAddrText}
            onChange={(e) => setDevAddrText(e.target.value)}
            placeholder={t("dashboard.addNode.placeholder") ?? ""}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"
                }`,
              backgroundColor: darkMode ? "#020617" : "#ffffff",
              color: textColor,
              fontSize: 13,
              outline: "none",
            }}
          />
          {error && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#f97316",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Map chọn vị trí */}
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            {t("dashboard.addNode.map.title")}
          </div>
          <div
            style={{
              fontSize: 12,
              color: subtitleColor,
              marginBottom: 6,
            }}
          >
            {t("dashboard.addNode.map.hint")}
          </div>

          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${cardBorder}`,
              height: 260,
            }}
          >
            <MapContainer
              center={location ?? DEFAULT_CENTER}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ClickToPickLocation
                onSelect={(latlng) =>
                  setLocation({
                    lat: latlng.lat,
                    lng: latlng.lng,
                  })
                }
              />

              {/* Auto flyTo khi chọn vị trí */}
              <FlyToLocation location={location} />

              {/* Marker đẹp dạng circle */}
              {location && (
                <CircleMarker
                  center={location}
                  radius={10}
                  weight={2}
                  fillOpacity={0.9}
                  color="#22c55e"
                  fillColor="#16a34a"
                />
              )}
            </MapContainer>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: subtitleColor,
            }}
          >
            {locationText}
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"
                }`,
              background: "transparent",
              color: textColor,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {t("dashboard.addNode.cancel")}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "#f9fafb",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("dashboard.addNode.submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
