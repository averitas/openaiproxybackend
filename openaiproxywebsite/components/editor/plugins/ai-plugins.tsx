'use client';

import React from 'react';

import { AIPlugin } from '@udecode/plate-ai/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';

import { AIMenu } from '@/components/plate-ui/ai-menu';

import { cursorOverlayPlugin } from './cursor-overlay-plugin';
import { AIChatPlugin } from '@/tools/platePlugin/ai-chat';

const systemCommon = `\
You are an advanced AI-powered note-taking assistant, designed to enhance productivity and creativity in note management.
Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.

Rules:
- <Document> is the entire note the user is working on.
- <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
- Anything else is the user prompt.
- Your response should be tailored to the user's prompt, providing precise assistance to optimize note management.
- For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
- For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
- CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
`;

const systemDefault = `\
${systemCommon}
- <Block> is the current block of text the user is working on.
- Ensure your output can seamlessly fit into the existing <Block> structure.
- CRITICAL: Provide only a single block of text. DO NOT create multiple paragraphs or separate blocks.
<Block>
{block}
</Block>
`;

const systemSelecting = `\
${systemCommon}
- <Block> is the block of text containing the user's selection, providing context.
- Ensure your output can seamlessly fit into the existing <Block> structure.
- <Selection> is the specific text the user has selected in the block and wants to modify or ask about.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>.
<Block>
{block}
</Block>
<Selection>
{selection}
</Selection>
`;

const systemBlockSelecting = `\
${systemCommon}
- <Selection> represents the full blocks of text the user has selected and wants to modify or ask about.
- Your response should be a direct replacement for the entire <Selection>.
- Maintain the overall structure and formatting of the selected blocks, unless explicitly instructed otherwise.
- CRITICAL: Provide only the content to replace <Selection>. Do not add additional blocks or change the block structure unless specifically requested.
<Selection>
{block}
</Selection>
`;

const userDefault = `<Reminder>
CRITICAL: DO NOT use block formatting. You can only use inline formatting.
CRITICAL: DO NOT start new lines or paragraphs.
NEVER write <Block>.
</Reminder>
{prompt}`;

const userSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the text to replace <Selection>. No explanations.
Ensure it fits seamlessly within <Block>. If <Block> is empty, write ONE random sentence.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about: <Selection>`;

const userBlockSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the content to replace the entire <Selection>. No explanations.
Maintain the overall structure unless instructed otherwise.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about: <Selection>`;

export const PROMPT_TEMPLATES = {
  systemBlockSelecting,
  systemDefault,
  systemSelecting,
  userBlockSelecting,
  userDefault,
  userSelecting,
};

export const aiPlugins = [
  cursorOverlayPlugin,
  MarkdownPlugin.configure({ options: { indentList: true } }),
  AIPlugin,
  AIChatPlugin.configure({
    options: {
      promptTemplate: ({ isBlockSelecting, isSelecting }) => {
        return isBlockSelecting
          ? PROMPT_TEMPLATES.userBlockSelecting
          : isSelecting
            ? PROMPT_TEMPLATES.userSelecting
            : PROMPT_TEMPLATES.userDefault;
      },
      systemTemplate: ({ isBlockSelecting, isSelecting }) => {
        return isBlockSelecting
          ? PROMPT_TEMPLATES.systemBlockSelecting
          : isSelecting
            ? PROMPT_TEMPLATES.systemSelecting
            : PROMPT_TEMPLATES.systemDefault;
      },
    },
    render: { afterEditable: () => <AIMenu /> },
  }),
] as const;