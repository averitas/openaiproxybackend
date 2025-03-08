import { ReplyPayload, SSEReplyEvent, SSEUnauthorizeEvent, SSETokenStatEvent } from '@/components/chat/chat_interfaces';
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

  // Helper function to write and flush data
  const writeAndFlush = (data: string) => {
    res.write(data);
    
    // Use flush method if available (for streams)
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  };

  // Set up heartbeat interval - reduced to 10 seconds to prevent connection timeouts
  const heartbeatInterval = 10000; // 10 seconds
  let heartbeatTimer: NodeJS.Timeout | null = null;
  
  const sendHeartbeat = () => {
    const heartbeat: SSETokenStatEvent = {
      type: 'token_stat',
      message_id: `heartbeat-${Date.now()}`,
      payload: {
        session_id: sessionId,
        request_id: `heartbeat-${Date.now()}`,
        token_count: 0,
        used_count: 0,
        free_count: 0,
        order_count: 0,
        status_summary: "Connection alive",
        status_summary_title: "Heartbeat",
        elapsed: 0,
        record_id: `heartbeat-${Date.now()}`,
        trace_id: `heartbeat-${Date.now()}`,
        procedures: []
      }
    };
    writeAndFlush('data:' + JSON.stringify(heartbeat) + '\n\n');
  };

  try {
    const remoteSSEUrl = `${FunctionEndpoint}/chat/sse`;
    if (!FunctionEndpoint) {
      writeAndFlush('data: {"error": "SSE endpoint not configured"}\n\n');
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
      let resp = await response.json();
      console.error('SSE Error: Failed to connect, status:', response.status, resp);
      res.status(response.status).json(resp);
      res.end();
      return;
    }
    
    if (!response.body) {
      console.error('SSE Error: No response body from remote SSE');
      res.status(204).end();
      return;
    }

    // Set Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
      'Transfer-Encoding': 'chunked',
    });

    // Make sure headers are sent immediately
    if (res.flushHeaders) {
      res.flushHeaders();
    }

    // Start the heartbeat
    heartbeatTimer = setInterval(sendHeartbeat, heartbeatInterval);
    
    // Send initial heartbeat
    sendHeartbeat();

    // Pipe the remote SSE stream to the client
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      
      // Split by double newline to handle multiple messages in one chunk
      const messages = chunk.split('\n\n');
      for (const message of messages) {
        const trimmedMessage = message.trim();
        if (!trimmedMessage.trim()) continue;
        
        if (!trimmedMessage.startsWith('data:')) {
          console.error('SSE Error: Unexpected message format:', trimmedMessage);
          try {
            let resp = JSON.parse(trimmedMessage);
            let event = {
              type: 'reply',
              payload: {
                is_from_self: false,
                content: resp?.message ?? 'Error happened: ' + trimmedMessage,
                session_id: sessionId,
                is_final: true,
              } as ReplyPayload,
            } as SSEReplyEvent;
            writeAndFlush('data:' + JSON.stringify(event) + '\n\n');
          } catch (e) {
            console.error('Error parsing unexpected message:', e);
            console.error('Error Message is', trimmedMessage);
          }
        } else {
          writeAndFlush(trimmedMessage + '\n\n');
        }
      }
    }
  } catch (error) {
    console.error('SSE Error:', error);
    writeAndFlush('data: {"error": "An exception occurred"}\n\n');
  } finally {
    // Clear the heartbeat interval
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    res.end();
  }
}
