import { useEffect, useRef, useState } from 'react';
import { formatSeconds, timerColor } from '../utils';
import type { GameStatus } from '../useSchulteGame';

interface Props {
  status: GameStatus;
  startTime: number | null;
  totalMs: number;
  count: number;
  factor?: number; // 盘面难度系数，放宽变色预算
}

// 独立计时器：自带 rAF，避免每帧重渲染整个棋盘
export function TimerDisplay({ status, startTime, totalMs, count, factor = 1 }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (status === 'playing' && startTime != null) {
      const tick = () => {
        setElapsed(performance.now() - startTime);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    if (status === 'idle') setElapsed(0);
  }, [status, startTime]);

  const shown = status === 'finished' ? totalMs : elapsed;
  const color = timerColor(shown, count, factor);

  return (
    <div
      className='font-mono font-extrabold tabular-nums leading-none transition-colors'
      style={{ color, fontSize: 'clamp(1.75rem, 9vw, 3.5rem)', textShadow: `0 0 22px ${color.replace(')', ' / 0.4)')}` }}
    >
      {formatSeconds(shown)}
    </div>
  );
}
