import type { CSSProperties } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import './TimerDisplay.css';

export function TimerDisplay() {
  const currentTime = useTimerStore(state => state.currentTime);
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const workDuration = useTimerStore(state => state.workDuration);
  const breakDuration = useTimerStore(state => state.breakDuration);

  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor((currentTime % 3600) / 60);
  const seconds = currentTime % 60;

  const formatTime = (num: number) => String(num).padStart(2, '0');
  const displayTime = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(
    seconds
  )}`;
  const totalSeconds = (mode === 'work' ? workDuration : breakDuration) * 60;
  const elapsedProgress =
    totalSeconds > 0 && !(status === 'idle' && currentTime === 0)
      ? Math.max(0, Math.min(1, 1 - currentTime / totalSeconds))
      : 0;
  const waveLevel = Math.max(12, Math.round(elapsedProgress * 100));

  return (
    <div className="timer-display">
      <div className={`timer-display__mode timer-display__mode--${mode}`}>
        <span className="timer-display__mode-dot" aria-hidden="true" />
        <div className="timer-display__mode-copy">
          <strong>{mode === 'work' ? 'Work' : 'Break'}</strong>
          <span>{mode === 'work' ? workDuration : breakDuration}:00</span>
        </div>
      </div>

      <div
        className="timer-display__time-shell"
        aria-label={`Remaining time ${displayTime}`}
        style={
          {
            '--timer-wave-level': `${waveLevel}%`,
          } as CSSProperties
        }
      >
        <span className="timer-display__time" aria-hidden="true">
          {displayTime}
        </span>
        <span className="timer-display__time-wave" aria-hidden="true">
          {displayTime}
        </span>
      </div>
    </div>
  );
}
