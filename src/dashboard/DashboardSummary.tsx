import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  darkMode: boolean;
  totalNodes: number;
  activeNodes: number;
  inactiveNodes: number;
  lastUpdate: string;
}

const DashboardSummary: React.FC<Props> = ({
  darkMode,
  totalNodes,
  activeNodes,
  inactiveNodes,
  lastUpdate,
}) => {
  const { t } = useTranslation();
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}
    >
      {/* Total nodes */}
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

      {/* Active */}
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

      {/* Inactive */}
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

      {/* Last update */}
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
  );
};

export default DashboardSummary;
