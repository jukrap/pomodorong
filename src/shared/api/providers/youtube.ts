import type { MediaPlaybackStatus } from '../../../entities/music-stack/model/types';

interface YouTubePlayer {
  loadVideoById: (videoId: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  stopVideo: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getDuration: () => number;
  destroy?: () => void;
}

interface YouTubePlayerEvent<TData = number> {
  data: TData;
}

interface YouTubePlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars: {
    autoplay: number;
    controls: number;
    modestbranding: number;
    rel: number;
  };
  events: {
    onReady: () => void;
    onStateChange: (event: YouTubePlayerEvent) => void;
    onError: (event: YouTubePlayerEvent) => void;
    onAutoplayBlocked: () => void;
  };
}

interface YouTubeNamespace {
  Player: new (
    containerId: string,
    options: YouTubePlayerOptions
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubeProviderOptions {
  onTrackEnd?: () => void;
  onStatusChange?: (
    status: MediaPlaybackStatus,
    message?: string | null
  ) => void;
}

type YouTubeStatusChangeHandler = NonNullable<
  YouTubeProviderOptions['onStatusChange']
>;

export class YouTubeProvider {
  private player: YouTubePlayer | null = null;
  private isReady = false;
  private onTrackEnd: (() => void) | null = null;
  private onStatusChange: YouTubeStatusChangeHandler | null = null;

  async initialize(
    containerId: string,
    options: YouTubeProviderOptions = {}
  ): Promise<void> {
    this.onTrackEnd = options.onTrackEnd || null;
    this.onStatusChange = options.onStatusChange || null;
    this.setStatus('loading', 'YouTube 플레이어를 준비하는 중입니다.');

    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const checkYT = window.setInterval(() => {
        if (window.YT?.Player) {
          window.clearInterval(checkYT);
          this.createPlayer(containerId, resolve);
          return;
        }

        if (Date.now() - startedAt > 8000) {
          window.clearInterval(checkYT);
          const message = 'YouTube 플레이어를 불러오지 못했습니다.';
          this.setStatus('error', message);
          reject(new Error(message));
        }
      }, 100);
    });
  }

  private createPlayer(containerId: string, onComplete: () => void) {
    const YT = window.YT;
    if (!YT) {
      this.setStatus('error', 'YouTube API가 아직 준비되지 않았습니다.');
      return;
    }

    this.player = new YT.Player(containerId, {
      height: '360',
      width: '640',
      videoId: '',
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          this.isReady = true;
          this.setStatus('ready', null);
          onComplete();
        },
        onStateChange: this.handleStateChange.bind(this),
        onError: this.handleError.bind(this),
        onAutoplayBlocked: () => {
          this.setStatus(
            'autoplay-blocked',
            '브라우저가 자동재생을 차단했습니다. 시작 버튼을 누른 뒤 다시 재생해 주세요.'
          );
        },
      },
    });
  }

  private handleError(event: YouTubePlayerEvent) {
    const errorCode = event.data;
    const message = this.getErrorMessage(errorCode);
    const status: MediaPlaybackStatus =
      errorCode === 100 || errorCode === 101 || errorCode === 150
        ? 'unavailable'
        : 'error';

    this.setStatus(status, message);

    if ((errorCode === 101 || errorCode === 150) && this.onTrackEnd) {
      window.setTimeout(() => {
        this.onTrackEnd?.();
      }, 800);
    }
  }

  private handleStateChange(event: YouTubePlayerEvent) {
    if (event.data === 0) {
      this.onTrackEnd?.();
      return;
    }

    if (event.data === 3) {
      this.setStatus('loading', '트랙을 불러오는 중입니다.');
      return;
    }

    if (event.data === 1 || event.data === 2 || event.data === 5) {
      this.setStatus('ready', null);
    }
  }

  private getErrorMessage(errorCode: number) {
    switch (errorCode) {
      case 2:
        return '잘못된 비디오 ID입니다.';
      case 5:
        return 'HTML5 플레이어 오류입니다.';
      case 100:
        return '비디오를 찾을 수 없습니다.';
      case 101:
      case 150:
        return '이 비디오는 임베드 재생이 차단되어 다음 트랙으로 넘어갑니다.';
      default:
        return `알 수 없는 YouTube 오류입니다. 코드: ${errorCode}`;
    }
  }

  private setStatus(status: MediaPlaybackStatus, message?: string | null) {
    this.onStatusChange?.(status, message ?? null);
  }

  play(videoId: string) {
    if (this.isReady && this.player) {
      this.setStatus('loading', '트랙을 불러오는 중입니다.');
      this.player.loadVideoById(videoId);
    }
  }

  pause() {
    if (this.isReady && this.player) {
      this.player.pauseVideo();
    }
  }

  resume() {
    if (this.isReady && this.player) {
      this.player.playVideo();
    }
  }

  stop() {
    if (this.isReady && this.player) {
      this.player.stopVideo();
    }
  }

  setVolume(volume: number) {
    if (this.isReady && this.player) {
      this.player.setVolume(volume);
    }
  }

  getVolume(): number {
    if (this.isReady && this.player) {
      return this.player.getVolume();
    }
    return 50;
  }

  getCurrentTime(): number {
    if (this.isReady && this.player) {
      return this.player.getCurrentTime() || 0;
    }
    return 0;
  }

  seekTo(seconds: number) {
    if (this.isReady && this.player) {
      this.player.seekTo(seconds, true);
    }
  }

  getDuration(): number {
    if (this.isReady && this.player) {
      return this.player.getDuration() || 0;
    }
    return 0;
  }

  destroy() {
    this.player?.destroy?.();
    this.player = null;
    this.isReady = false;
    this.onTrackEnd = null;
    this.onStatusChange = null;
  }
}
