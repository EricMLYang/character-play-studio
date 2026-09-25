import { cliProviders } from '../ai-cli.mjs'
import { loadCharacters, saveCharacters, loadTemplate, loadProgress, productionDay } from '../core.mjs'

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
      queue: production.queue,
      production,
      pendingAttempts: Object.values(db.production.days).flatMap((d) => d.attempts).filter((a) => !a.mediaFile && !a.failedAt && db.characters.some((c) => c.char === a.char)),
      cliProviders: cliProviders(),
    }
  },
}
