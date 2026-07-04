import { useState } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { getMusicPlayer } from '../model/playerAdapter';
import type { Track } from '../../../entities/track/model/types';
import { formatTrackDuration } from '../../../entities/track/lib/formatTrackDuration';

export function TrackList() {
  const [isOpen, setIsOpen] = useState(false);

  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );

  const tracks = getCurrentTracks(mode);

  const handleTrackClick = (track: Track, index: number) => {
    const player = getMusicPlayer();

    const currentIndex = useMusicStackStore.getState().currentTrackIndex;
    const currentTime = player?.ready() ? player.getCurrentTime() : 0;

    useMusicStackStore.getState().savePlaybackState(mode, {
      trackIndex: currentIndex,
      currentTime,
    });

    useMusicStackStore.setState({ currentTrackIndex: index });

    useMusicStackStore.getState().savePlaybackState(mode, {
      trackIndex: index,
      currentTime: 0,
    });

    if (!player?.ready()) {
      return;
    }

    player.play(track.videoId);

    if (status !== 'running') {
      window.setTimeout(() => {
        player.pause();
      }, 500);
    }
  };

  return (
    <div className="track-list">
      <button
        className="track-list__toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{isOpen ? '접기' : '재생목록'}</span>
        <strong>{tracks.length}곡</strong>
      </button>

      {isOpen && (
        <div className="track-list__items">
          {tracks.map((track, index) => (
            <button
              key={track.videoId}
              className={`track-list__item ${
                index === currentTrackIndex ? 'track-list__item--active' : ''
              }`}
              type="button"
              onClick={() => handleTrackClick(track, index)}
            >
              <span className="track-list__index">{index + 1}</span>

              <img
                className="track-list__thumb"
                src={track.thumbnailUrl}
                alt={track.title}
                loading="lazy"
              />

              <span className="track-list__title">{track.title}</span>

              <span className="track-list__duration">
                {formatTrackDuration(track.durationSeconds)}
              </span>

              {index === currentTrackIndex && (
                <span className="track-list__active-dot" aria-label="선택됨" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
