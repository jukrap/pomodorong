import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { formatTrackDuration } from '../../../entities/track/lib/formatTrackDuration';
import { getTrackFallbackThumbnail } from '../../../entities/track/lib/getTrackFallbackThumbnail';

function formatClockDuration(durationSeconds?: number) {
  if (!durationSeconds || durationSeconds <= 0) {
    return 'Live';
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function CurrentTrack() {
  const mode = useTimerStore(state => state.mode);
  const workTracks = useMusicStackStore(state => state.workTracks);
  const breakTracks = useMusicStackStore(state => state.breakTracks);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );

  const tracks = mode === 'work' ? workTracks : breakTracks;
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
        onError={event => {
          event.currentTarget.src = getTrackFallbackThumbnail(
            currentTrack.videoId
          );
        }}
      />

      <div className="current-track__body">
        <span className="current-track__eyebrow">NOW PLAYING</span>
        <strong
          className="current-track__title"
          data-testid="current-track-title"
        >
          {currentTrack.title}
        </strong>
        <span className="current-track__duration">
          {mode === 'work' ? 'Focus stack' : 'Break stack'} ·{' '}
          {currentTrackIndex + 1}/{tracks.length} ·{' '}
          {formatTrackDuration(currentTrack.durationSeconds)}
        </span>
        <div className="current-track__timeline" aria-hidden="true">
          <span />
        </div>
        <div className="current-track__timecodes" aria-hidden="true">
          <span>0:00</span>
          <span>{formatClockDuration(currentTrack.durationSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
