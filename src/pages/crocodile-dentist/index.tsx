import { useState, useCallback } from 'react';
import styles from './styles.module.css';

const TEETH_COUNT = 10;

export function CrocodileDentistPage() {
  const [teeth, setTeeth] = useState<boolean[]>(Array(TEETH_COUNT).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [isBiting, setIsBiting] = useState(false);
  const [losingTooth, setLosingTooth] = useState(() => Math.floor(Math.random() * TEETH_COUNT));

  const pressTeeth = useCallback(
    (index: number) => {
      if (gameOver || teeth[index]) return;

      const newTeeth = [...teeth];
      newTeeth[index] = true;
      setTeeth(newTeeth);

      if (index === losingTooth) {
        setIsBiting(true);
        setTimeout(() => {
          setGameOver(true);
        }, 600);
      }
    },
    [gameOver, teeth, losingTooth]
  );

  const resetGame = useCallback(() => {
    setTeeth(Array(TEETH_COUNT).fill(false));
    setGameOver(false);
    setIsBiting(false);
    setLosingTooth(Math.floor(Math.random() * TEETH_COUNT));
  }, []);

  // Split teeth into upper and lower jaw
  const upperTeeth = teeth.slice(0, TEETH_COUNT / 2);
  const lowerTeeth = teeth.slice(TEETH_COUNT / 2);

  return (
    <div className='min-h-screen bg-gradient-to-b from-cyan-600 via-teal-500 to-emerald-600 flex flex-col items-center justify-center p-4 overflow-hidden'>
      {/* Decorative bubbles */}
      <div className={styles.bubbles}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.bubble} style={{ '--delay': `${i * 0.5}s`, '--size': `${20 + Math.random() * 30}px`, '--left': `${Math.random() * 100}%` } as React.CSSProperties} />
        ))}
      </div>

      {/* Title */}
      <h1 className='text-3xl sm:text-4xl font-bold text-white mb-6 drop-shadow-lg flex items-center gap-3'>
        <span className='text-4xl'>🐊</span>
        <span className={styles.title}>Crocodile Dentist</span>
      </h1>

      {/* Game instruction */}
      <p className='text-white/80 text-sm mb-6 text-center'>
        {gameOver ? "Oh no! The croc bit you! 😱" : "Press the teeth carefully... don't wake the croc! 🤫"}
      </p>

      {/* Crocodile container */}
      <div className={`relative ${styles.crocodileContainer} ${isBiting ? styles.biting : ''}`}>
        {/* Crocodile eyes */}
        <div className='flex justify-center gap-16 mb-3'>
          <div className={`${styles.eye} ${isBiting ? styles.angryEye : ''}`}>
            <div className={styles.pupil} />
          </div>
          <div className={`${styles.eye} ${isBiting ? styles.angryEye : ''}`}>
            <div className={styles.pupil} />
          </div>
        </div>

        {/* Upper jaw */}
        <div className={`${styles.jaw} ${styles.upperJaw} ${isBiting ? styles.upperJawBite : ''}`}>
          <div className='flex justify-center gap-1 sm:gap-2 px-4'>
            {upperTeeth.map((pressed, index) => (
              <button
                key={`upper-${index}`}
                onClick={() => pressTeeth(index)}
                disabled={pressed || gameOver}
                className={`
                  ${styles.tooth} ${styles.upperTooth}
                  ${pressed ? (index === losingTooth ? styles.dangerTooth : styles.pressedTooth) : styles.normalTooth}
                `}
              >
                <div className={styles.toothShine} />
              </button>
            ))}
          </div>
        </div>

        {/* Tongue (visible when mouth is open) */}
        <div className={`${styles.tongue} ${isBiting ? styles.tongueHidden : ''}`} />

        {/* Lower jaw */}
        <div className={`${styles.jaw} ${styles.lowerJaw} ${isBiting ? styles.lowerJawBite : ''}`}>
          <div className='flex justify-center gap-1 sm:gap-2 px-4'>
            {lowerTeeth.map((pressed, index) => {
              const actualIndex = index + TEETH_COUNT / 2;
              return (
                <button
                  key={`lower-${index}`}
                  onClick={() => pressTeeth(actualIndex)}
                  disabled={pressed || gameOver}
                  className={`
                    ${styles.tooth} ${styles.lowerTooth}
                    ${pressed ? (actualIndex === losingTooth ? styles.dangerTooth : styles.pressedTooth) : styles.normalTooth}
                  `}
                >
                  <div className={styles.toothShine} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className={styles.gameOverOverlay}>
          <div className={styles.gameOverCard}>
            <div className='text-6xl mb-4'>😵</div>
            <h2 className='text-2xl font-bold text-red-500 mb-2'>OUCH!</h2>
            <p className='text-gray-600 mb-6'>The crocodile bit you!</p>
            <button
              onClick={resetGame}
              className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      )}

      {/* Score / Progress indicator */}
      <div className='mt-8 flex gap-2'>
        {teeth.map((pressed, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              pressed
                ? index === losingTooth
                  ? 'bg-red-500 scale-125'
                  : 'bg-emerald-300'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Safe teeth counter */}
      <p className='mt-4 text-white/80 text-sm'>
        Safe presses: {teeth.filter((t, i) => t && i !== losingTooth).length} / {TEETH_COUNT - 1}
      </p>
    </div>
  );
}
