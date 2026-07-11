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
    <div
      className='aurora flex min-h-screen flex-col items-center justify-center gap-6'
      style={{ '--ga': '262 85% 66%', '--gb': '322 85% 62%' } as React.CSSProperties}
    >
      <div className='text-center'>
        <div className='mb-2 text-5xl drop-shadow-[0_4px_12px_rgba(167,139,250,0.4)]'>🃏</div>
        <h1 className='text-2xl font-bold text-white'>Liar Card</h1>
        <p className='mt-1 text-sm text-slate-400'>Draw a card, bluff your way</p>
      </div>
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
          <div className='glass flex h-36 w-24 items-center justify-center rounded-lg border-2 border-dashed !border-white/20 text-center text-slate-500'>
            Waiting
          </div>
        )}
      </div>
    </div>
  );
}
