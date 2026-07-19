import { useCallback, useMemo, useRef, useState } from 'react';
import { range, shuffle } from '../schulte-table/utils';

// ===== 舒尔特对战：棋钟 + 对手指派目标 + 道具破坏 =====
export const BATTLE_SIZE = 7;
export const BATTLE_COUNT = BATTLE_SIZE * BATTLE_SIZE; // 49
export const START_LIFE_MS = 30000; // 每人 30 秒生命

export type Player = 0 | 1; // 0 = 蓝方(先找)，1 = 红方(先出题)
export type BattlePhase = 'lobby' | 'assign' | 'ready' | 'search' | 'over';

// 每人的道具使用情况：true = 已用掉
export interface ItemSet {
  fourColor: boolean;
  rotate: boolean;
  shuffle: boolean;
}
export interface ItemUse {
  fourColor: boolean;
  rotate: boolean;
  shuffle: boolean;
}

const freshItems = (): ItemSet => ({ fourColor: false, rotate: false, shuffle: false });
const initialPositions = () => shuffle(range(BATTLE_COUNT)); // index = 格位，value = 数字

export interface SchulteBattle {
  positions: number[];
  foundBy: Record<number, Player>;
  phase: BattlePhase;
  finder: Player; // 当前（即将/正在）寻找的人
  assigner: Player; // 出题方 = 对手
  target: number | null;
  lifeMs: [number, number]; // 已提交的剩余生命
  used: [ItemSet, ItemSet];
  sabotage: { fourColor: boolean; rotate: boolean }; // 本次寻找生效的视觉破坏
  searchStart: number | null; // performance.now()，寻找计时起点
  winner: Player | null;
  wrong: number | null;
  remaining: number[]; // 剩余未找到的数字
  foundCount: [number, number];
  // actions
  startMatch: () => void;
  assign: (target: number, use: ItemUse) => void;
  confirmReady: () => void;
  tapCell: (n: number) => void;
  expire: () => void; // 当前寻找方生命耗尽（由页面 rAF 触发）
  reset: () => void;
}

export function useSchulteBattle(): SchulteBattle {
  const [positions, setPositions] = useState<number[]>(initialPositions);
  const [foundBy, setFoundBy] = useState<Record<number, Player>>({});
  const [phase, setPhase] = useState<BattlePhase>('lobby');
  const [finder, setFinder] = useState<Player>(0);
  const [target, setTarget] = useState<number | null>(null);
  const [lifeMs, setLifeMs] = useState<[number, number]>([START_LIFE_MS, START_LIFE_MS]);
  const [used, setUsed] = useState<[ItemSet, ItemSet]>([freshItems(), freshItems()]);
  const [sabotage, setSabotage] = useState({ fourColor: false, rotate: false });
  const [searchStart, setSearchStart] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const assigner = (1 - finder) as Player;
  const remaining = useMemo(() => range(BATTLE_COUNT).filter((n) => foundBy[n] === undefined), [foundBy]);
  const foundCount = useMemo<[number, number]>(() => {
    let a = 0;
    let b = 0;
    for (const k in foundBy) {
      if (foundBy[k] === 0) a++;
      else b++;
    }
    return [a, b];
  }, [foundBy]);

  const flashWrong = useCallback((n: number) => {
    setWrong(n);
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    wrongTimer.current = setTimeout(() => setWrong(null), 320);
  }, []);

  const reset = useCallback(() => {
    setPositions(initialPositions());
    setFoundBy({});
    setPhase('lobby');
    setFinder(0);
    setTarget(null);
    setLifeMs([START_LIFE_MS, START_LIFE_MS]);
    setUsed([freshItems(), freshItems()]);
    setSabotage({ fourColor: false, rotate: false });
    setSearchStart(null);
    setWinner(null);
  }, []);

  // 红方(1)先给蓝方(0)出题
  const startMatch = useCallback(() => {
    setFinder(0);
    setPhase('assign');
  }, []);

  const assign = useCallback(
    (t: number, use: ItemUse) => {
      const a = (1 - finder) as Player; // 出题方
      setUsed((u) => {
        const copy: [ItemSet, ItemSet] = [{ ...u[0] }, { ...u[1] }];
        if (use.fourColor) copy[a].fourColor = true;
        if (use.rotate) copy[a].rotate = true;
        if (use.shuffle) copy[a].shuffle = true;
        return copy;
      });
      if (use.shuffle) {
        // 把「未找到的数字」在它们所处的格位之间重新打乱
        setPositions((pos) => {
          const slots: number[] = [];
          const nums: number[] = [];
          pos.forEach((num, i) => {
            if (foundBy[num] === undefined) {
              slots.push(i);
              nums.push(num);
            }
          });
          const mixed = shuffle(nums);
          const next = [...pos];
          slots.forEach((slot, k) => {
            next[slot] = mixed[k];
          });
          return next;
        });
      }
      setSabotage({ fourColor: use.fourColor, rotate: use.rotate });
      setTarget(t);
      setPhase('ready');
    },
    [finder, foundBy],
  );

  const confirmReady = useCallback(() => {
    setSearchStart(performance.now());
    setPhase('search');
  }, []);

  const tapCell = useCallback(
    (n: number) => {
      if (phase !== 'search') return;
      if (foundBy[n] !== undefined) return; // 已找到的忽略
      if (n !== target) {
        flashWrong(n); // 点错：只有时间在流逝，无额外惩罚
        return;
      }
      const elapsed = performance.now() - (searchStart ?? performance.now());
      const finderLife = Math.max(0, lifeMs[finder] - elapsed);
      const nextLife: [number, number] = finder === 0 ? [finderLife, lifeMs[1]] : [lifeMs[0], finderLife];
      const nextFound = { ...foundBy, [n]: finder };

      setLifeMs(nextLife);
      setFoundBy(nextFound);
      setTarget(null);
      setSabotage({ fourColor: false, rotate: false });
      setSearchStart(null);

      if (finderLife <= 0) {
        setWinner((1 - finder) as Player);
        setPhase('over');
      } else if (Object.keys(nextFound).length >= BATTLE_COUNT) {
        setWinner(nextLife[0] >= nextLife[1] ? 0 : 1); // 全找完：剩命多者胜
        setPhase('over');
      } else {
        setFinder((f) => (1 - f) as Player); // 换手：刚找完的人去给对手出题
        setPhase('assign');
      }
    },
    [phase, foundBy, target, searchStart, lifeMs, finder, flashWrong],
  );

  const expire = useCallback(() => {
    setLifeMs((L) => {
      const next: [number, number] = [L[0], L[1]];
      next[finder] = 0;
      return next;
    });
    setSearchStart(null);
    setWinner((1 - finder) as Player);
    setPhase('over');
  }, [finder]);

  return {
    positions,
    foundBy,
    phase,
    finder,
    assigner,
    target,
    lifeMs,
    used,
    sabotage,
    searchStart,
    winner,
    wrong,
    remaining,
    foundCount,
    startMatch,
    assign,
    confirmReady,
    tapCell,
    expire,
    reset,
  };
}
