import type { Timer } from './types';
import { create } from 'zustand';

export const DEFAULT_TIMER: Timer = {
  workDuration: 1,
  breakDuration: 0.5,
  currentTime: 0,
  mode: 'work',
  status: 'idle',
  sessionCount: 0
}

interface TimerStore extends Timer {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  ...DEFAULT_TIMER,
  start: () => {
    set((state) => {
      if (state.currentTime === 0) {
        return {
          status: 'running',
          currentTime: state.workDuration * 60
        }
      }
      return { status: 'running' };
    });
  },

  pause: () => {
    set({ status: 'paused' });
  },

  reset: () => {
    set(DEFAULT_TIMER);
  },

  tick: () => {
    set((state) => {
      if (state.currentTime > 0) {
        return { currentTime: state.currentTime - 1 };
      }

      if (state.mode === 'work') {
        return {
          mode: 'break',
          currentTime: state.breakDuration * 60,
          sessionCount: state.sessionCount + 1
        };
      }
      return {
        mode: 'work',
        currentTime: state.workDuration * 60
      };
    });
  }
}));