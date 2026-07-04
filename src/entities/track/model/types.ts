/**
 * Track: 음악/영상 트랙을 나타내는 타입
 *
 * - videoId: YouTube 비디오 ID (예: 'jfKfPfyJRdk')
 * - title: 사용자에게 보여줄 제목
 * - thumbnailUrl: 썸네일 이미지 URL
 * - durationSeconds: 영상 길이 (초 단위, undefined면 알 수 없음)
 */
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

/**
 * MusicStack: 트랙들의 재생목록
 * 작업용 스택, 휴식용 스택을 각각 가질 예정
 */
export interface MusicStack {
  type: 'work' | 'break'; // 작업용인지 휴식용인지
  tracks: Track[]; // 트랙 배열
}

/**
 * DEFAULT_WORK_TRACKS: 작업용 기본 영상들
 *
 * - 4xDzrJKXOOY: Lofi Girl synthwave 라이브 스트림
 * - t-4-sn2FroI: 3시간 플레이리스트
 * - l1vOpQ7dGyE: 7시간 플레이리스트
 */
export const DEFAULT_WORK_TRACKS: Track[] = [
  {
    videoId: '4xDzrJKXOOY',
    title: 'Lofi Girl: synthwave radio 🌌 beats to chill/game to [24/7]',
    thumbnailUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    durationSeconds: 0,
  },
  {
    videoId: 't-4-sn2FroI',
    title: 'HANRORO playlist [3h]',
    thumbnailUrl: 'https://i.ytimg.com/vi/t-4-sn2FroI/hqdefault.jpg',
    durationSeconds: 10800, // 3시간
  },
  {
    videoId: 'l1vOpQ7dGyE',
    title: 'KPOP Playlist: Melon Comprehensive Chart [7h]',
    thumbnailUrl: 'https://i.ytimg.com/vi/l1vOpQ7dGyE/hqdefault.jpg',
    durationSeconds: 25200, // 7시간
  },
  {
    videoId: 'PRfXz1iN3_o',
    title: 'Dawn Emotion Indie Playlist [1h 50m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/PRfXz1iN3_o/hqdefault.jpg',
    durationSeconds: 6600, // 1시간 50분
  },
  {
    videoId: 'hLtZ11Sc6ns',
    title: 'Breakup Song: Goodbye, Our Last Song [24m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/hLtZ11Sc6ns/hqdefault.jpg',
    durationSeconds: 1440, // 24분
  },
  {
    videoId: 'uCOMvwyHQdE',
    title: 'Tido Kang: collection of hazy oriental music [42m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/uCOMvwyHQdE/hqdefault.jpg',
    durationSeconds: 2520, // 42분
  },
  {
    videoId: 'd4oBg7dnny4',
    title: 'A collection of great music for Talesweaver [1h 39m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/d4oBg7dnny4/hqdefault.jpg',
    durationSeconds: 5940, // 1시간 39분
  },
];

/**
 * DEFAULT_BREAK_TRACKS: 휴식용 기본 영상들
 */
export const DEFAULT_BREAK_TRACKS: Track[] = [
  {
    videoId: 'PrqwxkBB0DA',
    title: 'Warm & Cozy Pop song: listen to under the blankets [1h 13m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/PrqwxkBB0DA/hqdefault.jpg',
    durationSeconds: 4200, // 1시간 10분
  },
  {
    videoId: '7UCih6xc9kE',
    title: 'Korean Indie Song Collection: A Collection of Gentle Hits [2h 36m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/7UCih6xc9kE/hqdefault.jpg',
    durationSeconds: 9000, // 2시간 30분
  },
  {
    videoId: 'CaH_bZIqYBY',
    title: 'Doomer Music: Into a Deeper Melancholy [23m]',
    thumbnailUrl: 'https://i.ytimg.com/vi/CaH_bZIqYBY/hqdefault.jpg',
    durationSeconds: 1200, // 20분
  },
];
