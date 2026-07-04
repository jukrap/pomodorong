import { type CSSProperties, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getMusicPlayer } from '../model/playerAdapter';
import {
  readStorageValue,
  writeStorageValue,
} from '../../../shared/lib/storage/pomodorongStorage';

const MUSIC_VOLUME_STORAGE_KEY = 'music-volume';
const buttonMotion = {
  whileTap: { scale: 0.96 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
};

function clampVolume(volume: number) {
  return Math.max(0, Math.min(100, volume));
}

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
    const nextVolume = clampVolume(newVolume);
    setVolume(nextVolume);
    writeStorageValue(MUSIC_VOLUME_STORAGE_KEY, nextVolume);

    const player = getMusicPlayer();
    if (player) {
      player.setVolume(nextVolume);
    }
  };

  return (
    <div className="volume-control">
      <div className="volume-control__header">
        <span>Volume</span>
        <strong>{volume}%</strong>
      </div>
      <div className="volume-control__row">
        <motion.button
          type="button"
          aria-label="Decrease volume"
          onClick={() => handleVolumeChange(volume - 10)}
          {...buttonMotion}
        >
          −
        </motion.button>
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
        <motion.button
          type="button"
          aria-label="Increase volume"
          onClick={() => handleVolumeChange(volume + 10)}
          {...buttonMotion}
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
