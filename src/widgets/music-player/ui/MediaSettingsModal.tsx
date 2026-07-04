import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { TimerMode } from '../../../entities/timer/model/types';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import {
  DEFAULT_BREAK_TRACKS,
  DEFAULT_WORK_TRACKS,
} from '../../../entities/track/model/types';
import { createTrackFromDraft } from '../../../entities/track/lib/parseYouTubeTrack';
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

export function MediaSettingsModal({
  isOpen,
  onClose,
  onToast,
}: MediaSettingsModalProps) {
  const currentMode = useTimerStore(state => state.mode);
  const timerStatus = useTimerStore(state => state.status);
  const [activeMode, setActiveMode] = useState<TimerMode>(currentMode);
  const [urlOrId, setUrlOrId] = useState('');
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

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
  const trackCountLabel = useMemo(() => {
    if (tracks.length === 1) {
      return '1 video';
    }

    return `${tracks.length} videos`;
  }, [tracks.length]);

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
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      onToast(result.message, 'error');
      return;
    }

    const addResult = addTrack(activeMode, result.track);

    if (!addResult.ok) {
      onToast(addResult.message, 'error');
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

    onToast(`${MODE_LABELS[activeMode]} stack restored.`, 'success');
  };

  const handleBackdropMouseDown = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="media-settings"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className="media-settings__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-settings-title"
      >
        <header className="media-settings__header">
          <div>
            <p>Media settings</p>
            <h2 id="media-settings-title">Video stacks</h2>
          </div>
          <button
            className="media-settings__close"
            type="button"
            onClick={onClose}
            aria-label="Close media settings"
          >
            ×
          </button>
        </header>

        <div
          className="media-settings__tabs"
          role="tablist"
          aria-label="Video stack mode"
        >
          {(['work', 'break'] as TimerMode[]).map(mode => (
            <button
              key={mode}
              className={`media-settings__tab ${
                activeMode === mode ? 'media-settings__tab--active' : ''
              }`}
              type="button"
              role="tab"
              aria-selected={activeMode === mode}
              onClick={() => setActiveMode(mode)}
            >
              <span>{MODE_LABELS[mode]}</span>
              <strong>
                {(mode === 'work' ? workTracks : breakTracks).length}
              </strong>
            </button>
          ))}
        </div>

        <div className="media-settings__body">
          <form className="media-settings__form" onSubmit={handleSubmit}>
            <label>
              <span>YouTube URL or ID</span>
              <input
                required
                value={urlOrId}
                onChange={event => setUrlOrId(event.target.value)}
                placeholder="https://youtu.be/..."
                data-testid="track-url-input"
              />
            </label>

            <label>
              <span>Display title</span>
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="Optional title"
                data-testid="track-title-input"
              />
            </label>

            <label>
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

            <div className="media-settings__form-actions">
              <button type="submit" data-testid="add-track">
                Add video
              </button>
              <button type="button" onClick={resetDraft}>
                Clear
              </button>
            </div>
          </form>

          <aside className="media-settings__side">
            <VolumeControl />
            <div className="media-settings__summary">
              <span>{MODE_LABELS[activeMode]} stack</span>
              <strong>{trackCountLabel}</strong>
            </div>
            <button
              className="media-settings__reset"
              type="button"
              onClick={handleResetTracks}
            >
              Restore defaults
            </button>
          </aside>
        </div>

        <div className="media-settings__list" data-testid="media-track-list">
          {tracks.length === 0 ? (
            <div className="media-settings__empty">
              <strong>No videos in this stack.</strong>
              <span>The timer still works without media.</span>
            </div>
          ) : (
            tracks.map((track, index) => (
              <article className="media-settings__track" key={track.videoId}>
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
                <div>
                  <strong>{track.title}</strong>
                  <span>
                    {formatTrackDuration(track.durationSeconds)} ·{' '}
                    {track.videoId}
                  </span>
                </div>
                <div className="media-settings__track-actions">
                  <button
                    type="button"
                    onClick={() => handleSelectTrack(index)}
                    aria-pressed={index === activeTrackIndex}
                  >
                    {index === activeTrackIndex ? 'Active' : 'Set active'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveTrack(track.videoId, track.title)
                    }
                    data-testid={`remove-track-${track.videoId}`}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
