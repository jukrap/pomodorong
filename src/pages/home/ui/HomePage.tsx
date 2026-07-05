import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { MusicPlayer } from '../../../widgets/music-player/ui/MusicPlayer';
import { MediaSettingsModal } from '../../../widgets/music-player/ui/MediaSettingsModal';
import { SessionStatsPanel } from '../../../widgets/session-stats/ui/SessionStatsPanel';
import { TimerWidget } from '../../../widgets/timer/ui/TimerWidget';
import {
  Toast,
  type ToastMessage,
  type ToastTone,
} from '../../../shared/ui/Toast/Toast';
import { SynthWaveField } from './SynthWaveField';
import './HomePage.css';

export function HomePage() {
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const playbackStatus = useMusicStackStore(state => state.playbackStatus);
  const playbackMessage = useMusicStackStore(state => state.playbackMessage);
  const toastTimeoutRef = useRef<number | null>(null);
  const lastPlaybackToastRef = useRef<string | null>(null);
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

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setToast(null);
  }, []);

  const openSettings = useCallback(() => {
    dismissToast();
    setIsSettingsOpen(true);
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const shouldNotify =
      playbackStatus === 'autoplay-blocked' ||
      playbackStatus === 'error' ||
      playbackStatus === 'unavailable';

    if (!shouldNotify) {
      lastPlaybackToastRef.current = null;
      return;
    }

    if (isSettingsOpen) {
      return;
    }

    const message =
      playbackMessage ??
      (playbackStatus === 'autoplay-blocked'
        ? 'Autoplay was blocked. Press Start, then Retry.'
        : playbackStatus === 'unavailable'
          ? 'This video is unavailable. Try the next one.'
          : 'YouTube player connection failed. Try Retry.');
    const toastKey = `${playbackStatus}:${message}`;

    if (lastPlaybackToastRef.current === toastKey) {
      return;
    }

    lastPlaybackToastRef.current = toastKey;
    const timeout = window.setTimeout(() => {
      showToast(message, playbackStatus === 'unavailable' ? 'info' : 'error');
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isSettingsOpen, playbackMessage, playbackStatus, showToast]);

  return (
    <div className={`home-page home-page--${mode}`}>
      <SynthWaveField />

      <header className="home-page__header">
        <div className="home-page__brand">
          <img
            className="home-page__brand-mark"
            src="/pomodorong-icon.svg"
            alt=""
            aria-hidden="true"
          />
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
          <motion.button
            className="home-page__settings"
            type="button"
            onClick={openSettings}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            aria-label="Open media library and settings"
          >
            <span className="home-page__settings-icon" aria-hidden="true">
              ⚙
            </span>
            <span className="home-page__settings-label">Settings</span>
          </motion.button>
        </div>
      </header>

      <main className="home-page__workspace">
        <section className="home-page__timer-stage" aria-label="Pomodoro timer">
          <TimerWidget />
        </section>

        <section className="home-page__media-stage" aria-label="Current media">
          <MusicPlayer onOpenSettings={openSettings} />
        </section>

        <SessionStatsPanel />
      </main>

      <footer className="home-page__footer" aria-label="Storage and project links">
        <span>All data is saved on this device only.</span>
        <a
          href="https://github.com/jukrap/pomodorong#readme"
          target="_blank"
          rel="noreferrer"
        >
          Learn more
        </a>
        <a
          href="https://github.com/jukrap/pomodorong"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </footer>

      <AnimatePresence>
        {isSettingsOpen && (
          <MediaSettingsModal
            key="media-library"
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onToast={showToast}
          />
        )}
      </AnimatePresence>
      <Toast toast={toast} />
    </div>
  );
}
