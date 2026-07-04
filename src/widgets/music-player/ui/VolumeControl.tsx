import { type CSSProperties, useState, useEffect } from 'react';
import { getMusicPlayer } from '../model/playerAdapter';
import {
  readStorageValue,
  writeStorageValue,
} from '../../../shared/lib/storage/pomodorongStorage';

const MUSIC_VOLUME_STORAGE_KEY = 'music-volume';

export function VolumeControl() {
  const [volume, setVolume] = useState(() => {
    return readStorageValue(MUSIC_VOLUME_STORAGE_KEY, 50);
  });

  useEffect(() => {
    const player = getMusicPlayer();
    if (player) {
      player.setVolume(volume);
    }
  }, [volume]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    writeStorageValue(MUSIC_VOLUME_STORAGE_KEY, newVolume);

    const player = getMusicPlayer();
    if (player) {
      player.setVolume(newVolume);
    }
  };

  return (
    <label className="volume-control">
      <span>Volume</span>
      <input
        aria-label="Media volume"
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={e => handleVolumeChange(Number(e.target.value))}
        style={
          {
            '--volume-progress': `${volume}%`,
          } as CSSProperties
        }
      />
      <strong>{volume}%</strong>
    </label>
  );
}
