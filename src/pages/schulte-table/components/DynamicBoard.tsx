import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';
import { computeDynamicLayout } from '../utils';

interface Props {
  game: SchulteGame;
}

// 转盘：数字分布在同心圆环上，各环缓慢反向旋转。
// 旋转由 rAF 驱动：环转 +θ、数字内层转 -θ 在同一帧写入，
// 严格同相抵消 —— 数字始终保持水平正立（CSS 双动画会漂相位）。
export function DynamicBoard({ game }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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

  // rAF 旋转驱动
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ringEls = Array.from(stage.querySelectorAll<HTMLElement>('[data-ring]'));
    const speeds = ringEls.map((el) => Number(el.dataset.speed)); // 度/秒，带符号
    const spinEls = ringEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>('[data-spin]')));

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      for (let i = 0; i < ringEls.length; i++) {
        const a = speeds[i] * t;
        ringEls[i].style.transform = `rotate(${a}deg)`;
        for (const s of spinEls[i]) s.style.transform = `rotate(${-a}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layout]);

  return (
    <div ref={wrapRef} className='flex w-full max-w-full justify-center overflow-hidden'>
      <div ref={stageRef} className={styles.dynamicStage} style={{ width: container, height: container }}>
        {rings.map((ring, ri) => {
          const duration = 22 + ri * 7; // 外圈更慢
          const speed = (360 / duration) * (ri % 2 === 0 ? 1 : -1); // 相邻环反向
          return (
            <div key={ri} className={styles.ring} data-ring data-speed={speed}>
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
                    <span className={styles.dotSpin} data-spin>
                      <span
                        className={cn(styles.dotFace, found && styles.found, game.wrong === n && styles.wrong)}
                        style={{ fontSize: cell * 0.4 }}
                      >
                        {game.status === 'idle' ? '' : n}
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
