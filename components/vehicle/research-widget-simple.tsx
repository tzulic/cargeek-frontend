/**
 * Simple Research Widget - displays actual VehicleResearchResult data from backend.
 * No complex adapters - just renders what we actually receive.
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Settings, Car } from 'lucide-react';
import type { ResearchData } from '@/lib/types/agent-data-simple';

interface ResearchWidgetSimpleProps {
  data?: ResearchData;
  loading?: boolean;
  className?: string;
}

export const ResearchWidgetSimple = ({
  data,
  loading = false,
  className
}: ResearchWidgetSimpleProps): ReactElement => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Technical Research
            <Badge variant="secondary">Researching...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Gathering technical specifications...
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
            <TrendingUp className="h-5 w-5" />
            Technical Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No research data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {data.vehicle_name || 'Technical Research'}
          {data.reliability_rating && (
            <Badge variant="outline">
              Reliability: {data.reliability_rating}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {data.category} - {data.confidence_score}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 border rounded-lg">
            <div className="font-medium text-sm">{data.price_range}</div>
            <div className="text-xs text-muted-foreground">Price Range</div>
          </div>
          {data.fuel_economy && (
            <div className="text-center p-3 border rounded-lg">
              <div className="font-medium text-sm">{data.fuel_economy}</div>
              <div className="text-xs text-muted-foreground">Fuel Economy</div>
            </div>
          )}
          {data.seating_capacity && (
            <div className="text-center p-3 border rounded-lg">
              <div className="font-medium text-sm">{data.seating_capacity}</div>
              <div className="text-xs text-muted-foreground">Seating</div>
            </div>
          )}
          {data.towing_capacity && (
            <div className="text-center p-3 border rounded-lg">
              <div className="font-medium text-sm">{data.towing_capacity}</div>
              <div className="text-xs text-muted-foreground">Towing</div>
            </div>
          )}
        </div>

        {/* Engine Specs */}
        {data.engine_specs.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-blue-600" />
              <h5 className="font-medium">Engine & Powertrain</h5>
            </div>
            <ul className="space-y-1 text-sm">
              {data.engine_specs.map((spec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5 text-xs">•</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transmission */}
        {data.transmission_options.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-purple-600" />
              <h5 className="font-medium">Transmission</h5>
            </div>
            <ul className="space-y-1 text-sm">
              {data.transmission_options.map((option, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5 text-xs">•</span>
                  <span>{option}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Standard Features */}
        {data.standard_features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car className="h-4 w-4 text-gray-600" />
              <h5 className="font-medium">Standard Features</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.standard_features.slice(0, 8).map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5 text-xs">✓</span>
                  <span className="flex-1">{feature}</span>
                </div>
              ))}
              {data.standard_features.length > 8 && (
                <div className="text-xs text-muted-foreground">
                  +{data.standard_features.length - 8} more features
                </div>
              )}
            </div>
          </div>
        )}

        {/* Research Summary */}
        {data.research_summary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Research Summary</h5>
            <p className="text-sm text-muted-foreground">{data.research_summary}</p>
          </div>
        )}

        {/* Sources */}
        {data.sources_summary && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <strong>Sources:</strong> {data.sources_summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
};