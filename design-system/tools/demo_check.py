"""Joins the demo check's screen shots (tools/demo_check.cjs) into one numbered sheet, four to a row.
Run:  python3 design-system/tools/demo_check.py <dir>   (writes <dir>/sheet.png)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

d = Path(sys.argv[1])
shots = sorted(d.glob('[0-9][0-9]*.png'))
tw, th, cols = 260, 563, 4
rows = -(-len(shots) // cols)
sheet = Image.new('RGB', (cols * (tw + 12) + 12, rows * (th + 30) + 12), (233, 230, 223))
draw = ImageDraw.Draw(sheet)
for i, s in enumerate(shots):
    x, y = 12 + (i % cols) * (tw + 12), 12 + (i // cols) * (th + 30)
    sheet.paste(Image.open(s).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 18))
    draw.text((x, y + 2), s.stem, fill=(23, 17, 15))
sheet.save(d / 'sheet.png')
print(d / 'sheet.png')
