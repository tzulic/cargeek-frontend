/**
 * Modular vehicle dashboard composition.
 *
 * Composes atomic vehicle widgets into a cohesive dashboard experience.
 * Follows composition pattern from backup with strict modularity rules.
 * Each widget is atomic and focused on single responsibility.
 *
 * @component
 * @example
 * ```tsx
 * <ModularVehicleDashboard
 *   agentResults={agentResults}
 *   vehicleId="tesla-model-3"
 *   sessionId="session-123"
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { AgentResults } from '@/lib/types/agent-data';

// Atomic widget imports
import { VehicleHeader } from './vehicle-header';
import { AgentStatusGrid } from './agent-status-grid';
import { ListingsWidget } from './listings-widget';
import { SentimentWidget } from './sentiment-widget';
import { ResearchWidget } from './research-widget';
import { MediaWidget } from './media-widget';
// Use original widgets - we'll update them to handle real backend data

interface ModularVehicleDashboardProps {
  /** Current agent results */
  agentResults: AgentResults;
  /** Vehicle identifier */
  vehicleId: string;
  /** Session identifier */
  sessionId?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate research progress based on completed agents.
 */
const calculateProgress = (results: AgentResults): number => {
  const totalAgents = 4; // listings, research, sentiment, media
  const completedCount = [
    !!results.listings,
    !!results.research,
    !!results.sentiment,
    !!results.media
  ].filter(Boolean).length;

  return (completedCount / totalAgents) * 100;
};

/**
 * Determine if any research is currently loading.
 */
const isAnyLoading = (results: AgentResults): boolean => {
  return results.active_agents.length > 0;
};

/**
 * Check if any data is available.
 */
const hasAnyData = (results: AgentResults): boolean => {
  return !!(results.listings || results.research || results.sentiment || results.media);
};

/**
 * Get loading state for each widget type.
 */
const getWidgetLoadingStates = (results: AgentResults) => ({
  listings: results.active_agents.includes('listings'),
  research: results.active_agents.includes('research'),
  sentiment: results.active_agents.includes('sentiment'),
  media: results.active_agents.includes('media')
});

export const ModularVehicleDashboard = ({
  agentResults,
  vehicleId,
  sessionId,
  className
}: ModularVehicleDashboardProps): ReactElement => {
  const progressValue = calculateProgress(agentResults);
  const isLoading = isAnyLoading(agentResults);
  const hasData = hasAnyData(agentResults);
  const loadingStates = getWidgetLoadingStates(agentResults);

  // Format vehicle name for display
  const vehicleDisplayName = vehicleId.replace(/-/g, ' ');

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-6 space-y-6">
        {/* Vehicle Header with Progress */}
        <VehicleHeader
          vehicle={vehicleDisplayName}
          progressValue={progressValue}
          isLoading={isLoading}
          hasData={hasData}
        />

        {/* Real-time Agent Status */}
        <AgentStatusGrid agentResults={agentResults} />

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Key insights */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sentiment Summary */}
              <SentimentWidget
                data={agentResults.sentiment}
                loading={loadingStates.sentiment}
              />

              {/* Media Summary */}
              <MediaWidget
                data={agentResults.media}
                loading={loadingStates.media}
              />
            </div>

            {/* Research Summary */}
            <ResearchWidget
              data={agentResults.research}
              loading={loadingStates.research}
            />
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <ListingsWidget
              data={agentResults.listings}
              loading={loadingStates.listings}
            />
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-4">
            <SentimentWidget
              data={agentResults.sentiment}
              loading={loadingStates.sentiment}
            />
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-4">
            <ResearchWidget
              data={agentResults.research}
              loading={loadingStates.research}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};