import React from "react";
import { useTranslation } from "react-i18next";

const EmptyChartMessage: React.FC = () => {
  const { t } = useTranslation();
  return (
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
      {t("nodeDetail.charts.empty")}
    </div>
  );
};

export default EmptyChartMessage;
