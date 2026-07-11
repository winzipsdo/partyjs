import { useEffect, useRef, useState } from 'react';
import { formatSeconds, timerColor } from '../utils';
import type { GameStatus } from '../useSchulteGame';

interface Props {
  status: GameStatus;
  startTime: number | null;
  totalMs: number;
  count: number;
}

// 独立计时器：自带 rAF，避免每帧重渲染整个棋盘
export function TimerDisplay({ status, startTime, totalMs, count }: Props) {
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
  const color = timerColor(shown, count);

  return (
    <div
      className='font-mono font-extrabold tabular-nums leading-none transition-colors'
      style={{ color, fontSize: 'clamp(2.5rem, 12vw, 4rem)', textShadow: `0 2px 18px ${color}55` }}
    >
      {formatSeconds(shown)}
    </div>
  );
}
