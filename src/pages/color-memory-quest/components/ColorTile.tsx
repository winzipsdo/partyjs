import { useEffect, useState } from 'react';

export type TileColor = 'red' | 'yellow' | 'blue' | 'green';

interface ColorTileProps {
  color: TileColor;
  isFlipped: boolean;
  isCollected?: boolean;
  isMatched?: boolean;
  onClick?: () => void;
  className?: string;
  showColorOnly?: boolean;
}

const getColorClass = (color: TileColor): string => {
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
  };
  return colorMap[color];
};

export default function ColorTile({
  color,
  isFlipped,
  isCollected = false,
  isMatched = false,
  onClick,
  className = '',
  showColorOnly = false,
}: ColorTileProps) {
  // 用于控制翻转动画
  const [isFlipping, setIsFlipping] = useState(false);

  // 监听 isFlipped 变化来触发动画
  useEffect(() => {
    setIsFlipping(true);
    const timer = setTimeout(() => {
      setIsFlipping(false);
    }, 300); // 动画持续时间

    return () => clearTimeout(timer);
  }, [isFlipped]);

  return (
    <div
      onClick={onClick}
      className={`
        relative
        w-full
        aspect-square
        cursor-pointer
        rounded
        transition-all
        duration-300
        transform-gpu
        ${isFlipping ? 'scale-[0.95]' : 'scale-100'}
        ${isCollected ? 'opacity-0 scale-0' : 'opacity-100'}
        ${className}
      `}
    >
      {!showColorOnly ? (
        <>
          <div
            className={`
              absolute
              inset-0
              rounded
              transition-all
              duration-300
              transform-gpu
              ${isFlipped ? 'rotateY-180 opacity-0' : 'rotateY-0 opacity-100'}
              bg-gray-300
              shadow-md
            `}
          />
          <div
            className={`
              absolute
              inset-0
              rounded
              transition-all
              duration-300
              transform-gpu
              ${isFlipped ? 'rotateY-0 opacity-100' : 'rotateY-180 opacity-0'}
              ${getColorClass(color)}
              shadow-md
              ${isMatched ? 'animate-bounce' : ''}
            `}
          />
        </>
      ) : (
        <div
          className={`
            absolute
            inset-0
            rounded
            ${getColorClass(color)}
            shadow-md
          `}
        />
      )}
    </div>
  );
}
