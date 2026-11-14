# 切「生圖模型畫的九宮格」共用的影像處理（scripts/hero-cut.py 主角姿勢表、scripts/prop-cut.py 道具表都用它）。
#   - key：照背景色去背（綠幕 #00FF00、洋紅 #FF00FF 都可以：背景色是「亮的通道全滿、暗的通道全空」那種純色）
#   - gaps：一維投影找格線（格子之間整條都是背景的空白，不寫死座標）
#   - cells：去背後切成 n×m 格，每格去掉零星雜點、裁到內容
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

SOLID = 24          # alpha 超過這個才算內容的一部分（算範圍用）
# 背景色的程度：綠幕是 G - max(R, B)、洋紅是 min(R, B) - G。背景約 245；描邊、皮膚、淚水、冰塊都是負的
KEY_SOLID = 60      # 這以下算內容（完全不透明）
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

def parse_key(hex_color):
    """'#FF00FF' → (背景色, 亮的通道, 暗的通道)。只收純色（每個通道不是全滿就是全空），去背的公式才成立。"""
    rgb = [int(hex_color.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    on = [i for i, v in enumerate(rgb) if v >= 128]
    off = [i for i, v in enumerate(rgb) if v < 128]
    if not on or not off or any(32 < v < 224 for v in rgb):
        raise SystemExit(f'背景色 {hex_color} 不能用：要是純綠 #00FF00、洋紅 #FF00FF 這種「通道不是全滿就是全空」的顏色')
    return np.array(rgb, np.float32), on, off

def key(img, hex_color='#00FF00'):
    """照背景色去背，回傳 RGBA 陣列。"""
    bg, on, off = parse_key(hex_color)
    rgb = np.array(img.convert('RGB'), dtype=np.float32)
    lo = rgb[..., on].min(-1)       # 亮的通道裡最小的
    cap = rgb[..., off].max(-1)     # 暗的通道裡最大的
    spill = lo - cap
    a = np.clip((KEY_CLEAR - spill) / (KEY_CLEAR - KEY_SOLID), 0, 1)
    # 半透明的邊：看到的顏色 = a×原色 + (1-a)×背景色，反推原色
    edge = (a > 0.05) & (a < 1)
    rgb[edge] = (rgb[edge] - (1 - a[edge, None]) * bg) / a[edge, None]
    # 溢色：靠近背景（三格以內）的像素，不准帶背景色（亮的通道都扣到不比暗的通道大）。
    # 只管邊上，帽子上本來就偏綠的蝴蝶結不受影響。綠幕只有一個亮的通道，等於 G 不准比 R、B 都大
    near = np.array(Image.fromarray(((a < 1) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    lo = rgb[..., on].min(-1)
    cap = rgb[..., off].max(-1)
    for c in on:
        rgb[..., c] = np.where(near, np.minimum(rgb[..., c], cap + (rgb[..., c] - lo)), rgb[..., c])
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

def cells(path, name, grid, names, bg='#00FF00', speck=40, halo=0):
    """
    切一張九宮格，回傳 {名字: RGBA 圖（裁到內容）}。names 照「左到右、上到下」每格的名字，None 跳過。
    speck：比這個小的零星色塊當雜點清掉（淚滴、發抖的線、雪花是分開的小塊但夠大，留著）。
    halo：大於 0 就把離實心內容超過這麼多像素的淡色（半透明）雜訊清掉——生圖的邊框常有一圈淡淡的不是背景色的像素，
      會把裁切範圍撐大（道具表用；主角姿勢表不用，切出來的圖才跟以前一模一樣）。
    """
    px = key(Image.open(path), bg)
    solid = px[..., 3] > 128
    cols, rows = grid
    ys = gaps(solid.sum(1), rows, solid.shape[0])
    if not ys:
        raise SystemExit(f'{name}：找不到橫的格線（有東西跨到上下格了？生圖時要求格與格之間留白）')
    found = {}
    for r in range(rows):
        band = solid[ys[r]:ys[r + 1]]
        xs = gaps(band.sum(0), cols, band.shape[1])
        if not xs:
            raise SystemExit(f'{name}：第 {r + 1} 列找不到直的格線（有東西跨到左右格了？）')
        for c in range(cols):
            i = r * cols + c
            label = names[i] if i < len(names) else None
            if not label:
                continue
            cell = px[ys[r]:ys[r + 1], xs[c]:xs[c + 1]].copy()
            for n_, yy, xx in components(cell[..., 3] > 128):
                if n_ < speck:
                    cell[yy, xx, 3] = 0
            if halo:
                near = Image.fromarray(((cell[..., 3] > 128) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * halo + 1))
                cell[np.array(near) == 0, 3] = 0
            im = Image.fromarray(cell)
            box = im.getchannel('A').point(lambda v: 255 if v > SOLID else 0).getbbox()
            if not box:
                print(f'  {label}：那一格是空的，跳過'); continue
            found[label] = im.crop(box)
    return found
