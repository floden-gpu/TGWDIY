// 导入模块：从工程包 ZIP 还原完整的卡牌工程（含原画 base64）。
import JSZip from "jszip";
import { createCard } from "./cardModel";

export async function importProject(file) {
  const zip = await JSZip.loadAsync(file);
  const projectFile = zip.file("project.json");
  if (!projectFile) throw new Error("缺失 project.json，不是有效的工程包");

  const project = JSON.parse(await projectFile.async("text"));
  const card = {
    ...createCard(project.id || `c-${Date.now().toString(36)}`),
    name: project.name || "未命名卡牌",
    savedAt: project.savedAt || null,
    variants: project.variants && Array.isArray(project.variants) ? project.variants : [],
    appearance: project.appearance || {},
    activeVariantId: project.activeVariantId || null,
  };

  // 若变式数组为空，走 card_data 兜底
  if (!card.variants.length) {
    const cd = zip.file("card_data.json");
    if (cd) {
      const parsed = JSON.parse(await cd.async("text"));
      if (parsed.cards && parsed.cards.length) {
        const rootData = parsed.cards.find((c) => !c.parentId) || parsed.cards[0];
        card.variants = parsed.cards.map((c) => ({
          id: c.id, label: c.label || "未命名卡面", kind: c.kind || "base",
          parentId: c.parentId || null, data: { ...c }, art: null,
        }));
        if (!card.activeVariantId && card.variants.length) card.activeVariantId = card.variants[0].id;
        void rootData;
      }
    }
  }
  if (!card.variants.length) throw new Error("工程包内无任何卡面变式");

  if (!card.activeVariantId) {
    card.activeVariantId = card.variants[0].id;
  }
  if (!card.variants.some((v) => v.id === card.activeVariantId)) {
    card.activeVariantId = card.variants[0].id;
  }

  // 恢复原画：art/<label>.<ext> 中的 base64 → dataURL
  const artFiles = Object.keys(zip.files).filter((p) => p.startsWith("art/") && !zip.files[p].dir);
  const artByLabel = {};
  await Promise.all(
    artFiles.map(async (p) => {
      const label = p.replace("art/", "").replace(/\.[^.]+$/, "");
      const content = await zip.files[p].async("base64");
      const ext = p.split(".").pop();
      const mime = ext === "jpg" ? "image/jpeg" : `image/${ext === "png" ? "png" : "png"}`;
      artByLabel[label] = `data:${mime};base64,${content}`;
    })
  );
  for (const v of card.variants) {
    const src = artByLabel[slug(v.label || v.id)];
    if (src) {
      v.art = { src, main: { x: 0, y: 0, s: 1 }, mini: { x: 0, y: 0, s: 1 } };
    }
  }

  return card;
}

function slug(s) {
  return String(s || "face")
    .replace(/[^\w\u4e00-\u9fff]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

// 与 DropHandler 共用
export const reviveFromZip = importProject;