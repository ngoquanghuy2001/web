import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  devAddr: number | null;
  darkMode: boolean;
  onCancel: () => void;
  onConfirm: (devAddr: number | null) => void;
}

const DeleteNodeModal: React.FC<Props> = ({
  devAddr,
  darkMode,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (devAddr === null) return null;

  const popupBg = darkMode ? "#020617" : "#ffffff";
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const textColor = darkMode ? "#e5e7eb" : "#0f172a";

  return (
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
      onClick={onCancel}
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
          {t("dashboard.deleteNode.description", { devAddr })}
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
            onClick={onCancel}
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              border: `1px solid ${
                darkMode ? "#4b5563" : "#d1d5db"
              }`,
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
            onClick={() => onConfirm(devAddr)}
            style={{
              padding: "7px 14px",
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
            {t("dashboard.deleteNode.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteNodeModal;
