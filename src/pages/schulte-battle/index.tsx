import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatSeconds } from '../schulte-table/utils';
import { BattleBoard } from './BattleBoard';
import { range } from '../schulte-table/utils';
import { BATTLE_COUNT, ItemUse, Player, START_LIFE_MS, useSchulteBattle } from './useSchulteBattle';
import styles from './styles.module.css';

const PLAYERS = [
  { name: '蓝方', color: '#3b82f6' },
  { name: '红方', color: '#f43f5e' },
] as const;

const ITEMS: { key: keyof ItemUse; emoji: string; label: string }[] = [
  { key: 'fourColor', emoji: '🎨', label: '四色' },
  { key: 'rotate', emoji: '🔄', label: '旋转' },
  { key: 'shuffle', emoji: '🔀', label: '洗牌' },
];

export function SchulteBattlePage() {
  const battle = useSchulteBattle();
  const { phase, finder, assigner, lifeMs, searchStart } = battle;

  // 页面滚动锁（同 solo：移动端上下滑动会吞掉点击）
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = { h: html.style.overflow, b: body.style.overflow, o: body.style.overscrollBehavior };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    return () => {
      html.style.overflow = prev.h;
      body.style.overflow = prev.b;
      body.style.overscrollBehavior = prev.o;
    };
  }, []);

  // rAF：寻找期间实时扣当前寻找方的生命；归零则判负
  const [, setTick] = useState(0);
  useEffect(() => {
    if (phase !== 'search' || searchStart == null) return;
    let raf = 0;
    const loop = () => {
      if (lifeMs[finder] - (performance.now() - searchStart) <= 0) {
        battle.expire();
        return;
      }
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, searchStart, finder, lifeMs, battle]);

  // 实时生命（渲染期直接计算，靠上面的 tick 每帧驱动刷新）
  let liveLife: [number, number] = lifeMs;
  if (phase === 'search' && searchStart != null) {
    const live = Math.max(0, lifeMs[finder] - (performance.now() - searchStart));
    liveLife = finder === 0 ? [live, lifeMs[1]] : [lifeMs[0], live];
  }

  return (
    <div
      className='aurora relative flex h-[calc(100dvh-54px)] touch-none select-none flex-col overflow-hidden'
      style={{ '--ga': '349 90% 60%', '--gb': '217 90% 60%' } as React.CSSProperties}
    >
      <div className='mx-auto flex w-full max-w-lg flex-1 flex-col px-3 py-2'>
        {/* 红方 HUD（上） */}
        <PlayerHud player={1} life={liveLife[1]} active={finder === 1 && phase === 'search'} used={battle.used[1]} />

        {/* 中部：目标 + 棋盘 */}
        <div className='relative flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-1'>
          {phase === 'search' && battle.target != null && (
            <div className='text-center'>
              <span className='text-xs text-slate-400'>{PLAYERS[finder].name}要找</span>
              <div className='text-3xl font-black leading-none' style={{ color: PLAYERS[finder].color }}>
                {battle.target}
              </div>
            </div>
          )}
          <BattleBoard
            positions={battle.positions}
            foundBy={battle.foundBy}
            phase={phase}
            sabotage={battle.sabotage}
            wrong={battle.wrong}
            onTap={battle.tapCell}
          />
          <div className='text-xs text-slate-500'>剩 {battle.remaining.length} 个</div>
        </div>

        {/* 蓝方 HUD（下） */}
        <PlayerHud player={0} life={liveLife[0]} active={finder === 0 && phase === 'search'} used={battle.used[0]} />
      </div>

      {phase === 'lobby' && <LobbyOverlay onStart={battle.startMatch} />}
      {phase === 'assign' && (
        <AssignOverlay
          assigner={assigner}
          finder={finder}
          foundBy={battle.foundBy}
          used={battle.used[assigner]}
          onAssign={battle.assign}
        />
      )}
      {phase === 'ready' && (
        <ReadyOverlay finder={finder} sabotage={battle.sabotage} onReady={battle.confirmReady} />
      )}
      {phase === 'over' && battle.winner != null && (
        <OverOverlay
          winner={battle.winner}
          lifeMs={battle.lifeMs}
          foundCount={battle.foundCount}
          onReplay={() => {
            battle.reset();
            battle.startMatch();
          }}
        />
      )}
    </div>
  );
}

// ===== 玩家 HUD：名字 + 道具 + 生命条 =====
function PlayerHud({
  player,
  life,
  active,
  used,
}: {
  player: Player;
  life: number;
  active: boolean;
  used: { fourColor: boolean; rotate: boolean; shuffle: boolean };
}) {
  const meta = PLAYERS[player];
  const pct = Math.max(0, Math.min(100, (life / START_LIFE_MS) * 100));
  return (
    <div
      className={cn(
        'shrink-0 rounded-xl border px-3 py-2 transition-all',
        active ? 'border-white/25 bg-white/[0.06]' : 'border-white/[0.06]',
      )}
      style={active ? { boxShadow: `0 0 20px -6px ${meta.color}` } : undefined}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='inline-block h-3 w-3 rounded-full' style={{ background: meta.color }} />
          <span className='text-sm font-bold text-slate-100'>{meta.name}</span>
          {active && <span className='animate-pulse text-[11px] text-slate-400'>寻找中…</span>}
        </div>
        <div className='flex items-center gap-1.5'>
          {ITEMS.map((it) => (
            <span key={it.key} className={cn('text-sm transition-opacity', used[it.key] ? 'opacity-20 grayscale' : 'opacity-90')}>
              {it.emoji}
            </span>
          ))}
          <span className='ml-1 w-14 text-right font-mono text-sm font-bold tabular-nums' style={{ color: meta.color }}>
            {formatSeconds(life)}
          </span>
        </div>
      </div>
      <div className={cn('mt-1.5', styles.lifeTrack)}>
        <div className={styles.lifeFill} style={{ width: `${pct}%`, background: meta.color }} />
      </div>
    </div>
  );
}

// ===== 大厅 =====
function LobbyOverlay({ onStart }: { onStart: () => void }) {
  return (
    <Overlay>
      <div className='text-5xl'>⚔️</div>
      <h1 className='text-2xl font-bold text-white'>舒尔特对战</h1>
      <ul className='max-w-xs space-y-1.5 text-left text-sm text-slate-300'>
        <li>· 每人 30 秒生命，轮到你找时你的时钟倒扣</li>
        <li>· 对手指定你要找的数字，找到才停表</li>
        <li>· 找完你再给对手出题，如此轮流</li>
        <li>· 🎨四色 / 🔄旋转 / 🔀洗牌 各一次，出题时甩给对手</li>
        <li>· 谁先耗光 30 秒谁输</li>
      </ul>
      <p className='text-xs text-slate-500'>红方先出题，蓝方先找</p>
      <BigButton color='#3b82f6' onClick={onStart}>
        开始对战
      </BigButton>
    </Overlay>
  );
}

// ===== 出题面板 =====
function AssignOverlay({
  assigner,
  finder,
  foundBy,
  used,
  onAssign,
}: {
  assigner: Player;
  finder: Player;
  foundBy: Record<number, Player>;
  used: { fourColor: boolean; rotate: boolean; shuffle: boolean };
  onAssign: (target: number, use: ItemUse) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [staged, setStaged] = useState<ItemUse>({ fourColor: false, rotate: false, shuffle: false });
  const aMeta = PLAYERS[assigner];
  const fMeta = PLAYERS[finder];

  return (
    <Overlay>
      <div className='text-sm'>
        <span style={{ color: aMeta.color }} className='font-bold'>
          {aMeta.name}
        </span>{' '}
        出题给{' '}
        <span style={{ color: fMeta.color }} className='font-bold'>
          {fMeta.name}
        </span>
      </div>
      <div className='text-xs text-slate-400'>选一个数字（凭记忆挑个刁钻的位置）</div>

      {/* 始终 7×7 全盘，位置固定；已被找到的显示为占领态、不可选 */}
      <div className='grid grid-cols-7 gap-1.5 px-0.5'>
        {range(BATTLE_COUNT).map((n) => {
          const owner = foundBy[n];
          if (owner !== undefined) {
            return (
              <div
                key={n}
                className={cn(styles.chip, styles.chipTaken, owner === 0 ? styles.chipTaken0 : styles.chipTaken1)}
              >
                {n}
              </div>
            );
          }
          return (
            <button key={n} onClick={() => setSel(n)} className={cn(styles.chip, sel === n && styles.chipSelected)}>
              {n}
            </button>
          );
        })}
      </div>

      <div className='flex items-center justify-center gap-2'>
        {ITEMS.map((it) => {
          const spent = used[it.key];
          const on = staged[it.key];
          return (
            <button
              key={it.key}
              disabled={spent}
              onClick={() => setStaged((s) => ({ ...s, [it.key]: !s[it.key] }))}
              className={cn(
                'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                spent
                  ? 'cursor-not-allowed border-white/5 text-slate-600 opacity-40'
                  : on
                    ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100 shadow-[0_0_12px_-3px_rgba(232,121,249,0.7)]'
                    : 'border-white/10 text-slate-300 hover:bg-white/[0.06]',
              )}
            >
              {it.emoji} {it.label}
            </button>
          );
        })}
      </div>

      <BigButton color={fMeta.color} disabled={sel == null} onClick={() => sel != null && onAssign(sel, staged)}>
        {sel == null ? '先选一个数字' : `确认出题：找 ${sel}`}
      </BigButton>
    </Overlay>
  );
}

// ===== 准备 =====
function ReadyOverlay({
  finder,
  sabotage,
  onReady,
}: {
  finder: Player;
  sabotage: { fourColor: boolean; rotate: boolean };
  onReady: () => void;
}) {
  const meta = PLAYERS[finder];
  const hasSab = sabotage.fourColor || sabotage.rotate;
  return (
    <Overlay>
      <div className='text-lg font-bold' style={{ color: meta.color }}>
        轮到 {meta.name}
      </div>
      <p className='text-sm text-slate-300'>点「开始」后立即计时并亮题</p>
      {hasSab && (
        <div className='flex items-center gap-2 text-sm text-fuchsia-200'>
          对手甩来：
          {sabotage.fourColor && <span>🎨四色</span>}
          {sabotage.rotate && <span>🔄旋转</span>}
        </div>
      )}
      <BigButton color={meta.color} onClick={onReady}>
        ▶ 开始
      </BigButton>
    </Overlay>
  );
}

// ===== 结算 =====
function OverOverlay({
  winner,
  lifeMs,
  foundCount,
  onReplay,
}: {
  winner: Player;
  lifeMs: [number, number];
  foundCount: [number, number];
  onReplay: () => void;
}) {
  const meta = PLAYERS[winner];
  return (
    <Overlay>
      <div className='text-5xl'>🏆</div>
      <div className='text-2xl font-black' style={{ color: meta.color, textShadow: `0 0 26px ${meta.color}66` }}>
        {meta.name} 获胜！
      </div>
      <div className='grid w-full max-w-xs grid-cols-2 gap-2'>
        {([0, 1] as Player[]).map((p) => (
          <div
            key={p}
            className={cn('rounded-lg border px-3 py-2 text-center', p === winner ? 'border-white/25' : 'border-white/10')}
          >
            <div className='text-sm font-bold' style={{ color: PLAYERS[p].color }}>
              {PLAYERS[p].name}
            </div>
            <div className='font-mono text-lg font-bold tabular-nums text-slate-100'>{formatSeconds(lifeMs[p])}</div>
            <div className='text-[11px] text-slate-400'>剩余生命 · 找到 {foundCount[p]} 个</div>
          </div>
        ))}
      </div>
      <BigButton color={meta.color} onClick={onReplay}>
        再来一局
      </BigButton>
    </Overlay>
  );
}

// ===== 通用碎片 =====
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm'>
      <div className='glass flex w-full max-w-md flex-col items-center gap-3 rounded-2xl p-5 text-center'>{children}</div>
    </div>
  );
}

function BigButton({
  children,
  color,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  color: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'mt-1 w-full rounded-xl px-6 py-3 text-base font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      )}
      style={{ background: color, boxShadow: disabled ? undefined : `0 0 24px -6px ${color}` }}
    >
      {children}
    </button>
  );
}
