import React, { useState, useEffect } from "react";
import { SensorData } from "./api/appsyncClient";
import NodeCard from "./node/NodeCard";
import { useTranslation } from "react-i18next"; // 🔹 thêm

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

  // NEW: theme
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  nodes,
  onLogout,
  onAddNode,
  onRemoveNode,
  onOpenNodeDetail,
  darkMode = true,
  onToggleDarkMode,
}) => {
  const { t, i18n } = useTranslation(); // 🔹 i18n
  const gmail = user.attributes.email ?? t("dashboard.noEmail");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devAddrInput, setDevAddrInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

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
      setError(t("dashboard.addNode.invalidDevAddr")); // 🔹 i18n
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
    if (!timestamps.length) return t("dashboard.summary.lastUpdate.noData");
    return timestamps.sort().reverse()[0];
  })();

  const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

  // ============================
  // Theme color helpers
  // ============================
  const bgRoot = darkMode ? "#020617" : "#f3f4f6";
  const textColor = darkMode ? "#e5e7eb" : "#0f172a";
  const headerBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const headerBg = darkMode ? "rgba(2,6,23,0.96)" : "rgba(255,255,255,0.94)";
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const popupBg = darkMode ? "#020617" : "#ffffff";

  const summaryTextSub = darkMode ? "rgba(148,163,184,0.75)" : "#6b7280";

  const toggleKnobTransform = darkMode ? "translateX(18px)" : "translateX(0px)";
  const toggleBg = darkMode ? "#22c55e" : "#9ca3af";

  // ============================
  // Language switcher
  // ============================
  const currentLang = (i18n.language || "vi").split("-")[0] as "vi" | "en";

  const handleChangeLanguage = (lng: "vi" | "en") => {
    i18n.changeLanguage(lng);
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
      {/* HEADER / TOP BAR */}
      <header
        style={{
          height: 64,
          borderBottom: `1px solid ${headerBorder}`,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: headerBg,
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
              background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(56,189,248,0.9), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(56,189,248,0.9), #e5f2ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: darkMode ? "#0b1120" : "#0f172a",
              boxShadow: "0 0 0 1px rgba(15,23,42,0.2)",
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
              {t("dashboard.header.title")}
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("dashboard.header.subtitle")}
            </div>
          </div>
        </div>

        {/* User + Logout + Avatar menu */}
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
              {user.username || t("dashboard.userDefault")}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{gmail}</div>
          </div>

          {/* Avatar (bấm để mở menu) */}
          <button
            type="button"
            onClick={() => setIsAvatarMenuOpen((v) => !v)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: darkMode
                ? "radial-gradient(circle at 20% 0, rgba(96,165,250,0.7), rgba(15,23,42,1))"
                : "radial-gradient(circle at 20% 0, rgba(59,130,246,0.7), #e5f2ff)",
              border: `1px solid ${headerBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              color: darkMode ? "#e5e7eb" : "#0f172a",
            }}
          >
            {avatarChar}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: `1px solid ${darkMode ? "#334155" : "#cbd5f5"}`,
                background: darkMode
                  ? "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.4))"
                  : "linear-gradient(135deg, #ffffff, #e5e7eb)",
                color: textColor,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {t("dashboard.logout")}
            </button>
          )}

          {/* MENU dưới avatar */}
          {isAvatarMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: 44,
                right: 0,
                width: 240,
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
                {t("dashboard.settings.title")}
              </div>

              {/* 🔹 Language switcher – nằm trên Dark mode */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 10,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>
                  {t("dashboard.settings.language")}
                </span>
                <div
                  style={{
                    display: "inline-flex",
                    gap: 6,
                  }}
                >
                  {(["vi", "en"] as const).map((lng) => {
                    const isActive = currentLang === lng;
                    return (
                      <button
                        key={lng}
                        type="button"
                        onClick={() => handleChangeLanguage(lng)}
                        title={t(
                          lng === "vi"
                            ? "dashboard.settings.languageName.vi"
                            : "dashboard.settings.languageName.en"
                        )}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: isActive
                            ? "none"
                            : `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                          background: isActive
                            ? "linear-gradient(135deg,#38bdf8,#6366f1)"
                            : "transparent",
                          color: isActive ? "#f9fafb" : textColor,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        {lng.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dark mode toggle */}
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
                <span>{t("dashboard.settings.darkMode")}</span>
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
              {t("dashboard.main.title")}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: summaryTextSub,
                maxWidth: 420,
              }}
            >
              {t("dashboard.main.description")}
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
              {t("dashboard.actions.addNode")}
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
              border: `1px solid ${cardBorder}`,
              background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(56,189,248,0.15), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(59,130,246,0.2), #ffffff)",
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
              {t("dashboard.summary.totalNodes")}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{totalNodes}</div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: `1px solid ${cardBorder}`,
              background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(34,197,94,0.18), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(34,197,94,0.18), #ffffff)",
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
              {t("dashboard.summary.activeNodes")}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{activeNodes}</div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: `1px solid ${cardBorder}`,
              background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(148,163,184,0.18), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(148,163,184,0.18), #ffffff)",
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
              {t("dashboard.summary.inactiveNodes")}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{inactiveNodes}</div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: `1px solid ${cardBorder}`,
              background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(248,250,252,0.05), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(248,250,252,0.4), #ffffff)",
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
              {t("dashboard.summary.lastUpdate.label")}
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
              border: `1px solid ${cardBorder}`,
              background: darkMode
                ? "radial-gradient(circle at 0 0, rgba(148,163,184,0.16), rgba(15,23,42,1))"
                : "radial-gradient(circle at 0 0, rgba(148,163,184,0.12), #ffffff)",
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
                  {t("dashboard.nodes.title")}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: summaryTextSub,
                  }}
                >
                  {t("dashboard.nodes.subtitle", { count: totalNodes })}
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
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 13,
                  color: summaryTextSub,
                }}
              >
                {t("dashboard.nodes.empty")}
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
              backgroundColor: popupBg,
              borderRadius: 16,
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
              padding: 20,
              color: textColor,
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
              {t("dashboard.addNode.title")}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.75,
                marginBottom: 14,
              }}
            >
              {t("dashboard.addNode.description")}
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
                  {t("dashboard.addNode.label")}
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
                    border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                    backgroundColor: darkMode ? "#020617" : "#ffffff",
                    color: textColor,
                    fontSize: 13,
                    outline: "none",
                  }}
                  placeholder={t("dashboard.addNode.placeholder")}
                />
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#b91c1c",
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
                    border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                    background: "transparent",
                    color: textColor,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {t("dashboard.addNode.cancel")}
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
                  {t("dashboard.addNode.submit")}
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
              backgroundColor: popupBg,
              borderRadius: 16,
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
              padding: 20,
              color: textColor,
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
              {t("dashboard.deleteNode.title")}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 14,
              }}
            >
              {t("dashboard.deleteNode.description", {
                devAddr: deleteTarget,
              })}
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
                  border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`,
                  background: "transparent",
                  color: textColor,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {t("dashboard.deleteNode.cancel")}
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
                {t("dashboard.deleteNode.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
