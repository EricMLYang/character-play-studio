import { audioContext } from './sfx'

/**
 * 唸字。優先播伺服器預先做好的音檔（public/voice/，見 server/voice.mjs）：
 * 時機固定、手機也出聲、每台裝置一樣。沒有音檔的句子（字火車臨時接的詞、魔法鍋的反應）
 * 退回瀏覽器的系統朗讀。兩種都是「新的打斷舊的」，一次只唸一句。
 */
type Item = { file: string; dur: number }

let items: Record<string, Item> = {}
const buffers = new Map<string, Promise<AudioBuffer | null>>()
let current: { stop: () => void } | null = null

if (typeof fetch !== 'undefined' && typeof window !== 'undefined') {
  fetch('/voice/index.json').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.items) items = j.items }).catch(() => {})
}

/** 這句有沒有做好的音檔。 */
export const hasVoice = (text: string) => Boolean(items[text])
/** 音檔長度（秒）；沒有音檔回 undefined。 */
export const voiceDuration = (text: string) => items[text]?.dur

function load(text: string): Promise<AudioBuffer | null> {
  const item = items[text]
  if (!item) return Promise.resolve(null)
  let p = buffers.get(item.file)
  if (!p) {
    p = fetch(`/voice/${item.file}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
      .then((buf) => { const ac = audioContext(); return ac ? ac.decodeAudioData(buf) : null })
      .catch(() => null)
    buffers.set(item.file, p)
  }
  return p
}

/** 先把等一下會唸的句子抓下來解碼，開口時不用等。 */
export function preloadVoice(texts: (string | undefined)[]) {
  for (const t of texts) if (t && items[t]) void load(t)
}

function playFile(text: string, volume: number) {
  let source: AudioBufferSourceNode | null = null
  let cancelled = false
  current = { stop: () => { cancelled = true; try { source?.stop() } catch { /* 已經停了 */ } } }
  void load(text).then((buffer) => {
    const ac = audioContext()
    if (cancelled || !ac) return
    if (!buffer) { speak(text, 0.75, volume); return }
    source = ac.createBufferSource()
    source.buffer = buffer
    const gain = ac.createGain()
    gain.gain.value = volume
    source.connect(gain).connect(ac.destination)
    source.start()
  })
}

// ---------- 後援：系統朗讀 ----------
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

function speak(text: string, rate: number, volume: number) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-TW'
  u.rate = rate
  u.pitch = 1.15
  u.volume = volume
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
}

/** 唸一句。rate 只影響後援的系統朗讀（音檔的速度是做好的）。 */
export function say(text: string, rate = 0.75, volume = 1) {
  stopSpeech()
  if (items[text]) playFile(text, volume)
  else speak(text, rate, volume)
}

/** 唸 n 次，每次間隔 gap 毫秒。回傳取消函式。 */
export function sayRepeat(text: string, times = 3, gap = 1100, volume = 1) {
  let i = 0
  say(text, 0.75, volume)
  const id = setInterval(() => {
    if (++i >= times) return clearInterval(id)
    say(text, 0.75, volume)
  }, gap)
  return () => { clearInterval(id); stopSpeech() }
}

export function stopSpeech() {
  current?.stop()
  current = null
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}
