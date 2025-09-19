/**
 * Agent status grid component for real-time agent monitoring.
 *
 * Displays the current status of all research agents with visual indicators,
 * progress tracking, and completion states. Follows atomic design principles
 * with focused responsibility for agent status visualization.
 *
 * @component
 * @example
 * ```tsx
 * <AgentStatusGrid
 *   agentResults={agentResults}
 *   className="mb-6"
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { Car, TrendingUp, MessageCircle, Image, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgentResults } from '@/lib/types/agent-data';

interface AgentStatusGridProps {
  /** Current agent results and status */
  agentResults: AgentResults;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual agent status card component.
 */
interface AgentStatusCardProps {
  /** Type of agent */
  agentType: 'listings' | 'research' | 'sentiment' | 'media';
  /** Whether agent is currently active */
  isActive: boolean;
  /** Whether agent has completed with data */
  hasData: boolean;
  /** Icon component for the agent type */
  icon: ReactElement;
  /** Display name for the agent */
  displayName: string;
}

const AgentStatusCard = ({
  agentType,
  isActive,
  hasData,
  icon,
  displayName
}: AgentStatusCardProps): ReactElement => {
  const isComplete = hasData && !isActive;

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all duration-300',
        isComplete
          ? 'bg-green-50 border-green-200 shadow-sm'
          : isActive
          ? 'bg-blue-50 border-blue-200 shadow-sm'
          : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          'p-1 rounded',
          isComplete ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'
        )}>
          {icon}
        </div>
        <span className="text-sm font-medium">{displayName}</span>
      </div>
      <div className="flex items-center gap-2">
        {isActive && (
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />
        )}
        {isComplete && <CheckCircle className="h-3 w-3 text-green-500" />}
        <span className="text-xs text-muted-foreground">
          {isComplete ? 'Complete' : isActive ? 'Processing...' : 'Pending'}
        </span>
      </div>
    </div>
  );
};

export const AgentStatusGrid = ({
  agentResults,
  className
}: AgentStatusGridProps): ReactElement => {
  const agentConfigs = [
    {
      type: 'listings' as const,
      icon: <Car className="h-4 w-4" />,
      displayName: 'Listings'
    },
    {
      type: 'research' as const,
      icon: <TrendingUp className="h-4 w-4" />,
      displayName: 'Research'
    },
    {
      type: 'sentiment' as const,
      icon: <MessageCircle className="h-4 w-4" />,
      displayName: 'Sentiment'
    },
    {
      type: 'media' as const,
      icon: <Image className="h-4 w-4" />,
      displayName: 'Media'
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Agent Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {agentConfigs.map(({ type, icon, displayName }) => (
          <AgentStatusCard
            key={type}
            agentType={type}
            isActive={agentResults.active_agents.includes(type)}
            hasData={!!agentResults[type]}
            icon={icon}
            displayName={displayName}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
        <div className="flex gap-4">
          <span>Total: {agentResults.total_agents}</span>
          <span>Active: {agentResults.active_agents.length}</span>
          <span>Complete: {agentResults.completed_agents}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date(agentResults.last_updated).toLocaleTimeString()}
        </Badge>
      </div>
    </div>
  );
};