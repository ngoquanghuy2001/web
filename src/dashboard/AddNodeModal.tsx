import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  darkMode: boolean;
  onClose: () => void;
  onSubmitDevAddr: (devAddr: number) => void;
}

const AddNodeModal: React.FC<Props> = ({
  isOpen,
  darkMode,
  onClose,
  onSubmitDevAddr,
}) => {
  const { t } = useTranslation();
  const [devAddrInput, setDevAddrInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const popupBg = darkMode ? "#020617" : "#ffffff";
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const textColor = darkMode ? "#e5e7eb" : "#0f172a";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(devAddrInput);
    if (!Number.isInteger(value) || value <= 0) {
      setError(t("dashboard.addNode.invalidDevAddr"));
      return;
    }
    onSubmitDevAddr(value);
    setDevAddrInput("");
    setError(null);
  };

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
      onClick={onClose}
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
                border: `1px solid ${
                  darkMode ? "#4b5563" : "#d1d5db"
                }`,
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
  );
};

export default AddNodeModal;
