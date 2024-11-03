import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const Route = createLazyFileRoute('/russian-roulette/')({
  component: RussianRoulette,
});

function RussianRoulette() {
  const [bulletPosition, setBulletPosition] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(1);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [isShot, setIsShot] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const resetGame = () => {
    // Randomly set bullet position (1-6)
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

  // Game initialization
  if (bulletPosition === 0) {
    resetGame();
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Russian Roulette</h2>

      <div className="space-y-2 mb-4">
        <p>Shots Fired: {shotsFired}</p>
        <p>
          Status:{' '}
          {isGameOver
            ? isShot
              ? 'Game Over - Shot!'
              : 'Game Over - Safe!'
            : 'Game in Progress'}
        </p>
      </div>

      <div className="space-x-4">
        <Button variant="destructive" onClick={shoot} disabled={isGameOver}>
          Pull Trigger
        </Button>

        <Button variant="outline" onClick={resetGame}>
          Reset Game
        </Button>
      </div>
    </div>
  );
}
