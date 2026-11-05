import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/app.css";
import { preloadAssets, loadFonts, assetsReady } from "./core/renderer";

// 把错误直接写进 DOM，便于排查空白页
function reportError(stage, err) {
  const msg = `${stage}: ${err && (err.stack || err.message || err)}`;
  console.error(msg);
  let el = document.getElementById("boot-error");
  if (!el) {
    el = document.createElement("pre");
    el.id = "boot-error";
    el.style.cssText =
      "position:fixed;left:0;top:0;right:0;z-index:9999;margin:0;padding:12px;" +
      "background:#fee;color:#900;font:12px/1.5 monospace;white-space:pre-wrap;max-height:60vh;overflow:auto";
    document.body.appendChild(el);
  }
  el.textContent += msg + "\n";
}

window.addEventListener("error", (e) => reportError("window.error", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => reportError("unhandledrejection", e.reason));

// 素材就绪后挂载；最多等 3 秒，超时也照常挂载，避免永久空白
function waitAssets(maxMs = 3000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => {
      if (assetsReady() || Date.now() - t0 > maxMs) resolve();
      else setTimeout(tick, 50);
    };
    tick();
  });
}

async function boot() {
  try {
    await Promise.all([preloadAssets(), loadFonts()]);
  } catch (e) {
    reportError("preload", e);
  }

  await waitAssets(3000);

  try {
    const root = document.getElementById("root");
    if (!root) throw new Error("#root 不存在");
    createRoot(root).render(<App />);
  } catch (e) {
    reportError("render", e);
  }
}

boot().catch((e) => reportError("boot", e));
