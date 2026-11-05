import React from "react";
import { useEditor } from "../../store/EditorContext";
import { updateActiveData } from "../../core/actions";
import { resolveData } from "../../core/cardModel";
import { KEYWORD_OPTIONS } from "../../core/constants";

export function TextPanel() {
  const { state, dispatch } = useEditor();
  const card = state.card;
  const active = card.activeVariantId;
  const data = resolveData(card, active);

  const set = (patch) => dispatch(updateActiveData(card, patch));

  const ids = Array.isArray(data.keywordIds) ? data.keywordIds : [];
  const hasCustom = ids.includes("custom");

  // 切换某个词条；blitz 组内互斥
  const toggleKeyword = (id) => {
    const opt = KEYWORD_OPTIONS.find((o) => o.id === id);
    const group = opt?.group || null;
    let next;

    if (ids.includes(id)) {
      next = ids.filter((x) => x !== id);
    } else {
      // 同组互斥：先移除同组其他项，再加入当前项
      next = group
        ? [...ids.filter((x) => {
            const o = KEYWORD_OPTIONS.find((k) => k.id === x);
            return !o || o.group !== group;
          }), id]
        : [...ids, id];
    }

    set({ keywordIds: next, keywords: "" });
  };

  const toggleCustom = () => {
    const next = hasCustom
      ? ids.filter((x) => x !== "custom")
      : [...ids, "custom"];
    set({ keywordIds: next, keywords: "" });
  };

  return (
    <>
      <div className="field">
        <div className="flabel">卡名（中文）</div>
        <input type="text" value={data.nameZh || ""} placeholder="未命名卡牌"
          onChange={(e) => set({ nameZh: e.target.value })} />
      </div>

      <div className="field">
        <div className="flabel">卡名（英文）</div>
        <input type="text" value={data.nameEn || ""} placeholder="English Name"
          onChange={(e) => set({ nameEn: e.target.value })} />
      </div>

      <div className="field">
        <div className="flabel">
          部署 / 行动花费
          <span className="hint">行动费用填 0 表示无行动技能</span>
        </div>
        <div className="num-row">
          <label>
            <span>部署</span>
            <input
              type="number"
              min="0"
              max="99"
              value={data.deployCost ?? 0}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                set({ deployCost: v });
              }}
            />
          </label>
          <label>
            <span>行动</span>
            <input
              type="number"
              min="0"
              max="99"
              value={data.actionCost ?? 0}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                set({ actionCost: v });
              }}
            />
          </label>
        </div>
      </div>

      <div className="field">
        <div className="flabel">攻击 / 防御</div>
        <div className="num-row">
          <label>
            <span>攻击</span>
            <input
              type="number"
              min="0"
              max="99"
              value={data.attack ?? 0}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                set({ attack: v });
              }}
            />
          </label>
          <label>
            <span>防御</span>
            <input
              type="number"
              min="0"
              max="99"
              value={data.defense ?? 0}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                set({ defense: v });
              }}
            />
          </label>
        </div>
      </div>

      <div className="field">
        <div className="flabel">
          词条
          <span className="hint">可多选 · 闪袭1/2 互斥 · 卡面竖排居中</span>
        </div>
        <div className="chip-grid">
          {KEYWORD_OPTIONS.map((k) => (
            <button
              key={k.id}
              className={`chip ${ids.includes(k.id) ? "on" : ""}`}
              onClick={() => toggleKeyword(k.id)}
            >
              {k.label}
            </button>
          ))}
          <button
            className={`chip ${hasCustom ? "on" : ""}`}
            onClick={toggleCustom}
          >
            自定义
          </button>
        </div>
        {hasCustom && (
          <input
            type="text"
            value={data.customKeyword || ""}
            placeholder="自定义词条内容"
            style={{ marginTop: 8 }}
            onChange={(e) => set({ customKeyword: e.target.value })}
          />
        )}
      </div>

      <div className="field">
        <div className="flabel">
          特效描述
          <span className="hint">支持 **加粗** 或 __加粗__</span>
        </div>
        <textarea value={data.effect || ""} rows={6}
          onChange={(e) => set({ effect: e.target.value })}
          placeholder={"输入卡面特效。可使用 **粗体** 强调关键数值。"} />
        <div className="char-count">{data.effect ? data.effect.length : 0} 字符</div>
      </div>

      <div className="field">
        <div className="flabel">作者署名</div>
        <input type="text" value={data.author || ""} placeholder="你的名字"
          onChange={(e) => set({ author: e.target.value })} />
      </div>
    </>
  );
}
