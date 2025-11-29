import React, { useState } from "react";
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
  onAddNode?: (devAddr: number) => void;
  onRemoveNode?: (devAddr: number) => void;
  onOpenNodeDetail?: (devAddr: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  nodes,
  onLogout,
  onAddNode,
  onRemoveNode,
  onOpenNodeDetail,
}) => {
  const gmail = user.attributes.email ?? "Không có email";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devAddrInput, setDevAddrInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const openModal = () => {
    setDevAddrInput("");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(devAddrInput);

    if (!Number.isInteger(value) || value <= 0) {
      setError("DevAddr phải là số nguyên dương.");
      return;
    }

    onAddNode?.(value);
    setIsModalOpen(false);
  };

  // Các số liệu tổng quan
  const totalNodes = nodes.length;
  const activeNodes = nodes.filter(
    (n) => n.sensorLoaded && n.sensorData
  ).length;
  const lastUpdate = (() => {
    const timestamps = nodes
      .map((n) => n.sensorData?.timestamp)
      .filter((t): t is string => !!t);
    if (!timestamps.length) return "Chưa có dữ liệu";
    // Lấy timestamp mới nhất (chuỗi, tạm coi so sánh string là đủ)
    return timestamps.sort().reverse()[0];
  })();

  const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617", // slate-950
        color: "#e5e7eb", // text-slate-200
        fontFamily:
          '"Inter", system-ui, -apple-system, BlinkMacSystemFont,"Segoe UI", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER / TOP BAR */}
      <header
        style={{
          height: 64,
          borderBottom: "1px solid #1f2937",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "rgba(2,6,23,0.96)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Logo + tên hệ thống */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background:
                "radial-gradient(circle at 0% 0%, #22c55e, #0ea5e9 60%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            W
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Wildfire Monitoring
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Realtime sensor dashboard
            </div>
          </div>
        </div>

        {/* User + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {user.username || "User"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{gmail}</div>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "999px",
              border: "1px solid #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              background:
                "radial-gradient(circle at 30% 0%, #38bdf8, #0f172a 70%)",
            }}
          >
            {avatarChar}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid #334155",
                background:
                  "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.4))",
                color: "#e5e7eb",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Log out
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          padding: "24px 32px 40px",
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Title + toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Giám sát các node cảm biến môi trường theo thời gian thực.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* sau này có thể thêm 1 nút Filter ở đây */}
            <button
              onClick={openModal}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                background:
                  "linear-gradient(135deg,#22c55e,#16a34a)",
                boxShadow: "0 8px 20px rgba(34,197,94,0.35)",
                color: "#f9fafb",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: "rgba(15,23,42,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  lineHeight: "16px",
                }}
              >
                +
              </span>
              Add node
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #1f2937",
              background:
                "radial-gradient(circle at 0 0, rgba(56,189,248,0.15), rgba(15,23,42,1))",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                opacity: 0.7,
                marginBottom: 4,
              }}
            >
              Tổng số node
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{totalNodes}</div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #1f2937",
              background:
                "radial-gradient(circle at 0 0, rgba(34,197,94,0.18), rgba(15,23,42,1))",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                opacity: 0.7,
                marginBottom: 4,
              }}
            >
              Node đang hoạt động
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{activeNodes}</div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #1f2937",
              background:
                "radial-gradient(circle at 0 0, rgba(248,250,252,0.05), rgba(15,23,42,1))",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                opacity: 0.7,
                marginBottom: 4,
              }}
            >
              Lần cập nhật cuối
            </div>
            <div
              style={{
                fontSize: 13,
                opacity: 0.9,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={lastUpdate}
            >
              {lastUpdate}
            </div>
          </div>
        </section>

        {/* NODE LIST */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              gap: 8,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Danh sách node
            </h2>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              Click “More details” trong từng node để xem thêm thông tin.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {nodes.map((node) => (
              <NodeCard
                key={node.devAddr}
                devAddr={node.devAddr}
                sensorData={node.sensorData}
                sensorLoaded={node.sensorLoaded}
                onRemove={(id) => setDeleteTarget(id)}
                onMoreDetails={onOpenNodeDetail}
              />
            ))}

            {nodes.length === 0 && (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 13,
                  opacity: 0.7,
                }}
              >
                Chưa có node nào. Hãy bấm “Add node” để thêm DevAddr mới.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* POPUP thêm node */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#020617",
              color: "#e5e7eb",
              borderRadius: 16,
              padding: "20px 22px",
              minWidth: 320,
              boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
              border: "1px solid #1f2937",
            }}
          >
            <h2
              style={{
                marginBottom: 10,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Thêm node mới
            </h2>
            <p
              style={{
                fontSize: 12,
                opacity: 0.7,
                marginBottom: 12,
              }}
            >
              Nhập DevAddr (số nguyên dương) để thêm node vào bảng điều khiển.
            </p>
            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 13 }}>
                DevAddr:
                <input
                  type="number"
                  value={devAddrInput}
                  onChange={(e) => setDevAddrInput(e.target.value)}
                  style={{
                    marginTop: 6,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    outline: "none",
                    fontSize: 13,
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                  }}
                />
              </label>
              {error && (
                <p
                  style={{
                    color: "#f97373",
                    marginTop: 6,
                    fontSize: 12,
                  }}
                >
                  {error}
                </p>
              )}

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #4b5563",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#e5e7eb",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Thêm node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#020617",
              color: "#e5e7eb",
              borderRadius: 16,
              padding: "22px 24px",
              minWidth: 340,
              boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
              border: "1px solid #1f2937",
            }}
          >
            <h2 style={{ marginBottom: 10, fontSize: 18, fontWeight: 600 }}>
              Xoá node?
            </h2>

            <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
              Bạn có chắc muốn xoá node <b>DevAddr {deleteTarget}</b>?<br />
              Hành động này không thể hoàn tác.
            </p>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#e5e7eb",
                }}
              >
                Hủy
              </button>

              <button
                onClick={() => {
                  onRemoveNode?.(deleteTarget);
                  setDeleteTarget(null);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#ef4444,#b91c1c)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Xoá node
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
