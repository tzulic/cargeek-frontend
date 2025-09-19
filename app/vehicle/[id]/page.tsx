import type { ReactElement } from 'react';
import { VehicleProfileDashboard } from '@/components/vehicle-profile-dashboard';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Vehicle profile page component.
 *
 * Displays comprehensive vehicle information using generative UI components
 * that stream real-time data from LangGraph agents. Supports session sharing
 * with chat interface for background agent updates.
 *
 * @param params - Route parameters containing vehicle ID
 */
export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  const vehicleDisplayName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6">
      <header className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {vehicleDisplayName} Profile
            </h1>
            <p className="text-muted-foreground">
              AI-powered automotive intelligence and real-time data analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Badge variant="outline" className="gap-1 hover:bg-primary hover:text-primary-foreground cursor-pointer">
                <MessageSquare className="h-3 w-3" />
                Chat Interface
              </Badge>
            </Link>
            <Badge variant="secondary" className="gap-1">
              <Share2 className="h-3 w-3" />
              Session Shared
            </Badge>
          </div>
        </div>
      </header>

      <VehicleProfileDashboard vehicleId={id} />
    </div>
  );
}