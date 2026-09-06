// Isolated manual/browser testing. Never writes fixture data to the real library.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'

const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-browser-'))
process.env.CPS_STORAGE_ROOT = storage
const { saveCharacters, ROOT } = await import('../server/core.mjs')
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8'))
delete db.production
for (const c of db.characters) {
  c.media = []; c.feedback = []; c.needsRedo = false; c.status = 'seed'
  c.promptVersions = []; delete c.activePromptId
}
saveCharacters(db)
const server = await createServer({ server: { host: '127.0.0.1', port: 5181, strictPort: true, open: false } })
await server.listen()
console.log(`Test studio: http://127.0.0.1:5181/studio\nIsolated storage: ${storage}`)
const shutdown = async () => { await server.close(); fs.rmSync(storage, { recursive: true, force: true }); process.exit(0) }
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
