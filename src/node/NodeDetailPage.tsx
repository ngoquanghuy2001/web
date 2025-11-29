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
    darkMode?: boolean;
    onToggleDarkMode?: () => void;
}

const HISTORY_STORAGE_KEY = "wildfire_history";

const NodeDetailPage: React.FC<NodeDetailPageProps> = ({
    user,
    sensorHistoryMap,
    onBack,
    darkMode = true,
    onToggleDarkMode,
}) => {
    const { devAddr } = useParams<{ devAddr: string }>();
    const devAddrNum = Number(devAddr);

    const [history, setHistory] = useState<SensorData[]>([]);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

    // Popup báo cáo sự cố
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportSent, setReportSent] = useState(false);

    // Menu hành động của node (nút 3 chấm)
    const [isNodeActionsOpen, setIsNodeActionsOpen] = useState(false);

    // Đồng bộ history từ state App hoặc localStorage
    useEffect(() => {
        const fromMap = sensorHistoryMap[devAddrNum];
        if (fromMap && fromMap.length > 0) {
            setHistory(fromMap);
            return;
        }

        try {
            const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw) as Record<string, SensorData[]>;
            const arr =
                parsed[devAddrNum] || parsed[String(devAddrNum)];

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

    // Dữ liệu cho biểu đồ
    const chartData = useMemo(
        () =>
            [...history]
                .slice(0, 20)
                .reverse()
                .map((d, index) => {
                    let label = d.timestamp ?? `#${index + 1}`;
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

    // Logic WARNING (giống NodeCard)
    const isWarning =
        !!latest &&
        (latest.fire === true ||
            (latest.temperature != null && latest.temperature >= 40) ||
            (latest.co2 != null && latest.co2 >= 2000));

    // Theme
    const bgRoot = darkMode ? "#020617" : "#f3f4f6";
    const textColor = darkMode ? "#e5e7eb" : "#0f172a";
    const borderColor = darkMode ? "#1f2937" : "#e5e7eb";
    const headerBg = darkMode ? "rgba(2,6,23,0.96)" : "rgba(255,255,255,0.94)";
    const statCardBg = darkMode
        ? "radial-gradient(circle at 0 0, rgba(56,189,248,0.12), rgba(15,23,42,1))"
        : "radial-gradient(circle at 0 0, rgba(56,189,248,0.16), #ffffff)";
    const sectionBg = darkMode
        ? "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))"
        : "radial-gradient(circle at 0 0, rgba(148,163,184,0.12), #ffffff)";
    const popupBg = darkMode ? "#020617" : "#ffffff";
    const cardBorder = borderColor;
    const summaryTextSub = darkMode ? "rgba(148,163,184,0.75)" : "#6b7280";

    const toggleKnobTransform = darkMode ? "translateX(18px)" : "translateX(0px)";
    const toggleBg = darkMode ? "#22c55e" : "#9ca3af";

    // Mở popup báo cáo
    const openReportModal = () => {
        setReportSent(false);
        setIsReportModalOpen(true);
    };

    const closeReportModal = () => {
        setIsReportModalOpen(false);
    };

    // Khi chọn "Báo cáo sự cố" trong menu 3 chấm
    const handleReportFromMenu = () => {
        setIsNodeActionsOpen(false);
        openReportModal();
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: bgRoot,
                color: textColor,
                fontFamily:
                    '"Inter", system-ui, -apple-system, BlinkMacSystemFont,"Segoe UI", sans-serif',
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* HEADER */}
            <header
                style={{
                    height: 64,
                    borderBottom: `1px solid ${borderColor}`,
                    padding: "0 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: headerBg,
                    backdropFilter: "blur(10px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 30,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        position: "relative",
                    }}
                >
                    <button
                        onClick={onBack}
                        style={{
                            borderRadius: 999,
                            border: `1px solid ${darkMode ? "#334155" : "#d1d5db"}`,
                            background: "transparent",
                            color: textColor,
                            padding: "6px 10px",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        ← Back
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                        {/* Nút 3 chấm: mở menu lựa chọn */}
                        <button
                            type="button"
                            onClick={() => setIsNodeActionsOpen((v) => !v)}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                                background: "transparent",
                                color: textColor,
                                cursor: "pointer",
                                fontSize: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingBottom: 2,
                            }}
                            title="Tuỳ chọn"
                        >
                            ⋮
                        </button>

                        {/* Menu lựa chọn của node (hiện khi ấn 3 chấm) */}
                        {isNodeActionsOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 44,
                                    left: 80, // lệch sang phải 1 chút cho đẹp
                                    minWidth: 200,
                                    borderRadius: 14,
                                    border: `1px solid ${cardBorder}`,
                                    backgroundColor: popupBg,
                                    boxShadow: "0 18px 30px rgba(15,23,42,0.45)",
                                    padding: 8,
                                    zIndex: 40,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.7,
                                        marginBottom: 6,
                                    }}
                                >
                                    Hành động với node
                                </div>

                                <button
                                    type="button"
                                    onClick={handleReportFromMenu}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "6px 8px",
                                        borderRadius: 10,
                                        border: "none",
                                        background: "transparent",
                                        color: textColor,
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    <span>Báo cáo sự cố</span>
                                    <span style={{ fontSize: 12, opacity: 0.75 }}>⚠</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        position: "relative",
                    }}
                >
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {user.username || "User"}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>{gmail}</div>
                    </div>

                    {/* Avatar + menu settings (Darkmode) */}
                    <button
                        type="button"
                        onClick={() => setIsAvatarMenuOpen((v) => !v)}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "999px",
                            border: `1px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 600,
                            background: darkMode
                                ? "radial-gradient(circle at 30% 0%, #38bdf8, #0f172a 70%)"
                                : "radial-gradient(circle at 30% 0%, #38bdf8, #e5f2ff 70%)",
                            color: darkMode ? "#e5e7eb" : "#0f172a",
                            cursor: "pointer",
                        }}
                    >
                        {avatarChar}
                    </button>

                    {isAvatarMenuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: 44,
                                right: 0,
                                width: 220,
                                borderRadius: 16,
                                border: `1px solid ${cardBorder}`,
                                backgroundColor: popupBg,
                                boxShadow: "0 18px 30px rgba(15,23,42,0.4)",
                                padding: 10,
                                zIndex: 50,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    opacity: 0.7,
                                    marginBottom: 8,
                                }}
                            >
                                Settings
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    onToggleDarkMode?.();
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    padding: "6px 8px",
                                    borderRadius: 10,
                                    border: "none",
                                    backgroundColor: darkMode ? "rgba(15,23,42,0.7)" : "#f3f4f6",
                                    cursor: "pointer",
                                    color: textColor,
                                    fontSize: 13,
                                }}
                            >
                                <span>Dark mode</span>
                                <span
                                    style={{
                                        width: 34,
                                        height: 18,
                                        borderRadius: 999,
                                        backgroundColor: toggleBg,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: 2,
                                        boxSizing: "border-box",
                                        transition: "background-color 0.2s ease",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: 999,
                                            backgroundColor: "#f9fafb",
                                            transform: toggleKnobTransform,
                                            transition: "transform 0.2s ease",
                                        }}
                                    />
                                </span>
                            </button>
                        </div>
                    )}
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
                {/* Summary + nút Báo cáo nếu WARNING */}
                <section
                    style={{
                        marginBottom: 24,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
                            Node {devAddrNum} details
                        </h1>
                        <p style={{ fontSize: 13, color: summaryTextSub }}>
                            Hiển thị tối đa 20 gói dữ liệu cảm biến gần nhất cho node này.
                        </p>
                    </div>

                    {/* Nút báo cáo sự cố: chỉ hiện khi WARNING */}
                    {isWarning && (
                        <button
                            type="button"
                            onClick={openReportModal}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 999,
                                border: "none",
                                background:
                                    "linear-gradient(135deg, #ef4444, #b91c1c)", // đỏ cảnh báo
                                color: "#f9fafb",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 8px 20px rgba(239,68,68,0.35)",
                            }}
                        >
                            Báo cáo sự cố
                        </button>
                    )}
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
                                border: `1px solid ${borderColor}`,
                                background: statCardBg,
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
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 24,
                        marginBottom: 32,
                    }}
                >
                    {/* Temperature */}
                    <ChartCard title="Air temperature (°C)" darkMode={darkMode}>
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={darkMode ? "#2f3c4e" : "#cbd5e1"}
                                    />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
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
                    <ChartCard title="Air humidity (%)" darkMode={darkMode}>
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={darkMode ? "#2f3c4e" : "#cbd5e1"}
                                    />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
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
                    <ChartCard title="Radiant temperature (MaxT, °C)" darkMode={darkMode}>
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={darkMode ? "#2f3c4e" : "#cbd5e1"}
                                    />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
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
                    <ChartCard title="CO₂ concentration (ppm)" darkMode={darkMode}>
                        {chartData.length === 0 ? (
                            <EmptyChartMessage />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={darkMode ? "#2f3c4e" : "#cbd5e1"}
                                    />
                                    <XAxis
                                        dataKey="timestamp"
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 10,
                                            fill: darkMode ? "#9ca3af" : "#4b5563",
                                        }}
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

                {/* Bảng dữ liệu */}
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
                            border: `1px solid ${borderColor}`,
                            background: sectionBg,
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
                                        backgroundColor: darkMode
                                            ? "rgba(15,23,42,0.9)"
                                            : "rgba(226,232,240,0.9)",
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
                                                borderBottom: `1px solid ${borderColor}`,
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
                                            borderBottom: `1px solid ${darkMode ? "#111827" : "#e5e7eb"
                                                }`,
                                            backgroundColor: darkMode
                                                ? idx % 2 === 0
                                                    ? "rgba(15,23,42,0.85)"
                                                    : "transparent"
                                                : idx % 2 === 0
                                                    ? "rgba(249,250,251,1)"
                                                    : "rgba(255,255,255,1)",
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
                                                color: d.fire ? "#b91c1c" : "#16a34a",
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

            {/* POPUP báo cáo sự cố */}
            {isReportModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15,23,42,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 60,
                    }}
                    onClick={closeReportModal}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 380,
                            backgroundColor: popupBg,
                            borderRadius: 16,
                            border: `1px solid ${cardBorder}`,
                            boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
                            padding: 20,
                            color: textColor,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!reportSent ? (
                            <>
                                <h2
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        marginBottom: 10,
                                    }}
                                >
                                    Báo cáo sự cố node {devAddrNum}
                                </h2>
                                <p
                                    style={{
                                        fontSize: 13,
                                        opacity: 0.8,
                                        marginBottom: 16,
                                    }}
                                >
                                    Bạn có chắc chắn muốn gửi báo cáo sự cố cho node này không?
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 8,
                                        marginTop: 8,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={closeReportModal}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 999,
                                            border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"
                                                }`,
                                            background: "transparent",
                                            color: textColor,
                                            fontSize: 12,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Không
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReportSent(true)}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: 999,
                                            border: "none",
                                            background:
                                                "linear-gradient(135deg,#ef4444,#b91c1c)",
                                            color: "#f9fafb",
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Có, gửi báo cáo
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        marginBottom: 10,
                                    }}
                                >
                                    Đã gửi báo cáo
                                </h2>
                                <p
                                    style={{
                                        fontSize: 13,
                                        opacity: 0.8,
                                        marginBottom: 16,
                                    }}
                                >
                                    Báo cáo sự cố cho node {devAddrNum} đã được gửi. Đội vận hành
                                    sẽ xử lý trong thời gian sớm nhất.
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={closeReportModal}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: 999,
                                            border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"
                                                }`,
                                            background: "transparent",
                                            color: textColor,
                                            fontSize: 12,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/** Card khung cho mỗi biểu đồ */
const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
    darkMode?: boolean;
}> = ({ title, children, darkMode = true }) => (
    <div
        style={{
            borderRadius: 18,
            border: `1px solid ${darkMode ? "#1f2937" : "#e5e7eb"}`,
            background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(148,163,184,0.12), #ffffff)",
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
                border: `1px dashed ${darkMode ? "rgba(148,163,184,0.3)" : "rgba(148,163,184,0.5)"
                    }`,
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
