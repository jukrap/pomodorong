export interface SessionStats {
  completedSessions: number;
  totalFocusSeconds: number;
  lastCompletedAt: string | null;
}

export const DEFAULT_SESSION_STATS: SessionStats = {
  completedSessions: 0,
  totalFocusSeconds: 0,
  lastCompletedAt: null,
};
