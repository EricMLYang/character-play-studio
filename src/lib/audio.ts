let voice: SpeechSynthesisVoice | null = null

const pickVoice = () => {
  const vs = speechSynthesis.getVoices()
  voice =
    vs.find((v) => v.lang === 'zh-TW') ||
    vs.find((v) => v.lang?.startsWith('zh')) ||
    null
}
if (typeof speechSynthesis !== 'undefined') {
  pickVoice()
  speechSynthesis.onvoiceschanged = pickVoice
}

/** 唸一個字，rate 慢一點給小孩聽。 */
export function say(text: string, rate = 0.75) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-TW'
  u.rate = rate
  u.pitch = 1.15
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
}

/** 唸 n 次，每次間隔 gap 毫秒。回傳取消函式。 */
export function sayRepeat(text: string, times = 3, gap = 1100) {
  let i = 0
  say(text)
  const id = setInterval(() => {
    if (++i >= times) return clearInterval(id)
    say(text)
  }, gap)
  return () => { clearInterval(id); speechSynthesis?.cancel() }
}

let ctx: AudioContext | null = null
/** 短促的 UI 音效，不需要任何音檔。 */
export function blip(freq = 660, dur = 0.12, type: OscillatorType = 'sine') {
  try {
    ctx ||= new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + dur)
    g.gain.setValueAtTime(0.18, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  } catch { /* 靜音就算了，不能因為音效壞掉影響觀看 */ }
}

/** 完成一個字的小獎勵旋律。 */
export function fanfare() {
  ;[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'triangle'), i * 110))
}
