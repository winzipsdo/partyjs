// 舒尔特方格工具函数

export type GameMode = 'standard' | 'honeycomb' | 'dynamic';

export const MODE_META: Record<GameMode, { label: string; emoji: string; desc: string }> = {
  standard: { label: '标准', emoji: '🔢', desc: '经典方格，从 1 数到底' },
  honeycomb: { label: '蜂窝', emoji: '⬡', desc: '六边形蜂巢排列' },
  dynamic: { label: '转盘', emoji: '🌀', desc: '同心圆环缓慢旋转' },
};

export const SIZE_OPTIONS = [5, 6, 7] as const;

// 生成 1..n 的数组
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

// Fisher-Yates 洗牌
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 计时器颜色：随用时增加由绿 → 黄 → 红（HSL 色相插值，天然经过黄色）
// budget 依据格子数量估算一个"理想用时"，越接近/超过越偏红
export function timerColor(elapsedMs: number, count: number): string {
  const budgetMs = count * 1500; // 约每格 1.5s 的舒适区
  const frac = clamp(elapsedMs / (budgetMs * 1.6), 0, 1);
  const hue = 145 - 145 * frac; // 145°(绿) → 0°(红)，中途经过黄
  return `hsl(${hue.toFixed(0)} 90% 58%)`;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// 用时格式化
export function formatSeconds(ms: number): string {
  const s = ms / 1000;
  if (s >= 60) {
    const m = Math.floor(s / 60);
    return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
  }
  return `${s.toFixed(1)}s`;
}

// 单个数字的分段用时（更精细）
export function formatSplit(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

// 转盘模式：计算同心圆环布局，保证不重叠且填满 count 个数字
export interface DynamicRing {
  radius: number;
  cap: number; // 该环放置的数字个数
  start: number; // 在 cells 数组中的起始索引
  phase: number; // 起始角度偏移
}
export interface DynamicLayout {
  cell: number; // 每个圆点直径
  container: number; // 容器边长
  rings: DynamicRing[];
}

export function computeDynamicLayout(count: number, container: number): DynamicLayout {
  const margin = 6;
  for (let R = 1; R <= 14; R++) {
    const step = (container / 2 - margin) / (R + 0.5);
    const cell = Math.min(step * 0.82, container * 0.16);
    const caps: number[] = [];
    let capTotal = 0;
    for (let k = 1; k <= R; k++) {
      const radius = step * k;
      const c = Math.max(1, Math.floor((2 * Math.PI * radius) / (cell * 1.1)));
      caps.push(c);
      capTotal += c;
    }
    if (capTotal >= count || R === 14) {
      const rings: DynamicRing[] = [];
      let placed = 0;
      for (let k = 0; k < caps.length && placed < count; k++) {
        const use = Math.min(caps[k], count - placed);
        rings.push({ radius: step * (k + 1), cap: use, start: placed, phase: (k * 2.1) % (Math.PI * 2) });
        placed += use;
      }
      if (placed < count && rings.length > 0) {
        rings[rings.length - 1].cap += count - placed;
      }
      return { cell, container, rings };
    }
  }
  return { cell: container * 0.14, container, rings: [] };
}
