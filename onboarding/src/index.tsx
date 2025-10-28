import React from "react";
import ReactDOM from "react-dom/client";
import { OnboardingFlow } from "./components/OnboardingFlow";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <OnboardingFlow />
  </React.StrictMode>
);
