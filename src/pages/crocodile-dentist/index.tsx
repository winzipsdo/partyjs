import { useState } from 'react';

export function CrocodileDentistPage() {
  const [teeth, setTeeth] = useState(Array(8).fill(false)); // 8颗牙齿的状态
  const [gameOver, setGameOver] = useState(false);
  const [losingTooth, setLosingTooth] = useState(Math.floor(Math.random() * 8)); // 随机选择咬人的牙齿

  const pressTeeth = (index: number) => {
    if (gameOver) return;

    const newTeeth = [...teeth];
    newTeeth[index] = true;
    setTeeth(newTeeth);

    if (index === losingTooth) {
      setGameOver(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Crocodile Dentist</h1>

      <div className="grid grid-cols-4 gap-2">
        {teeth.map((pressed, index) => (
          <button
            key={index}
            onClick={() => pressTeeth(index)}
            disabled={pressed || gameOver}
            className={`
              w-16 h-20 rounded-b-lg
              ${
                pressed
                  ? index === losingTooth
                    ? 'bg-red-500' // 被咬到的牙齿显示红色
                    : 'bg-gray-300' // 其他按过的牙齿显示灰色
                  : 'bg-white hover:bg-gray-100'
              }
              border-2 border-gray-400
              disabled:cursor-not-allowed
              transition-colors
            `}
          >
            🦷
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="text-red-500 text-xl">Ouch! You got bit!</div>
      )}

      {gameOver && (
        <button
          onClick={() => {
            setTeeth(Array(8).fill(false));
            setGameOver(false);
            setLosingTooth(Math.floor(Math.random() * 8)); // 重新随机选择咬人的牙齿
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
