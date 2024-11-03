import styles from './styles.module.css';
import clsx from 'clsx';

interface DiceProps {
  value: number; // 骰子点数 (1-6)
  size?: number; // 骰子大小，默认 60px
  isRolling?: boolean; // 是否正在滚动
}

export function Dice({ value, size = 60, isRolling = false }: DiceProps) {
  return (
    <div className={clsx(styles.diceWrapper, isRolling && styles.shaking)}>
      <div
        className={clsx(styles.dice, isRolling && styles.rolling)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 10,
          padding: size / 10,
          gridTemplateAreas: `
            "a . c"
            "e g f"
            "d . b"
          `,
        }}
      >
        {[...Array(value)].map((_, i) => (
          <span
            key={i}
            className={styles.dot}
            data-position={getDotPosition(value, i)}
            style={{
              width: size / 6,
              height: size / 6,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function getDotPosition(value: number, index: number): string {
  const positions = {
    1: ['g'],
    2: ['a', 'b'],
    3: ['a', 'g', 'b'],
    4: ['a', 'c', 'b', 'd'],
    5: ['a', 'c', 'g', 'b', 'd'],
    6: ['a', 'c', 'e', 'f', 'b', 'd'],
  };

  return positions[value as keyof typeof positions][index];
}
