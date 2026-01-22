import { useState, useEffect } from 'react';
import { getMusicPlayer } from './MusicPlayer';

/**
 * VolumeControl: 볼륨 조절 슬라이더
 * 
 * localStorage에 볼륨 저장해서 다음에도 유지
 */
export function VolumeControl() {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved ? Number(saved) : 50;
  });

  // 초기 볼륨 설정
  useEffect(() => {
    const player = getMusicPlayer();
    if (player) {
      player.setVolume(volume);
    }
  }, [volume]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('musicVolume', String(newVolume));
    
    const player = getMusicPlayer();
    if (player) {
      player.setVolume(newVolume);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
      }}
    >
      {/* 볼륨 아이콘 */}
      <div style={{ fontSize: '20px' }}>
        {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
      </div>

      {/* 슬라이더 */}
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={e => handleVolumeChange(Number(e.target.value))}
        style={{
          flex: 1,
          height: '6px',
          borderRadius: '3px',
          appearance: 'none',
          background: `linear-gradient(to right, #4ecdc4 0%, #4ecdc4 ${volume}%, #ddd ${volume}%, #ddd 100%)`,
          outline: 'none',
          cursor: 'pointer',
        }}
      />

      {/* 퍼센트 표시 */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#4a5568',
          minWidth: '45px',
          textAlign: 'right',
        }}
      >
        {volume}%
      </div>
    </div>
  );
}