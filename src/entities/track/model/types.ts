export interface Track {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds?: number;
}

export interface TrackDraft {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
}

export interface MusicStack {
  type: 'work' | 'break';
  tracks: Track[];
}

export const DEFAULT_WORK_TRACKS: Track[] = [
  {
    videoId: '4xDzrJKXOOY',
    title: 'Synthwave Radio - Beats to Chill',
    thumbnailUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    durationSeconds: 0,
  },
  {
    videoId: 't-4-sn2FroI',
    title: 'HANRORO Focus Playlist',
    thumbnailUrl: 'https://i.ytimg.com/vi/t-4-sn2FroI/hqdefault.jpg',
    durationSeconds: 10800,
  },
  {
    videoId: 'l1vOpQ7dGyE',
    title: 'K-Pop Focus Playlist',
    thumbnailUrl: 'https://i.ytimg.com/vi/l1vOpQ7dGyE/hqdefault.jpg',
    durationSeconds: 25200,
  },
  {
    videoId: 'PRfXz1iN3_o',
    title: 'Dawn Indie Focus Playlist',
    thumbnailUrl: 'https://i.ytimg.com/vi/PRfXz1iN3_o/hqdefault.jpg',
    durationSeconds: 6600,
  },
  {
    videoId: 'hLtZ11Sc6ns',
    title: 'Quiet Ballad Break',
    thumbnailUrl: 'https://i.ytimg.com/vi/hLtZ11Sc6ns/hqdefault.jpg',
    durationSeconds: 1440,
  },
  {
    videoId: 'uCOMvwyHQdE',
    title: 'Tido Kang - Hazy Instrumentals',
    thumbnailUrl: 'https://i.ytimg.com/vi/uCOMvwyHQdE/hqdefault.jpg',
    durationSeconds: 2520,
  },
  {
    videoId: 'd4oBg7dnny4',
    title: 'Talesweaver Piano Collection',
    thumbnailUrl: 'https://i.ytimg.com/vi/d4oBg7dnny4/hqdefault.jpg',
    durationSeconds: 5940,
  },
];

export const DEFAULT_BREAK_TRACKS: Track[] = [
  {
    videoId: 'PrqwxkBB0DA',
    title: 'Warm Pop Reset Playlist',
    thumbnailUrl: 'https://i.ytimg.com/vi/PrqwxkBB0DA/hqdefault.jpg',
    durationSeconds: 4200,
  },
  {
    videoId: '7UCih6xc9kE',
    title: 'Korean Indie Reset Playlist',
    thumbnailUrl: 'https://i.ytimg.com/vi/7UCih6xc9kE/hqdefault.jpg',
    durationSeconds: 9000,
  },
  {
    videoId: 'CaH_bZIqYBY',
    title: 'Slow Reset Mix',
    thumbnailUrl: 'https://i.ytimg.com/vi/CaH_bZIqYBY/hqdefault.jpg',
    durationSeconds: 1200,
  },
];
