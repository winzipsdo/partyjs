interface DiceProps {
  value: number; // 骰子点数 (1-6)
  size?: number; // 骰子大小，默认 60px
}

export function Dice({ value, size = 60 }: DiceProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'white',
        borderRadius: size / 10,
        boxShadow:
          'inset 0 5px white, inset 0 -5px #bbb, inset 5px 0 #d7d7d7, inset -5px 0 #d7d7d7',
        display: 'grid',
        padding: size / 10,
        gridTemplateAreas: `
          "a . c"
          "e g f"
          "d . b"
        `,
      }}
    >
      {[...Array(value)].map((_, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: size / 6,
            height: size / 6,
            borderRadius: '50%',
            background: '#333',
            gridArea: getDotPosition(value, i),
          }}
        />
      ))}
    </div>
  );
}

// 根据点数和点的索引返回网格位置
function getDotPosition(value: number, index: number): string {
  const positions = {
    1: ['g'],
    2: ['a', 'b'],
    3: ['a', 'g', 'b'],
    4: ['a', 'c', 'b', 'd'],
    5: ['a', 'c', 'g', 'b', 'd'],
    6: ['a', 'c', 'e', 'f', 'b', 'd'],
  };

  return positions[value as keyof typeof positions][index];
}
