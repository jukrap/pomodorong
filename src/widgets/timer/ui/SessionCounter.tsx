import { useTimerStore } from '../../../entities/timer/model/store';

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
      <span aria-hidden="true">●</span>
      <span>Completed sessions: {sessionCount}</span>
    </div>
  );
}
