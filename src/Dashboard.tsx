import React, { useState, useEffect } from "react";
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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 10000);

    return () => window.clearInterval(id);
  }, []);

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

  const isNodeActive = (node: DashboardNode) => {
    const ts = node.sensorData?.timestamp;
    if (!ts) return false;

    const ms = new Date(ts).getTime();
    if (Number.isNaN(ms)) return false;

    // Active nếu node nhận dữ liệu trong vòng 60 giây gần nhất
    return now - ms <= 60_000;
  };

  // Các số liệu tổng quan
  const totalNodes = nodes.length;
  const activeNodes = nodes.filter(isNodeActive).length;
  const inactiveNodes = totalNodes - activeNodes;
  const lastUpdate = (() => {
    const timestamps = nodes
      .map((n) => n.sensorData?.timestamp)
      .filter((t): t is string => !!t);
    if (!timestamps.length) return "Chưa có dữ liệu";
    return timestamps.sort().reverse()[0];
  })();

  const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617", // slate-950
        color: "#e5e7eb",
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
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background:
                "radial-gradient(circle at 0 0, rgba(56,189,248,0.9), rgba(15,23,42,1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: "#0b1120",
              boxShadow: "0 0 0 1px rgba(15,23,42,0.6)",
            }}
          >
            WF
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Wildfire Monitoring
            </div>
            <div
              style={{
                fontSize: 12,
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
              borderRadius: 999,
              background:
                "radial-gradient(circle at 20% 0, rgba(96,165,250,0.7), rgba(15,23,42,1))",
              border: "1px solid #1f2937",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
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
        {/* TOP SECTION: title + Add node */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.7,
                maxWidth: 420,
              }}
            >
              Giám sát trạng thái các node cảm biến (DevAddr) theo thời gian
              thực. Bạn có thể thêm / xoá node và xem chi tiết từng node.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={openModal}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
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
                "radial-gradient(circle at 0 0, rgba(148,163,184,0.18), rgba(15,23,42,1))",
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
              Node không hoạt động (&gt; 1 phút)
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{inactiveNodes}</div>
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

        {/* GRID NODE CARDS */}
        <section>
          <div
            style={{
              borderRadius: 18,
              border: "1px solid #1f2937",
              background:
                "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                    opacity: 0.75,
                  }}
                >
                  Danh sách node
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Tổng {totalNodes} node – click vào từng node để xem chi tiết.
                </div>
              </div>
            </div>

            {nodes.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                  width: "100%",
                }}
              >
                {nodes.map((node) => (
                  <NodeCard
                    key={node.devAddr}
                    devAddr={node.devAddr}
                    sensorData={node.sensorData}
                    sensorLoaded={node.sensorLoaded}
                    onRemove={(devAddr) => setDeleteTarget(devAddr)}
                    onMoreDetails={onOpenNodeDetail}
                  />
                ))}
              </div>
            ) : (
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
            backgroundColor: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              backgroundColor: "#020617",
              borderRadius: 16,
              border: "1px solid #1f2937",
              boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
              padding: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Thêm node mới
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.75,
                marginBottom: 14,
              }}
            >
              Nhập DevAddr (số nguyên dương) của node cảm biến mà bạn muốn theo
              dõi.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label
                  htmlFor="devAddr"
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  DevAddr
                </label>
                <input
                  id="devAddr"
                  type="number"
                  value={devAddrInput}
                  onChange={(e) => setDevAddrInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #4b5563",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                    fontSize: 13,
                    outline: "none",
                  }}
                  placeholder="Ví dụ: 1, 2, 3..."
                />
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#fecaca",
                    marginBottom: 8,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid #4b5563",
                    background: "transparent",
                    color: "#e5e7eb",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "#f9fafb",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Thêm node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP xác nhận xoá node */}
      {deleteTarget !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 320,
              backgroundColor: "#020617",
              borderRadius: 16,
              border: "1px solid #1f2937",
              boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
              padding: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Xoá node
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 14,
              }}
            >
              Bạn có chắc chắn muốn xoá node DevAddr {deleteTarget} khỏi
              dashboard?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid #4b5563",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTarget !== null) {
                    onRemoveNode?.(deleteTarget);
                  }
                  setDeleteTarget(null);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg,#ef4444,#b91c1c)",
                  color: "#f9fafb",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
