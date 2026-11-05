import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/app.css";
import { preloadAssets, loadFonts } from "./core/renderer";

// 先加载卡框模板/图标/字体，再挂载，避免首帧空白与字体回退抖动
async function boot() {
  try {
    await Promise.all([preloadAssets(), loadFonts()]);
  } catch {
    /* 素材加载失败也继续渲染，渲染器内部有回退 */
  }
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
