import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    // 产物 JS/CSS 放 bundled/，避免与 public/assets 下的卡框素材目录同名冲突
    assetsDir: "bundled",
    chunkSizeWarningLimit: 1500,
  },
});
