import { useState, useCallback, useMemo } from 'react';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw, Undo2, History, Trash2, X, ChevronLeft } from 'lucide-react';

// Board size: 15x15 is standard, but 11x11 is better for mobile
const BOARD_SIZE = 11;
const WIN_COUNT = 5;

type Player = 'black' | 'white';
type Cell = Player | null;
type Board = Cell[][];

interface Move {
  row: number;
  col: number;
  player: Player;
}

interface GameRecord {
  id: string;
  date: string;
  winner: Player | 'draw';
  moves: Move[];
  blackWins?: number;
  whiteWins?: number;
}

// Create empty board
const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
};

// Check for winner
const checkWinner = (board: Board, row: number, col: number, player: Player): boolean => {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check positive direction
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
      } else {
        break;
      }
    }

    // Check negative direction
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
      } else {
        break;
      }
    }

    if (count >= WIN_COUNT) {
      return true;
    }
  }

  return false;
};

// Check for draw
const checkDraw = (board: Board): boolean => {
  return board.every((row) => row.every((cell) => cell !== null));
};

export function GomokuPage() {
  // Game state
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  // View state
  const [showHistory, setShowHistory] = useState(false);

  // History records
  const [gameRecords, setGameRecords] = useLocalStorageState<GameRecord[]>(
    createStorageKey('gomoku-history'),
    { defaultValue: [] }
  );

  // Calculate win stats
  const stats = useMemo(() => {
    const records = gameRecords ?? [];
    return {
      blackWins: records.filter((r) => r.winner === 'black').length,
      whiteWins: records.filter((r) => r.winner === 'white').length,
      draws: records.filter((r) => r.winner === 'draw').length,
    };
  }, [gameRecords]);

  // Handle cell click
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winner || board[row][col]) return;

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setLastMove({ row, col });

      const newMove: Move = { row, col, player: currentPlayer };
      setMoves((prev) => [...prev, newMove]);

      // Check for winner
      if (checkWinner(newBoard, row, col, currentPlayer)) {
        setWinner(currentPlayer);
        // Save to history
        const record: GameRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          winner: currentPlayer,
          moves: [...moves, newMove],
        };
        setGameRecords((prev = []) => [record, ...prev]);
      } else if (checkDraw(newBoard)) {
        setWinner('draw');
        const record: GameRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          winner: 'draw',
          moves: [...moves, newMove],
        };
        setGameRecords((prev = []) => [record, ...prev]);
      } else {
        setCurrentPlayer((prev) => (prev === 'black' ? 'white' : 'black'));
      }
    },
    [board, currentPlayer, winner, moves, setGameRecords]
  );

  // Undo move
  const handleUndo = useCallback(() => {
    if (moves.length === 0 || winner) return;

    const newMoves = [...moves];
    const lastMove = newMoves.pop();
    if (!lastMove) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[lastMove.row][lastMove.col] = null;
    setBoard(newBoard);
    setMoves(newMoves);
    setCurrentPlayer(lastMove.player);

    // Update last move indicator
    if (newMoves.length > 0) {
      const prevMove = newMoves[newMoves.length - 1];
      setLastMove({ row: prevMove.row, col: prevMove.col });
    } else {
      setLastMove(null);
    }
  }, [moves, board, winner]);

  // Reset game
  const handleReset = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('black');
    setWinner(null);
    setMoves([]);
    setLastMove(null);
  }, []);

  // Delete a game record
  const handleDeleteRecord = useCallback(
    (id: string) => {
      setGameRecords((prev = []) => prev.filter((r) => r.id !== id));
    },
    [setGameRecords]
  );

  // Clear all history
  const handleClearHistory = useCallback(() => {
    setGameRecords([]);
  }, [setGameRecords]);

  // Render history view
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Game History</h1>
            <button
              onClick={handleClearHistory}
              className="text-red-500 hover:text-red-700 p-2"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.blackWins}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gray-800"></span>
                  Black Wins
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.whiteWins}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-gray-300"></span>
                  White Wins
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.draws}</div>
                <div className="text-sm text-gray-500">Draws</div>
              </div>
            </div>
          </div>

          {/* Records list */}
          <div className="space-y-2">
            {(gameRecords ?? []).length === 0 ? (
              <div className="text-center text-gray-500 py-8">No game records yet</div>
            ) : (
              (gameRecords ?? []).map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        record.winner === 'black'
                          ? 'bg-gray-800'
                          : record.winner === 'white'
                            ? 'bg-white border-2 border-gray-300'
                            : 'bg-gray-400'
                      )}
                    >
                      {record.winner === 'draw' && (
                        <span className="text-white text-xs">=</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {record.winner === 'draw'
                          ? 'Draw'
                          : `${record.winner === 'black' ? 'Black' : 'White'} Wins`}
                      </div>
                      <div className="text-sm text-gray-500">{record.date}</div>
                      <div className="text-xs text-gray-400">{record.moves.length} moves</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-2 sm:p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gomoku</h1>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 p-2"
          >
            <History className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">History</span>
          </button>
        </div>

        {/* Game status */}
        <div className="bg-white rounded-xl p-3 sm:p-4 mb-2 sm:mb-4 shadow-sm">
          {winner ? (
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                {winner === 'draw' ? (
                  "It's a Draw!"
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full',
                        winner === 'black'
                          ? 'bg-gray-800'
                          : 'bg-white border-2 border-gray-300'
                      )}
                    ></span>
                    {winner === 'black' ? 'Black' : 'White'} Wins!
                  </span>
                )}
              </div>
              <Button onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current:</span>
                <span
                  className={cn(
                    'w-6 h-6 rounded-full',
                    currentPlayer === 'black'
                      ? 'bg-gray-800'
                      : 'bg-white border-2 border-gray-300'
                  )}
                ></span>
                <span className="font-medium text-gray-800">
                  {currentPlayer === 'black' ? 'Black' : 'White'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={moves.length === 0}
                  className="gap-1"
                >
                  <Undo2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Undo</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Game board */}
        <div className="bg-amber-200 rounded-xl p-2 sm:p-3 shadow-lg">
          <div
            className="grid gap-0 relative"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    'aspect-square relative cursor-pointer',
                    'flex items-center justify-center',
                    'hover:bg-amber-300/50 transition-colors'
                  )}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Horizontal line */}
                    <div
                      className={cn(
                        'absolute h-[1px] bg-amber-700/60',
                        colIndex === 0 ? 'left-1/2 right-0' : colIndex === BOARD_SIZE - 1 ? 'left-0 right-1/2' : 'left-0 right-0'
                      )}
                    ></div>
                    {/* Vertical line */}
                    <div
                      className={cn(
                        'absolute w-[1px] bg-amber-700/60',
                        rowIndex === 0 ? 'top-1/2 bottom-0' : rowIndex === BOARD_SIZE - 1 ? 'top-0 bottom-1/2' : 'top-0 bottom-0'
                      )}
                    ></div>
                    {/* Star points (corners and center) */}
                    {((rowIndex === 2 && colIndex === 2) ||
                      (rowIndex === 2 && colIndex === BOARD_SIZE - 3) ||
                      (rowIndex === BOARD_SIZE - 3 && colIndex === 2) ||
                      (rowIndex === BOARD_SIZE - 3 && colIndex === BOARD_SIZE - 3) ||
                      (rowIndex === Math.floor(BOARD_SIZE / 2) && colIndex === Math.floor(BOARD_SIZE / 2))) && (
                      <div className="absolute w-2 h-2 bg-amber-700/60 rounded-full"></div>
                    )}
                  </div>

                  {/* Stone */}
                  {cell && (
                    <div
                      className={cn(
                        'w-[85%] h-[85%] rounded-full z-10 transition-transform',
                        'shadow-md',
                        cell === 'black'
                          ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                          : 'bg-gradient-to-br from-white to-gray-200 border border-gray-300',
                        lastMove?.row === rowIndex && lastMove?.col === colIndex && 'ring-2 ring-red-500'
                      )}
                    ></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-2 sm:mt-4 text-center text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-800"></span>
            {stats.blackWins}
          </span>
          <span className="mx-3">-</span>
          <span className="inline-flex items-center gap-1">
            {stats.whiteWins}
            <span className="w-3 h-3 rounded-full bg-white border border-gray-300"></span>
          </span>
          {stats.draws > 0 && <span className="ml-3 text-gray-400">({stats.draws} draws)</span>}
        </div>
      </div>
    </div>
  );
}
