// 唸字音檔：孩子端會唸的每一句（字、語詞、小故事、小鎮自我介紹、動畫劇本的 cue）
// 預先用這台 Mac 的 `say` 做成 m4a，放在 public/voice/，前端照 index.json 播音檔。
// 好處：唸字時機是固定的（可以用音檔長度驗證）、手機上也出聲、每台裝置聲音一樣。
// 沒有音檔的句子（字火車臨時接出來的詞、魔法鍋的反應）前端會退回瀏覽器即時朗讀。
//
// 字庫一變動、動畫劇本一存檔，伺服器就會自動補做缺的句子；手動重做：npm run voice
// 換聲音：CPS_VOICE=Sandy npm run dev（會整批重做）；CPS_VOICE=off 完全關掉（測試用）。
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { ROOT, VOICE, loadCharacters } from './core.mjs'
import { linesForEntry } from '../shared/voice-lines.mjs'

export const VOICE_NAME = process.env.CPS_VOICE && process.env.CPS_VOICE !== 'off' ? process.env.CPS_VOICE : 'Meijia'
const enabled = () => process.platform === 'darwin' && process.env.CPS_VOICE !== 'off'
const INDEX = () => path.join(VOICE, 'index.json')
const CLIPS = path.join(ROOT, 'src/anim/clips')
const PARALLEL = 4

/** 音檔檔名：聲音＋句子的雜湊。換聲音就是另一組檔，舊的會在整批同步時清掉。 */
export const voiceFile = (text) => createHash('sha1').update(`${VOICE_NAME}\n${text}`).digest('hex').slice(0, 16) + '.m4a'

/** 一個字在孩子端會唸到的所有句子。句型跟畫面共用 shared/voice-lines.mjs，才會一字不差。 */
export const textsForEntry = linesForEntry

/** 整個字庫（含孩子端隱藏中的字，開放時才不用等）加上額外句子，去重。 */
export function voiceTexts(db, extra = []) {
  const out = new Set()
  for (const entry of db.characters) for (const t of textsForEntry(entry)) out.add(t)
  for (const t of extra) out.add(t)
  out.delete('')
  return [...out]
}

/** 動畫劇本裡 cues 的 say 字串（劇本一律寫成 say: '…'）。 */
export function clipSayTexts(dir = CLIPS) {
  const out = new Set()
  if (!fs.existsSync(dir)) return []
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.ts') || f === 'index.ts') continue
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/\bsay: '([^']+)'/g)) out.add(m[1])
  }
  return [...out]
}

export function loadVoiceIndex() {
  try { return JSON.parse(fs.readFileSync(INDEX(), 'utf8')) } catch (error) {
    if (error.code === 'ENOENT') return { voice: VOICE_NAME, items: {} }
    throw error
  }
}

function exec(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'] })
    let out = '', err = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} 失敗（${code}）：${err.trim() || out.trim()}`))))
    if (input !== undefined) { child.stdin.end(input) }
  })
}

/** 一句話 → m4a，回傳秒數。文字走 stdin，句子開頭是「-」也不會被當成參數。 */
async function render(text, out) {
  const tmp = path.join(os.tmpdir(), `cps-voice-${process.pid}-${Math.random().toString(36).slice(2)}.aiff`)
  try {
    await exec('say', ['-v', VOICE_NAME, '-o', tmp, '-f', '-'], text)
    await exec('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', tmp, out])
    const info = await exec('afinfo', [out])
    const dur = Number(/estimated duration: ([\d.]+)/.exec(info)?.[1])
    if (!Number.isFinite(dur)) throw new Error('讀不到音檔長度')
    return Math.round(dur * 1000) / 1000
  } finally { fs.rmSync(tmp, { force: true }) }
}

let queue = Promise.resolve()

/**
 * 補做缺的音檔。texts 給了就只做那幾句（加進索引，不清別的）；沒給就是整批：
 * 字庫全部＋劇本 cue，並清掉用不到的檔。一次只跑一個，連續呼叫會排隊。
 */
export function syncVoice({ texts, onProgress } = {}) {
  if (!enabled()) return Promise.resolve({ skipped: process.platform === 'darwin' ? 'off' : 'not-mac' })
  const run = async () => {
    fs.mkdirSync(VOICE, { recursive: true })
    const full = !texts
    const wanted = full ? voiceTexts(loadCharacters(), clipSayTexts()) : [...new Set(texts.filter(Boolean))]
    const index = loadVoiceIndex()
    if (index.voice !== VOICE_NAME) index.items = {}
    const items = full ? {} : { ...index.items }
    const todo = []
    for (const text of wanted) {
      const file = voiceFile(text)
      const known = index.items[text]
      if (known?.file === file && fs.existsSync(path.join(VOICE, file))) items[text] = known
      else todo.push(text)
    }
    const failed = []
    let written = 0
    const workers = Array.from({ length: PARALLEL }, async () => {
      for (let text = todo.shift(); text !== undefined; text = todo.shift()) {
        const file = voiceFile(text)
        try {
          const dur = await render(text, path.join(VOICE, file))
          items[text] = { file, dur }
          written++
          onProgress?.(written, text)
        } catch (error) {
          failed.push({ text, error: error.message })
        }
      }
    })
    await Promise.all(workers)
    if (full) {
      const keep = new Set(Object.values(items).map((i) => i.file))
      for (const name of fs.readdirSync(VOICE)) {
        if (name.endsWith('.m4a') && !keep.has(name)) fs.rmSync(path.join(VOICE, name))
      }
    }
    const next = { voice: VOICE_NAME, items }
    fs.writeFileSync(`${INDEX()}.tmp`, JSON.stringify(next) + '\n')
    fs.renameSync(`${INDEX()}.tmp`, INDEX())
    return { voice: VOICE_NAME, total: Object.keys(items).length, written, failed }
  }
  const result = queue.then(run)
  queue = result.catch(() => {})
  return result
}
