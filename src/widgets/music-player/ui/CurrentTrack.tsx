import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { formatTrackDuration } from '../../../entities/track/lib/formatTrackDuration';

export function CurrentTrack() {
  const mode = useTimerStore(state => state.mode);
  const getCurrentTrack = useMusicStackStore(state => state.getCurrentTrack);

  const currentTrack = getCurrentTrack(mode);

  if (!currentTrack) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
      }}
    >
      {/* 썸네일 */}
      <img
        src={currentTrack.thumbnailUrl}
        alt={currentTrack.title}
        style={{
          width: '80px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />

      {/* 트랙 정보 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#2d2d2d',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentTrack.title}
        </div>
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#6c757d',
          }}
        >
          {formatTrackDuration(currentTrack.durationSeconds)}
        </div>
      </div>

      {/* 재생 중 표시 */}
      <div
        style={{
          fontSize: '24px',
        }}
      >
        🎵
      </div>
    </div>
  );
}
