# 動畫圖（主角姿勢、道具）存檔的最後一步：減色成 256 色的調色盤 PNG，一張 512×512 從 200 KB 上下壓到 60 KB 上下。
#   - 切圖的腳本（hero-cut.py、prop-cut.py、hero-trim.py）直接用 save(im, 路徑) 存圖，切出來的就是壓過的。
#   - 對已經在的資料夾重壓（scripts/png-pack.mjs 呼叫，npm run png:pack -- public/hero）：
#       python png_pack.py <資料夾或檔案...>
#     已經是調色盤 PNG（壓過的）就跳過，重跑不會越壓越糊；.work/ 這種中間產物的資料夾不碰。
#
# 做法：libimagequant（pngquant 的核心，Python 套件 imagequant，版本釘在 scripts/py-env.mjs）
#   256 色、Floyd–Steinberg 抖色 1.0（pngquant 的預設）、品質不設下限；調色盤帶 alpha，半透明的邊、淚水、冷風照樣是半透明。
#   為什麼這樣選（2026-11-15 試過 256／128／64 色、抖色 1.0／0.5）：
#     圖是粗描邊＋賽璐璐上色，顏色本來就少，256 色放大三倍在淺底、深底上都看不出差別；128 色以下淡藍的冷風、眼淚邊緣開始有色階。
#     抖色 0.5 只省 1～3 KB，不值得。3D emoji（public/emoji3d/）是大面積漸層，減色放大看得到顆粒，所以**不壓**。
# 決定性：同一張圖、同一版 imagequant 重跑，輸出逐 byte 相同（libimagequant 不用亂數；PNG 的 zlib 壓縮也是固定的）。
import io
import os
import sys
from pathlib import Path
from PIL import Image
import imagequant

COLORS = 256        # 調色盤顏色數
DITHER = 1.0        # 抖色程度（0 不抖、1 最多）

def pack(im):
    """RGBA 圖 → 減色後的調色盤圖（P 模式，透明度記在調色盤裡）。"""
    return imagequant.quantize_pil_image(im.convert('RGBA'), dithering_level=DITHER, max_colors=COLORS)

def encode(im):
    b = io.BytesIO()
    pack(im).save(b, 'PNG', optimize=True)
    return b.getvalue()

def save(im, path):
    """切圖腳本存圖用：減色後寫檔。"""
    Path(path).write_bytes(encode(im))

def packed(path):
    """已經壓過（調色盤 PNG）就不再壓。"""
    with Image.open(path) as im:
        return im.mode == 'P'

def pngs(target):
    p = Path(target)
    if p.is_file():
        yield p
        return
    for dirpath, dirs, files in os.walk(p):
        dirs[:] = sorted(d for d in dirs if not d.startswith('.'))   # .work/ 是 npm run hero 的中間產物，不碰
        for f in sorted(files):
            if f.endswith('.png'):
                yield Path(dirpath) / f

if __name__ == '__main__':
    for target in sys.argv[1:]:
        done = skipped = before = after = 0
        for p in pngs(target):
            size = p.stat().st_size
            if packed(p):
                skipped += 1
                before += size; after += size
                continue
            with Image.open(p) as im:
                data = encode(im)
            tmp = p.with_name(p.name + '.tmp')
            tmp.write_bytes(data)
            tmp.replace(p)
            done += 1
            before += size; after += len(data)
        mb = lambda n: f'{n / 1e6:.1f} MB'
        print(f'{target}：壓了 {done} 張、已經壓過跳過 {skipped} 張；{mb(before)} → {mb(after)}')
