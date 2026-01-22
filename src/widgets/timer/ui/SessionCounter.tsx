import { useTimerStore } from '../../../entities/timer/model/store';

/**
 * SessionCounter: 완료한 세션 수 표시
 * 
 * 세션 = 작업 시간 1번 완료
 * 예: 2시간 작업 → 휴식 → 세션 +1
 */
export function SessionCounter() {
  const sessionCount = useTimerStore(state => state.sessionCount);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#4a5568',
      }}
    >
      <span>🔥</span>
      <span>완료한 세션: {sessionCount}</span>
    </div>
  );
}