/**
 * Integrated chat interface with progressive vehicle research dashboard.
 *
 * Implements the backup's progressive layout pattern where the interface
 * starts as chat-only and automatically expands to show vehicle research
 * when conversation begins. Follows modular architecture principles.
 *
 * @component
 * @example
 * ```tsx
 * <IntegratedChatInterface
 *   chatId="chat-123"
 *   initialChatModel="grok-vision"
 *   initialVisibilityType="private"
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import useSWR, { useSWRConfig } from 'swr';
import { useSearchParams } from 'next/navigation';

// Core chat components
import { Chat } from '@/components/chat';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from '@/components/messages';
import { MultimodalInput } from '@/components/multimodal-input';
import { Artifact } from '@/components/artifact';

// Progressive layout system
import { ProgressiveLayout } from '@/components/layout/progressive-layout';

// Vehicle research components
import { ModularVehicleDashboard } from '@/components/vehicle/modular-vehicle-dashboard';

// Utilities and types
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { agentDataParser } from '@/lib/utils/agent-data-parser';
import { sessionManager } from '@/lib/session-manager';
import type { Vote } from '@/lib/db/schema';
import type { VisibilityType } from '@/components/visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import type { AgentResults } from '@/lib/types/agent-data';

// Hooks
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { useDataStream } from '@/components/data-stream-provider';
import { toast } from '@/components/toast';
import { ChatSDKError } from '@/lib/errors';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from '@/components/sidebar-history';

interface IntegratedChatInterfaceProps {
  chatId: string;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
}

export function IntegratedChatInterface({
  chatId,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume
}: IntegratedChatInterfaceProps): ReactElement {
  // Agent results state for vehicle research
  const [agentResults, setAgentResults] = useState<AgentResults>({
    total_agents: 0,
    completed_agents: 0,
    active_agents: [],
    last_updated: new Date().toISOString()
  });

  // Chat state management
  const { visibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();
  const [input, setInput] = useState<string>('');
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Main chat hook with agent data parsing
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id: chatId,
    messages: [],
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/cargeek-stream',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));

      // Parse agent data from chat stream
      try {
        if (dataPart.type === 'data' && dataPart.value) {
          const rawData = dataPart.value;

          // Handle structured agent data
          if (typeof rawData === 'object' && rawData.dataType && rawData.data) {
            console.log('📊 Chat agent data received:', rawData.dataType);
            // Update agent results based on data type
            const updatedResults = { ...agentResults };

            // Simple integration with existing agent results
            if (rawData.dataType === 'listings') {
              // Parse listings data when it comes through
              console.log('✅ Listings data in chat stream');
            }

            setAgentResults(updatedResults);
          }

          // Handle streaming events for agent status
          if (typeof rawData === 'string') {
            const streamEvent = agentDataParser.parseStreamingEvent(rawData);
            if (streamEvent) {
              switch (streamEvent.type) {
                case 'agent_spawn':
                  agentDataParser.handleAgentSpawn(streamEvent as any);
                  break;
                case 'agent_complete':
                  agentDataParser.handleAgentComplete(streamEvent as any);
                  break;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse chat agent data:', error);
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      }
    },
  });

  // URL query handling
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });
      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${chatId}`);
    }
  }, [query, sendMessage, hasAppendedQuery, chatId]);

  // Agent data parser integration
  useEffect(() => {
    const parserId = `chat-${chatId}`;

    const updateAgentResults = (newResults: AgentResults) => {
      setAgentResults(newResults);
      console.log('🔄 Chat agent results updated:', {
        completed: newResults.completed_agents,
        active: newResults.active_agents.length
      });
    };

    agentDataParser.onUpdate(parserId, updateAgentResults);
    return () => agentDataParser.offUpdate(parserId);
  }, [chatId]);

  // Votes data
  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${chatId}` : null,
    fetcher,
  );

  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages: [],
    resumeStream,
    setMessages,
  });

  // Determine if conversation has started
  const hasMessages = messages && messages.length > 0;

  // Chat component
  const chatComponent = (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader
        chatId={chatId}
        selectedVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
      />

      <Messages
        chatId={chatId}
        status={status}
        votes={votes}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        isReadonly={isReadonly}
        isArtifactVisible={isArtifactVisible}
      />

      <div className="sticky bottom-0 flex gap-2 px-4 pb-4 mx-auto w-full bg-background md:pb-6 md:max-w-3xl z-[1] border-t-0">
        {!isReadonly && (
          <MultimodalInput
            chatId={chatId}
            input={input}
            setInput={setInput}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            sendMessage={sendMessage}
            selectedVisibilityType={visibilityType}
            selectedModelId={initialChatModel}
          />
        )}
      </div>
    </div>
  );

  // Vehicle research dashboard component
  const dashboardComponent = (
    <div className="h-dvh bg-background">
      <ModularVehicleDashboard
        agentResults={agentResults}
        vehicleId="conversation-research"
        sessionId={chatId}
      />
    </div>
  );

  return (
    <>
      {/* Progressive Layout: Chat-only → Split-view → Resizable panels */}
      <ProgressiveLayout
        chatComponent={chatComponent}
        dashboardComponent={dashboardComponent}
        hasMessages={hasMessages}
      />

      {/* Artifact overlay */}
      <Artifact
        chatId={chatId}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={initialChatModel}
      />
    </>
  );
}