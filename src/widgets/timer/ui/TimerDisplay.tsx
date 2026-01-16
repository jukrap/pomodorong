import { useTimerStore } from '../../../entities/timer/model/store';

export function TimerDisplay() {
  const currentTime = useTimerStore(state => state.currentTime);
  const mode = useTimerStore(state => state.mode);

  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor((currentTime % 3600) / 60);
  const seconds = currentTime % 60;

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: '600',
          color: mode === 'work' ? '#4a5568' : '#2d3748',
        }}
      >
        {mode === 'work' ? '🔥 작업 시간' : '☕ 휴식 시간'}
      </h2>

      <div
        style={{
          fontSize: '72px',
          fontWeight: '700',
          fontFamily: 'monospace',
          color: '#2d2d2d',
          letterSpacing: '4px',
        }}
      >
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </div>
    </div>
  );
}
