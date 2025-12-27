import styles from './styles.module.css';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface DiceProps {
  value: number; // 骰子点数 (1-6)
  size?: number; // 骰子大小，默认 100px
  isRolling?: boolean; // 是否正在滚动
}

export function Dice({ value, size = 100, isRolling = false }: DiceProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isRolling) {
      setCurrentValue(value);
      setShowResult(true);
      const timer = setTimeout(() => setShowResult(false), 300);
      return () => clearTimeout(timer);
    }

    // 滚动时快速切换数字
    const interval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    return () => clearInterval(interval);
  }, [isRolling, value]);

  const dotSize = size / 5;
  const padding = size / 8;
  const gap = size / 20;

  return (
    <div className={cn(styles.diceWrapper, isRolling && styles.shaking)}>
      <div
        className={cn(
          styles.dice,
          isRolling && styles.rolling,
          showResult && !isRolling && styles.showResult
        )}
        style={{
          width: size,
          height: size,
          padding: padding,
          gap: gap,
          gridTemplateAreas: `
            "a . c"
            "e g f"
            "d . b"
          `,
        }}
      >
        {[...Array(currentValue)].map((_, i) => (
          <span
            key={`${currentValue}-${i}`}
            className={styles.dot}
            data-position={getDotPosition(currentValue, i)}
            style={{
              width: dotSize,
              height: dotSize,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function getDotPosition(value: number, index: number): string {
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
