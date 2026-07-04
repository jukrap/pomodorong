import { useTimerStore } from '../../../entities/timer/model/store';
import './TimerControls.css';

export function TimerControls() {
  const status = useTimerStore(state => state.status);
  const start = useTimerStore(state => state.start);
  const pause = useTimerStore(state => state.pause);
  const reset = useTimerStore(state => state.reset);

  return (
    <div className="timer-controls" aria-label="타이머 제어">
      {status === 'running' ? (
        <button
          className="timer-controls__button timer-controls__button--primary"
          type="button"
          onClick={pause}
        >
          일시정지
        </button>
      ) : (
        <button
          className="timer-controls__button timer-controls__button--primary"
          type="button"
          onClick={start}
        >
          시작
        </button>
      )}

      <button
        className="timer-controls__button timer-controls__button--secondary"
        type="button"
        onClick={reset}
      >
        리셋
      </button>
    </div>
  );
}
