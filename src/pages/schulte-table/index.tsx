import { useEffect, useMemo, useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw, Target } from 'lucide-react';
import { useSchulteGame } from './useSchulteGame';
import { GameMode, MODE_META, SIZE_OPTIONS, formatSeconds } from './utils';
import { StandardBoard } from './components/StandardBoard';
import { HoneycombBoard } from './components/HoneycombBoard';
import { DynamicBoard } from './components/DynamicBoard';
import { TimerDisplay } from './components/TimerDisplay';
import { StatsDialog } from './components/StatsDialog';

const MODES: GameMode[] = ['standard', 'honeycomb', 'dynamic'];

export function SchulteTablePage() {
  const [mode, setMode] = useLocalStorageState<GameMode>(createStorageKey('schulte-mode'), {
    defaultValue: 'standard',
  });
  const [size, setSize] = useLocalStorageState<number>(createStorageKey('schulte-size'), {
    defaultValue: 5,
  });
  const [bestTimes, setBestTimes] = useLocalStorageState<Record<string, number>>(
    createStorageKey('schulte-best'),
    { defaultValue: {} },
  );

  const activeMode = mode ?? 'standard';
  const activeSize = size ?? 5;
  const count = activeSize * activeSize;
  const bestKey = `${activeMode}-${activeSize}`;

  const game = useSchulteGame(count, bestKey);

  const [statsOpen, setStatsOpen] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const bestMs = bestTimes?.[bestKey];

  // 完成时：记录最佳成绩、弹出统计
  useEffect(() => {
    if (game.status === 'finished') {
      const prev = bestTimes?.[bestKey];
      const better = prev == null || game.totalMs < prev;
      setIsNewBest(better);
      if (better) {
        setBestTimes({ ...(bestTimes ?? {}), [bestKey]: game.totalMs });
      }
      setStatsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status]);

  const board = useMemo(() => {
    switch (activeMode) {
      case 'honeycomb':
        return <HoneycombBoard game={game} size={activeSize} />;
      case 'dynamic':
        return <DynamicBoard game={game} />;
      default:
        return <StandardBoard game={game} size={activeSize} />;
    }
  }, [activeMode, activeSize, game]);

  const handleReplay = () => {
    setStatsOpen(false);
    game.reset();
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-200'>
      <div className='max-w-2xl mx-auto px-4 py-4 sm:py-6'>
        {/* 标题 */}
        <div className='text-center mb-4'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-800'>🔢 舒尔特方格</h1>
          <p className='text-slate-500 text-sm mt-1'>按顺序从 1 找到 {count}，训练你的专注力</p>
        </div>

        {/* 配置区 */}
        <div className='flex flex-col gap-3 mb-4'>
          {/* 模式 */}
          <div className='flex justify-center gap-2'>
            {MODES.map((m) => {
              const meta = MODE_META[m];
              const active = m === activeMode;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 max-w-[9rem] rounded-xl border px-3 py-2 text-sm font-medium transition-all',
                    active
                      ? 'bg-slate-800 text-white border-slate-800 shadow'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                  )}
                  title={meta.desc}
                >
                  <span className='mr-1'>{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* 尺寸 */}
          <div className='flex justify-center items-center gap-1.5'>
            <span className='text-xs text-slate-400 mr-1'>难度</span>
            {SIZE_OPTIONS.map((s) => {
              const active = s === activeSize;
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-semibold transition-all',
                    active
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300',
                  )}
                >
                  {s}×{s}
                </button>
              );
            })}
          </div>
        </div>

        {/* 状态栏：计时器 + 目标 + 重置 */}
        <div className='flex items-center justify-between gap-3 mb-4 px-1'>
          <div className='flex-1'>
            <TimerDisplay status={game.status} startTime={game.startTime} totalMs={game.totalMs} count={count} />
            {bestMs != null && (
              <div className='text-xs text-slate-400 mt-1'>最佳 {formatSeconds(bestMs)}</div>
            )}
          </div>

          <div className='flex flex-col items-end gap-2'>
            <div className='flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 shadow-sm'>
              <Target className='w-4 h-4 text-slate-400' />
              <span className='text-xs text-slate-500'>下一个</span>
              <span className='text-lg font-bold tabular-nums text-slate-800 min-w-[1.5rem] text-center'>
                {game.status === 'finished' ? '✓' : game.nextTarget}
              </span>
            </div>
            <Button variant='outline' size='sm' onClick={game.reset}>
              <RotateCcw className='w-4 h-4' />
              重置
            </Button>
          </div>
        </div>

        {/* 棋盘 */}
        <div className='py-2'>{board}</div>

        {game.status === 'idle' && (
          <p className='text-center text-slate-400 text-sm mt-4 animate-pulse'>点击数字「1」开始计时</p>
        )}
      </div>

      <StatsDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
        records={game.records}
        totalMs={game.totalMs}
        errors={game.errors}
        bestMs={bestMs}
        isNewBest={isNewBest}
        onReplay={handleReplay}
      />
    </div>
  );
}
