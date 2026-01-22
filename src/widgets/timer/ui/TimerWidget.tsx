import { useEffect } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { PresetButtons, CustomTimerForm } from '../../../features/timer/configure-timer';
import { getMusicPlayer } from '../../music-player/ui/MusicPlayer';
import { SessionCounter } from './SessionCounter';

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

  // 음악 재생/일시정지 연동
  useEffect(() => {
    const player = getMusicPlayer();
    if (!player) return;

    if (status === 'running') {
      player.resume();
    } else if (status === 'paused') {
      player.pause();
    }
  }, [status]);

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
      <SessionCounter />
      <TimerControls />
    </div>
  );
}