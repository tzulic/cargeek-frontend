/**
 * Modular sentiment analysis widget for consumer insights.
 *
 * Displays sentiment analysis results with category breakdowns,
 * highlights, and concerns. Atomic component focused solely on
 * sentiment data visualization.
 *
 * @component
 * @example
 * ```tsx
 * <SentimentWidget
 *   data={sentimentData}
 *   loading={false}
 *   className="mb-4"
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SentimentAnalysisResult, ConsumerSentimentResult } from '@/lib/types/agent-data';

interface SentimentWidgetProps {
  /** Sentiment analysis data */
  data?: SentimentAnalysisResult | ConsumerSentimentResult;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Overall sentiment score display component.
 */
interface SentimentScoreProps {
  /** Sentiment type */
  sentiment: 'positive' | 'neutral' | 'negative';
  /** Sentiment score (-1 to 1) */
  score: number;
  /** Number of reviews analyzed */
  reviewCount?: number;
}

const SentimentScore = ({
  sentiment,
  score,
  reviewCount
}: SentimentScoreProps): ReactElement => {
  const getIcon = () => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'negative': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getColorClass = () => {
    switch (sentiment) {
      case 'positive': return 'from-green-50 to-green-100 border-green-200';
      case 'negative': return 'from-red-50 to-red-100 border-red-200';
      default: return 'from-yellow-50 to-yellow-100 border-yellow-200';
    }
  };

  return (
    <div className={cn(
      'bg-gradient-to-r p-4 rounded-lg border',
      getColorClass()
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h4 className="font-medium">Overall Sentiment</h4>
            <p className="text-sm text-muted-foreground">
              {reviewCount ? `${reviewCount} reviews analyzed` : 'Analysis complete'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {(score * 100).toFixed(0)}%
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {sentiment}
          </Badge>
        </div>
      </div>
    </div>
  );
};

/**
 * Category sentiment breakdown component.
 */
interface CategoryBreakdownProps {
  /** Category sentiment data */
  categories: NonNullable<SentimentAnalysisResult['categories']>;
}

const CategoryBreakdown = ({ categories }: CategoryBreakdownProps): ReactElement => (
  <div>
    <h4 className="font-medium mb-3">Category Analysis</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Object.entries(categories).map(([category, data]) => (
        <div key={category} className="border rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium capitalize">{category}</span>
            <Badge
              variant={
                data.sentiment === 'positive' ? 'default' :
                data.sentiment === 'negative' ? 'destructive' : 'secondary'
              }
              className="text-xs"
            >
              {data.sentiment}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {(data.score * 100).toFixed(0)}% ({data.mentions} mentions)
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                data.sentiment === 'positive' ? 'bg-green-400' :
                data.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
              )}
              style={{ width: `${Math.abs(data.score * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Highlights and concerns sections component.
 */
interface InsightsSectionProps {
  /** Positive highlights */
  highlights?: string[];
  /** Negative concerns */
  concerns?: string[];
  /** Owner recommendations */
  recommendations?: string[];
}

const InsightsSection = ({
  highlights,
  concerns,
  recommendations
}: InsightsSectionProps): ReactElement => (
  <div className="space-y-4">
    {/* Positive Highlights */}
    {highlights && highlights.length > 0 && (
      <div>
        <h4 className="font-medium mb-2 text-green-700">What Owners Love</h4>
        <div className="space-y-2">
          {highlights.slice(0, 3).map((highlight, index) => (
            <div key={index} className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r">
              <p className="text-sm">{highlight}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Common Concerns */}
    {concerns && concerns.length > 0 && (
      <div>
        <h4 className="font-medium mb-2 text-red-700">Common Concerns</h4>
        <div className="space-y-2">
          {concerns.slice(0, 3).map((concern, index) => (
            <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
              <p className="text-sm">{concern}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Recommendations */}
    {recommendations && recommendations.length > 0 && (
      <div>
        <h4 className="font-medium mb-2">Owner Recommendations</h4>
        <div className="bg-blue-50 p-3 rounded-lg">
          <ul className="space-y-1 text-sm">
            {recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
);

export const SentimentWidget = ({
  data,
  loading = false,
  className
}: SentimentWidgetProps): ReactElement => {
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
            Processing owner sentiment data...
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Consumer Sentiment
          <Badge
            variant={
              data.overall_sentiment === 'positive' ? 'default' :
              data.overall_sentiment === 'negative' ? 'destructive' : 'secondary'
            }
          >
            {data.overall_sentiment}
          </Badge>
        </CardTitle>
        <CardDescription>
          Owner experiences and satisfaction analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Sentiment Score */}
        <SentimentScore
          sentiment={data.overall_sentiment}
          score={data.sentiment_score}
          reviewCount={data.review_count}
        />

        {/* Category Breakdown */}
        {data.categories && (
          <CategoryBreakdown categories={data.categories} />
        )}

        {/* Insights Section */}
        <InsightsSection
          highlights={data.positive_highlights}
          concerns={data.negative_concerns}
          recommendations={data.owner_recommendations}
        />
      </CardContent>
    </Card>
  );
};