/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from 'react';
import { YouTubeProvider } from '../../../shared/api/providers/youtube';

let globalProvider: YouTubeProvider | null = null;

export function MusicPlayer() {
  const playerRef = useRef<YouTubeProvider | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const provider = new YouTubeProvider();
    playerRef.current = provider;
    globalProvider = provider;

    provider.initialize('youtube-player').then(() => {
      console.log('YouTube initialized');
      provider.play('yGtU47XUIoI');
      provider.pause();
    });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <h3
        style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#4a5568',
        }}
      >
        🎵 배경 음악
      </h3>
      <div
        id="youtube-player"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      ></div>
    </div>
  );
}

export function getMusicPlayer() {
  return globalProvider;
}
