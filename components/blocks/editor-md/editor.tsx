"use client";

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";

import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { nodes } from "./nodes";
import { Plugins } from "./plugins";

type EditorProps = {
  editorSerializedState?: SerializedEditorState | null;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (serializedState: SerializedEditorState) => void;
};

const baseConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: error) => {
    console.error("[Lexical]", error);
  },
};

export function Editor({
  editorSerializedState,
  onChange,
  onSerializedChange,
}: EditorProps) {
  const initialConfig = editorSerializedState
    ? {
        ...baseConfig,
        // This is the correct way to hydrate from JSON
        editorState: (editor) => {
          try {
            const parsed = editor.parseEditorState(editorSerializedState);
            editor.setEditorState(parsed);
          } catch (e) {
            console.error("Failed to parse saved editor state", e);
          }
        },
      }
    : baseConfig;

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
