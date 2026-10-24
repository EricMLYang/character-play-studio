import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './server/api.mjs'

/**
 * iPad 單機版的內容安全政策：只准讀 App 自己的檔案，不准連任何外部網址、不准載外部腳本、
 * 不准送表單或嵌入別的網頁。App 本來就不需要網路，這是第二道防線（docs/ipad-app-plan.md 2-9）。
 * style 要 'unsafe-inline'：hanzi-writer 與動畫用 style 屬性擺位置。
 */
export const APP_CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:", "media-src 'self' blob:", "font-src 'self'", "connect-src 'self'",
  "object-src 'none'", "frame-src 'none'", "base-uri 'none'", "form-action 'none'",
].join('; ')

function appCsp(): Plugin {
  return {
    name: 'cps-app-csp',
    transformIndexHtml: (html) => html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${APP_CSP}" />`),
  }
}

/** 顯示版本用 package.json；建置號用 git commit 數，TestFlight 每次上傳都要比上一次大 */
function buildInfo() {
  const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
  let build = 0
  try { build = Number(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim()) || 0 } catch { /* 不在 git 裡就是 0 */ }
  return { version, build }
}

// npm run dev／build 是網頁版；--mode app（npm run app:build 會叫）是 iPad 單機版，輸出到 dist-app/
export default defineConfig(({ mode }) => {
  const app = mode === 'app'
  return {
    plugins: app ? [react(), appCsp()] : [react(), apiPlugin()],
    server: { port: 5180, open: '/' },
    define: {
      __CPS_STANDALONE__: JSON.stringify(app),
      __CPS_BUILD__: JSON.stringify(app ? buildInfo() : { version: 'dev', build: 0 }),
    },
    build: app ? { outDir: 'dist-app', emptyOutDir: true } : undefined,
  }
})
