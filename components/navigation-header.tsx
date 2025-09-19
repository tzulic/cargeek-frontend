'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, MessageSquare, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation header component.
 *
 * Provides navigation between chat interface and vehicle profile features.
 * Shows current active section and system status.
 */
export function NavigationHeader(): ReactElement {
  const pathname = usePathname();

  const isVehiclePage = pathname.startsWith('/vehicle');
  const isChatPage = pathname === '/' || pathname.startsWith('/chat');

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">CarGeek AI</span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant={isChatPage ? "default" : "ghost"}
                  size="sm"
                  className={cn("gap-2", isChatPage && "bg-primary text-primary-foreground")}
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
              </Link>

              <Link href="/vehicle">
                <Button
                  variant={isVehiclePage ? "default" : "ghost"}
                  size="sm"
                  className={cn("gap-2", isVehiclePage && "bg-primary text-primary-foreground")}
                >
                  <Car className="h-4 w-4" />
                  Vehicle Profiles
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-xs">AI Agents Online</span>
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}