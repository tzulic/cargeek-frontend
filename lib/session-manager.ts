/**
 * Session management for coordinating chat and vehicle profile interactions.
 */

export class SessionManager {
  private static instance: SessionManager;
  private activeSessions = new Map<string, SessionInfo>();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Get or create a session for a specific vehicle.
   */
  getVehicleSession(vehicleId: string, userId?: string): string {
    const sessionKey = `${userId || 'anonymous'}-${vehicleId}`;

    if (!this.activeSessions.has(sessionKey)) {
      const sessionInfo: SessionInfo = {
        sessionId: `session-${vehicleId}-${Date.now()}`,
        vehicleId,
        userId,
        createdAt: new Date(),
        lastActivity: new Date(),
        activeInterfaces: new Set(['vehicle-profile'])
      };
      this.activeSessions.set(sessionKey, sessionInfo);
      console.log('🆔 Created new vehicle session:', sessionInfo.sessionId);
    }

    const session = this.activeSessions.get(sessionKey)!;
    session.lastActivity = new Date();
    return session.sessionId;
  }

  /**
   * Share session between chat and vehicle profile.
   */
  shareSession(sessionId: string, interfaceType: 'chat' | 'vehicle-profile'): void {
    for (const [key, session] of this.activeSessions.entries()) {
      if (session.sessionId === sessionId) {
        session.activeInterfaces.add(interfaceType);
        session.lastActivity = new Date();
        console.log('🔗 Session shared with:', interfaceType, 'Total interfaces:', session.activeInterfaces.size);
        break;
      }
    }
  }

  /**
   * Get session info for debugging.
   */
  getSessionInfo(sessionId: string): SessionInfo | undefined {
    for (const session of this.activeSessions.values()) {
      if (session.sessionId === sessionId) {
        return session;
      }
    }
    return undefined;
  }

  /**
   * Clean up old sessions (call this periodically).
   */
  cleanupOldSessions(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    for (const [key, session] of this.activeSessions.entries()) {
      if (session.lastActivity < cutoff) {
        this.activeSessions.delete(key);
        console.log('🧹 Cleaned up old session:', session.sessionId);
      }
    }
  }
}

interface SessionInfo {
  sessionId: string;
  vehicleId: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  activeInterfaces: Set<'chat' | 'vehicle-profile'>;
}

export const sessionManager = SessionManager.getInstance();