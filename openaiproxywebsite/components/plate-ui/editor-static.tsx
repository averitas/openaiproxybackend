import React from 'react';

import type { VariantProps } from 'class-variance-authority';

import { cn, withProps } from '@udecode/cn';
import { type PlateStaticProps, BaseParagraphPlugin, PlateStatic, SlateLeaf } from '@udecode/plate';
import { cva } from 'class-variance-authority';
import { BaseAudioPlugin, BaseFilePlugin, BaseImagePlugin, BaseVideoPlugin } from '@udecode/plate-media';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { BaseBoldPlugin, BaseCodePlugin, BaseItalicPlugin, BaseStrikethroughPlugin, BaseSubscriptPlugin, BaseSuperscriptPlugin, BaseUnderlinePlugin } from '@udecode/plate-basic-marks';
import { BaseCodeBlockPlugin, BaseCodeLinePlugin, BaseCodeSyntaxPlugin } from '@udecode/plate-code-block';
import { BaseTocPlugin, HEADING_KEYS } from '@udecode/plate-heading';
import { BaseTableCellHeaderPlugin, BaseTableCellPlugin, BaseTablePlugin, BaseTableRowPlugin } from '@udecode/plate-table';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseCommentsPlugin } from '@udecode/plate-comments';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@udecode/plate-math';
import { BaseDatePlugin } from '@udecode/plate-date';
import { BaseHighlightPlugin } from '@udecode/plate-highlight';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseKbdPlugin } from '@udecode/plate-kbd';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import { BlockquoteElementStatic } from './blockquote-element-static';
import { CodeBlockElementStatic } from './code-block-element-static';
import { CodeLeafStatic } from './code-leaf-static';
import { CodeLineElementStatic } from './code-line-element-static';
import { CodeSyntaxLeafStatic } from './code-syntax-leaf-static';
import { ColumnElementStatic } from './column-element-static';
import { ColumnGroupElementStatic } from './column-group-element-static';
import { DateElementStatic } from './date-element-static';
import { EquationElementStatic } from './equation-element-static';
import { HeadingElementStatic } from './heading-element-static';
import { HighlightLeafStatic } from './highlight-leaf-static';
import { HrElementStatic } from './hr-element-static';
import { InlineEquationElementStatic } from './inline-equation-element-static';
import { KbdLeafStatic } from './kbd-leaf-static';
import { LinkElementStatic } from './link-element-static';
import { MentionElementStatic } from './mention-element-static';
import { ParagraphElementStatic } from './paragraph-element-static';
import { TableCellHeaderStaticElement, TableCellElementStatic } from './table-cell-element-static';
import { TableElementStatic } from './table-element-static';
import { TableRowElementStatic } from './table-row-element-static';
import { TocElementStatic } from './toc-element-static';
import { ToggleElementStatic } from './toggle-element-static';
import { MediaVideoElementStatic } from './media-video-element-static';
import { CommentLeafStatic } from './comment-leaf-static';
import { MediaFileElementStatic } from './media-file-element-static';
import { ImageElementStatic } from './image-element-static';

export const editorVariants = cva(
  cn(
    'group/editor',
    'relative w-full cursor-text overflow-x-hidden break-words whitespace-pre-wrap select-text',
    'rounded-md ring-offset-background focus-visible:outline-none',
    'placeholder:text-muted-foreground/80 **:data-slate-placeholder:top-[auto_!important] **:data-slate-placeholder:text-muted-foreground/80 **:data-slate-placeholder:opacity-100!',
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      variant: 'none',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      variant: {
        ai: 'w-full px-0 text-base md:text-sm',
        aiChat:
          'max-h-[min(70vh,320px)] w-full max-w-[700px] overflow-y-auto px-5 py-3 text-base md:text-sm',
        default:
          'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        demo: 'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'size-full px-16 pt-4 pb-72 text-base sm:px-24',
        none: '',
        select: 'px-3 py-2 text-base data-readonly:w-fit',
      },
    },
  }
);

export const StaticComponents = {
  // [BaseAudioPlugin.key]: MediaAudioElementStatic,
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseColumnItemPlugin.key]: ColumnElementStatic,
  [BaseColumnPlugin.key]: ColumnGroupElementStatic,
  [BaseCommentsPlugin.key]: CommentLeafStatic,
  [BaseDatePlugin.key]: DateElementStatic,
  [BaseEquationPlugin.key]: EquationElementStatic,
  [BaseFilePlugin.key]: MediaFileElementStatic,
  [BaseHighlightPlugin.key]: HighlightLeafStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseImagePlugin.key]: ImageElementStatic,
  [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
  [BaseKbdPlugin.key]: KbdLeafStatic,
  [BaseLinkPlugin.key]: LinkElementStatic,
  // [BaseMediaEmbedPlugin.key]: MediaEmbedElementStatic,
  [BaseMentionPlugin.key]: MentionElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 'del' }),
  [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: 'sub' }),
  [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: 'sup' }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellElementStatic,
  [BaseTablePlugin.key]: TableElementStatic,
  [BaseTableRowPlugin.key]: TableRowElementStatic,
  [BaseTocPlugin.key]: TocElementStatic,
  [BaseTogglePlugin.key]: ToggleElementStatic,
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),
  [BaseVideoPlugin.key]: MediaVideoElementStatic,
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
  [HEADING_KEYS.h4]: withProps(HeadingElementStatic, { variant: 'h4' }),
  [HEADING_KEYS.h5]: withProps(HeadingElementStatic, { variant: 'h5' }),
  [HEADING_KEYS.h6]: withProps(HeadingElementStatic, { variant: 'h6' }),
};

export function EditorStatic({
  children,
  className,
  variant,
  ...props
}: PlateStaticProps & VariantProps<typeof editorVariants>) {
  return (
    <PlateStatic
      className={cn(editorVariants({ variant }), className)}
      {...props}
    />
  );
}
