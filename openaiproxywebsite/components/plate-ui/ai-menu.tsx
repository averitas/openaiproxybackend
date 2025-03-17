'use client';

import * as React from 'react';
import { 
  Popover, 
  TextField, 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  styled 
} from '@mui/material';

import { type NodeEntry, isHotkey } from '@udecode/plate';
import {
  AIChatPlugin,
  useEditorChat,
  useLastAssistantMessage,
} from '@udecode/plate-ai/react';
import {
  BlockSelectionPlugin,
  useIsSelecting,
} from '@udecode/plate-selection/react';
import {
  useEditorPlugin,
  useHotkeys,
  usePluginOption,
} from '@udecode/plate/react';

import { useChat } from '@/components/editor/use-chat';

import { AIChatEditor } from './ai-chat-editor';
import { AIMenuItems } from './ai-menu-items';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  overflow: 'hidden',
}));

// Fix: Use Box instead of non-existent Command component
const CommandContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
    '& fieldset': {
      border: 'none',
    },
  }
}));

const LoaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

export function AIMenu() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const open = usePluginOption(AIChatPlugin, 'open');
  const mode = usePluginOption(AIChatPlugin, 'mode');
  const isSelecting = useIsSelecting();

  const [value, setValue] = React.useState('');

  const chat = useChat();

  // Fix: Store isLoading in a local variable to avoid deprecation warning
  const { input, messages, setInput } = chat;
  const isLoading = chat.isLoading;
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null
  );

  const content = useLastAssistantMessage()?.content;

  const setOpen = (open: boolean) => {
    if (open) {
      api.aiChat.show();
    } else {
      api.aiChat.hide();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      show(editor.api.toDOMNode(blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        setAnchorElement(null);
        setInput('');
      }
    },
    onOpenCursor: () => {
      const [ancestor] = editor.api.block({ highest: true })!;

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.set(ancestor.id as string);
      }

      show(editor.api.toDOMNode(ancestor)!);
    },
    onOpenSelection: () => {
      show(editor.api.toDOMNode(editor.api.blocks().at(-1)![0])!);
    },
  });

  useHotkeys(
    'meta+j',
    () => {
      api.aiChat.show();
    },
    { enableOnContentEditable: true, enableOnFormTags: true }
  );

  // Calculate anchorEl position for the popover
  const anchorPosition = React.useMemo(() => {
    if (!anchorElement) return undefined;
    
    return {
      top: anchorElement.getBoundingClientRect().bottom,
      left: anchorElement.getBoundingClientRect().left,
    };
  }, [anchorElement]);

  return (
    <Popover
      open={Boolean(open && anchorElement)}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      onClose={() => setOpen(false)}
      // Fix: Replace deprecated PaperProps with slotProps
      slotProps={{
        paper: {
          sx: {
            width: anchorElement?.offsetWidth || 'auto',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
          }
        }
      }}
      sx={{
        pointerEvents: 'none',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      keepMounted
    >
      <StyledPaper sx={{ pointerEvents: 'auto' }}>
        {/* Fix: Remove value and onChange from CommandContainer */}
        <CommandContainer>
          <Box>
            {mode === 'chat' && isSelecting && content && (
              <AIChatEditor content={content} />
            )}

            {isLoading ? (
              <LoaderContainer>
                <CircularProgress size={16} />
                <Typography variant="body2" color="textSecondary">
                  {messages.length > 1 ? 'Editing...' : 'Thinking...'}
                </Typography>
              </LoaderContainer>
            ) : (
              <StyledTextField
                variant="outlined"
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (isHotkey('backspace')(e as any) && input.length === 0) {
                    e.preventDefault();
                    api.aiChat.hide();
                  }
                  if (isHotkey('enter')(e as any) && !e.shiftKey && !value) {
                    e.preventDefault();
                    void api.aiChat.submit();
                  }
                }}
                placeholder="Ask AI anything..."
                autoFocus
                InputProps={{
                  sx: { px: 2, py: 1 }
                }}
              />
            )}
          </Box>

          {!isLoading && <AIMenuItems setValue={setValue} />}
        </CommandContainer>
      </StyledPaper>
    </Popover>
  );
}
