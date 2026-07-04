import { useTimerStore } from '../../../entities/timer/model/store';
import './TimerControls.css';

export function TimerControls() {
  const status = useTimerStore(state => state.status);
  const start = useTimerStore(state => state.start);
  const pause = useTimerStore(state => state.pause);
  const reset = useTimerStore(state => state.reset);

  return (
    <div className="timer-controls" aria-label="Timer controls">
      {status === 'running' ? (
        <button
          className="timer-controls__button timer-controls__button--primary"
          type="button"
          onClick={pause}
        >
          <span aria-hidden="true">Ⅱ</span>
          Pause
        </button>
      ) : (
        <button
          className="timer-controls__button timer-controls__button--primary"
          type="button"
          onClick={start}
        >
          <span aria-hidden="true">▶</span>
          Start
        </button>
      )}

      <button
        className="timer-controls__button timer-controls__button--secondary"
        type="button"
        onClick={reset}
      >
        <span aria-hidden="true">↻</span>
        Reset
      </button>
    </div>
  );
}
