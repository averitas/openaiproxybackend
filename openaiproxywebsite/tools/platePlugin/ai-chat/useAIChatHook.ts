import { deserializeInlineMd } from '@udecode/plate-markdown';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import type { AIChatPluginConfig } from './AIChatPlugin';

import { useChatChunk } from './hooks/useChatChunk';
import { withAIBatch } from './transforms';
import { AIPluginConfig } from '@udecode/plate-ai/react';

export const useAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const mode = usePluginOption({ key: 'aiChat' } as AIChatPluginConfig, 'mode');

  useChatChunk({
    onChunk: ({ isFirst, nodes }) => {
      if (mode === 'insert' && nodes.length > 0) {
        withAIBatch(
          editor,
          () => {
            tf.ai.insertNodes(nodes);
          },
          { split: isFirst }
        );
      }
    },
    onFinish: ({ content }) => {
      if (mode !== 'insert') return;

      const blockAbove = editor.api.block();

      if (!blockAbove) return;

      editor.undo();
      editor.history.redos.pop();

      const nodes = deserializeInlineMd(editor, content);

      withAIBatch(
        editor,
        () => {
          tf.ai.insertNodes(nodes);
        },
        { split: true }
      );
    },
  });
};
