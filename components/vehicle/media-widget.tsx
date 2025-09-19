/**
 * Modular media content widget for vehicle imagery and videos.
 *
 * Displays media galleries, video content, and visual assets
 * from the media agent. Atomic component focused solely on
 * media content visualization.
 *
 * @component
 * @example
 * ```tsx
 * <MediaWidget
 *   data={mediaData}
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
import { Image, Play, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaAgentResult, MediaContent } from '@/lib/types/agent-data';

interface MediaWidgetProps {
  /** Media data from agent */
  data?: MediaAgentResult;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Media overview stats component.
 */
interface MediaStatsProps {
  /** Number of images */
  imageCount: number;
  /** Number of videos */
  videoCount: number;
  /** High quality media count */
  highQualityCount: number;
  /** Official media count */
  officialCount: number;
}

const MediaStats = ({
  imageCount,
  videoCount,
  highQualityCount,
  officialCount
}: MediaStatsProps): ReactElement => (
  <div className="bg-purple-50 p-4 rounded-lg">
    <h5 className="font-medium mb-3">Media Overview</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{imageCount}</div>
        <div className="text-xs text-muted-foreground">Images</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{videoCount}</div>
        <div className="text-xs text-muted-foreground">Videos</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{highQualityCount}</div>
        <div className="text-xs text-muted-foreground">High Quality</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{officialCount}</div>
        <div className="text-xs text-muted-foreground">Official</div>
      </div>
    </div>
  </div>
);

/**
 * Media item card component.
 */
interface MediaItemCardProps {
  /** Media content item */
  media: MediaContent;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

const MediaItemCard = ({
  media,
  size = 'medium'
}: MediaItemCardProps): ReactElement => {
  const sizeClasses = {
    small: 'aspect-square',
    medium: 'aspect-video',
    large: 'aspect-video'
  };

  const containerClasses = {
    small: 'w-full',
    medium: 'w-full',
    large: 'w-full'
  };

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200',
      containerClasses[size]
    )}>
      {/* Media Preview */}
      <div className={cn(
        'bg-gray-100 flex items-center justify-center relative',
        sizeClasses[size]
      )}>
        {media.type === 'video' ? (
          <>
            <div className="text-gray-600">
              <Play className="h-8 w-8" />
            </div>
            <Badge className="absolute top-2 left-2 text-xs">
              Video
            </Badge>
          </>
        ) : (
          <>
            <Image className="h-8 w-8 text-gray-400" />
            <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
              Image
            </Badge>
          </>
        )}
        {media.quality && (
          <Badge variant="outline" className="absolute top-2 right-2 text-xs">
            {media.quality}
          </Badge>
        )}
      </div>

      {/* Media Info */}
      <div className="p-3 space-y-2">
        <div className="font-medium text-sm line-clamp-2">
          {media.title || 'Untitled Media'}
        </div>

        <div className="flex items-center gap-2">
          {media.category && (
            <Badge variant="outline" className="text-xs">
              {media.category}
            </Badge>
          )}
        </div>

        {media.source && (
          <div className="text-xs text-muted-foreground truncate">
            Source: {media.source}
          </div>
        )}

        {media.url && (
          <Button variant="outline" size="sm" className="w-full gap-2" asChild>
            <a href={media.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Media gallery grid component.
 */
interface MediaGalleryProps {
  /** Array of media items */
  items: MediaContent[];
  /** Maximum items to show */
  maxItems?: number;
  /** Grid columns */
  columns?: 2 | 3 | 4;
}

const MediaGallery = ({
  items,
  maxItems = 6,
  columns = 3
}: MediaGalleryProps): ReactElement => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  const displayItems = items.slice(0, maxItems);

  return (
    <div>
      <div className={cn('grid gap-4', gridClasses[columns])}>
        {displayItems.map((item, index) => (
          <MediaItemCard
            key={index}
            media={item}
            size={columns >= 4 ? 'small' : 'medium'}
          />
        ))}
      </div>

      {items.length > maxItems && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            View All {items.length} Items
          </Button>
        </div>
      )}
    </div>
  );
};

export const MediaWidget = ({
  data,
  loading = false,
  className
}: MediaWidgetProps): ReactElement => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media Content
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Gathering media content...
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
            <Image className="h-5 w-5" />
            Media Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No media data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const allMedia: MediaContent[] = [
    ...(data.images || []),
    ...(data.videos || []),
    ...(data.featured_media || [])
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Media Content
          <Badge variant="secondary">
            {data.total_media_count || allMedia.length} items
          </Badge>
        </CardTitle>
        <CardDescription>
          Vehicle imagery, videos, and visual content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Media Stats */}
        <MediaStats
          imageCount={data.images?.length || 0}
          videoCount={data.videos?.length || 0}
          highQualityCount={data.high_quality_count || 0}
          officialCount={data.official_media_count || 0}
        />

        {/* Featured Media */}
        {data.featured_media && data.featured_media.length > 0 && (
          <div>
            <h5 className="font-medium mb-3">Featured Media</h5>
            <MediaGallery items={data.featured_media} maxItems={3} columns={3} />
          </div>
        )}

        {/* Image Gallery */}
        {data.images && data.images.length > 0 && (
          <div>
            <h5 className="font-medium mb-3">Images ({data.images.length})</h5>
            <MediaGallery items={data.images} maxItems={8} columns={4} />
          </div>
        )}

        {/* Videos */}
        {data.videos && data.videos.length > 0 && (
          <div>
            <h5 className="font-medium mb-3">Videos ({data.videos.length})</h5>
            <MediaGallery items={data.videos} maxItems={4} columns={2} />
          </div>
        )}

        {/* Data Sources */}
        {data.media_sources && data.media_sources.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <span className="font-medium">Sources:</span> {data.media_sources.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};