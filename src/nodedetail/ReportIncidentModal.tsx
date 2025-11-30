import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  reportSent: boolean;
  devAddrNum: number;
  darkMode: boolean;
  onClose: () => void;
  onSend: () => void;
}

const ReportIncidentModal: React.FC<Props> = ({
  isOpen,
  reportSent,
  devAddrNum,
  darkMode,
  onClose,
  onSend,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

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
        zIndex: 60,
      }}
      onClick={onClose}
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
              {t("nodeDetail.report.title", { devAddr: devAddrNum })}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 16,
              }}
            >
              {t("nodeDetail.report.confirmText", { devAddr: devAddrNum })}
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
                onClick={onClose}
                style={{
                  padding: "8px 12px",
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
                {t("nodeDetail.report.no")}
              </button>
              <button
                type="button"
                onClick={onSend}
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
                {t("nodeDetail.report.yesSend")}
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
              {t("nodeDetail.report.sentTitle")}
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 16,
              }}
            >
              {t("nodeDetail.report.sentDescription", {
                devAddr: devAddrNum,
              })}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 14px",
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
                {t("nodeDetail.report.close")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportIncidentModal;
