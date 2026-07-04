import { create } from 'zustand';
import {
  type Track,
  DEFAULT_WORK_TRACKS,
  DEFAULT_BREAK_TRACKS,
} from '../../track/model/types';
import type { MediaPlaybackStatus, PlaybackState } from './types';
import {
  readStorageValue,
  writeStorageValue,
} from '../../../shared/lib/storage/pomodorongStorage';

const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  trackIndex: 0,
  currentTime: 0,
};

interface MusicStackState {
  workTracks: Track[];
  breakTracks: Track[];
  currentTrackIndex: number;
  playbackStatus: MediaPlaybackStatus;
  playbackMessage: string | null;

  workPlaybackState: PlaybackState;
  breakPlaybackState: PlaybackState;

  getCurrentTracks: (mode: 'work' | 'break') => Track[];
  getCurrentTrack: (mode: 'work' | 'break') => Track | null;
  nextTrack: (mode: 'work' | 'break') => Track | null;
  resetTrackIndex: () => void;

  savePlaybackState: (mode: 'work' | 'break', state: PlaybackState) => void;
  getPlaybackState: (mode: 'work' | 'break') => PlaybackState;
  setPlaybackStatus: (
    status: MediaPlaybackStatus,
    message?: string | null
  ) => void;
}

function loadPlaybackState(mode: 'work' | 'break'): PlaybackState {
  const state = readStorageValue<Partial<PlaybackState>>(
    `playback-state:${mode}`,
    DEFAULT_PLAYBACK_STATE
  );

  if (
    typeof state.trackIndex !== 'number' ||
    typeof state.currentTime !== 'number'
  ) {
    return DEFAULT_PLAYBACK_STATE;
  }

  return {
    trackIndex: Math.max(0, state.trackIndex),
    currentTime: Math.max(0, state.currentTime),
  };
}

function savePlaybackStateToLocal(
  mode: 'work' | 'break',
  state: PlaybackState
) {
  writeStorageValue(`playback-state:${mode}`, state);
}

export const useMusicStackStore = create<MusicStackState>((set, get) => ({
  workTracks: DEFAULT_WORK_TRACKS,
  breakTracks: DEFAULT_BREAK_TRACKS,
  currentTrackIndex: 0,
  playbackStatus: 'idle',
  playbackMessage: null,

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
    if (tracks.length === 0) {
      set({ currentTrackIndex: 0 });
      return null;
    }

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
    return mode === 'work' ? get().workPlaybackState : get().breakPlaybackState;
  },

  setPlaybackStatus: (status, message = null) => {
    set({
      playbackStatus: status,
      playbackMessage: message,
    });
  },
}));
