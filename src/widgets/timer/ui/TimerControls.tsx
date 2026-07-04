import { motion } from 'motion/react';
import { useTimerStore } from '../../../entities/timer/model/store';
import './TimerControls.css';

const buttonMotion = {
  whileTap: { scale: 0.985 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
};

export function TimerControls() {
  const status = useTimerStore(state => state.status);
  const start = useTimerStore(state => state.start);
  const pause = useTimerStore(state => state.pause);
  const reset = useTimerStore(state => state.reset);

  return (
    <div className="timer-controls" aria-label="Timer controls">
      {status === 'running' ? (
        <motion.button
          className="timer-controls__button timer-controls__button--primary"
          type="button"
          onClick={pause}
          {...buttonMotion}
        >
          <span aria-hidden="true">Ⅱ</span>
          Pause
        </motion.button>
      ) : (
        <motion.button
          className="timer-controls__button timer-controls__button--primary"
          type="button"
          onClick={start}
          {...buttonMotion}
        >
          <span aria-hidden="true">▶</span>
          Start
        </motion.button>
      )}

      <motion.button
        className="timer-controls__button timer-controls__button--secondary"
        type="button"
        onClick={reset}
        {...buttonMotion}
      >
        <span aria-hidden="true">↻</span>
        Reset
      </motion.button>
    </div>
  );
}
