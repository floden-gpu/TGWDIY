// 默认示例卡牌：步兵单位，带一个老兵变式 + 一个指令变式演示。
import { createCard, createVariantNode, defaultCardData, nextId } from "./cardModel";

export function createSampleCard() {
  const card = createCard(nextId("s").replace(/^v-/, ""));

  const rootData = {
    ...defaultCardData(),
    nameZh: "萨克森第101掷弹兵团",
    nameEn: "Saxon 101st Grenadiers",
    type: "infantry",
    rarity: "r1",
    nation: "de",
    deployCost: 6,
    actionCost: 0,
    attack: 4,
    defense: 6,
    keywordIds: ["blitz2", "cover"],
    keywords: "",
    effect: "本单位受到攻击伤害 +1\n撤退：抽一张牌",
    author: "",
  };
  card.variants[0].data = rootData;

  // 老兵变式
  const vet = createVariantNode({
    id: `${card.id}-vet`,
    label: "老兵形态",
    kind: "veteran",
    parentId: card.variants[0].id,
    data: {
      ...defaultCardData(),
      nameZh: "萨克森第101掷弹兵团·精锐",
      attack: 5,
      defense: 7,
      effect: "本单位受到攻击伤害 +1，撤退：抽一张牌。",
    },
  });
  card.variants.push(vet);

  // 指令变式
  const order = createVariantNode({
    id: `${card.id}-order`,
    label: "指令形态",
    kind: "choice",
    parentId: card.variants[0].id,
    data: {
      ...defaultCardData(),
      nameZh: "集中炮火",
      type: "order",
      deployCost: 3,
      actionCost: null,
      attack: null,
      defense: null,
      keywordIds: [],
      keywords: "",
      effect: "对一个目标单位造成 3 点伤害。",
    },
  });
  card.variants.push(order);

  card.activeVariantId = card.variants[0].id;
  return card;
}
