/**
 * Agent data parser for transforming backend streaming events into typed frontend data.
 *
 * Handles parsing of LangGraph state data and SSE streaming events into
 * strongly-typed structures for vehicle profile display.
 *
 * @fileoverview Agent data parsing utilities
 */

import {
  AgentResults,
  StreamingEvent,
  AgentSpawnEvent,
  AgentCompleteEvent,
  ChatResponseEvent,
  ListingsSearchResult,
  ResearchAgentResult,
  SentimentAnalysisResult,
  MediaAgentResult,
  AgentResponse,
  AgentType,
  AnyAgentResult,
  isListingsResult,
  isResearchResult,
  isSentimentResult,
  isMediaResult,
  CarGeekState
} from '@/lib/types/agent-data';

/**
 * Parse streaming events from backend SSE.
 */
export class AgentDataParser {
  private agentResults: AgentResults;
  private listeners: Map<string, (results: AgentResults) => void>;

  constructor() {
    this.agentResults = {
      total_agents: 0,
      completed_agents: 0,
      active_agents: [],
      last_updated: new Date().toISOString()
    };
    this.listeners = new Map();
  }

  /**
   * Parse SSE event data from backend streaming.
   */
  parseStreamingEvent(eventData: string): StreamingEvent | null {
    try {
      // Handle SSE format: "data: {...}"
      let cleanData = eventData;
      if (eventData.startsWith('data: ')) {
        cleanData = eventData.substring(6);
      }

      // Skip empty or control messages
      if (!cleanData.trim() || cleanData === '[DONE]') {
        return null;
      }

      const parsed = JSON.parse(cleanData);
      return parsed as StreamingEvent;
    } catch (error) {
      console.warn('Failed to parse streaming event:', error, eventData);
      return null;
    }
  }

  /**
   * Process agent spawn event.
   */
  handleAgentSpawn(event: AgentSpawnEvent): void {
    const agentType = event.data.agent;

    if (!this.agentResults.active_agents.includes(agentType)) {
      this.agentResults.active_agents.push(agentType);
      this.agentResults.total_agents += 1;
    }

    this.agentResults.last_updated = new Date().toISOString();
    this.notifyListeners();

    console.log('🚀 Agent spawned:', {
      agent: agentType,
      priority: event.data.priority,
      reason: event.data.reason,
      total_active: this.agentResults.active_agents.length
    });
  }

  /**
   * Process agent completion event and extract structured data.
   */
  handleAgentComplete(event: AgentCompleteEvent): void {
    const { agent_type, agent_id, success, result } = event.data;

    if (!success || !result) {
      console.error('❌ Agent failed:', agent_type, agent_id);
      return;
    }

    // Remove from active agents
    this.agentResults.active_agents = this.agentResults.active_agents.filter(
      agent => agent !== agent_type
    );
    this.agentResults.completed_agents += 1;

    // Parse and store structured data based on agent type
    try {
      if (isListingsResult(result)) {
        this.agentResults.listings = result;
        console.log('📋 Listings data received:', {
          total_found: result.total_found,
          returned_count: result.returned_count,
          listings: result.listings?.length || 0
        });
      } else if (isResearchResult(result)) {
        this.agentResults.research = result;
        console.log('🔬 Research data received:', {
          has_specs: !!result.technical_specs,
          has_features: !!result.features,
          has_performance: !!result.performance
        });
      } else if (isSentimentResult(result)) {
        this.agentResults.sentiment = result;
        console.log('💭 Sentiment data received:', {
          overall_sentiment: result.overall_sentiment,
          score: result.sentiment_score,
          review_count: result.review_count
        });
      } else if (isMediaResult(result)) {
        this.agentResults.media = result;
        console.log('📸 Media data received:', {
          images: result.images?.length || 0,
          videos: result.videos?.length || 0,
          total: result.total_media_count
        });
      }
    } catch (error) {
      console.error('❌ Failed to parse agent result:', agent_type, error);
    }

    this.agentResults.last_updated = new Date().toISOString();
    this.notifyListeners();
  }

  /**
   * Parse LangGraph state data directly (non-streaming).
   */
  parseStateData(state: CarGeekState): AgentResults {
    const results: AgentResults = {
      total_agents: 0,
      completed_agents: 0,
      active_agents: [...state.active_agents],
      last_updated: new Date().toISOString()
    };

    // Parse agent_data dictionary
    if (state.agent_data) {
      Object.entries(state.agent_data).forEach(([agentType, dataItems]) => {
        if (dataItems && dataItems.length > 0) {
          const latestData = dataItems[dataItems.length - 1]; // Get most recent

          try {
            switch (agentType) {
              case 'listings':
                results.listings = this.parseListingsData(latestData.data);
                break;
              case 'research':
                results.research = this.parseResearchData(latestData.data);
                break;
              case 'sentiment':
                results.sentiment = this.parseSentimentData(latestData.data);
                break;
              case 'media':
                results.media = this.parseMediaData(latestData.data);
                break;
            }
            results.completed_agents += 1;
          } catch (error) {
            console.error(`❌ Failed to parse ${agentType} data:`, error);
          }
        }
      });
    }

    results.total_agents = results.completed_agents + results.active_agents.length;
    return results;
  }

  /**
   * Parse listings data with validation.
   */
  private parseListingsData(data: any): ListingsSearchResult {
    return {
      agent_type: 'listings',
      agent_id: data.agent_id || `listings_${Date.now()}`,
      success: true,
      total_found: data.total_found || 0,
      returned_count: data.returned_count || 0,
      listings: data.listings || [],
      market_intelligence: data.market_intelligence,
      search_context: data.search_context,
      recommendations: data.recommendations,
      executive_summary: data.executive_summary,
      key_insights: data.key_insights || [],
      search_duration_ms: data.search_duration_ms,
      data_sources: data.data_sources || [],
      warnings: data.warnings || []
    };
  }

  /**
   * Parse research data with validation.
   */
  private parseResearchData(data: any): ResearchAgentResult {
    return {
      agent_type: 'research',
      agent_id: data.agent_id || `research_${Date.now()}`,
      success: true,
      technical_specs: data.technical_specs,
      features: data.features,
      performance: data.performance,
      research_summary: data.research_summary,
      data_sources: data.data_sources || [],
      reliability_rating: data.reliability_rating
    };
  }

  /**
   * Parse sentiment data with validation.
   */
  private parseSentimentData(data: any): SentimentAnalysisResult {
    return {
      agent_type: 'sentiment',
      agent_id: data.agent_id || `sentiment_${Date.now()}`,
      success: true,
      overall_sentiment: data.overall_sentiment || 'neutral',
      sentiment_score: data.sentiment_score || 0,
      categories: data.categories,
      positive_highlights: data.positive_highlights || [],
      negative_concerns: data.negative_concerns || [],
      common_complaints: data.common_complaints || [],
      owner_recommendations: data.owner_recommendations || [],
      review_count: data.review_count,
      sources: data.sources || [],
      analysis_date: data.analysis_date
    };
  }

  /**
   * Parse media data with validation.
   */
  private parseMediaData(data: any): MediaAgentResult {
    return {
      agent_type: 'media',
      agent_id: data.agent_id || `media_${Date.now()}`,
      success: true,
      images: data.images || [],
      videos: data.videos || [],
      galleries: data.galleries || [],
      total_media_count: data.total_media_count || 0,
      media_sources: data.media_sources || [],
      featured_media: data.featured_media || [],
      high_quality_count: data.high_quality_count || 0,
      official_media_count: data.official_media_count || 0
    };
  }

  /**
   * Get current agent results.
   */
  getResults(): AgentResults {
    return { ...this.agentResults };
  }

  /**
   * Subscribe to agent result updates.
   */
  onUpdate(id: string, callback: (results: AgentResults) => void): void {
    this.listeners.set(id, callback);
  }

  /**
   * Unsubscribe from updates.
   */
  offUpdate(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Notify all listeners of updates.
   */
  private notifyListeners(): void {
    const results = this.getResults();
    this.listeners.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        console.error('❌ Listener callback error:', error);
      }
    });
  }

  /**
   * Reset agent results (for new session).
   */
  reset(): void {
    this.agentResults = {
      total_agents: 0,
      completed_agents: 0,
      active_agents: [],
      last_updated: new Date().toISOString()
    };
    this.notifyListeners();
  }

  /**
   * Check if all agents have completed.
   */
  isComplete(): boolean {
    return this.agentResults.active_agents.length === 0 && this.agentResults.completed_agents > 0;
  }

  /**
   * Get loading state for each agent type.
   */
  getLoadingState() {
    return {
      listings: this.agentResults.active_agents.includes('listings') || this.agentResults.active_agents.includes('listings_agent'),
      research: this.agentResults.active_agents.includes('research') || this.agentResults.active_agents.includes('research_agent'),
      sentiment: this.agentResults.active_agents.includes('sentiment') || this.agentResults.active_agents.includes('sentiment_agent'),
      media: this.agentResults.active_agents.includes('media') || this.agentResults.active_agents.includes('media_agent')
    };
  }
}

/**
 * Global agent data parser instance.
 */
export const agentDataParser = new AgentDataParser();

/**
 * Hook for using agent data in React components.
 */
export function useAgentData() {
  return {
    parser: agentDataParser,
    results: agentDataParser.getResults(),
    loading: agentDataParser.getLoadingState(),
    isComplete: agentDataParser.isComplete()
  };
}