import { Dice } from '@/components/Dice/index';
import { useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import styles from './styles.module.css';
import { createStorageKey } from '@/constants/storage';

export function DiceRollPage() {
  const [diceValue, setDiceValue] = useLocalStorageState(
    createStorageKey('dice-value'),
    {
      defaultValue: 6,
    }
  );
  const [isRolling, setIsRolling] = useState(false);

  const handleClick = () => {
    if (isRolling) return;

    setIsRolling(true);

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);
      setIsRolling(false);
    }, 1200);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.diceContainer}
        onClick={handleClick}
        style={{ cursor: isRolling ? 'default' : 'pointer' }}
        role="button"
        aria-label="Roll dice"
      >
        <Dice value={diceValue ?? 6} isRolling={isRolling} size={100} />
      </div>
    </div>
  );
}
