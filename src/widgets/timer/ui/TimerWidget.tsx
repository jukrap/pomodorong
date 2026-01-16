import { useEffect } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';

export function TimerWidget() {
  const status = useTimerStore(state => state.status);
  const tick = useTimerStore(state => state.tick);

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        tick();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, tick]);

  return (
    <div>
      <TimerDisplay />
      <TimerControls />
    </div>
  );
}
