/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}


export class YouTubeProvider {
  private player: any = null;
  private isReady: boolean = false;
  private onTrackEnd: (() => void) | null = null;

  async initialize(
    containerId: string,
    onTrackEnd?: () => void
  ): Promise<void> {
    this.onTrackEnd = onTrackEnd || null;

    return new Promise((resolve) => {
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          this.createPlayer(containerId, resolve);
        }
      }, 100);
    });
  }

  private createPlayer(containerId: string, onComplete: () => void) {
    this.player = new window.YT.Player(containerId, {
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
          console.log('✅ YouTube player ready!');
          onComplete();
        },
        onStateChange: this.handleStateChange.bind(this),
        onError: (event: any) => {
          const errorCode = event.data;
          let errorMessage = '';

          switch (errorCode) {
            case 2:
              errorMessage = '잘못된 비디오 ID입니다.';
              break;
            case 5:
              errorMessage = 'HTML5 플레이어 오류입니다.';
              break;
            case 100:
              errorMessage = '비디오를 찾을 수 없습니다.';
              break;
            case 101:
            case 150:
              errorMessage =
                '이 비디오는 임베드 재생이 금지되어 있습니다. 다음 곡으로 건너뜁니다.';
              break;
            default:
              errorMessage = `알 수 없는 오류 (코드: ${errorCode})`;
          }

          console.error('❌ YouTube error:', errorCode, errorMessage);

          if ((errorCode === 101 || errorCode === 150) && this.onTrackEnd) {
            alert(errorMessage);
            // 500ms 후 다음 트랙 (alert 닫힌 후)
            setTimeout(() => {
              if (this.onTrackEnd) {
                this.onTrackEnd();
              }
            }, 500);
          }
        },
      },
    });
  }

  private handleStateChange(event: any) {
    if (event.data === 0) {
      console.log('✅ Track ended normally');
      if (this.onTrackEnd) {
        this.onTrackEnd();
      }
    }
  }

  play(videoId: string) {
    console.log('▶️ Playing video:', videoId);
    if (this.isReady && this.player) {
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
      console.log(`⏩ Seeking to ${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)}`);
      this.player.seekTo(seconds, true);
    }
  }

  getDuration(): number {
    if (this.isReady && this.player) {
      return this.player.getDuration() || 0;
    }
    return 0;
  }
}