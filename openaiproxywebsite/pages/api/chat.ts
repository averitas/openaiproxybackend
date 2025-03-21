import { createOpenAI } from '@ai-sdk/openai';
import { streamText, CoreAssistantMessage, CoreUserMessage } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const FunctionKey = process.env.AZ_OPENAI_TRIGGER_FUNCTION_KEY ?? ""
const FunctionEndpoint = process.env.BACKEND_GOLANG_SERVER_ENDPOINT ?? ""

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const messages = req.body.messages as (CoreUserMessage | CoreAssistantMessage)[];
  const system = req.body.system;
  let newMessages: (CoreUserMessage | CoreAssistantMessage)[] = [];
  if (system) {
    newMessages.push({
      role: 'assistant',
      content: system,
    });
  }
  if (messages) {
    newMessages = newMessages.concat(messages);
  }

  try {
    const openai = createOpenAI({
      apiKey: FunctionKey,
      baseURL: FunctionEndpoint,
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FunctionKey,
        'Authorization': req.headers['authorization'] ?? '',
        'usertoken': req.headers['usertoken'] as string ?? '',
      },
    });
    const result = streamText({
      model: openai.languageModel('o1-mini'),
      messages: newMessages,
    });

    const responseStream = result.toDataStream();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const reader = responseStream.getReader();
      
      // Stream the response
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // Write each chunk to the response
        res.write(value);
        // Use flush method if available (for streams)
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
    } catch (streamError) {
      console.error('Error streaming response:', streamError);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming error' });
      }
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  finally {
    res.end();
  }
}
