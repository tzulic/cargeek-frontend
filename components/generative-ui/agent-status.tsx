'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Brain,
  Car,
  BarChart3,
  Camera,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'processing' | 'complete' | 'error';
  progress?: number;
  lastUpdate?: string;
  message?: string;
  type?: 'chat' | 'research' | 'listings' | 'sentiment' | 'media' | 'analytics';
}

interface AgentStatusProps {
  agents: Agent[];
  isLoading: boolean;
  timeoutReached?: boolean;
}

/**
 * AgentStatus component for real-time agent monitoring.
 *
 * Displays live status of LangGraph agents with visual indicators,
 * progress tracking, and status messages. Implements generative UI
 * pattern for real-time system monitoring.
 */
export function AgentStatus({
  agents,
  isLoading,
  timeoutReached = false
}: AgentStatusProps): ReactElement {
  const [displayAgents, setDisplayAgents] = useState<Agent[]>([]);

  // Default agents when no data is provided
  const defaultAgents: Agent[] = [
    {
      id: 'chat',
      name: 'Chat Agent',
      type: 'chat',
      status: 'active',
      progress: 100,
      message: 'Ready for conversation'
    },
    {
      id: 'research',
      name: 'Vehicle Research',
      type: 'research',
      status: isLoading ? 'processing' : 'idle',
      progress: isLoading ? (timeoutReached ? 85 : 45) : 0,
      message: isLoading
        ? (timeoutReached ? 'Deep analysis in progress (may take 3-5 min)...' : 'Analyzing vehicle specifications...')
        : 'Waiting for request'
    },
    {
      id: 'listings',
      name: 'Listings Agent',
      type: 'listings',
      status: isLoading ? 'processing' : 'idle',
      progress: isLoading ? (timeoutReached ? 90 : 75) : 0,
      message: isLoading
        ? (timeoutReached ? 'Comprehensive marketplace scan in progress...' : 'Searching marketplace listings...')
        : 'Ready to search'
    },
    {
      id: 'sentiment',
      name: 'Consumer Sentiment',
      type: 'sentiment',
      status: isLoading ? 'processing' : 'idle',
      progress: isLoading ? (timeoutReached ? 70 : 30) : 0,
      message: isLoading
        ? (timeoutReached ? 'Processing thousands of reviews (3-5 min)...' : 'Analyzing owner reviews...')
        : 'Standing by'
    },
    {
      id: 'media',
      name: 'Media Agent',
      type: 'media',
      status: 'idle',
      progress: 0,
      message: 'Ready to process media'
    },
    {
      id: 'analytics',
      name: 'Analytics Agent',
      type: 'analytics',
      status: 'idle',
      progress: 0,
      message: 'Waiting for data'
    }
  ];

  // Use provided agents or fall back to defaults
  useEffect(() => {
    if (agents && agents.length > 0) {
      setDisplayAgents(agents);
    } else {
      setDisplayAgents(defaultAgents);
    }
  }, [agents, isLoading]);

  const getAgentIcon = (type?: string) => {
    switch (type) {
      case 'chat':
        return MessageSquare;
      case 'research':
        return Car;
      case 'listings':
        return BarChart3;
      case 'sentiment':
        return Brain;
      case 'media':
        return Camera;
      case 'analytics':
        return Activity;
      default:
        return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default' as const;
      case 'processing':
        return 'secondary' as const;
      case 'complete':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Agent Network Status</h3>
        <Badge variant="outline" className="text-xs">
          {displayAgents.filter(agent => agent.status === 'active' || agent.status === 'processing').length}
          /{displayAgents.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAgents.map((agent) => {
          const IconComponent = getAgentIcon(agent.type);

          return (
            <Card
              key={agent.id}
              className={`transition-all duration-300 ${
                agent.status === 'processing' ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} animate-pulse`} />
                          <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusIcon(agent.status)}
                  </div>

                  {/* Progress Bar */}
                  {agent.status === 'processing' && typeof agent.progress === 'number' && (
                    <div className="space-y-1">
                      <Progress value={agent.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {agent.progress}%
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {agent.message && (
                    <p className="text-xs text-muted-foreground">
                      {agent.message}
                    </p>
                  )}

                  {/* Last Update */}
                  {agent.lastUpdate && (
                    <div className="text-xs text-muted-foreground">
                      Last update: {agent.lastUpdate}
                    </div>
                  )}

                  {/* Status Badge */}
                  <Badge variant={getStatusVariant(agent.status)} className="w-fit text-xs">
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall System Status */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-medium">System Status</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{displayAgents.filter(a => a.status === 'active' || a.status === 'complete').length} Online</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{displayAgents.filter(a => a.status === 'processing').length} Working</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span>{displayAgents.filter(a => a.status === 'idle').length} Idle</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}