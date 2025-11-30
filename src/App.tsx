// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  loginWithHostedUI,
  getIdToken,
  getCurrentUserInfo,
  logout,
  UserInfo,
} from "./auth";
import Dashboard, { DashboardNode } from "./Dashboard";
import { SensorData } from "./api/appsyncClient";
import { generateClient } from "aws-amplify/api";
import { Routes, Route, useNavigate } from "react-router-dom";
import NodeDetailPage from "./node/NodeDetailPage";
import { useTranslation } from "react-i18next"; // 🔹 thêm

const client = generateClient();

// Lưu danh sách DevAddr
const LOCAL_STORAGE_KEY = "wildfire_dashboard_nodes";
// Lưu toàn bộ history theo dạng map { [devAddr]: SensorData[] }
const HISTORY_STORAGE_KEY = "wildfire_history";
// Lưu theme
const THEME_STORAGE_KEY = "wildfire_theme";
// Lưu vị trí bản đồ
const LOCATION_STORAGE_KEY = "wildfire_node_locations";

type NodeLocation = {
  lat: number;
  lng: number;
};

const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light") return false;
    if (saved === "dark") return true;
  } catch {
  }
  return true;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [nodeLocations, setNodeLocations] = useState<Record<number, NodeLocation>>({});

  const [sensorDataMap, setSensorDataMap] = useState<
    Record<number, SensorData | null>
  >({});
  const [sensorLoadedMap, setSensorLoadedMap] = useState<
    Record<number, boolean>
  >({});
  const [sensorHistoryMap, setSensorHistoryMap] = useState<
    Record<number, SensorData[]>
  >({});

  // ============================
  // Theme (Dark / Light)
  // ============================
  const [darkMode, setDarkMode] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
    } catch {
      // ignore
    }
    // set màu body cho đẹp
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = darkMode ? "#020617" : "#f3f4f6";
      document.body.style.color = darkMode ? "#e5e7eb" : "#0f172a";
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // ============================
  // Load danh sách devAddrs từ localStorage
  // ============================
  const [devAddrs, setDevAddrs] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.every((n) => Number.isInteger(n))) {
          return arr;
        }
      }
    } catch {
      // ignore parse error, dùng mặc định
    }
    return [1, 2]; // mặc định nếu chưa có gì
  });

  const saveDevAddrsToLocalStorage = (arr: number[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
  };

  // ============================
  // Load history từ localStorage lúc mở web
  // ============================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const clean: Record<number, SensorData[]> = {};

      for (const [key, value] of Object.entries(parsed)) {
        const numKey = Number(key);
        if (!Number.isInteger(numKey)) continue;
        if (!Array.isArray(value)) continue;

        const arr = (value as any[]).filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof (item as any).DevAddr === "number"
        ) as SensorData[];

        if (arr.length > 0) {
          // chỉ giữ tối đa 20 record / node
          clean[numKey] = arr.slice(0, 20);
        }
      }

      setSensorHistoryMap(clean);
    } catch (e) {
      console.error("Không đọc được history từ localStorage", e);
    }
  }, []);

  // Mỗi khi history thay đổi -> lưu lại localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(sensorHistoryMap)
      );
    } catch (e) {
      console.error("Không lưu được history vào localStorage", e);
    }
  }, [sensorHistoryMap]);

  // Dùng history để fill data cho NodeCard nếu vừa reload mà chưa có gói tin mới
  useEffect(() => {
    // fill sensorDataMap từ record mới nhất trong history
    setSensorDataMap((prev) => {
      const next = { ...prev };
      let changed = false;

      devAddrs.forEach((addr) => {
        if (!next[addr]) {
          const history = sensorHistoryMap[addr];
          if (history && history.length > 0) {
            next[addr] = history[0]; // bản mới nhất
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });

    // fill sensorLoadedMap để UI biết là node này đã có dữ liệu
    setSensorLoadedMap((prev) => {
      const next = { ...prev };
      let changed = false;

      devAddrs.forEach((addr) => {
        if (!next[addr]) {
          const history = sensorHistoryMap[addr];
          if (history && history.length > 0) {
            next[addr] = true;
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [devAddrs, sensorHistoryMap]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const clean: Record<number, NodeLocation> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const devAddr = Number(key);
        if (!Number.isInteger(devAddr)) continue;
        if (!value || typeof value !== "object") continue;

        const lat = Number((value as any).lat);
        const lng = Number((value as any).lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          clean[devAddr] = { lat, lng };
        }
      }

      setNodeLocations(clean);
    } catch (e) {
      console.error("Không đọc được node locations từ localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nodeLocations));
    } catch (e) {
      console.error("Không lưu được node locations vào localStorage", e);
    }
  }, [nodeLocations]);

  const handleUpdateNodeLocation = (devAddr: number, loc: NodeLocation) => {
    setNodeLocations((prev) => ({
      ...prev,
      [devAddr]: loc,
    }));
  };


  // ============================
  // Handle Add Node
  // ============================
  const handleAddNode = (devAddr: number) => {
    if (!Number.isInteger(devAddr) || devAddr <= 0) {
      alert(t("dashboard.addNode.invalidDevAddr")); // 🔹 dùng i18n
      return;
    }

    setDevAddrs((prev) => {
      if (prev.includes(devAddr)) {
        alert(t("dashboard.addNode.duplicateDevAddr", { devAddr })); // 🔹
        return prev;
      }
      const updated = [...prev, devAddr];
      saveDevAddrsToLocalStorage(updated);
      return updated;
    });
  };

  // ============================
  // Handle Remove Node
  // ============================
  const handleRemoveNode = (devAddr: number) => {
    // Xoá DevAddr khỏi danh sách
    setDevAddrs((prev) => {
      const updated = prev.filter((id) => id !== devAddr);
      saveDevAddrsToLocalStorage(updated);
      return updated;
    });

    // Xoá state realtime
    setSensorDataMap((prev) => {
      const next = { ...prev };
      delete next[devAddr];
      return next;
    });
    setSensorLoadedMap((prev) => {
      const next = { ...prev };
      delete next[devAddr];
      return next;
    });
    // Xoá luôn history trong RAM (localStorage sẽ được sync qua effect phía trên)
    setSensorHistoryMap((prev) => {
      const next = { ...prev };
      delete next[devAddr];
      return next;
    });
  };

  // ============================
  // Auth
  // ============================
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        setErrorKey(null);

        const token = await getIdToken();
        const info = await getCurrentUserInfo();

        setJwt(token);
        setUser(info);

        // remove query params (code, state...) khỏi URL
        const url = new URL(window.location.href);
        if (url.search) {
          url.search = "";
          window.history.replaceState({}, document.title, url.toString());
        }
      } catch (err: any) {
        console.error("Auth error:", err);

        const url = new URL(window.location.href);
        const hasCode = url.searchParams.has("code");
        const hasError = url.searchParams.has("error");

        if (!hasCode && !hasError) {
          // chưa login -> redirect sang Cognito
          await loginWithHostedUI();
        } else {
          setErrorKey("app.errors.cannotGetToken"); // 🔹 lưu key i18n
        }
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  // ============================
  // Subscription AppSync cho mỗi DevAddr
  // ============================
  useEffect(() => {
    if (!jwt) return;
    if (devAddrs.length === 0) return;

    console.log("Đăng ký subscription:", devAddrs);

    const subscriptions = devAddrs.map((addr) =>
      (client.graphql({
        query: /* GraphQL */ `
          subscription OnNodeDataAdded($DevAddr: Int!) {
            onNodeDataAdded(DevAddr: $DevAddr) {
              DevAddr
              co2
              battery
              fire
              humidity
              maxT
              temperature
              timestamp
            }
          }
        `,
        variables: { DevAddr: addr },
      }) as any).subscribe({
        next: (response: { data?: { onNodeDataAdded?: SensorData } }) => {
          const newData = response?.data?.onNodeDataAdded;
          if (!newData) return;

          console.log("Dữ liệu mới DevAddr", addr, newData);

          // Cập nhật realtime cho Dashboard
          setSensorDataMap((prev) => ({
            ...prev,
            [addr]: newData,
          }));
          setSensorLoadedMap((prev) => ({
            ...prev,
            [addr]: true,
          }));

          // Lưu history (20 bản mới nhất) để dùng cho bảng + biểu đồ + localStorage
          setSensorHistoryMap((prev) => {
            const old = prev[addr] ?? [];
            const updated = [newData, ...old].slice(0, 20);
            return { ...prev, [addr]: updated };
          });
        },

        error: (error: unknown) => {
          console.error("Lỗi subscription cho DevAddr", addr, error);
        },
      })
    );

    return () => {
      subscriptions.forEach((sub) => sub?.unsubscribe?.());
    };
  }, [jwt, devAddrs]);

  // ============================
  // Logout
  // ============================
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setJwt(null);
      setUser(null);
      setSensorDataMap({});
      setSensorLoadedMap({});
      setSensorHistoryMap({});
      saveDevAddrsToLocalStorage([1, 2]);
      setDevAddrs([1, 2]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  // ============================
  // Render
  // ============================
  if (loading && !jwt) {
    return (
      <div style={{ padding: 16 }}>
        {t("app.loading.checkSession") /* 🔹 i18n */}
      </div>
    );
  }

  if (!jwt) {
    return (
      <div style={{ padding: 16 }}>
        {errorKey && (
          <p style={{ color: "red" }}>
            {t(errorKey) /* 🔹 hiển thị message theo key */}
          </p>
        )}
        <p>{t("app.notLoggedIn")}</p>
        <button onClick={() => void loginWithHostedUI()}>
          {t("app.loginButton")}
        </button>
      </div>
    );
  }

  // Chuẩn hoá dữ liệu cho Dashboard
  const nodes: DashboardNode[] = devAddrs.map((addr) => ({
    devAddr: addr,
    sensorData: sensorDataMap[addr] ?? null,
    sensorLoaded: !!sensorLoadedMap[addr],
  }));

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            user={user as UserInfo}
            nodes={nodes}
            onLogout={handleLogout}
            onAddNode={handleAddNode}
            onRemoveNode={handleRemoveNode}
            onOpenNodeDetail={(devAddr) => navigate(`/node/${devAddr}`)}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            nodeLocations={nodeLocations}
            onUpdateNodeLocation={handleUpdateNodeLocation}
          />
        }
      />
      <Route
        path="/node/:devAddr"
        element={
          <NodeDetailPage
            user={user as UserInfo}
            sensorHistoryMap={sensorHistoryMap}
            onBack={() => navigate("/")}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        }
      />
    </Routes>
  );
};

export default App;
