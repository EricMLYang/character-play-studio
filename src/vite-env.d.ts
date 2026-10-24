/// <reference types="vite/client" />

/** vite.config.ts 的 define：iPad 單機版（npm run app:build）是 true，網頁版是 false */
declare const __CPS_STANDALONE__: boolean
/** 單機版的版本：顯示版本、建置號（git commit 數，TestFlight 每次上傳都要比上次大） */
declare const __CPS_BUILD__: { version: string; build: number }
