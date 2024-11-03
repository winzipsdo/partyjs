import { createLazyFileRoute } from '@tanstack/react-router';
import { Dice } from '@/components/Dice/index';
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

export const Route = createLazyFileRoute('/dice-roll/')({
  component: DiceRoll,
});

function DiceRoll() {
  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [finalValue, setFinalValue] = useState(6);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDiceValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setDiceValue(finalValue);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRolling, finalValue]);

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);
    const newValue = Math.floor(Math.random() * 6) + 1;
    setFinalValue(newValue);

    setTimeout(() => {
      setIsRolling(false);
    }, 1200);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.diceContainer}
        onClick={rollDice}
        style={{ cursor: isRolling ? 'default' : 'pointer' }}
        role="button"
        aria-label="Roll dice"
      >
        <Dice value={diceValue} size={100} isRolling={isRolling} />
      </div>
    </div>
  );
}
