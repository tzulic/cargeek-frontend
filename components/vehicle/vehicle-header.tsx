/**
 * Vehicle profile header with progress tracking and metadata.
 *
 * Displays vehicle identification, research progress, and status indicators.
 * Follows atomic design principles with single responsibility for header display.
 *
 * @component
 * @example
 * ```tsx
 * <VehicleHeader
 *   vehicle="Tesla Model 3"
 *   trim="Performance"
 *   progressValue={75}
 *   isLoading={false}
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Car, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleHeaderProps {
  /** Vehicle name/identifier */
  vehicle: string;
  /** Vehicle trim level if available */
  trim?: string;
  /** Research progress percentage (0-100) */
  progressValue: number;
  /** Whether research is currently active */
  isLoading: boolean;
  /** Whether any data has been collected */
  hasData: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Progress indicator component with status badge.
 */
interface ProgressIndicatorProps {
  /** Progress percentage */
  value: number;
  /** Loading state */
  isLoading: boolean;
  /** Data availability */
  hasData: boolean;
}

const ProgressIndicator = ({
  value,
  isLoading,
  hasData
}: ProgressIndicatorProps): ReactElement => (
  <div className="flex items-center gap-3">
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          Research Progress
        </span>
        <span className="text-xs font-medium">
          {Math.round(value)}%
        </span>
      </div>
      <Progress
        value={value}
        className="h-2"
      />
    </div>
    <Badge
      variant={isLoading ? "secondary" : hasData ? "default" : "outline"}
      className="gap-1"
    >
      {isLoading && <Clock className="h-3 w-3 animate-pulse" />}
      {isLoading ? 'Processing' : hasData ? 'Complete' : 'Ready'}
    </Badge>
  </div>
);

/**
 * Vehicle identification section.
 */
interface VehicleIdentityProps {
  /** Vehicle name */
  vehicle: string;
  /** Optional trim level */
  trim?: string;
}

const VehicleIdentity = ({
  vehicle,
  trim
}: VehicleIdentityProps): ReactElement => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-primary/10 rounded-lg">
      <Car className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-foreground">
        {vehicle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h1>
      {trim && (
        <p className="text-sm text-muted-foreground">
          {trim} • AI-Powered Analysis
        </p>
      )}
    </div>
  </div>
);

export const VehicleHeader = ({
  vehicle,
  trim,
  progressValue,
  isLoading,
  hasData,
  className
}: VehicleHeaderProps): ReactElement => {
  return (
    <div className={cn(
      'bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border',
      className
    )}>
      <div className="space-y-4">
        {/* Vehicle Identity */}
        <VehicleIdentity vehicle={vehicle} trim={trim} />

        {/* Progress Tracking */}
        <ProgressIndicator
          value={progressValue}
          isLoading={isLoading}
          hasData={hasData}
        />
      </div>
    </div>
  );
};