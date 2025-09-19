/**
 * Media Widget Adapter - handles both MediaAgentResult and MediaSearchResult formats
 * Provides a unified interface for displaying media data regardless of backend format.
 */

'use client';

import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Video, Play, ExternalLink } from 'lucide-react';
import type { AgentResults } from '@/lib/types/agent-data';

interface MediaWidgetAdapterProps {
  /** Media data from agent results */
  data?: AgentResults['media'];
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const MediaWidgetAdapter = ({
  data,
  loading = false,
  className
}: MediaWidgetAdapterProps): ReactElement => {
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

  // Type detection
  const isMediaSearchResult = 'images' in data && 'videos' in data && 'search_summary' in data;
  const isMediaAgentResult = 'total_media_count' in data;

  const images = isMediaSearchResult ? data.images : (data.images || []);
  const videos = isMediaSearchResult ? data.videos : (data.videos || []);

  const totalMedia = images.length + videos.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Media Content
          {totalMedia > 0 && (
            <Badge variant="outline" className="text-xs">
              {totalMedia} items
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isMediaSearchResult && data.search_summary ? data.search_summary : 'Images and videos for this vehicle'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalMedia === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No media content found
          </div>
        ) : (
          <>
            {/* Images Section */}
            {images.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="h-4 w-4 text-blue-600" />
                  <h5 className="font-medium">Images ({images.length})</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {images.slice(0, 8).map((imageUrl, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border group hover:shadow-md transition-shadow">
                      <img
                        src={typeof imageUrl === 'string' ? imageUrl : imageUrl.url}
                        alt={`Vehicle image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                  {images.length > 8 && (
                    <div className="aspect-video rounded-lg border flex items-center justify-center bg-gray-50">
                      <div className="text-xs text-muted-foreground text-center">
                        +{images.length - 8} more
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-4 w-4 text-purple-600" />
                  <h5 className="font-medium">Videos ({videos.length})</h5>
                </div>
                <div className="space-y-2">
                  {videos.slice(0, 5).map((videoUrl, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {typeof videoUrl === 'string' ? `Video ${index + 1}` : (videoUrl.title || `Video ${index + 1}`)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {typeof videoUrl === 'string' ? videoUrl : videoUrl.url}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                  {videos.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{videos.length - 5} more videos
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* MediaAgentResult format (original) */}
        {isMediaAgentResult && data.featured_media && data.featured_media.length > 0 && (
          <div>
            <h5 className="font-medium mb-3">Featured Media</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.featured_media.slice(0, 6).map((media, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.title || 'Vehicle media'}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                      <Play className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  {media.title && (
                    <div className="p-2">
                      <div className="text-xs font-medium truncate">{media.title}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};