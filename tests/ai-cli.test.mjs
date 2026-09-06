import { test } from 'node:test'
import assert from 'node:assert/strict'
import { commandArgs, parseCliOutput, validateResult, runProcess } from '../server/ai-cli.mjs'

const result = { char: '日', meaning: 'sun', zhuyin: 'ㄖˋ', emoji: '☀️', conceptZh: '積木透光形成日字',
  object: 'wooden blocks', morph: 'blocks frame a glowing bar', creativeAngle: '利用光影而非果凍形變',
  promptEn: 'An 8-second single shot showing wooden blocks around one golden sun. Light passes through the blocks to form the Traditional Chinese glyph 日, perfectly centered with thick readable strokes, held for the final four seconds. Repeat ri in Taiwanese Mandarin.' }

test('all CLI adapters use structured output and no permission bypass', () => {
  for (const provider of ['codex', 'claude', 'agy']) {
    const args = commandArgs(provider, 'model-test', '/tmp/schema.json', 'quoted "$()" brief')
    assert.ok(args.includes('model-test'))
    assert.ok(!args.some((a) => a.includes('dangerously')))
  }
  assert.ok(commandArgs('codex', '', '/tmp/schema', '').includes('read-only'))
  assert.ok(commandArgs('claude', '', '', '').includes('--tools'))
  assert.ok(commandArgs('agy', '', '', 'literal $(data)').includes('literal $(data)'))
})

test('parse Codex event stream, Claude schema envelope and agy result envelope', () => {
  const codex = [{ type: 'thread.started' }, { type: 'item.completed', item: { type: 'agent_message', text: JSON.stringify(result) } }, { type: 'turn.completed' }]
  assert.equal(parseCliOutput('codex', codex.map(JSON.stringify).join('\n')).result.char, '日')
  const claude = { type: 'result', structured_output: result, modelUsage: { 'model-reported-by-cli': {} } }
  assert.equal(parseCliOutput('claude', JSON.stringify(claude)).actualModel, 'model-reported-by-cli')
  assert.equal(parseCliOutput('agy', JSON.stringify({ result: JSON.stringify(result) })).result.promptEn, result.promptEn)
})

test('invalid JSON, CLI errors, wrong glyph and missing video timing fail without a template fallback', () => {
  assert.throws(() => parseCliOutput('codex', 'login required'), /沒有回傳/)
  assert.throws(() => parseCliOutput('claude', JSON.stringify({ is_error: true, result: 'auth failed' })), /失敗/)
  assert.throws(() => validateResult({ ...result, char: '月' }, '日'), /不符/)
  assert.throws(() => validateResult({ ...result, promptEn: 'too short' }, '日'), /不符|完整/)
  assert.equal(validateResult(result, '日').conceptZh, result.conceptZh)
})

test('runner passes prompt text literally via stdin and surfaces process failure', async () => {
  const data = 'Do not execute $(echo unsafe) or `commands`; just return text.'
  const output = await runProcess(process.execPath, ['-e', 'process.stdin.pipe(process.stdout)'], { input: data })
  assert.equal(output, data)
  await assert.rejects(runProcess(process.execPath, ['-e', 'process.exit(7)']), /結束代碼 7/)
})

test('timeouts and cancellation stop the CLI process', async () => {
  await assert.rejects(runProcess(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeoutMs: 30 }), /逾時/)
  const controller = new AbortController()
  const promise = runProcess(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { signal: controller.signal })
  controller.abort()
  await assert.rejects(promise, /取消/)
})
