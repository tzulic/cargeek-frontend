/**
 * Modular research specifications widget.
 *
 * Displays technical specifications, features, and performance data
 * from the research agent. Atomic component with focused responsibility
 * for technical specification visualization.
 *
 * @component
 * @example
 * ```tsx
 * <ResearchWidget
 *   data={researchData}
 *   loading={false}
 *   className="mb-4"
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Gauge, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResearchAgentResult, TechnicalSpecs } from '@/lib/types/agent-data';

interface ResearchWidgetProps {
  /** Research data from agent - any format */
  data?: any;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Engine specifications component.
 */
interface EngineSpecsProps {
  /** Engine specification data */
  engine: NonNullable<TechnicalSpecs['engine']>;
}

const EngineSpecs = ({ engine }: EngineSpecsProps): ReactElement => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-3">
      <Zap className="h-4 w-4 text-blue-600" />
      <h5 className="font-medium">Engine</h5>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
      {Object.entries(engine).map(([key, value]) => (
        <div key={key}>
          <span className="text-muted-foreground capitalize">
            {key.replace('_', ' ')}
          </span>
          <div className="font-medium">{value}</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Performance metrics component.
 */
interface PerformanceMetricsProps {
  /** Performance data */
  performance: NonNullable<ResearchAgentResult['performance']>;
}

const PerformanceMetrics = ({ performance }: PerformanceMetricsProps): ReactElement => (
  <div className="bg-purple-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-3">
      <Gauge className="h-4 w-4 text-purple-600" />
      <h5 className="font-medium">Performance</h5>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
      {Object.entries(performance).map(([key, value]) => {
        if (key === 'handling_notes' && Array.isArray(value)) {
          return (
            <div key={key} className="md:col-span-2 lg:col-span-3">
              <span className="text-muted-foreground">Handling Notes</span>
              <ul className="mt-1 space-y-1">
                {value.slice(0, 3).map((note, index) => (
                  <li key={index} className="text-sm">• {note}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <div key={key}>
            <span className="text-muted-foreground capitalize">
              {key.replace('_', ' ')}
            </span>
            <div className="font-medium">{String(value)}</div>
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Features list component.
 */
interface FeaturesListProps {
  /** Features data */
  features: NonNullable<ResearchAgentResult['features']>;
}

const FeaturesList = ({ features }: FeaturesListProps): ReactElement => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Settings className="h-4 w-4 text-gray-600" />
      <h5 className="font-medium">Features & Equipment</h5>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(features).map(([category, items]) => {
        if (!Array.isArray(items) || items.length === 0) return null;
        return (
          <div key={category} className="border rounded-lg p-3">
            <h6 className="font-medium mb-2 capitalize text-sm">
              {category.replace('_', ' ')}
            </h6>
            <ul className="space-y-1 text-sm">
              {items.slice(0, 5).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 text-xs">✓</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
              {items.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{items.length - 5} more features
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Quick specs grid component.
 */
interface QuickSpecsProps {
  /** Technical specifications */
  specs: TechnicalSpecs;
}

const QuickSpecs = ({ specs }: QuickSpecsProps): ReactElement => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {specs.transmission && (
      <div className="text-center p-3 border rounded-lg">
        <div className="font-medium">{specs.transmission}</div>
        <div className="text-xs text-muted-foreground">Transmission</div>
      </div>
    )}
    {specs.drivetrain && (
      <div className="text-center p-3 border rounded-lg">
        <div className="font-medium">{specs.drivetrain}</div>
        <div className="text-xs text-muted-foreground">Drivetrain</div>
      </div>
    )}
    {specs.fuel_economy?.combined && (
      <div className="text-center p-3 border rounded-lg">
        <div className="font-medium">{specs.fuel_economy.combined} MPG</div>
        <div className="text-xs text-muted-foreground">Combined</div>
      </div>
    )}
    {specs.capacity?.seating && (
      <div className="text-center p-3 border rounded-lg">
        <div className="font-medium">{specs.capacity.seating}</div>
        <div className="text-xs text-muted-foreground">Seating</div>
      </div>
    )}
  </div>
);

export const ResearchWidget = ({
  data,
  loading = false,
  className
}: ResearchWidgetProps): ReactElement => {
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

  // Handle both ResearchAgentResult and VehicleResearchResult formats
  const isVehicleResearchResult = data && 'vehicle_name' in data;
  const isResearchAgentResult = data && 'technical_specs' in data;

  // Simple approach - just render whatever data exists
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Technical Research
          {data.reliability_rating && (
            <Badge variant="outline">
              Reliability: {data.reliability_rating}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {data.vehicle_name ? `Research for ${data.vehicle_name}` : 'Technical specifications and performance data'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show whatever data exists - simple approach */}
        {data.price_range && (
          <div className="text-center p-3 border rounded-lg">
            <div className="font-medium">{data.price_range}</div>
            <div className="text-xs text-muted-foreground">Price Range</div>
          </div>
        )}

        {/* Engine specs if available */}
        {data.engine_specs && data.engine_specs.length > 0 && (
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

        {/* Features if available */}
        {data.standard_features && data.standard_features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-gray-600" />
              <h5 className="font-medium">Standard Features</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.standard_features.slice(0, 8).map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5 text-xs">✓</span>
                  <span className="flex-1">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research summary */}
        {data.research_summary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Research Summary</h5>
            <p className="text-sm text-muted-foreground">{data.research_summary}</p>
          </div>
        )}

        {/* Debug: Show raw data structure */}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">Debug: Raw Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};