/**
 * Progressive layout controller for adaptive UI transformation.
 *
 * Manages layout transitions from chat-only to split-view with
 * smooth animations. Follows the backup's progressive disclosure
 * pattern while maintaining modular component architecture.
 *
 * @component
 * @example
 * ```tsx
 * <ProgressiveLayout
 *   chatComponent={<ChatInterface />}
 *   dashboardComponent={<VehicleDashboard />}
 *   hasMessages={true}
 * />
 * ```
 */

'use client';

import type { ReactElement, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface ProgressiveLayoutProps {
  /** Chat interface component */
  chatComponent: ReactNode;
  /** Dashboard component */
  dashboardComponent: ReactNode;
  /** Whether conversation has started */
  hasMessages: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Layout mode type definition.
 */
type LayoutMode = 'chat-only' | 'split-view';

/**
 * Animated layout transition configuration.
 */
const layoutTransitions = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  duration: 0.6
};

/**
 * Chat-only layout component.
 */
interface ChatOnlyLayoutProps {
  children: ReactNode;
}

const ChatOnlyLayout = ({ children }: ChatOnlyLayoutProps): ReactElement => (
  <div className="h-screen flex overflow-hidden">
    <motion.div
      className="flex flex-col bg-background w-full"
      initial={{ width: "40%" }}
      animate={{ width: "100%" }}
      transition={layoutTransitions}
    >
      {children}
    </motion.div>
  </div>
);

/**
 * Split view animated layout component.
 */
interface SplitViewAnimatedProps {
  chatComponent: ReactNode;
  dashboardComponent: ReactNode;
}

const SplitViewAnimated = ({
  chatComponent,
  dashboardComponent
}: SplitViewAnimatedProps): ReactElement => (
  <div className="h-screen flex overflow-hidden">
    {/* Chat Section - animated width transition */}
    <motion.div
      className="flex flex-col border-r bg-background"
      initial={{ width: "100%" }}
      animate={{ width: "40%" }}
      transition={layoutTransitions}
    >
      {chatComponent}
    </motion.div>

    {/* Dashboard Section - slide in from right */}
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        className="flex flex-col bg-background relative z-10"
        initial={{
          width: "60%",
          x: "100%",
          opacity: 0
        }}
        animate={{
          width: "60%",
          x: "0%",
          opacity: 1
        }}
        exit={{
          width: "60%",
          x: "100%",
          opacity: 0
        }}
        transition={{
          ...layoutTransitions,
          delay: 0.1
        }}
      >
        {dashboardComponent}
      </motion.div>
    </AnimatePresence>
  </div>
);

/**
 * Resizable panels layout component.
 */
interface ResizablePanelsLayoutProps {
  chatComponent: ReactNode;
  dashboardComponent: ReactNode;
}

const ResizablePanelsLayout = ({
  chatComponent,
  dashboardComponent
}: ResizablePanelsLayoutProps): ReactElement => (
  <div className="h-screen overflow-hidden">
    <PanelGroup
      direction="horizontal"
      className="h-full"
      storage={{
        getItem: (name: string) => {
          if (typeof window !== 'undefined') {
            return window.localStorage.getItem(name);
          }
          return null;
        },
        setItem: (name: string, value: string) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(name, value);
          }
        }
      }}
    >
      {/* Chat Panel */}
      <Panel
        defaultSize={40}
        minSize={25}
        maxSize={75}
        id="chat-panel"
        className="flex flex-col"
      >
        {chatComponent}
      </Panel>

      {/* Resizable Handle */}
      <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors duration-200 flex items-center justify-center group">
        <div className="w-1 h-12 bg-muted-foreground/20 rounded-full group-hover:bg-muted-foreground/40 transition-colors duration-200" />
      </PanelResizeHandle>

      {/* Dashboard Panel */}
      <Panel
        defaultSize={60}
        minSize={25}
        maxSize={75}
        id="dashboard-panel"
        className="flex flex-col"
      >
        {dashboardComponent}
      </Panel>
    </PanelGroup>
  </div>
);

export const ProgressiveLayout = ({
  chatComponent,
  dashboardComponent,
  hasMessages,
  className
}: ProgressiveLayoutProps): ReactElement => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('chat-only');
  const [showResizablePanels, setShowResizablePanels] = useState(false);

  // Automatically switch to split view when conversation starts
  useEffect(() => {
    if (hasMessages && layoutMode === 'chat-only') {
      setLayoutMode('split-view');
    }
  }, [hasMessages, layoutMode]);

  // Switch to resizable panels after entry animation completes
  useEffect(() => {
    if (layoutMode === 'split-view') {
      const timer = setTimeout(() => {
        setShowResizablePanels(true);
      }, 700); // Wait for entry animation to complete

      return () => clearTimeout(timer);
    } else {
      setShowResizablePanels(false);
      return undefined;
    }
  }, [layoutMode]);

  // Chat-only mode
  if (layoutMode === 'chat-only') {
    return (
      <div className={className}>
        <ChatOnlyLayout>
          {chatComponent}
        </ChatOnlyLayout>
      </div>
    );
  }

  // Split view with resizable panels (final state)
  if (showResizablePanels) {
    return (
      <div className={className}>
        <ResizablePanelsLayout
          chatComponent={chatComponent}
          dashboardComponent={dashboardComponent}
        />
      </div>
    );
  }

  // Split view with entry animations (transition state)
  return (
    <div className={className}>
      <SplitViewAnimated
        chatComponent={chatComponent}
        dashboardComponent={dashboardComponent}
      />
    </div>
  );
};