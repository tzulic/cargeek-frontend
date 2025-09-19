/**
 * Simple Media Widget - displays actual MediaSearchResult data from backend.
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Video, Play, ExternalLink } from 'lucide-react';
import type { MediaData } from '@/lib/types/agent-data-simple';

interface MediaWidgetSimpleProps {
  data?: MediaData;
  loading?: boolean;
  className?: string;
}

export const MediaWidgetSimple = ({
  data,
  loading = false,
  className
}: MediaWidgetSimpleProps): ReactElement => {
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
            Finding images and videos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || (!data.images.length && !data.videos.length)) {
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

  const totalMedia = data.images.length + data.videos.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Media Content
          <Badge variant="outline" className="text-xs">
            {totalMedia} items
          </Badge>
        </CardTitle>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{data.search_summary}</p>

          {/* Images */}
          {data.images.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-4 w-4 text-blue-600" />
                <h5 className="font-medium">Images ({data.images.length})</h5>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {data.images.slice(0, 8).map((imageUrl, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt={`Vehicle image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ))}
                {data.images.length > 8 && (
                  <div className="aspect-video rounded-lg border flex items-center justify-center bg-gray-50">
                    <div className="text-xs text-muted-foreground">+{data.images.length - 8} more</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Videos */}
          {data.videos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-purple-600" />
                <h5 className="font-medium">Videos ({data.videos.length})</h5>
              </div>
              <div className="space-y-2">
                {data.videos.slice(0, 5).map((videoUrl, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Play className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Video {index + 1}</div>
                      <div className="text-xs text-muted-foreground truncate">{videoUrl}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
};