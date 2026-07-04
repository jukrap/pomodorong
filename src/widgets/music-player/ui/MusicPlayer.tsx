import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { YouTubeProvider } from '../../../shared/api/providers/youtube';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { CurrentTrack } from './CurrentTrack';
import { PlaybackControls } from './PlaybackControls';
import { getMusicPlayer, setMusicPlayer } from '../model/playerAdapter';
import './MusicPlayer.css';

const actionMotion = {
  whileTap: { scale: 0.975 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
};

export function MusicPlayer() {
  const playerRef = useRef<YouTubeProvider | null>(null);
  const didSyncInitialMode = useRef(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const mode = useTimerStore(state => state.mode);
  const timerStatus = useTimerStore(state => state.status);

  const workTracks = useMusicStackStore(state => state.workTracks);
  const breakTracks = useMusicStackStore(state => state.breakTracks);
  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );
  const getPlaybackState = useMusicStackStore(state => state.getPlaybackState);
  const savePlaybackState = useMusicStackStore(
    state => state.savePlaybackState
  );
  const playbackStatus = useMusicStackStore(state => state.playbackStatus);
  const setPlaybackStatus = useMusicStackStore(
    state => state.setPlaybackStatus
  );

  const tracks = mode === 'work' ? workTracks : breakTracks;
  const currentTrack = tracks[currentTrackIndex] ?? null;
  const statusMessage = useMemo(() => {
    switch (playbackStatus) {
      case 'loading':
        return 'Connecting to player...';
      case 'ready':
        return 'Player ready';
      case 'idle':
        return tracks.length > 0 ? 'Ready' : 'No media';
      case 'error':
        return 'Connection issue';
      case 'autoplay-blocked':
        return 'Playback blocked';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Ready';
    }
  }, [playbackStatus, tracks.length]);

  useEffect(() => {
    let isDisposed = false;

    const provider = new YouTubeProvider();
    playerRef.current = provider;
    setMusicPlayer(provider);

    const handleTrackEnd = () => {
      const currentMode = useTimerStore.getState().mode;
      const next = useMusicStackStore.getState().nextTrack(currentMode);

      if (!next) {
        setPlaybackStatus('unavailable', 'No next track is available.');
        return;
      }

      if (provider.ready()) {
        provider.play(next.videoId);
      }

      const newIndex = useMusicStackStore.getState().currentTrackIndex;
      useMusicStackStore.getState().savePlaybackState(currentMode, {
        trackIndex: newIndex,
        currentTime: 0,
      });
    };

    provider
      .initialize('youtube-player', {
        onTrackEnd: handleTrackEnd,
        onStatusChange: setPlaybackStatus,
      })
      .then(() => {
        if (isDisposed || !provider.ready()) {
          return;
        }

        const currentMode = useTimerStore.getState().mode;
        const savedState = useMusicStackStore
          .getState()
          .getPlaybackState(currentMode);
        const currentTracks = useMusicStackStore
          .getState()
          .getCurrentTracks(currentMode);

        if (currentTracks.length === 0) {
          setPlaybackStatus('idle', null);
          return;
        }

        const trackIndex = Math.max(
          0,
          Math.min(savedState.trackIndex, currentTracks.length - 1)
        );
        const track = currentTracks[trackIndex];

        useMusicStackStore.setState({ currentTrackIndex: trackIndex });
        provider.play(track.videoId);

        window.setTimeout(() => {
          if (savedState.currentTime > 0) {
            provider.seekTo(savedState.currentTime);
          }

          if (useTimerStore.getState().status !== 'running') {
            provider.pause();
          }
        }, 800);
      })
      .catch(() => {
        // User-facing state is already set by the provider.
      });

    const saveInterval = window.setInterval(() => {
      if (useTimerStore.getState().status !== 'running' || !provider.ready()) {
        return;
      }

      const currentMode = useTimerStore.getState().mode;
      const currentIndex = useMusicStackStore.getState().currentTrackIndex;
      const currentTime = provider.getCurrentTime();

      useMusicStackStore.getState().savePlaybackState(currentMode, {
        trackIndex: currentIndex,
        currentTime,
      });
    }, 5000);

    return () => {
      isDisposed = true;
      window.clearInterval(saveInterval);
      provider.destroy();
      playerRef.current = null;
      setMusicPlayer(null);
    };
  }, [retryNonce, setPlaybackStatus]);

  useEffect(() => {
    const player = getMusicPlayer();
    if (!player?.ready()) return;

    if (timerStatus === 'running') {
      player.resume();
      return;
    }

    player.pause();
  }, [timerStatus]);

  useEffect(() => {
    if (!didSyncInitialMode.current) {
      didSyncInitialMode.current = true;
      return;
    }

    const player = getMusicPlayer();
    if (!player?.ready()) {
      const savedState = getPlaybackState(mode);
      const currentTracks = getCurrentTracks(mode);

      useMusicStackStore.setState({
        currentTrackIndex:
          currentTracks.length === 0
            ? 0
            : Math.max(
                0,
                Math.min(savedState.trackIndex, currentTracks.length - 1)
              ),
      });
      return;
    }

    const previousMode = mode === 'work' ? 'break' : 'work';
    const previousIndex = useMusicStackStore.getState().currentTrackIndex;
    const previousTime = player.getCurrentTime();

    savePlaybackState(previousMode, {
      trackIndex: previousIndex,
      currentTime: previousTime,
    });

    const savedState = getPlaybackState(mode);
    const currentTracks = getCurrentTracks(mode);

    if (currentTracks.length === 0) {
      useMusicStackStore.setState({ currentTrackIndex: 0 });
      setPlaybackStatus('idle', null);
      return;
    }

    const trackIndex = Math.max(
      0,
      Math.min(savedState.trackIndex, currentTracks.length - 1)
    );
    const track = currentTracks[trackIndex];

    useMusicStackStore.setState({ currentTrackIndex: trackIndex });
    player.play(track.videoId);

    window.setTimeout(() => {
      if (savedState.currentTime > 0) {
        player.seekTo(savedState.currentTime);
      }

      if (useTimerStore.getState().status !== 'running') {
        player.pause();
      }
    }, 800);
  }, [
    getCurrentTracks,
    getPlaybackState,
    mode,
    savePlaybackState,
    setPlaybackStatus,
  ]);

  const handleRetry = () => {
    setPlaybackStatus('loading', 'Connecting to player...');
    setRetryNonce(nonce => nonce + 1);
  };

  const handleOpenInYouTube = () => {
    if (!currentTrack) {
      return;
    }

    window.open(
      `https://www.youtube.com/watch?v=${currentTrack.videoId}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section
      className={`music-player music-player--${playbackStatus}`}
      aria-labelledby="music-player-title"
    >
      <div className="music-player__header">
        <h2 id="music-player-title">NOW PLAYING</h2>
      </div>

      {tracks.length === 0 ? (
        <div className="music-player__empty">
          <strong>No videos in this mode.</strong>
          <span>The timer still works without media.</span>
        </div>
      ) : (
        <>
          <div className="music-player__dock">
            <CurrentTrack />
            <div className="music-player__side">
              <div
                className={`music-player__connection music-player__connection--${playbackStatus}`}
                aria-live={playbackStatus === 'ready' ? 'off' : 'polite'}
              >
                <span
                  className="music-player__connection-dot"
                  aria-hidden="true"
                />
                <span data-testid="playback-status">{statusMessage}</span>
              </div>

              <div
                className="music-player__actions"
                aria-label="Media controls"
              >
                <PlaybackControls />
                <motion.button
                  className="music-player__action"
                  type="button"
                  onClick={handleRetry}
                  data-testid="retry-player"
                  {...actionMotion}
                >
                  Retry
                </motion.button>
                <motion.button
                  className="music-player__action"
                  type="button"
                  onClick={handleOpenInYouTube}
                  disabled={!currentTrack}
                  data-testid="open-youtube"
                  {...actionMotion}
                >
                  Open in YouTube
                </motion.button>
              </div>
            </div>
          </div>
        </>
      )}

      <div id="youtube-player" className="music-player__youtube-host" />
    </section>
  );
}
