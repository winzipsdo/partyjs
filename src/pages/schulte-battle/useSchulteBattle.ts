import { useCallback, useMemo, useRef, useState } from 'react';
import { range, shuffle } from '../schulte-table/utils';

// ===== 舒尔特对战：棋钟 + 对手指派目标 + 道具破坏 =====
export const BATTLE_SIZE = 7;
export const BATTLE_COUNT = BATTLE_SIZE * BATTLE_SIZE; // 49
export const START_LIFE_MS = 30000; // 每人 30 秒生命
export const SHUFFLE_CHARGES = 3; // 洗牌次数
export const DEBUFF_ROUNDS = 3; // 四色/旋转持续的（对手）寻找次数

export type Player = 0 | 1; // 0 = 蓝方(先找)，1 = 红方(先出题)
export type BattlePhase = 'lobby' | 'assign' | 'ready' | 'search' | 'over';

// 每人手里的道具：四色/旋转各一次（布尔=已用），洗牌 3 次消耗品
export interface ItemSet {
  fourColor: boolean;
  rotate: boolean;
  shuffleLeft: number;
}
export interface ItemUse {
  fourColor: boolean;
  rotate: boolean;
  shuffle: boolean;
}
// 施加在某玩家身上、按其寻找次数递减的 debuff
export interface Debuff {
  fourColor: number;
  rotate: number;
}

const freshItems = (): ItemSet => ({ fourColor: false, rotate: false, shuffleLeft: SHUFFLE_CHARGES });
const freshDebuff = (): Debuff => ({ fourColor: 0, rotate: 0 });
const initialPositions = () => shuffle(range(BATTLE_COUNT)); // index = 格位，value = 数字

export interface SchulteBattle {
  positions: number[];
  foundBy: Record<number, Player>;
  phase: BattlePhase;
  finder: Player;
  assigner: Player;
  target: number | null;
  lifeMs: [number, number];
  used: [ItemSet, ItemSet]; // 各自的道具库存
  debuff: [Debuff, Debuff]; // 各自身上残留的 debuff（按其寻找次数递减）
  sabotage: { fourColor: boolean; rotate: boolean }; // 当前寻找方生效的视觉破坏
  lastShuffle: boolean; // 本回合出题方是否刚洗过牌（供就绪面板提示）
  searchStart: number | null;
  winner: Player | null;
  wrong: number | null;
  remaining: number[];
  foundCount: [number, number];
  startMatch: () => void;
  assign: (target: number, use: ItemUse) => void;
  confirmReady: () => void;
  tapCell: (n: number) => void;
  expire: () => void;
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
  const [debuff, setDebuff] = useState<[Debuff, Debuff]>([freshDebuff(), freshDebuff()]);
  const [lastShuffle, setLastShuffle] = useState(false);
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

  // 当前寻找方生效的破坏，由「其身上的 debuff」推导 —— 天然不会影响施法者自己
  const sabotage = useMemo(
    () => ({ fourColor: debuff[finder].fourColor > 0, rotate: debuff[finder].rotate > 0 }),
    [debuff, finder],
  );

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
    setDebuff([freshDebuff(), freshDebuff()]);
    setLastShuffle(false);
    setSearchStart(null);
    setWinner(null);
  }, []);

  const startMatch = useCallback(() => {
    setFinder(0); // 红方(1)先给蓝方(0)出题
    setPhase('assign');
  }, []);

  const assign = useCallback(
    (t: number, use: ItemUse) => {
      const a = (1 - finder) as Player; // 出题方
      const v = finder; // 受害方 = 即将寻找的人
      setUsed((u) => {
        const c: [ItemSet, ItemSet] = [{ ...u[0] }, { ...u[1] }];
        if (use.fourColor && !c[a].fourColor) c[a].fourColor = true;
        if (use.rotate && !c[a].rotate) c[a].rotate = true;
        if (use.shuffle && c[a].shuffleLeft > 0) c[a].shuffleLeft -= 1;
        return c;
      });
      // 四色/旋转：给受害方挂上 3 回合 debuff（覆盖为满，不叠加超过 3）
      if (use.fourColor || use.rotate) {
        setDebuff((d) => {
          const nd: [Debuff, Debuff] = [{ ...d[0] }, { ...d[1] }];
          if (use.fourColor) nd[v].fourColor = DEBUFF_ROUNDS;
          if (use.rotate) nd[v].rotate = DEBUFF_ROUNDS;
          return nd;
        });
      }
      // 洗牌：立即把未找到的数字在其格位间重排
      if (use.shuffle) {
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
      setLastShuffle(!!use.shuffle);
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
      if (foundBy[n] !== undefined) return;
      if (n !== target) {
        flashWrong(n);
        return;
      }
      const elapsed = performance.now() - (searchStart ?? performance.now());
      const finderLife = Math.max(0, lifeMs[finder] - elapsed);
      const nextLife: [number, number] = finder === 0 ? [finderLife, lifeMs[1]] : [lifeMs[0], finderLife];
      const nextFound = { ...foundBy, [n]: finder };

      setLifeMs(nextLife);
      setFoundBy(nextFound);
      setTarget(null);
      setSearchStart(null);
      // 本次寻找消耗掉寻找方身上一回合 debuff
      setDebuff((d) => {
        const nd: [Debuff, Debuff] = [{ ...d[0] }, { ...d[1] }];
        nd[finder].fourColor = Math.max(0, nd[finder].fourColor - 1);
        nd[finder].rotate = Math.max(0, nd[finder].rotate - 1);
        return nd;
      });

      if (finderLife <= 0) {
        setWinner((1 - finder) as Player);
        setPhase('over');
      } else if (Object.keys(nextFound).length >= BATTLE_COUNT) {
        setWinner(nextLife[0] >= nextLife[1] ? 0 : 1);
        setPhase('over');
      } else {
        setFinder((f) => (1 - f) as Player);
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
    debuff,
    sabotage,
    lastShuffle,
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
