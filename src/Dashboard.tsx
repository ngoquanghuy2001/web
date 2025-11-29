// src/Dashboard.tsx
import React from "react";
import { SensorData } from "./api/appsyncClient";
import NodeCard from "./node/NodeCard";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

export interface DashboardNode {
  devAddr: number;
  sensorData: SensorData | null;
  sensorLoaded: boolean;
}

interface DashboardProps {
  user: UserInfo;
  nodes: DashboardNode[];
  onLogout?: () => void;
  onAddNode?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  nodes,
  onLogout,
  onAddNode,
}) => {
  const gmail = user.attributes.email ?? "Không có email";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 64px 64px",
        background: "linear-gradient(135deg,#f89ca0,#f7b27a)",
        fontFamily:
          '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#fff",
      }}
    >
      {/* Top bar rút gọn */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "auto",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13 }}>{gmail}</span>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(90deg, rgba(34,197,94,1) 0%, rgba(22,163,74,1) 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(22,163,74,0.6)",
              }}
            >
              LOG OUT
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 48,
            letterSpacing: 6,
            fontWeight: 800,
            textTransform: "uppercase",
            textShadow: "0 18px 32px rgba(0,0,0,0.35)",
          }}
        >
          WILDFIRE MONITORING SYSTEM 1
        </h1>
      </div>

      {/* 🔹 Nút + thêm node */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <button
          onClick={onAddNode}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            fontSize: 32,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            boxShadow: "0 12px 24px rgba(22,163,74,0.45)",
          }}
        >
          +
        </button>
        <p style={{ marginTop: 8, opacity: 0.9 }}>Add new node</p>
      </div>

      {/* Node cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 24,
        }}
      >
        {nodes.map((node) => (
          <NodeCard
            key={node.devAddr}
            devAddr={node.devAddr}
            sensorData={node.sensorData}
            sensorLoaded={node.sensorLoaded}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
