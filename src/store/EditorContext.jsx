import React, { createContext, useContext, useReducer } from "react";
import { editorReducer, initialEditorState } from "../core/reducer";
import { createSampleCard } from "../core/sample";

const EditorCtx = createContext(null);

export function EditorProvider({ children, initialCard }) {
  const [state, dispatch] = useReducer(
    editorReducer,
    undefined,
    () => initialEditorState(initialCard || createSampleCard())
  );
  return (
    <EditorCtx.Provider value={{ state, dispatch }}>
      {children}
    </EditorCtx.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}