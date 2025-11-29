import React from "react";
import { SensorData } from "./api/appsyncClient";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

interface DashboardProps {
  user: UserInfo;
  sensorData: SensorData | null;
  sensorLoaded: boolean;
  devAddr: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  sensorData,
  sensorLoaded,
  devAddr,
}) => {
  // Lấy gmail từ attributes
  const gmail = user.attributes.email ?? "Không có email";

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      {/* Chỉ hiển thị Gmail */}
      <h2>Thông tin tài khoản</h2>
      <p>
        <strong>Email:</strong> {gmail}
      </p>

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
            <strong>CO₂:</strong> {sensorData.co2 ?? "N/A"} ppm
          </p>
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
