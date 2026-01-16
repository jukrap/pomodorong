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