import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';
import type { AIChatPluginConfig } from '../AIChatPlugin';
import { AIPlugin } from '@udecode/plate-ai/react';
import type { History, SlateEditor } from '@udecode/plate';

export type AIBatch = History['undos'][number] & { ai?: boolean };

export const withAIBatch = (
  editor: SlateEditor,
  fn: () => void,
  {
    split,
  }: {
    split?: boolean;
  } = {}
) => {
  if (split) {
    editor.tf.withNewBatch(fn);
  } else {
    editor.tf.withMerging(fn);
  }

  const lastBatch = editor.history.undos?.at(-1) as AIBatch | undefined;

  if (lastBatch) {
    lastBatch.ai = true;
  }
};


export const acceptAIChat = (editor: PlateEditor) => {
  const { tf } = getEditorPlugin(editor, AIPlugin);

  withAIBatch(editor, () => {
    tf.ai.removeMarks();
  });

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();
  editor.tf.focus();
};
