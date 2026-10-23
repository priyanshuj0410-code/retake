"""Builds solve-2027-econ-workbook.html: the Economic Prosperity workbook's body (econ-body.html) inside the Learning
workbook's page, so the two share one stylesheet and one look.
Run:  python3 knowledge/funding/workbook/build_econ.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
page = (HERE / 'solve-2027-workbook.html').read_text(encoding='utf-8')
head = page[:page.index('<body>') + len('<body>')]
tail = page[page.index('<script>'):]
head = head.replace('<title>MIT Solve 2027 Application Workbook</title>', '<title>MIT Solve 2027 Economic Prosperity Workbook</title>')
head = head.replace('MIT Solve 2027 application workbook', 'MIT Solve 2027 · Economic Prosperity workbook')
(HERE / 'solve-2027-econ-workbook.html').write_text(head + '\n' + (HERE / 'econ-body.html').read_text(encoding='utf-8') + '\n' + tail, encoding='utf-8')
print('solve-2027-econ-workbook.html')
