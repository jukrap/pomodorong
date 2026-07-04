import { useSessionStatsStore } from '../../../entities/session/model/store';
import './SessionStatsPanel.css';

function formatFocusTime(totalFocusSeconds: number) {
  if (totalFocusSeconds <= 0) {
    return '0분';
  }

  const totalMinutes = Math.floor(totalFocusSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}분`;
  }

  if (minutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${minutes}분`;
}

function formatLastCompletedAt(lastCompletedAt: string | null) {
  if (!lastCompletedAt) {
    return '아직 기록 없음';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(lastCompletedAt));
}

export function SessionStatsPanel() {
  const completedSessions = useSessionStatsStore(
    state => state.completedSessions
  );
  const totalFocusSeconds = useSessionStatsStore(
    state => state.totalFocusSeconds
  );
  const lastCompletedAt = useSessionStatsStore(state => state.lastCompletedAt);

  return (
    <section className="session-stats" aria-labelledby="session-stats-title">
      <div className="session-stats__header">
        <h2 id="session-stats-title">로컬 기록</h2>
        <span>이 기기에 저장</span>
      </div>

      <dl className="session-stats__grid">
        <div>
          <dt>완료 세션</dt>
          <dd>{completedSessions}</dd>
        </div>
        <div>
          <dt>누적 집중</dt>
          <dd>{formatFocusTime(totalFocusSeconds)}</dd>
        </div>
        <div className="session-stats__wide">
          <dt>마지막 완료</dt>
          <dd>{formatLastCompletedAt(lastCompletedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}
