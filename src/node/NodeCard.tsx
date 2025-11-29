import React from "react";
import { SensorData } from "../api/appsyncClient";

export interface NodeCardProps {
  devAddr: number;
  sensorData: SensorData | null;
  sensorLoaded: boolean;
}

const formatValue = (value?: number | null, unit?: string) =>
  value === null || value === undefined ? "--" : `${value}${unit ?? ""}`;

const NodeCard: React.FC<NodeCardProps> = ({
  devAddr,
  sensorData,
  sensorLoaded,
}) => {
  const temperature = sensorData?.temperature;
  const humidity = sensorData?.humidity;
  const co2 = sensorData?.co2;
  const timestamp = sensorData?.timestamp ?? null;

  const isWarning =
    (sensorData?.fire ?? false) ||
    (temperature !== undefined && temperature !== null && temperature >= 40) ||
    (co2 !== undefined && co2 !== null && co2 >= 2000);

  const statusText = isWarning ? "WARNING" : "Safe";

  return (
    <div
      style={{
        flex: 1,
        minWidth: 260,
        margin: "0 16px",
        borderRadius: 32,
        padding: 3,
        background: isWarning
          ? "linear-gradient(90deg, #ff7a7a, #ffb347)"
          : "linear-gradient(90deg, #4ade80, #38bdf8)",
        boxShadow:
          "0 24px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(18px)",
          padding: "24px 28px 28px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 26, marginBottom: 8, fontWeight: 700 }}>
          Node {devAddr}
          {isWarning && (
            <span style={{ marginLeft: 8, fontSize: 20 }}>🔥🔥🔥</span>
          )}
        </h2>

        {!sensorLoaded && <p>Đang đợi bản tin cảm biến đầu tiên...</p>}

        {sensorLoaded && !sensorData && (
          <p>Chưa nhận được dữ liệu nào cho DevAddr {devAddr}.</p>
        )}

        {sensorLoaded && sensorData && (
          <>
            <p>Temperature: <strong>{formatValue(temperature, "°C")}</strong></p>
            <p>Humidity: <strong>{formatValue(humidity, "%")}</strong></p>
            <p>CO₂: <strong>{formatValue(co2, "ppm")}</strong></p>
            <p>Battery: <strong>{formatValue(sensorData?.battery, "V")}</strong></p>
            <p>Fire: <strong>{sensorData?.fire ? "Yes" : "No"}</strong></p>
            <p>Max Temperature: <strong>{formatValue(sensorData?.maxT, "°C")}</strong></p>
            <p>Timestamp: <strong>{timestamp ?? "No timestamp"}</strong></p>

            <p
              style={{
                marginTop: 18,
                fontWeight: 700,
                fontSize: 18,
                color: isWarning ? "#fffb" : "#22c55e",
                textTransform: "uppercase",
                textShadow: "0 0 12px rgba(0,0,0,0.45)",
              }}
            >
              {statusText}
              {isWarning && <span style={{ marginLeft: 6 }}>🔥</span>}
            </p>

            <p style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
              {timestamp ?? "No timestamp"}
            </p>
          </>
        )}

        <button
          style={{
            marginTop: 18,
            padding: "10px 26px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            background: "linear-gradient(90deg,#22c55e,#16a34a)",
            color: "#fff",
            boxShadow: "0 10px 20px rgba(22,163,74,0.55)",
          }}
        >
          More details
        </button>
      </div>
    </div>
  );
};

export default NodeCard;
