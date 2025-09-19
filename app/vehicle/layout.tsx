import type { ReactElement } from 'react';

/**
 * Vehicle profile layout component.
 *
 * Provides the base layout structure for vehicle profile pages,
 * optimized for rich data visualization and generative UI components.
 */
export default function VehicleLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}