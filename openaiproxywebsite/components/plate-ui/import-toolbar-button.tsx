'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { getEditorDOMFromHtmlString } from '@udecode/plate';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { useEditorRef } from '@udecode/plate/react';
import { ArrowUpToLineIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton, ToolbarSplitButton, ToolbarSplitButtonPrimary, ToolbarSplitButtonSecondary } from './toolbar';

type ImportType = 'html' | 'markdown';

export function ImportToolbarButton({ children, ...props }: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const [type, setType] = React.useState<ImportType>('html');
  const accept = type === 'html' ? ['text/html'] : ['.md'];

  const getFileNodes = (text: string, type: ImportType) => {
    if (type === 'html') {
      const editorNode = getEditorDOMFromHtmlString(text);
      const nodes = editor.api.html.deserialize({
        element: editorNode,
      });

      return nodes;
    }

    const nodes = editor.getApi(MarkdownPlugin).markdown.deserialize(text);

    return nodes;
  };

  const { openFilePicker } = useFilePicker({
    accept,
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, type);

      editor.tf.insertNodes(nodes);
    },
  });

  return (
    <ToolbarSplitButton pressed={openState.open}>
      <ToolbarSplitButtonPrimary
        tooltip="Import"
        onClick={() => {
          setType('html');
          openFilePicker();
        }}
      >
        <ArrowUpToLineIcon className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu {...openState} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setType('html');
                openFilePicker();
              }}
            >
              Import from HTML
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setType('markdown');
                openFilePicker();
              }}
            >
              Import from Markdown
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}
