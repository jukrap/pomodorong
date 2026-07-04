import type { YouTubeProvider } from '../../../shared/api/providers/youtube';

let currentPlayer: YouTubeProvider | null = null;

export function setMusicPlayer(player: YouTubeProvider | null) {
  currentPlayer = player;
}

export function getMusicPlayer() {
  return currentPlayer;
}
