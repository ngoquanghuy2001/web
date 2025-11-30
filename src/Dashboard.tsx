import React, { useEffect, useState } from "react";
import { SensorData } from "./api/appsyncClient";
import { useTranslation } from "react-i18next";

import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardSummary from "./dashboard/DashboardSummary";
import DashboardNodeGrid from "./dashboard/DashboardNodeGrid";
import AddNodeModal from "./dashboard/AddNodeModal";
import DeleteNodeModal from "./dashboard/DeleteNodeModal";
import NodeMapModal from "./map/NodeMapModal";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

export interface DashboardNode {
  devAddr: number;
  sensorData: SensorData | null;
  sensorLoaded: boolean;
}

export type NodeLocation = {
  lat: number;
  lng: number;
};

export interface DashboardProps {
  user: UserInfo;
  nodes: DashboardNode[];
  onLogout?: () => void;
  onAddNode?: (devAddr: number, location: NodeLocation | null) => void;
  onRemoveNode?: (devAddr: number) => void;
  onOpenNodeDetail?: (devAddr: number) => void;

  darkMode?: boolean;
  onToggleDarkMode?: () => void;

  nodeLocations: Record<number, NodeLocation>;
  onUpdateNodeLocation: (devAddr: number, loc: NodeLocation) => void;
}

type MapMode =
  | null
  | { type: "single"; devAddr: number }
  | { type: "all" };

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
  const [mapMode, setMapMode] = useState<MapMode>(null);

  // Cập nhật "now" để tính node hoạt động / offline
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(id);
  }, []);

  const isNodeActive = (node: DashboardNode) => {
    const ts = node.sensorData?.timestamp;
    if (!ts) return false;
    const ms = new Date(ts).getTime();
    if (Number.isNaN(ms)) return false;
    return now - ms <= 60_000;
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

  const handleAddNode = (devAddr: number, loc: NodeLocation | null) => {
    if (onAddNode) {
      onAddNode(devAddr, loc);
    }

    if (loc) {
      onUpdateNodeLocation(devAddr, loc);
    }
  };

  const handleConfirmDelete = (addr: number | null) => {
    if (addr != null && onRemoveNode) {
      onRemoveNode(addr);
    }
    setDeleteTarget(null);
  };

  const handleViewNodeLocation = (devAddr: number) => {
    setMapMode({ type: "single", devAddr });
  };

  const handleViewAllNodes = () => {
    setMapMode({ type: "all" });
  };

  const handleCloseMap = () => {
    setMapMode(null);
  };

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
      {/* HEADER */}
      <DashboardHeader
        user={user}
        gmail={gmail}
        darkMode={darkMode}
        onLogout={onLogout}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* MAIN */}
      <main
        style={{
          padding: "24px 32px 40px",
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Tiêu đề + nút Add node + View all on map */}
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
                color: darkMode ? "rgba(148,163,184,0.75)" : "#6b7280",
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
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {/* Nút xem toàn bộ node trên map */}
            <button
              type="button"
              onClick={handleViewAllNodes}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${darkMode ? "#334155" : "#cbd5f5"}`,
                background: "transparent",
                color: textColor,
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>📍</span>
              {t("dashboard.actions.viewAllNodes")}
            </button>

            {/* Nút thêm node */}
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

        {/* Summary cards */}
        <DashboardSummary
          darkMode={darkMode}
          totalNodes={totalNodes}
          activeNodes={activeNodes}
          inactiveNodes={inactiveNodes}
          lastUpdate={lastUpdate}
        />

        {/* Grid node */}
        <DashboardNodeGrid
          nodes={nodes}
          totalNodes={totalNodes}
          darkMode={darkMode}
          onOpenNodeDetail={onOpenNodeDetail}
          onRequestDelete={(devAddr) => setDeleteTarget(devAddr)}
          onViewLocation={handleViewNodeLocation}
        />
      </main>

      {/* POPUP thêm node */}
      <AddNodeModal
        isOpen={isAddModalOpen}
        darkMode={darkMode}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitDevAddr={(devAddr, loc) => {
          handleAddNode(devAddr, loc);
          setIsAddModalOpen(false);
        }}
      />

      {/* POPUP xoá node */}
      <DeleteNodeModal
        devAddr={deleteTarget}
        darkMode={darkMode}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* MAP MODAL */}
      <NodeMapModal
        isOpen={mapMode !== null}
        mode={mapMode}
        nodes={nodes}
        nodeLocations={nodeLocations}
        darkMode={darkMode}
        onClose={handleCloseMap}
        onUpdateNodeLocation={onUpdateNodeLocation}
      />
    </div>
  );
};

export default Dashboard;
