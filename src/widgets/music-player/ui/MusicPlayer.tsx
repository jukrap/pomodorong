/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from 'react';
import { YouTubeProvider } from '../../../shared/api/providers/youtube';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import { CurrentTrack } from './CurrentTrack';
import { TrackList } from './TrackList';
import { VolumeControl } from './VolumeControl';
import { PlaybackControls } from './PlaybackControls';

let globalProvider: YouTubeProvider | null = null;

export function MusicPlayer() {
  const playerRef = useRef<YouTubeProvider | null>(null);
  const isInitialized = useRef(false);

  const mode = useTimerStore(state => state.mode);

  const getCurrentTracks = useMusicStackStore(state => state.getCurrentTracks);
  const nextTrack = useMusicStackStore(state => state.nextTrack);
  const savePlaybackState = useMusicStackStore(
    state => state.savePlaybackState
  );
  const getPlaybackState = useMusicStackStore(state => state.getPlaybackState);

  /**
   * 초기화: YouTube Player 생성 (한 번만)
   * 
   * eslint 경고를 무시하는 이유:
   * 1. 의도적으로 한 번만 실행되어야 함
   * 2. Zustand store 함수는 stable reference (안 바뀜)
   * 3. getState()로 최신 값을 가져옴 (stale closure 없음)
   */
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const provider = new YouTubeProvider();
    playerRef.current = provider;
    globalProvider = provider;

    const handleTrackEnd = () => {
      console.log('🎵 Track ended, playing next...');
      const currentMode = useTimerStore.getState().mode;
      const next = nextTrack(currentMode);

      if (next) {
        console.log('▶️ Next track:', next.title);
        provider.play(next.id);

        const newIndex = useMusicStackStore.getState().currentTrackIndex;
        savePlaybackState(currentMode, {
          trackIndex: newIndex,
          currentTime: 0,
        });
      }
    };

    provider.initialize('youtube-player', handleTrackEnd).then(() => {
      console.log('✅ YouTube initialized');

      const savedState = getPlaybackState(mode);
      const tracks = getCurrentTracks(mode);

      if (tracks.length > 0) {
        const trackIndex = Math.min(savedState.trackIndex, tracks.length - 1);
        const track = tracks[trackIndex];

        console.log('📼 Restoring playback:', {
          mode,
          trackIndex,
          time: `${Math.floor(savedState.currentTime / 60)}:${Math.floor(savedState.currentTime % 60)}`,
        });

        useMusicStackStore.setState({ currentTrackIndex: trackIndex });

        provider.play(track.id);

        if (savedState.currentTime > 0) {
          setTimeout(() => {
            provider.seekTo(savedState.currentTime);
            provider.pause();
          }, 1000);
        } else {
          provider.pause();
        }
      }
    });

    // 5초마다 현재 재생 위치 저장
    const saveInterval = setInterval(() => {
      if (provider) {
        const currentStatus = useTimerStore.getState().status;
        
        if (currentStatus === 'running') {
          const currentMode = useTimerStore.getState().mode;
          const currentIndex = useMusicStackStore.getState().currentTrackIndex;
          const currentTime = provider.getCurrentTime();

          savePlaybackState(currentMode, {
            trackIndex: currentIndex,
            currentTime,
          });
        }
      }
    }, 5000);

    return () => {
      clearInterval(saveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 모드 전환 시: 재생 상태 저장 후 새 모드 불러오기
   * 
   * eslint 경고를 무시하는 이유:
   * 1. mode가 바뀔 때만 실행되어야 함
   * 2. status는 현재 값만 확인 (의존성 불필요)
   * 3. Zustand 함수는 stable reference
   */
  useEffect(() => {
    const player = globalProvider;
    if (!player) return;

    // 이전 모드 저장
    const previousMode = mode === 'work' ? 'break' : 'work';
    const previousIndex = useMusicStackStore.getState().currentTrackIndex;
    const previousTime = player.getCurrentTime();

    console.log(`💾 Saving ${previousMode} position:`, {
      trackIndex: previousIndex,
      currentTime: Math.floor(previousTime),
    });

    savePlaybackState(previousMode, {
      trackIndex: previousIndex,
      currentTime: previousTime,
    });

    // 새 모드 불러오기
    console.log(`🔄 Mode changed to: ${mode}`);

    const savedState = getPlaybackState(mode);
    const tracks = getCurrentTracks(mode);

    if (tracks.length > 0) {
      const trackIndex = Math.min(savedState.trackIndex, tracks.length - 1);
      const track = tracks[trackIndex];

      console.log('📼 Restoring playback:', {
        mode,
        trackIndex,
        time: `${Math.floor(savedState.currentTime / 60)}:${Math.floor(savedState.currentTime % 60)}`,
      });

      useMusicStackStore.setState({ currentTrackIndex: trackIndex });

      player.play(track.id);

      setTimeout(() => {
        if (savedState.currentTime > 0) {
          player.seekTo(savedState.currentTime);
        }

        // 타이머 멈춰있으면 일시정지
        const currentStatus = useTimerStore.getState().status;
        if (currentStatus !== 'running') {
          setTimeout(() => player.pause(), 500);
        }
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
      }}
    >
      <h3
        style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#4a5568',
        }}
      >
        🎵 {mode === 'work' ? '작업 음악' : '휴식 음악'}
      </h3>

      <CurrentTrack />
      <PlaybackControls />
      <TrackList />
      <VolumeControl />

      <div
        id="youtube-player"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          opacity: 0,
          height: 0,
        }}
      ></div>
    </div>
  );
}

export function getMusicPlayer() {
  return globalProvider;
}