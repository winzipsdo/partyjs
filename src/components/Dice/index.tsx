import styles from './styles.module.css';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

type Phase = 'idle' | 'rolling' | 'settling';

interface DiceProps {
  value: number;
  size?: number;
  isRolling?: boolean;
}

// 7 个固定 grid area，始终渲染，通过 opacity 控制显隐，避免 DOM 增删导致的跳帧
const DOT_AREAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

const DOT_MAP: Record<number, string[]> = {
  1: ['g'],
  2: ['a', 'b'],
  3: ['a', 'g', 'b'],
  4: ['a', 'c', 'b', 'd'],
  5: ['a', 'c', 'g', 'b', 'd'],
  6: ['a', 'c', 'e', 'f', 'b', 'd'],
};

export function Dice({ value, size = 100, isRolling = false }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [phase, setPhase] = useState<Phase>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isRolling) {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      setPhase('rolling');
      intervalRef.current = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // 先把真实值写进去，再触发落地动画
      setDisplayValue(value);
      setPhase('settling');
      settleTimerRef.current = setTimeout(() => {
        setPhase('idle');
      }, 520);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRolling, value]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const dotSize = size / 5;
  const padding = size / 8;
  const gap = size / 20;
  const visibleAreas = DOT_MAP[displayValue] ?? ['g'];

  return (
    <div
      className={cn(
        styles.diceWrapper,
        phase === 'rolling' && styles.shaking,
      )}
    >
      <div
        className={cn(
          styles.dice,
          phase === 'rolling' && styles.rolling,
          phase === 'settling' && styles.settling,
        )}
        style={{
          width: size,
          height: size,
          padding: padding,
          gap: gap,
          gridTemplateAreas: `"a . c" "e g f" "d . b"`,
        }}
      >
        {DOT_AREAS.map((area) => (
          <span
            key={area}
            className={cn(
              styles.dot,
              phase === 'rolling' && styles.dotRolling,
            )}
            style={{
              gridArea: area,
              width: dotSize,
              height: dotSize,
              opacity: visibleAreas.includes(area) ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
