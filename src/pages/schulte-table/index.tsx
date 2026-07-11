import { useEffect, useMemo, useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDownUp, Contrast, RotateCcw, Target } from 'lucide-react';
import { useSchulteGame } from './useSchulteGame';
import { GameMode, MODE_META, SIZE_OPTIONS, formatSeconds } from './utils';
import { StandardBoard } from './components/StandardBoard';
import { HoneycombBoard } from './components/HoneycombBoard';
import { DynamicBoard } from './components/DynamicBoard';
import { TimerDisplay } from './components/TimerDisplay';
import { StatsDialog } from './components/StatsDialog';
import styles from './styles.module.css';

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
  const [highContrast, setHighContrast] = useLocalStorageState<boolean>(
    createStorageKey('schulte-high-contrast'),
    { defaultValue: false },
  );
  const [descending, setDescending] = useLocalStorageState<boolean>(
    createStorageKey('schulte-descending'),
    { defaultValue: false },
  );

  const activeMode = mode ?? 'standard';
  // 旧版本可能存了 3/4，已下线的尺寸回退到 5
  const storedSize = size ?? 5;
  const activeSize = (SIZE_OPTIONS as readonly number[]).includes(storedSize) ? storedSize : 5;
  const isDesc = !!descending;
  const count = activeSize * activeSize;
  const bestKey = `${activeMode}-${activeSize}${isDesc ? '-desc' : ''}`;

  const game = useSchulteGame(count, bestKey, isDesc);

  const [statsOpen, setStatsOpen] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const bestMs = bestTimes?.[bestKey];

  // 锁定页面滚动：移动端上下滑动手势会把 tap 判成 scroll 导致点击丢失。
  // 挂载期间禁掉 html/body 滚动与橡皮筋回弹，离开页面时恢复。
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.overscrollBehavior = prev.overscroll;
    };
  }, []);

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
    <div
      className='aurora flex h-[calc(100dvh-54px)] touch-none select-none flex-col overflow-hidden'
      style={{ '--ga': '199 90% 55%', '--gb': '258 90% 66%' } as React.CSSProperties}
    >
      <div className='mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-2 pt-2 sm:px-4 sm:pt-4'>
        {/* 标题 */}
        <div className='shrink-0 text-center'>
          <h1 className='text-lg font-bold text-white sm:text-2xl'>🔢 舒尔特方格</h1>
          <p className='hidden text-sm text-slate-500 sm:block'>{isDesc ? `倒式：从 ${count} 数回 1` : `按顺序从 1 找到 ${count}`}，训练你的专注力</p>
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
            <span className='mx-0.5 h-5 w-px bg-white/10' />
            <button
              onClick={() => setDescending(!isDesc)}
              title={isDesc ? '倒式（点击切回正序）' : '正序（点击切换倒式）'}
              aria-pressed={isDesc}
              className={cn(
                'flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-bold tabular-nums transition-all sm:h-9',
                isDesc
                  ? 'bg-violet-500/25 text-violet-200 shadow-[0_0_14px_-2px_rgba(167,139,250,0.6)] border border-violet-400/50'
                  : 'glass text-slate-400 hover:text-slate-200',
              )}
            >
              <ArrowDownUp className='h-3.5 w-3.5' />
              {isDesc ? `${count}→1` : `1→${count}`}
            </button>
            <button
              onClick={() => setHighContrast(!highContrast)}
              title='高对比度'
              aria-pressed={!!highContrast}
              className={cn(
                'flex h-8 w-9 items-center justify-center rounded-lg transition-all sm:h-9',
                highContrast
                  ? 'bg-slate-100 text-slate-900 shadow-[0_0_14px_-2px_rgba(241,245,249,0.6)]'
                  : 'glass text-slate-400 hover:text-slate-200',
              )}
            >
              <Contrast className='h-4 w-4' />
            </button>
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
              'w-full transition-all duration-300',
              // 遮罩态：模糊 + 低透明度，格线融为柔和纹理，明确传达"盘面未揭示"
              game.status === 'idle' && 'pointer-events-none opacity-30 blur-[3px]',
              highContrast && styles.hc,
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
              <p className='px-6 text-center text-xs text-slate-400'>点击后立即计时，按顺序找到 {isDesc ? `${count} → 1` : `1 → ${count}`}</p>
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
