import React from "react";
import { useTranslation } from "react-i18next";
import type { DashboardNode } from "../Dashboard";
import NodeCard from "../node/NodeCard";

interface Props {
  nodes: DashboardNode[];
  totalNodes: number;
  darkMode: boolean;
  onOpenNodeDetail?: (devAddr: number) => void;
  onRequestDelete: (devAddr: number) => void;
}

const DashboardNodeGrid: React.FC<Props> = ({
  nodes,
  totalNodes,
  darkMode,
  onOpenNodeDetail,
  onRequestDelete,
}) => {
  const { t } = useTranslation();
  const cardBorder = darkMode ? "#1f2937" : "#e5e7eb";
  const subtitleColor = darkMode ? "rgba(148,163,184,0.75)" : "#6b7280";

  return (
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
                color: subtitleColor,
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
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
                onRemove={(devAddr) => onRequestDelete(devAddr)}
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
              color: subtitleColor,
            }}
          >
            {t("dashboard.nodes.empty")}
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardNodeGrid;
