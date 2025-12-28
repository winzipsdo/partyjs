import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './styles.module.css';

// Color types
type Color = 'red' | 'yellow' | 'blue' | 'green';

// Game config
const GAME_CONFIG = {
  TILES_PER_COLOR: 3,
  TILES_TO_WIN: 5,
} as const;

// Tile interface
interface Tile {
  id: number;
  color: Color;
  isFlipped: boolean;
  isCollected: boolean;
  isMatched: boolean;
}

// Player interface
interface Player {
  id: 1 | 2;
  collectedTiles: Color[];
}

// Get color style class
const getColorClass = (color: Color, prefix: string) => {
  const map: Record<Color, string> = {
    red: styles[`${prefix}Red`],
    yellow: styles[`${prefix}Yellow`],
    blue: styles[`${prefix}Blue`],
    green: styles[`${prefix}Green`],
  };
  return map[color];
};

export function ColorMemoryQuestPage() {
  // Initialize tiles
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const colors: Color[] = ['red', 'yellow', 'blue', 'green'];
    const initialTiles: Tile[] = [];

    colors.forEach((color) => {
      for (let i = 0; i < GAME_CONFIG.TILES_PER_COLOR; i++) {
        initialTiles.push({
          id: initialTiles.length,
          color,
          isFlipped: false,
          isCollected: false,
          isMatched: false,
        });
      }
    });

    return initialTiles.sort(() => Math.random() - 0.5);
  });

  // Current player
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);

  // Current dice color
  const [currentDiceColor, setCurrentDiceColor] = useState<Color | null>(null);

  // Players state
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, collectedTiles: [] },
    { id: 2, collectedTiles: [] },
  ]);

  // Winner state
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  // Check win condition
  const checkWinCondition = (playerTiles: Color[]): boolean => {
    return playerTiles.length >= GAME_CONFIG.TILES_TO_WIN;
  };

  // Roll dice
  const rollDice = () => {
    const colors: Color[] = ['red', 'yellow', 'blue', 'green'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentDiceColor(randomColor);
  };

  // Flip tile
  const flipTile = (tileId: number) => {
    if (!currentDiceColor || winner) return;

    const clickedTile = tiles.find((t) => t.id === tileId);
    if (!clickedTile || clickedTile.isCollected) return;

    // If color matches
    if (clickedTile.color === currentDiceColor) {
      setTiles((prevTiles) => {
        return prevTiles.map((tile) => {
          if (tile.id === tileId) {
            return { ...tile, isFlipped: true, isMatched: true };
          }
          return tile;
        });
      });

      // Delay collection logic
      setTimeout(() => {
        setPlayers((prevPlayers) => {
          return prevPlayers.map((player) => {
            if (player.id === currentPlayer) {
              const newCollectedTiles = [...player.collectedTiles, clickedTile.color];
              if (checkWinCondition(newCollectedTiles)) {
                setWinner(currentPlayer);
              }
              return { ...player, collectedTiles: newCollectedTiles };
            }
            return player;
          });
        });

        setTiles((prevTiles) => {
          return prevTiles.map((tile) => {
            if (tile.id === tileId) {
              return { ...tile, isCollected: true };
            }
            return tile;
          });
        });
      }, 1000);
    } else {
      // Color doesn't match, just flip
      setTiles((prevTiles) => {
        return prevTiles.map((tile) => {
          if (tile.id === tileId) {
            return { ...tile, isFlipped: true };
          }
          return tile;
        });
      });
    }

    // Continue game if no winner
    if (!winner) {
      setTimeout(() => {
        setTiles((prevTiles) =>
          prevTiles.map((tile) =>
            tile.isCollected ? tile : { ...tile, isFlipped: false, isMatched: false }
          )
        );
        setCurrentPlayer((current) => (current === 1 ? 2 : 1));
        setCurrentDiceColor(null);
      }, 1500);
    }
  };

  // Reset game
  const resetGame = () => {
    setTiles((prevTiles) => {
      return prevTiles.map((tile) => ({ ...tile, isFlipped: false }));
    });

    setTimeout(() => {
      setTiles((prevTiles) => {
        return [...prevTiles]
          .map((tile) => ({ ...tile, isCollected: false }))
          .sort(() => Math.random() - 0.5);
      });
      setCurrentPlayer(1);
      setCurrentDiceColor(null);
      setWinner(null);
      setPlayers([
        { id: 1, collectedTiles: [] },
        { id: 2, collectedTiles: [] },
      ]);
    }, 300);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Color Memory</h1>
        <button onClick={resetGame} className={styles.resetButton} title="New Game">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Players bar */}
      <div className={styles.playersBar}>
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              styles.playerCard,
              currentPlayer === player.id && !winner && styles.playerCardActive
            )}
          >
            <div className={styles.playerHeader}>
              <div
                className={cn(
                  styles.playerIndicator,
                  currentPlayer === player.id && !winner && styles.playerIndicatorActive
                )}
              />
              <span className={styles.playerName}>P{player.id}</span>
              <span className={styles.playerName} style={{ marginLeft: 'auto', opacity: 0.5 }}>
                {player.collectedTiles.length}/{GAME_CONFIG.TILES_TO_WIN}
              </span>
            </div>
            <div className={styles.playerScore}>
              {player.collectedTiles.map((color, index) => (
                <div key={index} className={cn(styles.scoreDot, getColorClass(color, 'scoreDot'))} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dice section */}
      <div className={styles.diceSection}>
        <button
          onClick={rollDice}
          disabled={!!currentDiceColor || !!winner}
          className={styles.diceButton}
        >
          🎲 Roll
        </button>
        <div className={styles.diceResult}>
          <span className={styles.diceLabel}>Find:</span>
          {currentDiceColor ? (
            <div className={cn(styles.diceColor, getColorClass(currentDiceColor, 'diceColor'))} />
          ) : (
            <div className={styles.diceEmpty} />
          )}
        </div>
      </div>

      {/* Game board */}
      <div className={styles.board}>
        <div className={styles.boardGrid}>
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={cn(
                styles.tile,
                tile.isFlipped && styles.tileFlipped,
                tile.isCollected && styles.tileCollected,
                tile.isMatched && styles.tileMatched
              )}
              onClick={() => flipTile(tile.id)}
            >
              <div className={styles.tileInner}>
                <div className={cn(styles.tileFace, styles.tileFront)} />
                <div
                  className={cn(styles.tileFace, styles.tileBack, getColorClass(tile.color, 'tileBack'))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className={styles.hint}>
        {!currentDiceColor
          ? 'Roll the dice to start'
          : `Tap a tile to find the matching color`}
      </p>

      {/* Winner overlay */}
      {winner && (
        <div className={styles.winnerOverlay}>
          <div className={styles.winnerCard}>
            <div className={styles.winnerIcon}>🏆</div>
            <h2 className={styles.winnerTitle}>Player {winner} Wins!</h2>
            <p className={styles.winnerText}>Collected {GAME_CONFIG.TILES_TO_WIN} tiles first</p>
            <button className={styles.playAgainButton} onClick={resetGame}>
              🔄 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
