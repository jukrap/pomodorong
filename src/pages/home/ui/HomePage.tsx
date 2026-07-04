import { useTimerStore } from '../../../entities/timer/model/store';
import { MusicPlayer } from '../../../widgets/music-player/ui/MusicPlayer';
import { SessionStatsPanel } from '../../../widgets/session-stats/ui/SessionStatsPanel';
import { TimerWidget } from '../../../widgets/timer/ui/TimerWidget';
import './HomePage.css';

export function HomePage() {
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);

  return (
    <div className={`home-page home-page--${mode}`}>
      <header className="home-page__header">
        <div>
          <p className="home-page__label">media pomodoro</p>
          <h1>pomoDORONG</h1>
        </div>
        <div className="home-page__status" aria-label="현재 타이머 상태">
          <span>{mode === 'work' ? '작업' : '휴식'}</span>
          <strong>
            {status === 'running'
              ? '진행 중'
              : status === 'paused'
                ? '일시정지'
                : '대기'}
          </strong>
        </div>
      </header>

      <main className="home-page__workspace">
        <section className="home-page__timer" aria-label="뽀모도로 타이머">
          <TimerWidget />
        </section>

        <aside className="home-page__side" aria-label="미디어와 기록">
          <MusicPlayer />
          <SessionStatsPanel />
        </aside>
      </main>
    </div>
  );
}
