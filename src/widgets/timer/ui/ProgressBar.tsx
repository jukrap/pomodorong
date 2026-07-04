import { useTimerStore } from '../../../entities/timer/model/store';
import './ProgressBar.css';

export function ProgressBar() {
  const mode = useTimerStore(state => state.mode);
  const currentTime = useTimerStore(state => state.currentTime);
  const status = useTimerStore(state => state.status);
  const workDuration = useTimerStore(state => state.workDuration);
  const breakDuration = useTimerStore(state => state.breakDuration);

  const totalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
  const displayTime =
    status === 'idle' && currentTime === 0 ? totalTime : currentTime;

  const progress = totalTime > 0 ? (displayTime / totalTime) * 100 : 0;
  const elapsedProgress = Math.max(0, Math.min(100, 100 - progress));

  return (
    <div className={`progress-bar progress-bar--${mode}`}>
      <div className="progress-bar__track" aria-hidden="true">
        <div
          className="progress-bar__fill"
          style={{ width: `${elapsedProgress}%` }}
        />
      </div>
      <span>{Math.round(progress)}% 남음</span>
    </div>
  );
}
