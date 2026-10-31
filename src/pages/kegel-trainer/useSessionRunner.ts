import { useCallback, useEffect, useRef, useState } from 'react';
import type { Step } from './plan';

export type RunnerStatus = 'idle' | 'running' | 'paused' | 'done';

interface RunnerState {
  status: RunnerStatus;
  index: number;
  stepElapsed: number;
  totalElapsed: number;
}

const INITIAL: RunnerState = { status: 'idle', index: 0, stepElapsed: 0, totalElapsed: 0 };

/**
 * 按时间轴推进跟练。用 performance.now() 计时，暂停时冻结。
 * onStep 在每一步开始时调用（用来出声 / 震动）。
 */
export function useSessionRunner(steps: Step[], onStep: (step: Step, index: number) => void, onDone: () => void) {
  const [state, setState] = useState<RunnerState>(INITIAL);
  const offsets = useRef<number[]>([]);
  const startRef = useRef(0); // 运行起点（已扣除暂停时长）
  const pausedAt = useRef(0);
  const lastIndex = useRef(-1);
  const onStepRef = useRef(onStep);
  const onDoneRef = useRef(onDone);
  onStepRef.current = onStep;
  onDoneRef.current = onDone;

  // 每一步的起始时间
  offsets.current = steps.reduce<number[]>((acc, _s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + steps[i - 1].duration);
    return acc;
  }, []);
  const total = steps.reduce((sum, s) => sum + s.duration, 0);

  useEffect(() => {
    if (state.status !== 'running') return;
    let raf = 0;
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      if (elapsed >= total) {
        setState({ status: 'done', index: steps.length - 1, stepElapsed: 0, totalElapsed: total });
        onDoneRef.current();
        return;
      }
      let idx = lastIndex.current < 0 ? 0 : lastIndex.current;
      while (idx < steps.length - 1 && elapsed >= offsets.current[idx + 1]) idx++;
      if (idx !== lastIndex.current) {
        lastIndex.current = idx;
        onStepRef.current(steps[idx], idx);
      }
      setState((prev) => ({
        ...prev,
        index: idx,
        stepElapsed: elapsed - offsets.current[idx],
        totalElapsed: elapsed,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.status, steps, total]);

  const start = useCallback(() => {
    lastIndex.current = -1;
    startRef.current = performance.now();
    setState({ ...INITIAL, status: 'running' });
  }, []);

  const pause = useCallback(() => {
    pausedAt.current = performance.now();
    setState((p) => (p.status === 'running' ? { ...p, status: 'paused' } : p));
  }, []);

  const resume = useCallback(() => {
    startRef.current += performance.now() - pausedAt.current;
    setState((p) => (p.status === 'paused' ? { ...p, status: 'running' } : p));
  }, []);

  // 跳到下一节（慢收 → 快收 → 反向放松），仅运行中可用
  const skipSection = useCallback(() => {
    const curIdx = Math.max(lastIndex.current, 0);
    const cur = steps[curIdx];
    let next = curIdx + 1;
    while (next < steps.length && steps[next].section === cur.section) next++;
    const target = next >= steps.length ? total : offsets.current[next];
    startRef.current = performance.now() - target * 1000;
  }, [steps, total]);

  const reset = useCallback(() => {
    lastIndex.current = -1;
    setState(INITIAL);
  }, []);

  return { ...state, total, start, pause, resume, skipSection, reset };
}
