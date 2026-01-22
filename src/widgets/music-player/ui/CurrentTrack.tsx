import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';

export function CurrentTrack() {
  const mode = useTimerStore(state => state.mode);
  const getCurrentTrack = useMusicStackStore(state => state.getCurrentTrack);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );

  const currentTrack = getCurrentTrack(mode);

  console.log('🎵 CurrentTrack render:', {
    mode,
    index: currentTrackIndex,
    track: currentTrack?.title,
  });

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
        src={currentTrack.thumbnail}
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
          {currentTrack.duration > 0
            ? `${Math.floor(currentTrack.duration / 60)}분`
            : '라이브 스트림'}
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