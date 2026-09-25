import { cliProviders } from '../ai-cli.mjs'
import { loadCharacters, saveCharacters, loadTemplate, loadProgress, productionDay } from '../core.mjs'
import { loadParts } from '../char-assets.mjs'

export const libraryRoutes = {
  'GET /library': () => {
    const db = loadCharacters()
    const production = productionDay(db)
    saveCharacters(db)
    return {
      // 版本全文只在 /prompt 給；這裡給下拉選單用的摘要，孩子端也不必下載整份
      characters: db.characters.map(({ promptVersions, ...entry }) => ({ ...entry,
        promptVersions: (promptVersions || []).map(({ id, provider, conceptZh, generatedAt }) => ({ id, provider, conceptZh, generatedAt })) })),
      deletedCharacters: (db.deletedCharacters || []).map((c) => ({ char: c.char, deletedAt: c.deletedAt })),
      template: loadTemplate(),
      progress: loadProgress(),
      // 字的家族跟字庫一起給：字庫一變就重算，不能像以前一樣在 build 時打包死
      parts: loadParts(),
      queue: production.queue,
      production,
      pendingAttempts: Object.values(db.production.days).flatMap((d) => d.attempts).filter((a) => !a.mediaFile && !a.failedAt && db.characters.some((c) => c.char === a.char)),
      cliProviders: cliProviders(),
    }
  },
}
