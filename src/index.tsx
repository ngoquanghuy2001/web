import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { BrowserRouter } from "react-router-dom";
import awsconfig from "./aws-exports";
import App from "./App";
import "./index.css";
import "./i18n";
import "leaflet/dist/leaflet.css";

Amplify.configure(awsconfig);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);