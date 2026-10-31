import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pause, Play, SkipForward, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTION_LABEL, Section, Stage, Step, buildTimeline } from './plan';
import { useSessionRunner } from './useSessionRunner';
import { beep, chime, speak, stopSpeech, vibrate } from './cues';
import styles from './styles.module.css';

export interface CueSettings {
  sound: boolean;
  voice: boolean;
  vibration: boolean;
}

interface Props {
  stage: Stage;
  cues: CueSettings;
  slotName: string;
  doneCount: number;
  onComplete: () => void;
  onExit: () => void;
}

const VISUAL: Record<Step['kind'], { scale: number; hue: string; arrow?: string }> = {
  prep: { scale: 0.86, hue: '258 85% 66%' },
  transition: { scale: 0.86, hue: '258 85% 66%' },
  contract: { scale: 0.6, hue: '346 88% 62%', arrow: '↑' },
  relax: { scale: 1, hue: '172 70% 50%' },
  inhale: { scale: 1.14, hue: '199 90% 58%', arrow: '↓' },
  exhale: { scale: 0.9, hue: '152 65% 50%' },
};

const SECTIONS: Section[] = ['slow', 'fast', 'reverse'];

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
      } catch {
        /* ignore */
      }
    };
    void acquire();
    const onVisible = () => document.visibilityState === 'visible' && void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, [active]);
}

export function SessionView({ stage, cues, slotName, doneCount, onComplete, onExit }: Props) {
  const steps = useMemo(() => buildTimeline(stage), [stage]);
  const cuesRef = useRef(cues);
  cuesRef.current = cues;

  const handleStep = useCallback((step: Step) => {
    const { sound, voice, vibration } = cuesRef.current;
    const isFast = step.section === 'fast' && (step.kind === 'contract' || step.kind === 'relax');
    if (sound) {
      if (step.kind === 'contract') beep(isFast ? 988 : 880, isFast ? 0.08 : 0.18);
      else if (step.kind === 'relax' && !isFast) beep(440, 0.22, 0.2);
      else if (step.kind === 'inhale') beep(392, 0.3, 0.15);
      else if (step.kind === 'exhale') beep(330, 0.3, 0.12);
      else if (step.kind === 'transition') beep(660, 0.25, 0.18);
    }
    if (vibration && step.kind === 'contract') vibrate(isFast ? 40 : 120);
    if (voice && step.speech) speak(step.speech);
  }, []);

  const handleDone = useCallback(() => {
    if (cuesRef.current.sound) chime();
    if (cuesRef.current.vibration) vibrate([80, 60, 80, 60, 160]);
    if (cuesRef.current.voice) speak('这一组完成了，做得好');
    onComplete();
  }, [onComplete]);

  const runner = useSessionRunner(steps, handleStep, handleDone);
  const { status, index, stepElapsed, totalElapsed, total } = runner;

  // 进入即开始
  const startRef = useRef(runner.start);
  useEffect(() => {
    startRef.current();
    return () => stopSpeech();
  }, []);

  useWakeLock(status === 'running' || status === 'paused');

  const step = steps[index];
  const visual = VISUAL[step.kind];
  const isFast = step.section === 'fast' && (step.kind === 'contract' || step.kind === 'relax');
  const remaining = Math.max(0, step.duration - stepElapsed);
  const countdown = Math.ceil(remaining - 0.001);
  const stepProgress = Math.min(1, stepElapsed / step.duration);

  // 快收看整节进度，其余看当前这一步
  const ringProgress = useMemo(() => {
    if (!isFast) return stepProgress;
    const fastSteps = steps.filter((s) => s.section === 'fast' && s.kind !== 'transition');
    const done = (step.rep! - 1) * 2 + (step.kind === 'relax' ? 1 : 0);
    return (done + stepProgress) / fastSteps.length;
  }, [isFast, stepProgress, steps, step]);

  const transitionSeconds =
    step.kind === 'inhale' || step.kind === 'exhale'
      ? step.duration
      : isFast
        ? 0.25
        : step.kind === 'contract'
          ? 0.6
          : 0.9;

  const R = 46;
  const C = 2 * Math.PI * R;

  if (status === 'done') {
    return (
      <div className='fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-[#07080f]/95 px-6 text-center backdrop-blur-md'>
        <div className={cn('text-7xl', styles.pop)}>🎉</div>
        <div>
          <h2 className='text-2xl font-bold text-white'>{slotName}这组完成！</h2>
          <p className='mt-2 text-sm text-slate-400'>今天第 {doneCount} 组 · 记录已保存</p>
        </div>
        <button
          onClick={onExit}
          className='rounded-full bg-white/10 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/15'
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-[60] flex flex-col bg-[#07080f]/95 backdrop-blur-md'>
      {/* 顶部：分节进度 */}
      <div className='flex items-center gap-3 px-4 pb-2 pt-4'>
        <button
          onClick={onExit}
          className='rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white'
          title='结束'
        >
          <X className='h-5 w-5' />
        </button>
        <div className='flex flex-1 gap-2'>
          {SECTIONS.map((sec) => {
            const secSteps = steps.filter((s) => s.section === sec);
            const firstIdx = steps.indexOf(secSteps[0]);
            const lastIdx = steps.indexOf(secSteps[secSteps.length - 1]);
            const active = index >= firstIdx && index <= lastIdx;
            const done = index > lastIdx;
            return (
              <div key={sec} className='flex-1'>
                <div
                  className={cn(
                    'mb-1 text-center text-xs font-medium',
                    active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-600',
                  )}
                >
                  {SECTION_LABEL[sec]}
                </div>
                <div className='h-1 overflow-hidden rounded-full bg-white/10'>
                  <div
                    className='h-full rounded-full bg-white/70'
                    style={{ width: done ? '100%' : active ? `${((index - firstIdx + stepProgress) / secSteps.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className='w-12 text-right font-mono text-xs tabular-nums text-slate-500'>
          {Math.floor((total - totalElapsed) / 60)}:{String(Math.floor((total - totalElapsed) % 60)).padStart(2, '0')}
        </div>
      </div>

      {/* 主视觉 */}
      <div className='flex flex-1 flex-col items-center justify-center px-6'>
        <div className='mb-6 h-6 text-sm font-medium tracking-widest text-slate-400'>
          {step.rep && step.reps ? `${SECTION_LABEL[step.section]} ${step.rep} / ${step.reps}` : SECTION_LABEL[step.section]}
        </div>

        <div className='relative flex h-[min(72vw,340px)] w-[min(72vw,340px)] items-center justify-center'>
          <svg viewBox='0 0 100 100' className='absolute inset-0 h-full w-full -rotate-90'>
            <circle cx='50' cy='50' r={R} fill='none' stroke='rgba(255,255,255,0.07)' strokeWidth='2' />
            <circle
              cx='50'
              cy='50'
              r={R}
              fill='none'
              stroke={`hsl(${visual.hue})`}
              strokeWidth='2.4'
              strokeLinecap='round'
              strokeDasharray={C}
              strokeDashoffset={C * (1 - ringProgress)}
              style={{ transition: 'stroke 0.4s' }}
            />
          </svg>
          <div
            className={styles.orb}
            style={
              {
                '--hue': visual.hue,
                transform: `scale(${visual.scale})`,
                transitionDuration: `${transitionSeconds}s, 0.4s, 0.4s`,
              } as React.CSSProperties
            }
          />
          <div className='relative flex flex-col items-center'>
            {visual.arrow && <div className='text-2xl font-bold text-white/70'>{visual.arrow}</div>}
            <div className='text-4xl font-bold text-white sm:text-5xl'>{step.label}</div>
            {!isFast && step.kind !== 'prep' && step.kind !== 'transition' && (
              <div className='mt-1 font-mono text-3xl tabular-nums text-white/80'>{countdown}</div>
            )}
          </div>
        </div>

        <p className='mt-8 h-10 max-w-xs text-center text-sm text-slate-400'>{step.hint}</p>
      </div>

      {/* 控制 */}
      <div className='flex items-center justify-center gap-4 px-4 pb-[max(2rem,env(safe-area-inset-bottom))]'>
        <button
          onClick={status === 'running' ? runner.pause : runner.resume}
          className='flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#07080f] shadow-lg transition active:scale-95'
          title={status === 'running' ? '暂停' : '继续'}
        >
          {status === 'running' ? <Pause className='h-7 w-7' /> : <Play className='ml-1 h-7 w-7' />}
        </button>
        <button
          onClick={runner.skipSection}
          disabled={status !== 'running'}
          className='flex h-12 items-center gap-1 rounded-full bg-white/10 px-4 text-sm text-slate-300 transition hover:bg-white/15 disabled:opacity-40'
        >
          <SkipForward className='h-4 w-4' />
          跳过本节
        </button>
      </div>
      {status === 'paused' && (
        <div className='pointer-events-none absolute inset-x-0 top-20 text-center text-sm font-medium text-amber-300'>已暂停</div>
      )}
    </div>
  );
}
