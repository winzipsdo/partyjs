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

  // 六边形边长随 size 自适应
  const hex = `clamp(38px, ${Math.min(80, Math.floor(420 / (size + 0.5)))}px, ${Math.floor(560 / (size + 0.5))}px)`;

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
