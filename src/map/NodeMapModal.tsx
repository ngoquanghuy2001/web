import React, { useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Popup,
    useMapEvents,
    CircleMarker,
} from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { useTranslation } from "react-i18next";
import type { DashboardNode, NodeLocation } from "../Dashboard";

export type MapMode =
    | { type: "single"; devAddr: number }
    | { type: "all" };

interface NodeMapModalProps {
    isOpen: boolean;
    mode: MapMode | null;
    nodes: DashboardNode[];
    nodeLocations: Record<number, NodeLocation>;
    darkMode: boolean;
    onClose: () => void;
    onUpdateNodeLocation: (devAddr: number, loc: NodeLocation) => void;
}

const DEFAULT_CENTER: LatLngLiteral = {
    lat: 21.0278,
    lng: 105.8342,
};

const ClickToSetLocation: React.FC<{
    enabled: boolean;
    onSelect: (latlng: LatLngLiteral) => void;
}> = ({ enabled, onSelect }) => {
    useMapEvents({
        click(e) {
            if (!enabled) return;
            onSelect(e.latlng);
        },
    });
    return null;
};

const NodeMapModal: React.FC<NodeMapModalProps> = ({
    isOpen,
    mode,
    nodes,
    nodeLocations,
    darkMode,
    onClose,
    onUpdateNodeLocation,
}) => {
    const { t } = useTranslation();

    const markers = useMemo(() => {
        if (!mode) return [];
        if (mode.type === "single") {
            return nodes.filter((n) => n.devAddr === mode.devAddr);
        }
        return nodes;
    }, [mode, nodes]);

    const center: LatLngLiteral = useMemo(() => {
        if (!mode) {
            return DEFAULT_CENTER;
        }

        if (mode.type === "single") {
            const loc = nodeLocations[mode.devAddr];
            return loc ?? DEFAULT_CENTER;
        }

        const locs = markers
            .map((n) => nodeLocations[n.devAddr])
            .filter((l): l is NodeLocation => !!l);

        if (locs.length === 0) return DEFAULT_CENTER;

        const avgLat = locs.reduce((sum, l) => sum + l.lat, 0) / locs.length;
        const avgLng = locs.reduce((sum, l) => sum + l.lng, 0) / locs.length;

        return { lat: avgLat, lng: avgLng };
    }, [mode, nodeLocations, markers]);

    const handleSelectLocation = (latlng: LatLngLiteral) => {
        if (!mode || mode.type !== "single") return;
        onUpdateNodeLocation(mode.devAddr, {
            lat: latlng.lat,
            lng: latlng.lng,
        });
    };

    if (!isOpen || !mode) return null;

    // ==== THEME THEO DARKMODE ====
    const popupBg = darkMode ? "#020617" : "#ffffff";
    const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
    const textColor = darkMode ? "#e5e7eb" : "#0f172a";

    const overlayBg = darkMode
        ? "rgba(15,23,42,0.85)"
        : "rgba(15,23,42,0.55)";

    const panelBg = darkMode
        ? "linear-gradient(145deg,#020617,#020617,#020617)"
        : "linear-gradient(145deg,#ffffff,#f3f4f6,#e5e7eb)";

    const panelBorder = darkMode ? "#1f2937" : "#e5e7eb";
    const subtitleColor = darkMode ? "rgba(148,163,184,0.8)" : "#6b7280";

    const closeBtnBg = darkMode ? "#0f172a" : "#e5e7eb";
    const closeBtnBorder = darkMode ? "#1f2937" : "#d1d5db";

    const primaryBtnBg = darkMode
        ? "linear-gradient(135deg,#22c55e,#16a34a)"
        : "linear-gradient(135deg,#22c55e,#16a34a)";

    const primaryBtnText = "#f9fafb";

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: overlayBg, // ✅ theo darkMode
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 80,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "min(900px, 96vw)",
                    height: "min(560px, 90vh)",
                    background: panelBg, // ✅ theo darkMode
                    borderRadius: 18,
                    border: `1px solid ${panelBorder}`,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    color: textColor,
                    boxShadow: darkMode
                        ? "0 24px 80px rgba(15,23,42,0.9)"
                        : "0 24px 80px rgba(15,23,42,0.3)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                        alignItems: "center",
                    }}
                >
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {mode.type === "single"
                                ? t("map.single.title", { devAddr: mode.devAddr })
                                : t("map.all.title")}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: subtitleColor, // ✅
                            }}
                        >
                            {mode.type === "single"
                                ? t("map.single.subtitle")
                                : t("map.all.subtitle", { count: markers.length })}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: closeBtnBg,
                            border: `1px solid ${closeBtnBorder}`,
                            color: textColor,
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        ✕ {t("map.actions.close")}
                    </button>
                </div>

                {/* Map */}
                <div
                    style={{
                        flex: 1,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: `1px solid ${cardBorder}`,
                        backgroundColor: darkMode ? "#020617" : popupBg,
                    }}
                >
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <TileLayer
                            attribution={
                                darkMode
                                    ? '&copy; <a href="https://carto.com/">CARTO</a> contributors'
                                    : "&copy; OpenStreetMap contributors"
                            }
                            url={
                                darkMode
                                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            }
                        />

                        <ClickToSetLocation
                            enabled={mode.type === "single"}
                            onSelect={handleSelectLocation}
                        />

                        {markers.map((node) => {
                            const loc = nodeLocations[node.devAddr] ?? center;

                            const sensor = node.sensorData;

                            let status: "safe" | "warning" | "offline" | "nodata" = "nodata";

                            if (sensor) {
                                let offline = false;

                                // chỉ tính offline nếu có timestamp
                                if (sensor.timestamp) {
                                    const ts = new Date(sensor.timestamp).getTime();
                                    if (!Number.isNaN(ts)) {
                                        offline = Date.now() - ts > 60000;
                                    }
                                }

                                if (offline) {
                                    status = "offline";
                                } else if (
                                    sensor.fire ||
                                    (sensor.temperature ?? 0) >= 40 ||
                                    (sensor.co2 ?? 0) >= 2000
                                ) {
                                    status = "warning";
                                } else {
                                    status = "safe";
                                }
                            }

                            const colors = {
                                safe: { stroke: "#22c55e", fill: "#16a34a" },
                                warning: { stroke: "#ef4444", fill: "#dc2626" },
                                offline: { stroke: "#f59e0b", fill: "#d97706" },
                                nodata: { stroke: "#6b7280", fill: "#4b5563" },
                            };

                            return (
                                <CircleMarker
                                    key={node.devAddr}
                                    center={loc}
                                    radius={10}
                                    weight={2}
                                    fillOpacity={0.9}
                                    color={colors[status].stroke}
                                    fillColor={colors[status].fill}
                                >
                                    <Popup>
                                        <div style={{ fontSize: 12, color: "#0f172a" }}>
                                            <strong>Node {node.devAddr}</strong>
                                            <br />
                                            Lat: {loc.lat.toFixed(5)}, Lng: {loc.lng.toFixed(5)}
                                            <br />
                                            Status: {status}
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Nếu sau này cần nút Lưu vị trí / Reset thì dùng primaryBtnBg / primaryBtnText */}
                {/* <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              background: primaryBtnBg,
              color: primaryBtnText,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {t("map.actions.save")}
          </button>
        </div> */}
            </div>
        </div>
    );
};

export default NodeMapModal;
