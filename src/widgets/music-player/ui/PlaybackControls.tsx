import { motion } from 'motion/react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { getMusicPlayer } from '../model/playerAdapter';

const buttonMotion = {
  whileTap: { scale: 0.975 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
};

export function PlaybackControls() {
  const mode = useTimerStore(state => state.mode);
  const status = useTimerStore(state => state.status);
  const nextTrack = useMusicStackStore(state => state.nextTrack);
  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);

  const tracks = getCurrentTracks(mode);

  const handleNext = () => {
    const player = getMusicPlayer();

    const currentIndex = useMusicStackStore.getState().currentTrackIndex;
    const currentTime = player?.ready() ? player.getCurrentTime() : 0;

    useMusicStackStore.getState().savePlaybackState(mode, {
      trackIndex: currentIndex,
      currentTime,
    });

    const next = nextTrack(mode);
    if (next) {
      const newIndex = useMusicStackStore.getState().currentTrackIndex;
      useMusicStackStore.getState().savePlaybackState(mode, {
        trackIndex: newIndex,
        currentTime: 0,
      });

      if (!player?.ready()) {
        return;
      }

      player.play(next.videoId);

      if (status !== 'running') {
        window.setTimeout(() => {
          player.pause();
        }, 500);
      }
    }
  };

  return (
    <div className="playback-controls">
      <motion.button
        className="music-player__action music-player__action--primary"
        type="button"
        onClick={handleNext}
        disabled={tracks.length <= 1}
        data-testid="next-track"
        {...buttonMotion}
      >
        Next
      </motion.button>
    </div>
  );
}
