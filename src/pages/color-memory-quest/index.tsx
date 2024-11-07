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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Color Memory Quest</h1>
        <button
          onClick={resetGame}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          重新开始游戏
        </button>
      </div>

      {/* 添加调试信息显示 */}
      <div className="mb-4 text-sm text-gray-600">
        <p>Debug - Player 1 tiles: {players[0].collectedTiles.join(', ')}</p>
        <p>Debug - Player 2 tiles: {players[1].collectedTiles.join(', ')}</p>
        <p>Debug - Winner: {winner}</p>
      </div>

      {/* 显示胜利信息 */}
      {winner && (
        <div className="mb-4 text-xl font-bold text-green-600">
          🎉 恭喜 Player {winner} 获胜！
        </div>
      )}

      {/* 游戏状态 */}
      <div className="mb-4">
        <p>当前玩家: Player {currentPlayer}</p>
        <p>骰子颜色: {currentDiceColor || '请掷骰子'}</p>
      </div>

      {/* 骰子按钮 */}
      <button
        onClick={rollDice}
        disabled={!!currentDiceColor || !!winner}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:bg-gray-400"
      >
        掷骰子
      </button>

      {/* 棋盘 */}
      <div className="grid grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => flipTile(tile.id)}
            className={`
              w-24 h-24 rounded cursor-pointer
              transition-all duration-300
              ${tile.isCollected ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
              ${tile.isFlipped ? getColorClass(tile.color) : 'bg-gray-300'}
              ${tile.isMatched ? styles.animateBounce : ''}
            `}
          />
        ))}
      </div>

      {/* 玩家得分 */}
      <div className="mt-4">
        {players.map((player) => (
          <div key={player.id} className="mb-2">
            <p>
              Player {player.id}: {player.collectedTiles.length} 块棋子
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
