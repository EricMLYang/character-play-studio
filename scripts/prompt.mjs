#!/usr/bin/env node
// 用法：
//   npm run prompt 山            單一個字
//   npm run prompt -- --today    今天該生的 3 個字
import { buildPrompt, findChar, todaysQueue } from '../server/core.mjs'

const args = process.argv.slice(2)
const targets = args.includes('--today')
  ? todaysQueue(3)
  : args.filter((a) => !a.startsWith('--')).flatMap((a) => [...a]).map((c) => {
      const e = findChar(c)
      if (!e) console.error(`⚠️  字庫裡沒有「${c}」，先在 Studio 加進去`)
      return e
    }).filter(Boolean)

if (!targets.length) {
  console.error('用法：npm run prompt 山   或   npm run prompt -- --today')
  process.exit(1)
}

for (const entry of targets) {
  console.log('\n' + '─'.repeat(60))
  console.log(buildPrompt(entry).formatted)
}
console.log()
