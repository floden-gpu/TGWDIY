// 本地草稿存储（localStorage），云端草稿的本地降级实现。

const KEY = "tgw_diy_draft_v1";

export function saveLocalDraft(card) {
  try {
    const rev = {
      ...card,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(rev));
    return true;
  } catch (e) {
    // 空间可能不足（含大尺寸 base64 原画）
    return false;
  }
}

export function loadLocalDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.variants && Array.isArray(parsed.variants) ? parsed : null;
  } catch (e) {
    return null;
  }
}

export function hasLocalDraft() {
  return !!localStorage.getItem(KEY);
}

export function clearLocalDraft() {
  localStorage.removeItem(KEY);
}