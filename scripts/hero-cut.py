# 主角圖「從綠幕姿勢表切」的影像處理（由 scripts/hero-cut.mjs 呼叫）：
#   python hero-cut.py <設定檔.json> <姿勢表資料夾> <輸出資料夾>
# 姿勢表是生圖模型畫的：純綠（#00FF00）底、n×m 格、每格一個姿勢（版面規則見 assets/hero-sheets/README.md）。
#   1. 照綠色去背（scripts/sheet_cut.py，道具表 prop-cut.py 也用同一套）：半透明的邊把混進去的綠扣回來（還原原色），靠近背景的像素再壓掉殘留的綠（溢色），描邊外圈才不會帶綠邊。
#      淚水、汗滴這種淺藍色不是綠，會留下來。
#   2. 自動切格：找格子之間整條都是背景的空白，不寫死座標（每張圖的格線位置都有點不同）。
#   3. 排版：所有姿勢用同一個比例——以 ref（站姿）的身高佔滿畫布為準，坐著、跳起來、趴著的不各自撐滿；
#      水平用身體的重心置中、腳底對齊底部，輸出 512×512。
#   4. 存檔時減色成 256 色的調色盤 PNG（scripts/png_pack.py），一張 200 多 KB → 60 KB 上下，看不出差別。
import json
import shutil
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from sheet_cut import cells
import png_pack

cfg = json.loads(Path(sys.argv[1]).read_text())
src_root, out = Path(sys.argv[2]), Path(sys.argv[3])
SIZE = 512          # 輸出邊長
MARGIN = 0.04       # 四周留一點白，描邊濾鏡才不會被切

def cut_sheet(name, spec):
    """切一張姿勢表，回傳 {姿勢: RGBA 圖（裁到角色）}。去背、找格線、清雜點在 sheet_cut.py（道具表也用同一套）。"""
    return cells(src_root / spec['file'], f'姿勢表 {name}', spec.get('grid', [3, 3]), spec['poses'], spec.get('key', '#00FF00'), spec.get('speck', 40))

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
    png_pack.save(sheet, out / f'{pose}.png')
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
