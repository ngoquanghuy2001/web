// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  loginWithHostedUI,
  getIdToken,
  getCurrentUserInfo,
  logout,
  UserInfo,
} from "./auth";
import Dashboard from "./Dashboard";
import { SensorData } from "./api/appsyncClient";
import { generateClient } from "aws-amplify/api";

const client = generateClient();

const App: React.FC = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [sensorLoaded, setSensorLoaded] = useState(false);

  // DevAddr đang nghe realtime (tạm fix cứng, sau này cho nhập từ UI)
  const devAddr = 3;

  // Bước 1: kiểm tra session Cognito
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const token = await getIdToken();
        const info = await getCurrentUserInfo();

        setJwt(token);
        setUser(info);

        // Xoá ?code=&state= khỏi URL cho đẹp
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
          // Chưa từng login → redirect sang Hosted UI
          await loginWithHostedUI();
        } else {
          // ĐÃ có code (hoặc error) mà vẫn fail → không redirect nữa để tránh loop
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

  // Bước 2: subscribe realtime onNodeDataAdded
  useEffect(() => {
    if (!jwt) return;

    console.log("Đăng ký subscription onNodeDataAdded cho DevAddr:", devAddr);
    setSensorLoaded(false);

    const subscription = (client.graphql({
      query: /* GraphQL */ `
        subscription OnNodeDataAdded($DevAddr: Int!) {
          onNodeDataAdded(DevAddr: $DevAddr) {
            co2
            battery
            fire
            humidity
            maxT
            temperature
          }
        }
      `,
      variables: { DevAddr: devAddr },
    }) as any).subscribe({
      next: (response: { data?: { onNodeDataAdded?: SensorData } }) => {
        if (!response.data || !response.data.onNodeDataAdded) {
          console.warn("Subscription: không có data trong response", response);
          return;
        }
        const newData = response.data.onNodeDataAdded;
        console.log("Subscription nhận được dữ liệu mới:", newData);
        setSensorData(newData);
        setSensorLoaded(true);
      },
      error: (error: unknown) => {
        console.error("Lỗi subscription onNodeDataAdded:", error);
      },
    });

    // cleanup khi unmount hoặc khi jwt/devAddr đổi
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [jwt, devAddr]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setJwt(null);
      setUser(null);
      setSensorData(null);
      setSensorLoaded(false);
    }
  };

  // Loading bước đầu
  if (loading && !jwt) {
    return <div style={{ padding: 16 }}>Đang kiểm tra phiên đăng nhập...</div>;
  }

  // Nếu vì lý do gì đó vẫn chưa có jwt
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

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1>Dashboard (Cognito + AppSync realtime)</h1>
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      {errorMsg && (
        <p style={{ color: "red", marginBottom: 12 }}>Lỗi: {errorMsg}</p>
      )}

      {user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          sensorData={sensorData}
          sensorLoaded={sensorLoaded}
          devAddr={devAddr}
        />
      )}
    </div>
  );
};

export default App;
