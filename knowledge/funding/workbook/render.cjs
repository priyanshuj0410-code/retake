// Renders a Solve workbook to an A4 PDF with headless Chromium (WeasyPrint needs Pango, which this Mac lacks).
// Run through the heavy-job queue, naming the page and the PDF (defaults: the Learning workbook):
//   ~/.claude/heavy-queue/heavyq run --label "Solve workbook PDF" -- node knowledge/funding/workbook/render.cjs [page.html] ["Name.pdf"]
const path = require('path');
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const HERE = __dirname;
const SRC = process.argv[2] || 'solve-2027-workbook.html';
const OUT = path.join(HERE, '..', process.argv[3] || 'MIT Solve 2027 Application Workbook.pdf');

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage();
  await p.goto('file://' + path.join(HERE, SRC), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const fonts = await p.evaluate(() => ['Poppins', 'Nunito Sans'].map(f => `${f}: ${document.fonts.check(`12px "${f}"`)}`).join(', '));
  await p.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true });
  console.log(OUT, '|', fonts);
  await b.close();
})();
