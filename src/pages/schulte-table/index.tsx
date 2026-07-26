import { useEffect, useMemo, useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import { createStorageKey } from '@/constants/storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDownUp, ChevronDown, RotateCcw, Target } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSchulteGame } from './useSchulteGame';
import { CONCRETE_MODES, FOUR_COLORS, GameMode, MODE_META, difficultyFactor, formatSeconds, sizesForMode } from './utils';
import { StandardBoard } from './components/StandardBoard';
import { HoneycombBoard } from './components/HoneycombBoard';
import { DynamicBoard } from './components/DynamicBoard';
import { TriangleBoard } from './components/TriangleBoard';
import { ScatterBoard } from './components/ScatterBoard';
import { TimerDisplay } from './components/TimerDisplay';
import { StatsDialog } from './components/StatsDialog';
import styles from './styles.module.css';

// 首屏只露出标准/随机两个入口，其余形态收进「更多」弹出层
const PRIMARY_MODES: GameMode[] = ['standard', 'random'];
const MORE_MODES: GameMode[] = ['honeycomb', 'dynamic', 'triangle', 'scatter'];

// 随机模式抽签：形态、该形态下合法的尺寸、方向、四色开关、（转盘时）地狱开关
function randomDraw() {
  const form = CONCRETE_MODES[Math.floor(Math.random() * CONCRETE_MODES.length)];
  const sizes = sizesForMode(form);
  return {
    form,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    descending: Math.random() < 0.5,
    fourColor: Math.random() < 0.5,
    hell: form === 'dynamic' && Math.random() < 0.5,
  };
}

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
  const [descending, setDescending] = useLocalStorageState<boolean>(
    createStorageKey('schulte-descending'),
    { defaultValue: false },
  );
  const [hellMode, setHellMode] = useLocalStorageState<boolean>(createStorageKey('schulte-hell'), {
    defaultValue: false,
  });
  const [fourColor, setFourColor] = useLocalStorageState<boolean>(createStorageKey('schulte-four-color'), {
    defaultValue: false,
  });

  const activeMode = mode ?? 'standard';
  const isRandomMode = activeMode === 'random';
  // 随机元模式：每局抽「形态 + 尺寸 + 四色 + 地狱」的完整组合
  const [draw, setDraw] = useState(randomDraw);
  const [moreOpen, setMoreOpen] = useState(false);
  const redraw = () => setDraw(randomDraw());

  const boardMode = isRandomMode ? draw.form : activeMode; // 实际渲染的盘面形态
  // 各模式可选尺寸不同；存档里不可用的尺寸回退到该模式最小档
  const sizeOptions = sizesForMode(activeMode);
  const storedSize = size ?? 5;
  const activeSize = sizeOptions.includes(storedSize) ? storedSize : sizeOptions[0];
  const boardSize = isRandomMode ? draw.size : activeSize;
  const isDesc = isRandomMode ? draw.descending : !!descending;
  const isHell = isRandomMode ? draw.hell : activeMode === 'dynamic' && !!hellMode;
  const isFourColor = isRandomMode ? draw.fourColor : !!fourColor;
  const count = boardSize * boardSize;
  const factor = difficultyFactor(boardMode, isHell); // 评级按实际盘面折算
  // 成绩记入实际组合名下：随机抽到的组合与手动选择的同一组合共用记录
  const bestKey = `${boardMode}-${boardSize}${isDesc ? '-desc' : ''}${isHell ? '-hell' : ''}${isFourColor ? '-4c' : ''}`;

  const game = useSchulteGame(count, bestKey, isDesc);

  // 进入随机模式时抽一次（之后由重置/再来一局触发 redraw）
  useEffect(() => {
    if (isRandomMode) redraw();
  }, [isRandomMode]);

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

  // 四色：每个数字按其在本局洗牌序列中的位置取色（每局重新分配）
  const numColor = useMemo(() => {
    if (!isFourColor) return undefined;
    return (n: number) => FOUR_COLORS[game.cells.indexOf(n) % FOUR_COLORS.length];
  }, [isFourColor, game.cells]);

  const board = useMemo(() => {
    switch (boardMode) {
      case 'honeycomb':
        return <HoneycombBoard game={game} size={boardSize} numColor={numColor} />;
      case 'dynamic':
        return <DynamicBoard game={game} hell={isHell} numColor={numColor} />;
      case 'triangle':
        return <TriangleBoard game={game} size={boardSize} numColor={numColor} />;
      case 'scatter':
        return <ScatterBoard game={game} numColor={numColor} />;
      default:
        return <StandardBoard game={game} size={boardSize} numColor={numColor} />;
    }
  }, [boardMode, boardSize, game, isHell, numColor]);

  const handleReplay = () => {
    setStatsOpen(false);
    if (isRandomMode) redraw(); // 组合变化会经由 resetKey 自动重置；组合未变时下面的 reset 负责洗牌
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
          <p className='hidden text-sm text-slate-500 sm:block'>
            {isRandomMode
              ? '随机盲盒：形态与玩法开局才揭晓'
              : `${isDesc ? `倒式：从 ${count} 数回 1` : `按顺序从 1 找到 ${count}`}，训练你的专注力`}
          </p>
        </div>

        {/* 配置区 */}
        <div className='mt-2 flex shrink-0 flex-col gap-2 sm:mt-3 sm:gap-3'>
          {/* 模式：标准 / 随机 + 更多形态弹出层 */}
          <div className='flex justify-center gap-1.5 sm:gap-2'>
            {PRIMARY_MODES.map((m) => {
              const meta = MODE_META[m];
              const active = m === activeMode;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 max-w-[9rem] rounded-xl border px-1 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm',
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
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'flex flex-1 max-w-[9rem] items-center justify-center gap-1 rounded-xl border px-1 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm',
                    MORE_MODES.includes(activeMode)
                      ? 'border-sky-400/60 bg-sky-400/15 text-sky-200 shadow-[0_0_16px_-4px_rgba(56,189,248,0.5)]'
                      : 'glass text-slate-400 hover:text-slate-200',
                  )}
                >
                  {MORE_MODES.includes(activeMode) ? (
                    <>
                      <span>{MODE_META[activeMode].emoji}</span>
                      {MODE_META[activeMode].label}
                    </>
                  ) : (
                    '更多'
                  )}
                  <ChevronDown className='h-3.5 w-3.5' />
                </button>
              </PopoverTrigger>
              <PopoverContent align='end' className='w-40 p-1.5'>
                <div className='grid gap-1'>
                  {MORE_MODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setMoreOpen(false);
                      }}
                      title={MODE_META[m].desc}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeMode === m ? 'bg-sky-400/15 text-sky-200' : 'text-slate-300 hover:bg-white/[0.06]',
                      )}
                    >
                      <span className='inline-block w-5 text-center'>{MODE_META[m].emoji}</span>
                      {MODE_META[m].label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 尺寸与开关：随机模式下全部由抽签决定，不显示 */}
          {!isRandomMode && (
          <div className='flex items-center justify-center gap-1.5'>
            <span className='mr-1 text-xs text-slate-400'>难度</span>
            {sizeOptions.map((s) => {
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
              onClick={() => setFourColor(!isFourColor)}
              title='数字四色：颜色噪声干扰，搜索更考验专注'
              aria-pressed={isFourColor}
              className={cn(
                'flex h-8 w-9 items-center justify-center rounded-lg text-sm transition-all sm:h-9',
                isFourColor
                  ? 'border border-fuchsia-400/50 bg-fuchsia-500/20 shadow-[0_0_14px_-2px_rgba(232,121,249,0.6)]'
                  : 'glass opacity-60 grayscale hover:opacity-100 hover:grayscale-0',
              )}
            >
              🎨
            </button>
            {activeMode === 'dynamic' && (
              <button
                onClick={() => setHellMode(!hellMode)}
                title='地狱模式：数字也在自转翻滚'
                aria-pressed={isHell}
                className={cn(
                  'flex h-8 items-center gap-0.5 rounded-lg px-2 text-[11px] font-bold transition-all sm:h-9',
                  isHell
                    ? 'border border-red-400/50 bg-red-500/20 text-red-200 shadow-[0_0_14px_-2px_rgba(248,113,113,0.6)]'
                    : 'glass text-slate-400 hover:text-slate-200',
                )}
              >
                🔥地狱
              </button>
            )}
          </div>
          )}
        </div>

        {/* 状态栏：计时器 + 目标 + 重置 */}
        <div className='mt-2 flex shrink-0 items-center justify-between gap-3 px-1 sm:mt-3'>
          <div className='min-w-0'>
            <TimerDisplay status={game.status} startTime={game.startTime} totalMs={game.totalMs} count={count} factor={factor} />
            {bestMs != null && <div className='text-xs text-slate-400'>最佳 {formatSeconds(bestMs)}</div>}
          </div>

          <div className='flex items-center gap-2'>
            <div className='glass flex items-center gap-1.5 rounded-full px-3 py-1.5'>
              <Target className='h-4 w-4 text-slate-400' />
              <span className='hidden text-xs text-slate-500 sm:inline'>下一个</span>
              <span className='min-w-[1.5rem] text-center text-lg font-bold tabular-nums text-white'>
                {game.status === 'finished' ? '✓' : isRandomMode && game.status === 'idle' ? '?' : game.nextTarget}
              </span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (isRandomMode) redraw();
                game.reset();
              }}
            >
              <RotateCcw className='h-4 w-4' />
              <span className='hidden sm:inline'>重置</span>
            </Button>
          </div>
        </div>

        {/* 棋盘：占据剩余空间并居中；开始前数字不可见（标准舒尔特规则） */}
        <div className='relative flex min-h-0 flex-1 items-center justify-center py-2'>
          <div
            className={cn(
              'w-full',
              // 遮罩态各模式一致（随机模式另外整块不挂载），避免切换模式时
              // 透明度从 1 跳到 0.3 被 transition 拉成一段「先亮后暗」的闪白。
              // 过渡只在非 idle 时挂载，于是「进入遮罩」瞬间完成、「揭晓」才有淡入。
              game.status === 'idle'
                ? 'pointer-events-none opacity-30 blur-[3px]'
                : 'transition-all duration-300',
              styles.hc, // 高对比度亮底深字，默认且唯一的棋盘配色
            )}
          >
            {/* 随机模式 idle 时整块不挂载：靠透明度隐藏会在转场的 300ms 里
                泄露新盘面的轮廓（上一局结束→再来一局时先显示再淡出） */}
            {isRandomMode && game.status === 'idle' ? null : board}
          </div>
          {game.status === 'idle' && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3'>
              {isRandomMode && <div className='mb-1 text-6xl drop-shadow-[0_4px_16px_rgba(56,189,248,0.35)]'>🎲</div>}
              <button
                onClick={game.start}
                className='glass rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-[0_0_28px_-6px_rgba(56,189,248,0.55)] transition-all hover:scale-105 hover:bg-white/10 active:scale-95'
              >
                ▶ 开始挑战
              </button>
              <p className='px-6 text-center text-xs text-slate-400'>
                {isRandomMode
                  ? '盘面、尺寸与玩法开局才揭晓 — 点击后立即计时'
                  : `点击后立即计时，按顺序找到 ${isDesc ? `${count} → 1` : `1 → ${count}`}`}
              </p>
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
        count={count}
        factor={factor}
        bestMs={bestMs}
        isNewBest={isNewBest}
        onReplay={handleReplay}
      />
    </div>
  );
}
