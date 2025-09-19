import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Vehicle streaming API endpoint.
 *
 * Connects to the unified LangGraph orchestration backend to stream
 * vehicle-specific data for generative UI components. Uses the same
 * pattern as the main chat API but optimized for vehicle data.
 */
export async function POST(request: NextRequest) {
  console.log('🚗 Vehicle stream endpoint called');

  try {
    // Parse the request body
    const body = await request.json();
    console.log('📥 Vehicle request body:', JSON.stringify(body, null, 2));

    // Extract message from various formats (same as main chat API)
    let message = '';
    let sessionId = body.id || body.session_id || `vehicle-${Date.now()}`;

    // Handle AI SDK format with message.content (your actual format)
    if (body.message && typeof body.message === 'object' && body.message.content) {
      message = body.message.content;
    } else if (body.message && typeof body.message === 'object' && body.message.parts) {
      const textParts = body.message.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text || '');
      message = textParts.join(' ');
    } else if (body.message && typeof body.message === 'string') {
      message = body.message;
    }

    console.log('🔍 Message extraction debug:', {
      bodyMessage: body.message,
      extractedMessage: message,
      messageType: typeof body.message
    });

    // Enhanced vehicle request that explicitly triggers all agents
    const vehicleQuery = `COMPREHENSIVE VEHICLE PROFILE REQUEST for ${message}:

I need ALL agents to provide data:
1. LISTINGS: Search current marketplace listings, pricing, and availability
2. RESEARCH: Get technical specifications, features, and performance data
3. SENTIMENT: Analyze consumer sentiment from owner reviews and forums
4. MEDIA: Find photos, videos, and visual content
5. ANALYTICS: Provide market trends and pricing analytics

This is a vehicle profile request requiring comprehensive multi-agent analysis.
Please spawn all relevant agents for complete vehicle intelligence.

Target vehicle: ${message}
Request type: Full vehicle profile analysis
UI format: Structured data for generative UI components`;

    console.log('🚗 Processing vehicle query:', {
      vehicle: message.slice(0, 50),
      sessionId,
      type: 'vehicle-profile'
    });

    // Prepare the request for the backend with intelligent orchestration
    const backendBody = {
      message: vehicleQuery,  // Use enhanced vehicle query
      session_id: sessionId,
      user_context: {
        request_type: 'vehicle_profile',
        vehicle_query: message,
        ui_format: 'generative',
        ...body.user_context || {}
      },
    };

    console.log('🚀 Forwarding to CarGeek backend for vehicle data');

    // Forward the request to the standard orchestration endpoint
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

    console.log('✅ Backend responded successfully, streaming vehicle data');

    // Create a TransformStream to handle the SSE stream (same as main chat)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('✅ Vehicle stream completed');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log('📤 Vehicle stream chunk:', chunk.slice(0, 100));

            // Forward the chunk to the frontend
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('❌ Vehicle stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    // Return the streaming response with proper headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Vehicle-Request': 'true',
        'X-Session-ID': sessionId,
      },
    });

  } catch (error) {
    console.error('❌ Vehicle API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Vehicle stream failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}