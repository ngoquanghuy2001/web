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

const client = generateClient();

const App: React.FC = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // map DevAddr -> sensorData / loaded
  const [sensorDataMap, setSensorDataMap] = useState<
    Record<number, SensorData | null>
  >({});
  const [sensorLoadedMap, setSensorLoadedMap] = useState<
    Record<number, boolean>
  >({});

  // 🔹 danh sách DevAddr đang theo dõi (ban đầu 1,2,3)
  const [devAddrs, setDevAddrs] = useState<number[]>([1, 2, 3]);

  // 🔹 người dùng bấm nút + để thêm DevAddr mới
  const handleAddNode = () => {
    const input = window.prompt("Nhập DevAddr (số nguyên dương):");
    if (!input) return;

    const value = Number(input);
    if (!Number.isInteger(value) || value <= 0) {
      window.alert("DevAddr phải là số nguyên dương.");
      return;
    }

    setDevAddrs((prev) => {
      if (prev.includes(value)) {
        window.alert(`DevAddr ${value} đã tồn tại trong danh sách.`);
        return prev;
      }
      return [...prev, value];
    });
  };

  // Auth
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
          setErrorMsg(
            "Không thể lấy token từ Cognito. Vui lòng kiểm tra cấu hình App client / /oauth2/token."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  // 🔹 Subscriptions cho nhiều DevAddr (danh sách động)
  useEffect(() => {
    if (!jwt) return;
    if (devAddrs.length === 0) return;

    console.log("Đăng ký subscription onNodeDataAdded cho DevAddr:", devAddrs);

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
        },
        error: (error: unknown) => {
          console.error("Lỗi subscription cho DevAddr", addr, error);
        },
      })
    );

    return () => {
      subscriptions.forEach((sub) => {
        if (sub && typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
        }
      });
    };
  }, [jwt, devAddrs]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setJwt(null);
      setUser(null);
      setSensorDataMap({});
      setSensorLoadedMap({});
      setDevAddrs([1, 2, 3]); // reset về mặc định nếu muốn
    }
  };

  if (loading && !jwt) {
    return <div style={{ padding: 16 }}>Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!jwt) {
    return (
      <div style={{ padding: 16 }}>
        {errorMsg && (
          <p style={{ color: "red", marginBottom: 12 }}>Lỗi: {errorMsg}</p>
        )}
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
      onAddNode={handleAddNode} // 🔹 truyền callback xuống dashboard
    />
  );
};

export default App;
