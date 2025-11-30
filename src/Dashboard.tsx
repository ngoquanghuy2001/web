import React, { useEffect, useState } from "react";
import { SensorData } from "./api/appsyncClient";
import { useTranslation } from "react-i18next";

import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardSummary from "./dashboard/DashboardSummary";
import DashboardNodeGrid from "./dashboard/DashboardNodeGrid";
import AddNodeModal from "./dashboard/AddNodeModal";
import DeleteNodeModal from "./dashboard/DeleteNodeModal";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

export interface DashboardNode {
  devAddr: number;
  sensorData: SensorData | null;
  sensorLoaded: boolean;
}

type NodeLocation = {
  lat: number;
  lng: number;
};

interface DashboardProps {
  user: UserInfo;
  nodes: DashboardNode[];
  onLogout?: () => void;
  onAddNode?: (devAddr: number) => void;
  onRemoveNode?: (devAddr: number) => void;
  onOpenNodeDetail?: (devAddr: number) => void;

  darkMode?: boolean;
  onToggleDarkMode?: () => void;

  nodeLocations: Record<number, NodeLocation>;
  onUpdateNodeLocation: (devAddr: number, loc: NodeLocation) => void;
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
  nodeLocations,
  onUpdateNodeLocation,
}) => {
  const { t } = useTranslation();

  const gmail = user.attributes.email ?? t("dashboard.noEmail");
  const [now, setNow] = useState(Date.now());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(id);
  }, []);

  const isNodeActive = (node: DashboardNode) => {
    const ts = node.sensorData?.timestamp;
    if (!ts) return false;
    const ms = new Date(ts).getTime();
    if (Number.isNaN(ms)) return false;
    return now - ms <= 60_000; // 60s gần nhất
  };

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

  const bgRoot = darkMode ? "#020617" : "#f3f4f6";
  const textColor = darkMode ? "#e5e7eb" : "#0f172a";

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
      <DashboardHeader
        user={user}
        gmail={gmail}
        darkMode={darkMode}
        onLogout={onLogout}
        onToggleDarkMode={onToggleDarkMode}
      />

      <main
        style={{
          padding: "24px 32px 40px",
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Tiêu đề + nút Add node */}
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
                color: darkMode
                  ? "rgba(148,163,184,0.75)"
                  : "#6b7280",
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
              onClick={() => setIsAddModalOpen(true)}
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

        <DashboardSummary
          darkMode={darkMode}
          totalNodes={totalNodes}
          activeNodes={activeNodes}
          inactiveNodes={inactiveNodes}
          lastUpdate={lastUpdate}
        />

        <DashboardNodeGrid
          nodes={nodes}
          totalNodes={totalNodes}
          darkMode={darkMode}
          onOpenNodeDetail={onOpenNodeDetail}
          onRequestDelete={(devAddr) => setDeleteTarget(devAddr)}
        />
      </main>

      <AddNodeModal
        isOpen={isAddModalOpen}
        darkMode={darkMode}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitDevAddr={(value) => {
          onAddNode?.(value);
          setIsAddModalOpen(false);
        }}
      />

      <DeleteNodeModal
        devAddr={deleteTarget}
        darkMode={darkMode}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={(addr) => {
          if (addr != null) onRemoveNode?.(addr);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
