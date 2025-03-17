'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { withRef } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin } from '@udecode/plate/react';

export const AIToolbarButton = withRef<typeof IconButton>(
  ({ children, ...rest }, ref) => {
    const { api } = useEditorPlugin(AIChatPlugin);

    return (
      <IconButton
        ref={ref}
        {...rest}
        onClick={() => {
          api.aiChat.show();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        size="medium"
      >
        {children}
      </IconButton>
    );
  }
);

AIToolbarButton.displayName = 'AIToolbarButton';
