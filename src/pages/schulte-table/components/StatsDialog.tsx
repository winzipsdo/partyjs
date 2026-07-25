import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HelpCircle, RotateCcw, Trophy } from 'lucide-react';
import { GRADE_STEPS, anchorSeconds, formatSeconds, formatSplit, formatTopPercent, gradeFor, topPercentFor } from '../utils';
import type { FindRecord } from '../useSchulteGame';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  records: FindRecord[];
  totalMs: number;
  errors: number;
  count: number; // 格子总数，用于评级换算
  factor?: number; // 盘面难度系数（转盘/地狱放宽阈值）
  bestMs?: number;
  isNewBest: boolean;
  onReplay: () => void;
}

export function StatsDialog({ open, onOpenChange, records, totalMs, errors, count, factor = 1, bestMs, isNewBest, onReplay }: Props) {
  const [showRules, setShowRules] = useState(false);

  // 每次打开都回到成绩页
  useEffect(() => {
    if (open) setShowRules(false);
  }, [open]);

  // 逐个数字用时（含 1：从开始揭示盘面到找到 1 的耗时）
  const splits = records;
  const maxSplit = Math.max(1, ...splits.map((r) => r.splitMs));
  const avg = splits.length ? splits.reduce((s, r) => s + r.splitMs, 0) / splits.length : 0;
  const slowest = splits.reduce<FindRecord | null>((acc, r) => (!acc || r.splitMs > acc.splitMs ? r : acc), null);
  const grade = gradeFor(totalMs, count, factor);
  const topPercent = topPercentFor(totalMs, count, factor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[92dvh] max-w-md overflow-y-auto'>
        {showRules ? (
          <RulesPanel count={count} factor={factor} onBack={() => setShowRules(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-xl'>
                <Trophy className='w-5 h-5 text-amber-500' />
                完成！
              </DialogTitle>
              <DialogDescription>每个数字的查找用时（虚线为平均值，橙色为最慢的一格）</DialogDescription>
            </DialogHeader>

            {/* 评级 */}
            <div className='flex items-center justify-center gap-4'>
              <div
                className={`${grade.grade.length > 1 ? 'text-5xl' : 'text-6xl'} font-black leading-none`}
                style={{ color: grade.color, textShadow: `0 0 28px ${grade.color}66` }}
              >
                {grade.grade}
              </div>
              <div className='text-left'>
                <div className='text-lg font-bold text-slate-100'>{grade.label}</div>
                <div className='text-xs tabular-nums text-slate-400'>约位于{formatTopPercent(topPercent)}</div>
                <button
                  onClick={() => setShowRules(true)}
                  className='mt-0.5 flex items-center gap-1 text-xs text-slate-400 underline-offset-2 transition-colors hover:text-slate-200 hover:underline'
                >
                  <HelpCircle className='h-3.5 w-3.5' />
                  评分标准
                </button>
              </div>
            </div>

            {/* 概览 */}
            <div className='grid grid-cols-3 gap-2 text-center'>
              <Stat label='总用时' value={formatSeconds(totalMs)} highlight />
              <Stat label='平均/格' value={formatSplit(avg)} />
              <Stat label='点错' value={String(errors)} />
            </div>

            {isNewBest ? (
              <div className='text-center text-sm font-semibold text-emerald-400'>🎉 新纪录！</div>
            ) : bestMs != null ? (
              <div className='text-center text-xs text-muted-foreground'>历史最佳：{formatSeconds(bestMs)}</div>
            ) : null}

            {/* 逐格明细：柱形图 + 平均线，一屏看全 */}
            <SplitsChart splits={splits} maxSplit={maxSplit} avg={avg} slowest={slowest} />

            <Button onClick={onReplay} className='w-full'>
              <RotateCcw className='w-4 h-4' />
              再来一局
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 逐格用时柱形图：按点击顺序排列，虚线为平均值，最慢一格橙色高亮并直接标注数值
function SplitsChart({
  splits,
  maxSplit,
  avg,
  slowest,
}: {
  splits: FindRecord[];
  maxSplit: number;
  avg: number;
  slowest: FindRecord | null;
}) {
  const W = 344;
  const H = 150;
  const padTop = 18; // 给最慢柱的数值标签留空间
  const padBottom = 16; // x 轴数字刻度
  const plotH = H - padTop - padBottom;
  const n = splits.length;
  if (n === 0) return null;

  const pitch = W / n;
  const barW = Math.max(2, pitch - 2); // 柱间保留 2px 表面间隙
  const yOf = (v: number) => padTop + plotH * (1 - v / maxSplit);
  const avgY = yOf(avg);
  // x 轴刻度：首、尾 + 均匀取样，标注该位置的数字（倒式时顺序自然反向）
  const tickStep = Math.max(1, Math.ceil(n / 6));
  const slowestIdx = slowest ? splits.findIndex((r) => r.number === slowest.number) : -1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className='w-full select-none' role='img' aria-label='每个数字的查找用时柱形图'>
      {/* 基线 */}
      <line x1={0} x2={W} y1={padTop + plotH} y2={padTop + plotH} stroke='rgba(255,255,255,0.12)' strokeWidth={1} />

      {splits.map((r, i) => {
        const isSlow = i === slowestIdx;
        const barH = Math.max(1.5, plotH * (r.splitMs / maxSplit));
        const x = i * pitch + (pitch - barW) / 2;
        const y = padTop + plotH - barH;
        return (
          <g key={r.number}>
            <rect x={x} y={y} width={barW} height={barH} rx={Math.min(2, barW / 2)} fill={isSlow ? '#fb923c' : '#34d399'} />
            {/* 命中区大于柱本身，桌面端悬停可读具体数值 */}
            <rect x={i * pitch} y={padTop} width={pitch} height={plotH} fill='transparent'>
              <title>
                {r.number}：{formatSplit(r.splitMs)}
              </title>
            </rect>
            {isSlow && (
              <text
                x={Math.min(W - 30, Math.max(30, x + barW / 2))}
                y={y - 5}
                textAnchor='middle'
                fontSize={10}
                fill='#e2e8f0'
                fontWeight={600}
              >
                {r.number}·{formatSplit(r.splitMs)}
              </text>
            )}
            {(i % tickStep === 0 || i === n - 1) && (
              <text x={x + barW / 2} y={H - 4} textAnchor='middle' fontSize={9} fill='#64748b'>
                {r.number}
              </text>
            )}
          </g>
        );
      })}

      {/* 平均线（虚线）+ 标签 */}
      <line x1={0} x2={W} y1={avgY} y2={avgY} stroke='#94a3b8' strokeWidth={1} strokeDasharray='4 3' />
      <text x={W - 2} y={avgY - 4} textAnchor='end' fontSize={10} fill='#94a3b8'>
        平均 {formatSplit(avg)}
      </text>
    </svg>
  );
}

// 评分规则：按当前尺寸与难度系数换算的档位阈值（总用时 + 平均单格）+ 基准说明
function RulesPanel({ count, factor, onBack }: { count: number; factor: number; onBack: () => void }) {
  const size = Math.round(Math.sqrt(count));
  const base = anchorSeconds(count) * factor; // 该尺寸的 A 档基准（按盘面难度放宽）
  // 每格允许耗时相对 5×5 的退化倍率
  const degrade = base / count / (anchorSeconds(25) / 25) / factor;

  return (
    <>
      <DialogHeader>
        <DialogTitle className='text-xl'>评分标准</DialogTitle>
        <DialogDescription>
          {size}×{size}（{count} 格）· A 档基准 {base.toFixed(0)}s（每格 {(base / count).toFixed(2)}s）
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-1.5'>
        {/* 表头 */}
        <div className='flex items-center gap-3 px-3 text-[10px] text-slate-500'>
          <span className='w-12' />
          <span className='w-12' />
          <span className='ml-auto w-[4.5rem] text-right'>总用时</span>
          <span className='w-16 text-right'>平均/格</span>
        </div>
        {GRADE_STEPS.map((s, i) => {
          const upper = s.ratio != null ? s.ratio * base : null;
          const prev = i > 0 ? GRADE_STEPS[i - 1].ratio : null;
          const lower = prev != null ? prev * base : null;
          const rangeText =
            upper == null
              ? `≥ ${lower?.toFixed(0)}s`
              : lower == null
                ? `< ${upper.toFixed(0)}s`
                : `${lower.toFixed(0)}~${upper.toFixed(0)}s`;
          // 平均单格：用该档的上限换算（兜底档显示下限）
          const perCell = ((upper ?? lower ?? 0) / count).toFixed(2);
          const perText = upper == null ? `≥ ${perCell}s` : `< ${perCell}s`;
          return (
            <div key={s.grade} className='glass flex items-center gap-3 rounded-lg px-3 py-1.5'>
              <span
                className={`w-12 text-center font-black ${s.grade.length > 1 ? 'text-lg' : 'text-2xl'}`}
                style={{ color: s.color }}
              >
                {s.grade}
              </span>
              <span className='w-12 text-sm font-semibold text-slate-200'>{s.label}</span>
              <span className='ml-auto w-[4.5rem] text-right font-mono text-sm tabular-nums text-slate-300'>
                {rangeText}
              </span>
              <span className='w-16 text-right font-mono text-xs tabular-nums text-slate-400'>{perText}</span>
            </div>
          );
        })}
      </div>

      <p className='text-left text-xs leading-relaxed text-slate-400'>
        每个尺寸单独标定「A 档基准」，其余档位按固定比例推出（ACE 0.5×、SS 0.625×、S 0.75×、B 1.56×、C
        2.25×）。基准依据「串行搜索 + 点击底线」模型：单格耗时 = 点击 0.15s + 搜索（与平均候选数成正比），故 5×5 /
        6×6 / 7×7 分别为 16 / 31 / 55 秒。
        <br />
        因此同一档位下，每格允许耗时相对 5×5 为 <span className='font-mono text-slate-300'>1× / 1.35× / 1.75×</span>
        （5×5 / 6×6 / 7×7）—— 盘越大，扫视距离越长、记忆能覆盖的比例越小，所以退化是超线性的。本局为{' '}
        <span className='font-mono text-slate-300'>{degrade.toFixed(2)}×</span>。
        {factor !== 1 && `当前盘面难度系数 ×${factor}，阈值已再放宽。`}
        <br />
        评级只依据总用时——点错不直接扣分，但会自然消耗时间。正序与倒式采用同一标准。「约位于前 X%」为估算：以对数正态分布（中位数
        32s、σ=0.38）拟合成人 5×5 成绩人群得出，并非真实排行榜数据。
      </p>

      <Button variant='outline' onClick={onBack} className='w-full'>
        <ChevronLeft className='w-4 h-4' />
        返回成绩
      </Button>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className='glass rounded-lg py-2'>
      <div className={`font-bold tabular-nums ${highlight ? 'text-emerald-400 text-lg' : 'text-slate-100'}`}>{value}</div>
      <div className='text-[11px] text-slate-400'>{label}</div>
    </div>
  );
}
