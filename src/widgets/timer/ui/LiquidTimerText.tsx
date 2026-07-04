import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { TimerMode } from '../../../entities/timer/model/types';
import './LiquidTimerText.css';

interface LiquidTimerTextProps {
  value: string;
  progress: number;
  mode: TimerMode;
  label: string;
}

const VIEWBOX_WIDTH = 1020;
const VIEWBOX_HEIGHT = 260;

function clampProgress(progress: number) {
  return Math.max(0, Math.min(1, progress));
}

function buildWavePath(levelY: number, amplitude: number, offset: number) {
  const segmentWidth = 102;
  const startX = -segmentWidth * 2;
  const endX = VIEWBOX_WIDTH + segmentWidth * 2;
  const parts = [`M ${startX} ${levelY + offset}`];

  for (let x = startX; x < endX; x += segmentWidth) {
    const controlOneX = x + segmentWidth * 0.25;
    const controlTwoX = x + segmentWidth * 0.75;
    const nextX = x + segmentWidth;
    const nextY = levelY + offset;
    const crestY = levelY + offset + amplitude;
    const troughY = levelY + offset - amplitude;

    parts.push(
      `C ${controlOneX} ${troughY}, ${controlTwoX} ${crestY}, ${nextX} ${nextY}`
    );
  }

  parts.push(
    `L ${endX} ${VIEWBOX_HEIGHT + 24} L ${startX} ${
      VIEWBOX_HEIGHT + 24
    } Z`
  );

  return parts.join(' ');
}

export function LiquidTimerText({
  value,
  progress,
  mode,
  label,
}: LiquidTimerTextProps) {
  const id = useId().replace(/:/g, '');
  const shouldReduceMotion = useReducedMotion();
  const clampedProgress = clampProgress(progress);
  const visibleProgress =
    clampedProgress === 0 ? 0 : Math.max(0.04, clampedProgress);
  const liquidLevel = Math.round(visibleProgress * 100);
  const levelY = 226 - visibleProgress * 176;
  const maskId = `liquid-timer-mask-${id}`;
  const gradientId = `liquid-timer-gradient-${id}`;
  const glowId = `liquid-timer-glow-${id}`;
  const waveMotion = shouldReduceMotion
    ? { x: 0 }
    : {
        x: [0, -184],
      };
  const reverseWaveMotion = shouldReduceMotion
    ? { x: 0 }
    : {
        x: [-184, 0],
      };
  const waveTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 7.4, ease: 'linear' as const, repeat: Infinity };
  const reverseWaveTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 10.2, ease: 'linear' as const, repeat: Infinity };

  return (
    <svg
      className={`liquid-timer liquid-timer--${mode}`}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      role="img"
      aria-label={label}
      data-liquid-level={liquidLevel}
      data-reduced-motion={shouldReduceMotion ? 'true' : 'false'}
    >
      <defs>
        <filter
          id={glowId}
          x="-8%"
          y="-24%"
          width="116%"
          height="148%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="12"
            stdDeviation="9"
            floodColor="#07101f"
            floodOpacity="0.12"
          />
        </filter>

        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={mode === 'work' ? '#ff5a4f' : '#31c4b4'} />
          <stop offset="46%" stopColor={mode === 'work' ? '#ff493f' : '#24a89a'} />
          <stop offset="100%" stopColor={mode === 'work' ? '#ff806f' : '#72d8c7'} />
        </linearGradient>

        <mask id={maskId}>
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="black" />
          <text
            className="liquid-timer__mask-text"
            x="50%"
            y="51%"
            dominantBaseline="middle"
            textAnchor="middle"
            textLength="690"
            lengthAdjust="spacing"
            fill="white"
          >
            {value}
          </text>
        </mask>
      </defs>

      <text
        className="liquid-timer__base"
        x="50%"
        y="51%"
        dominantBaseline="middle"
        textAnchor="middle"
        textLength="690"
        lengthAdjust="spacing"
        filter={`url(#${glowId})`}
      >
        {value}
      </text>

      <g mask={`url(#${maskId})`}>
        <rect
          className="liquid-timer__fill"
          x="-24"
          y={levelY}
          width={VIEWBOX_WIDTH + 48}
          height={VIEWBOX_HEIGHT + 32 - levelY}
          fill={`url(#${gradientId})`}
        />
        <motion.path
          className="liquid-timer__wave liquid-timer__wave--front"
          d={buildWavePath(levelY, 12, 0)}
          fill={`url(#${gradientId})`}
          animate={waveMotion}
          transition={waveTransition}
        />
        <motion.path
          className="liquid-timer__wave liquid-timer__wave--back"
          d={buildWavePath(levelY + 10, 18, 0)}
          fill={`url(#${gradientId})`}
          animate={reverseWaveMotion}
          transition={reverseWaveTransition}
        />
        <motion.path
          className="liquid-timer__wave liquid-timer__wave--shine"
          d={buildWavePath(levelY - 8, 8, 0)}
          fill="#ffffff"
          animate={reverseWaveMotion}
          transition={reverseWaveTransition}
        />
      </g>
    </svg>
  );
}
