import { useCallback, useEffect, useRef, useState } from 'react';
import { range, shuffle } from './utils';

export type GameStatus = 'idle' | 'playing' | 'finished';

export interface FindRecord {
  number: number;
  splitMs: number; // 距离上一个数字被找到的用时（1 号是从开始到点中的用时）
}

export interface SchulteGame {
  cells: number[]; // 打乱后的数字序列（视觉位置由各棋盘自行映射）
  status: GameStatus;
  nextTarget: number; // 当前需要点击的数字
  records: FindRecord[];
  errors: number;
  wrong: number | null; // 正在闪红的错误数字
  totalMs: number; // 完成后的总用时
  isFound: (n: number) => boolean;
  start: () => void; // 揭示盘面并立即开始计时
  clickCell: (n: number) => void;
  reset: () => void;
  startTime: number | null; // performance.now() 起点，供计时器组件使用
}

// 标准舒尔特规则：开始前数字不可见，按下开始的瞬间揭示盘面并起表。
// 这样寻找首个目标的耗时同样被计入，玩家无法先扫盘记位再起跑。
// descending = true 为倒式舒尔特：从 count 倒数到 1。
export function useSchulteGame(count: number, resetKey: string, descending = false): SchulteGame {
  const firstTarget = descending ? count : 1;
  const lastTarget = descending ? 1 : count;
  const [cells, setCells] = useState<number[]>(() => shuffle(range(count)));
  const [status, setStatus] = useState<GameStatus>('idle');
  const [nextTarget, setNextTarget] = useState(firstTarget);
  const [records, setRecords] = useState<FindRecord[]>([]);
  const [errors, setErrors] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [totalMs, setTotalMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const lastRef = useRef(0);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setCells(shuffle(range(count)));
    setStatus('idle');
    setNextTarget(firstTarget);
    setRecords([]);
    setErrors(0);
    setWrong(null);
    setTotalMs(0);
    setStartTime(null);
    lastRef.current = 0;
  }, [count, firstTarget]);

  // 数量或模式变化时重置（resetKey 编码了 mode 与 size）
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => () => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
  }, []);

  const flashWrong = useCallback((n: number) => {
    setWrong(n);
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    wrongTimer.current = setTimeout(() => setWrong(null), 320);
  }, []);

  const start = useCallback(() => {
    if (status !== 'idle') return;
    const now = performance.now();
    setStartTime(now);
    lastRef.current = now;
    setStatus('playing');
  }, [status]);

  const clickCell = useCallback(
    (n: number) => {
      // 未开始时盘面不可见，点击无效
      if (status !== 'playing') return;
      const now = performance.now();

      const found = descending ? n > nextTarget : n < nextTarget;
      if (n === nextTarget) {
        setRecords((r) => [...r, { number: n, splitMs: now - lastRef.current }]);
        lastRef.current = now;
        if (n === lastTarget) {
          setTotalMs(now - (startTime ?? now));
          setNextTarget(descending ? 0 : count + 1); // 全部找到
          setStatus('finished');
        } else {
          setNextTarget(descending ? n - 1 : n + 1);
        }
      } else if (!found) {
        // 点错（点已找到的数字则忽略）
        flashWrong(n);
        setErrors((e) => e + 1);
      }
    },
    [status, nextTarget, lastTarget, count, descending, startTime, flashWrong],
  );

  const isFound = useCallback((n: number) => (descending ? n > nextTarget : n < nextTarget), [nextTarget, descending]);

  return {
    cells,
    status,
    nextTarget,
    records,
    errors,
    wrong,
    totalMs,
    isFound,
    start,
    clickCell,
    reset,
    startTime,
  };
}
