// 舒尔特方格工具函数

// random 是元模式：每局从 CONCRETE_MODES 中随机抽一种盘面
export type GameMode = 'standard' | 'honeycomb' | 'dynamic' | 'triangle' | 'scatter' | 'random';

export const CONCRETE_MODES: GameMode[] = ['standard', 'honeycomb', 'dynamic', 'triangle', 'scatter'];

export const MODE_META: Record<GameMode, { label: string; emoji: string; desc: string }> = {
  standard: { label: '标准', emoji: '🔢', desc: '经典方格，从 1 数到底' },
  honeycomb: { label: '蜂窝', emoji: '🐝', desc: '六边形蜂巢排列' },
  dynamic: { label: '转盘', emoji: '🌀', desc: '同心圆环缓慢旋转' },
  triangle: { label: '三角', emoji: '🔺', desc: '大三角切割为小三角' },
  scatter: { label: '散布', emoji: '🎯', desc: '数字随机散布，无网格' },
  random: { label: '随机', emoji: '🎲', desc: '每局随机抽一种盘面' },
};

// 各模式可选难度：标准/三角提供 5 档起步，其余从 6 档起；
// 随机模式取全体形态的交集（6/7），保证抽到任何形态尺寸都可用
export function sizesForMode(mode: GameMode): number[] {
  return mode === 'standard' || mode === 'triangle' ? [5, 6, 7] : [6, 7];
}

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
export function timerColor(elapsedMs: number, count: number, factor = 1): string {
  // 5×5 约 37.5s 的舒适预算，按尺寸超线性与盘面难度放宽
  const budgetMs = 25 * 1500 * Math.pow(count / 25, 1.53) * factor;
  const frac = clamp(elapsedMs / (budgetMs * 1.6), 0, 1);
  const hue = 145 - 145 * frac; // 145°(绿) → 0°(红)，中途经过黄
  return `hsl(${hue.toFixed(0)} 90% 58%)`;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ===== 成绩评级 =====
// 阈值针对 5×5 制定：8s ACE / 10s SS / 12s S / 16s A / 25s B / 36s C / 其余 D。
// 其他尺寸按超线性缩放：盘越大每格搜索越慢（视觉搜索复杂度超线性），
// T(count) = T(25) × (count/25)^1.53 —— 使 6×6 的 A 档 ≈ 28s、7×7 ≈ 45s。
export type Grade = 'ACE' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

export interface GradeStep {
  grade: Grade;
  label: string;
  maxPerCellMs: number | null; // null 表示兜底档
  color: string;
}

export const GRADE_STEPS: GradeStep[] = [
  { grade: 'ACE', label: '超凡', maxPerCellMs: 320, color: '#f0abfc' },
  { grade: 'SS', label: '卓越', maxPerCellMs: 400, color: '#fbbf24' },
  { grade: 'S', label: '顶尖', maxPerCellMs: 480, color: '#34d399' },
  { grade: 'A', label: '优秀', maxPerCellMs: 640, color: '#38bdf8' },
  { grade: 'B', label: '良好', maxPerCellMs: 1000, color: '#a78bfa' },
  { grade: 'C', label: '中等', maxPerCellMs: 1440, color: '#fb923c' },
  { grade: 'D', label: '待提高', maxPerCellMs: null, color: '#94a3b8' },
];

// 盘面难度系数：更难的盘面放宽时间预算（评级与百分位共用）。
// 标准/蜂窝 ×1.0；三角/随机 ×1.1（朝向噪声/无网格结构）；
// 转盘 ×1.2（环在转，搜索更慢）；转盘地狱 ×1.6（数字还在翻滚）。
export function difficultyFactor(mode: GameMode, hell: boolean): number {
  if (mode === 'dynamic') return hell ? 1.6 : 1.2;
  if (mode === 'triangle' || mode === 'scatter') return 1.1;
  return 1;
}

// 尺寸缩放：相对 5×5 的时间倍率（超线性指数 1.53）
export function sizeScale(count: number): number {
  return Math.pow(count / 25, 1.53);
}

// 数字四色：亮底格子上可读的四个深色
export const FOUR_COLORS = ['#dc2626', '#2563eb', '#047857', '#7e22ce'];

// 随机模式：在正方形容器内为 count 个圆点生成互不重叠的随机位置
export interface RandomLayout {
  cell: number;
  points: { x: number; y: number }[];
}

export function computeScatterLayout(count: number, container: number): RandomLayout {
  let cell = container * (count <= 36 ? 0.145 : 0.125);
  // 放不下时逐步缩小圆点重试
  for (let attempt = 0; attempt < 8; attempt++) {
    const pts: { x: number; y: number }[] = [];
    const minDist = cell * 1.06;
    const lo = cell / 2 + 2;
    const hi = container - cell / 2 - 2;
    let tries = 0;
    while (pts.length < count && tries < 4000) {
      tries++;
      const x = lo + Math.random() * (hi - lo);
      const y = lo + Math.random() * (hi - lo);
      if (pts.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist)) {
        pts.push({ x, y });
      }
    }
    if (pts.length === count) return { cell, points: pts };
    cell *= 0.93;
  }
  // 兜底：退化为网格抖动布局，保证一定能放下
  const side = Math.ceil(Math.sqrt(count));
  const step = container / side;
  cell = Math.min(cell, step * 0.8);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / side);
    const c = i % side;
    const jitter = () => (Math.random() - 0.5) * step * 0.25;
    pts.push({ x: (c + 0.5) * step + jitter(), y: (r + 0.5) * step + jitter() });
  }
  return { cell, points: pts };
}

export function gradeFor(totalMs: number, count: number, factor = 1): GradeStep {
  // 折算回 5×5 等效每格用时后查表
  const perCell = totalMs / factor / sizeScale(count) / 25;
  for (const s of GRADE_STEPS) {
    if (s.maxPerCellMs != null && perCell < s.maxPerCellMs) return s;
  }
  return GRADE_STEPS[GRADE_STEPS.length - 1];
}

// ===== 人群百分位估计 =====
// 没有真实全网数据，用对数正态分布对成人 5×5 成绩做拟合：
// ln(t) ~ N(ln 32, 0.38)，即中位数约 32s；
// 该曲线下 <16s ≈ 前 3.4%、<12s ≈ 前 0.5%、<25s ≈ 前 26%、<36s ≈ 前 62%，
// 与常见训练数据的分布大致吻合。其他尺寸先换算成 5×5 等效用时再查曲线。
const POP_MEDIAN_S = 32;
const POP_SIGMA = 0.38;

function erf(x: number): number {
  // Abramowitz–Stegun 近似，误差 < 1.5e-7
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

const normCdf = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

// 返回「位于前百分之几」（0~100）：值越小成绩越好
export function topPercentFor(totalMs: number, count: number, factor = 1): number {
  const t5 = totalMs / factor / sizeScale(count) / 1000; // 折算难度与尺寸后的 5×5 等效秒数
  if (t5 <= 0) return 0.01;
  const z = (Math.log(t5) - Math.log(POP_MEDIAN_S)) / POP_SIGMA;
  return normCdf(z) * 100;
}

export function formatTopPercent(p: number): string {
  if (p < 0.01) return '前 0.01%';
  if (p >= 99.99) return '前 99.99%';
  return `前 ${p.toFixed(2)}%`;
}

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
