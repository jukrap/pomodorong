import type { CSSProperties } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import { useMusicStackStore } from '../../../entities/music-stack/model/store';
import './AmbientAudioField.css';

const WAVE_PATHS = [
  'M -120 360 C 100 245 312 438 520 318 S 890 204 1160 330 S 1470 520 1660 330',
  'M -140 520 C 116 420 290 594 530 470 S 880 332 1180 455 S 1480 640 1680 468',
  'M -100 250 C 160 154 312 296 548 220 S 936 110 1210 240 S 1488 390 1640 238',
];

function getTrackSeed(value: string) {
  return Array.from(value).reduce((seed, char) => {
    return (seed * 31 + char.charCodeAt(0)) % 997;
  }, 17);
}

export function AmbientAudioField() {
  const mode = useTimerStore(state => state.mode);
  const timerStatus = useTimerStore(state => state.status);
  const currentTrackIndex = useMusicStackStore(
    state => state.currentTrackIndex
  );
  const workTracks = useMusicStackStore(state => state.workTracks);
  const breakTracks = useMusicStackStore(state => state.breakTracks);
  const playbackStatus = useMusicStackStore(state => state.playbackStatus);

  const tracks = mode === 'work' ? workTracks : breakTracks;
  const currentTrack = tracks[currentTrackIndex] ?? null;
  const seed = getTrackSeed(currentTrack?.videoId ?? mode);
  const isLive =
    timerStatus === 'running' &&
    (playbackStatus === 'ready' || playbackStatus === 'loading');
  const intensity = currentTrack ? (isLive ? 1 : 0.58) : 0.28;
  const hue = mode === 'work' ? 4 + (seed % 16) : 164 + (seed % 18);
  const secondaryHue = mode === 'work' ? 174 + (seed % 20) : 28 + (seed % 18);
  const speed = Math.max(11, 20 - (seed % 7) - intensity * 4);
  const barSpeed = Math.max(2.8, 5.2 - intensity * 1.4);

  return (
    <div
      className="ambient-audio-field"
      aria-hidden="true"
      style={
        {
          '--ambient-hue': `${hue}deg`,
          '--ambient-hue-two': `${secondaryHue}deg`,
          '--ambient-intensity': intensity,
          '--ambient-speed': `${speed}s`,
          '--ambient-bar-speed': `${barSpeed}s`,
          '--ambient-offset': `${seed % 72}px`,
        } as CSSProperties
      }
    >
      <svg
        className="ambient-audio-field__svg"
        viewBox="0 0 1440 920"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="ambient-audio-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--ambient-hue) 92% 58%)" />
            <stop offset="52%" stopColor="hsl(var(--ambient-hue-two) 72% 46%)" />
            <stop offset="100%" stopColor="hsl(var(--ambient-hue) 92% 58%)" />
          </linearGradient>
        </defs>

        {WAVE_PATHS.map((path, index) => (
          <path
            className={`ambient-audio-field__wave ambient-audio-field__wave--${
              index + 1
            }`}
            d={path}
            key={path}
          />
        ))}

        <g className="ambient-audio-field__bars" transform="translate(1040 178)">
          {Array.from({ length: 14 }).map((_, index) => (
            <rect
              className="ambient-audio-field__bar"
              height="58"
              key={index}
              rx="2"
              style={
                {
                  '--bar-index': index,
                  '--bar-phase': `${((seed + index * 13) % 100) / 100}s`,
                } as CSSProperties
              }
              width="4"
              x={index * 13}
              y="0"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
