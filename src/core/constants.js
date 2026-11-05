// 卡牌数据模型的枚举常量
// 按需求收窄：仅「步兵」一种卡牌类型，仅「英 / 法 / 德 / 俄」四国，无版本/闪卡之分。

export const NATIONS = [
  { id: "uk", name: "英国", symbol: "🇬🇧" },
  { id: "fr", name: "法国", symbol: "🇫🇷" },
  { id: "de", name: "德国", symbol: "🇩🇪" },
  { id: "soviet", name: "俄国", symbol: "🇷🇺" },
];

// 兵种与卡牌类型：只保留步兵
export const UNIT_TYPES = ["infantry"];
export const CARD_TYPES = [
  { id: "infantry", label: "步兵", family: "unit" },
];

// 稀有度：用形状标记区分（显示在词条下方）
//   稀有度一 → 1 个五角星
//   稀有度二 → 2 个六边形
//   稀有度三 → 3 个三角形
//   稀有度四 → 4 个菱形
export const RARITIES = [
  { id: "r1", label: "稀有度一", rank: 1, shape: "star", count: 1 },
  { id: "r2", label: "稀有度二", rank: 2, shape: "hexagon", count: 2 },
  { id: "r3", label: "稀有度三", rank: 3, shape: "triangle", count: 3 },
  { id: "r4", label: "稀有度四", rank: 4, shape: "diamond", count: 4 },
];

// 无版本/闪卡之分：仅保留单一卡面
export const FACES = [{ id: "native", label: "标准卡面", family: "native" }];

// 无角标可选（保留一项，避免版面留空）
export const STYLE_OPTIONS = [{ id: "standard", label: "标准" }];

// 变式机制类型
export const VARIANT_KINDS = [
  { id: "base", label: "基础形态" },
  { id: "veteran", label: "老兵" },
  { id: "choice", label: "抉择" },
  { id: "pick3", label: "三选一" },
  { id: "develop", label: "开发" },
];

// 阵营概要色
export const NATION_COLORS = {
  uk: "#5b6c8c", fr: "#5f7d9e", de: "#7a5c4a", soviet: "#8a3d36",
};

export const NATION_ARMY_HEX = {
  uk: "#7f9cc0", fr: "#6a90b8", de: "#8a6a4a", soviet: "#9c4a3a",
};

// 卡名条颜色（按国家）
export const NAME_BAR_COLORS = {
  uk: "#4a7c3a",   // 英国 - 军绿
  fr: "#2a5a9e",   // 法国 - 蓝
  de: "#2a2a2a",   // 德国 - 黑灰
  soviet: "#3d7a2f", // 俄国 - 草绿
};

export const FACTION_LABEL = {
  uk: "英国", fr: "法国", de: "德国", soviet: "俄国",
};

// 词条可多选；blitz 组内互斥（闪袭1 / 闪袭2 不能同时选）
export const KEYWORD_OPTIONS = [
  { id: "blitz1", label: "闪袭1", group: "blitz" },
  { id: "blitz2", label: "闪袭2", group: "blitz" },
  { id: "cover", label: "掩护", group: null },
];

export const KEYWORD_LABELS = {
  blitz1: "闪袭1",
  blitz2: "闪袭2",
  cover: "掩护",
};

// 特效富文本指令解析用的标记
export const BOLD_MARKS = ["**", "__"];
