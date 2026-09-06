import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

export const OUTPUT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: Object.fromEntries(['char', 'meaning', 'zhuyin', 'emoji', 'conceptZh', 'object', 'morph', 'creativeAngle', 'promptEn']
    .map((key) => [key, { type: 'string' }])),
  required: ['char', 'meaning', 'zhuyin', 'emoji', 'conceptZh', 'object', 'morph', 'creativeAngle', 'promptEn'],
}

const PROVIDERS = { codex: 'Codex', claude: 'Claude Code', agy: 'Google agy' }
export function executable(provider) {
  if (!Object.hasOwn(PROVIDERS, provider)) throw new Error('請選擇 Codex、Claude Code 或 Google agy')
  const override = process.env[`CPS_${provider.toUpperCase()}_BIN`]
  const candidates = override ? [override] : (process.env.PATH || '').split(path.delimiter).map((dir) => path.join(dir, provider))
  return candidates.find((file) => {
    try { fs.accessSync(file, fs.constants.X_OK); return fs.statSync(file).isFile() } catch { return false }
  })
}
export function cliProviders() {
  return Object.entries(PROVIDERS).map(([id, name]) => ({ id, name, installed: Boolean(executable(id)) }))
}

export function commandArgs(provider, model, schemaPath, brief) {
  const schema = JSON.stringify(OUTPUT_SCHEMA)
  const modelArgs = model ? ['--model', model] : []
  if (provider === 'codex') return ['exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check',
    '--sandbox', 'read-only', '-c', 'approval_policy="never"', '--output-schema', schemaPath, '--json', ...modelArgs, '-']
  if (provider === 'claude') return ['--print', '--safe-mode', '--tools', '', '--strict-mcp-config',
    '--mcp-config', '{"mcpServers":{}}', '--no-session-persistence', '--output-format', 'json',
    '--json-schema', schema, ...modelArgs]
  if (provider === 'agy') return ['--print', brief, '--mode', 'plan', '--sandbox', '--disable-slash-commands',
    '--output-format', 'json', '--json-schema', schema, '--print-timeout', '4m', ...modelArgs]
  throw new Error('不支援的 CLI')
}

function parseObject(value) {
  if (value && typeof value === 'object') return value
  if (typeof value !== 'string') return null
  try { return JSON.parse(value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')) } catch { return null }
}

export function parseCliOutput(provider, stdout) {
  const envelope = parseObject(stdout)
  const events = envelope ? [envelope] : stdout.split('\n').map(parseObject).filter(Boolean)
  const failed = events.find((event) => event.is_error || event.type === 'turn.failed' || event.type === 'error')
  if (failed) throw new Error('CLI 回報生成失敗；請在終端機確認登入與模型額度後重試')
  const candidates = []
  let actualModel
  for (const event of events) {
    if (event.modelUsage) actualModel = Object.keys(event.modelUsage).join(', ')
    if (typeof event.model === 'string') actualModel = event.model
    candidates.push(event, parseObject(event.structured_output), parseObject(event.result), parseObject(event.response))
    if (event.item?.type === 'agent_message') candidates.push(parseObject(event.item.text))
    if (event.type === 'result' && event.content) candidates.push(parseObject(event.content))
  }
  const result = candidates.filter(Boolean).reverse().find((value) => typeof value.promptEn === 'string')
  if (!result) throw new Error(`${PROVIDERS[provider]} 沒有回傳可用的 prompt；請重試或換一個模型`)
  return { result, actualModel }
}

export function validateResult(result, char) {
  for (const key of OUTPUT_SCHEMA.required) {
    if (typeof result[key] !== 'string' || !result[key].trim() || result[key].length > 16000) throw new Error(`AI 回傳的 ${key} 不完整，請重新生成`)
  }
  if (result.char.trim() !== char || !result.promptEn.includes(char)) throw new Error('AI 回傳的目標國字不符，請重新生成')
  if (result.promptEn.length < 120 || !/(?:8|eight)[ -]*(?:second|s\b)/i.test(result.promptEn)) {
    throw new Error('AI 沒有提供完整的 8 秒影片 prompt，請重新生成')
  }
  return Object.fromEntries(OUTPUT_SCHEMA.required.map((key) => [key, result[key].trim()]))
}

/** Fixed executables/argument arrays. Model text is stdin/data, never shell code. */
export function runProcess(file, args, { cwd, input, signal, timeoutMs = 240000, env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('已取消生成'))
    const child = spawn(file, args, { cwd, env, shell: false, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] })
    child.stdout.setEncoding('utf8')
    let stdout = '', bytes = 0, failure
    const kill = () => {
      try { if (process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL') } catch { /* Already exited. */ }
    }
    const stop = (message) => { failure ||= new Error(message); kill() }
    const abort = () => stop('已取消生成')
    signal?.addEventListener('abort', abort, { once: true })
    const timer = setTimeout(() => stop('生成逾時，請重試或選擇其他工具／模型'), timeoutMs)
    const clean = () => { clearTimeout(timer); signal?.removeEventListener('abort', abort) }
    child.on('error', (error) => { clean(); reject(new Error(`CLI 無法啟動：${error.code || 'unknown error'}`)) })
    child.stdout.on('data', (chunk) => {
      bytes += Buffer.byteLength(chunk)
      if (bytes > 2 * 1024 * 1024) stop('CLI 輸出過大，已停止生成')
      else stdout += chunk
    })
    // Drain diagnostics without returning potentially sensitive CLI configuration/logs to the browser.
    child.stderr.on('data', (chunk) => { bytes += chunk.length; if (bytes > 2 * 1024 * 1024) stop('CLI 輸出過大，已停止生成') })
    child.stdin.on('error', () => {})
    child.on('close', (code) => {
      clean()
      if (failure) reject(failure)
      else if (code !== 0) reject(new Error(`CLI 結束代碼 ${code}；請在終端機確認登入、模型名稱與額度，再重試`))
      else resolve(stdout)
    })
    child.stdin.end(input || '')
  })
}

export async function generateWithCli({ provider, model = '', brief, char, signal }) {
  if (typeof model !== 'string' || model.length > 120 || (model && !/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/.test(model))) throw new Error('模型名稱格式不正確')
  const file = executable(provider)
  if (!file) throw new Error(`找不到 ${PROVIDERS[provider]}，請先安裝並登入，再重新啟動 Studio`)
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-prompt-'))
  try {
    const schemaPath = path.join(temporary, 'output-schema.json')
    fs.writeFileSync(schemaPath, JSON.stringify(OUTPUT_SCHEMA))
    const stdout = await runProcess(file, commandArgs(provider, model, schemaPath, brief), {
      cwd: temporary, input: provider === 'agy' ? '' : brief, signal,
    })
    const { result, actualModel } = parseCliOutput(provider, stdout)
    return { ...validateResult(result, char), provider, requestedModel: model || null,
      actualModel: actualModel || null, generatedAt: new Date().toISOString(), id: randomUUID() }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }) }
}
