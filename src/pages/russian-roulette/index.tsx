import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skull, Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';

export function RussianRoulettePage() {
  const [bulletPosition, setBulletPosition] = useLocalStorageState<number>(
    createStorageKey('roulette-bullet'),
    { defaultValue: 0 }
  );
  const [currentPosition, setCurrentPosition] = useLocalStorageState<number>(
    createStorageKey('roulette-position'),
    { defaultValue: 1 }
  );
  const [shotsFired, setShotsFired] = useLocalStorageState<number>(
    createStorageKey('roulette-shots'),
    { defaultValue: 0 }
  );
  const [isShot, setIsShot] = useLocalStorageState<boolean>(
    createStorageKey('roulette-is-shot'),
    { defaultValue: false }
  );
  const [isGameOver, setIsGameOver] = useLocalStorageState<boolean>(
    createStorageKey('roulette-game-over'),
    { defaultValue: false }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetGame = () => {
    setBulletPosition(Math.floor(Math.random() * 6) + 1);
    setCurrentPosition(1);
    setShotsFired(0);
    setIsShot(false);
    setIsGameOver(false);
  };

  const shoot = () => {
    if (isGameOver) return;

    setIsLoading(true);
    setShotsFired((prev = 0) => prev + 1);

    setTimeout(() => {
      if (currentPosition === bulletPosition) {
        setIsShot(true);
        setIsGameOver(true);
      }

      setCurrentPosition((prev = 1) => prev + 1);
      if ((currentPosition ?? 1) >= 6) {
        setIsGameOver(true);
      }
      setIsLoading(false);
    }, 1000);
  };

  if (bulletPosition === 0) {
    resetGame();
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Russian Roulette</h2>

      <div className="space-y-4 mb-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((position) => (
            <div
              key={position}
              className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                isLoading &&
                  position === currentPosition &&
                  'animate-spin-shake',
                position <= (shotsFired ?? 0)
                  ? isLoading && position === currentPosition
                    ? 'border-yellow-500 bg-yellow-100'
                    : position === bulletPosition && isShot
                      ? 'border-red-500 bg-red-100'
                      : 'border-green-500 bg-green-100'
                  : 'border-gray-300'
              )}
            >
              {position <= (shotsFired ?? 0) ? (
                isLoading && position === currentPosition ? (
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                ) : position === bulletPosition && isShot ? (
                  <Skull className="w-5 h-5 text-red-500" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )
              ) : null}
            </div>
          ))}
        </div>

        <p>
          Status:{' '}
          {isLoading
            ? 'Pulling the trigger...'
            : isGameOver
              ? isShot
                ? 'BANG! Game Over!'
                : 'You survived!'
              : `Chamber ${currentPosition}/6 - Pull the trigger if you dare!`}
        </p>
      </div>

      <div className="space-x-4">
        <Button
          variant="destructive"
          onClick={shoot}
          disabled={isGameOver || isLoading}
        >
          {isLoading ? 'Shooting...' : 'Shoot'}
        </Button>

        <Button variant="outline" onClick={resetGame}>
          Reset Game
        </Button>
      </div>
    </div>
  );
}
