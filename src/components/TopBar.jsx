import React from "react";
import {
  ArrowCounterClockwise, ArrowClockwise, FloppyDisk, UploadSimple,
  Package, DownloadSimple, Cards,
} from "@phosphor-icons/react";
import { useEditor } from "../store/EditorContext";
import { useToast } from "./Toast";
import { exportProjectZip } from "../core/export";
import { saveLocalDraft, loadLocalDraft, hasLocalDraft } from "../core/draft";
import { importProject } from "../core/import";

export function TopBar() {
  const { state, dispatch } = useEditor();
  const toast = useToast();
  const { card, canUndo, canRedo } = state;
  const fileRef = React.useRef(null);
  const [hasDraft, setHasDraft] = React.useState(hasLocalDraft());

  const handleUndo = () => {
    if (canUndo) dispatch({ type: "undo" });
  };
  const handleRedo = () => {
    if (canRedo) dispatch({ type: "redo" });
  };

  const handleSaveLocal = () => {
    saveLocalDraft(card);
    setHasDraft(true);
    toast.ok("已保存到本地草稿");
  };

  const handleLoadLocal = () => {
    const c = loadLocalDraft();
    if (!c) {
      toast.err("本地暂无草稿");
      return;
    }
    dispatch({ type: "reset", card: c });
    toast.ok(`已载入本地草稿「${c.name || "未命名卡牌"}」`);
  };

  const handleExport = async () => {
    try {
      toast.info("正在打包导出…");
      await exportProjectZip(card);
      toast.ok("工程包已导出并下载");
    } catch (e) {
      toast.err("导出失败：" + (e && e.message ? e.message : "未知错误"));
    }
  };

  const handleImportFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    importProject(f)
      .then((c) => {
        dispatch({ type: "reset", card: c });
        toast.ok(`已载入工程「${c.name || "未命名卡牌"}」`);
      })
      .catch((err) => toast.err("导入失败：" + (err && err.message ? err.message : "未知错误")));
    e.target.value = "";
  };

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="mark"><Cards size={17} weight="fill" /></div>
        <div>
          TGW 卡牌 DIY 编辑器
          <div className="topbar-sub">多变式卡牌工坊</div>
        </div>
      </div>

      <div className="topbar-spacer" />

      {/* 撤销/重做 */}
      <div className="tb-group">
        <button className="tb-btn" onClick={handleUndo} disabled={!canUndo} title="撤销 (Ctrl+Z)">
          <ArrowCounterClockwise size={15} /> 撤销
        </button>
        <button className="tb-btn" onClick={handleRedo} disabled={!canRedo} title="重做 (Ctrl+Y)">
          <ArrowClockwise size={15} /> 重做
        </button>
      </div>

      <div className="tb-sep" />

      {/* 本地草稿 */}
      <div className="tb-group">
        <button className="tb-btn ghost" onClick={handleSaveLocal} title="保存到本地草稿">
          <FloppyDisk size={15} /> 存草稿
        </button>
        <button className="tb-btn ghost" onClick={handleLoadLocal} disabled={!hasDraft} title="载入本地草稿">
          <UploadSimple size={15} /> 读草稿{hasDraft ? "" : " (空)"}
        </button>
        <button className="tb-btn ghost file-btn" title="导入工程包 ZIP">
          <DownloadSimple size={15} /> 导入
          <input ref={fileRef} type="file" accept=".zip,application/zip" onChange={handleImportFile} />
        </button>
      </div>

      <div className="tb-sep" />

      <button className="tb-btn primary" onClick={handleExport} title="导出完整工程包">
        <Package size={16} /> 导出工程包
      </button>
    </header>
  );
}