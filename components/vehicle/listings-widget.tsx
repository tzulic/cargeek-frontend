/**
 * Modular listings widget for vehicle marketplace data.
 *
 * Displays vehicle listings with market intelligence in a focused,
 * reusable component. Follows atomic design with single responsibility
 * for listings visualization.
 *
 * @component
 * @example
 * ```tsx
 * <ListingsWidget
 *   data={listingsData}
 *   loading={false}
 *   className="mb-4"
 * />
 * ```
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingsSearchResult, VehicleListing } from '@/lib/types/agent-data';

interface ListingsWidgetProps {
  /** Listings data from agent */
  data?: ListingsSearchResult;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Market intelligence summary component.
 */
interface MarketIntelligenceProps {
  /** Market intelligence data */
  intelligence: NonNullable<ListingsSearchResult['market_intelligence']>;
}

const MarketIntelligence = ({ intelligence }: MarketIntelligenceProps): ReactElement => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4 className="font-medium mb-3">Market Intelligence</h4>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      {intelligence.price_range && (
        <div>
          <span className="text-muted-foreground">Price Range</span>
          <div className="font-medium">
            ${intelligence.price_range.min?.toLocaleString()} -
            ${intelligence.price_range.max?.toLocaleString()}
          </div>
        </div>
      )}
      {intelligence.average_mileage && (
        <div>
          <span className="text-muted-foreground">Avg Mileage</span>
          <div className="font-medium">
            {intelligence.average_mileage.toLocaleString()} mi
          </div>
        </div>
      )}
      {intelligence.inventory_level && (
        <div>
          <span className="text-muted-foreground">Inventory</span>
          <div className="font-medium capitalize">
            {intelligence.inventory_level}
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Individual listing card component.
 */
interface ListingCardProps {
  /** Vehicle listing data */
  listing: VehicleListing;
}

const ListingCard = ({ listing }: ListingCardProps): ReactElement => (
  <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">
          {listing.year} {listing.make} {listing.model}
        </h5>
        {listing.trim && (
          <p className="text-sm text-muted-foreground">{listing.trim}</p>
        )}
      </div>
      {listing.price && (
        <Badge variant="outline" className="font-medium">
          ${listing.price.toLocaleString()}
        </Badge>
      )}
    </div>

    <div className="space-y-2 text-sm">
      {listing.mileage && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mileage:</span>
          <span>{listing.mileage.toLocaleString()} mi</span>
        </div>
      )}
      {listing.condition && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Condition:</span>
          <Badge variant="secondary" className="text-xs capitalize">
            {listing.condition}
          </Badge>
        </div>
      )}
      {listing.dealer_name && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dealer:</span>
          <span className="text-right">{listing.dealer_name}</span>
        </div>
      )}
      {(listing.dealer_city || listing.dealer_state) && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Location:</span>
          <span>{listing.dealer_city}, {listing.dealer_state}</span>
        </div>
      )}
    </div>

    {listing.vdp_url && (
      <Button variant="outline" size="sm" className="w-full mt-3 gap-2" asChild>
        <a href={listing.vdp_url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3" />
          View Details
        </a>
      </Button>
    )}
  </div>
);

export const ListingsWidget = ({
  data,
  loading = false,
  className
}: ListingsWidgetProps): ReactElement => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Listings
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Searching marketplace listings...
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
            <Car className="h-5 w-5" />
            Vehicle Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No listings data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Listings
          <Badge variant="secondary">
            {data.total_found} found
          </Badge>
        </CardTitle>
        <CardDescription>
          Current marketplace listings and market analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Intelligence */}
        {data.market_intelligence && (
          <MarketIntelligence intelligence={data.market_intelligence} />
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.listings.slice(0, 6).map((listing, index) => (
            <ListingCard key={listing.id || index} listing={listing} />
          ))}
        </div>

        {/* Executive Summary */}
        {data.executive_summary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Market Summary</h4>
            <p className="text-sm text-muted-foreground">{data.executive_summary}</p>
          </div>
        )}

        {/* Show More Button */}
        {data.listings.length > 6 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View All {data.listings.length} Listings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};