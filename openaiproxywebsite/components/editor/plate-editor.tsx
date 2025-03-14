'use client';

import { type Value, serializeHtml } from '@udecode/plate';
import { Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

interface PlateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlateEditor({ value, onChange }: PlateEditorProps) {

  // default
  let contentObj = [{ text: value }];

  // try to parse
  try {
    contentObj = JSON.parse(value);
    if (!Array.isArray(contentObj)) {
      throw new Error('Invalid content format');
    }
  } catch (error) {
    console.log(error);
  }

  const wrappedOnChange = (newValue: Value) => {
    const str = JSON.stringify(newValue);
    onChange(str);
  }

  const editor = useCreateEditor(contentObj);

  return (
    <Plate editor={editor} onChange={({ value }) => { wrappedOnChange(value) }}>
      <EditorContainer>
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate >
  );
}
