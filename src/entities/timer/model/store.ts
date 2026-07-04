import type { Timer, TimerPreset, TimerSettings } from './types';
import { DEFAULT_PRESETS } from './types';
import { create } from 'zustand';
import { useSessionStatsStore } from '../../session/model/store';
import {
  readStorageValue,
  writeStorageValue,
} from '../../../shared/lib/storage/pomodorongStorage';

const TIMER_SETTINGS_STORAGE_KEY = 'timer-settings';

export const DEFAULT_TIMER: Timer = {
  workDuration: 90,
  breakDuration: 20,
  currentTime: 0,
  mode: 'work',
  status: 'idle',
  sessionCount: 0,
};

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  currentPreset: DEFAULT_PRESETS[2],
};

function isTimerPreset(value: unknown): value is TimerPreset {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const preset = value as Partial<TimerPreset>;
  return (
    typeof preset.id === 'string' &&
    typeof preset.name === 'string' &&
    typeof preset.workDuration === 'number' &&
    typeof preset.breakDuration === 'number'
  );
}

function loadSelectedPreset(): TimerPreset {
  const settings = readStorageValue<Partial<TimerSettings>>(
    TIMER_SETTINGS_STORAGE_KEY,
    DEFAULT_TIMER_SETTINGS
  );

  if (!isTimerPreset(settings.currentPreset)) {
    return DEFAULT_TIMER_SETTINGS.currentPreset;
  }

  if (settings.currentPreset.id === 'custom') {
    return settings.currentPreset;
  }

  return (
    DEFAULT_PRESETS.find(preset => preset.id === settings.currentPreset?.id) ??
    DEFAULT_TIMER_SETTINGS.currentPreset
  );
}

function saveSelectedPreset(preset: TimerPreset) {
  writeStorageValue(TIMER_SETTINGS_STORAGE_KEY, {
    currentPreset: preset,
  });
}

interface TimerStore extends Timer {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;

  currentPreset: TimerPreset;
  setPreset: (preset: TimerPreset) => void;
}

export const useTimerStore = create<TimerStore>(set => {
  const initialPreset = loadSelectedPreset();

  return {
    ...DEFAULT_TIMER,
    workDuration: initialPreset.workDuration,
    breakDuration: initialPreset.breakDuration,
    currentPreset: initialPreset,

    start: () => {
      set(state => {
        if (state.currentTime === 0) {
          return {
            status: 'running',
            currentTime: state.workDuration * 60,
          };
        }
        return { status: 'running' };
      });
    },

    pause: () => {
      set({ status: 'paused' });
    },

    reset: () => {
      set(state => ({
        ...DEFAULT_TIMER,
        workDuration: state.currentPreset.workDuration,
        breakDuration: state.currentPreset.breakDuration,
        currentPreset: state.currentPreset,
      }));
    },

    tick: () => {
      set(state => {
        if (state.currentTime > 1) {
          return { currentTime: state.currentTime - 1 };
        }

        if (state.mode === 'work') {
          useSessionStatsStore
            .getState()
            .recordCompletedSession(state.workDuration * 60);

          return {
            mode: 'break',
            currentTime: state.breakDuration * 60,
            sessionCount: state.sessionCount + 1,
          };
        }

        return {
          mode: 'work',
          currentTime: state.workDuration * 60,
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
        sessionCount: 0,
      });
    },
  };
});
