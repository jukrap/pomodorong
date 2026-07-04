import { create } from 'zustand';
import {
  type Track,
  DEFAULT_WORK_TRACKS,
  DEFAULT_BREAK_TRACKS,
} from '../../track/model/types';
import type { TimerMode } from '../../timer/model/types';
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

  getCurrentTracks: (mode: TimerMode) => Track[];
  getCurrentTrack: (mode: TimerMode) => Track | null;
  addTrack: (
    mode: TimerMode,
    track: Track
  ) => { ok: true } | { ok: false; message: string };
  removeTrack: (
    mode: TimerMode,
    videoId: string,
    syncCurrentIndex?: boolean
  ) => void;
  resetTracks: (mode: TimerMode, syncCurrentIndex?: boolean) => void;
  nextTrack: (mode: TimerMode) => Track | null;
  resetTrackIndex: () => void;

  savePlaybackState: (mode: TimerMode, state: PlaybackState) => void;
  getPlaybackState: (mode: TimerMode) => PlaybackState;
  setPlaybackStatus: (
    status: MediaPlaybackStatus,
    message?: string | null
  ) => void;
}

function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const track = value as Partial<Track>;
  return (
    typeof track.videoId === 'string' &&
    typeof track.title === 'string' &&
    typeof track.thumbnailUrl === 'string' &&
    (typeof track.durationSeconds === 'undefined' ||
      typeof track.durationSeconds === 'number')
  );
}

function loadTracks(mode: TimerMode, fallback: Track[]): Track[] {
  const savedTracks = readStorageValue<unknown>(`tracks:${mode}`, fallback);

  if (!Array.isArray(savedTracks) || !savedTracks.every(isTrack)) {
    return fallback;
  }

  return savedTracks;
}

function saveTracks(mode: TimerMode, tracks: Track[]) {
  writeStorageValue(`tracks:${mode}`, tracks);
}

function getDefaultTracks(mode: TimerMode) {
  return mode === 'work' ? DEFAULT_WORK_TRACKS : DEFAULT_BREAK_TRACKS;
}

function loadPlaybackState(mode: TimerMode): PlaybackState {
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

function savePlaybackStateToLocal(mode: TimerMode, state: PlaybackState) {
  writeStorageValue(`playback-state:${mode}`, state);
}

export const useMusicStackStore = create<MusicStackState>((set, get) => ({
  workTracks: loadTracks('work', DEFAULT_WORK_TRACKS),
  breakTracks: loadTracks('break', DEFAULT_BREAK_TRACKS),
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

  addTrack: (mode, track) => {
    const tracks = get().getCurrentTracks(mode);
    const normalizedTrack = {
      ...track,
      title: track.title.trim() || `YouTube video ${track.videoId}`,
      thumbnailUrl:
        track.thumbnailUrl ||
        `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`,
    };

    if (
      tracks.some(
        existingTrack => existingTrack.videoId === normalizedTrack.videoId
      )
    ) {
      return {
        ok: false,
        message: 'This video is already in the selected stack.',
      };
    }

    const nextTracks = [...tracks, normalizedTrack];
    saveTracks(mode, nextTracks);

    set(
      mode === 'work' ? { workTracks: nextTracks } : { breakTracks: nextTracks }
    );

    return { ok: true };
  },

  removeTrack: (mode, videoId, syncCurrentIndex = true) => {
    const tracks = get().getCurrentTracks(mode);
    const nextTracks = tracks.filter(track => track.videoId !== videoId);
    const savedTrackIndex = get().getPlaybackState(mode).trackIndex;
    const nextIndex =
      nextTracks.length === 0
        ? 0
        : Math.min(savedTrackIndex, nextTracks.length - 1);

    saveTracks(mode, nextTracks);

    set(
      mode === 'work'
        ? {
            workTracks: nextTracks,
            ...(syncCurrentIndex ? { currentTrackIndex: nextIndex } : {}),
          }
        : {
            breakTracks: nextTracks,
            ...(syncCurrentIndex ? { currentTrackIndex: nextIndex } : {}),
          }
    );

    get().savePlaybackState(mode, {
      trackIndex: nextIndex,
      currentTime: 0,
    });
  },

  resetTracks: (mode, syncCurrentIndex = true) => {
    const defaultTracks = getDefaultTracks(mode);
    saveTracks(mode, defaultTracks);

    set(
      mode === 'work'
        ? {
            workTracks: defaultTracks,
            ...(syncCurrentIndex ? { currentTrackIndex: 0 } : {}),
          }
        : {
            breakTracks: defaultTracks,
            ...(syncCurrentIndex ? { currentTrackIndex: 0 } : {}),
          }
    );

    get().savePlaybackState(mode, DEFAULT_PLAYBACK_STATE);
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
