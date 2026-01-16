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

  async initialize(containerId: string): Promise<void> {
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
          console.log('YouTube player ready!');
          onComplete();
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event.data);
        }
      },
    });
  }

  play(videoId: string) {
    console.log('Playing video:', videoId);
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
}