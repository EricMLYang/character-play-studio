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
/** 丟進鍋子：噗通。 */
export const plop = () => tone(0, 320, 140, 0.18, 'sine', 0.14)
/** 攪一攪：一串往上冒的泡泡。 */
export function bubble() {
  ;[0, 0.14, 0.26, 0.4, 0.5, 0.62, 0.72].forEach((t, i) => tone(t, 300 + i * 70 + (i % 2) * 90, 600 + i * 90, 0.09, 'sine', 0.08))
}
/** 變出來了：碰的一聲接一個亮音。 */
export function poof() {
  tone(0, 180, 60, 0.22, 'triangle', 0.14)
  tone(0.12, 880, 1760, 0.3, 'sine', 0.09)
}

// ---------- 動畫短片用（src/anim）----------
/** 蛋殼裂開：兩聲短促的喀。 */
export function crack() {
  tone(0, 1400, 300, 0.06, 'square', 0.05)
  tone(0.07, 900, 200, 0.08, 'square', 0.04)
}
/** 彈一下。 */
export const boing = () => tone(0, 200, 620, 0.2, 'sine', 0.12)
/** 杯子碰杯子。 */
export function clink() {
  tone(0, 2100, 2100, 0.12, 'triangle', 0.06)
  tone(0.03, 2700, 2700, 0.1, 'triangle', 0.04)
}
/** 咕嚕咕嚕。 */
export function gulp() {
  ;[0, 0.2, 0.4].forEach((t) => tone(t, 320, 140, 0.13, 'sine', 0.13))
}
/** 悶悶的雷聲：低頻往下沉，刻意壓小，不要嚇到人。 */
export function rumble() {
  tone(0, 95, 38, 0.9, 'sawtooth', 0.07)
  tone(0.06, 70, 32, 1.0, 'triangle', 0.12)
}
/** 東西砸到頭：咚＋一聲亮的。 */
export function bonk() {
  tone(0, 260, 90, 0.16, 'triangle', 0.16)
  tone(0.02, 1500, 1200, 0.08, 'square', 0.04)
}
/** 咻：快速飛過去。 */
export const whoosh = () => tone(0, 300, 1400, 0.22, 'sine', 0.06)
/** 滑音笛往上：跳很高、嚇一大跳。 */
export const slide = () => tone(0, 400, 1600, 0.45, 'sine', 0.09)
/** 滑音笛往下：失望、洩氣。 */
export const deflate = () => tone(0, 900, 180, 0.6, 'sine', 0.09)
/** 噗滋噴水。 */
export function splash() {
  ;[0, 0.05, 0.1, 0.15].forEach((t, i) => tone(t, 1200 - i * 150, 300, 0.1, 'sine', 0.07))
}
/** 打嗝：嗝！ */
export const hic = () => tone(0, 500, 900, 0.09, 'square', 0.06)
/** 小小的冒出來。 */
export const blip = () => tone(0, 700, 1300, 0.08, 'sine', 0.08)
/** 雷射：咻嗶。 */
export function laser() {
  tone(0, 1900, 260, 0.18, 'square', 0.05)
  tone(0.02, 2400, 400, 0.14, 'sine', 0.05)
}
/** 哈——啾！ */
export function achoo() {
  tone(0, 300, 700, 0.35, 'sine', 0.06)
  tone(0.4, 1400, 200, 0.16, 'square', 0.08)
  tone(0.42, 900, 150, 0.2, 'sawtooth', 0.05)
}
