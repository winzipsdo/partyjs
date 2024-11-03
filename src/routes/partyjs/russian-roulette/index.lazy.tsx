import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import styles from './styles.module.css';

export const Route = createLazyFileRoute('/partyjs/russian-roulette/')({
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
    <div className={styles.container}>
      <h2>左轮手枪游戏</h2>

      <div className={styles.statusBox}>
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

      <div className={styles.buttonGroup}>
        <button
          onClick={shoot}
          disabled={isGameOver}
          className={styles.shootButton}
        >
          开枪
        </button>

        <button onClick={resetGame} className={styles.resetButton}>
          重新开始
        </button>
      </div>
    </div>
  );
}
