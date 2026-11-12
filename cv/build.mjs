// Render cv/cv.html to the site PDF. Needs Playwright: npm i -g playwright && npx playwright install chromium
// Usage (from the site folder): node cv/build.mjs cv/cv.html public/docs/emre-erturk-cv.pdf
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [src = 'cv/cv.html', out = 'public/docs/emre-erturk-cv.pdf'] = process.argv.slice(2).map((x) => resolve(x));
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(src).href); await p.waitForLoadState('networkidle'); await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '14mm', left: '16mm', right: '16mm' } });
await b.close(); console.log('wrote', out);
