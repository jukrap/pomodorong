import { create } from 'zustand';
import {
  type Track,
  DEFAULT_WORK_TRACKS,
  DEFAULT_BREAK_TRACKS,
} from '../../track/model/types';

/**
 * PlaybackState: 재생 위치 저장
 * - trackIndex: 몇 번째 트랙인지
 * - currentTime: 트랙의 몇 초 지점인지
 */
interface PlaybackState {
  trackIndex: number;
  currentTime: number;
}

interface MusicStackState {
  workTracks: Track[];
  breakTracks: Track[];
  currentTrackIndex: number;

  workPlaybackState: PlaybackState;
  breakPlaybackState: PlaybackState;

  getCurrentTracks: (mode: 'work' | 'break') => Track[];
  getCurrentTrack: (mode: 'work' | 'break') => Track | null;
  nextTrack: (mode: 'work' | 'break') => Track | null;
  resetTrackIndex: () => void;

  savePlaybackState: (mode: 'work' | 'break', state: PlaybackState) => void;
  getPlaybackState: (mode: 'work' | 'break') => PlaybackState;
}

function loadPlaybackState(mode: 'work' | 'break'): PlaybackState {
  const key = `playbackState_${mode}`;
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { trackIndex: 0, currentTime: 0 };
    }
  }

  return { trackIndex: 0, currentTime: 0 };
}

function savePlaybackStateToLocal(mode: 'work' | 'break', state: PlaybackState) {
  const key = `playbackState_${mode}`;
  localStorage.setItem(key, JSON.stringify(state));
  console.log(`💾 Saved ${mode} playback:`, state);
}

export const useMusicStackStore = create<MusicStackState>((set, get) => ({
  workTracks: DEFAULT_WORK_TRACKS,
  breakTracks: DEFAULT_BREAK_TRACKS,
  currentTrackIndex: 0,

  workPlaybackState: loadPlaybackState('work'),
  breakPlaybackState: loadPlaybackState('break'),

  getCurrentTracks: mode => {
    return mode === 'work' ? get().workTracks : get().breakTracks;
  },

  getCurrentTrack: mode => {
    const tracks = get().getCurrentTracks(mode);
    const index = get().currentTrackIndex;
    return tracks[index] || null;
  },

  nextTrack: mode => {
    const tracks = get().getCurrentTracks(mode);
    const currentIndex = get().currentTrackIndex;
    const nextIndex = (currentIndex + 1) % tracks.length;

    set({ currentTrackIndex: nextIndex });

    return tracks[nextIndex];
  },

  resetTrackIndex: () => {
    set({ currentTrackIndex: 0 });
  },

  savePlaybackState: (mode, state) => {
    if (mode === 'work') {
      set({ workPlaybackState: state });
    } else {
      set({ breakPlaybackState: state });
    }
    savePlaybackStateToLocal(mode, state);
  },

  getPlaybackState: mode => {
    return mode === 'work'
      ? get().workPlaybackState
      : get().breakPlaybackState;
  },
}));