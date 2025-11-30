import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserInfo } from "../Dashboard";

interface Props {
  user: UserInfo;
  gmail: string;
  darkMode: boolean;
  onLogout?: () => void;
  onToggleDarkMode?: () => void;
}

const DashboardHeader: React.FC<Props> = ({
  user,
  gmail,
  darkMode,
  onLogout,
  onToggleDarkMode,
}) => {
  const { t, i18n } = useTranslation();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  const textColor = darkMode ? "#e5e7eb" : "#0f172a";
  const headerBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const headerBg = darkMode ? "rgba(2,6,23,0.96)" : "rgba(255,255,255,0.94)";
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const popupBg = darkMode ? "#020617" : "#ffffff";

  const toggleKnobTransform = darkMode ? "translateX(18px)" : "translateX(0px)";
  const toggleBg = darkMode ? "#22c55e" : "#9ca3af";

  const currentLang = (i18n.language || "vi").split("-")[0] as "vi" | "en";
  const avatarChar = (user.username || gmail || "U").charAt(0).toUpperCase();

  const handleChangeLanguage = (lng: "vi" | "en") => {
    i18n.changeLanguage(lng);
  };

  return (
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
      {/* Logo + title */}
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

      {/* User info + avatar + menu */}
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

            {/* Dark mode toggle */}
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
                backgroundColor: darkMode
                  ? "rgba(15,23,42,0.7)"
                  : "#f3f4f6",
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
  );
};

export default DashboardHeader;
