// Pixel-diff base-* vs head-* screenshots in a dir using a headless canvas.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.argv[2]);
const dir = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const f of fs.readdirSync(dir).filter((x) => x.startsWith('base-')).sort()) {
    const h = f.replace(/^base-/, 'head-');
    const a = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
    const b = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, h)).toString('base64');
    const res = await page.evaluate(async ([a, b]) => {
      const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { size: 'differs' };
      const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
      const da = px(ia), db = px(ib); let d = 0; let minY = Infinity, maxY = -1;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) {
          d++; const y = Math.floor(i / 4 / ia.width); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
      return { diffPx: d, pct: +(100 * d / (ia.width * ia.height)).toFixed(3), rows: d ? `${minY}-${maxY}` : '-' };
    }, [a, b]);
    console.log(f.replace(/^base-|\.png$/g, ''), JSON.stringify(res));
  }
  await browser.close();
})();
