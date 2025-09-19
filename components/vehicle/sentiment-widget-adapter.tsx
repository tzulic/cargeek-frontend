/**
 * Sentiment Widget Adapter - handles both SentimentAnalysisResult and ConsumerSentimentResult formats
 * Provides a unified interface for displaying sentiment data regardless of backend format.
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import type { AgentResults } from '@/lib/types/agent-data';

interface SentimentWidgetAdapterProps {
  /** Sentiment data from agent results */
  data?: AgentResults['sentiment'];
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const SentimentWidgetAdapter = ({
  data,
  loading = false,
  className
}: SentimentWidgetAdapterProps): ReactElement => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Consumer Sentiment
            <Badge variant="secondary">Analyzing...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Analyzing consumer reviews and feedback...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Consumer Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No sentiment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Type detection
  const isConsumerSentimentResult = 'overall_verdict' in data;
  const isSentimentAnalysisResult = 'overall_sentiment' in data;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Consumer Sentiment
          {isConsumerSentimentResult && data.confidence_level && (
            <Badge variant="outline" className="text-xs">
              {data.confidence_level}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isConsumerSentimentResult ? 'Owner experiences and buying recommendations' : 'Consumer sentiment analysis'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ConsumerSentimentResult format */}
        {isConsumerSentimentResult && (
          <>
            {/* Overall Verdict */}
            {data.overall_verdict && (
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold mb-2">{data.overall_verdict}</div>
                {data.confidence_level && (
                  <div className="text-sm text-muted-foreground">{data.confidence_level}</div>
                )}
              </div>
            )}

            {/* Top Owner Favorites */}
            {data.top_owner_favorites && data.top_owner_favorites.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h5 className="font-medium">Owner Favorites</h5>
                </div>
                <ul className="space-y-1 text-sm">
                  {data.top_owner_favorites.map((favorite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 text-xs">✓</span>
                      <span>{favorite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Complaints */}
            {data.common_owner_complaints && data.common_owner_complaints.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h5 className="font-medium">Common Complaints</h5>
                </div>
                <ul className="space-y-1 text-sm">
                  {data.common_owner_complaints.map((complaint, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5 text-xs">⚠</span>
                      <span>{complaint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Serious Concerns */}
            {data.serious_concerns && data.serious_concerns.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <h5 className="font-medium">Serious Concerns</h5>
                </div>
                <ul className="space-y-1 text-sm">
                  {data.serious_concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 text-xs">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Takeaway */}
            {data.key_takeaway && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Key Takeaway</h5>
                <p className="text-sm text-muted-foreground">{data.key_takeaway}</p>
              </div>
            )}
          </>
        )}

        {/* SentimentAnalysisResult format (original) */}
        {isSentimentAnalysisResult && (
          <>
            {/* Overall sentiment display */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold mb-2">
                {((data.sentiment_score + 1) * 50).toFixed(0)}%
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {data.overall_sentiment}
              </Badge>
            </div>

            {/* Positive highlights */}
            {data.positive_highlights && data.positive_highlights.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Positive Highlights</h5>
                <ul className="space-y-1 text-sm">
                  {data.positive_highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 text-xs">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative concerns */}
            {data.negative_concerns && data.negative_concerns.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Concerns</h5>
                <ul className="space-y-1 text-sm">
                  {data.negative_concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 text-xs">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Generic fallback for any data with analysis_summary */}
        {data.analysis_summary && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <strong>Analysis:</strong> {data.analysis_summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
};