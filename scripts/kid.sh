#!/usr/bin/env bash
# 小孩模式：全螢幕 kiosk 開起來，用獨立的 Chrome 設定檔
# （沒有你的書籤、分頁、擴充功能、瀏覽紀錄）
set -e

URL="http://localhost:5180"
PROFILE="$HOME/Library/Application Support/character-play-kiosk"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "找不到 Google Chrome，請確認已安裝於 /Applications" >&2
  exit 1
fi

# dev server 沒開就先開起來
if ! curl -s -m 2 -o /dev/null "$URL"; then
  echo "→ 啟動 dev server…"
  ( cd "$(dirname "$0")/.." && npm run dev >/tmp/character-play-dev.log 2>&1 & )
  for _ in $(seq 1 40); do
    curl -s -m 1 -o /dev/null "$URL" && break
    sleep 0.5
  done
fi

mkdir -p "$PROFILE"
echo "→ 開啟小孩模式（要離開按 Cmd+Q）"
"$CHROME" \
  --kiosk \
  --user-data-dir="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-features=Translate,TabHoverCards \
  --autoplay-policy=no-user-gesture-required \
  "$URL" >/dev/null 2>&1 &
