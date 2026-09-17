/**
 * 介面音效。全部用 Web Audio 現場合成，不需要任何音檔，也就不必等素材。
 * 音量刻意壓小：影片原音與系統朗讀才是主角，這些只是點擊的回饋。
 */
let ctx: AudioContext | null = null

function audio() {
  const Ctor = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  // 自動播放政策會讓 context 停在 suspended，第一次使用者互動時補救
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/**
 * 一顆音：from → to 的滑音，指數收尾避免爆音。
 * 整段包 try/catch：音效是裝飾，絕不能讓例外往上竄到呼叫端。
 * （曾經因為指數滑音的目標值是 0 丟出 RangeError，把描字流程整個卡死。）
 */
function tone(delay: number, from: number, to: number, dur: number, type: OscillatorType, peak: number) {
  try {
    const ac = audio()
    if (!ac) return
    const at = ac.currentTime + delay
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, at)
    // exponentialRampToValueAtTime 的目標值不能是 0，也不能跨過 0
    if (to > 0 && to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + dur)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.linearRampToValueAtTime(peak, at + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(gain).connect(ac.destination)
    osc.start(at)
    osc.stop(at + dur + 0.03)
  } catch { /* 沒有音效也要能繼續玩 */ }
}

/** 點字卡。 */
export const tap = () => tone(0, 520, 880, 0.12, 'triangle', 0.11)
/** 換上一個／下一個。 */
export const swipe = () => tone(0, 900, 420, 0.16, 'sine', 0.08)
/** 描對一筆。每一筆往上爬一點，寫愈多愈有推進感。 */
export function stroke(index: number, total: number) {
  const pitch = 660 + (index / Math.max(total, 1)) * 520
  tone(0, pitch, pitch, 0.13, 'sine', 0.12)
}
/** 整個字寫完的小樂句。 */
export function cheer() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(i * 0.11, f, f, 0.26, 'triangle', 0.1))
}
