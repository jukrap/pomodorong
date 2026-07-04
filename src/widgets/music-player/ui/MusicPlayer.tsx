import { useEffect, useMemo, useRef, useState } from 'react';
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
  const didSyncInitialMode = useRef(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const mode = useTimerStore(state => state.mode);
  const timerStatus = useTimerStore(state => state.status);

  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );
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
  const currentTrack = tracks[currentTrackIndex] ?? null;
  const hasActionableIssue =
    playbackStatus === 'error' ||
    playbackStatus === 'unavailable' ||
    playbackStatus === 'autoplay-blocked';
  const statusMessage = useMemo(() => {
    if (playbackMessage) {
      return playbackMessage;
    }

    switch (playbackStatus) {
      case 'loading':
        return '연결 중';
      case 'ready':
        return '연결됨';
      case 'idle':
        return tracks.length > 0 ? '대기 중' : '미디어 없음';
      case 'error':
        return '연결 실패';
      case 'autoplay-blocked':
        return '자동재생 차단';
      case 'unavailable':
        return '재생 불가';
      default:
        return '대기 중';
    }
  }, [playbackMessage, playbackStatus, tracks.length]);

  useEffect(() => {
    let isDisposed = false;

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
    setPlaybackStatus('loading', '연결 중');
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
        <h2 id="music-player-title">
          {mode === 'work' ? '작업 미디어' : '휴식 미디어'}
        </h2>
        <div
          className={`music-player__connection music-player__connection--${playbackStatus}`}
          aria-live={playbackStatus === 'ready' ? 'off' : 'polite'}
        >
          <span className="music-player__connection-dot" aria-hidden="true" />
          <span data-testid="playback-status">{statusMessage}</span>
        </div>
      </div>

      {hasActionableIssue && (
        <p
          className={`music-player__status music-player__status--${playbackStatus}`}
          role="status"
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
          <div className="music-player__dock">
            <CurrentTrack />
            <div className="music-player__actions" aria-label="미디어 제어">
              <PlaybackControls />
              <button
                className="music-player__action"
                type="button"
                onClick={handleRetry}
                data-testid="retry-player"
              >
                재시도
              </button>
              <button
                className="music-player__action"
                type="button"
                onClick={handleOpenInYouTube}
                disabled={!currentTrack}
                data-testid="open-youtube"
              >
                YouTube에서 열기
              </button>
            </div>
          </div>
          <TrackList />
          <VolumeControl />
        </>
      )}

      <div id="youtube-player" className="music-player__youtube-host" />
    </section>
  );
}
