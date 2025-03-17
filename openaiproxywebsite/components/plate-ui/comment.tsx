'use client';

import React, { useState } from 'react';
import type { Value } from '@udecode/plate';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { Plate, useEditorPlugin, useStoreValue } from '@udecode/plate/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Check as CheckIcon,
  MoreHoriz as MoreHorizontalIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
  Close as XIcon,
} from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';

import {
  discussionStore,
  useFakeCurrentUserId,
  useFakeUserInfo,
} from './block-discussion';
import { useCommentEditor } from './comment-create-form';
import { Editor, EditorContainer } from './editor';

dayjs.extend(relativeTime);

export const formatCommentDate = (date: Date) => {
  const now = dayjs();
  const commentDate = dayjs(date);
  const diffMinutes = now.diff(commentDate, 'minute');
  const diffHours = now.diff(commentDate, 'hour');
  const diffDays = now.diff(commentDate, 'day');

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays < 2) {
    return `${diffDays}d`;
  }

  return commentDate.format('MM/DD/YYYY');
};

export interface TComment {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
}

export function Comment(props: {
  comment: TComment;
  discussionLength: number;
  editingId: string | null;
  index: number;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  documentContent?: string;
  showDocumentContent?: boolean;
  onEditorClick?: () => void;
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
  } = props;

  const discussions = useStoreValue(discussionStore, 'discussions');
  const userInfo = useFakeUserInfo(comment.userId);
  const currentUserId = useFakeCurrentUserId();

  const resolveDiscussion = async (id: string) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === id) {
        return { ...discussion, isResolved: true };
      }
      return discussion;
    });
    discussionStore.set('discussions', updatedDiscussions);
  };

  const removeDiscussion = async (id: string) => {
    const updatedDiscussions = discussions.filter(
      (discussion: any) => discussion.id !== id
    );
    discussionStore.set('discussions', updatedDiscussions);
  };

  const updateComment = async (input: {
    id: string;
    contentRich: any;
    discussionId: string;
    isEdited: boolean;
  }) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === input.discussionId) {
        const updatedComments = discussion.comments.map((comment) => {
          if (comment.id === input.id) {
            return {
              ...comment,
              contentRich: input.contentRich,
              isEdited: true,
              updatedAt: new Date(),
            };
          }
          return comment;
        });
        return { ...discussion, comments: updatedComments };
      }
      return discussion;
    });
    discussionStore.set('discussions', updatedDiscussions);
  };

  const { tf } = useEditorPlugin(CommentsPlugin);

  const isMyComment = currentUserId === comment.userId;

  const initialValue = comment.contentRich;

  const commentEditor = useCommentEditor(
    {
      id: comment.id,
      value: initialValue,
    },
    [initialValue]
  );

  const onCancel = () => {
    setEditingId(null);
    commentEditor.tf.replaceNodes(initialValue, {
      at: [],
      children: true,
    });
  };

  const onSave = () => {
    void updateComment({
      id: comment.id,
      contentRich: commentEditor.children,
      discussionId: comment.discussionId,
      isEdited: true,
    });
    setEditingId(null);
  };

  const onResolveComment = () => {
    void resolveDiscussion(comment.discussionId);
    tf.comment.unsetMark({ id: comment.discussionId });
  };

  const onRemoveComment = () => {
    if (discussionLength === 1) {
      tf.comment.unsetMark({ id: comment.discussionId });
      void removeDiscussion(comment.discussionId);
    }
  };

  const isFirst = index === 0;
  const isLast = index === discussionLength - 1;
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      sx={{ position: 'relative', mb: 2 }}
    >
      <Box display="flex" alignItems="center">
        <Avatar src={userInfo?.avatarUrl} sx={{ width: 24, height: 24 }}>
          {userInfo?.name?.[0]}
        </Avatar>
        <Typography variant="subtitle2" sx={{ mx: 1 }}>
          {userInfo?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatCommentDate(comment.createdAt)}
          {comment.isEdited && ' (edited)'}
        </Typography>

        {isMyComment && (hovering || openMenu) && (
          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            {index === 0 && (
              <IconButton size="small" onClick={onResolveComment}>
                <CheckIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem
                onClick={() => {
                  setEditingId(comment.id);
                  handleMenuClose();
                }}
              >
                <PencilIcon fontSize="small" sx={{ mr: 1 }} />
                Edit comment
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onRemoveComment?.();
                  handleMenuClose();
                }}
              >
                <TrashIcon fontSize="small" sx={{ mr: 1 }} />
                Delete comment
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>

      {isFirst && showDocumentContent && documentContent && (
        <Box sx={{ pl: 4, mt: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {documentContent}
          </Typography>
        </Box>
      )}

      <Box sx={{ pl: 4, mt: 1, position: 'relative' }}>
        {!isLast && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 12,
              height: '100%',
              width: '2px',
              bgcolor: 'divider',
            }}
          />
        )}
        <Plate readOnly={!isEditing} editor={commentEditor}>
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="w-auto grow"
              onClick={() => onEditorClick?.()}
            />
            {isEditing && (
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={onCancel}>
                  <XIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary" onClick={onSave}>
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </EditorContainer>
        </Plate>
      </Box>
    </Box>
  );
}
