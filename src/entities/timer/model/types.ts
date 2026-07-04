export type TimerMode = 'work' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Timer {
  workDuration: number;
  breakDuration: number;
  currentTime: number;
  mode: TimerMode;
  status: TimerStatus;
  sessionCount: number;
}

export interface TimerPreset {
  id: string;
  name: string;
  workDuration: number;
  breakDuration: number;
}

export interface TimerSettings {
  currentPreset: TimerPreset;
}

export const DEFAULT_PRESETS: TimerPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    workDuration: 25,
    breakDuration: 5,
  },
  {
    id: 'standard',
    name: 'Standard',
    workDuration: 50,
    breakDuration: 10,
  },
  {
    id: 'deepwork',
    name: 'Deep Work',
    workDuration: 90,
    breakDuration: 20,
  },
  {
    id: 'custom',
    name: 'Custom',
    workDuration: 90,
    breakDuration: 20,
  },
];
