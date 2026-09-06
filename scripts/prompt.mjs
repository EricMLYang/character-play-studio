#!/usr/bin/env node
import { loadCharacters, saveCharacters, findChar, productionDay, buildPrompt } from '../server/core.mjs'
import { generatePrompt, creativeBrief } from '../server/prompt-generation.mjs'
import { generateWithCli, cliProviders } from '../server/ai-cli.mjs'

const args = process.argv.slice(2).filter((a) => a !== '--')
const options = { provider: 'codex', model: '', direction: '' }
const chars = []
let today = false, preview = false, help = false
try {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--today') today = true
    else if (arg === '--preview') preview = true
    else if (arg === '--template') options.provider = 'template'
    else if (arg === '--help') help = true
    else if (['--provider', '--model', '--direction'].includes(arg)) {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${arg} 缺少值`)
      options[arg.slice(2)] = args[++i]
    } else if (arg.startsWith('-')) throw new Error(`不支援的選項：${arg}`)
    else chars.push(...arg)
  }
  if (help || (!today && !chars.length)) {
    console.log('用法：npm run prompt -- 山 --provider codex|claude|agy [--model 模型名稱] [--direction "創作方向"]\n' +
      '      npm run prompt -- --today --provider agy\n' +
      '      npm run prompt -- 雲 --preview     # 真實 AI 呼叫，只預覽，不寫入字庫\n' +
      '      npm run prompt -- 山 --template    # 明確使用本機備用模板\n\n' +
      '生成會保存創意版本，不計影片額度；預設使用 Codex。新增字只需國字，其餘由 AI 補齊。\n' +
      cliProviders().map((p) => `${p.name}: ${p.installed ? '已找到 CLI' : '未安裝'}`).join('\n'))
    process.exit(help ? 0 : 1)
  }
  if (today && chars.length) throw new Error('--today 與指定國字請擇一使用')
  const db = loadCharacters()
  const targets = today ? productionDay(db).queue : [...new Set(chars)]
  if (today && !preview) saveCharacters(db)
  if (!targets.length) { console.log('今天沒有新的待製作字。'); process.exit(0) }
  for (const char of targets) {
    if (!/^\p{Script=Han}$/u.test(char)) throw new Error(`「${char}」不是單一國字`)
    let entry = findChar(char)
    if (!entry) {
      entry = { char, meaning: '', zhuyin: '', emoji: '✨', concept: { object: '', morph: '', hook: '' },
        status: 'seed', priority: db.characters.length + 1, media: [], feedback: [] }
      if (!preview) { const current = loadCharacters(); current.characters.push(entry); saveCharacters(current) }
    }
    console.error(`→ ${options.provider} 正在設計「${char}」…`)
    const prompt = preview && options.provider !== 'template'
      ? await generateWithCli({ ...options, char, brief: creativeBrief(entry, db.characters, options.direction) })
      : preview ? buildPrompt(entry) : await generatePrompt({ ...options, char })
    console.log(prompt.formatted || `【目標國字】：${char}\n【設計概念】：${prompt.conceptZh}\n【創意方向】：${prompt.creativeAngle}\n【8s Video Prompt】:\n${prompt.promptEn}`)
    if (prompt.actualModel) console.error(`模型：${prompt.actualModel}`)
  }
} catch (error) { console.error(error.message); process.exitCode = 1 }
