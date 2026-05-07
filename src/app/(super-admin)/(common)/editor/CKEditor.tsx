"use client";

import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface CustomEditorProps {
  data: string;
  onChange: (data: string) => void;
}

export default function CustomEditor({ data, onChange }: CustomEditorProps) {
  const config = {
    licenseKey: "GPL",
    toolbar: [
      "heading", "|",
      "bold", "italic", "underline", "strikethrough", "|",
      "bulletedList", "numberedList", "|",
      "blockQuote", "link", "|",
      "undo", "redo"
    ]
  };

  return (
    <div className="ck-editor-wrapper">
      <CKEditor
      //@ts-expect-error ignore this message
        editor={ClassicEditor}
        data={data}
        config={config}
        onChange={(event, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}