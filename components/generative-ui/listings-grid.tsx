'use client';

import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Car,
  MapPin,
  Calendar,
  DollarSign,
  Fuel,
  Gauge,
  ExternalLink,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: string;
  location: string;
  year: number;
  mileage: string;
  dealer: string;
  rating?: number;
  priceChange?: 'up' | 'down' | 'stable';
  features: string[];
  imageUrl?: string;
  url?: string;
}

interface ListingsGridProps {
  listings: Listing[];
  isLoading: boolean;
  vehicleId: string;
  timeoutReached?: boolean;
}

/**
 * ListingsGrid component for displaying vehicle listings.
 *
 * Shows real-time vehicle listings from the listings agent with
 * rich formatting, pricing trends, and interactive elements.
 * Implements generative UI pattern for structured data display.
 */
export function ListingsGrid({
  listings,
  isLoading,
  vehicleId,
  timeoutReached = false
}: ListingsGridProps): ReactElement {
  const [animatedListings, setAnimatedListings] = useState<Listing[]>([]);

  // Animate in new listings as they arrive
  useEffect(() => {
    if (listings.length > animatedListings.length) {
      const newListings = listings.slice(animatedListings.length);

      newListings.forEach((listing, index) => {
        setTimeout(() => {
          setAnimatedListings(prev => [...prev, listing]);
        }, index * 200); // Stagger animation
      });
    }
  }, [listings, animatedListings.length]);

  const getPriceChangeIcon = (change?: 'up' | 'down' | 'stable') => {
    switch (change) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading && animatedListings.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!isLoading && animatedListings.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Listings Found Yet</h3>
        <p className="text-muted-foreground">
          The listings agent completed searching for "{vehicleId}" but found no results.
          This might indicate a very rare vehicle or specific search criteria.
        </p>
      </div>
    );
  }

  if (isLoading && animatedListings.length === 0 && timeoutReached) {
    return (
      <div className="text-center py-12 space-y-4">
        <Car className="h-12 w-12 mx-auto mb-4 text-blue-500 opacity-75" />
        <div>
          <h3 className="text-lg font-semibold mb-2">Deep Market Search In Progress</h3>
          <p className="text-muted-foreground">
            Our AI agents are conducting a comprehensive marketplace scan for "{vehicleId}".
          </p>
          <p className="text-sm text-blue-600 mt-2">
            This includes checking multiple dealers, auction sites, and private sellers...
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span>Usually completes within 2-3 minutes</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {animatedListings.length} Listing{animatedListings.length !== 1 ? 's' : ''} Found
          </span>
        </div>
        {isLoading && (
          <Badge variant="secondary" className="animate-pulse">
            Updating...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animatedListings.map((listing, index) => (
          <Card
            key={listing.id}
            className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg leading-tight">
                    {listing.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {listing.location}
                  </CardDescription>
                </div>
                {listing.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{listing.rating}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    {listing.price}
                  </span>
                  {getPriceChangeIcon(listing.priceChange)}
                </div>
                <Badge variant="outline">
                  {listing.dealer}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.mileage}</span>
                </div>
              </div>

              {listing.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {listing.features.slice(0, 3).map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {listing.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{listing.features.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {listing.url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(listing.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && animatedListings.length > 0 && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span className="text-sm">Loading more listings...</span>
          </div>
        </div>
      )}
    </div>
  );
}