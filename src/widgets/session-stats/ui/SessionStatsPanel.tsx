import { useSessionStatsStore } from '../../../entities/session/model/store';
import './SessionStatsPanel.css';

function formatFocusTime(totalFocusSeconds: number) {
  if (totalFocusSeconds <= 0) {
    return '0m';
  }

  const totalMinutes = Math.floor(totalFocusSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatLastCompletedAt(lastCompletedAt: string | null) {
  if (!lastCompletedAt) {
    return 'No sessions yet';
  }

  return new Intl.DateTimeFormat('en-US', {
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
        <h2 id="session-stats-title">Local stats</h2>
        <span>Saved on this device</span>
      </div>

      <dl className="session-stats__grid">
        <div>
          <span className="session-stats__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <rect x="4" y="5" width="16" height="15" rx="3" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
          </span>
          <div className="session-stats__copy">
            <dt>Sessions</dt>
            <dd>{completedSessions}</dd>
            <small>Completed</small>
          </div>
        </div>
        <div>
          <span
            className="session-stats__icon session-stats__icon--focus"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 7v6l4 2" />
            </svg>
          </span>
          <div className="session-stats__copy">
            <dt>Focus Time</dt>
            <dd>{formatFocusTime(totalFocusSeconds)}</dd>
            <small>Total</small>
          </div>
        </div>
        <div className="session-stats__wide">
          <span
            className="session-stats__icon session-stats__icon--line"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 16l5-5 4 4 7-8" />
            </svg>
          </span>
          <div className="session-stats__copy">
            <dt>Last Session</dt>
            <dd>{formatLastCompletedAt(lastCompletedAt)}</dd>
            <small>Local device</small>
          </div>
        </div>
      </dl>
    </section>
  );
}
