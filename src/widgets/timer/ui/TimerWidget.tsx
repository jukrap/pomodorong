import { useEffect } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { getMusicPlayer } from '../../music-player/ui/MusicPlayer';

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

  useEffect(() => {
    const player = getMusicPlayer();
    if (!player) return;

    if (status === 'running') {
      player.resume();
    } else if (status === 'paused') {
      player.pause();
    } else if (status === 'idle') {
      player.stop();
      player.play('yGtU47XUIoI');
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
      <TimerDisplay />
      <TimerControls />
    </div>
  );
}
