import { useTimerStore } from '../../../entities/timer/model/store';
import { Button } from '../../../shared/ui/Button/Button';

export function TimerControls() {
  const status = useTimerStore(state => state.status);
  const start = useTimerStore(state => state.start);
  const pause = useTimerStore(state => state.pause);
  const reset = useTimerStore(state => state.reset);

  return (
    <div>
      {status === 'running' ? (
        <Button onClick={pause}>일시정지</Button>
      ) : (
        <Button onClick={start}>시작</Button>
      )}

      <Button onClick={reset}>리셋</Button>
    </div>
  );
}
