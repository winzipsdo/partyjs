import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';
import { computeScatterLayout } from '../utils';

interface Props {
  game: SchulteGame;
  numColor?: (n: number) => string;
}

// 散布舒尔特：数字在方形区域内随机散布（每局重新采样，互不重叠）
export function ScatterBoard({ game, numColor }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState(360);

  useEffect(() => {
    const measure = () => {
      const w = (wrapRef.current?.clientWidth ?? 360) - 12;
      const hCap = window.innerHeight * 0.54;
      setContainer(Math.max(220, Math.min(w, 460, hCap)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 依赖 cells 的数组身份：每次洗牌都会重新采样位置
  const layout = useMemo(() => computeScatterLayout(game.cells.length, container), [game.cells, container]);

  return (
    <div ref={wrapRef} className='flex w-full max-w-full justify-center overflow-hidden'>
      <div className='relative' style={{ width: container, height: container }}>
        {game.cells.map((n, i) => {
          const pt = layout.points[i];
          if (!pt) return null;
          const found = game.isFound(n);
          const isWrong = game.wrong === n;
          return (
            <button
              key={n}
              onClick={() => game.clickCell(n)}
              disabled={found}
              className={cn(styles.cell, styles.randCell, found && styles.found, isWrong && styles.wrong)}
              style={{
                left: pt.x - layout.cell / 2,
                top: pt.y - layout.cell / 2,
                width: layout.cell,
                height: layout.cell,
                fontSize: layout.cell * 0.4,
                color: !found && !isWrong && numColor ? numColor(n) : undefined,
              }}
            >
              {game.status === 'idle' ? '' : n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
