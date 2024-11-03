import { useState } from 'react';
import { PlayingCard } from '@/components/PlayingCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';

type Suit = '♠' | '♥' | '♣' | '♦';
type Rank = 'A' | 'Q' | 'K';
type Card = { suit: Suit; rank: Rank };

export function LiarCardPage() {
  const [selectedCard, setSelectedCard] = useLocalStorageState<Card | null>(
    createStorageKey('liar-card'),
    {
      defaultValue: null,
    }
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const deck: Card[] = [
    // A
    { suit: '♠', rank: 'A' },
    { suit: '♥', rank: 'A' },
    { suit: '♣', rank: 'A' },
    { suit: '♦', rank: 'A' },
    { suit: '♠', rank: 'A' },
    { suit: '♥', rank: 'A' },
    // Q
    { suit: '♠', rank: 'Q' },
    { suit: '♥', rank: 'Q' },
    { suit: '♣', rank: 'Q' },
    { suit: '♦', rank: 'Q' },
    { suit: '♠', rank: 'Q' },
    { suit: '♥', rank: 'Q' },
    // K
    { suit: '♠', rank: 'K' },
    { suit: '♥', rank: 'K' },
    { suit: '♣', rank: 'K' },
    { suit: '♦', rank: 'K' },
    { suit: '♠', rank: 'K' },
    { suit: '♥', rank: 'K' },
  ];

  const drawCard = () => {
    setIsAnimating(true);

    // 先让旧卡淡出
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * deck.length);
      setSelectedCard(deck[randomIndex]);
    }, 150); // 在动画中途更新卡片

    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-100">
      <Button onClick={drawCard} disabled={isAnimating}>
        Draw Liar Card
      </Button>

      <div className="h-36 flex items-center justify-center relative">
        {selectedCard ? (
          <div
            className={cn(
              'absolute',
              'transition-all duration-300',
              isAnimating
                ? '-translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            )}
          >
            <PlayingCard suit={selectedCard.suit} rank={selectedCard.rank} />
          </div>
        ) : (
          <div className="w-24 h-36 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-center">
            Waiting
          </div>
        )}
      </div>
    </div>
  );
}
