"use client";

import { useEffect, useState } from "react";
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import createDOMPurify from "isomorphic-dompurify";

// IMPORTANT: import the same nodes you register in your Editor
import { nodes } from "@/components/blocks/editor-md/nodes";

const DOMPurify = createDOMPurify(
  typeof window !== "undefined" ? window : undefined
);

export function useLexicalToHtml(serializedState: string | object | null) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!serializedState) {
      setHtml("");
      return;
    }

    let mounted = true;

    try {
      // create a headless client editor with the same nodes
      const editor = createEditor({ nodes });

      // if user passed object, stringify it; if string, use it
      const stateStr =
        typeof serializedState === "string"
          ? serializedState
          : JSON.stringify(serializedState);

      // parse and set editor state (safe to parse string produced by Lexical)
      editor.setEditorState(editor.parseEditorState(stateStr));

      // generate HTML inside an update() call
      editor.update(() => {
        try {
          const generated = $generateHtmlFromNodes(editor, null);
          const safe = DOMPurify.sanitize(generated);
          if (mounted) setHtml(safe);
        } catch (err) {
          console.error("generateHtmlFromNodes error:", err);
          if (mounted) setHtml("");
        }
      });
    } catch (err) {
      console.error("useLexicalToHtml error:", err);
      if (mounted) setHtml("");
    }

    return () => {
      mounted = false;
    };
  }, [serializedState]);

  return html;
}
