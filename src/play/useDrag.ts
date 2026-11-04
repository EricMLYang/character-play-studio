import { useCallback, useEffect, useRef } from 'react'
import { insideTarget, isDragStart, tiltFor } from './dragDrop'
import { letGo, pickUp } from '../lib/sfx'

/**
 * 把卡片拖到一個目標上（dragDrop.ts 有為什麼）。
 *
 *   const drag = useDrag({ target: () => mouth.current, onDrop: pick })
 *   <button {...drag(c)} onClick={() => pick(c)}>…</button>
 *
 * - 點一下：什麼都不做，照原本的 onClick 走（他只會點也玩得下去）
 * - 拖超過 10px：卡片跟著手指走、放大一點、往移動方向斜；目標亮起來（.drop-ready）
 * - 放在目標上：卡片彈回原位，呼叫 onDrop（跟點那一張一模一樣，音效由遊戲自己出）
 * - 放在別的地方：彈簧一樣彈回原位，什麼都不算
 *
 * 一律直接改 DOM 的 style，不經過 React：手指移動一秒六十次，重畫整個遊戲在 iPad 上會卡。
 */
export function useDrag({ target, onDrop, onHover }: {
  target: () => HTMLElement | null
  onDrop: (id: string) => void
  /** 卡片拿到目標上面／離開（怪獸張嘴之類的） */
  onHover?: (over: boolean) => void
}) {
  const live = useRef({ target, onDrop, onHover })
  live.current = { target, onDrop, onHover }
  /** 剛剛拖過：放開後瀏覽器還會補一個 click，要吃掉，不然同一張會被算兩次 */
  const swallow = useRef(false)
  const stop = useRef<() => void>(() => {})
  useEffect(() => () => stop.current(), [])

  return useCallback((id: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || (e.currentTarget as HTMLButtonElement).disabled) return
      stop.current()
      const el = e.currentTarget
      const x0 = e.clientX
      const y0 = e.clientY
      let dragging = false
      let over = false
      let lastX = x0
      const setOver = (next: boolean) => {
        if (next === over) return
        over = next
        live.current.target()?.classList.toggle('drop-ready', next)
        live.current.onHover?.(next)
      }
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - x0
        const dy = ev.clientY - y0
        if (!dragging) {
          if (!isDragStart(dx, dy)) return
          dragging = true
          pickUp()
          el.classList.add('dragging')
          el.style.transition = 'none'
          try { el.setPointerCapture(ev.pointerId) } catch { /* 有些瀏覽器拿不到也沒關係 */ }
        }
        const tilt = tiltFor(ev.clientX - lastX)
        lastX = ev.clientX
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.08) rotate(${tilt}deg)`
        setOver(insideTarget(ev.clientX, ev.clientY, live.current.target()?.getBoundingClientRect() ?? null))
      }
      const up = () => {
        cleanup()
        if (!dragging) return
        swallow.current = true
        setTimeout(() => { swallow.current = false }, 0)
        const hit = over
        setOver(false)
        el.classList.remove('dragging')
        // 彈回原位：放對了快一點（接著就要演吃掉／卡進去），放錯了像彈簧一樣晃回去
        el.style.transition = hit ? 'transform .22s cubic-bezier(.2,.9,.3,1.2)' : 'transform .5s cubic-bezier(.3,1.7,.5,1)'
        el.style.transform = ''
        const clear = () => { el.style.transition = ''; el.removeEventListener('transitionend', clear) }
        el.addEventListener('transitionend', clear)
        // 放對了不出聲：放進去之後的「喀」「啊嗚」由遊戲自己演（跟點一下同一套），這裡再響一聲會疊在一起
        if (hit) live.current.onDrop(id); else letGo()
      }
      const cleanup = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        stop.current = () => {}
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
      stop.current = () => { cleanup(); el.classList.remove('dragging'); el.style.transform = ''; el.style.transition = '' }
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (swallow.current) { e.preventDefault(); e.stopPropagation(); swallow.current = false }
    },
    'data-drag': '',
  }), [])
}
