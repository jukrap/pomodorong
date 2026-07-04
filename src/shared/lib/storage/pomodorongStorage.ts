const STORAGE_PREFIX = 'pomodorong:v1';

export interface PomodorongStorageV1 {
  'timer-settings': unknown;
  'session-stats': unknown;
  'playback-state:work': unknown;
  'playback-state:break': unknown;
  'music-volume': unknown;
  'tracks:work': unknown;
  'tracks:break': unknown;
}

interface StoredEnvelope<T> {
  version: 1;
  value: T;
}

function getStorageKey(key: string) {
  return `${STORAGE_PREFIX}:${key}`;
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function readStorageValue<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  const saved = window.localStorage.getItem(getStorageKey(key));
  if (!saved) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(saved) as StoredEnvelope<T>;

    if (parsed.version !== 1 || !('value' in parsed)) {
      return fallback;
    }

    return parsed.value;
  } catch {
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T) {
  if (!canUseLocalStorage()) {
    return;
  }

  const envelope: StoredEnvelope<T> = {
    version: 1,
    value,
  };

  window.localStorage.setItem(getStorageKey(key), JSON.stringify(envelope));
}
