export interface PlaybackState {
  trackIndex: number;
  currentTime: number;
}

export type MediaPlaybackStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error'
  | 'autoplay-blocked'
  | 'unavailable';
