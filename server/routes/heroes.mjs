import { cancelJob, currentJob, finishHero, listHeroes, startFromUpload } from '../hero-maker.mjs'

/** 角色九宮格（Studio 才用；孩子端與 App 不會呼叫）：瀏覽所有主角的姿勢表，上傳圖片做新角色。 */
export const heroRoutes = {
  'GET /heroes': () => ({ heroes: listHeroes(), job: currentJob() }),

  // 圖片本身是 body；其他欄位放網址參數（跟 /import 一樣）
  'POST /heroes/upload': ({ url, buffer }) => {
    const q = (k) => (url.searchParams.get(k) || '').trim()
    return startFromUpload({
      id: q('id'), name: q('name'), look: q('look'), ext: q('ext').toLowerCase(), buffer,
      magenta: q('magenta') === '1', onlyA: q('onlyA') === '1',
    })
  },

  'POST /heroes/finish': ({ body }) => finishHero({ id: body.id, look: body.look, magenta: body.magenta }),

  'POST /heroes/cancel': () => cancelJob(),
}
