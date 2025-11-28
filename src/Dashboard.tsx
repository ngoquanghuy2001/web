import React from "react";
import { SensorData } from "./api/appsyncClient";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

interface DashboardProps {
  user: UserInfo;
  onLogout: () => void;
  sensorData: SensorData | null;
  sensorLoaded: boolean;
  devAddr: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  sensorData,
  sensorLoaded,
  devAddr,
}) => {
  const { username, attributes } = user;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1>Dashboard</h1>
        <button onClick={onLogout}>Đăng xuất</button>
      </div>

      {/* Thông tin user */}
      <h2>Thông tin người dùng</h2>
      <p>
        <strong>Username:</strong> {username}
      </p>

      <h3>Thuộc tính (attributes) từ Cognito</h3>
      <ul>
        {Object.entries(attributes).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {value}
          </li>
        ))}
      </ul>

      {/* Dữ liệu cảm biến realtime */}
      <h2 style={{ marginTop: 32 }}>
        Dữ liệu cảm biến realtime (DevAddr {devAddr})
      </h2>

      {!sensorLoaded && <p>Đang đợi bản tin cảm biến đầu tiên...</p>}

      {sensorLoaded && !sensorData && (
        <p>Chưa nhận được dữ liệu nào cho DevAddr {devAddr}.</p>
      )}

      {sensorLoaded && sensorData && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginTop: 8,
          }}
        >
          <p>
            <strong>DevAddr:</strong> {sensorData.DevAddr}
          </p>
          <p>
            <strong>Timestamp mới nhất:</strong> {sensorData.timestamp ?? "N/A"}
          </p>
          <p>
            <strong>Nhiệt độ hiện tại:</strong>{" "}
            {sensorData.temperature ?? "N/A"} °C
          </p>
          <p>
            <strong>Nhiệt độ max:</strong> {sensorData.maxT ?? "N/A"} °C
          </p>
          <p>
            <strong>Độ ẩm:</strong> {sensorData.humidity ?? "N/A"} %
          </p>
          <p>
            <strong>CO₂:</strong> {sensorData.co2 ?? "N/A"} ppm</p>
          <p>
            <strong>Pin:</strong> {sensorData.battery ?? "N/A"} %
          </p>
          <p>
            <strong>Cảnh báo cháy:</strong>{" "}
            {sensorData.fire ? "🔥 Có cháy / nhiệt cao" : "Không phát hiện"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
