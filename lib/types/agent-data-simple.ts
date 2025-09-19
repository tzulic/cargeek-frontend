/**
 * Simplified agent data types that match what the backend actually sends.
 * No complex inheritance - just the real data structures.
 */

// ============================================================================
// ACTUAL BACKEND AGENT TYPES (Match Reality)
// ============================================================================

/**
 * Base agent response structure.
 */
export interface BaseAgentResponse {
  agent_type: string;
  agent_id: string;
  success: boolean;
  error_details?: string;
}

/**
 * Research agent data (VehicleResearchResult from backend).
 */
export interface ResearchData extends BaseAgentResponse {
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
 * Sentiment agent data (ConsumerSentimentResult from backend).
 */
export interface SentimentData extends BaseAgentResponse {
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
 * Media agent data (MediaSearchResult from backend).
 */
export interface MediaData extends BaseAgentResponse {
  agent_type: 'media';
  images: string[];
  videos: string[];
  search_summary: string;
}

/**
 * Listings agent data (ListingsSearchResult from backend).
 */
export interface ListingsData extends BaseAgentResponse {
  agent_type: 'listings';
  success: boolean;
  total_found: number;
  returned_count: number;
  listings: Array<{
    id: string;
    year?: number;
    make?: string;
    model?: string;
    price?: number;
    mileage?: number;
    dealer_name?: string;
    vdp_url?: string;
    image_urls?: string[];
  }>;
  executive_summary?: string;
  key_insights?: string[];
  search_duration_ms?: number;
  warnings?: string[];
}

/**
 * Simple agent results for UI display.
 */
export interface AgentResults {
  research?: ResearchData;
  sentiment?: SentimentData;
  media?: MediaData;
  listings?: ListingsData;

  // Meta information
  total_agents: number;
  completed_agents: number;
  active_agents: string[];
  last_updated?: string;
}

// ============================================================================
// WIDGET PROPS (Simplified)
// ============================================================================

export interface ResearchDisplayProps {
  data?: ResearchData;
  loading?: boolean;
  className?: string;
}

export interface SentimentDisplayProps {
  data?: SentimentData;
  loading?: boolean;
  className?: string;
}

export interface MediaDisplayProps {
  data?: MediaData;
  loading?: boolean;
  className?: string;
}

export interface ListingsDisplayProps {
  data?: ListingsData;
  loading?: boolean;
  className?: string;
}