import { useState } from 'react';
import { Skull, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';
import styles from './styles.module.css';

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
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const resetGame = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setBulletPosition(Math.floor(Math.random() * 6) + 1);
      setCurrentPosition(1);
      setShotsFired(0);
      setIsShot(false);
      setIsGameOver(false);
      setIsSpinning(false);
    }, 800);
  };

  const shoot = () => {
    if (isGameOver) return;

    setIsLoading(true);
    setShotsFired((prev = 0) => prev + 1);

    setTimeout(() => {
      // Show muzzle flash
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);

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

  const getChamberState = (position: number) => {
    const fired = position <= (shotsFired ?? 0);
    const isCurrent = position === currentPosition && !isGameOver;
    const isDanger = position === bulletPosition && isShot;
    const isSafe = fired && !isDanger;

    if (isLoading && isCurrent) return 'loading';
    if (isDanger) return 'danger';
    if (isSafe) return 'safe';
    if (isCurrent) return 'current';
    return 'pending';
  };

  return (
    <div className={styles.container}>
      {/* Background particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              '--delay': `${i * 0.5}s`,
              '--left': `${Math.random() * 100}%`,
              '--top': `${Math.random() * 100}%`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Muzzle flash effect */}
      {showFlash && <div className={styles.muzzleFlash} />}

      {/* Shot counter */}
      <div className={styles.shotCounter}>
        Shots: {shotsFired ?? 0}/6
      </div>

      {/* Title */}
      <h1 className={styles.title}>Russian Roulette</h1>
      <p className={styles.subtitle}>Do you feel lucky?</p>

      {/* Revolver cylinder */}
      <div className={styles.cylinderContainer}>
        <div className={cn(styles.cylinder, isSpinning && styles.spinning)}>
          <div className={styles.cylinderInner}>
            {[1, 2, 3, 4, 5, 6].map((position) => {
              const state = getChamberState(position);
              return (
                <div
                  key={position}
                  className={cn(
                    styles.chamber,
                    state === 'current' && styles.chamberCurrent,
                    state === 'loading' && styles.chamberCurrent,
                    state === 'safe' && styles.chamberSafe,
                    state === 'danger' && styles.chamberDanger,
                    state === 'pending' && styles.chamberPending
                  )}
                >
                  <div className={styles.chamberInner}>
                    {state === 'safe' && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                    {state === 'danger' && (
                      <Skull className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.centerHub} />
        </div>
        <div className={styles.hammer} />
      </div>

      {/* Status message */}
      <p
        className={cn(
          styles.status,
          isLoading && styles.statusLoading,
          isGameOver && isShot && styles.statusDanger,
          isGameOver && !isShot && styles.statusSafe
        )}
      >
        {isLoading
          ? '[ PULLING TRIGGER... ]'
          : isGameOver
            ? isShot
              ? '💀 BANG! YOU ARE DEAD!'
              : '🎉 YOU SURVIVED ALL 6 CHAMBERS!'
            : `Chamber ${currentPosition}/6 — Pull the trigger if you dare...`}
      </p>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={styles.shootButton}
          onClick={shoot}
          disabled={isGameOver || isLoading}
        >
          {isLoading ? '...' : '🔫 SHOOT'}
        </button>

        <button className={styles.resetButton} onClick={resetGame}>
          ↺ Reset
        </button>
      </div>

      {/* Game over overlay */}
      {isGameOver && (
        <div className={styles.gameOverOverlay}>
          <div
            className={styles.gameOverCard}
            style={{
              '--glow-color': isShot
                ? 'rgba(220, 38, 38, 0.4)'
                : 'rgba(34, 197, 94, 0.4)',
            } as React.CSSProperties}
          >
            <div className={styles.gameOverIcon}>
              {isShot ? '💀' : '🎉'}
            </div>
            <h2
              className={cn(
                styles.gameOverTitle,
                isShot ? styles.gameOverTitleDanger : styles.gameOverTitleSafe
              )}
            >
              {isShot ? 'BANG!' : 'SURVIVED!'}
            </h2>
            <p className={styles.gameOverText}>
              {isShot
                ? 'The bullet found you on chamber ' + bulletPosition
                : 'You made it through all 6 chambers!'}
            </p>
            <button className={styles.playAgainButton} onClick={resetGame}>
              🔄 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
