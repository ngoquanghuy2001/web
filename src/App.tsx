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

const client = generateClient();

const LOCAL_STORAGE_KEY = "wildfire_dashboard_nodes";
const HISTORY_STORAGE_KEY = "wildfire_history";

const App: React.FC = () => {
  const navigate = useNavigate();
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    } catch { }
    return [1, 2]; // mặc định
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

  // Dùng history để fill data cho NodeCard nếu chưa có gói tin mới
  useEffect(() => {
    // fill sensorDataMap
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

    // fill sensorLoadedMap
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

  // ============================
  // Handle Add Node
  // ============================
  const handleAddNode = (devAddr: number) => {
    if (!Number.isInteger(devAddr) || devAddr <= 0) {
      alert("DevAddr phải là số nguyên dương.");
      return;
    }

    setDevAddrs((prev) => {
      if (prev.includes(devAddr)) {
        alert(`DevAddr ${devAddr} đã tồn tại trong danh sách.`);
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
    setDevAddrs((prev) => {
      const updated = prev.filter((id) => id !== devAddr);
      saveDevAddrsToLocalStorage(updated);
      return updated;
    });

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
        setErrorMsg(null);

        const token = await getIdToken();
        const info = await getCurrentUserInfo();

        setJwt(token);
        setUser(info);

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
          await loginWithHostedUI();
        } else {
          setErrorMsg("Không thể lấy token từ Cognito.");
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

          setSensorDataMap((prev) => ({
            ...prev,
            [addr]: newData,
          }));
          setSensorLoadedMap((prev) => ({
            ...prev,
            [addr]: true,
          }));

          // Lưu history 20 bản mới nhất
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

  if (loading && !jwt) {
    return <div style={{ padding: 16 }}>Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!jwt) {
    return (
      <div style={{ padding: 16 }}>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        <p>Bạn chưa đăng nhập.</p>
        <button onClick={() => void loginWithHostedUI()}>
          Đăng nhập với Cognito
        </button>
      </div>
    );
  }

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
          />
        }
      />
    </Routes>
  );
};

export default App;
