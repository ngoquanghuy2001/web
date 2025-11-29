import React from "react";
import { SensorData } from "../api/appsyncClient";

export interface NodeCardProps {
    devAddr: number;
    sensorData: SensorData | null;
    sensorLoaded: boolean;
    onRemove?: (devAddr: number) => void;
    onMoreDetails?: (devAddr: number) => void;

    // NEW: nhận theme từ Dashboard
    darkMode?: boolean;
}

const formatValue = (value?: number | null, unit?: string) =>
    value === null || value === undefined ? "--" : `${value}${unit ?? ""}`;

const NodeCard: React.FC<NodeCardProps> = ({
    devAddr,
    sensorData,
    sensorLoaded,
    onRemove,
    onMoreDetails,
    darkMode = true,
}) => {
    const temperature = sensorData?.temperature;
    const humidity = sensorData?.humidity;
    const co2 = sensorData?.co2;
    const timestamp = sensorData?.timestamp ?? null;

    // Tính trạng thái offline dựa trên timestamp
    const lastTimestampMs = timestamp ? new Date(timestamp).getTime() : NaN;
    const isOffline =
        !!timestamp &&
        !Number.isNaN(lastTimestampMs) &&
        Date.now() - lastTimestampMs > 60_000;

    const isWarning =
        (sensorData?.fire ?? false) ||
        (temperature !== undefined &&
            temperature !== null &&
            temperature >= 40) ||
        (co2 !== undefined && co2 !== null && co2 >= 2000);

    let statusText = "Safe";

    if (!timestamp) {
        statusText = "No data";
    } else if (isOffline) {
        statusText = "Offline";
    } else if (isWarning) {
        statusText = "WARNING";
    }

    const handleRemoveClick = () => {
        onRemove?.(devAddr);
    };

    const baseBadgeStyle: React.CSSProperties = {
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.7,
    };

    // =========================
    // Badge màu theo trạng thái + theme
    // =========================
    let badgeStyle: React.CSSProperties;

    if (!timestamp) {
        // No data
        badgeStyle = darkMode
            ? {
                backgroundColor: "rgba(148,163,184,0.18)",
                color: "#e5e7eb",
                border: "1px solid rgba(148,163,184,0.7)",
            }
            : {
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "1px solid #9ca3af",
            };
    } else if (isOffline) {
        // Offline
        badgeStyle = darkMode
            ? {
                backgroundColor: "rgba(148,163,184,0.18)",
                color: "#e5e7eb",
                border: "1px solid rgba(148,163,184,0.9)",
            }
            : {
                backgroundColor: "#e5e7eb",
                color: "#4b5563",
                border: "1px solid #9ca3af",
            };
    } else if (isWarning) {
        // Warning
        badgeStyle = darkMode
            ? {
                backgroundColor: "rgba(248,113,113,0.18)",
                color: "#fecaca",
                border: "1px solid rgba(248,113,113,0.85)",
            }
            : {
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
            };
    } else {
        // Safe
        badgeStyle = darkMode
            ? {
                backgroundColor: "rgba(34,197,94,0.16)",
                color: "#bbf7d0",
                border: "1px solid rgba(34,197,94,0.6)",
            }
            : {
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1px solid #4ade80",
            };
    }

    // =========================
    // Card style theo theme
    // =========================
    const cardBaseStyle: React.CSSProperties = {
        position: "relative",
        borderRadius: 16,
        padding: 16,
        backgroundColor: darkMode ? "#020617" : "#ffffff",
        border: darkMode ? "1px solid #1f2937" : "1px solid #e5e7eb",
        boxShadow: darkMode
            ? "0 10px 25px rgba(15,23,42,0.5)"
            : "0 10px 20px rgba(15,23,42,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
        minHeight: 190,
        color: darkMode ? "#e5e7eb" : "#0f172a",
    };

    const warningBorderStyle: React.CSSProperties = isWarning
        ? darkMode
            ? {
                border: "1px solid rgba(248,113,113,0.9)",
                boxShadow:
                    "0 0 0 1px rgba(248,113,113,0.4), 0 0 25px rgba(248,113,113,0.35)",
            }
            : {
                border: "1px solid #fca5a5",
                boxShadow:
                    "0 0 0 1px rgba(248,113,113,0.2), 0 0 18px rgba(248,113,113,0.25)",
            }
        : {};

    const overlayBg = darkMode
        ? "radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 55%)"
        : "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 55%)";

    return (
        <div
            style={{
                ...cardBaseStyle,
                ...warningBorderStyle,
            }}
        >
            {/* Hiệu ứng nền mờ phía sau */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: overlayBg,
                    opacity: 0.7,
                    pointerEvents: "none",
                }}
            />

            {/* Nếu đang cảnh báo, hiển thị icon ⚠ nổi ở góc */}
            {isWarning && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontSize: 20,
                        color: darkMode ? "#fecaca" : "#b91c1c",
                        opacity: 0.9,
                    }}
                >
                    ⚠
                </div>
            )}

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    gap: 8,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 13,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            opacity: 0.7,
                        }}
                    >
                        Node
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        DevAddr {devAddr}
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {/* Badge trạng thái */}
                    <span
                        style={{
                            ...baseBadgeStyle,
                            ...badgeStyle,
                        }}
                    >
                        {statusText}
                    </span>

                    {/* nút xoá node */}
                    {onRemove && (
                        <button
                            type="button"
                            onClick={handleRemoveClick}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 999,
                                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                                background: "transparent",
                                color: darkMode ? "#9ca3af" : "#6b7280",
                                cursor: "pointer",
                                fontWeight: 700,
                                lineHeight: "22px",
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            title="Remove node"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Thời gian cập nhật */}
            <div
                style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginBottom: 10,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {timestamp
                    ? `Last update: ${timestamp}`
                    : "Chưa có dữ liệu cập nhật."}
            </div>

            {/* Nếu chưa loaded lần nào */}
            {!sensorLoaded && (
                <p
                    style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginTop: 6,
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    Chưa nhận được dữ liệu nào cho DevAddr {devAddr}.
                </p>
            )}

            {sensorLoaded && sensorData && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 8,
                            fontSize: 13,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <div>
                            <div style={{ opacity: 0.6, fontSize: 11 }}>Temperature</div>
                            <div style={{ fontWeight: 500 }}>
                                {formatValue(temperature, "°C")}
                            </div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.6, fontSize: 11 }}>Humidity</div>
                            <div style={{ fontWeight: 500 }}>
                                {formatValue(humidity, "%")}
                            </div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.6, fontSize: 11 }}>CO₂</div>
                            <div style={{ fontWeight: 500 }}>
                                {formatValue(co2, " ppm")}
                            </div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.6, fontSize: 11 }}>Fire status</div>
                            <div style={{ fontWeight: 500 }}>
                                {sensorData.fire ? "Cảnh báo cháy" : "Không có cảnh báo"}
                            </div>
                        </div>
                    </div>

                    {/* Link xem chi tiết */}
                    {onMoreDetails && (
                        <button
                            type="button"
                            onClick={() => onMoreDetails(devAddr)}
                            style={{
                                marginTop: 10,
                                alignSelf: "flex-start",
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: `1px solid ${darkMode ? "#374151" : "#d1d5db"}`,
                                background: darkMode
                                    ? "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.7))"
                                    : "linear-gradient(135deg, #ffffff, #e5e7eb)",
                                color: darkMode ? "#e5e7eb" : "#111827",
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                                cursor: "pointer",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            View detail
                        </button>
                    )}
                </>
            )}

            {/* Tooltip nhỏ giải thích cảnh báo */}
            <div
                style={{
                    marginTop: 10,
                    borderTop: "1px dashed rgba(148,163,184,0.4)",
                    paddingTop: 6,
                    fontSize: 11,
                    opacity: 0.75,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <span style={{ fontSize: 14 }}>ℹ</span>
                {!sensorData && (
                    <span>Node sẽ hiển thị dữ liệu ngay khi có gói tin đầu tiên.</span>
                )}
                {sensorData && !isWarning && (
                    <span>Nhiệt độ &amp; CO₂ đang nằm trong ngưỡng an toàn.</span>
                )}
                {sensorData && isWarning && (
                    <div
                        style={{
                            textAlign: "left",
                            maxWidth: "100%",
                        }}
                    >
                        <span>Nguy hiểm: nhiệt độ hoặc CO₂ vượt ngưỡng an toàn.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeCard;
