import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';

interface Props {
  game: SchulteGame;
  size: number;
}

// 将打乱后的数字按 size 行 x size 列切分为蜂窝行
export function HoneycombBoard({ game, size }: Props) {
  const rows: number[][] = [];
  for (let r = 0; r < size; r++) {
    rows.push(game.cells.slice(r * size, r * size + size));
  }

  // 六边形边长同时受可用宽度(vw)与视口高度(dvh)约束，移动端不横向溢出、一屏放得下
  const wDiv = (1.06 * size + 0.55).toFixed(2); // 整体宽度 ≈ hex * wDiv
  const hDiv = (0.924 * size + 0.18).toFixed(2); // 整体高度 ≈ hex * hDiv
  const hex = `min(90vw / ${wDiv}, 54dvh / ${hDiv}, 84px)`;

  return (
    <div className={styles.honeycomb} style={{ ['--hex' as string]: hex }}>
      {rows.map((row, ri) => (
        <div key={ri} className={cn(styles.hexRow, ri % 2 === 1 && styles.hexRowOdd)}>
          {row.map((n) => {
            const found = game.isFound(n);
            return (
              <button
                key={n}
                onClick={() => game.clickCell(n)}
                disabled={found}
                className={cn(styles.cell, styles.hexCell, found && styles.found, game.wrong === n && styles.wrong)}
              >
                {n}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
