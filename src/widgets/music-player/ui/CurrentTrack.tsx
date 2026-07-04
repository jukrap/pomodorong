import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { formatTrackDuration } from '../../../entities/track/lib/formatTrackDuration';

export function CurrentTrack() {
  const mode = useTimerStore(state => state.mode);
  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );
  const playbackStatus = useMusicStackStore(state => state.playbackStatus);

  const tracks = getCurrentTracks(mode);
  const currentTrack = tracks[currentTrackIndex] ?? null;

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="current-track">
      <img
        className="current-track__thumb"
        src={currentTrack.thumbnailUrl}
        alt={currentTrack.title}
        loading="lazy"
      />

      <div className="current-track__body">
        <span className="current-track__eyebrow">
          {mode === 'work' ? 'Focus stack' : 'Break stack'} ·{' '}
          {currentTrackIndex + 1}/{tracks.length}
        </span>
        <strong
          className="current-track__title"
          data-testid="current-track-title"
        >
          {currentTrack.title}
        </strong>
        <span className="current-track__duration">
          {formatTrackDuration(currentTrack.durationSeconds)}
        </span>
      </div>

      <span
        className={`current-track__state current-track__state--${playbackStatus}`}
        aria-hidden="true"
      />
    </div>
  );
}
