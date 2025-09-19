/**
 * Vehicle profile dashboard with modular widget architecture.
 *
 * Main composition component that orchestrates the modular vehicle
 * analysis dashboard using atomic widgets and progressive layout.
 * Follows strict modularity rules from backup architecture.
 *
 * @component
 * @example
 * ```tsx
 * <VehicleProfileDashboard vehicleId="tesla-model-3" />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextDelta } from '@/components/generative-ui/text-delta';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { sessionManager } from '@/lib/session-manager';
import { agentDataParser } from '@/lib/utils/agent-data-parser';
import { ModularVehicleDashboard } from './vehicle/modular-vehicle-dashboard';
import type {
  AgentResults,
  StreamingEvent
} from '@/lib/types/agent-data';

interface VehicleProfileDashboardProps {
  vehicleId: string;
  sessionId?: string; // Optional shared session with chat
}

/**
 * Vehicle profile dashboard with generative UI components.
 *
 * Connects to LangGraph agents via streaming API to display real-time
 * vehicle data, listings, sentiment analysis, and agent status.
 */
export function VehicleProfileDashboard({
  vehicleId,
  sessionId
}: VehicleProfileDashboardProps): ReactElement {
  // Use proper TypeScript types for agent data
  const [agentResults, setAgentResults] = useState<AgentResults>({
    total_agents: 0,
    completed_agents: 0,
    active_agents: [],
    last_updated: new Date().toISOString()
  });
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [partialDataAvailable, setPartialDataAvailable] = useState(false);
  const [showPartialData, setShowPartialData] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Use shared session ID for background updates, or get managed session
  const effectiveSessionId = sessionId || sessionManager.getVehicleSession(vehicleId);

  // Setup agent data parser for this session
  const updateAgentResults = useCallback((newResults: AgentResults) => {
    setAgentResults(newResults);
    console.log('🔄 Agent results updated:', {
      completed: newResults.completed_agents,
      active: newResults.active_agents.length,
      hasListings: !!newResults.listings,
      hasResearch: !!newResults.research,
      hasSentiment: !!newResults.sentiment,
      hasMedia: !!newResults.media
    });
  }, []);

  useEffect(() => {
    const parserId = `vehicle-${vehicleId}`;
    agentDataParser.onUpdate(parserId, updateAgentResults);

    return () => {
      agentDataParser.offUpdate(parserId);
    };
  }, [vehicleId, updateAgentResults]);

  // Connect to vehicle-specific streaming endpoint using shared session
  const { messages, sendMessage, status } = useChat({
    id: effectiveSessionId,
    initialMessages: [],
    transport: new DefaultChatTransport({
      api: '/api/vehicle-stream',
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            vehicleId,
            requestType: 'vehicle-profile',
            ...body,
          },
        };
      },
    }),
    onFinish: (message) => {
      console.log('🔍 Vehicle stream finished, message:', message);
      console.log('📊 Session info:', sessionManager.getSessionInfo(effectiveSessionId));

      // Parse final message for any remaining structured data
      try {
        const content = message.content;
        if (content.includes('{') && content.includes('}')) {
          const jsonMatch = content.match(/\{.*\}/s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);

            // Parse as CarGeek state if it matches the structure
            if (data.agent_data || data.current_results) {
              const parsedResults = agentDataParser.parseStateData(data);
              setAgentResults(parsedResults);
              console.log('✅ Parsed final state data:', Object.keys(parsedResults));
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse final message data:', error);
      }
    },
    onData: (dataPart) => {
      console.log('🔍 Vehicle data part:', dataPart);

      // Handle streaming events from backend
      try {
        if (dataPart.type === 'data' && dataPart.value) {
          const rawData = dataPart.value;

          // Try to parse as streaming event
          if (typeof rawData === 'string') {
            const streamEvent = agentDataParser.parseStreamingEvent(rawData);
            if (streamEvent) {
              console.log('📡 Parsed streaming event:', streamEvent.type);

              // Handle different event types
              switch (streamEvent.type) {
                case 'agent_spawn':
                  agentDataParser.handleAgentSpawn(streamEvent as any);
                  break;
                case 'agent_complete':
                  agentDataParser.handleAgentComplete(streamEvent as any);
                  break;
                default:
                  console.log('📝 Other event type:', streamEvent.type);
              }
            }
          } else if (typeof rawData === 'object') {
            // Handle structured data directly
            console.log('📊 Structured data received:', rawData);

            if (rawData.agent_data || rawData.current_results) {
              const parsedResults = agentDataParser.parseStateData(rawData);
              setAgentResults(parsedResults);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse agent data:', error, dataPart);
      }
    }
  });

  const isLoading = status === 'loading';

  // Initialize vehicle data request (only once per vehicleId)
  useEffect(() => {
    if (vehicleId && sendMessage && !initialized) {
      console.log('🚗 Initializing vehicle profile for:', vehicleId, 'with session:', effectiveSessionId);
      setInitialized(true);
      sendMessage({
        role: 'user',
        content: `Get comprehensive vehicle data for: ${vehicleId}`
      });
    }
  }, [vehicleId, sendMessage, initialized, effectiveSessionId]);

  // Listen for background agent updates from chat interactions
  useEffect(() => {
    console.log('🔄 Vehicle profile listening for background updates on session:', effectiveSessionId);

    // If this is a shared session, we'll automatically receive background agent updates
    // when the user interacts with the chat interface about this vehicle

    if (messages.length > 1) {
      console.log('📊 Received background agent update:', messages.length, 'messages');
    }
  }, [messages, effectiveSessionId]);

  // Timeout handling for slow agents
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 30000); // 30 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Check for partial data availability
  useEffect(() => {
    const hasAnyData = messages.length > 0 ||
                       (agentResults.listings && agentResults.listings.listings.length > 0) ||
                       !!agentResults.sentiment ||
                       !!agentResults.research ||
                       !!agentResults.media;
    setPartialDataAvailable(hasAnyData);
  }, [messages, agentResults]);

  return (
    <div className="space-y-6">
      {/* Timeout Warning */}
      {timeoutReached && isLoading && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  AI agents are still processing (this can take up to 5 minutes)
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {partialDataAvailable
                    ? "Partial data available below - more results loading..."
                    : "Getting comprehensive vehicle intelligence..."
                  }
                </p>
                {partialDataAvailable && !showPartialData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPartialData(true)}
                    className="mt-2"
                  >
                    Continue with available data
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Agent Updates</CardTitle>
              <CardDescription>
                Real-time status from AI research agents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Session: {effectiveSessionId.slice(-8)}
              </Badge>
              {messages.length > 1 && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Background Updates
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TextDelta
            messages={messages}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modular Vehicle Dashboard */}
      <ModularVehicleDashboard
        agentResults={agentResults}
        vehicleId={vehicleId}
        sessionId={effectiveSessionId}
      />
    </div>
  );
}