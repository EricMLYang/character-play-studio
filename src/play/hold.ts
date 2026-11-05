import { useSyncExternalStore } from 'react'

/**
 * 「先等一下再慶祝」：魔法筆一輪還沒演完的時候，加冕、開寶箱、今日戰報先不要蓋上來。
 * 星星是寫完字、紀錄一送出就算的，不擋的話加冕會在變身演到一半跳出來，搶掉他最「哇」的那一下，
 * 兩邊還會同時唸話。字卡那邊用「字卡關掉才出戰報」擋（PlayApp），這裡是給遊戲自己說「我在演」。
 */
let held = false
const listeners = new Set<() => void>()

export function holdCelebrations(on: boolean) {
  if (held === on) return
  held = on
  listeners.forEach((l) => l())
}

export function useCelebrationsHeld() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => held, () => false)
}
