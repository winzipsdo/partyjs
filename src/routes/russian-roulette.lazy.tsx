import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createLazyFileRoute('/russian-roulette')({
  component: RussianRoulette,
});

function RussianRoulette() {
  const [bulletPosition, setBulletPosition] = useState<number>(0); // 子弹位置 (1-6)
  const [currentPosition, setCurrentPosition] = useState<number>(1); // 当前转轮位置
  const [shotsFired, setShotsFired] = useState<number>(0); // 已开枪次数
  const [isShot, setIsShot] = useState<boolean>(false); // 是否中弹
  const [isGameOver, setIsGameOver] = useState<boolean>(false); // 游戏是否结束

  const resetGame = () => {
    // 随机设置子弹位置 (1-6)
    setBulletPosition(Math.floor(Math.random() * 6) + 1);
    setCurrentPosition(1);
    setShotsFired(0);
    setIsShot(false);
    setIsGameOver(false);
  };

  const shoot = () => {
    if (isGameOver) return;

    setShotsFired((prev) => prev + 1);

    if (currentPosition === bulletPosition) {
      setIsShot(true);
      setIsGameOver(true);
    }

    setCurrentPosition((prev) => prev + 1);
    if (currentPosition >= 6) {
      setIsGameOver(true);
    }
  };

  // 游戏初始化
  if (bulletPosition === 0) {
    resetGame();
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h2>左轮手枪游戏</h2>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
        }}
      >
        <p>已开枪次数: {shotsFired}</p>
        <p>
          游戏状态:{' '}
          {isGameOver
            ? isShot
              ? '游戏结束 - 中弹!'
              : '游戏结束 - 安全!'
            : '游戏进行中'}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={shoot}
          disabled={isGameOver}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: isGameOver ? 'not-allowed' : 'pointer',
            backgroundColor: isGameOver ? '#cccccc' : '#dc3545',
            color: 'white',
            border: 'none',
          }}
        >
          开枪
        </button>

        <button
          onClick={resetGame}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
          }}
        >
          重新开始
        </button>
      </div>
    </div>
  );
}
