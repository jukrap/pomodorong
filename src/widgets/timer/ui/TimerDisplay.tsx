import { useTimerStore } from '../../../entities/timer/model/store';

export function TimerDisplay() {
  const currentTime = useTimerStore(state => state.currentTime);
  const mode = useTimerStore(state => state.mode);

  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor((currentTime % 3600) / 60);
  const seconds = currentTime % 60;

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div>
      <h2>{mode === 'work' ? '작업 시간' : '휴식 시간'}</h2>
      <div>
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </div>
    </div>
  );
}
