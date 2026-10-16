// 手動重做唸字音檔（伺服器平常會自動補）：npm run voice
import { syncVoice, VOICE_NAME } from '../server/voice.mjs'

console.log(`用「${VOICE_NAME}」做唸字音檔 → public/voice/`)
const result = await syncVoice({ onProgress: (n, text) => { if (n % 50 === 0) console.log(`  …${n} 句（${text}）`) } })
if (result.skipped) { console.log(result.skipped === 'off' ? 'CPS_VOICE=off，跳過' : '只有 macOS 有 say，跳過'); process.exit(0) }
console.log(`共 ${result.total} 句（這次新做 ${result.written} 句）`)
if (result.failed.length) {
  console.log(`做不出來的 ${result.failed.length} 句（孩子端會退回即時朗讀）：`)
  for (const f of result.failed.slice(0, 10)) console.log(`  「${f.text}」：${f.error}`)
}
