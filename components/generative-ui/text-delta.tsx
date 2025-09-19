'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

interface TextDeltaProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

/**
 * TextDelta component for displaying incremental text updates.
 *
 * Shows real-time streaming text updates from AI agents with
 * smooth animation and automatic scrolling. Implements the
 * generative UI pattern for incremental text display.
 */
export function TextDelta({
  messages,
  isLoading
}: TextDeltaProps): ReactElement {
  const [displayText, setDisplayText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Simulate incremental text display for streaming effect
  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.content && latestMessage.role === 'assistant') {
      let currentIndex = 0;
      const content = latestMessage.content;

      const intervalId = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayText(content.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 20); // Adjust speed as needed

      return () => clearInterval(intervalId);
    }
  }, [messages]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Live Agent Updates</span>
        {isLoading && (
          <Badge variant="secondary" className="animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Processing...
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary/10 ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              <div className="flex items-start gap-2">
                <Badge
                  variant={message.role === 'user' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {message.role === 'user' ? 'Query' : 'Agent'}
                </Badge>
                <div className="flex-1">
                  <div className="text-sm">
                    {index === messages.length - 1 && message.role === 'assistant'
                      ? displayText
                      : message.content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span className="text-sm">Initializing AI agents...</span>
              </div>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for agent updates...</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}