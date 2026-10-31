import { useMemo, useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import { ChevronDown, Settings2, Vibrate, Volume2, Mic } from 'lucide-react';
import { createStorageKey } from '@/constants/storage';
import { cn } from '@/lib/utils';
import {
  SLOTS,
  STAGES,
  Slot,
  TrainingLog,
  addDays,
  buildTimeline,
  dateKey,
  daysBetween,
  slotForNow,
  stageForWeek,
  timelineDuration,
} from './plan';
import { CueSettings, SessionView } from './SessionView';
import { unlockAudio } from './cues';
import styles from './styles.module.css';

const HISTORY_DAYS = 14;

function Toggle({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition',
        on ? 'border-white/20 bg-white/10 text-white' : 'border-white/[0.06] text-slate-500',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function KegelTrainerPage() {
  const today = dateKey();
  const [startDate, setStartDate] = useLocalStorageState<string>(createStorageKey('kegel-start-date'), {
    defaultValue: today,
  });
  const [log, setLog] = useLocalStorageState<TrainingLog>(createStorageKey('kegel-log'), { defaultValue: {} });
  const [stageOverride, setStageOverride] = useLocalStorageState<number>(createStorageKey('kegel-stage-override'), {
    defaultValue: 0,
  });
  const [cues, setCues] = useLocalStorageState<CueSettings>(createStorageKey('kegel-cues'), {
    defaultValue: { sound: true, voice: true, vibration: true },
  });
  const [guideOpen, setGuideOpen] = useState<boolean>(() => Object.keys(log ?? {}).length === 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [runningSlot, setRunningSlot] = useState<Slot>('morning');

  const start = startDate ?? today;
  const dayIndex = Math.max(0, daysBetween(start, today));
  const week = Math.floor(dayIndex / 7) + 1;
  const autoStage = stageForWeek(week);
  const stage = STAGES.find((s) => s.id === stageOverride) ?? autoStage;
  const duration = useMemo(() => timelineDuration(buildTimeline(stage)), [stage]);

  const todayLog = log?.[today] ?? {};
  const doneToday = SLOTS.filter((s) => todayLog[s.id]).length;
  const [slot, setSlot] = useState<Slot>(slotForNow);
  const slotMeta = SLOTS.find((s) => s.id === slot)!;
  const safeCues = cues ?? { sound: true, voice: true, vibration: true };

  // 统计：连续打卡天数（今天还没练就从昨天算起）、累计组数
  const stats = useMemo(() => {
    const l = log ?? {};
    const has = (k: string) => Object.keys(l[k] ?? {}).length > 0;
    let streak = 0;
    let cursor = has(today) ? today : addDays(today, -1);
    while (has(cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    const sessions = Object.values(l).reduce((n, d) => n + Object.keys(d).length, 0);
    const activeDays = Object.keys(l).filter(has).length;
    return { streak, sessions, activeDays };
  }, [log, today]);

  const history = useMemo(
    () =>
      Array.from({ length: HISTORY_DAYS }, (_, i) => {
        const k = addDays(today, i - HISTORY_DAYS + 1);
        return { key: k, count: Object.keys(log?.[k] ?? {}).length, beforeStart: daysBetween(start, k) < 0 };
      }),
    [log, today, start],
  );

  const handleStart = () => {
    unlockAudio();
    setRunningSlot(slot);
    setSessionKey((k) => k + 1);
    setRunning(true);
  };

  const handleComplete = () => {
    const d = dateKey();
    setLog((prev) => {
      const p = prev ?? {};
      return { ...p, [d]: { ...(p[d] ?? {}), [runningSlot]: Date.now() } };
    });
    // 自动切到下一个没练的时段
    const next = SLOTS.find((s) => s.id !== runningSlot && !todayLog[s.id]);
    if (next) setSlot(next.id);
  };

  const toggleSlot = (id: Slot) => {
    setLog((prev) => {
      const p = prev ?? {};
      const day = { ...(p[today] ?? {}) };
      if (day[id]) delete day[id];
      else day[id] = Date.now();
      return { ...p, [today]: day };
    });
  };

  return (
    <div className='mx-auto max-w-md px-4 pb-16 pt-6'>
      {/* 标题 */}
      <div className='mb-5 flex items-end justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>盆底肌跟练</h1>
          <p className='mt-1 text-sm text-slate-400'>
            第 {week} 周 · 第 {dayIndex + 1} 天 · {stage.weeks}
          </p>
        </div>
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className={cn(
            'rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white',
            settingsOpen && 'bg-white/10 text-white',
          )}
          title='设置'
        >
          <Settings2 className='h-5 w-5' />
        </button>
      </div>

      {/* 设置 */}
      {settingsOpen && (
        <div className='glass mb-4 space-y-4 rounded-2xl p-4'>
          <div>
            <div className='mb-2 text-xs font-medium text-slate-400'>跟练提示</div>
            <div className='flex gap-2'>
              <Toggle
                on={safeCues.sound}
                onClick={() => setCues({ ...safeCues, sound: !safeCues.sound })}
                icon={<Volume2 className='h-4 w-4' />}
                label='提示音'
              />
              <Toggle
                on={safeCues.voice}
                onClick={() => setCues({ ...safeCues, voice: !safeCues.voice })}
                icon={<Mic className='h-4 w-4' />}
                label='语音'
              />
              <Toggle
                on={safeCues.vibration}
                onClick={() => setCues({ ...safeCues, vibration: !safeCues.vibration })}
                icon={<Vibrate className='h-4 w-4' />}
                label='震动'
              />
            </div>
          </div>
          <div>
            <div className='mb-2 text-xs font-medium text-slate-400'>训练阶段</div>
            <div className='grid grid-cols-5 gap-1.5'>
              {[0, ...STAGES.map((s) => s.id)].map((id) => (
                <button
                  key={id}
                  onClick={() => setStageOverride(id)}
                  className={cn(
                    'rounded-lg border px-1 py-1.5 text-xs transition',
                    (stageOverride ?? 0) === id
                      ? 'border-white/25 bg-white/10 text-white'
                      : 'border-white/[0.06] text-slate-500',
                  )}
                >
                  {id === 0 ? '自动' : STAGES[id - 1].weeks.replace('第 ', '').replace(' 周', '周')}
                </button>
              ))}
            </div>
            <p className='mt-1.5 text-xs text-slate-500'>自动：按开始日期，每两周升一级</p>
          </div>
          <label className='flex items-center justify-between gap-3'>
            <span className='text-xs font-medium text-slate-400'>开始日期</span>
            <input
              type='date'
              value={start}
              max={today}
              onChange={(e) => e.target.value && setStartDate(e.target.value)}
              className='rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white [color-scheme:dark]'
            />
          </label>
        </div>
      )}

      {/* 今日三组 */}
      <div className='glass mb-4 rounded-2xl p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <span className='text-sm font-semibold text-white'>今天</span>
          <span className='text-xs text-slate-400'>{doneToday} / 3 组</span>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {SLOTS.map((s) => {
            const done = !!todayLog[s.id];
            const selected = slot === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSlot(s.id)}
                onDoubleClick={() => toggleSlot(s.id)}
                className={cn(
                  'relative rounded-xl border px-2 py-3 text-center transition',
                  selected ? 'border-rose-400/60 bg-rose-400/10' : 'border-white/[0.06] bg-white/[0.02]',
                )}
              >
                <div className='text-2xl'>{done ? '✅' : s.emoji}</div>
                <div className='mt-1 text-sm font-medium text-white'>{s.name}</div>
                <div className='text-[11px] text-slate-500'>{s.cue}</div>
              </button>
            );
          })}
        </div>
        <p className='mt-2 text-center text-[11px] text-slate-600'>双击可手动补记 / 取消</p>
      </div>

      {/* 本阶段内容 + 开始 */}
      <div className='glass mb-4 rounded-2xl p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <span className='text-sm font-semibold text-white'>本组内容</span>
          <span className='rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300'>
            {stage.posture}练 · 约 {Math.round(duration / 6) / 10} 分钟
          </span>
        </div>
        <ol className='space-y-2 text-sm'>
          <li className='flex gap-3'>
            <span className='font-mono text-rose-300'>1</span>
            <span className='text-slate-300'>
              <b className='text-white'>慢收 {stage.slowReps} 次</b>：收紧 {stage.slowHold} 秒，完全放松 {stage.slowRelax} 秒
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='font-mono text-rose-300'>2</span>
            <span className='text-slate-300'>
              <b className='text-white'>快收 {stage.fastReps} 次</b>：快速收紧，马上放松
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='font-mono text-rose-300'>3</span>
            <span className='text-slate-300'>
              <b className='text-white'>反向放松 1 分钟</b>：吸气让会阴往下放松，呼气自然回弹
            </span>
          </li>
        </ol>
        <button
          onClick={handleStart}
          className={cn(
            'mt-5 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 py-4 text-lg font-bold text-white shadow-lg transition active:scale-[0.98]',
            styles.startPulse,
          )}
        >
          开始{slotMeta.name}这组
        </button>
      </div>

      {/* 找对肌肉 */}
      <div className='glass mb-4 rounded-2xl'>
        <button
          onClick={() => setGuideOpen((v) => !v)}
          className='flex w-full items-center justify-between p-4 text-left'
        >
          <span className='text-sm font-semibold text-white'>🎯 先找对肌肉（第一次看）</span>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', guideOpen && 'rotate-180')} />
        </button>
        {guideOpen && (
          <ul className='space-y-2 px-4 pb-4 text-sm text-slate-300'>
            <li>• 躺下，想象同时憋住小便和憋住放屁，往上提的那块就是盆底肌。</li>
            <li>• 一只手放在会阴（阴囊和肛门之间），收紧时能感觉到往里提。</li>
            <li>• 肚子、屁股、大腿都不要用力，正常呼吸，不要憋气。</li>
          </ul>
        )}
      </div>

      {/* 打卡记录 */}
      <div className='glass mb-4 rounded-2xl p-4'>
        <div className='mb-3 grid grid-cols-3 text-center'>
          <div>
            <div className='text-xl font-bold text-white'>{stats.streak}</div>
            <div className='text-[11px] text-slate-500'>连续天数</div>
          </div>
          <div>
            <div className='text-xl font-bold text-white'>{stats.activeDays}</div>
            <div className='text-[11px] text-slate-500'>练习天数</div>
          </div>
          <div>
            <div className='text-xl font-bold text-white'>{stats.sessions}</div>
            <div className='text-[11px] text-slate-500'>累计组数</div>
          </div>
        </div>
        <div className='grid grid-cols-7 gap-1.5'>
          {history.map((d) => (
            <div
              key={d.key}
              title={`${d.key}：${d.count} 组`}
              className={cn(
                'flex aspect-square flex-col items-center justify-center rounded-lg text-[10px]',
                d.beforeStart ? 'opacity-25' : '',
                d.key === today && 'ring-1 ring-white/40',
              )}
              style={{
                background:
                  d.count === 0 ? 'rgba(255,255,255,0.04)' : `hsl(346 88% 62% / ${0.25 + d.count * 0.22})`,
              }}
            >
              <span className='text-slate-300'>{Number(d.key.slice(8))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 坚持小办法 */}
      <div className='rounded-2xl border border-white/[0.06] p-4 text-xs leading-relaxed text-slate-400'>
        <div className='mb-1.5 font-semibold text-slate-300'>💡 坚持下去的小办法</div>
        <p>跟固定的事绑在一起：醒来躺床上一组、午饭后一组、睡前一组。手机上设 3 个闹钟提醒。</p>
        <p className='mt-1'>不用追求完美，漏了一组就算了，第二天接着练。</p>
      </div>

      {running && (
        <SessionView
          key={sessionKey}
          stage={stage}
          cues={safeCues}
          slotName={SLOTS.find((s) => s.id === runningSlot)!.name}
          doneCount={doneToday}
          onComplete={handleComplete}
          onExit={() => setRunning(false)}
        />
      )}
    </div>
  );
}
