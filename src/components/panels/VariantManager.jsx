import React from "react";
import { useEditor } from "../../store/EditorContext";
import { setActiveVariant, addVariant, deleteVariant, renameVariant, kindLabel } from "../../core/actions";
import { variantInfo, rootVariant, childrenOf } from "../../core/cardModel";
import { VARIANT_KINDS } from "../../core/constants";
import { PencilSimple, Trash, Plus, Check } from "@phosphor-icons/react";

// 单行变式（递归渲染子树）
function VariantRow({ v, indent }) {
  const { state, dispatch } = useEditor();
  const card = state.card;
  const active = card.activeVariantId;
  const info = variantInfo(card, v.id);
  const isRoot = !v.parentId;
  const [editing, setEditing] = React.useState(false);
  const [label, setLabel] = React.useState(v.label);

  const kids = childrenOf(card, v.id);

  const activate = () => {
    if (v.id !== active) dispatch(setActiveVariant(card, v.id));
  };

  const saveRename = () => {
    if (label.trim() && label !== v.label) dispatch(renameVariant(card, v.id, { label: label.trim() }));
    setEditing(false);
  };

  return (
    <React.Fragment>
      <div
        className={`variant-row ${v.id === active ? "active" : ""}`}
        style={{ marginLeft: `${indent * 18}px` }}
        onClick={activate}
      >
        <span className="kind-badge">{kindLabel(info.kind)}</span>
        {editing ? (
          <input
            style={{ flex: 1, minWidth: 0 }}
            value={label}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => e.key === "Enter" && saveRename()}
          />
        ) : (
          <span className="vname">{v.label}</span>
        )}
        {!isRoot && <span className="vdepth">层级 {info.depth}</span>}
        <span className="vr-actions" onClick={(e) => e.stopPropagation()}>
          {!isRoot && (
            <>
              <button className="mini-icon-btn" title="重命名" onClick={() => { setLabel(v.label); setEditing(true); }}>
                <PencilSimple size={13} />
              </button>
              <button className="mini-icon-btn" title="删除" onClick={() => dispatch(deleteVariant(card, v.id))}>
                <Trash size={13} />
              </button>
            </>
          )}
        </span>
      </div>
      {kids.map((k) => (
        <VariantRow key={k.id} v={k} indent={indent + 1} />
      ))}
    </React.Fragment>
  );
}

export function VariantManager() {
  const { state, dispatch } = useEditor();
  const card = state.card;
  const root = rootVariant(card);

  const addFromKind = (kind) => {
    const labels = {
      veteran: "老兵形态",
      choice: "抉择形态",
      pick3: "三选一形态",
      develop: "开发形态",
    };
    dispatch(addVariant(card, { kind, label: labels[kind] || kindLabel(kind) }));
  };

  return (
    <>
      <div className="inline-tip" style={{ marginBottom: 10 }}>
        变式是卡片的分支形态。点击切换编辑，子分支未设置的项目自动继承父级。
      </div>

      <div className="variant-list">
        {root && <VariantRow v={root} indent={0} />}
      </div>

      <div className="add-variant-row">
        {VARIANT_KINDS.filter((k) => k.id !== "base").map((k) => (
          <button key={k.id} className="btn soft sm" onClick={() => addFromKind(k.id)}>
            <Plus size={13} /> {k.label}
          </button>
        ))}
      </div>
    </>
  );
}