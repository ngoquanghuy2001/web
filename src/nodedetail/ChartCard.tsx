import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  darkMode?: boolean;
}

const ChartCard: React.FC<Props> = ({
  title,
  children,
  darkMode = true,
}) => (
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
        border: `1px dashed ${
          darkMode
            ? "rgba(148,163,184,0.3)"
            : "rgba(148,163,184,0.5)"
        }`,
        padding: 8,
      }}
    >
      {children}
    </div>
  </div>
);

export default ChartCard;
