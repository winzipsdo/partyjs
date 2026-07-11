import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HelpCircle, RotateCcw, Trophy } from 'lucide-react';
import { GRADE_STEPS, formatSeconds, formatSplit, formatTopPercent, gradeFor, topPercentFor } from '../utils';
import type { FindRecord } from '../useSchulteGame';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  records: FindRecord[];
  totalMs: number;
  errors: number;
  count: number; // 格子总数，用于评级换算
  bestMs?: number;
  isNewBest: boolean;
  onReplay: () => void;
}

export function StatsDialog({ open, onOpenChange, records, totalMs, errors, count, bestMs, isNewBest, onReplay }: Props) {
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
  const grade = gradeFor(totalMs, count);
  const topPercent = topPercentFor(totalMs, count);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        {showRules ? (
          <RulesPanel count={count} onBack={() => setShowRules(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-xl'>
                <Trophy className='w-5 h-5 text-amber-500' />
                完成！
              </DialogTitle>
              <DialogDescription>每个数字的查找用时（含找到 1 的耗时，越长的条代表停顿越久）</DialogDescription>
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

            {/* 逐格明细 */}
            <div className='max-h-44 overflow-y-auto pr-1 -mr-1 space-y-1'>
              {splits.map((r) => {
                const pct = (r.splitMs / maxSplit) * 100;
                const isSlow = slowest != null && r.number === slowest.number;
                return (
                  <div key={r.number} className='flex items-center gap-2 text-sm'>
                    <span className='w-7 shrink-0 text-right font-mono text-slate-500'>{r.number}</span>
                    <div className='flex-1 h-4 bg-white/[0.07] rounded-full overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all'
                        style={{
                          width: `${pct}%`,
                          background: isSlow
                            ? 'linear-gradient(90deg,#fb923c,#ef4444)'
                            : 'linear-gradient(90deg,#34d399,#10b981)',
                        }}
                      />
                    </div>
                    <span className='w-14 shrink-0 text-right font-mono tabular-nums text-slate-300'>
                      {formatSplit(r.splitMs)}
                    </span>
                  </div>
                );
              })}
            </div>

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

// 评分规则：按当前尺寸换算的档位阈值 + 基准说明
function RulesPanel({ count, onBack }: { count: number; onBack: () => void }) {
  const size = Math.round(Math.sqrt(count));
  return (
    <>
      <DialogHeader>
        <DialogTitle className='text-xl'>评分标准</DialogTitle>
        <DialogDescription>
          当前难度 {size}×{size}（{count} 格）的评级阈值
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-1.5'>
        {GRADE_STEPS.map((s, i) => {
          const upper = s.maxPerCellMs != null ? (s.maxPerCellMs * count) / 1000 : null;
          const prev = i > 0 ? GRADE_STEPS[i - 1].maxPerCellMs : null;
          const lower = prev != null ? (prev * count) / 1000 : null;
          const rangeText =
            upper == null
              ? `≥ ${lower?.toFixed(0)}s`
              : lower == null
                ? `< ${upper.toFixed(0)}s`
                : `${lower.toFixed(0)} ~ ${upper.toFixed(0)}s`;
          return (
            <div key={s.grade} className='glass flex items-center gap-3 rounded-lg px-3 py-1.5'>
              <span
                className={`w-12 text-center font-black ${s.grade.length > 1 ? 'text-lg' : 'text-2xl'}`}
                style={{ color: s.color }}
              >
                {s.grade}
              </span>
              <span className='w-14 text-sm font-semibold text-slate-200'>{s.label}</span>
              <span className='ml-auto font-mono text-sm tabular-nums text-slate-300'>{rangeText}</span>
            </div>
          );
        })}
      </div>

      <p className='text-xs leading-relaxed text-slate-400'>
        阈值针对 5×5 制定（8s ACE、10s SS、12s S、16s A、25s B、36s
        C），按「每格平均用时」等比换算到当前难度。评级只依据总用时——点错不直接扣分，但会自然消耗时间。正序与倒式采用同一标准。
        <br />
        「约位于前 X%」为估算：以对数正态分布（中位数 32s、σ=0.38）拟合成人 5×5
        成绩人群得出，并非真实排行榜数据。
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
