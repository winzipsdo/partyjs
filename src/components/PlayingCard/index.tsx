import { cn } from '@/lib/utils';

type Suit = '♠' | '♥' | '♣' | '♦';
type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

interface PlayingCardProps {
  suit: Suit;
  rank: Rank;
  className?: string;
}

export function PlayingCard({ suit, rank, className }: PlayingCardProps) {
  const isRed = suit === '♥' || suit === '♦';

  return (
    <div
      className={cn(
        'w-24 h-36 bg-white rounded-lg shadow-md',
        'border border-gray-200',
        'flex flex-col justify-between',
        'p-1.5',
        className
      )}
    >
      <div
        className={cn(
          'text-sm font-bold',
          isRed ? 'text-red-600' : 'text-black'
        )}
      >
        <div>{rank}</div>
        <div className="text-xs">{suit}</div>
      </div>

      <div
        className={cn(
          'text-2xl self-center',
          isRed ? 'text-red-600' : 'text-black'
        )}
      >
        {suit}
      </div>

      <div
        className={cn(
          'text-sm font-bold rotate-180',
          isRed ? 'text-red-600' : 'text-black'
        )}
      >
        <div>{rank}</div>
        <div className="text-xs">{suit}</div>
      </div>
    </div>
  );
}
