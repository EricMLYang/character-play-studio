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
export function say(text: string, rate = 0.75, volume = 1) {
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
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}
