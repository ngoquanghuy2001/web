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

    const isWarning =
        (sensorData?.fire ?? false) ||
        (temperature !== undefined && temperature !== null && temperature >= 40) ||
        (co2 !== undefined && co2 !== null && co2 >= 2000);

    const statusText = isWarning ? "ALERT" : "Safe";

    const handleRemoveClick = () => {
        onRemove?.(devAddr);
    };

    // Style cho card khi warning vs normal
    const cardBaseStyle: React.CSSProperties = {
        position: "relative",
        flex: "0 1 280px",
        borderRadius: 16,
        padding: 14,
        backgroundColor: "#020617",
        border: "1px solid #1f2937",
        boxShadow: "0 10px 25px rgba(15,23,42,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
    };

    const warningBorderStyle: React.CSSProperties = isWarning
        ? {
            border: "1px solid rgba(248,113,113,0.9)", // đỏ
            boxShadow:
                "0 0 0 1px rgba(248,113,113,0.4), 0 0 25px rgba(248,113,113,0.35)",
        }
        : {};

    return (
        <div style={{ ...cardBaseStyle, ...warningBorderStyle }}>
            {/* Dải đỏ bên trái khi cảnh báo */}
            {isWarning && (
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background:
                            "linear-gradient(to bottom, #f97373, #ef4444, #b91c1c)",
                    }}
                />
            )}

            {/* Icon cảnh báo lớn khi danger */}
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
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.7,
                            backgroundColor: isWarning
                                ? "rgba(248,113,113,0.18)"
                                : "rgba(34,197,94,0.16)",
                            color: isWarning ? "#fecaca" : "#bbf7d0",
                            border: isWarning
                                ? "1px solid rgba(248,113,113,0.85)"
                                : "1px solid rgba(34,197,94,0.6)",
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
                            }}
                            aria-label={`Remove node ${devAddr}`}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            {!sensorLoaded && (
                <p
                    style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginTop: 6,
                    }}
                >
                    Đang chờ gói dữ liệu cảm biến đầu tiên...
                </p>
            )}

            {sensorLoaded && !sensorData && (
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
                            <div style={{ opacity: 0.6, fontSize: 11 }}>Battery</div>
                            <div style={{ fontWeight: 500 }}>
                                {formatValue(sensorData?.battery, "%")}
                            </div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.6, fontSize: 11 }}>Fire</div>
                            <div style={{ fontWeight: 500 }}>
                                {sensorData?.fire ? "Yes" : "No"}
                            </div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.6, fontSize: 11 }}>Max Temp</div>
                            <div style={{ fontWeight: 500 }}>
                                {formatValue(sensorData?.maxT, "°C")}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 8,
                            fontSize: 11,
                            opacity: 0.6,
                        }}
                    >
                        Timestamp:{" "}
                        <span style={{ opacity: 0.9 }}>
                            {timestamp ?? "No timestamp"}
                        </span>
                    </div>
                </>
            )}

            {/* Footer */}
            <div
                style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <button
                    style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "1px solid #374151",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#e5e7eb",
                    }}
                    onClick={() => onMoreDetails?.(devAddr)}
                >
                    More details
                </button>


                {isWarning && (
                    <div
                        style={{
                            fontSize: 11,
                            color: "#fecaca",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            textAlign: "right",
                            maxWidth: 160,
                        }}
                    >
                        <span>🔥</span>
                        <span>Nguy hiểm: vượt ngưỡng nhiệt độ / CO₂ hoặc báo cháy.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeCard;
