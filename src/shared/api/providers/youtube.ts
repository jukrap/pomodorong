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

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();

      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }

      reject(new Error('YouTube API callback fired without Player.'));
    };

    if (
      !document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )
    ) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        youtubeApiPromise = null;
        reject(new Error('YouTube IFrame API script failed to load.'));
      };
      document.head.append(script);
    }

    const checkReady = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(checkReady);
        resolve(window.YT);
        return;
      }

      if (Date.now() - startedAt > 8000) {
        window.clearInterval(checkReady);
        youtubeApiPromise = null;
        reject(new Error('YouTube IFrame API timed out.'));
      }
    }, 100);
  });

  return youtubeApiPromise;
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
  private isDestroyed = false;
  private readyTimeoutId: number | null = null;
  private trackLoadTimeoutId: number | null = null;
  private onTrackEnd: (() => void) | null = null;
  private onStatusChange: YouTubeStatusChangeHandler | null = null;

  async initialize(
    containerId: string,
    options: YouTubeProviderOptions = {}
  ): Promise<void> {
    this.isDestroyed = false;
    this.onTrackEnd = options.onTrackEnd || null;
    this.onStatusChange = options.onStatusChange || null;
    this.setStatus('loading', 'Connecting to player...');

    try {
      const YT = await loadYouTubeIframeApi();

      if (this.isDestroyed) {
        return;
      }

      return new Promise(resolve => {
        this.createPlayer(YT, containerId, resolve);
      });
    } catch (error) {
      const message =
        'Player connection failed. Retry or open the track in YouTube.';
      this.setStatus('error', message);
      throw error;
    }
  }

  private createPlayer(
    YT: YouTubeNamespace,
    containerId: string,
    onComplete: () => void
  ) {
    let isComplete = false;

    const completeOnce = () => {
      if (isComplete) {
        return;
      }

      isComplete = true;

      if (this.readyTimeoutId !== null) {
        window.clearTimeout(this.readyTimeoutId);
        this.readyTimeoutId = null;
      }

      onComplete();
    };

    this.readyTimeoutId = window.setTimeout(() => {
      if (this.isReady || this.isDestroyed) {
        return;
      }

      this.setStatus(
        'error',
        'The player is not responding. Retry or open the track in YouTube.'
      );
      completeOnce();
    }, 8000);

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
          if (this.isDestroyed) {
            return;
          }

          this.isReady = true;
          this.setStatus('ready', null);
          completeOnce();
        },
        onStateChange: this.handleStateChange.bind(this),
        onError: this.handleError.bind(this),
        onAutoplayBlocked: () => {
          this.setStatus(
            'autoplay-blocked',
            'Autoplay was blocked. Press Start, then retry.'
          );
        },
      },
    });
  }

  private handleError(event: YouTubePlayerEvent) {
    if (this.isDestroyed) {
      return;
    }

    this.clearTrackLoadTimeout();

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
    if (this.isDestroyed) {
      return;
    }

    if (event.data === 0) {
      this.onTrackEnd?.();
      return;
    }

    if (event.data === 3) {
      this.setStatus('loading', 'Loading track...');
      this.scheduleTrackLoadFallback();
      return;
    }

    if (event.data === 1 || event.data === 2 || event.data === 5) {
      this.clearTrackLoadTimeout();
      this.setStatus('ready', null);
    }
  }

  private getErrorMessage(errorCode: number) {
    switch (errorCode) {
      case 2:
        return 'Invalid video ID.';
      case 5:
        return 'HTML5 player error.';
      case 100:
        return 'Video not found.';
      case 101:
      case 150:
        return 'Embedding is blocked for this track. Skipping to the next track.';
      default:
        return `Unknown YouTube error. Code: ${errorCode}`;
    }
  }

  private setStatus(status: MediaPlaybackStatus, message?: string | null) {
    this.onStatusChange?.(status, message ?? null);
  }

  private scheduleTrackLoadFallback() {
    this.clearTrackLoadTimeout();

    this.trackLoadTimeoutId = window.setTimeout(() => {
      if (this.isDestroyed || !this.isReady) {
        return;
      }

      this.setStatus(
        'autoplay-blocked',
        'Playback did not start. Press Start, then retry or open in YouTube.'
      );
    }, 7000);
  }

  private clearTrackLoadTimeout() {
    if (this.trackLoadTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.trackLoadTimeoutId);
    this.trackLoadTimeoutId = null;
  }

  play(videoId: string) {
    if (this.isReady && this.player) {
      this.setStatus('loading', 'Loading track...');
      this.player.loadVideoById(videoId);
      this.scheduleTrackLoadFallback();
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

  ready(): boolean {
    return this.isReady && Boolean(this.player);
  }

  destroy() {
    this.isDestroyed = true;

    if (this.readyTimeoutId !== null) {
      window.clearTimeout(this.readyTimeoutId);
      this.readyTimeoutId = null;
    }

    this.clearTrackLoadTimeout();

    this.player?.destroy?.();
    this.player = null;
    this.isReady = false;
    this.onTrackEnd = null;
    this.onStatusChange = null;
  }
}
