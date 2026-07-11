import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';
import { computeDynamicLayout } from '../utils';

interface Props {
  game: SchulteGame;
}

// 转盘：数字分布在同心圆环上，各环缓慢反向旋转，数字反向自转保持正立
export function DynamicBoard({ game }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState(360);

  useEffect(() => {
    const measure = () => {
      const w = (wrapRef.current?.clientWidth ?? 360) - 12; // 留一点安全边距，避免圆点溢出
      // 同时受可用宽度与视口高度约束，保证移动端一屏放得下
      const hCap = window.innerHeight * 0.54;
      setContainer(Math.max(220, Math.min(w, 460, hCap)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const layout = useMemo(() => computeDynamicLayout(game.cells.length, container), [game.cells.length, container]);
  const { cell, rings } = layout;
  const c = container / 2;

  return (
    <div ref={wrapRef} className='flex w-full max-w-full justify-center overflow-hidden'>
      <div className={styles.dynamicStage} style={{ width: container, height: container }}>
        <div
          className={styles.dynamicCenter}
          style={{ width: cell * 0.9, height: cell * 0.9, fontSize: cell * 0.32 }}
        >
          {game.status === 'finished' ? '✓' : game.nextTarget <= game.cells.length ? game.nextTarget : ''}
        </div>

        {rings.map((ring, ri) => {
          const duration = 22 + ri * 7; // 外圈更慢
          const direction = ri % 2 === 0 ? 'normal' : 'reverse';
          const counterDirection = ri % 2 === 0 ? 'reverse' : 'normal';
          return (
            <div key={ri} className={styles.ring} style={{ animationDuration: `${duration}s`, animationDirection: direction }}>
              {Array.from({ length: ring.cap }).map((_, i) => {
                const n = game.cells[ring.start + i];
                if (n === undefined) return null;
                const angle = ring.phase + (i / ring.cap) * Math.PI * 2;
                const x = c + ring.radius * Math.cos(angle);
                const y = c + ring.radius * Math.sin(angle);
                const found = game.isFound(n);
                return (
                  <button
                    key={n}
                    onClick={() => game.clickCell(n)}
                    disabled={found}
                    className={styles.dot}
                    style={{ left: x, top: y, width: cell, height: cell }}
                  >
                    <span
                      className={styles.dotSpin}
                      style={{ animationDuration: `${duration}s`, animationDirection: counterDirection }}
                    >
                      <span
                        className={cn(styles.dotFace, found && styles.found, game.wrong === n && styles.wrong)}
                        style={{ fontSize: cell * 0.4 }}
                      >
                        {n}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
