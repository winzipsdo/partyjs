// 提示音 / 语音 / 震动 —— 方便闭着眼睛跟练

let ctx: AudioContext | null = null;

// 必须在用户点击里调用一次，iOS 才允许出声
export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
  try {
    // 用一句空播报解锁 speechSynthesis
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* ignore */
  }
}

export function beep(freq: number, duration = 0.15, volume = 0.25) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch {
    /* ignore */
  }
}

export function chime() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.35, 0.2), i * 140));
}

let zhVoice: SpeechSynthesisVoice | null | undefined;
function pickVoice() {
  if (zhVoice !== undefined && zhVoice !== null) return zhVoice;
  const voices = window.speechSynthesis.getVoices();
  zhVoice = voices.find((v) => v.lang === 'zh-CN') ?? voices.find((v) => v.lang.startsWith('zh')) ?? null;
  return zhVoice;
}

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 1.05;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function stopSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}
