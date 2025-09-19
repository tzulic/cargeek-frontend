import type { ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

/**
 * Vehicle profile landing page.
 *
 * Provides navigation to specific vehicle profiles and overview
 * of the AI-powered vehicle intelligence system.
 */
export default function VehicleHomePage(): ReactElement {
  return (
    <div className="space-y-6">
      <header className="text-center py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          AI Vehicle Intelligence
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get comprehensive vehicle insights powered by LangGraph AI agents.
          Real-time listings, sentiment analysis, specifications, and market data.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Vehicle Research
            </CardTitle>
            <CardDescription>
              Detailed specifications and technical analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              AI agents analyze vehicle specs, features, safety ratings, and performance data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Market Intelligence
            </CardTitle>
            <CardDescription>
              Real-time listings and pricing trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Live marketplace data, price analysis, and availability tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Consumer Sentiment
            </CardTitle>
            <CardDescription>
              Owner reviews and satisfaction analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive analysis of owner experiences and feedback.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Search Vehicle Profile</CardTitle>
          <CardDescription>
            Enter a vehicle make and model to get comprehensive AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Try searching for popular vehicles:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Link href="/vehicle/tesla-model-3">
                <Button variant="outline" size="sm" className="w-full">
                  Tesla Model 3
                </Button>
              </Link>
              <Link href="/vehicle/honda-civic">
                <Button variant="outline" size="sm" className="w-full">
                  Honda Civic
                </Button>
              </Link>
              <Link href="/vehicle/toyota-camry">
                <Button variant="outline" size="sm" className="w-full">
                  Toyota Camry
                </Button>
              </Link>
              <Link href="/vehicle/ford-f150">
                <Button variant="outline" size="sm" className="w-full">
                  Ford F-150
                </Button>
              </Link>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Or navigate to <code className="bg-muted px-1 rounded">/vehicle/[vehicle-name]</code> directly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}