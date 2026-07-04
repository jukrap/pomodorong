import { useCallback, useEffect, useRef, useState } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { MusicPlayer } from '../../../widgets/music-player/ui/MusicPlayer';
import { MediaSettingsModal } from '../../../widgets/music-player/ui/MediaSettingsModal';
import { SessionStatsPanel } from '../../../widgets/session-stats/ui/SessionStatsPanel';
import { TimerWidget } from '../../../widgets/timer/ui/TimerWidget';
import {
  Toast,
  type ToastMessage,
  type ToastTone,
} from '../../../shared/ui/Toast/Toast';
import './HomePage.css';

export function HomePage() {
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const toastTimeoutRef = useRef<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setToast({
      id: Date.now(),
      message,
      tone,
    });

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`home-page home-page--${mode}`}>
      <header className="home-page__header">
        <div className="home-page__brand">
          <h1>
            <span>pomo</span>
            <strong>DORONG</strong>
          </h1>
        </div>

        <div className="home-page__utility" aria-label="Current timer status">
          <span className="home-page__status">
            <span>{mode === 'work' ? 'Work' : 'Break'}</span>
            <strong>
              {status === 'running'
                ? 'Running'
                : status === 'paused'
                  ? 'Paused'
                  : 'Ready'}
            </strong>
          </span>
          <button
            className="home-page__settings"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
          >
            ⚙ Settings
          </button>
          <span className="home-page__divider" aria-hidden="true" />
          <button
            className="home-page__menu-mark"
            type="button"
            aria-label="Open media settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      <main className="home-page__workspace">
        <section className="home-page__timer-stage" aria-label="Pomodoro timer">
          <TimerWidget />
        </section>

        <section className="home-page__media-stage" aria-label="Current media">
          <MusicPlayer />
        </section>

        <SessionStatsPanel />
      </main>

      {isSettingsOpen && (
        <MediaSettingsModal
          key={mode}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onToast={showToast}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
