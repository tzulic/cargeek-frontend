'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID, cn } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
// Removed Session import - auth handled by backend
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

// Progressive layout imports
import { ProgressiveLayout } from '@/components/layout/progressive-layout';
import { ModularVehicleDashboard } from '@/components/vehicle/modular-vehicle-dashboard';
import { agentDataParser } from '@/lib/utils/agent-data-parser';
import type { AgentResults } from '@/lib/types/agent-data';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');

  // Agent results for vehicle research dashboard
  const [agentResults, setAgentResults] = useState<AgentResults>({
    total_agents: 0,
    completed_agents: 0,
    active_agents: [],
    last_updated: new Date().toISOString()
  });

  // Debug: Log when component mounts
  console.log('🔧 Chat component loaded with progressive layout');

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    streamProtocol: 'data', // Enable AI SDK Data Stream Protocol
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

      // Debug: Log all incoming data
      console.log('🔧 onData received:', dataPart);

      // The AI SDK will automatically attach data parts to messages
      // We'll process them in the useEffect below
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
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Process agent data from message parts
  useEffect(() => {
    // Check all messages for data parts
    if (messages && messages.length > 0) {
      const updatedResults = { ...agentResults };
      let hasUpdates = false;

      // Process all messages to find data parts
      messages.forEach((message) => {
        // Check if the message has parts array
        if (message && message.parts) {
          console.log(`📨 Processing message ${message.id} parts:`, message.parts.length);

          // Process each part
          message.parts.forEach((part: any) => {
            console.log('🔍 Part type:', part.type, part);

            // Check for data parts with agent results
            if (part.type && part.type.startsWith('data-')) {
              const dataType = part.type.replace('data-', '');
              console.log('🎯 Found data part:', dataType, part.data);

              // Update agent results based on data type
              switch (dataType) {
                case 'research':
                  if (part.data && !updatedResults.research) {
                    console.log('🔍 DEBUG: Raw research data structure:', JSON.stringify(part.data, null, 2));
                    // Extract actual research data from array wrapper
                    const researchData = Array.isArray(part.data) ? part.data[0] : part.data;
                    updatedResults.research = researchData;
                    updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                    hasUpdates = true;
                    console.log('✅ Research data added:', researchData);
                  }
                  break;
                case 'listings':
                  if (part.data && !updatedResults.listings) {
                    // Extract actual listings data from array wrapper
                    const listingsData = Array.isArray(part.data) ? part.data[0] : part.data;
                    updatedResults.listings = listingsData;
                    updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                    hasUpdates = true;
                    console.log('✅ Listings data added:', listingsData);
                  }
                  break;
                case 'sentiment':
                  if (part.data && !updatedResults.sentiment) {
                    // Extract actual sentiment data from array wrapper
                    const sentimentData = Array.isArray(part.data) ? part.data[0] : part.data;
                    updatedResults.sentiment = sentimentData;
                    updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                    hasUpdates = true;
                    console.log('✅ Sentiment data added:', sentimentData);
                  }
                  break;
                case 'media':
                  if (part.data && !updatedResults.media) {
                    // Extract actual media data from array wrapper
                    const mediaData = Array.isArray(part.data) ? part.data[0] : part.data;
                    updatedResults.media = mediaData;
                    updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                    hasUpdates = true;
                    console.log('✅ Media data added:', mediaData);
                  }
                  break;
                case 'agent-status':
                  // Handle agent status updates
                  if (part.data && part.data.agent) {
                    if (part.data.status === 'started') {
                      if (!updatedResults.active_agents.includes(part.data.agent)) {
                        updatedResults.active_agents.push(part.data.agent);
                        updatedResults.total_agents = (updatedResults.total_agents || 0) + 1;
                        hasUpdates = true;
                      }
                    } else if (part.data.status === 'completed') {
                      updatedResults.active_agents = updatedResults.active_agents.filter(
                        a => a !== part.data.agent
                      );
                      hasUpdates = true;
                    }
                  }
                  break;
              }
            }

            // Also check for custom data type
            if (part.type === 'data' && part.data) {
              console.log('📊 Found custom data part:', part.data);

              // Check if it contains agent results
              if (part.data.research && !updatedResults.research) {
                updatedResults.research = part.data.research;
                updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                hasUpdates = true;
              }
              if (part.data.listings && !updatedResults.listings) {
                updatedResults.listings = part.data.listings;
                updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                hasUpdates = true;
              }
              if (part.data.sentiment && !updatedResults.sentiment) {
                updatedResults.sentiment = part.data.sentiment;
                updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                hasUpdates = true;
              }
              if (part.data.media && !updatedResults.media) {
                updatedResults.media = part.data.media;
                updatedResults.completed_agents = (updatedResults.completed_agents || 0) + 1;
                hasUpdates = true;
              }
            }
          });
        }
      });

      // Update state if we found new data
      if (hasUpdates) {
        updatedResults.last_updated = new Date().toISOString();
        setAgentResults(updatedResults);
        console.log('✅ Agent results updated from message parts:', {
          completed: updatedResults.completed_agents,
          active: updatedResults.active_agents.length,
          hasResearch: !!updatedResults.research,
          hasListings: !!updatedResults.listings,
          hasSentiment: !!updatedResults.sentiment,
          hasMedia: !!updatedResults.media
        });
      }
    }
  }, [messages]);

  // Agent data parser integration
  useEffect(() => {
    const parserId = `chat-${id}`;

    const updateAgentResults = (newResults: AgentResults) => {
      setAgentResults(newResults);
      console.log('🔄 Chat agent results updated:', {
        completed: newResults.completed_agents,
        active: newResults.active_agents.length
      });
    };

    agentDataParser.onUpdate(parserId, updateAgentResults);
    return () => agentDataParser.offUpdate(parserId);
  }, [id]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  // Determine if conversation has started (for progressive layout)
  const hasMessages = messages && messages.length > 0;

  // Chat component for progressive layout
  const chatComponent = (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader
        chatId={id}
        selectedVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
      />

      <Messages
        chatId={id}
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
            chatId={id}
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
        sessionId={id}
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
        chatId={id}
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
