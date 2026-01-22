import type { Timer, TimerPreset } from './types';
import { DEFAULT_PRESETS } from './types';
import { create } from 'zustand';

export const DEFAULT_TIMER: Timer = {
  workDuration: 120,
  breakDuration: 30,
  currentTime: 0,
  mode: 'work',
  status: 'idle',
  sessionCount: 0
}

function loadSelectedPreset(): TimerPreset {
  const saved = localStorage.getItem('selectedPreset');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_PRESETS[2];
    }
  }
  return DEFAULT_PRESETS[2];
}

function saveSelectedPreset(preset: TimerPreset) {
  localStorage.setItem('selectedPreset', JSON.stringify(preset));
}

interface TimerStore extends Timer {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;

  currentPreset: TimerPreset;
  setPreset: (preset: TimerPreset) => void;
}

export const useTimerStore = create<TimerStore>((set) => {
  const initialPreset = loadSelectedPreset();

  return {
    ...DEFAULT_TIMER,
    workDuration: initialPreset.workDuration,
    breakDuration: initialPreset.breakDuration,
    currentPreset: initialPreset,

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
      set((state) => ({
        ...DEFAULT_TIMER,
        workDuration: state.currentPreset.workDuration,
        breakDuration: state.currentPreset.breakDuration,
        currentPreset: state.currentPreset
      }));
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
    },

    setPreset: (preset: TimerPreset) => {
      saveSelectedPreset(preset);
      set({
        currentPreset: preset,
        workDuration: preset.workDuration,
        breakDuration: preset.breakDuration,
        currentTime: 0,
        mode: 'work',
        status: 'idle',
        sessionCount: 0
      });
    }
  };
});