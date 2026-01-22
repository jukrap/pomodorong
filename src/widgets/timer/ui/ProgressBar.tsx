import { useTimerStore } from '../../../entities/timer/model/store';

/**
 * ProgressBar: 남은 시간 시각화
 * 
 * 계산:
 * - 전체 시간 = workDuration * 60 (초)
 * - 남은 시간 = currentTime
 * - 진행률 = (남은 시간 / 전체 시간) * 100
 */
export function ProgressBar() {
  const mode = useTimerStore(state => state.mode);
  const currentTime = useTimerStore(state => state.currentTime);
  const workDuration = useTimerStore(state => state.workDuration);
  const breakDuration = useTimerStore(state => state.breakDuration);

  // 전체 시간 계산
  const totalTime = mode === 'work' 
    ? workDuration * 60 
    : breakDuration * 60;

  // 진행률 계산 (0-100)
  const progress = totalTime > 0 
    ? (currentTime / totalTime) * 100 
    : 0;

  // 색상 (작업/휴식)
  const color = mode === 'work' ? '#4ecdc4' : '#ffd93d';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '500px',
      }}
    >
      {/* 프로그레스 바 배경 */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* 프로그레스 바 (채워지는 부분) */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: color,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* 퍼센트 표시 */}
      <div
        style={{
          marginTop: '8px',
          textAlign: 'right',
          fontSize: '14px',
          color: '#6c757d',
          fontWeight: '500',
        }}
      >
        {Math.round(progress)}% 남음
      </div>
    </div>
  );
}