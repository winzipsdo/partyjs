import { createLazyFileRoute } from '@tanstack/react-router';
import { Dice } from '../components/Dice';
import { useState } from 'react';

export const Route = createLazyFileRoute('/dice-roll')({
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
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Dice Rolling Game</h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Dice value={diceValue} size={100} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={rollDice}
          disabled={isRolling}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: isRolling ? 'not-allowed' : 'pointer',
            backgroundColor: isRolling ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
          }}
        >
          {isRolling ? '骰子滚动中...' : '掷骰子'}
        </button>
      </div>
    </div>
  );
}