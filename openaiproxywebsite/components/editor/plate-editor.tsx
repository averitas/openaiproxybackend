'use client';

import React, { act, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Box, Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { Value } from '@udecode/plate';

export interface PlateEditorProps {
  dataRegistry: string;
  noteContent: string;
  setNoteContent: (content: string) => void;
}

export function PlateEditor(props: PlateEditorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const activeNote = useSelector((state: RootState) => state.notes.activeNote);

  const noteToEditor = (noteContent: string) => {
    console.log('noteToEditor called with:', noteContent.substring(0, 20) + '...');
    let content = [{ children: [{ text: 'Start writing here...' }] }];

    try {
      // Try to parse the content as JSON (Plate format)
      content = JSON.parse(noteContent);

      if (!Array.isArray(content)) {
        throw new Error('Invalid content format');
      }
    } catch (err) {
      // If parsing fails, create a simple text node
      console.error('Error parsing note content:', err);
      // For HTML content, create a simple fallback
      if (noteContent.includes('<p>')) {
        // Strip HTML tags for simple fallback text
        const plainText = noteContent.replace(/<[^>]*>?/gm, '');
        content = [{ children: [{ text: plainText || 'Start writing here...' }] }];
      }
    }
    console.log('Setting editor content:', content);

    return content as unknown as Value;
  }

  // Memoize the editor value to prevent unnecessary recalculations
  const editorValue = useMemo(() => {
    return noteToEditor(props.noteContent);
  }, [props.noteContent]);

  const editor = useCreateEditor({value: editorValue});

  // Editor content change handler that updates Redux state
  const editorChangeHandler = (obj) => {
    // Convert editor value to JSON string for storage
    const valueJson = JSON.stringify(obj.value);
    // Only update if content actually changed
    if (valueJson !== props.noteContent) {
      props.setNoteContent(valueJson);
    }
  }

  return (
    <Box data-registry={props.dataRegistry}>
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor} onValueChange={editorChangeHandler} >
          <EditorContainer>
            <Editor variant="demo" />
          </EditorContainer>
          <SettingsDialog />
        </Plate>
      </DndProvider>
    </Box>
  );
}
