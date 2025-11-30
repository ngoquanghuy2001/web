import React from "react";
import { useTranslation } from "react-i18next";
import { SensorData } from "../api/appsyncClient";

export interface NodeCardProps {
    devAddr: number;
    sensorData: SensorData | null;
    sensorLoaded: boolean;
    onRemove?: (devAddr: number) => void;
    onMoreDetails?: (devAddr: number) => void;
    onViewLocation?: (devAddr: number) => void;
    darkMode?: boolean;
}

const NodeCard: React.FC<NodeCardProps> = ({
    devAddr,
    sensorData,
    sensorLoaded,
    onRemove,
    onMoreDetails,
    onViewLocation,
    darkMode = true,
}) => {
    const { t } = useTranslation();

    const temperature = sensorData?.temperature ?? null;
    const humidity = sensorData?.humidity ?? null;
    const co2 = sensorData?.co2 ?? null;
    const fire = sensorData?.fire ?? false;
    const battery = sensorData?.battery ?? null;
    const timestamp = sensorData?.timestamp ?? null;

    const hasData = !!sensorData;

    const isWarning =
        !!sensorData &&
        (fire === true ||
            (temperature != null && temperature >= 40) ||
            (co2 != null && co2 >= 2000));

    let isOffline = false;
    if (timestamp) {
        const ms = new Date(timestamp).getTime();
        if (!Number.isNaN(ms)) {
            isOffline = Date.now() - ms > 60_000;
        }
    }

    let statusKey: string = "nodeCard.status.safe";

    if (!hasData || !sensorLoaded) {
        statusKey = "nodeCard.status.noData";
    } else if (isWarning) {
        statusKey = "nodeCard.status.warning";
    } else if (isOffline) {
        statusKey = "nodeCard.status.offline";
    }

    const statusText = t(statusKey);

    const baseBadge: React.CSSProperties = {
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.7,
    };

    let statusStyle: React.CSSProperties;
    if (!hasData || !sensorLoaded) {
        statusStyle = darkMode
            ? {
                backgroundColor: "rgba(148,163,184,0.16)",
                color: "#e5e7eb",
                border: "1px solid rgba(148,163,184,0.5)",
            }
            : {
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "1px solid #9ca3af",
            };
    } else if (isWarning) {
        statusStyle = darkMode
            ? {
                backgroundColor: "rgba(239,68,68,0.16)",
                color: "#fecaca",
                border: "1px solid rgba(239,68,68,0.7)",
            }
            : {
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #f97316",
            };
    } else if (isOffline) {
        statusStyle = darkMode
            ? {
                backgroundColor: "rgba(249,115,22,0.12)",
                color: "#fed7aa",
                border: "1px solid rgba(249,115,22,0.7)",
            }
            : {
                backgroundColor: "#ffedd5",
                color: "#9a3412",
                border: "1px solid #f97316",
            };
    } else {
        statusStyle = darkMode
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

    const cardBorder = darkMode ? "#3e4d61ff" : "#e5e7eb";
    const cardBg = darkMode
        ? "radial-gradient(circle at 0 0, rgba(34, 57, 66, 0.16), rgba(3, 17, 49, 1))"
        : "radial-gradient(circle at 0 0, rgba(56,189,248,0.16), #ffffff)";
    const textMuted = darkMode ? "rgba(148,163,184,0.9)" : "#6b7280";

    const handleRemove = () => onRemove?.(devAddr);
    const handleDetails = () => onMoreDetails?.(devAddr);
    const handleViewLocationClick = () => onViewLocation?.(devAddr);

    return (
        <div
            style={{
                borderRadius: 18,
                border: `1px solid ${cardBorder}`,
                background: cardBg,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                minHeight: 180,
            }}
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
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            opacity: 0.8,
                        }}
                    >
                        {t("nodeCard.nodeLabel")} #{devAddr}
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: textMuted,
                        }}
                    >
                        {hasData && timestamp
                            ? t("nodeCard.lastUpdate", { timestamp })
                            : t("nodeCard.noUpdateYet")}
                    </div>
                </div>

                <span style={{ ...baseBadge, ...statusStyle }}>{statusText}</span>
            </div>

            {/* Metrics */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 8,
                    fontSize: 12,
                }}
            >
                <div>
                    <div style={{ opacity: 0.7, marginBottom: 2 }}>
                        {t("nodeCard.temperatureLabel")}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                        {temperature != null ? `${temperature}°C` : "--"}
                    </div>
                </div>

                <div>
                    <div style={{ opacity: 0.7, marginBottom: 2 }}>
                        {t("nodeCard.humidityLabel")}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                        {humidity != null ? `${humidity}%` : "--"}
                    </div>
                </div>

                <div>
                    <div style={{ opacity: 0.7, marginBottom: 2 }}>
                        {t("nodeCard.co2Label")}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                        {co2 != null ? `${co2} ppm` : "--"}
                    </div>
                </div>

                <div>
                    <div style={{ opacity: 0.7, marginBottom: 2 }}>
                        {t("nodeCard.fireStatusLabel")}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                        {hasData
                            ? fire
                                ? t("nodeCard.fireStatus.warning")
                                : t("nodeCard.fireStatus.ok")
                            : "--"}
                    </div>
                </div>
            </div>

            {/* Actions + tooltip */}
            <div
                style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                    }}
                >
                    {/* Nút xem vị trí */}
                    <button
                        type="button"
                        onClick={handleViewLocationClick}
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: `1px solid ${darkMode ? "#4b5563" : "#b2abb4ff"}`,
                            background: "transparent",
                            color: darkMode ? "#e5e7eb" : "#111827",
                            fontSize: 11,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <span>📍</span>
                        {t("nodeCard.viewLocation")}
                    </button>

                    {/* Xem chi tiết */}
                    {onMoreDetails && (
                        <button
                            type="button"
                            onClick={handleDetails}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: `1px solid ${darkMode ? "#4b5563" : "#7f8083ff"}`,
                                background: darkMode
                                    ? "linear-gradient(135deg, rgba(7, 23, 59, 1), rgba(52, 71, 110, 0.7))"
                                    : "linear-gradient(135deg, #ffffff, #e5e7eb)",
                                color: darkMode ? "#e5e7eb" : "#111827",
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                                cursor: "pointer",
                            }}
                        >
                            {t("nodeCard.viewDetail")}
                        </button>
                    )}

                    {/* Xoá node */}
                    {onRemove && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: `1px solid ${darkMode ? "#4b5563" : "#fecaca"}`,
                                background: darkMode
                                    ? "rgba(127,29,29,0.25)"
                                    : "rgba(254,202,202,0.7)",
                                color: darkMode ? "#fecaca" : "#7f1d1d",
                                fontSize: 11,
                                cursor: "pointer",
                            }}
                        >
                            {t("nodeCard.removeNodeTitle")}
                        </button>
                    )}
                </div>

                {/* Tooltip trạng thái */}
                <div
                    style={{
                        fontSize: 11,
                        color: textMuted,
                        maxWidth: 160,
                    }}
                >
                    {!hasData || !sensorLoaded
                        ? t("nodeCard.tooltip.noDataYet")
                        : isWarning
                            ? t("nodeCard.tooltip.warning")
                            : t("nodeCard.tooltip.safe")}
                </div>
            </div>
        </div>
    );
};

export default NodeCard;
