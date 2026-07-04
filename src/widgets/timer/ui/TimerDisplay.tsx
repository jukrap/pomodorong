import { useTimerStore } from '../../../entities/timer/model/store';
import './TimerDisplay.css';

export function TimerDisplay() {
  const currentTime = useTimerStore(state => state.currentTime);
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const workDuration = useTimerStore(state => state.workDuration);
  const breakDuration = useTimerStore(state => state.breakDuration);
  const displaySeconds =
    status === 'idle' && currentTime === 0
      ? (mode === 'work' ? workDuration : breakDuration) * 60
      : currentTime;

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;

  const formatTime = (num: number) => String(num).padStart(2, '0');
  const displayTime = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(
    seconds
  )}`;

  return (
    <div className="timer-display">
      <div className={`timer-display__mode timer-display__mode--${mode}`}>
        <span className="timer-display__mode-dot" aria-hidden="true" />
        <span>{mode === 'work' ? '작업 시간' : '휴식 시간'}</span>
      </div>

      <div
        className="timer-display__time"
        aria-label={`남은 시간 ${displayTime}`}
      >
        {displayTime}
      </div>
    </div>
  );
}
