/**
 * TypeScript interfaces matching backend Pydantic models for CarGeek agents.
 *
 * These types ensure type safety when handling structured data from
 * research agents, listings agents, sentiment agents, and media agents.
 *
 * @fileoverview Agent data types for CarGeek frontend
 */

import { ReactElement } from 'react';

// ============================================================================
// CORE AGENT TYPES
// ============================================================================

/**
 * Base agent response structure from LangGraph state.
 */
export interface AgentResponse {
  /** Agent type identifier */
  agent_type: 'research' | 'listings' | 'sentiment' | 'media';
  /** Unique agent execution ID */
  agent_id: string;
  /** Reason this agent was spawned */
  reason?: string;
  /** Timestamp when agent completed */
  completed_at?: string;
  /** Success status */
  success: boolean;
  /** Error details if failed */
  error_details?: string;
}

/**
 * LangGraph state structure for agent data.
 */
export interface CarGeekState {
  /** Bounded agent data collections */
  agent_data: Record<string, AgentDataItem[]>;
  /** Agent metadata */
  agent_metadata: Record<string, Record<string, any>>;
  /** Currently active agents */
  active_agents: string[];
  /** Current analysis results */
  current_analysis?: Record<string, any>;
  /** Session identifier */
  session_id: string;
  /** User context */
  user_context: Record<string, any>;
  /** Current results from chat/agents */
  current_results: Record<string, any>;
}

/**
 * Generic agent data item structure.
 */
export interface AgentDataItem {
  /** Data content */
  data: any;
  /** Metadata about the data */
  metadata?: Record<string, any>;
  /** Timestamp when created */
  timestamp?: string;
}

// ============================================================================
// VEHICLE LISTINGS AGENT TYPES (matching structured_output_models.py)
// ============================================================================

/**
 * Individual vehicle listing with comprehensive details.
 * Matches VehicleListing Pydantic model.
 */
export interface VehicleListing {
  // Core identification
  id: string;
  vin?: string;

  // Vehicle details
  year?: number;
  make?: string;
  model?: string;
  trim?: string;

  // Pricing and financial
  price?: number;
  msrp?: number;

  // Condition and usage
  mileage?: number;
  condition?: 'new' | 'used' | 'certified';

  // Physical attributes
  exterior_color?: string;
  interior_color?: string;
  body_type?: string;

  // Dealer and location
  dealer_name?: string;
  dealer_city?: string;
  dealer_state?: string;

  // Digital presence
  vdp_url?: string;
  image_urls?: string[];

  // Additional metadata
  data_source?: string;
  days_on_market?: number;
}

/**
 * Market analysis and insights for search results.
 * Matches MarketIntelligence Pydantic model.
 */
export interface MarketIntelligence {
  // Price analysis
  price_range?: {
    min?: number;
    max?: number;
    average?: number;
  };

  // Market trends
  average_mileage?: number;
  most_common_year?: number;

  // Geographic distribution
  top_locations?: string[];

  // Value insights
  best_value_picks?: string[];

  // Market conditions
  inventory_level?: 'low' | 'moderate' | 'high';
}

/**
 * Search context and parameters.
 * Matches SearchContext Pydantic model.
 */
export interface SearchContext {
  // Search parameters
  make?: string;
  model?: string;
  year?: number;
  price_min?: number;
  price_max?: number;

  // Geographic context
  location?: string;
  radius_miles?: number;

  // Query metadata
  query_intent?: string;
  search_timestamp?: string;
}

/**
 * Actionable recommendations for users.
 * Matches ActionableRecommendations Pydantic model.
 */
export interface ActionableRecommendations {
  // Immediate actions
  recommended_listings?: string[];

  // Search refinements
  suggested_filters?: Record<string, any>;

  // Market advice
  timing_advice?: string;
  negotiation_insights?: string[];

  // Alternative options
  alternative_searches?: string[];
}

/**
 * Comprehensive structured output for vehicle listings search.
 * Matches ListingsSearchResult Pydantic model.
 */
export interface ListingsSearchResult extends AgentResponse {
  agent_type: 'listings';

  // Search results
  total_found: number;
  returned_count: number;

  // Core listings data
  listings: VehicleListing[];

  // Analysis and insights
  market_intelligence?: MarketIntelligence;
  search_context?: SearchContext;

  // User guidance
  recommendations?: ActionableRecommendations;

  // Summary and key takeaways
  executive_summary?: string;
  key_insights?: string[];

  // Technical metadata
  search_duration_ms?: number;
  data_sources?: string[];

  // Error handling
  warnings?: string[];
}

// ============================================================================
// RESEARCH AGENT TYPES
// ============================================================================

/**
 * Technical specification data from research agent.
 */
export interface TechnicalSpecs {
  engine?: {
    type?: string;
    displacement?: string;
    power?: string;
    torque?: string;
    fuel_type?: string;
  };
  transmission?: string;
  drivetrain?: string;
  fuel_economy?: {
    city?: number;
    highway?: number;
    combined?: number;
  };
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    curb_weight?: string;
  };
  capacity?: {
    seating?: number;
    cargo?: string;
    towing?: string;
  };
}

/**
 * Vehicle research results from backend agent (VehicleResearchResult).
 */
export interface VehicleResearchResult extends AgentResponse {
  agent_type: 'research';
  vehicle_name: string;
  category: string;
  engine_specs: string[];
  transmission_options: string[];
  fuel_economy?: string;
  price_range: string;
  available_trims: string[];
  standard_features: string[];
  notable_options: string[];
  towing_capacity?: string;
  seating_capacity?: string;
  cargo_space?: string;
  safety_ratings?: string;
  reliability_rating?: string;
  awards: string[];
  main_competitors: string[];
  unique_selling_points: string[];
  confidence_score: string;
  sources_summary: string;
  research_summary: string;
}

/**
 * Research agent response structure (original format).
 */
export interface ResearchAgentResult extends AgentResponse {
  agent_type: 'research';

  // Technical data
  technical_specs?: TechnicalSpecs;

  // Feature information
  features?: {
    standard?: string[];
    optional?: string[];
    safety?: string[];
    technology?: string[];
  };

  // Performance data
  performance?: {
    acceleration?: string;
    top_speed?: string;
    braking?: string;
    handling_notes?: string[];
  };

  // Summary
  research_summary?: string;
  data_sources?: string[];
  reliability_rating?: number;
}

// ============================================================================
// SENTIMENT AGENT TYPES
// ============================================================================

/**
 * Consumer sentiment analysis results.
 */
export interface SentimentAnalysisResult extends AgentResponse {
  agent_type: 'sentiment';

  // Overall sentiment
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number; // -1 to 1

  // Category breakdown
  categories?: {
    reliability?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      score: number;
      mentions: number;
    };
    performance?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      score: number;
      mentions: number;
    };
    comfort?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      score: number;
      mentions: number;
    };
    value?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      score: number;
      mentions: number;
    };
  };

  // Key insights
  positive_highlights?: string[];
  negative_concerns?: string[];
  common_complaints?: string[];
  owner_recommendations?: string[];

  // Data sources
  review_count?: number;
  sources?: string[];
  analysis_date?: string;
}

// ============================================================================
// MEDIA AGENT TYPES
// ============================================================================

/**
 * Media content from media agent.
 */
export interface MediaContent {
  /** Media type */
  type: 'image' | 'video' | 'gallery';
  /** Media URL */
  url: string;
  /** Thumbnail URL for videos */
  thumbnail_url?: string;
  /** Media title/description */
  title?: string;
  /** Source where media was found */
  source?: string;
  /** Media quality/resolution */
  quality?: string;
  /** Media category */
  category?: 'exterior' | 'interior' | 'engine' | 'action' | 'review';
}

/**
 * Media agent response structure.
 */
export interface MediaAgentResult extends AgentResponse {
  agent_type: 'media';

  // Media collections
  images?: MediaContent[];
  videos?: MediaContent[];
  galleries?: MediaContent[];

  // Media summary
  total_media_count?: number;
  media_sources?: string[];
  featured_media?: MediaContent[];

  // Quality assessment
  high_quality_count?: number;
  official_media_count?: number;
}

// ============================================================================
// STREAMING AND UI TYPES
// ============================================================================

/**
 * Streaming event types from backend SSE.
 */
export interface StreamingEvent {
  type: 'agent_spawn' | 'agent_complete' | 'chat_response' | 'orchestration_complete' | 'error';
  data?: any;
  timestamp?: string;
}

/**
 * Agent spawn event data.
 */
export interface AgentSpawnEvent extends StreamingEvent {
  type: 'agent_spawn';
  data: {
    agent: string;
    priority: 'background' | 'foreground';
    reason?: string;
    agent_id: string;
  };
}

/**
 * Agent completion event data.
 */
export interface AgentCompleteEvent extends StreamingEvent {
  type: 'agent_complete';
  data: {
    agent_type: string;
    agent_id: string;
    success: boolean;
    result?: AgentResponse;
    processing_time_ms?: number;
  };
}

/**
 * Chat response event data.
 */
export interface ChatResponseEvent extends StreamingEvent {
  type: 'chat_response';
  data: {
    response: string;
    partial?: boolean;
  };
}

/**
 * Consumer sentiment analysis from backend agent.
 */
export interface ConsumerSentimentResult extends AgentResponse {
  agent_type: 'sentiment';
  overall_verdict: string;
  confidence_level: string;
  top_owner_favorites: string[];
  common_owner_complaints: string[];
  serious_concerns: string[];
  inspection_checklist: string[];
  questions_for_seller: string[];
  analysis_summary: string;
  key_takeaway: string;
}

/**
 * Media search results from backend agent.
 */
export interface MediaSearchResult extends AgentResponse {
  agent_type: 'media';
  images: string[];
  videos: string[];
  search_summary: string;
}

/**
 * Combined agent results for UI display.
 */
export interface AgentResults {
  listings?: ListingsSearchResult;
  research?: ResearchAgentResult | VehicleResearchResult;
  sentiment?: SentimentAnalysisResult | ConsumerSentimentResult;
  media?: MediaAgentResult | MediaSearchResult;

  // Meta information
  total_agents: number;
  completed_agents: number;
  active_agents: string[];
  last_updated: string;
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

/**
 * Props for agent result display components.
 */
export interface AgentResultDisplayProps {
  /** Agent results to display */
  results: AgentResults;
  /** Loading state for each agent type */
  loading: {
    listings: boolean;
    research: boolean;
    sentiment: boolean;
    media: boolean;
  };
  /** Error states */
  errors: Record<string, string | null>;
  /** Session ID for context */
  sessionId: string;
  /** Custom className */
  className?: string;
}

/**
 * Props for individual agent components.
 */
export interface ListingsDisplayProps {
  data: ListingsSearchResult;
  loading?: boolean;
  className?: string;
}

export interface ResearchDisplayProps {
  data: ResearchAgentResult;
  loading?: boolean;
  className?: string;
}

export interface SentimentDisplayProps {
  data: SentimentAnalysisResult;
  loading?: boolean;
  className?: string;
}

export interface MediaDisplayProps {
  data: MediaAgentResult;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for listings results.
 */
export function isListingsResult(result: AgentResponse): result is ListingsSearchResult {
  return result.agent_type === 'listings';
}

/**
 * Type guard for research results.
 */
export function isResearchResult(result: AgentResponse): result is ResearchAgentResult {
  return result.agent_type === 'research';
}

/**
 * Type guard for sentiment results.
 */
export function isSentimentResult(result: AgentResponse): result is SentimentAnalysisResult {
  return result.agent_type === 'sentiment';
}

/**
 * Type guard for media results.
 */
export function isMediaResult(result: AgentResponse): result is MediaAgentResult {
  return result.agent_type === 'media';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Agent type union.
 */
export type AgentType = 'research' | 'listings' | 'sentiment' | 'media';

/**
 * All possible agent result types.
 */
export type AnyAgentResult = ListingsSearchResult | ResearchAgentResult | SentimentAnalysisResult | MediaAgentResult;

/**
 * Agent loading state.
 */
export type AgentLoadingState = Record<AgentType, boolean>;

/**
 * Agent error state.
 */
export type AgentErrorState = Record<AgentType, string | null>;