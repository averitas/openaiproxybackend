import { ReplyPayload, SSEReplyEvent, SSEUnauthorizeEvent } from '@/components/chat/chat_interfaces';
import type { NextApiRequest, NextApiResponse } from 'next'

const FunctionKey = process.env.AZ_OPENAI_TRIGGER_FUNCTION_KEY ?? ""
const FunctionEndpoint = process.env.BACKEND_GOLANG_SERVER_ENDPOINT ?? ""

export const config = {
  api: {
    // Disable body parsing (already done by Next.js)
    bodyParser: true,
    // Configure a longer timeout (in seconds)
    responseLimit: false,
    // Extend the response timeout
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  // Get session ID from query params
  const sessionId = req.body.sessionId;
  const promo = req.body.promo;

  // Set Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    const remoteSSEUrl = `${FunctionEndpoint}/chat/sse`;
    if (!FunctionEndpoint) {
      res.write('data: {"error": "SSE endpoint not configured"}\n\n');
            res.end();
      return;
    }

    // Request the remote SSE API
    const response = await fetch(remoteSSEUrl, {
        method: "POST",
      headers: {
        'x-functions-key': FunctionKey,
        'Authorization': req.headers['authorization'] ?? '',
      },
      body: JSON.stringify({
        "promo": promo,
        "sessionId": sessionId,
      }),
    });
    const decoder = new TextDecoder();
    
    if (!response.ok) {
      console.error('SSE Error: Failed to connect, status:', response.status);
      let resp = await response.json();
      let event = {
        type: 'unauthorize',
        payload: {
          is_from_self: false,
          content: resp?.Message ? resp.Message : "Failed to connect, status: " + response.status,
          session_id: sessionId,
          is_final: true,
        } as ReplyPayload,
      } as SSEUnauthorizeEvent;
      res.write('data:' + JSON.stringify(event) + '\n\n')
            res.end();
      return;
    }
    
    if (!response.body) {
      console.error('SSE Error: No response body from remote SSE');
      res.write('data: {"error": "No response body from remote SSE"}\n\n');
            res.end();
      return;
    }

    // Pipe the remote SSE stream to the client
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      if (!chunk.startsWith('data:')) {
        console.error('SSE Error: Unexpected chunk:', chunk);
        let resp = JSON.parse(chunk);
        let event = {
            type: 'reply',
            payload: {
                is_from_self: false,
                content: resp?.message ?? 'Error happened: ' + chunk,
                session_id: sessionId,
                is_final: true,
            } as ReplyPayload,
        } as SSEReplyEvent;
        res.write('data:' + JSON.stringify(event) + "\n\n")
      }
      else{
        res.write(chunk);
      }
    }
  } catch (error) {
    console.error('SSE Error:', error);
    res.write('data: {"error": "An exception occurred"}\n\n');
  } finally {
        res.end();
  }
}
