/**
 * Track: 음악/영상 트랙을 나타내는 타입
 * 
 * - id: YouTube 비디오 ID (예: 'jfKfPfyJRdk')
 * - title: 사용자에게 보여줄 제목
 * - thumbnail: 썸네일 이미지 URL
 * - duration: 영상 길이 (초 단위, 0이면 라이브 스트림)
 */
export interface Track {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
}

/**
 * MusicStack: 트랙들의 재생목록
 * 작업용 스택, 휴식용 스택을 각각 가질 예정
 */
export interface MusicStack {
  type: 'work' | 'break';  // 작업용인지 휴식용인지
  tracks: Track[];          // 트랙 배열
}

/**
 * DEFAULT_WORK_TRACKS: 작업용 기본 영상들
 * 
 * - jfKfPfyJRdk: Lofi Girl 라이브 스트림
 * - 5qap5aO4i9A: 2시간 로파이
 * - Dx5qFachd3A: 3시간 재즈
 */
export const DEFAULT_WORK_TRACKS: Track[] = [
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Girl: Lofi Hip Hop Radio [24/7]',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    duration: 0  // 라이브 스트림
  },
  {
    id: '4xDzrJKXOOY',
    title: 'Lofi Girl: synthwave radio 🌌 beats to chill/game to [24/7]',
    thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    duration: 0  // 라이브 스트림
  },
  {
    id: 't-4-sn2FroI',
    title: 'HANRORO playlist [3h]',
    thumbnail: 'https://i.ytimg.com/vi/t-4-sn2FroI/hqdefault.jpg',
    duration: 10800  // 3시간
  },
  {
    id: 'l1vOpQ7dGyE',
    title: 'KPOP Playlist: Melon Comprehensive Chart [7h]',
    thumbnail: 'https://i.ytimg.com/vi/l1vOpQ7dGyE/hqdefault.jpg',
    duration: 25200  // 7시간
  },
  {
    id: 'PRfXz1iN3_o',
    title: 'Dawn Emotion Indie Playlist [1h 50m]',
    thumbnail: 'https://i.ytimg.com/vi/PRfXz1iN3_o/hqdefault.jpg',
    duration: 6600  // 1시간 50분
  },
  {
    id: 'hLtZ11Sc6ns',
    title: 'Breakup Song: Goodbye, Our Last Song [24m]',
    thumbnail: 'https://i.ytimg.com/vi/hLtZ11Sc6ns/hqdefault.jpg',
    duration: 1440  // 24분
  },
  {
    id: 'uCOMvwyHQdE',
    title: 'Tido Kang: collection of hazy oriental music [42m]',
    thumbnail: 'https://i.ytimg.com/vi/uCOMvwyHQdE/hqdefault.jpg',
    duration: 2520  // 42분
  },
  {
    id: 'd4oBg7dnny4',
    title: 'A collection of great music for Talesweaver [1h 39m]',
    thumbnail: 'https://i.ytimg.com/vi/d4oBg7dnny4/hqdefault.jpg',
    duration: 5940  // 1시간 39분
  },
];

/**
 * DEFAULT_BREAK_TRACKS: 휴식용 기본 영상들
 */
export const DEFAULT_BREAK_TRACKS: Track[] = [
  {
    id: 'PrqwxkBB0DA',
    title: 'Warm & Cozy Pop song: listen to under the blankets [1h 13m]',
    thumbnail: 'https://i.ytimg.com/vi/PrqwxkBB0DA/hqdefault.jpg',
    duration: 4200  // 1시간 10분
  },
  {
    id: '7UCih6xc9kE',
    title: 'Korean Indie Song Collection: A Collection of Gentle Hits [2h 36m]',
    thumbnail: 'https://i.ytimg.com/vi/7UCih6xc9kE/hqdefault.jpg',
    duration: 9000  // 2시간 30분
  },
  {
    id: 'CaH_bZIqYBY',
    title: 'Doomer Music: Into a Deeper Melancholy [23m]',
    thumbnail: 'https://i.ytimg.com/vi/CaH_bZIqYBY/hqdefault.jpg',
    duration: 1200  // 20분
  }
];