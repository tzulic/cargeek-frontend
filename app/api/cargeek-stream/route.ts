import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  console.log('🔧 Development mode: Auth handled by backend');

  try {
    // Parse the request body
    const body = await request.json();
    console.log('📥 Received request body:', JSON.stringify(body, null, 2));

    // Extract message from various formats
    let message = '';
    let sessionId = body.id || body.session_id || `session-${Date.now()}`;

    // Handle AI SDK format with message.parts
    if (body.message && typeof body.message === 'object' && body.message.parts) {
      const textParts = body.message.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text || '');
      message = textParts.join(' ');
    } else if (body.message && typeof body.message === 'string') {
      message = body.message;
    }

    console.log('📝 Extracted message:', {
      message: message.slice(0, 50),
      type: typeof message,
      length: message.length,
    });

    // Prepare the request for the backend
    const backendBody = {
      message,
      session_id: sessionId,
      user_context: body.user_context || {},
    };

    console.log('🚀 Forwarding to CarGeek backend:', {
      message: `${message.slice(0, 50)}...`,
      session_id: sessionId,
      dev_mode: true,
      message_type: typeof message,
    });

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/orchestration/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(backendBody),
    });

    if (!backendResponse.ok) {
      console.error('❌ Backend error:', backendResponse.status, backendResponse.statusText);
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    console.log('✅ Backend responded successfully, streaming response');

    // Create a transform stream to handle SSE parsing and logging
    const decoder = new TextDecoder();
    let buffer = '';

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // Decode the chunk and add to buffer
        const text = decoder.decode(chunk, { stream: true });
        buffer += text;

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix

            // Log what we're receiving for debugging
            if (data === '[DONE]') {
              console.log('📍 Received [DONE] marker');
            } else {
              try {
                const parsed = JSON.parse(data);
                console.log(`📦 Processing event: ${parsed.type}`,
                  parsed.type === 'text-delta' ? `"${parsed.delta?.slice(0, 50)}..."` : '',
                  parsed.type === 'data' ? JSON.stringify(parsed.data).slice(0, 100) : '');

                // Backend now sends AI SDK format directly: {"type": "data-research", "data": {...}}
                // No transformation needed - pass through data-* events directly
                if (parsed.type && parsed.type.startsWith('data-')) {
                  console.log(`✅ Passing through data event: ${parsed.type}`);
                  // Event is already in correct AI SDK format, pass through as-is
                }

                // Make sure finish event is passed through correctly
                if (parsed.type === 'finish') {
                  console.log('✅ Passing through finish event');
                }
              } catch (e) {
                console.log('📦 Processing raw data:', data.slice(0, 100));
              }
            }

            // Re-encode and forward the complete SSE event
            const eventLine = `data: ${data}\n\n`;
            controller.enqueue(new TextEncoder().encode(eventLine));
          }
        }
      },

      flush(controller) {
        // Process any remaining buffer content
        if (buffer.trim()) {
          if (buffer.startsWith('data: ')) {
            const eventLine = `${buffer}\n\n`;
            controller.enqueue(new TextEncoder().encode(eventLine));
          }
        }
      }
    });

    // Stream the backend response through the transform
    const reader = backendResponse.body!.getReader();
    const writer = transformStream.writable.getWriter();

    // Start streaming process but don't await it
    const streamPromise = (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('🏁 Backend stream completed');
            await writer.close();
            break;
          }
          await writer.write(value);
        }
      } catch (error) {
        console.error('Stream processing error:', error);
        // Don't abort on timeout errors - just close normally
        if (error instanceof Error && error.message.includes('timeout')) {
          console.log('Stream timeout - closing gracefully');
          await writer.close();
        } else {
          await writer.abort(error);
        }
      }
    })();

    // Return the transformed stream with proper headers for AI SDK data stream protocol
    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream', // SSE format
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-vercel-ai-ui-message-stream': 'v1', // Required header for AI SDK UI message stream protocol
      },
    });
  } catch (error) {
    console.error('❌ Error in cargeek-stream route:', error);

    // Return error in AI SDK data stream format
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorEvent = {
      type: 'error',
      errorText: errorMessage
    };

    return new Response(
      `data: ${JSON.stringify(errorEvent)}\n\ndata: [DONE]\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'x-vercel-ai-ui-message-stream': 'v1',
        },
      }
    );
  }
}