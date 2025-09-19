/**
 * Simple Sentiment Widget - displays actual ConsumerSentimentResult data from backend.
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import type { SentimentData } from '@/lib/types/agent-data-simple';

interface SentimentWidgetSimpleProps {
  data?: SentimentData;
  loading?: boolean;
  className?: string;
}

export const SentimentWidgetSimple = ({
  data,
  loading = false,
  className
}: SentimentWidgetSimpleProps): ReactElement => {
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
            Analyzing consumer reviews...
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
          <Badge variant="outline" className="text-xs">
            {data.confidence_level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Verdict */}
        <div className="text-center p-4 border rounded-lg">
          <div className="text-lg font-semibold">{data.overall_verdict}</div>
        </div>

        {/* Owner Favorites */}
        {data.top_owner_favorites.length > 0 && (
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
        {data.common_owner_complaints.length > 0 && (
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

        {/* Key Takeaway */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium mb-2">Key Takeaway</h5>
          <p className="text-sm text-muted-foreground">{data.key_takeaway}</p>
        </div>
      </CardContent>
    </Card>
  );
};