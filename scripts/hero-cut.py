# 主角圖「從綠幕姿勢表切」的影像處理（由 scripts/hero-cut.mjs 呼叫）：
#   python hero-cut.py <設定檔.json> <姿勢表資料夾> <輸出資料夾>
# 姿勢表是生圖模型畫的：純綠（#00FF00）底、n×m 格、每格一個姿勢（版面規則見 assets/hero-sheets/README.md）。
#   1. 照綠色去背：半透明的邊把混進去的綠扣回來（還原原色），靠近背景的像素再壓掉殘留的綠（溢色），描邊外圈才不會帶綠邊。
#      淚水、汗滴這種淺藍色不是綠，會留下來。
#   2. 自動切格：找格子之間整條都是背景的空白，不寫死座標（每張圖的格線位置都有點不同）。
#   3. 排版：所有姿勢用同一個比例——以 ref（站姿）的身高佔滿畫布為準，坐著、跳起來、趴著的不各自撐滿；
#      水平用身體的重心置中、腳底對齊底部，輸出 512×512。
import json
import shutil
import sys
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

cfg = json.loads(Path(sys.argv[1]).read_text())
src_root, out = Path(sys.argv[2]), Path(sys.argv[3])
SIZE = 512          # 輸出邊長
MARGIN = 0.04       # 四周留一點白，描邊濾鏡才不會被切
SOLID = 24          # alpha 超過這個才算角色的一部分（算範圍用）
# 綠色的程度 = G - max(R, B)：背景約 245；描邊、皮膚、風衣、淚水都是負的
KEY_SOLID = 60      # 這以下算角色（完全不透明）
KEY_CLEAR = 235     # 這以上是背景（完全透明），中間是半透明的邊

def components(mask):
    """連通區塊（4 鄰），回傳 [(像素數, ys, xs)]。"""
    h, w = mask.shape
    seen = np.zeros((h, w), bool)
    parts = []
    for y, x in zip(*np.nonzero(mask)):
        if seen[y, x]:
            continue
        seen[y, x] = True
        q, ys, xs = deque([(y, x)]), [], []
        while q:
            cy, cx = q.popleft()
            ys.append(cy); xs.append(cx)
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        parts.append((len(ys), np.array(ys), np.array(xs)))
    return parts

def key_green(img):
    """綠幕去背，回傳 RGBA 陣列。"""
    rgb = np.array(img.convert('RGB'), dtype=np.float32)
    spill = rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])
    a = np.clip((KEY_CLEAR - spill) / (KEY_CLEAR - KEY_SOLID), 0, 1)
    # 半透明的邊：看到的顏色 = a×原色 + (1-a)×綠，反推原色
    edge = (a > 0.05) & (a < 1)
    green = np.array([0, 255, 0], np.float32)
    rgb[edge] = (rgb[edge] - (1 - a[edge, None]) * green) / a[edge, None]
    # 溢色：靠近背景（三格以內）的像素，G 不准比 R、B 都大。只管邊上，帽子上本來就偏綠的蝴蝶結不受影響
    near = np.array(Image.fromarray(((a < 1) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    g_cap = np.maximum(rgb[..., 0], rgb[..., 2])
    rgb[..., 1] = np.where(near, np.minimum(rgb[..., 1], g_cap), rgb[..., 1])
    return np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)

def gaps(profile, n, length):
    """一維投影找 n-1 條格線：每條取離「平均分」最近的一段空白的中間。找不到就回 None。"""
    runs, i = [], 0
    while i < length:
        if profile[i] == 0:
            j = i
            while j < length and profile[j] == 0:
                j += 1
            if i > 0 and j < length:  # 圖的最外圈不算格線
                runs.append((i, j))
            i = j
        else:
            i += 1
    cuts = []
    for k in range(1, n):
        want = length * k / n
        best = min(runs, key=lambda r: abs((r[0] + r[1]) / 2 - want), default=None)
        if best is None or abs((best[0] + best[1]) / 2 - want) > length / n / 2:
            return None
        cuts.append((best[0] + best[1]) // 2)
    return [0, *cuts, length]

def cut_sheet(name, spec):
    """切一張姿勢表，回傳 {姿勢: RGBA 圖（裁到角色）}。"""
    px = key_green(Image.open(src_root / spec['file']))
    solid = px[..., 3] > 128
    cols, rows = spec.get('grid', [3, 3])
    ys = gaps(solid.sum(1), rows, solid.shape[0])
    if not ys:
        sys.exit(f'姿勢表 {name}：找不到橫的格線（有角色跨到上下格了？生圖時要求格與格之間留白）')
    found = {}
    for r in range(rows):
        band = solid[ys[r]:ys[r + 1]]
        xs = gaps(band.sum(0), cols, band.shape[1])
        if not xs:
            sys.exit(f'姿勢表 {name}：第 {r + 1} 列找不到直的格線（有角色跨到左右格了？）')
        for c in range(cols):
            i = r * cols + c
            pose = spec['poses'][i] if i < len(spec['poses']) else None
            if not pose:
                continue
            cell = px[ys[r]:ys[r + 1], xs[c]:xs[c + 1]].copy()
            # 去掉零星的雜點；淚滴、發抖的線是分開的小塊但夠大，留著
            for n_, yy, xx in components(cell[..., 3] > 128):
                if n_ < spec.get('speck', 40):
                    cell[yy, xx, 3] = 0
            im = Image.fromarray(cell)
            box = im.getchannel('A').point(lambda v: 255 if v > SOLID else 0).getbbox()
            if not box:
                print(f'  {pose}：那一格是空的，跳過'); continue
            found[pose] = im.crop(box)
    return found

crops = {}
for name, spec in cfg['sheets'].items():
    if not (src_root / spec['file']).exists():
        # hero-cut.mjs 已經擋掉「非 optional 卻不在」的情況，到這裡的都是還沒生出來的 optional 表
        print(f'  姿勢表 {name}（{spec["file"]}）還沒有，先跳過：{"、".join(p for p in spec["poses"] if p)}')
        continue
    for pose, im in cut_sheet(name, spec).items():
        if spec.get('flip', cfg.get('flip', False)):
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        crops[pose] = (im, spec.get('scale', 1))

ref = cfg.get('ref', 'idle')
if ref not in crops:
    sys.exit(f'找不到基準姿勢 {ref}（設定的 ref）')
inner = SIZE * (1 - MARGIN * 2)
# 同一個係數：站姿的身高剛好佔滿；站不下的姿勢（手舉很高、橫躺很寬）只縮那一張並提醒
k = inner / (crops[ref][0].height * crops[ref][1])
out.mkdir(parents=True, exist_ok=True)
for pose, (im, s) in crops.items():
    f = k * s
    fit = min(1, inner / (im.width * f), inner / (im.height * f))
    if fit < 1:
        print(f'  {pose}：照站姿的比例會超出畫布，這張另外縮成 {fit:.2f} 倍')
    w, h = max(1, round(im.width * f * fit)), max(1, round(im.height * f * fit))
    small = im.resize((w, h), Image.LANCZOS)
    sheet = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    # 水平用「身體的重心」置中（伸出去的手不算數），超出畫布就推回來；底部對齊
    a = np.array(small.getchannel('A'), dtype=np.float64)
    cx = (a.sum(0) * np.arange(w)).sum() / max(a.sum(), 1)
    m = round(SIZE * MARGIN)
    x = int(min(max(SIZE / 2 - cx, m), SIZE - m - w)) if w <= SIZE - 2 * m else (SIZE - w) // 2
    y = SIZE - m - h
    sheet.paste(small, (x, y), small)
    sheet.save(out / f'{pose}.png', optimize=True)
    print(f'  {pose}：{im.width}×{im.height} → {w}×{h}')

# 同一張圖兩個名字（例如花生、小老鼠沒有放大鏡，think 就是托下巴的 ponder），劇本兩個都能寫
for pose, same in cfg.get('alias', {}).items():
    if same in crops:
        shutil.copyfile(out / f'{same}.png', out / f'{pose}.png')
        print(f'  {pose}：跟 {same} 同一張')

# 還沒生出來的姿勢先借別張頂著（例如 think 要等 C 表的「拿放大鏡」，先用 B 表的托下巴）
for pose, stand_in in cfg.get('fallback', {}).items():
    if pose not in crops and stand_in in crops:
        shutil.copyfile(out / f'{stand_in}.png', out / f'{pose}.png')
        print(f'  {pose}：還沒有，先用 {stand_in} 頂著')
