// 编辑器操作生成器：返回 reducer action

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function mut(card, fn) {
  // 返回新引用，便于 immer 式更新（这里直接深拷贝后原地改）
  const next = clone(card);
  fn(next);
  return next;
}

export const commit = (next) => ({ type: "commit", next });

/** 更新活动卡面的数据字段（走历史） */
export function updateActiveData(card, patch) {
  const active = card.activeVariantId;
  return {
    type: "commit",
    next: mut(card, (c) => {
      const n = c.variants.find((v) => v.id === active);
      if (!n) return;
      n.data = { ...(n.data || {}), ...patch };
      // 根节点同步卡牌整体名
      const root = c.variants.find((v) => !v.parentId);
      if (root && active === root.id && patch.nameZh !== undefined) {
        c.name = patch.nameZh || "未命名卡牌";
      }
    }),
  };
}

/** 更新全局外观（可选是否入历史；高频拖动时传 history=false 使用 set） */
export function updateAppearance(card, patch, { history = true } = {}) {
  const next = mut(card, (c) => {
    c.appearance = { ...c.appearance, ...patch };
  });
  return history ? { type: "commit", next } : { type: "set", card: next };
}

/** 切换活动卡面（不入历史） */
export function setActiveVariant(card, id) {
  return {
    type: "set",
    card: mut(card, (c) => {
      c.activeVariantId = id;
    }),
  };
}

/** 添加派生分支 */
export function addVariant(card, { kind, label }) {
  return {
    type: "commit",
    next: mut(card, (c) => {
      const active = c.activeVariantId;
      const parent = c.variants.find((v) => v.id === active);
      const newId = `${c.id}-${kind}-${Math.random().toString(36).slice(2, 7)}`;
      const node = {
        id: newId,
        label: label || kindLabel(kind),
        kind,
        parentId: parent ? parent.id : null,
        data: null,
        art: null,
      };
      c.variants.push(node);
      c.activeVariantId = newId;
    }),
  };
}

export function kindLabel(kind) {
  const map = {
    veteran: "老兵形态",
    choice: "抉择形态",
    pick3: "三选一形态",
    develop: "开发形态",
    base: "基础形态",
  };
  return map[kind] || "新变式";
}

/** 删除分支（不能删根）。把分支及其子树一起删除。 */
export function deleteVariant(card, id) {
  return {
    type: "commit",
    next: mut(card, (c) => {
      const node = c.variants.find((v) => v.id === id);
      if (!node || !node.parentId) return;
      const doomed = new Set();
      const collect = (vid) => {
        doomed.add(vid);
        c.variants.filter((v) => v.parentId === vid).forEach((v) => collect(v.id));
      };
      collect(id);
      // 若删除的是活动卡面，切到父级
      if (doomed.has(c.activeVariantId)) c.activeVariantId = node.parentId;
      c.variants = c.variants.filter((v) => !doomed.has(v.id));
    }),
  };
}

/** 重命名分支 label 与 kind（根不可改 kind） */
export function renameVariant(card, id, { label, kind }) {
  return {
    type: "commit",
    next: mut(card, (c) => {
      const n = c.variants.find((v) => v.id === id);
      if (!n) return;
      if (label !== undefined) n.label = label;
      if (kind !== undefined && n.parentId) n.kind = kind;
    }),
  };
}

/** 设置/清除分支独立卡画。toClear=沿用父级 */
export function setVariantArt(card, id, { src, main, mini, clear }) {
  return {
    type: "commit",
    next: mut(card, (c) => {
      const n = c.variants.find((v) => v.id === id);
      if (!n) return;
      if (clear) {
        n.art = null;
        return;
      }
      const prev = n.art || {};
      n.art = {
        src: src !== undefined ? src : prev.src,
        main: main || prev.main || { x: 0, y: 0, s: 1 },
        mini: mini || prev.mini || { x: 0, y: 0, s: 1 },
      };
    }),
  };
}

/** 复制来源卡画的坐标微调到目标分支（不复制图源或仅按需） */
export function copyArtConfig(card, targetId, sourceArt, fields) {
  return {
    type: "commit",
    next: mut(card, (c) => {
      const n = c.variants.find((v) => v.id === targetId);
      if (!n || !sourceArt) return;
      n.art = {
        src: fields.src ? sourceArt.src : n.art?.src,
        main: fields.main ? { ...sourceArt.main } : n.art?.main,
        mini: fields.mini ? { ...sourceArt.mini } : n.art?.mini,
      };
    }),
  };
}

/** 回滚至初始状态（重新加载草稿） */
export function resetTo(card) {
  return { type: "reset", card };
}

/** 设置根节点数据（用于导入或新建时的整体覆盖） */
export function setRootData(card, data) {
  return {
    type: "commit",
    next: mut(card, (c) => {
      const root = c.variants.find((v) => !v.parentId);
      if (root) root.data = { ...(root.data || {}), ...data };
      c.name = data.nameZh || c.name;
    }),
  };
}