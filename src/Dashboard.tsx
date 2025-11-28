import React from "react";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

interface DashboardProps {
  user: UserInfo;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { username, attributes } = user;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1>Dashboard</h1>
        <button onClick={onLogout}>Đăng xuất</button>
      </div>

      <h2>Thông tin người dùng</h2>
      <p>
        <strong>Username:</strong> {username}
      </p>

      <h3>Thuộc tính (attributes) từ Cognito</h3>
      <ul>
        {Object.entries(attributes).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;