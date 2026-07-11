import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy } from 'lucide-react';
import { formatSeconds, formatSplit } from '../utils';
import type { FindRecord } from '../useSchulteGame';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  records: FindRecord[];
  totalMs: number;
  errors: number;
  bestMs?: number;
  isNewBest: boolean;
  onReplay: () => void;
}

export function StatsDialog({ open, onOpenChange, records, totalMs, errors, bestMs, isNewBest, onReplay }: Props) {
  // 逐个数字用时（跳过 1，因为它是起点，用时为 0）
  const splits = records.filter((r) => r.number > 1);
  const maxSplit = Math.max(1, ...splits.map((r) => r.splitMs));
  const avg = splits.length ? splits.reduce((s, r) => s + r.splitMs, 0) / splits.length : 0;
  const slowest = splits.reduce<FindRecord | null>((acc, r) => (!acc || r.splitMs > acc.splitMs ? r : acc), null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Trophy className='w-5 h-5 text-amber-500' />
            完成！
          </DialogTitle>
          <DialogDescription>每个数字的查找用时（越长的条代表停顿越久）</DialogDescription>
        </DialogHeader>

        {/* 概览 */}
        <div className='grid grid-cols-3 gap-2 text-center'>
          <Stat label='总用时' value={formatSeconds(totalMs)} highlight />
          <Stat label='平均/格' value={formatSplit(avg)} />
          <Stat label='点错' value={String(errors)} />
        </div>

        {isNewBest ? (
          <div className='text-center text-sm font-semibold text-emerald-600'>🎉 新纪录！</div>
        ) : bestMs != null ? (
          <div className='text-center text-xs text-muted-foreground'>历史最佳：{formatSeconds(bestMs)}</div>
        ) : null}

        {/* 逐格明细 */}
        <div className='max-h-56 overflow-y-auto pr-1 -mr-1 space-y-1'>
          {splits.map((r) => {
            const pct = (r.splitMs / maxSplit) * 100;
            const isSlow = slowest != null && r.number === slowest.number;
            return (
              <div key={r.number} className='flex items-center gap-2 text-sm'>
                <span className='w-7 shrink-0 text-right font-mono text-slate-500'>{r.number}</span>
                <div className='flex-1 h-4 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full rounded-full transition-all'
                    style={{
                      width: `${pct}%`,
                      background: isSlow ? 'linear-gradient(90deg,#fb923c,#ef4444)' : 'linear-gradient(90deg,#34d399,#10b981)',
                    }}
                  />
                </div>
                <span className='w-14 shrink-0 text-right font-mono tabular-nums text-slate-600'>
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
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className='rounded-lg bg-slate-50 border border-slate-100 py-2'>
      <div className={`font-bold tabular-nums ${highlight ? 'text-emerald-600 text-lg' : 'text-slate-800'}`}>{value}</div>
      <div className='text-[11px] text-slate-500'>{label}</div>
    </div>
  );
}
