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
    createStorageKey('schulte-best-v2'),
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
    <div className='aurora flex min-h-[calc(100dvh-54px)] flex-col' style={{ '--ga': '199 90% 55%', '--gb': '258 90% 66%' } as React.CSSProperties}>
      <div className='mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-2 pt-2 sm:px-4 sm:pt-4'>
        {/* 标题 */}
        <div className='shrink-0 text-center'>
          <h1 className='text-lg font-bold text-white sm:text-2xl'>🔢 舒尔特方格</h1>
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
                      ? 'border-sky-400/60 bg-sky-400/15 text-sky-200 shadow-[0_0_16px_-4px_rgba(56,189,248,0.5)]'
                      : 'glass text-slate-400 hover:text-slate-200',
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
                      ? 'bg-emerald-500 text-white shadow-[0_0_14px_-2px_rgba(16,185,129,0.6)]'
                      : 'glass text-slate-400 hover:text-slate-200',
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
            <div className='glass flex items-center gap-1.5 rounded-full px-3 py-1.5'>
              <Target className='h-4 w-4 text-slate-400' />
              <span className='hidden text-xs text-slate-500 sm:inline'>下一个</span>
              <span className='min-w-[1.5rem] text-center text-lg font-bold tabular-nums text-white'>
                {game.status === 'finished' ? '✓' : game.nextTarget}
              </span>
            </div>
            <Button variant='outline' size='sm' onClick={game.reset}>
              <RotateCcw className='h-4 w-4' />
              <span className='hidden sm:inline'>重置</span>
            </Button>
          </div>
        </div>

        {/* 棋盘：占据剩余空间并居中；开始前数字不可见（标准舒尔特规则） */}
        <div className='relative flex min-h-0 flex-1 items-center justify-center py-2'>
          <div
            className={cn(
              'w-full transition-opacity duration-300',
              game.status === 'idle' && 'pointer-events-none opacity-45',
            )}
          >
            {board}
          </div>
          {game.status === 'idle' && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3'>
              <button
                onClick={game.start}
                className='glass rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-[0_0_28px_-6px_rgba(56,189,248,0.55)] transition-all hover:scale-105 hover:bg-white/10 active:scale-95'
              >
                ▶ 开始挑战
              </button>
              <p className='px-6 text-center text-xs text-slate-400'>点击后立即计时，按顺序找到 1 ~ {count}</p>
            </div>
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
