import React from "react";
import { useEditor } from "../../store/EditorContext";
import { updateActiveData } from "../../core/actions";
import { CARD_TYPES, RARITIES, NATIONS } from "../../core/constants";
import { resolveData } from "../../core/cardModel";

export function BaseSettingsPanel() {
  const { state, dispatch } = useEditor();
  const card = state.card;
  const active = card.activeVariantId;
  const data = resolveData(card, active);

  const set = (patch) => dispatch(updateActiveData(card, patch));

  return (
    <>
      <div className="field">
        <div className="flabel">卡牌类型</div>
        <div className="seg">
          {CARD_TYPES.map((t) => (
            <button
              key={t.id}
              className={`opt ${data.type === t.id ? "on" : ""}`}
              onClick={() => set({ type: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="flabel">
          稀有度
          <span className="hint">显示在词条下方</span>
        </div>
        <div className="seg">
          {RARITIES.map((r) => (
            <button
              key={r.id}
              className={`opt ${data.rarity === r.id ? "on" : ""}`}
              onClick={() => set({ rarity: r.id })}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="flabel">国家</div>
        <div className="seg">
          {NATIONS.map((n) => (
            <button
              key={n.id}
              className={`opt ${data.nation === n.id ? "on" : ""}`}
              onClick={() => set({ nation: n.id })}
            >
              {n.symbol} {n.name}
            </button>
          ))}
        </div>
        <div className="inline-tip" style={{ marginTop: 8 }}>
          当前分支继承基础形态的设定；子分支未填写的项目会自动沿用父级。
        </div>
      </div>
    </>
  );
}
