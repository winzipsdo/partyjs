import { createLazyFileRoute } from '@tanstack/react-router';
import { Dice } from '@/components/Dice';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './styles.module.css';

export const Route = createLazyFileRoute('/partyjs/dice-roll/')({
  component: DiceRoll,
});

function DiceRoll() {
  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);

    // 创建动画效果
    const animationDuration = 3000; // 3秒
    const intervalDuration = 100; // 每100ms改变一次点数
    let elapsedTime = 0;

    const interval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);

      elapsedTime += intervalDuration;
      if (elapsedTime >= animationDuration) {
        clearInterval(interval);
        // 生成最终的随机数
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
      }
    }, intervalDuration);

    // 添加安全清理，以防组件在动画未完成时卸载
    return () => clearInterval(interval);
  };

  return (
    <div className={styles.container}>
      <div className={styles.diceContainer}>
        <Dice value={diceValue} size={100} />
      </div>
      <div className="mt-4">
        <Button onClick={rollDice} disabled={isRolling}>
          {isRolling ? 'Rolling dice...' : 'Roll Dice'}
        </Button>
      </div>
    </div>
  );
}
