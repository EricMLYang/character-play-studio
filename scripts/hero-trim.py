# 主角圖最後一步（由 scripts/hero.mjs 呼叫）：把去背好的姿勢裁到人物、所有姿勢用同一個比例、底部對齊、放進正方形。
#   python hero-trim.py <去背資料夾> <輸出資料夾> <姿勢...>
import sys
from pathlib import Path
from PIL import Image

work, out, poses = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
SIZE = 512          # 輸出邊長
MARGIN = 0.04       # 四周留一點白，描邊濾鏡才不會被切

def clean(img):
    # 去背留下的淡淡雜點不算進人物範圍
    img = img.convert('RGBA')
    a = img.getchannel('A').point(lambda v: 255 if v > 24 else 0)
    return img, a.getbbox()

crops = {}
for pose in poses:
    src = work / f'{pose}.png'
    if not src.exists():
        continue
    img, box = clean(Image.open(src))
    if not box:
        print(f'  {pose}：去背後是空的，跳過'); continue
    crops[pose] = img.crop(box)

if not crops:
    sys.exit(0)
side = max(max(im.width, im.height) for im in crops.values())
canvas = int(side * (1 + MARGIN * 2))
scale = SIZE / canvas
out.mkdir(parents=True, exist_ok=True)
for pose, im in crops.items():
    sheet = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    # 底部對齊：腳站在同一條線上，上面留空；置中
    x = (canvas - im.width) // 2
    y = canvas - int(side * MARGIN) - im.height
    sheet.paste(im, (x, y), im)
    sheet = sheet.resize((SIZE, SIZE), Image.LANCZOS)
    sheet.save(out / f'{pose}.png', optimize=True)
    print(f'  {pose}：{im.width}×{im.height} → {SIZE}×{SIZE}（比例 {scale:.2f}）')
