import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';

interface Props {
  game: SchulteGame;
  size: number;
  numColor?: (n: number) => string;
}

export function StandardBoard({ game, size, numColor }: Props) {
  return (
    <div className={styles.standardGrid} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {game.cells.map((n) => {
        const found = game.isFound(n);
        const isWrong = game.wrong === n;
        return (
          <button
            key={n}
            onClick={() => game.clickCell(n)}
            disabled={found}
            className={cn(styles.cell, styles.standardCell, found && styles.found, isWrong && styles.wrong)}
            style={{ color: !found && !isWrong && numColor ? numColor(n) : undefined }}
          >
            {game.status === 'idle' ? '' : n}
          </button>
        );
      })}
    </div>
  );
}
