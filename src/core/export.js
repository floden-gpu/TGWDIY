// 导出打包模块：将卡牌工程打包为 ZIP。
// 结构（对齐原站点工程包约定）：
//   main/         各变式主卡面 PNG (500x702)
//   mini/         各变式迷你卡 PNG (250x351)
//   art/          各变式净底图/原画 (base64 原样)
//   project.json  主工程描述（卡牌整体 + 变式树 + 外观）
//   card_data.json 结构化卡牌数据（供其他工具消费）
import JSZip from "jszip";
import {
  MAIN_W, MAIN_H, MINI_W, MINI_H,
  renderMainCard, renderMiniCard,
} from "./renderer";
import { resolveData, resolveArt } from "./cardModel";

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas 转码失败"))), "image/png");
  });
}

function renderFaceToBlob({ data, ap, art, mode }) {
  const W = mode === "main" ? MAIN_W : MINI_W;
  const H = mode === "main" ? MAIN_H : MINI_H;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (mode === "main") renderMainCard(ctx, W, H, data, ap, art);
  else renderMiniCard(ctx, W, H, data, ap, art);
  return canvasToBlob(c);
}

function slug(s) {
  const base = String(s || "face")
    .replace(/[^\w\u4e00-\u9fff]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return base || "face";
}

export async function exportProjectZip(card) {
  const zip = new JSZip();
  const mainFolder = zip.folder("main");
  const miniFolder = zip.folder("mini");
  const artFolder = zip.folder("art");

  const ap = card.appearance || {};

  // 依次渲染每个变式
  for (const v of card.variants) {
    const data = resolveData(card, v.id);
    const art = resolveArt(card, v.id);
    const safe = slug(v.label || v.id);

    const mainBlob = await renderFaceToBlob({ data, ap, art, mode: "main" });
    const miniBlob = await renderFaceToBlob({ data, ap, art, mode: "mini" });
    mainFolder.file(`${safe}.png`, mainBlob);
    miniFolder.file(`${safe}.png`, miniBlob);

    if (art && art.src) {
      // 原画净底图（base64 dataURL 原样保存为 txt，便于恢复）
      const m = art.src.match(/^data:(image\/[a-z+]+)/i);
      const ext = m ? m[1].split("/")[1].replace("jpeg", "jpg") : "png";
      zip.file(`art/${safe}.${ext}`, art.src.split(",")[1] || "", { base64: !m });
    }
  }

  // 主工程描述
  const project = {
    format: "tgw-diy-project",
    version: 1,
    name: card.name,
    savedAt: new Date().toISOString(),
    activeVariantId: card.activeVariantId,
    variants: card.variants,
    appearance: ap,
  };
  zip.file("project.json", JSON.stringify(project, null, 2));

  // 结构化卡牌数据
  const cards = card.variants.map((v) => {
    const data = resolveData(card, v.id);
    return {
      id: v.id,
      label: v.label,
      kind: v.kind,
      parentId: v.parentId || null,
      ...data,
    };
  });
  zip.file(
    "card_data.json",
    JSON.stringify({ format: "tgw-diy-cards", version: 1, cards }, null, 2)
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug(card.name || "tgw-diy")}.kdz.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return blob;
}