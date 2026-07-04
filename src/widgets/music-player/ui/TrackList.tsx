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
    if (!player) return;

    const currentIndex = useMusicStackStore.getState().currentTrackIndex;
    const currentTime = player.getCurrentTime();
    useMusicStackStore.getState().savePlaybackState(mode, {
      trackIndex: currentIndex,
      currentTime,
    });

    // 인덱스 업데이트
    useMusicStackStore.setState({ currentTrackIndex: index });

    useMusicStackStore.getState().savePlaybackState(mode, {
      trackIndex: index,
      currentTime: 0,
    });

    // 트랙 로드
    player.play(track.videoId);

    if (status !== 'running') {
      window.setTimeout(() => {
        player.pause();
      }, 500);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px' }}>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#4a5568',
          background: 'rgba(255, 255, 255, 0.4)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {isOpen ? '▼' : '▶'} 재생목록 ({tracks.length}곡)
      </button>

      {/* 트랙 목록 */}
      {isOpen && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {tracks.map((track, index) => (
            <div
              key={track.videoId}
              onClick={() => handleTrackClick(track, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                background:
                  index === currentTrackIndex
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                borderLeft:
                  index === currentTrackIndex
                    ? '3px solid #4ecdc4'
                    : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (index !== currentTrackIndex) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                }
              }}
              onMouseLeave={e => {
                if (index !== currentTrackIndex) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }
              }}
            >
              {/* 순서 */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6c757d',
                  minWidth: '20px',
                }}
              >
                {index + 1}
              </div>

              {/* 썸네일 */}
              <img
                src={track.thumbnailUrl}
                alt={track.title}
                style={{
                  width: '40px',
                  height: '30px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />

              {/* 제목 */}
              <div
                style={{
                  flex: 1,
                  fontSize: '13px',
                  color: '#2d2d2d',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {track.title}
              </div>

              {/* 길이 */}
              <div
                style={{
                  fontSize: '12px',
                  color: '#6c757d',
                }}
              >
                {formatTrackDuration(track.durationSeconds)}
              </div>

              {/* 재생 중 표시 */}
              {index === currentTrackIndex && (
                <div style={{ fontSize: '16px' }}>🎵</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
