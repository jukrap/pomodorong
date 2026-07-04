import { create } from 'zustand';
import { DEFAULT_SESSION_STATS, type SessionStats } from './types';
import {
  readStorageValue,
  writeStorageValue,
} from '../../../shared/lib/storage/pomodorongStorage';

const SESSION_STATS_STORAGE_KEY = 'session-stats';

interface SessionStatsStore extends SessionStats {
  recordCompletedSession: (focusSeconds: number) => void;
  resetStats: () => void;
}

function loadSessionStats() {
  const stats = readStorageValue<Partial<SessionStats>>(
    SESSION_STATS_STORAGE_KEY,
    DEFAULT_SESSION_STATS
  );

  if (
    typeof stats.completedSessions !== 'number' ||
    typeof stats.totalFocusSeconds !== 'number' ||
    (stats.lastCompletedAt !== null &&
      typeof stats.lastCompletedAt !== 'string')
  ) {
    return DEFAULT_SESSION_STATS;
  }

  return {
    completedSessions: stats.completedSessions,
    totalFocusSeconds: stats.totalFocusSeconds,
    lastCompletedAt: stats.lastCompletedAt,
  };
}

function saveSessionStats(stats: SessionStats) {
  writeStorageValue(SESSION_STATS_STORAGE_KEY, stats);
}

export const useSessionStatsStore = create<SessionStatsStore>(set => ({
  ...loadSessionStats(),

  recordCompletedSession: focusSeconds => {
    set(state => {
      const nextStats: SessionStats = {
        completedSessions: state.completedSessions + 1,
        totalFocusSeconds: state.totalFocusSeconds + focusSeconds,
        lastCompletedAt: new Date().toISOString(),
      };

      saveSessionStats(nextStats);
      return nextStats;
    });
  },

  resetStats: () => {
    saveSessionStats(DEFAULT_SESSION_STATS);
    set(DEFAULT_SESSION_STATS);
  },
}));
