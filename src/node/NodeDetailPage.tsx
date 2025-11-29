import React, { useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { SensorData } from "../api/appsyncClient";
import { UserInfo } from "../auth";

interface NodeDetailPageProps {
    user: UserInfo;
    sensorHistoryMap: Record<number, SensorData[]>;
    onBack: () => void;
}

const HISTORY_STORAGE_KEY = "wildfire_history";

const NodeDetailPage: React.FC<NodeDetailPageProps> = ({
    user,
    sensorHistoryMap,
    onBack,
}) => {
    const { devAddr } = useParams<{ devAddr: string }>();
    const devAddrNum = Number(devAddr);

    // history dùng cho bảng + biểu đồ
    const [history, setHistory] = useState<SensorData[]>([]);

    // Đồng bộ history: ưu tiên từ sensorHistoryMap, nếu chưa có thì đọc từ localStorage.wildfire_history
    useEffect(() => {
        // 1. Ưu tiên state từ App.tsx
        const fromMap = sensorHistoryMap[devAddrNum];
        if (fromMap && fromMap.length > 0) {
            setHistory(fromMap);
            return;
        }

        // 2. Fallback: đọc map chung từ localStorage
        try {
            const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw) as Record<string, SensorData[]>;
            const arr =
                parsed[devAddrNum] || // key dạng số
                parsed[String(devAddrNum)]; // fallback nếu key là chuỗi "2"

            if (Array.isArray(arr)) {
                setHistory(arr);
            }
        } catch (e) {
            console.error("Không đọc được wildfire_history từ localStorage", e);
        }
    }, [devAddrNum, sensorHistoryMap]);

    const latest = history[0] ?? null;

    const gmail = user.attributes.email ?? "Không có email";
    const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

    const statCards = useMemo(
        () => [
            {
                label: "Nhiệt độ hiện tại",
                value: latest?.temperature != null ? `${latest.temperature}°C` : "--",
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

    // Dữ liệu vẽ biểu đồ (tối đa 20 mẫu gần nhất, đảo ngược để thời gian tăng dần)
    const chartData = useMemo(
        () =>
            [...history]
                .slice(0, 20)
                .reverse()
                .map((d, index) => {
                    let label = d.timestamp ?? `#${index + 1}`;
                    // Nếu timestamp có dạng "2025-11-29 21:57:29" thì chỉ lấy phần giờ (HH:mm:ss)
                    if (label.includes(" ")) {
                        const parts = label.split(" ");
                        label = parts[parts.length - 1];
                    }
                    return {
                        timestamp: label,
                        temperature: d.temperature,
                        humidity: d.humidity,
                        maxT: d.maxT,
                        co2: d.co2,
                    };
                }),
        [history]
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

                {/* CHARTS */}
                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))", // mỗi dòng 2 biểu đồ
                        gap: 24,
                        marginBottom: 32,
                    }}
                >
                    {/* Temperature */}
                    <ChartCard title="Air temperature (°C)">
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3c4e" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        domain={["dataMin - 1", "dataMax + 1"]}
                                    />
                                    <Tooltip
                                        labelStyle={{ color: "#fff" }}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="temperature"
                                        stroke="#60a5fa"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* Humidity */}
                    <ChartCard title="Air humidity (%)">
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3c4e" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        domain={["dataMin - 1", "dataMax + 1"]}
                                    />
                                    <Tooltip
                                        labelStyle={{ color: "#fff" }}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="humidity"
                                        stroke="#34d399"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* Radiant temperature */}
                    <ChartCard title="Radiant temperature (MaxT, °C)">
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3c4e" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        domain={["dataMin - 1", "dataMax + 1"]}
                                    />
                                    <Tooltip
                                        labelStyle={{ color: "#fff" }}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="maxT"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* CO2 */}
                    <ChartCard title="CO₂ concentration (ppm)">
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3c4e" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        domain={["dataMin - 1", "dataMax + 1"]}
                                    />
                                    <Tooltip
                                        labelStyle={{ color: "#fff" }}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="co2"
                                        stroke="#facc15"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
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

/**
 * Card khung cho mỗi biểu đồ – để code gọn lại
 */
const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <div
        style={{
            borderRadius: 18,
            border: "1px solid #1f2937",
            background:
                "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))",
            padding: "12px 14px",
            minHeight: 280,
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
                padding: 8,
            }}
        >
            {children}
        </div>
    </div>
);

const EmptyChartMessage: React.FC = () => (
    <div
        style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            opacity: 0.6,
        }}
    >
        Không có dữ liệu để vẽ.
    </div>
);

export default NodeDetailPage;
