import { useEffect, useRef } from 'react';
import { YouTubeProvider } from '../../../shared/api/providers/youtube';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { CurrentTrack } from './CurrentTrack';
import { TrackList } from './TrackList';
import { VolumeControl } from './VolumeControl';
import { PlaybackControls } from './PlaybackControls';
import { getMusicPlayer, setMusicPlayer } from '../model/playerAdapter';
import './MusicPlayer.css';

export function MusicPlayer() {
  const playerRef = useRef<YouTubeProvider | null>(null);
  const isInitialized = useRef(false);
  const didSyncInitialMode = useRef(false);

  const mode = useTimerStore(state => state.mode);
  const timerStatus = useTimerStore(state => state.status);

  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);
  const getPlaybackState = useMusicStackStore(state => state.getPlaybackState);
  const savePlaybackState = useMusicStackStore(
    state => state.savePlaybackState
  );
  const playbackStatus = useMusicStackStore(state => state.playbackStatus);
  const playbackMessage = useMusicStackStore(state => state.playbackMessage);
  const setPlaybackStatus = useMusicStackStore(
    state => state.setPlaybackStatus
  );

  const tracks = getCurrentTracks(mode);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const provider = new YouTubeProvider();
    playerRef.current = provider;
    setMusicPlayer(provider);

    const handleTrackEnd = () => {
      const currentMode = useTimerStore.getState().mode;
      const next = useMusicStackStore.getState().nextTrack(currentMode);

      if (!next) {
        setPlaybackStatus('unavailable', '재생할 다음 트랙이 없습니다.');
        return;
      }

      provider.play(next.videoId);

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
      if (useTimerStore.getState().status !== 'running') {
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
      window.clearInterval(saveInterval);
      provider.destroy();
      playerRef.current = null;
      setMusicPlayer(null);
    };
  }, [setPlaybackStatus]);

  useEffect(() => {
    const player = getMusicPlayer();
    if (!player) return;

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
    if (!player) return;

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

  const statusMessage =
    playbackMessage ||
    (playbackStatus === 'loading' ? '미디어를 준비하는 중입니다.' : null);

  return (
    <section className="music-player" aria-labelledby="music-player-title">
      <div className="music-player__header">
        <h2 id="music-player-title">
          {mode === 'work' ? '작업 음악' : '휴식 음악'}
        </h2>
        <span className="music-player__mode">
          {mode === 'work' ? 'focus stack' : 'break stack'}
        </span>
      </div>

      {statusMessage && (
        <p
          className={`music-player__status music-player__status--${playbackStatus}`}
          role={playbackStatus === 'ready' ? undefined : 'status'}
        >
          {statusMessage}
        </p>
      )}

      {tracks.length === 0 ? (
        <div className="music-player__empty">
          <strong>이 모드에 등록된 트랙이 없습니다.</strong>
          <span>타이머는 미디어 없이도 계속 사용할 수 있습니다.</span>
        </div>
      ) : (
        <>
          <CurrentTrack />
          <PlaybackControls />
          <TrackList />
          <VolumeControl />
        </>
      )}

      <div id="youtube-player" className="music-player__youtube-host" />
    </section>
  );
}
