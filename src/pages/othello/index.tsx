import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw, Undo2, History, Trash2, X, ChevronLeft } from 'lucide-react';

const BOARD_SIZE = 8;

type Player = 'black' | 'white';
type Cell = Player | null;
type Board = Cell[][];

interface Move {
  row: number;
  col: number;
  player: Player;
  flipped: { row: number; col: number }[];
}

interface GameRecord {
  id: string;
  date: string;
  winner: Player | 'draw';
  blackCount: number;
  whiteCount: number;
  moves: number;
}

// Directions for checking: horizontal, vertical, diagonal
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

// Create initial board with center 4 pieces
const createInitialBoard = (): Board => {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = 'white';
  board[mid - 1][mid] = 'black';
  board[mid][mid - 1] = 'black';
  board[mid][mid] = 'white';

  return board;
};

// Get pieces that would be flipped if player places at (row, col)
const getFlippedPieces = (board: Board, row: number, col: number, player: Player): { row: number; col: number }[] => {
  if (board[row][col] !== null) return [];

  const opponent = player === 'black' ? 'white' : 'black';
  const allFlipped: { row: number; col: number }[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const flipped: { row: number; col: number }[] = [];
    let r = row + dr;
    let c = col + dc;

    // Move in direction while finding opponent pieces
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      flipped.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // Check if we ended on our own piece (valid flip)
    if (flipped.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      allFlipped.push(...flipped);
    }
  }

  return allFlipped;
};

// Check if a move is valid
const isValidMove = (board: Board, row: number, col: number, player: Player): boolean => {
  return getFlippedPieces(board, row, col, player).length > 0;
};

// Get all valid moves for a player
const getValidMoves = (board: Board, player: Player): { row: number; col: number }[] => {
  const moves: { row: number; col: number }[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, r, c, player)) {
        moves.push({ row: r, col: c });
      }
    }
  }

  return moves;
};

// Count pieces on the board
const countPieces = (board: Board): { black: number; white: number } => {
  let black = 0;
  let white = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
    }
  }

  return { black, white };
};

export function OthelloPage() {
  // Game state
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [passCount, setPassCount] = useState(0);

  // View state
  const [showHistory, setShowHistory] = useState(false);

  // History records
  const [gameRecords, setGameRecords] = useLocalStorageState<GameRecord[]>(createStorageKey('othello-history'), {
    defaultValue: [],
  });

  // Valid moves for current player
  const validMoves = useMemo(() => {
    if (gameOver) return [];
    return getValidMoves(board, currentPlayer);
  }, [board, currentPlayer, gameOver]);

  // Piece counts
  const pieceCount = useMemo(() => countPieces(board), [board]);

  // Calculate win stats
  const stats = useMemo(() => {
    const records = gameRecords ?? [];
    return {
      blackWins: records.filter((r) => r.winner === 'black').length,
      whiteWins: records.filter((r) => r.winner === 'white').length,
      draws: records.filter((r) => r.winner === 'draw').length,
    };
  }, [gameRecords]);

  // Check for game end
  useEffect(() => {
    if (gameOver) return;

    const currentValidMoves = getValidMoves(board, currentPlayer);

    if (currentValidMoves.length === 0) {
      const opponent = currentPlayer === 'black' ? 'white' : 'black';
      const opponentValidMoves = getValidMoves(board, opponent);

      if (opponentValidMoves.length === 0 || passCount >= 1) {
        // Game over - both players can't move
        setGameOver(true);
        const { black, white } = countPieces(board);
        const gameWinner = black > white ? 'black' : white > black ? 'white' : 'draw';
        setWinner(gameWinner);

        // Save to history
        const record: GameRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          winner: gameWinner,
          blackCount: black,
          whiteCount: white,
          moves: moveHistory.length,
        };
        setGameRecords((prev = []) => [record, ...prev]);
      } else {
        // Current player passes, switch to opponent
        setPassCount((p) => p + 1);
        setCurrentPlayer(opponent);
      }
    } else {
      setPassCount(0);
    }
  }, [board, currentPlayer, gameOver, passCount, moveHistory.length, setGameRecords]);

  // Handle cell click
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameOver) return;
      if (!isValidMove(board, row, col, currentPlayer)) return;

      const flipped = getFlippedPieces(board, row, col, currentPlayer);

      // Apply move
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer;
      for (const { row: fr, col: fc } of flipped) {
        newBoard[fr][fc] = currentPlayer;
      }

      setBoard(newBoard);
      setLastMove({ row, col });
      setMoveHistory((prev) => [...prev, { row, col, player: currentPlayer, flipped }]);
      setCurrentPlayer((prev) => (prev === 'black' ? 'white' : 'black'));
    },
    [board, currentPlayer, gameOver]
  );

  // Undo move
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || gameOver) return;

    const newHistory = [...moveHistory];
    const lastMoveData = newHistory.pop();
    if (!lastMoveData) return;

    // Revert the board
    const newBoard = board.map((r) => [...r]);
    newBoard[lastMoveData.row][lastMoveData.col] = null;

    // Unflip pieces
    const opponent = lastMoveData.player === 'black' ? 'white' : 'black';
    for (const { row, col } of lastMoveData.flipped) {
      newBoard[row][col] = opponent;
    }

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentPlayer(lastMoveData.player);
    setPassCount(0);

    // Update last move indicator
    if (newHistory.length > 0) {
      const prevMove = newHistory[newHistory.length - 1];
      setLastMove({ row: prevMove.row, col: prevMove.col });
    } else {
      setLastMove(null);
    }
  }, [moveHistory, board, gameOver]);

  // Reset game
  const handleReset = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('black');
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
    setLastMove(null);
    setPassCount(0);
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
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4'>
        <div className='max-w-md mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={() => setShowHistory(false)}
              className='flex items-center gap-1 text-gray-600 hover:text-gray-800'
            >
              <ChevronLeft className='w-5 h-5' />
              <span>Back</span>
            </button>
            <h1 className='text-xl font-bold text-gray-800'>Game History</h1>
            <button onClick={handleClearHistory} className='text-red-500 hover:text-red-700 p-2' title='Clear all'>
              <Trash2 className='w-5 h-5' />
            </button>
          </div>

          {/* Stats */}
          <div className='bg-white rounded-xl p-4 mb-4 shadow-sm'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-2xl font-bold text-gray-800'>{stats.blackWins}</div>
                <div className='text-sm text-gray-500 flex items-center justify-center gap-1'>
                  <span className='w-3 h-3 rounded-full bg-gray-800'></span>
                  Black Wins
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-800'>{stats.whiteWins}</div>
                <div className='text-sm text-gray-500 flex items-center justify-center gap-1'>
                  <span className='w-3 h-3 rounded-full bg-white border-2 border-gray-300'></span>
                  White Wins
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-800'>{stats.draws}</div>
                <div className='text-sm text-gray-500'>Draws</div>
              </div>
            </div>
          </div>

          {/* Records list */}
          <div className='space-y-2'>
            {(gameRecords ?? []).length === 0 ? (
              <div className='text-center text-gray-500 py-8'>No game records yet</div>
            ) : (
              (gameRecords ?? []).map((record) => (
                <div key={record.id} className='bg-white rounded-xl p-4 shadow-sm flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
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
                      {record.winner === 'draw' && <span className='text-white text-xs'>=</span>}
                    </div>
                    <div>
                      <div className='font-medium text-gray-800'>
                        {record.winner === 'draw' ? 'Draw' : `${record.winner === 'black' ? 'Black' : 'White'} Wins`}
                      </div>
                      <div className='text-sm text-gray-500'>{record.date}</div>
                      <div className='text-xs text-gray-400'>
                        ⚫ {record.blackCount} - {record.whiteCount} ⚪ | {record.moves} moves
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className='p-2 text-gray-400 hover:text-red-500 transition-colors'
                  >
                    <X className='w-5 h-5' />
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
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-2 sm:p-4'>
      <div className='max-w-md mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-2 sm:mb-4'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>Othello</h1>
          <button
            onClick={() => setShowHistory(true)}
            className='flex items-center gap-1 text-gray-600 hover:text-gray-800 p-2'
          >
            <History className='w-5 h-5' />
            <span className='text-sm hidden sm:inline'>History</span>
          </button>
        </div>

        {/* Score display */}
        <div className='bg-white rounded-xl p-3 sm:p-4 mb-2 sm:mb-4 shadow-sm'>
          <div className='flex items-center justify-around mb-3'>
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold',
                  currentPlayer === 'black' && !gameOver && 'ring-2 ring-emerald-500 ring-offset-2'
                )}
              >
                {pieceCount.black}
              </span>
              <span className='text-sm text-gray-600'>Black</span>
            </div>
            <div className='text-gray-400'>vs</div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600'>White</span>
              <span
                className={cn(
                  'w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-bold',
                  currentPlayer === 'white' && !gameOver && 'ring-2 ring-emerald-500 ring-offset-2'
                )}
              >
                {pieceCount.white}
              </span>
            </div>
          </div>

          {gameOver ? (
            <div className='text-center'>
              <div className='text-lg sm:text-xl font-bold text-gray-800 mb-2'>
                {winner === 'draw' ? (
                  "It's a Draw!"
                ) : (
                  <span className='flex items-center justify-center gap-2'>
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full',
                        winner === 'black' ? 'bg-gray-800' : 'bg-white border-2 border-gray-300'
                      )}
                    ></span>
                    {winner === 'black' ? 'Black' : 'White'} Wins!
                  </span>
                )}
              </div>
              <Button onClick={handleReset} className='gap-2'>
                <RotateCcw className='w-4 h-4' />
                New Game
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                {validMoves.length > 0 ? (
                  <span>{validMoves.length} valid moves</span>
                ) : (
                  <span className='text-orange-500'>No valid moves - Pass!</span>
                )}
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0}
                  className='gap-1'
                >
                  <Undo2 className='w-4 h-4' />
                  <span className='hidden sm:inline'>Undo</span>
                </Button>
                <Button variant='outline' size='sm' onClick={handleReset} className='gap-1'>
                  <RotateCcw className='w-4 h-4' />
                  <span className='hidden sm:inline'>Reset</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Game board */}
        <div className='bg-emerald-600 rounded-xl p-2 sm:p-3 shadow-lg'>
          <div
            className='grid gap-1'
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isValid = validMoves.some((m) => m.row === rowIndex && m.col === colIndex);
                const isLast = lastMove?.row === rowIndex && lastMove?.col === colIndex;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      'aspect-square relative cursor-pointer',
                      'bg-emerald-500 rounded-sm',
                      'flex items-center justify-center',
                      'transition-all duration-150',
                      isValid && 'hover:bg-emerald-400'
                    )}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {/* Valid move indicator */}
                    {isValid && !cell && <div className={cn('absolute w-3 h-3 rounded-full', 'bg-black/20')}></div>}

                    {/* Piece */}
                    {cell && (
                      <div
                        className={cn(
                          'w-[85%] h-[85%] rounded-full z-10',
                          'shadow-md transition-transform duration-200',
                          cell === 'black'
                            ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                            : 'bg-gradient-to-br from-white to-gray-200 border border-gray-300',
                          isLast && 'ring-2 ring-yellow-400'
                        )}
                      ></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className='mt-2 sm:mt-4 text-center text-sm text-gray-500'>
          <span className='inline-flex items-center gap-1'>
            <span className='w-3 h-3 rounded-full bg-gray-800'></span>
            {stats.blackWins}
          </span>
          <span className='mx-3'>-</span>
          <span className='inline-flex items-center gap-1'>
            {stats.whiteWins}
            <span className='w-3 h-3 rounded-full bg-white border border-gray-300'></span>
          </span>
          {stats.draws > 0 && <span className='ml-3 text-gray-400'>({stats.draws} draws)</span>}
        </div>
      </div>
    </div>
  );
}
