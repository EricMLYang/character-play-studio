# 主角圖最後一步（由 scripts/hero.mjs 呼叫）：把去背好的姿勢裁到人物、所有姿勢用同一個比例、底部對齊、放進正方形。
#   python hero-trim.py <去背資料夾> <輸出資料夾> <姿勢...>
import sys
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

work, out, poses = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3:]
SIZE = 512          # 輸出邊長
MARGIN = 0.04       # 四周留一點白，描邊濾鏡才不會被切

def drop_shadows(img):
    """
    模型常在腳下畫一圈淡淡的影子，去背後留成一塊跟人物分開的灰色（例如小老鼠 happy）。
    跟最大那塊（人物）分開、幾乎沒有顏色、很透明、又在人物底部附近的色塊，就是影子，清掉。
    2026-10-21 掃過所有主角的姿勢，只有 mouse/happy 與 alien/surprised 符合，其他都不受影響。
    """
    px = np.array(img)
    alpha = px[..., 3]
    mask = alpha > 24
    h, w = mask.shape
    seen = np.zeros((h, w), bool)
    parts = []
    for y, x in zip(*np.nonzero(mask)):
        if seen[y, x]:
            continue
        seen[y, x] = True
        q, pts = deque([(y, x)]), []
        while q:
            cy, cx = q.popleft()
            pts.append((cy, cx))
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        parts.append(pts)
    if len(parts) < 2:
        return img
    parts.sort(key=len, reverse=True)
    bottom = max(p[0] for p in parts[0])
    for pts in parts[1:]:
        ys = np.array([p[0] for p in pts]); xs = np.array([p[1] for p in pts])
        rgb = px[ys, xs, :3] / 255
        sat = (rgb.max(1) - rgb.min(1)).mean()
        if len(pts) > 200 and sat < 0.05 and px[ys, xs, 3].mean() < 120 and ys.min() > bottom - 40:
            px[ys, xs, 3] = 0
    return Image.fromarray(px)

def clean(img):
    # 去背留下的淡淡雜點、腳下的影子不算進人物範圍
    img = drop_shadows(img.convert('RGBA'))
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
