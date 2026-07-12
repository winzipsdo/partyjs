import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';
import { computeDynamicLayout } from '../utils';

interface Props {
  game: SchulteGame;
  hell?: boolean; // 地狱模式：数字不保持正立，各自以不同速度自转
  numColor?: (n: number) => string;
}

// 转盘：数字分布在同心圆环上，各环缓慢反向旋转。
// 旋转由 rAF 驱动：环转 +θ、数字内层转 -θ 在同一帧写入，
// 严格同相抵消 —— 数字始终保持水平正立（CSS 双动画会漂相位）。
// 地狱模式下内层改为独立自转（每个数字速度/方向不同），
// 数字底部的下划线标记正面方向，避免 6/9 翻转后混淆。
export function DynamicBoard({ game, hell = false, numColor }: Props) {
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
    // 地狱模式：每个数字独立的自转速度（由索引确定，重挂载稳定复现）
    const selfSpeeds = spinEls.map((ring, i) =>
      ring.map((_, j) => ((i + j) % 2 === 0 ? 1 : -1) * (34 + ((i * 7 + j * 13) % 42))),
    );

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      for (let i = 0; i < ringEls.length; i++) {
        const a = speeds[i] * t;
        ringEls[i].style.transform = `rotate(${a}deg)`;
        for (let j = 0; j < spinEls[i].length; j++) {
          // 正常：反向抵消保持正立；地狱：独立自转翻滚
          spinEls[i][j].style.transform = hell ? `rotate(${selfSpeeds[i][j] * t}deg)` : `rotate(${-a}deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // 注意必须依赖 cells 本身（而非长度）：洗牌后数字会跨环迁移，React 会
    // 重建那些按钮的 DOM，旧的 spinEls 列表不再覆盖它们 —— 若不重新绑定，
    // 迁移的数字失去反向抵消，会跟着环一起转（曾是线上 bug）
  }, [layout, hell, game.cells]);

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
                const isWrong = game.wrong === n;
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
                        className={cn(styles.dotFace, found && styles.found, isWrong && styles.wrong)}
                        style={{
                          fontSize: cell * 0.4,
                          color: !found && !isWrong && numColor ? numColor(n) : undefined,
                        }}
                      >
                        {game.status === 'idle' ? (
                          ''
                        ) : hell ? (
                          <span className={styles.hellNum}>{n}</span>
                        ) : (
                          n
                        )}
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
