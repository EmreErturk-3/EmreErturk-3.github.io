// Canvas pieces used on the site: Conway's Game of Life (and Life-like rules), and the AC-3
// worked example from Smart Zebra. Projects themselves are shown with real recordings.
const cssv = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (a = 1) => Math.random() * a;
const MONO = '"IBM Plex Mono",monospace';

const shown = new WeakMap<HTMLElement, string>();
const stamp = new WeakMap<HTMLElement, number>();
/** Writes a labelled grid of live values, touching the DOM only when something changed. */
export function metrics(el: HTMLElement, pairs: [string, string | number][], live = false) {
  const now = performance.now();
  if (live && now - (stamp.get(el) ?? 0) < 130) return;
  stamp.set(el, now);
  const html = pairs.map(([k, v]) => `<span><i>${k}</i><b>${v}</b></span>`).join('');
  if (shown.get(el) !== html) { shown.set(el, html); el.innerHTML = html; }
}
export function fit(c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.max(10, r.width * d); c.height = Math.max(10, r.height * d);
  const g = c.getContext('2d')!; g.setTransform(d, 0, 0, d, 0, 0);
  return { g, W: r.width, H: r.height };
}

/* ------------------------------------------------------------------ Conway's Game of Life */
const GUN = ['........................O', '......................O.O', '............OO......OO............OO', '...........O...O....OO............OO', 'OO........O.....O...OO', 'OO........O...O.OO....O.O', '..........O.....O.......O', '...........O...O', '............OO'];
export class Life {
  w: number; h: number; a: Uint8Array; b: Uint8Array; trail: Float32Array; gen = 0; B = 1 << 3; S = (1 << 2) | (1 << 3);
  /** rule in B/S notation, e.g. 'B3/S23' (Conway), 'B36/S23' (HighLife), 'B2/S' (Seeds), 'B3678/S34678' (Day & Night) */
  rule(r: string) { const m = /B(\d*)\/S(\d*)/.exec(r); if (!m) return this; this.B = [...m[1]].reduce((x, d) => x | (1 << +d), 0); this.S = [...m[2]].reduce((x, d) => x | (1 << +d), 0); return this; }
  clear() { this.a.fill(0); this.trail.fill(0); this.gen = 0; return this; }
  constructor(w: number, h: number) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); this.b = new Uint8Array(w * h); this.trail = new Float32Array(w * h); }
  put(x: number, y: number, rows: string[], flip = false) {
    rows.forEach((r, j) => [...r].forEach((c, i) => { if (c === 'O') { const xx = flip ? x - i : x + i; this.a[((y + j + this.h) % this.h) * this.w + ((xx + this.w) % this.w)] = 1; } }));
  }
  gun(x: number, y: number) { this.put(x, y, GUN); return this; }
  glider(x: number, y: number) { const d = [['.O.', '..O', 'OOO'], ['.O.', 'O..', 'OOO'], ['OOO', '..O', '.O.'], ['OOO', 'O..', '.O.']][Math.floor(rnd(4))]; this.put(x - 1, y - 1, d); }
  soup(x: number, y: number, s: number, p = 0.35) { for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) if (Math.random() < p) this.a[((y + j) % this.h) * this.w + ((x + i) % this.w)] = 1; }
  pop() { let n = 0; for (let i = 0; i < this.a.length; i++) n += this.a[i]; return n; }
  step() {
    const { w, h, a, b, trail } = this;
    for (let y = 0; y < h; y++) {
      const ym = ((y - 1 + h) % h) * w, y0 = y * w, yp = ((y + 1) % h) * w;
      for (let x = 0; x < w; x++) {
        const xm = (x - 1 + w) % w, xp = (x + 1) % w;
        const n = a[ym + xm] + a[ym + x] + a[ym + xp] + a[y0 + xm] + a[y0 + xp] + a[yp + xm] + a[yp + x] + a[yp + xp];
        const i = y0 + x, live = a[i] ? (this.S >> n) & 1 : (this.B >> n) & 1;
        b[i] = live ? 1 : 0;
        trail[i] = live ? 1 : trail[i] * 0.86;
      }
    }
    this.a = b; this.b = a; this.gen++;
  }
  draw(g: CanvasRenderingContext2D, W: number, H: number, cs: number, ox = 0, oy = 0) {
    g.clearRect(0, 0, W, H);
    const fg = cssv('--fg'), tr = cssv('--seek');
    g.fillStyle = tr;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const i = y * this.w + x, t = this.trail[i];
      if (!this.a[i] && t > 0.06) { g.globalAlpha = t * 0.28; g.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2); }
    }
    g.globalAlpha = 1; g.fillStyle = fg;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.a[y * this.w + x]) g.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2);
  }
}

/* ------------------------------------------------- Smart Zebra: AC-3 worked example */
export const ZEBRA = {
  clues: ['Peter is in the second house.', 'Arnold is directly left of the one who drinks water.', 'The one who drinks water is directly left of the one who likes milk.'],
  rows: ['Name', 'Drink'], vals: [['Peter', 'Eric', 'Arnold'], ['tea', 'water', 'milk']],
  steps: [
    { clue: 1, say: 'Applying clue 1: Peter is in house 2, so he is removed everywhere else.', rm: ['0-0-Peter', '2-0-Peter', '1-0-Eric', '1-0-Arnold'] },
    { clue: 3, say: 'Applying clue 3: water must be in house 1 or 2, and milk in house 2 or 3.', rm: ['2-1-water', '0-1-milk'] },
    { clue: 2, say: 'Applying clue 2: water in house 1 would leave Arnold no house, so it is removed.', rm: ['0-1-water'] },
    { clue: 0, say: 'Forced: Arnold is in house 1, water in house 2, milk in house 3. Solved.', rm: ['1-1-tea', '1-1-milk', '2-1-tea', '0-0-Eric', '2-0-Arnold'] },
  ],
};
export function drawZebra(g: CanvasRenderingContext2D, W: number, H: number, gone: Set<string>) {
  g.clearRect(0, 0, W, H); const M = Math.min(W, H), pad = M * 0.05, top = M * 0.1, cw = (W - pad * 2) / 3, ch = (H - pad * 2 - top) / 2, fs = clamp(cw * 0.13, 11, 18);
  const wall = cssv('--wall'), fg = cssv('--fg'), mut = cssv('--mut'), seek = cssv('--seek'), hid = cssv('--hider');
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = `500 ${clamp(M * 0.028, 11, 15)}px ${MONO}`; g.fillStyle = mut;
  for (let h = 0; h < 3; h++) g.fillText(`House ${h + 1}`, pad + cw * (h + 0.5), pad + top * 0.6);
  for (let a = 0; a < 2; a++) for (let h = 0; h < 3; h++) {
    const x = pad + h * cw, y = pad + top + a * ch, left = ZEBRA.vals[a].filter((v) => !gone.has(`${h}-${a}-${v}`)), one = left.length === 1;
    g.strokeStyle = wall; g.lineWidth = one ? 2 : 1; g.strokeRect(x + 4, y + 4, cw - 8, ch - 8);
    if (one) { g.fillStyle = seek; g.globalAlpha = 0.14; g.fillRect(x + 4, y + 4, cw - 8, ch - 8); g.globalAlpha = 1; }
    ZEBRA.vals[a].forEach((v, i) => {
      const off = gone.has(`${h}-${a}-${v}`), ty = y + ch / 2 + (i - 1) * fs * 1.7 + fs * 0.35;
      if (one && off) return; g.font = `${one ? 500 : 400} ${one ? fs * 1.35 : fs}px ${MONO}`; g.fillStyle = off ? mut : fg; g.globalAlpha = off ? 0.45 : 1;
      const yy = one ? y + ch / 2 + fs * 0.45 : ty; g.fillText(v, x + cw / 2, yy);
      if (off) { const w = g.measureText(v).width; g.strokeStyle = hid; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + cw / 2 - w / 2 - 3, ty - fs * 0.32); g.lineTo(x + cw / 2 + w / 2 + 3, ty - fs * 0.32); g.stroke(); } g.globalAlpha = 1;
    });
  }
}
