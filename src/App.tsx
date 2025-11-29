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

const client = generateClient();
const LOCAL_STORAGE_KEY = "wildfire_dashboard_nodes";

const App: React.FC = () => {
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

  // Hàm ghi localStorage
  const saveToLocalStorage = (arr: number[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(arr));
  };

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
      saveToLocalStorage(updated);
      return updated;
    });
  };

  // ============================
  // Handle Remove Node
  // ============================
  const handleRemoveNode = (devAddr: number) => {
    setDevAddrs((prev) => {
      const updated = prev.filter((id) => id !== devAddr);
      saveToLocalStorage(updated);
      return updated;
    });

    // xoá data map (không bắt buộc)
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

          setSensorDataMap((prev) => ({
            ...prev,
            [addr]: newData,
          }));
          setSensorLoadedMap((prev) => ({
            ...prev,
            [addr]: true,
          }));
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

      // reset localStorage về mặc định
      saveToLocalStorage([1, 2]);
      setDevAddrs([1, 2]);
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
    <Dashboard
      user={user as UserInfo}
      nodes={nodes}
      onLogout={handleLogout}
      onAddNode={handleAddNode}
      onRemoveNode={handleRemoveNode}
    />
  );
};

export default App;
