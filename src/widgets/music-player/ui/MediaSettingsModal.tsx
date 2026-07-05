import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { TimerMode } from '../../../entities/timer/model/types';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import {
  DEFAULT_BREAK_TRACKS,
  DEFAULT_WORK_TRACKS,
} from '../../../entities/track/model/types';
import {
  createTrackFromDraft,
  parseYouTubeVideoId,
} from '../../../entities/track/lib/parseYouTubeTrack';
import { formatTrackDuration } from '../../../entities/track/lib/formatTrackDuration';
import { getTrackFallbackThumbnail } from '../../../entities/track/lib/getTrackFallbackThumbnail';
import { getMusicPlayer } from '../model/playerAdapter';
import { VolumeControl } from './VolumeControl';
import './MediaSettingsModal.css';

type ToastTone = 'success' | 'error' | 'info';

interface MediaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, tone?: ToastTone) => void;
}

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Work',
  break: 'Break',
};

const buttonMotion = {
  whileTap: { scale: 0.975 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
};

export function MediaSettingsModal({
  isOpen,
  onClose,
  onToast,
}: MediaSettingsModalProps) {
  const currentMode = useTimerStore(state => state.mode);
  const timerStatus = useTimerStore(state => state.status);
  const shouldReduceMotion = useReducedMotion();
  const [activeMode, setActiveMode] = useState<TimerMode>(currentMode);
  const [urlOrId, setUrlOrId] = useState('');
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [urlTouched, setUrlTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const workTracks = useMusicStackStore(state => state.workTracks);
  const breakTracks = useMusicStackStore(state => state.breakTracks);
  const addTrack = useMusicStackStore(state => state.addTrack);
  const removeTrack = useMusicStackStore(state => state.removeTrack);
  const resetTracks = useMusicStackStore(state => state.resetTracks);
  const savePlaybackState = useMusicStackStore(
    state => state.savePlaybackState
  );
  const setPlaybackStatus = useMusicStackStore(
    state => state.setPlaybackStatus
  );
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );
  const workPlaybackState = useMusicStackStore(
    state => state.workPlaybackState
  );
  const breakPlaybackState = useMusicStackStore(
    state => state.breakPlaybackState
  );

  const tracks = activeMode === 'work' ? workTracks : breakTracks;
  const activeTrackIndex =
    activeMode === currentMode
      ? currentTrackIndex
      : activeMode === 'work'
        ? workPlaybackState.trackIndex
        : breakPlaybackState.trackIndex;
  const parsedVideoId = useMemo(() => parseYouTubeVideoId(urlOrId), [urlOrId]);
  const duplicateTrack = parsedVideoId
    ? tracks.find(track => track.videoId === parsedVideoId)
    : null;
  const canSubmit = Boolean(parsedVideoId) && !duplicateTrack;
  const trackCountLabel = useMemo(() => {
    if (tracks.length === 1) {
      return '1 video';
    }

    return `${tracks.length} videos`;
  }, [tracks.length]);
  const previewTitle = title.trim() || `YouTube video ${parsedVideoId ?? ''}`;
  const previewDuration =
    durationMinutes.trim() === ''
      ? 'Optional duration'
      : `${durationMinutes.trim()}m`;
  const shouldShowHelper = urlTouched || formSubmitted || urlOrId.trim() !== '';
  const helperTone =
    parsedVideoId && !duplicateTrack
      ? 'success'
      : shouldShowHelper
        ? 'error'
        : 'neutral';
  const helperMessage =
    parsedVideoId && duplicateTrack
      ? 'This video is already in the selected library.'
      : parsedVideoId
        ? 'Preview ready. Add it when the title looks right.'
        : shouldShowHelper
          ? 'Enter a valid YouTube URL or 11-character video ID.'
          : 'Paste a YouTube link or video ID to preview it first.';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const resetDraft = () => {
    setUrlOrId('');
    setTitle('');
    setDurationMinutes('');
    setUrlTouched(false);
    setFormSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitted(true);

    if (!canSubmit) {
      return;
    }

    const parsedDuration = Number(durationMinutes);
    const result = createTrackFromDraft({
      urlOrId,
      title,
      durationMinutes:
        durationMinutes.trim() === '' || Number.isNaN(parsedDuration)
          ? null
          : parsedDuration,
    });

    if (!result.ok) {
      return;
    }

    const addResult = addTrack(activeMode, result.track);

    if (!addResult.ok) {
      return;
    }

    resetDraft();
    onToast(`${MODE_LABELS[activeMode]} video added.`, 'success');
  };

  const handleSelectTrack = (index: number) => {
    const track = tracks[index];

    if (!track) {
      return;
    }

    savePlaybackState(activeMode, {
      trackIndex: index,
      currentTime: 0,
    });

    if (activeMode !== currentMode) {
      onToast(
        `${track.title} will play during ${MODE_LABELS[activeMode].toLowerCase()}.`,
        'info'
      );
      return;
    }

    useMusicStackStore.setState({ currentTrackIndex: index });

    const player = getMusicPlayer();

    if (player?.ready()) {
      player.play(track.videoId);

      if (timerStatus !== 'running') {
        window.setTimeout(() => player.pause(), 500);
      }
    }

    onToast(`${track.title} selected.`, 'info');
  };

  const syncPlayerToTrack = (videoId: string | null) => {
    const player = getMusicPlayer();

    if (!videoId) {
      if (player?.ready()) {
        player.stop();
      }

      setPlaybackStatus('idle', null);
      return;
    }

    if (!player?.ready()) {
      return;
    }

    player.play(videoId);

    if (timerStatus !== 'running') {
      window.setTimeout(() => player.pause(), 500);
    }
  };

  const handleRemoveTrack = (videoId: string, trackTitle: string) => {
    const removedIndex = tracks.findIndex(track => track.videoId === videoId);
    const wasActiveTrack =
      activeMode === currentMode && removedIndex === activeTrackIndex;
    const nextTracks = tracks.filter(track => track.videoId !== videoId);
    const nextTrack =
      nextTracks.length === 0
        ? null
        : nextTracks[Math.min(removedIndex, nextTracks.length - 1)];

    removeTrack(activeMode, videoId, activeMode === currentMode);

    if (wasActiveTrack) {
      syncPlayerToTrack(nextTrack?.videoId ?? null);
    }

    onToast(`${trackTitle} removed.`, 'info');
  };

  const handleResetTracks = () => {
    resetTracks(activeMode, activeMode === currentMode);

    if (activeMode === currentMode) {
      const defaultTrack =
        activeMode === 'work'
          ? DEFAULT_WORK_TRACKS[0]
          : DEFAULT_BREAK_TRACKS[0];
      syncPlayerToTrack(defaultTrack?.videoId ?? null);
    }

    onToast(`${MODE_LABELS[activeMode]} library restored.`, 'success');
  };

  const handleBackdropMouseDown = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="media-settings"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
    >
      <motion.section
        className="media-settings__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-settings-title"
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 18, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 12, scale: 0.985 }
        }
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
      >
        <header className="media-settings__header">
          <div>
            <p>Media library</p>
            <h2 id="media-settings-title">Build your focus stack</h2>
          </div>
          <motion.button
            className="media-settings__close"
            type="button"
            onClick={onClose}
            aria-label="Close media library"
            {...buttonMotion}
          >
            ×
          </motion.button>
        </header>

        <div className="media-settings__toolbar">
          <div
            className="media-settings__tabs"
            role="tablist"
            aria-label="Media library mode"
          >
            {(['work', 'break'] as TimerMode[]).map(mode => (
              <motion.button
                key={mode}
                className={`media-settings__tab ${
                  activeMode === mode ? 'media-settings__tab--active' : ''
                }`}
                type="button"
                role="tab"
                aria-selected={activeMode === mode}
                onClick={() => setActiveMode(mode)}
                {...buttonMotion}
              >
                {activeMode === mode && (
                  <motion.span
                    className="media-settings__tab-indicator"
                    layoutId="media-settings-active-tab"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 34,
                    }}
                  />
                )}
                <span>{MODE_LABELS[mode]}</span>
                <strong>
                  {(mode === 'work' ? workTracks : breakTracks).length}
                </strong>
              </motion.button>
            ))}
          </div>

          <div className="media-settings__toolbar-meta">
            <div className="media-settings__summary">
              <span>{MODE_LABELS[activeMode]} library</span>
              <strong>{trackCountLabel}</strong>
            </div>
            <VolumeControl />
          </div>
        </div>

        <div className="media-settings__workspace">
          <section className="media-settings__playlist">
            <div className="media-settings__section-heading">
              <div>
                <span>Playlist</span>
                <strong>{MODE_LABELS[activeMode]} stack</strong>
              </div>
              <motion.button
                className="media-settings__reset"
                type="button"
                onClick={handleResetTracks}
                {...buttonMotion}
              >
                Restore defaults
              </motion.button>
            </div>

            <div
              className="media-settings__list"
              data-testid="media-track-list"
            >
              <motion.div
                className="media-settings__list-content"
                key={activeMode}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.16 }}
              >
                {tracks.length === 0 ? (
                  <motion.div
                    className="media-settings__empty"
                  >
                    <strong>No videos in this library.</strong>
                    <span>The timer still works without media.</span>
                  </motion.div>
                ) : (
                  tracks.map((track, index) => (
                    <motion.article
                      className="media-settings__track"
                      key={track.videoId}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0.01 : 0.14 }}
                    >
                      <img
                        src={track.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        onError={event => {
                          event.currentTarget.src = getTrackFallbackThumbnail(
                            track.videoId
                          );
                        }}
                      />
                      <div className="media-settings__track-copy">
                        <strong>{track.title}</strong>
                        <span>
                          {formatTrackDuration(track.durationSeconds)} ·{' '}
                          {track.videoId}
                        </span>
                      </div>
                      <div className="media-settings__track-actions">
                        <motion.button
                          type="button"
                          onClick={() => handleSelectTrack(index)}
                          aria-pressed={index === activeTrackIndex}
                          {...buttonMotion}
                        >
                          {index === activeTrackIndex ? 'Active' : 'Set active'}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() =>
                            handleRemoveTrack(track.videoId, track.title)
                          }
                          data-testid={`remove-track-${track.videoId}`}
                          {...buttonMotion}
                        >
                          Remove
                        </motion.button>
                      </div>
                    </motion.article>
                  ))
                )}
              </motion.div>
            </div>
          </section>

          <form className="media-settings__add-panel" onSubmit={handleSubmit}>
            <div className="media-settings__section-heading">
              <div>
                <span>Add YouTube</span>
                <strong>Preview before saving</strong>
              </div>
            </div>

            <label className="media-settings__field">
              <span>YouTube URL or ID</span>
              <input
                required
                value={urlOrId}
                onBlur={() => setUrlTouched(true)}
                onChange={event => {
                  setUrlOrId(event.target.value);
                  setUrlTouched(true);
                }}
                placeholder="https://youtu.be/..."
                data-testid="track-url-input"
              />
            </label>

            <p
              className={`media-settings__helper media-settings__helper--${helperTone}`}
              data-testid="track-url-helper"
            >
              {helperMessage}
            </p>

            <AnimatePresence initial={false}>
              {parsedVideoId && (
                <motion.div
                  className="media-settings__preview"
                  key={parsedVideoId}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 10, scale: 0.985 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -8, scale: 0.985 }
                  }
                  transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
                  data-testid="track-preview"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${parsedVideoId}/hqdefault.jpg`}
                    alt=""
                    onError={event => {
                      event.currentTarget.src =
                        getTrackFallbackThumbnail(parsedVideoId);
                    }}
                  />
                  <div>
                    <span>Preview</span>
                    <strong>{previewTitle}</strong>
                    <small>{previewDuration}</small>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="media-settings__optional-fields">
              <label className="media-settings__field">
                <span>Display title</span>
                <input
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  placeholder="Optional title"
                  data-testid="track-title-input"
                />
              </label>

              <label className="media-settings__field">
                <span>Duration</span>
                <input
                  value={durationMinutes}
                  onChange={event => setDurationMinutes(event.target.value)}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Minutes"
                  data-testid="track-duration-input"
                />
              </label>
            </div>

            <div className="media-settings__form-actions">
              <motion.button
                type="submit"
                disabled={!canSubmit}
                data-testid="add-track"
                {...buttonMotion}
              >
                Add video
              </motion.button>
              <motion.button type="button" onClick={resetDraft} {...buttonMotion}>
                Clear
              </motion.button>
            </div>
          </form>
        </div>
      </motion.section>
    </motion.div>
  );
}
