import React, { useEffect, useState } from "react";
import {
  loginWithHostedUI,
  getIdToken,
  getCurrentUserInfo,
  logout,
  UserInfo,
} from "./auth";
import { getTodos, Todo } from "./api/appsyncClient";
import Dashboard from "./Dashboard";

const App: React.FC = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Bước 2: có jwt rồi thì gọi AppSync
  useEffect(() => {
    if (!jwt) return;

    const fetchTodos = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const items = await getTodos(jwt);
        setTodos(items);
      } catch (err: any) {
        console.error("Error calling AppSync:", err);
        setErrorMsg(err?.message ?? "Lỗi khi gọi AppSync");
      } finally {
        setLoading(false);
      }
    };

    void fetchTodos();
  }, [jwt]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setJwt(null);
      setUser(null);
      setTodos([]);
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
        <h1>Dashboard (Cognito + AppSync)</h1>
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      {user && <Dashboard user={user} onLogout={handleLogout} />}

      {loading && <p>Đang tải Todo từ AppSync...</p>}

      {errorMsg && (
        <p style={{ color: "red", marginBottom: 12 }}>Lỗi: {errorMsg}</p>
      )}

      {!loading && !errorMsg && (
        <>
          <h2>Danh sách Todo (demo AppSync)</h2>
          <ul>
            {todos.map((t) => (
              <li key={t.id}>
                {t.title} {t.completed ? "✅" : "⏳"}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
