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
    <div className='flex min-h-[calc(100dvh-54px)] flex-col bg-gradient-to-b from-slate-50 to-slate-200'>
      <div className='mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-2 pt-2 sm:px-4 sm:pt-4'>
        {/* 标题 */}
        <div className='shrink-0 text-center'>
          <h1 className='text-lg font-bold text-slate-800 sm:text-2xl'>🔢 舒尔特方格</h1>
          <p className='hidden text-sm text-slate-500 sm:block'>按顺序从 1 找到 {count}，训练你的专注力</p>
        </div>

        {/* 配置区 */}
        <div className='mt-2 flex shrink-0 flex-col gap-2 sm:mt-3 sm:gap-3'>
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
          <div className='flex items-center justify-center gap-1.5'>
            <span className='mr-1 text-xs text-slate-400'>难度</span>
            {SIZE_OPTIONS.map((s) => {
              const active = s === activeSize;
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    'h-8 w-9 rounded-lg text-xs font-semibold transition-all sm:h-9 sm:text-sm',
                    active
                      ? 'bg-emerald-500 text-white shadow'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                  )}
                >
                  {s}×{s}
                </button>
              );
            })}
          </div>
        </div>

        {/* 状态栏：计时器 + 目标 + 重置 */}
        <div className='mt-2 flex shrink-0 items-center justify-between gap-3 px-1 sm:mt-3'>
          <div className='min-w-0'>
            <TimerDisplay status={game.status} startTime={game.startTime} totalMs={game.totalMs} count={count} />
            {bestMs != null && <div className='text-xs text-slate-400'>最佳 {formatSeconds(bestMs)}</div>}
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm'>
              <Target className='h-4 w-4 text-slate-400' />
              <span className='hidden text-xs text-slate-500 sm:inline'>下一个</span>
              <span className='min-w-[1.5rem] text-center text-lg font-bold tabular-nums text-slate-800'>
                {game.status === 'finished' ? '✓' : game.nextTarget}
              </span>
            </div>
            <Button variant='outline' size='sm' onClick={game.reset}>
              <RotateCcw className='h-4 w-4' />
              <span className='hidden sm:inline'>重置</span>
            </Button>
          </div>
        </div>

        {/* 棋盘：占据剩余空间并居中 */}
        <div className='relative flex min-h-0 flex-1 items-center justify-center py-2'>
          {board}
          {game.status === 'idle' && (
            <p className='pointer-events-none absolute bottom-1 left-0 right-0 animate-pulse text-center text-xs text-slate-400'>
              点击数字「1」开始计时
            </p>
          )}
        </div>
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
