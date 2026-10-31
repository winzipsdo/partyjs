// 凯格尔（盆底肌）训练计划：阶段定义 + 跟练时间轴

export type Posture = '躺着' | '坐着' | '站着';

export interface Stage {
  id: number;
  weeks: string;
  fromWeek: number;
  posture: Posture;
  slowHold: number; // 慢收：收紧秒数
  slowRelax: number; // 慢收：放松秒数
  slowReps: number;
  fastReps: number;
  reverseSeconds: number; // 反向放松总时长
}

export const STAGES: Stage[] = [
  { id: 1, weeks: '第 1–2 周', fromWeek: 1, posture: '躺着', slowHold: 3, slowRelax: 3, slowReps: 10, fastReps: 10, reverseSeconds: 60 },
  { id: 2, weeks: '第 3–4 周', fromWeek: 3, posture: '坐着', slowHold: 5, slowRelax: 5, slowReps: 10, fastReps: 15, reverseSeconds: 60 },
  { id: 3, weeks: '第 5–6 周', fromWeek: 5, posture: '站着', slowHold: 8, slowRelax: 8, slowReps: 10, fastReps: 20, reverseSeconds: 60 },
  { id: 4, weeks: '第 7 周起', fromWeek: 7, posture: '站着', slowHold: 10, slowRelax: 10, slowReps: 10, fastReps: 20, reverseSeconds: 60 },
];

export function stageForWeek(week: number): Stage {
  return [...STAGES].reverse().find((s) => week >= s.fromWeek) ?? STAGES[0];
}

export type StepKind = 'prep' | 'contract' | 'relax' | 'inhale' | 'exhale' | 'transition';
export type Section = 'prep' | 'slow' | 'fast' | 'reverse';

export interface Step {
  kind: StepKind;
  section: Section;
  duration: number; // 秒
  rep?: number; // 第几次（1 起）
  reps?: number; // 本节总次数
  label: string;
  hint?: string;
  speech?: string; // 语音播报
}

const FAST_CONTRACT = 0.7;
const FAST_RELAX = 0.8;
const BREATH = 5; // 反向放松：吸 5 秒、呼 5 秒

export const SECTION_LABEL: Record<Section, string> = {
  prep: '准备',
  slow: '慢收',
  fast: '快收',
  reverse: '反向放松',
};

export function buildTimeline(stage: Stage): Step[] {
  const steps: Step[] = [];
  steps.push({
    kind: 'prep',
    section: 'prep',
    duration: 6,
    label: `${stage.posture}，准备`,
    hint: '肚子、屁股、大腿放松，正常呼吸',
    speech: `${stage.posture}准备，肚子屁股大腿放松，先做慢收`,
  });

  for (let i = 1; i <= stage.slowReps; i++) {
    steps.push({
      kind: 'contract',
      section: 'slow',
      duration: stage.slowHold,
      rep: i,
      reps: stage.slowReps,
      label: '收紧',
      hint: '会阴往里、往上提，保持住',
      speech: '收',
    });
    steps.push({
      kind: 'relax',
      section: 'slow',
      duration: stage.slowRelax,
      rep: i,
      reps: stage.slowReps,
      label: '完全放松',
      hint: '彻底松开，不要残留用力',
      speech: '放松',
    });
  }

  steps.push({
    kind: 'transition',
    section: 'fast',
    duration: 4,
    label: '接下来：快收',
    hint: `快速收紧，马上放松，共 ${stage.fastReps} 次`,
    speech: '接下来快收，跟着提示音',
  });
  for (let i = 1; i <= stage.fastReps; i++) {
    steps.push({ kind: 'contract', section: 'fast', duration: FAST_CONTRACT, rep: i, reps: stage.fastReps, label: '收', hint: '快速收紧' });
    steps.push({ kind: 'relax', section: 'fast', duration: FAST_RELAX, rep: i, reps: stage.fastReps, label: '放', hint: '马上放松' });
  }

  const cycles = Math.round(stage.reverseSeconds / (BREATH * 2));
  steps.push({
    kind: 'transition',
    section: 'reverse',
    duration: 4,
    label: '接下来：反向放松',
    hint: '吸气时让会阴往下放松，呼气时自然回弹',
    speech: '接下来反向放松',
  });
  for (let i = 1; i <= cycles; i++) {
    steps.push({
      kind: 'inhale',
      section: 'reverse',
      duration: BREATH,
      rep: i,
      reps: cycles,
      label: '慢慢吸气',
      hint: '会阴往下放松、舒展',
      speech: i === 1 ? '慢慢吸气，往下放松' : '吸气',
    });
    steps.push({
      kind: 'exhale',
      section: 'reverse',
      duration: BREATH,
      rep: i,
      reps: cycles,
      label: '呼气',
      hint: '不用力，让它自然回弹',
      speech: '呼气',
    });
  }
  return steps;
}

export function timelineDuration(steps: Step[]) {
  return steps.reduce((sum, s) => sum + s.duration, 0);
}

// ---------- 日期 ----------

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(fromKey: string, toKey: string) {
  return Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / 86400000);
}

export function addDays(key: string, n: number) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

// ---------- 每日三组 ----------

export type Slot = 'morning' | 'noon' | 'evening';

export const SLOTS: { id: Slot; emoji: string; name: string; cue: string }[] = [
  { id: 'morning', emoji: '🌅', name: '早上', cue: '醒来躺在床上' },
  { id: 'noon', emoji: '🍱', name: '中午', cue: '午饭后' },
  { id: 'evening', emoji: '🌙', name: '睡前', cue: '躺下准备睡' },
];

export function slotForNow(d = new Date()): Slot {
  const h = d.getHours();
  if (h < 11) return 'morning';
  if (h < 17) return 'noon';
  return 'evening';
}

export type DayLog = Partial<Record<Slot, number>>; // 值为完成时间戳
export type TrainingLog = Record<string, DayLog>;
