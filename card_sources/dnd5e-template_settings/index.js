import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ApiMock } from "./ApiMock";
import reportWebVitals from "./reportWebVitals";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        <App Api={ApiMock} />
      </div>
    </React.StrictMode>
  );
} else {

  console.log("DND5E: Starts loading index.js");

  // Running inside the sandbox iframe.
  // "cardapi:ready" fires after INIT is received and cardId /
  // additionalArguments are available via the CardAPI getters.
  const renderRoot = () => {
    console.log("DND5E: cardapi:ready event received, rendering root");
    const api = window.CardAPI;
    const additionalArguments = api.additionalArguments;

    console.log("DND5E: CardAPI instance:", api);
    console.log("DND5E: Rendering with additionalArguments:", additionalArguments);

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App Api={api} additionalArguments={additionalArguments} />
      </React.StrictMode>
    );
  };
  

  window.addEventListener("cardapi:ready", renderRoot, { once: true });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
