import { cn } from '@/lib/utils';
import styles from '../styles.module.css';
import type { SchulteGame } from '../useSchulteGame';

interface Props {
  game: SchulteGame;
  size: number;
}

export function StandardBoard({ game, size }: Props) {
  return (
    <div className={styles.standardGrid} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {game.cells.map((n) => {
        const found = game.isFound(n);
        return (
          <button
            key={n}
            onClick={() => game.clickCell(n)}
            disabled={found}
            className={cn(styles.cell, styles.standardCell, found && styles.found, game.wrong === n && styles.wrong)}
          >
            {game.status === 'idle' ? '' : n}
          </button>
        );
      })}
    </div>
  );
}
