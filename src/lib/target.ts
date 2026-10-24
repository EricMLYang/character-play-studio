/**
 * 現在跑的是哪一版：網頁版（npm run dev，紀錄送到 Mac）或 iPad 單機版（npm run app:build，紀錄存在裝置上）。
 * 值在 vite.config.ts 的 define 裡定；Node 跑測試時沒有 define，一律當網頁版。
 */
export const STANDALONE: boolean = typeof __CPS_STANDALONE__ === 'boolean' && __CPS_STANDALONE__
export const BUILD = typeof __CPS_BUILD__ === 'object' ? __CPS_BUILD__ : { version: 'dev', build: 0 }
