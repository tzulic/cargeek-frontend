/**
 * Clean modular vehicle profile dashboard.
 *
 * Uses atomic widget composition following backup architecture rules.
 * Replaces the old monolithic component with modular, maintainable widgets.
 *
 * @component
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
import type { AgentResults, StreamingEvent } from '@/lib/types/agent-data';

interface VehicleProfileDashboardProps {
  vehicleId: string;
  sessionId?: string;
}

export function VehicleProfileDashboard({
  vehicleId,
  sessionId
}: VehicleProfileDashboardProps): ReactElement {
  // Typed agent results state
  const [agentResults, setAgentResults] = useState<AgentResults>({
    total_agents: 0,
    completed_agents: 0,
    active_agents: [],
    last_updated: new Date().toISOString()
  });

  const [timeoutReached, setTimeoutReached] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const effectiveSessionId = sessionId || sessionManager.getVehicleSession(vehicleId);

  // Agent data parser integration
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
    return () => agentDataParser.offUpdate(parserId);
  }, [vehicleId, updateAgentResults]);

  // Chat integration for streaming data
  const { messages, sendMessage, status } = useChat({
    id: `vehicle-${vehicleId}-${effectiveSessionId}`, // Unique ID to prevent conflicts
    initialMessages: [],
    keepLastMessageOnError: true,
    maxAutomaticRoundtrips: 0, // Prevent automatic follow-ups
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
      console.log('🔍 Vehicle stream finished');
      // Parse final state data if available
      try {
        const content = message.content;
        if (content.includes('{') && content.includes('}')) {
          const jsonMatch = content.match(/\{.*\}/s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.agent_data || data.current_results) {
              const parsedResults = agentDataParser.parseStateData(data);
              setAgentResults(parsedResults);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse final message data:', error);
      }
    },
    onData: (dataPart) => {
      try {
        console.log('📥 AI SDK onData received:', dataPart.type, dataPart);

        // Handle AI SDK data-{type} events according to stream protocol
        if (dataPart.type?.startsWith('data-')) {
          const agentType = dataPart.type.substring(5); // Remove 'data-' prefix
          const agentData = dataPart.data;

          console.log('📊 Agent data received:', agentType, agentData);

          // Update agent results directly based on agent type
          const updatedResults = { ...agentResults };

          switch (agentType) {
            case 'media':
              if (Array.isArray(agentData) && agentData.length > 0) {
                updatedResults.media = agentData[0]; // Take first item
                console.log('✅ Media data updated');
              }
              break;
            case 'research':
              if (Array.isArray(agentData) && agentData.length > 0) {
                updatedResults.research = agentData[0];
                console.log('✅ Research data updated');
              }
              break;
            case 'listings':
              if (Array.isArray(agentData) && agentData.length > 0) {
                updatedResults.listings = agentData[0];
                console.log('✅ Listings data updated');
              }
              break;
            case 'sentiment':
              if (Array.isArray(agentData) && agentData.length > 0) {
                updatedResults.sentiment = agentData[0];
                console.log('✅ Sentiment data updated');
              }
              break;
            case 'agent-status':
              // Handle agent status updates
              if (agentData?.agents) {
                updatedResults.active_agents = agentData.agents.map((a: any) => a.agent_type || a.agent);
                console.log('✅ Agent status updated:', updatedResults.active_agents);
              }
              break;
          }

          updatedResults.last_updated = new Date().toISOString();
          setAgentResults(updatedResults);
        }
      } catch (error) {
        console.warn('Failed to parse agent data:', error);
      }
    }
  });

  const isLoading = status === 'loading';

  // Initialize vehicle request
  useEffect(() => {
    if (vehicleId && sendMessage && !initialized) {
      console.log('🚗 Initializing vehicle profile for:', vehicleId);
      setInitialized(true);
      sendMessage({
        role: 'user',
        content: `Get comprehensive vehicle data for: ${vehicleId}`
      });
    }
  }, [vehicleId, sendMessage, initialized]);

  // Timeout handling
  useEffect(() => {
    const timeout = setTimeout(() => setTimeoutReached(true), 30000);
    return () => clearTimeout(timeout);
  }, []);

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
                  Getting comprehensive vehicle intelligence...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Agent Updates</CardTitle>
              <CardDescription>Real-time status from AI research agents</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Session: {effectiveSessionId.slice(-8)}
              </Badge>
              {messages.length > 1 && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Updates
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TextDelta messages={messages} isLoading={isLoading} />
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