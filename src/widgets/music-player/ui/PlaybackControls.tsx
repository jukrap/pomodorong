import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { getMusicPlayer } from './MusicPlayer';

export function PlaybackControls() {
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const nextTrack = useMusicStackStore(state => state.nextTrack);

const handleNext = () => {
  const player = getMusicPlayer();
  if (!player) return;

  const currentIndex = useMusicStackStore.getState().currentTrackIndex;
  const currentTime = player.getCurrentTime();
  useMusicStackStore.getState().savePlaybackState(mode, {
    trackIndex: currentIndex,
    currentTime,
  });

  const next = nextTrack(mode);
  if (next) {
    console.log('⏭️ Next track:', next.title);

    const newIndex = useMusicStackStore.getState().currentTrackIndex;
    useMusicStackStore.getState().savePlaybackState(mode, {
      trackIndex: newIndex,
      currentTime: 0,
    });

    player.play(next.id);

    if (status !== 'running') {
      setTimeout(() => {
        player.pause();
      }, 500);
    }
  }
};

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
      }}
    >
      <button
        onClick={handleNext}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#4a5568',
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span>⏭️</span>
        <span>다음 곡</span>
      </button>
    </div>
  );
}
