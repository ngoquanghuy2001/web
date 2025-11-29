import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { SensorData } from "../api/appsyncClient";
import { UserInfo } from "../auth";

interface NodeDetailPageProps {
  user: UserInfo;
  sensorHistoryMap: Record<number, SensorData[]>;
  onBack: () => void;
}

const NodeDetailPage: React.FC<NodeDetailPageProps> = ({
  user,
  sensorHistoryMap,
  onBack,
}) => {
  const { devAddr } = useParams<{ devAddr: string }>();
  const devAddrNum = Number(devAddr);

  const history = sensorHistoryMap[devAddrNum] ?? [];
  const latest = history[0] ?? null;

  const gmail = user.attributes.email ?? "Không có email";
  const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

  const statCards = useMemo(
    () => [
      {
        label: "Nhiệt độ hiện tại",
        value:
          latest?.temperature != null ? `${latest.temperature}°C` : "--",
      },
      {
        label: "Độ ẩm hiện tại",
        value: latest?.humidity != null ? `${latest.humidity}%` : "--",
      },
      {
        label: "CO₂ hiện tại",
        value: latest?.co2 != null ? `${latest.co2} ppm` : "--",
      },
      {
        label: "Pin",
        value: latest?.battery != null ? `${latest.battery}%` : "--",
      },
    ],
    [latest]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        fontFamily:
          '"Inter", system-ui, -apple-system, BlinkMacSystemFont,"Segoe UI", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER giống Dashboard */}
      <header
        style={{
          height: 64,
          borderBottom: "1px solid #1f2937",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(2,6,23,0.96)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              borderRadius: 999,
              border: "1px solid #334155",
              background: "transparent",
              color: "#e5e7eb",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            ← Back
          </button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Node {devAddrNum}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Detailed view
            </div>
          </div>
        </div>

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
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          padding: "24px 32px 40px",
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Summary */}
        <section style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            Node {devAddrNum} details
          </h1>
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            Hiển thị tối đa 20 gói dữ liệu cảm biến gần nhất cho node này.
          </p>
        </section>

        {/* Stat cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {statCards.map((s) => (
            <div
              key={s.label}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #1f2937",
                background:
                  "radial-gradient(circle at 0 0, rgba(56,189,248,0.12), rgba(15,23,42,1))",
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
                {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </section>

        {/* Chart placeholders */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {["Air temperature", "Air humidity", "Radiant temperature", "CO₂ concentration"].map(
            (title) => (
              <div
                key={title}
                style={{
                  borderRadius: 18,
                  border: "1px solid #1f2937",
                  background:
                    "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))",
                  padding: "12px 14px",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: "1px dashed rgba(148,163,184,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    opacity: 0.6,
                  }}
                >
                  {/* Ở đây bạn có thể tích hợp Chart.js / Recharts vẽ từ history */}
                  Biểu đồ (dùng 20 mẫu gần nhất)
                </div>
              </div>
            )
          )}
        </section>

        {/* Data table */}
        <section>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Data details (last {history.length} records)
          </h2>

          <div
            style={{
              borderRadius: 18,
              border: "1px solid #1f2937",
              background:
                "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                  }}
                >
                  {[
                    "Battery",
                    "CO₂",
                    "Temperature",
                    "Humidity",
                    "MaxT",
                    "Fire",
                    "Timestamp",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 12,
                        fontSize: 13,
                        opacity: 0.7,
                      }}
                    >
                      Chưa có dữ liệu nào cho node này.
                    </td>
                  </tr>
                )}

                {history.map((d, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid #111827",
                      backgroundColor:
                        idx % 2 === 0 ? "rgba(15,23,42,0.85)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px 12px" }}>
                      {d.battery ?? "--"}%
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {d.co2 != null ? `${d.co2} ppm` : "--"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {d.temperature != null ? `${d.temperature}°C` : "--"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {d.humidity != null ? `${d.humidity}%` : "--"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {d.maxT != null ? `${d.maxT}°C` : "--"}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: d.fire ? "#fecaca" : "#bbf7d0",
                        fontWeight: 600,
                      }}
                    >
                      {d.fire ? "YES" : "NO"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {d.timestamp ?? "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NodeDetailPage;
