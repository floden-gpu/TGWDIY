import React, { useRef } from "react";
import { EditorProvider, useEditor } from "./store/EditorContext";
import { ToastProvider, useToast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { ControlPanel } from "./components/ControlPanel";
import { CardPreview } from "./components/CardPreview";
import { reviveFromZip } from "./core/import";

function Workspace() {
  const { state } = useEditor();
  const card = state.card;
  return (
    <div className="workspace">
      <div className="preview-pane">
        <CardPreview variantId={card.activeVariantId} />
        <div className="preview-foot">
          <span className="preview-badge">{card.name || "未命名卡牌"}</span>
          <span>变式 {card.variants.length} 个</span>
        </div>
      </div>
      <ControlPanel />
    </div>
  );
}

function DropHandler({ children }) {
  const { dispatch } = useEditor();
  const toast = useToast();
  const [over, setOver] = React.useState(false);
  const dragCt = useRef(0);

  return (
    <>
      {over && <div className="drop-overlay">将工程包拖放至此 · 立即载入草稿</div>}
      <div
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
        onDragEnter={(e) => {
          e.preventDefault();
          dragCt.current++;
          if (e.dataTransfer.types.includes("Files")) setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCt.current = Math.max(0, dragCt.current - 1);
          if (dragCt.current === 0) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragCt.current = 0;
          setOver(false);
          const f = e.dataTransfer.files && e.dataTransfer.files[0];
          if (!f) return;
          if (!/\.zip$/i.test(f.name)) {
            toast.err("仅为工程包 ZIP 提供拖拽载入");
            return;
          }
          reviveFromZip(f)
            .then((card) => {
              dispatch({ type: "reset", card });
              toast.ok(`已载入草稿「${card.name || "未命名卡牌"}」`);
            })
            .catch((err) =>
              toast.err("读取工程包失败：" + (err && err.message ? err.message : "未知错误"))
            );
        }}
      >
        {children}
      </div>
    </>
  );
}

function Shell() {
  return (
    <DropHandler>
      <div className="editor-shell">
        <TopBar />
        <Workspace />
      </div>
    </DropHandler>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <EditorProvider>
        <Shell />
      </EditorProvider>
    </ToastProvider>
  );
}