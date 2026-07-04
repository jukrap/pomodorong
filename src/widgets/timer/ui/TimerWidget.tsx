import { useEffect } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import {
  PresetButtons,
  CustomTimerForm,
} from '../../../features/timer/configure-timer';
import './TimerWidget.css';

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
    <div className="timer-widget">
      <div className="timer-widget__presets">
        <PresetButtons />
      </div>
      <div className="timer-widget__stage">
        <TimerDisplay />
        <TimerControls />
        <p className="timer-widget__caption">
          Focus on what matters. One session at a time.
        </p>
      </div>
      <CustomTimerForm />
    </div>
  );
}
