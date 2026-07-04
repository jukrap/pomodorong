import { useEffect } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import {
  PresetButtons,
  CustomTimerForm,
} from '../../../features/timer/configure-timer';
import { SessionCounter } from './SessionCounter';
import { ProgressBar } from './ProgressBar';

export function TimerWidget() {
  const status = useTimerStore(state => state.status);
  const tick = useTimerStore(state => state.tick);

  // 타이머 틱
  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        tick();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, tick]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
      }}
    >
      <PresetButtons />
      <CustomTimerForm />
      <TimerDisplay />
      <ProgressBar />
      <SessionCounter />
      <TimerControls />
    </div>
  );
}
