# 道具圖「從九宮格道具表切」的影像處理（由 scripts/prop-cut.mjs 呼叫）：
#   python prop-cut.py <設定檔.json> <道具表資料夾> <輸出資料夾> <範圍表.json>
# 道具表是生圖模型畫的：純色底（預設洋紅 #FF00FF，設定的 key 可以換）、n×m 格、每格一個道具（版面規則見 assets/prop-sheets/README.md）。
#   1. 照背景色去背、自動切格、清雜點：跟主角姿勢表同一套（scripts/sheet_cut.py）。淺藍半透明的冷風、冰塊不是洋紅，會留下來。
#   2. 排版：跟主角「同一個比例」不同，道具**各自**裁到內容、各自撐滿——長邊剛好佔滿畫布（留 4% 邊給描邊濾鏡），
#      水平置中、底部對齊，輸出 512×512 透明底。together 的一組（同一隻動物的幾個狀態）共用一個倍數，只有最大的那張撐滿。所以劇本的 size 就是道具的長邊（跟 emoji 一樣），站在地上的寫法也跟主角一樣。
#   3. 存檔時減色成 256 色的調色盤 PNG（scripts/png_pack.py），一張 200 KB 上下 → 60 KB 上下，看不出差別。
#   4. 量出輸出資料夾裡每張圖的內容範圍（畫布的幾分之幾），寫進 <範圍表.json>，prop-cut.mjs 再產生 src/anim/props.ts：
#      引擎靠它知道寬扁的捷運、高高的樹實際佔多大（擋字、頭頂、影子、自動取景），不會把整個正方形都當成道具。
import json
import sys
from pathlib import Path
from PIL import Image
from sheet_cut import SOLID, cells
import png_pack

cfg_path, src_root, out, boxes_path = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4])
cfg = json.loads(cfg_path.read_text())
SIZE = 512          # 輸出邊長
MARGIN = 0.04       # 四周留一點白，描邊濾鏡才不會被切（跟主角一樣）

out.mkdir(parents=True, exist_ok=True)
crops = cells(src_root / cfg['file'], f'道具表 {cfg_path.stem}', cfg.get('grid', [3, 3]), cfg['props'], cfg.get('key', '#FF00FF'), cfg.get('speck', 40), halo=3)
inner = SIZE * (1 - MARGIN * 2)
m = round(SIZE * MARGIN)
# together：同一隻動物的幾個狀態（站著／趴著睡／吼）要能互相 swap，比例得一樣：
# 一組裡每張都用同一個放大倍數（取組裡最小的，最寬或最高的那張剛好撐滿、其他的不撐滿）
fit = {name: inner / max(im.width, im.height) for name, im in crops.items()}
for group in cfg.get('together', []):
    shared = min(fit[n] for n in group if n in fit)
    for n in group:
        if n in fit:
            fit[n] = shared
for name, im in crops.items():
    if name in cfg.get('flip', []):
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    f = fit[name]
    w, h = max(1, round(im.width * f)), max(1, round(im.height * f))
    small = im.resize((w, h), Image.LANCZOS)
    sheet = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    sheet.paste(small, ((SIZE - w) // 2, SIZE - m - h), small)
    png_pack.save(sheet, out / f'{name}.png')
    blur = '（原圖太小，放大 {:.1f} 倍，會糊：請生圖模型單獨畫一張大的）'.format(f) if f > 1.6 else ''
    print(f'  {name}：{im.width}×{im.height} → {w}×{h}{blur}')

# 輸出資料夾裡每一張（不只這張表的）都量一次內容範圍：[左, 上, 右, 下]，畫布的幾分之幾
boxes = {}
for p in sorted(out.glob('*.png')):
    a = Image.open(p).convert('RGBA').getchannel('A').point(lambda v: 255 if v > SOLID else 0)
    b = a.getbbox() or (0, 0, a.width, a.height)
    boxes[p.stem] = [round(v / a.width, 3) for v in b]
boxes_path.write_text(json.dumps(boxes))
