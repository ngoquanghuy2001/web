import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserInfo } from "../auth";

interface Props {
  devAddrNum: number;
  user: UserInfo;
  gmail: string;
  darkMode: boolean;
  onBack: () => void;
  onToggleDarkMode?: () => void;
  onReportIncident: () => void;
}

const NodeDetailHeader: React.FC<Props> = ({
  devAddrNum,
  user,
  gmail,
  darkMode,
  onBack,
  onToggleDarkMode,
  onReportIncident,
}) => {
  const { t, i18n } = useTranslation();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNodeActionsOpen, setIsNodeActionsOpen] = useState(false);

  const textColor = darkMode ? "#e5e7eb" : "#0f172a";
  const borderColor = darkMode ? "#1f2937" : "#e5e7eb";
  const headerBg = darkMode ? "rgba(2,6,23,0.96)" : "rgba(255,255,255,0.94)";
  const cardBorder = borderColor;
  const popupBg = darkMode ? "#020617" : "#ffffff";

  const toggleKnobTransform = darkMode ? "translateX(18px)" : "translateX(0px)";
  const toggleBg = darkMode ? "#22c55e" : "#9ca3af";

  const currentLang = (i18n.language || "vi").split("-")[0] as "vi" | "en";
  const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

  const handleChangeLanguage = (lng: "vi" | "en") => {
    i18n.changeLanguage(lng);
  };

  const handleReportFromMenu = () => {
    setIsNodeActionsOpen(false);
    onReportIncident();
  };

  return (
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
      {/* Trái: Back + title + menu node */}
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
          ← {t("nodeDetail.back")}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {t("nodeDetail.header.nodeTitle", { devAddr: devAddrNum })}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("nodeDetail.header.subtitle")}
            </div>
          </div>

          {/* Nút 3 chấm */}
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
            title={t("nodeDetail.nodeMenu.title")}
          >
            ⋮
          </button>

          {isNodeActionsOpen && (
            <div
              style={{
                position: "absolute",
                top: 44,
                left: 80,
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
                {t("nodeDetail.nodeMenu.header")}
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
                <span>{t("nodeDetail.nodeMenu.reportIncident")}</span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>⚠</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phải: user + avatar menu */}
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
            {user.username || t("nodeDetail.userDefault")}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{gmail}</div>
        </div>

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
              {t("nodeDetail.settings.header")}
            </div>

            {/* Language switcher */}
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
                          : `1px solid ${
                              darkMode ? "#4b5563" : "#d1d5db"
                            }`,
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

            {/* Darkmode toggle */}
            <button
              type="button"
              onClick={() => onToggleDarkMode?.()}
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
              <span>{t("nodeDetail.settings.darkMode")}</span>
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
  );
};

export default NodeDetailHeader;
