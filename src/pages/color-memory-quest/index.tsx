import { useState } from 'react';
import styles from './styles.module.css';

// 定义颜色类型
type Color = 'red' | 'yellow' | 'blue' | 'green';

// 定义棋子类型
interface Tile {
  id: number;
  color: Color;
  isFlipped: boolean;
  isCollected: boolean;
  isMatched: boolean;
}

// 定义玩家类型
interface Player {
  id: 1 | 2;
  collectedTiles: Color[];
}

// 添加颜色映射函数
const getColorClass = (color: Color): string => {
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
  };
  return colorMap[color];
};

export function ColorMemoryQuestPage() {
  // 初始化12个棋子
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const colors: Color[] = ['red', 'yellow', 'blue', 'green'];
    const initialTiles: Tile[] = [];

    // 每种颜色3个棋子
    colors.forEach((color) => {
      for (let i = 0; i < 3; i++) {
        initialTiles.push({
          id: initialTiles.length,
          color,
          isFlipped: false,
          isCollected: false,
          isMatched: false,
        });
      }
    });

    // 随机打乱棋子顺序
    return initialTiles.sort(() => Math.random() - 0.5);
  });

  // 当前玩家
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);

  // 当前骰子颜色
  const [currentDiceColor, setCurrentDiceColor] = useState<Color | null>(null);

  // 玩家状态
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, collectedTiles: [] },
    { id: 2, collectedTiles: [] },
  ]);

  // 添加游戏结束状态
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  // 检查胜利条件
  const checkWinCondition = (playerTiles: Color[]): boolean => {
    // 只需要检查总数量是否达到3个
    return playerTiles.length >= 3;
  };

  // 掷骰子
  const rollDice = () => {
    const colors: Color[] = ['red', 'yellow', 'blue', 'green'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentDiceColor(randomColor);
  };

  // 翻转棋子
  const flipTile = (tileId: number) => {
    if (!currentDiceColor || winner) return;

    // 找到被点击的棋子
    const clickedTile = tiles.find((t) => t.id === tileId);
    if (!clickedTile || clickedTile.isCollected) return;

    // 如果颜色匹配
    if (clickedTile.color === currentDiceColor) {
      // 先只翻转和标记匹配
      setTiles((prevTiles) => {
        return prevTiles.map((tile) => {
          if (tile.id === tileId) {
            return { ...tile, isFlipped: true, isMatched: true };
          }
          return tile;
        });
      });

      // 延迟处理收集逻辑
      setTimeout(() => {
        // 更新玩家分数和收集棋子
        setPlayers((prevPlayers) => {
          return prevPlayers.map((player) => {
            if (player.id === currentPlayer) {
              const newCollectedTiles = [
                ...player.collectedTiles,
                clickedTile.color,
              ];
              // 使用 checkWinCondition 函数检查胜利条件
              if (checkWinCondition(newCollectedTiles)) {
                setWinner(currentPlayer);
              }
              return {
                ...player,
                collectedTiles: newCollectedTiles,
              };
            }
            return player;
          });
        });

        // 标记棋子为已收集
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
      // 如果颜色不匹配，只翻转
      setTiles((prevTiles) => {
        return prevTiles.map((tile) => {
          if (tile.id === tileId) {
            return { ...tile, isFlipped: true };
          }
          return tile;
        });
      });
    }

    // 如果没有胜利者，继续游戏
    if (!winner) {
      setTimeout(() => {
        setTiles((prevTiles) =>
          prevTiles.map((tile) =>
            tile.isCollected
              ? tile
              : { ...tile, isFlipped: false, isMatched: false }
          )
        );
        setCurrentPlayer((current) => (current === 1 ? 2 : 1));
        setCurrentDiceColor(null);
      }, 1500);
    }
  };

  // 添加重新开始游戏功能
  const resetGame = () => {
    setTiles((prevTiles) => {
      return [...prevTiles]
        .map((tile) => ({ ...tile, isFlipped: false, isCollected: false }))
        .sort(() => Math.random() - 0.5);
    });
    setCurrentPlayer(1);
    setCurrentDiceColor(null);
    setWinner(null);
    setPlayers([
      { id: 1, collectedTiles: [] },
      { id: 2, collectedTiles: [] },
    ]);
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Color Memory Quest</h1>
        <button
          onClick={resetGame}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-sm sm:text-base"
        >
          New Game
        </button>
      </div>

      {/* Victory message */}
      {winner && (
        <div className="mb-4 text-lg sm:text-xl font-bold text-green-600">
          🎉 Congratulations! Player {winner} Wins!
        </div>
      )}

      {/* Game status */}
      <div className="mb-4 text-sm sm:text-base">
        <p>Current Player: Player {currentPlayer}</p>
        <p>Dice Color: {currentDiceColor || 'Roll the dice'}</p>
      </div>

      {/* Dice button */}
      <button
        onClick={rollDice}
        disabled={!!currentDiceColor || !!winner}
        className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded mb-4 disabled:bg-gray-400 text-sm sm:text-base"
      >
        Roll Dice
      </button>

      {/* Game board */}
      <div className="w-full">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
          {tiles.map((tile) => {
            const aspectRatio = 'aspect-square'; // 保持 1:1 的宽高比
            return (
              <div
                key={tile.id}
                onClick={() => flipTile(tile.id)}
                className={`
                  ${aspectRatio}
                  w-full
                  rounded cursor-pointer
                  transition-all duration-300
                  ${tile.isCollected ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                  ${tile.isFlipped ? getColorClass(tile.color) : 'bg-gray-300'}
                  ${tile.isMatched ? styles.animateBounce : ''}
                `}
              />
            );
          })}
        </div>
      </div>

      {/* Player scores */}
      <div className="mt-4 text-sm sm:text-base">
        {players.map((player) => (
          <div key={player.id} className="mb-2">
            <p>
              Player {player.id}: {player.collectedTiles.length} Tiles
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
