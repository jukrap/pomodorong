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

export const DEFAULT_PRESETS: TimerPreset[] = [
  {
    id: 'classic',
    name: '클래식',
    workDuration: 25,
    breakDuration: 5
  },
  {
    id: 'standard',
    name: '스탠다드',
    workDuration: 50,
    breakDuration: 10
  },
  {
    id: 'deepwork',
    name: '딥워크',
    workDuration: 120,
    breakDuration: 30
  },
  {
    id: 'custom',
    name: '커스텀',
    workDuration: 90,
    breakDuration: 20
  }
];