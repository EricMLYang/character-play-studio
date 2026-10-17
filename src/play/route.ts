import { useCallback, useEffect, useState } from 'react'

/**
 * 孩子端現在在哪：哪個畫面（首頁或某個遊戲）、有沒有開著某個字、有沒有在坐字火車。
 * 存在網址的 # 後面，手機的「返回」才會關掉字卡、回到上一個畫面，而不是整個離開網站。
 *
 *   #/            首頁
 *   #/lab         魔法鍋
 *   #/lab?c=口    魔法鍋上面開著「口」
 *   #/?ride=山木  首頁上面在坐「山木」字火車
 */
export type Route = { screen: string; char?: string; ride?: string }

export function parseRoute(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  const params = new URLSearchParams(query)
  return {
    screen: decodeURIComponent(path) || 'home',
    ...(params.get('c') ? { char: params.get('c')! } : {}),
    ...(params.get('ride') ? { ride: params.get('ride')! } : {}),
  }
}

export function formatRoute(route: Route): string {
  const params = new URLSearchParams()
  if (route.char) params.set('c', route.char)
  if (route.ride) params.set('ride', route.ride)
  const query = params.toString()
  return `#/${route.screen === 'home' ? '' : encodeURIComponent(route.screen)}${query ? `?${query}` : ''}`
}

/** 我們自己往前推了幾步。0 表示這一頁是直接打開的，關掉時不能 history.back()，不然會離開網站。 */
const depth = () => (history.state as { cpsDepth?: number } | null)?.cpsDepth || 0

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const onPop = () => setRoute(parseRoute(location.hash))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  /** 往前走一步（返回鍵會回來）；replace 是換掉目前這一步，例如字卡上一個／下一個不要一直疊。 */
  const go = useCallback((next: Route, { replace = false } = {}) => {
    const url = formatRoute(next)
    if (replace) history.replaceState({ cpsDepth: depth() }, '', url)
    else history.pushState({ cpsDepth: depth() + 1 }, '', url)
    setRoute(next)
  }, [])

  /** 回上一步：是我們推進來的就真的回上一頁，直接打開的網址就換成 fallback。 */
  const back = useCallback((fallback: Route) => {
    if (depth() > 0) history.back()
    else go(fallback, { replace: true })
  }, [go])

  return { route, go, back }
}
