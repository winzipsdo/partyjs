import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';

interface Props {
  game: SchulteGame;
  size: number; // 行数；大三角被切成 size² 个小三角
  numColor?: (n: number) => string;
}

const UP = 'polygon(50% 0%, 100% 100%, 0% 100%)';
const DOWN = 'polygon(0% 0%, 100% 0%, 50% 100%)';

// 切割三角形舒尔特：一个大等边三角形切成 size² 个上下交替的小三角。
// 第 i 行（0 起）有 2i+1 个小三角，行首索引为 i²。
export function TriangleBoard({ game, size, numColor }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(64);

  useEffect(() => {
    const measure = () => {
      const w = (wrapRef.current?.clientWidth ?? 360) - 8;
      const hCap = window.innerHeight * 0.54;
      setSide(Math.max(34, Math.min(w / size, hCap / (0.866 * size), 96)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [size]);

  const rowH = side * 0.866;
  const boardW = side * size;
  const boardH = rowH * size;

  return (
    <div ref={wrapRef} className='flex w-full justify-center'>
      <div className='relative' style={{ width: boardW, height: boardH }}>
        {Array.from({ length: size }).map((_, i) =>
          Array.from({ length: 2 * i + 1 }).map((_, j) => {
            const n = game.cells[i * i + j];
            if (n === undefined) return null;
            const isUp = j % 2 === 0;
            const found = game.isFound(n);
            const isWrong = game.wrong === n;
            return (
              <button
                key={n}
                onClick={() => game.clickCell(n)}
                disabled={found}
                className={cn(styles.cell, styles.triCell, found && styles.found, isWrong && styles.wrong)}
                style={{
                  left: ((size - 1 - i) * side) / 2 + (j * side) / 2,
                  top: i * rowH,
                  width: side,
                  height: rowH,
                  clipPath: isUp ? UP : DOWN,
                  fontSize: side * 0.28,
                  // 数字放在三角形的重心侧：正三角靠下、倒三角靠上
                  alignItems: isUp ? 'flex-end' : 'flex-start',
                  paddingBottom: isUp ? rowH * 0.08 : 0,
                  paddingTop: isUp ? 0 : rowH * 0.08,
                  color: !found && !isWrong && numColor ? numColor(n) : undefined,
                }}
              >
                {game.status === 'idle' ? '' : n}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
