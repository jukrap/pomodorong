import { type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTimerStore } from '../../../../entities/timer/model/store';
import './TimerConfiguration.css';

interface CustomTimerFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const buttonMotion = {
  whileTap: { scale: 0.975 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
};

export function CustomTimerForm({ isOpen, onClose }: CustomTimerFormProps) {
  const currentPreset = useTimerStore(state => state.currentPreset);
  const setPreset = useTimerStore(state => state.setPreset);
  const shouldReduceMotion = useReducedMotion();

  if (!isOpen) {
    return null;
  }

  const workDuration = currentPreset.workDuration;
  const breakDuration = currentPreset.breakDuration;

  const updateCustomPreset = (
    nextWorkDuration: number,
    nextBreakDuration: number
  ) => {
    setPreset({
      id: 'custom',
      name: 'Custom',
      workDuration: nextWorkDuration,
      breakDuration: nextBreakDuration,
    });
  };

  const handleBackdropMouseDown = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="custom-timer"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.16 }}
    >
      <motion.section
        className="custom-timer__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-timer-title"
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 14, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 10, scale: 0.985 }
        }
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
      >
        <header className="custom-timer__header">
          <div>
            <p>Custom preset</p>
            <h2 id="custom-timer-title">Adjust session length</h2>
          </div>
          <motion.button
            className="custom-timer__close"
            type="button"
            onClick={onClose}
            aria-label="Close custom timer settings"
            {...buttonMotion}
          >
            ×
          </motion.button>
        </header>

        <div className="custom-timer__body">
          <label className="custom-timer__control">
            <span>Work duration</span>
            <strong>{workDuration}m</strong>
            <input
              type="range"
              min="1"
              max="240"
              value={workDuration}
              onChange={event =>
                updateCustomPreset(Number(event.target.value), breakDuration)
              }
            />
          </label>

          <label className="custom-timer__control">
            <span>Break duration</span>
            <strong>{breakDuration}m</strong>
            <input
              type="range"
              min="1"
              max="60"
              value={breakDuration}
              onChange={event =>
                updateCustomPreset(workDuration, Number(event.target.value))
              }
            />
          </label>
        </div>

        <footer className="custom-timer__footer">
          <span>Changes save immediately.</span>
          <motion.button type="button" onClick={onClose} {...buttonMotion}>
            Done
          </motion.button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
