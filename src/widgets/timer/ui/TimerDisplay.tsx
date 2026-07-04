import { useTimerStore } from '../../../entities/timer/model/store';
import './TimerDisplay.css';

export function TimerDisplay() {
  const currentTime = useTimerStore(state => state.currentTime);
  const mode = useTimerStore(state => state.mode);

  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor((currentTime % 3600) / 60);
  const seconds = currentTime % 60;

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="timer-display">
      <h2 className={`timer-display__mode timer-display__mode--${mode}`}>
        {mode === 'work' ? '🔥 작업 시간' : '☕ 휴식 시간'}
      </h2>

      <div className="timer-display__time">
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </div>
    </div>
  );
}
