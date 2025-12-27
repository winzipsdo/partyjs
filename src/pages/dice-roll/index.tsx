import { Dice } from '@/components/Dice/index';
import { useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import styles from './styles.module.css';
import { createStorageKey } from '@/constants/storage';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type DiceRoll = {
  id: number;
  timestamp: string;
  value: number;
};

export function DiceRollPage() {
  const [diceValue, setDiceValue] = useLocalStorageState(
    createStorageKey('dice-value'),
    {
      defaultValue: 6,
    }
  );
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useLocalStorageState<DiceRoll[]>(
    createStorageKey('dice-history'),
    {
      defaultValue: [],
    }
  );

  const handleClick = () => {
    if (isRolling) return;

    setIsRolling(true);

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);
      setRollHistory((prev = []) => [
        {
          id: prev.length + 1,
          timestamp: new Date().toLocaleTimeString(),
          value: newValue,
        },
        ...prev,
      ]);
      setIsRolling(false);
    }, 1200);
  };

  const handleReset = () => {
    setRollHistory([]);
  };

  // 统计各点数出现次数
  const stats = (rollHistory ?? []).reduce(
    (acc, roll) => {
      acc[roll.value] = (acc[roll.value] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return (
    <div className={styles.container}>
      {/* 骰子区域 */}
      <div className={styles.diceArea}>
        <div
          onClick={handleClick}
          className={cn(
            styles.diceButton,
            isRolling && styles.rolling
          )}
          role="button"
          aria-label="Roll dice"
        >
          <Dice value={diceValue ?? 6} isRolling={isRolling} size={120} />
        </div>

        <p className={styles.hint}>
          {isRolling ? 'Rolling...' : 'Tap to roll!'}
        </p>
      </div>

      {/* 统计区域 */}
      {(rollHistory ?? []).length > 0 && (
        <div className={styles.statsArea}>
          <div className={styles.statsHeader}>
            <span className={styles.statsTitle}>
              Statistics ({(rollHistory ?? []).length} rolls)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className={styles.clearButton}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className={styles.statsGrid}>
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = stats[num] || 0;
              const percentage = (rollHistory ?? []).length > 0
                ? Math.round((count / (rollHistory ?? []).length) * 100)
                : 0;

              return (
                <div key={num} className={styles.statItem}>
                  <div className={styles.statDots}>
                    {[...Array(num)].map((_, i) => (
                      <span
                        key={i}
                        className={styles.miniDot}
                        style={{
                          gridArea: getDotArea(num, i),
                        }}
                      />
                    ))}
                  </div>
                  <div className={styles.statBar}>
                    <div
                      className={styles.statFill}
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.statCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 最近记录 */}
      {(rollHistory ?? []).length > 0 && (
        <div className={styles.historyArea}>
          <span className={styles.historyTitle}>Recent Rolls</span>
          <div className={styles.historyList}>
            {(rollHistory ?? []).slice(0, 10).map((roll, index) => (
              <div
                key={roll.id}
                className={cn(
                  styles.historyItem,
                  index === 0 && styles.latest
                )}
              >
                <span className={styles.historyValue}>{roll.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getDotArea(value: number, index: number): string {
  const positions: Record<number, string[]> = {
    1: ['g'],
    2: ['a', 'b'],
    3: ['a', 'g', 'b'],
    4: ['a', 'c', 'b', 'd'],
    5: ['a', 'c', 'g', 'b', 'd'],
    6: ['a', 'c', 'e', 'f', 'b', 'd'],
  };
  return positions[value]?.[index] ?? 'g';
}
