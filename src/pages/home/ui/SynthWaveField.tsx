import type { CSSProperties } from 'react';
import { useTimerStore } from '../../../entities/timer/model/store';
import './SynthWaveField.css';

const WAVE_PATHS = [
  'M -120 360 C 100 245 312 438 520 318 S 890 204 1160 330 S 1470 520 1660 330',
  'M -140 520 C 116 420 290 594 530 470 S 880 332 1180 455 S 1480 640 1680 468',
  'M -100 250 C 160 154 312 296 548 220 S 936 110 1210 240 S 1488 390 1640 238',
];

export function SynthWaveField() {
  const mode = useTimerStore(state => state.mode);
  const hue = mode === 'work' ? '4deg' : '168deg';
  const secondaryHue = mode === 'work' ? '178deg' : '28deg';

  return (
    <div
      className={`synth-wave-field synth-wave-field--${mode}`}
      aria-hidden="true"
      style={
        {
          '--synth-hue': hue,
          '--synth-hue-two': secondaryHue,
        } as CSSProperties
      }
    >
      <svg
        className="synth-wave-field__svg"
        viewBox="0 0 1440 920"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="synth-wave-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--synth-hue) 90% 58%)" />
            <stop offset="52%" stopColor="hsl(var(--synth-hue-two) 68% 46%)" />
            <stop offset="100%" stopColor="hsl(var(--synth-hue) 90% 58%)" />
          </linearGradient>
        </defs>

        {WAVE_PATHS.map((path, index) => (
          <path
            className={`synth-wave-field__wave synth-wave-field__wave--${
              index + 1
            }`}
            d={path}
            key={path}
          />
        ))}
      </svg>
    </div>
  );
}
