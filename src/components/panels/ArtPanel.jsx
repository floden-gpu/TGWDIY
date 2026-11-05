import React, { useRef, useState } from "react";
import { useEditor } from "../../store/EditorContext";
import { setVariantArt, copyArtConfig } from "../../core/actions";
import { loadImageToDataURL, cacheArtwork } from "../../core/renderer";
import { resolveArt } from "../../core/cardModel";
import { useToast } from "../Toast";
import { Upload } from "@phosphor-icons/react";

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// 原画与本分支参数：拖拽移动、滚轮缩放，主卡面与迷你卡同步。
export function ArtPanel() {
  const { state, dispatch } = useEditor();
  const cardRef = state.card;
  const active = cardRef.activeVariantId;
  const art = resolveArt(cardRef, active);
  const fileRef = useRef(null);
  const toast = useToast();
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [copyFrom, setCopyFrom] = useState(null);

  const isInheriting = !art;

  // 通用补丁：同步更新 main 与 mini
  const patchArt = (pMain = {}, pMini = {}) => {
    const prev = art || { main: { x: 0, y: 0, s: 1 }, mini: { x: 0, y: 0, s: 1 } };
    dispatch(
      setVariantArt(cardRef, active, {
        src: prev.src,
        main: { ...(prev.main || {}), ...pMain },
        mini: { ...(prev.mini || {}), ...pMini },
      })
    );
  };

  const handleFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      toast.err("请选择图片文件");
      return;
    }
    try {
      const dataURL = await loadImageToDataURL(f);
      await cacheArtwork(dataURL);
      const prev = art || {};
      dispatch(
        setVariantArt(cardRef, active, {
          src: dataURL,
          main: prev.main || { x: 0, y: 0, s: 1 },
          mini: prev.mini || { x: 0, y: 0, s: 1 },
        })
      );
      toast.ok("原画已上传");
    } catch (err) {
      toast.err("读取图片失败");
    }
    e.target.value = "";
  };

  const onWheel = (e) => {
    if (!art) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.06 : 0.94;
    const m = art.main || { x: 0, y: 0, s: 1 };
    const i = art.mini || { x: 0, y: 0, s: 1 };
    patchArt(
      { ...m, s: clamp(m.s * factor, 0.2, 4) },
      { ...i, s: clamp(i.s * factor, 0.2, 4) }
    );
  };

  const onPointerDown = (e) => {
    if (!art) return;
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, m: { ...(art.main || {}) }, i: { ...(art.mini || {}) } });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    patchArt(
      { ...dragStart.m, x: dragStart.m.x + dx, y: dragStart.m.y + dy },
      { ...dragStart.i, x: dragStart.i.x + dx, y: dragStart.i.y + dy }
    );
  };
  const onPointerUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  const resetArt = () => {
    dispatch(setVariantArt(cardRef, active, { clear: true }));
    toast.info("已重置：本分支开始沿用父级原画");
  };

  const doCopy = () => {
    if (!copyFrom) return;
    const srcArt = resolveArt(cardRef, copyFrom);
    if (!srcArt) {
      toast.err("源分支没有原画");
      return;
    }
    dispatch(copyArtConfig(cardRef, active, srcArt, { src: true, main: true, mini: true }));
    toast.ok("已跨分支复制卡画");
    setCopyFrom(null);
  };

  return (
    <>
      <div className="inline-tip" style={{ marginBottom: 12 }}>
        上传原画后可拖拽移动、滚轮缩放；主卡面与迷你卡的位置缩放保持同步。
      </div>

      {isInheriting ? (
        <div className="inline-tip" style={{ marginBottom: 12 }}>
          当前分支未设置独立卡画，沿用父级原画。
        </div>
      ) : (
        <div className="inline-tip" style={{ marginBottom: 12 }}>
          已设置独立卡画：缩放 {Math.round((art.main.s || 1) * 100)}% · 偏移 x{Math.round(art.main.x)} y{Math.round(art.main.y)}
        </div>
      )}

      <div className="field">
        <button className="btn accent file-btn full" onClick={() => fileRef.current?.click()}>
          <Upload size={15} /> {isInheriting ? "上传原画" : "替换原画"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>

      <div className="field">
        <div className="flabel">
          位置与缩放
          <span className="hint">{dragging ? "拖动中…" : "拖拽移动 · 滚轮缩放"}</span>
        </div>
        <div
          className="drop-area interactive"
          style={{
            height: 150,
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--r-md)",
            background: "var(--surface-2)",
            display: "grid",
            placeItems: "center",
            color: "var(--ink-3)",
            userSelect: "none",
            cursor: art ? "grab" : "default",
            position: "relative",
            overflow: "hidden",
          }}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {art ? (
            <>
              <img
                src={art.src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `translate(${art.main.x}px, ${art.main.y}px) scale(${art.main.s})`,
                  pointerEvents: "none",
                  transformOrigin: "center",
                }}
              />
              <span
                style={{
                  position: "absolute", bottom: 8, left: 8,
                  background: "rgba(0,0,0,.55)", color: "#fff",
                  fontSize: 11, padding: "2px 8px", borderRadius: 4,
                }}
              >
                缩放 {(art.main.s || 1).toFixed(2)}×
              </span>
            </>
          ) : (
            <span style={{ textAlign: "center", padding: 12 }}>上传原画后在此调整位置与缩放</span>
          )}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn" onClick={resetArt} disabled={isInheriting}>复位原画</button>
        <button className="btn" onClick={() => setCopyFrom(active)}>跨分支复制</button>
      </div>

      {copyFrom && (
        <div className="field" style={{ marginTop: 8 }}>
          <div className="flabel">从哪个分支复制卡画？</div>
          <div className="btn-row">
            <select value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} style={{ flex: 1 }}>
              {cardRef.variants
                .filter((v) => v.id !== active)
                .map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
            </select>
            <button className="btn accent sm" onClick={doCopy}>复制</button>
            <button className="btn sm" onClick={() => setCopyFrom(null)}>取消</button>
          </div>
        </div>
      )}
    </>
  );
}