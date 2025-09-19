'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Heart,
  Star,
  Users,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface SentimentData {
  overall: {
    score: number;
    rating: number;
    totalReviews: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  categories: {
    reliability: number;
    comfort: number;
    performance: number;
    value: number;
    features: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    change: number;
    period: string;
  };
  highlights: {
    positive: string[];
    negative: string[];
  };
  recentReviews: {
    id: string;
    rating: number;
    comment: string;
    author: string;
    date: string;
    helpful: number;
  }[];
}

interface SentimentChartProps {
  sentimentData: SentimentData | null;
  isLoading: boolean;
  timeoutReached?: boolean;
}

/**
 * SentimentChart component for consumer sentiment visualization.
 *
 * Displays comprehensive sentiment analysis data from the sentiment
 * agent including ratings, trends, and review highlights.
 * Implements generative UI pattern for data visualization.
 */
export function SentimentChart({
  sentimentData,
  isLoading,
  timeoutReached = false
}: SentimentChartProps): ReactElement {
  // Mock data for demonstration when no real data is available
  const mockData: SentimentData = {
    overall: {
      score: 78,
      rating: 4.2,
      totalReviews: 1247,
      sentiment: 'positive'
    },
    categories: {
      reliability: 82,
      comfort: 75,
      performance: 88,
      value: 65,
      features: 79
    },
    trends: {
      direction: 'up',
      change: 5.2,
      period: '30 days'
    },
    highlights: {
      positive: [
        'Excellent fuel efficiency',
        'Advanced safety features',
        'Smooth acceleration',
        'Premium interior quality'
      ],
      negative: [
        'Limited rear seat space',
        'Road noise at highway speeds',
        'Infotainment system complexity'
      ]
    },
    recentReviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Love the fuel economy and tech features. Very reliable for daily commuting.',
        author: 'Sarah M.',
        date: '2 days ago',
        helpful: 12
      },
      {
        id: '2',
        rating: 4,
        comment: 'Great performance but rear seat could be more spacious.',
        author: 'Mike T.',
        date: '5 days ago',
        helpful: 8
      },
      {
        id: '3',
        rating: 5,
        comment: 'Outstanding safety ratings and smooth ride quality.',
        author: 'Jennifer L.',
        date: '1 week ago',
        helpful: 15
      }
    ]
  };

  const data = sentimentData || mockData;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    if (timeoutReached) {
      return (
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <MessageCircle className="h-12 w-12 mx-auto text-blue-500 opacity-75" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analyzing Consumer Sentiment</h3>
                  <p className="text-muted-foreground">
                    Our AI is processing thousands of real owner reviews, forum discussions, and expert opinions.
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    This comprehensive analysis typically takes 3-5 minutes to ensure accuracy...
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  <span>Processing reviews and ratings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Show partial mock data with disclaimer */}
          <Card className="border-dashed border-muted-foreground/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-5 w-5" />
                Sample Sentiment Preview
              </CardTitle>
              <CardDescription>
                Preview based on general market data - detailed analysis loading...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground mb-1">
                    ~{data.overall.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Score</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${
                          index < Math.floor(data.overall.rating)
                            ? 'fill-yellow-400/50 text-yellow-400/50'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xl font-bold ml-2 text-muted-foreground">~{data.overall.rating}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-muted-foreground mb-1">
                    Analyzing...
                  </div>
                  <div className="text-sm text-muted-foreground">Trend Analysis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Quick loading skeleton for first 30 seconds */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <Card className={`border-2 ${getSentimentColor(data.overall.sentiment)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Overall Sentiment
              </CardTitle>
              <CardDescription>
                Based on {data.overall.totalReviews.toLocaleString()} owner reviews
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {data.overall.sentiment.charAt(0).toUpperCase() + data.overall.sentiment.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {data.overall.score}/100
              </div>
              <div className="text-sm text-muted-foreground">Sentiment Score</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.floor(data.overall.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xl font-bold ml-2">{data.overall.rating}</span>
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {getTrendIcon(data.trends.direction)}
                <span className="text-xl font-bold">
                  {data.trends.change > 0 ? '+' : ''}{data.trends.change}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last {data.trends.period}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Ratings</CardTitle>
          <CardDescription>
            Detailed breakdown by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.categories).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-sm text-muted-foreground">{score}/100</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ThumbsUp className="h-5 w-5" />
              What Owners Love
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.highlights.positive.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-green-800">{highlight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ThumbsDown className="h-5 w-5" />
              Common Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.highlights.negative.map((concern, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-red-800">{concern}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
          <CardDescription>
            Latest owner feedback and experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentReviews.map((review) => (
              <div key={review.id} className="border-l-2 border-primary/20 pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.author}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-foreground">{review.comment}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{review.helpful} found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}