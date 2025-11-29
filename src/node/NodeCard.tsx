import React from "react";
import { SensorData } from "../api/appsyncClient";

export interface NodeCardProps {
    devAddr: number;
    sensorData: SensorData | null;
    sensorLoaded: boolean;
    onRemove?: (devAddr: number) => void;
    onMoreDetails?: (devAddr: number) => void;
}

const formatValue = (value?: number | null, unit?: string) =>
    value === null || value === undefined ? "--" : `${value}${unit ?? ""}`;

const NodeCard: React.FC<NodeCardProps> = ({
    devAddr,
    sensorData,
    sensorLoaded,
    onRemove,
    onMoreDetails,
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

    let badgeStyle: React.CSSProperties = {
        backgroundColor: "rgba(34,197,94,0.16)",
        color: "#bbf7d0",
        border: "1px solid rgba(34,197,94,0.6)",
    };

    if (!timestamp) {
        badgeStyle = {
            backgroundColor: "rgba(148,163,184,0.18)",
            color: "#e5e7eb",
            border: "1px solid rgba(148,163,184,0.7)",
        };
    } else if (isOffline) {
        badgeStyle = {
            backgroundColor: "rgba(148,163,184,0.18)",
            color: "#e5e7eb",
            border: "1px solid rgba(148,163,184,0.9)",
        };
    } else if (isWarning) {
        badgeStyle = {
            backgroundColor: "rgba(248,113,113,0.18)",
            color: "#fecaca",
            border: "1px solid rgba(248,113,113,0.85)",
        };
    }

    // Style card tối ưu cho grid
    const cardBaseStyle: React.CSSProperties = {
        position: "relative",
        borderRadius: 16,
        padding: 16,
        backgroundColor: "#020617",
        border: "1px solid #1f2937",
        boxShadow: "0 10px 25px rgba(15,23,42,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
        minHeight: 190,
    };

    const warningBorderStyle: React.CSSProperties = isWarning
        ? {
            border: "1px solid rgba(248,113,113,0.9)",
            boxShadow:
                "0 0 0 1px rgba(248,113,113,0.4), 0 0 25px rgba(248,113,113,0.35)",
        }
        : {};

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
                    background:
                        "radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 55%)",
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
                        color: "#fecaca",
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
                                border: "1px solid #4b5563",
                                background: "transparent",
                                color: "#9ca3af",
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
                                border: "1px solid #374151",
                                background:
                                    "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.7))",
                                color: "#e5e7eb",
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                                cursor: "pointer",
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
                        <span>Nguy hiểm: nhiệt độ vượt ngưỡng nhiệt độ an toàn.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeCard;
