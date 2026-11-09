// Small live models used across the site. Each is a sketch of one project, written for the
// browser: honest about what it shows, and linked to the real thing from the page around it.
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
const hex = (h: string): [number, number, number] => { const m = h.replace('#', ''); const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

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

/* ------------------------------------------------- Reaction–diffusion (Gray–Scott sketch) */
const RD_SETS = [{ F: 0.0367, k: 0.0649, name: 'mitosis' }, { F: 0.0545, k: 0.062, name: 'coral' }, { F: 0.03, k: 0.062, name: 'solitons' }, { F: 0.025, k: 0.06, name: 'pulsating' }];
export class RD {
  n: number; u: Float32Array; v: Float32Array; u2: Float32Array; v2: Float32Array; set = 0; t = 0; img: ImageData | null = null; off: HTMLCanvasElement;
  constructor(n = 128) { this.n = n; const N = n * n; this.u = new Float32Array(N).fill(1); this.v = new Float32Array(N); this.u2 = new Float32Array(N); this.v2 = new Float32Array(N); this.off = document.createElement('canvas'); this.off.width = this.off.height = n; this.seed(); }
  seed() { this.u.fill(1); this.v.fill(0); for (let k = 0; k < 14; k++) { const cx = Math.floor(rnd(this.n)), cy = Math.floor(rnd(this.n)), r = 3 + Math.floor(rnd(4)); for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const i = ((cy + y + this.n) % this.n) * this.n + ((cx + x + this.n) % this.n); this.u[i] = 0.5; this.v[i] = 0.25 + rnd(0.1); } } }
  next() { this.set = (this.set + 1) % RD_SETS.length; this.seed(); this.t = 0; }
  get params() { return RD_SETS[this.set]; }
  step(iter = 8) {
    const n = this.n, { F, k } = RD_SETS[this.set], Du = 0.2097, Dv = 0.105;
    for (let it = 0; it < iter; it++) {
      const u = this.u, v = this.v, u2 = this.u2, v2 = this.v2;
      for (let y = 0; y < n; y++) {
        const ym = ((y - 1 + n) % n) * n, y0 = y * n, yp = ((y + 1) % n) * n;
        for (let x = 0; x < n; x++) {
          const xm = (x - 1 + n) % n, xp = (x + 1) % n, i = y0 + x;
          const lu = u[ym + x] + u[yp + x] + u[y0 + xm] + u[y0 + xp] - 4 * u[i];
          const lv = v[ym + x] + v[yp + x] + v[y0 + xm] + v[y0 + xp] - 4 * v[i];
          const uvv = u[i] * v[i] * v[i];
          u2[i] = u[i] + Du * lu - uvv + F * (1 - u[i]);
          v2[i] = v[i] + Dv * lv + uvv - (F + k) * v[i];
        }
      }
      this.u = u2; this.u2 = u; this.v = v2; this.v2 = v;
    }
    this.t += iter;
  }
  mass() { let s = 0; for (let i = 0; i < this.v.length; i += 7) s += this.v[i]; return s / (this.v.length / 7); }
  draw(g: CanvasRenderingContext2D, W: number, H: number) {
    const n = this.n, oc = this.off.getContext('2d')!;
    if (!this.img) this.img = oc.createImageData(n, n);
    const d = this.img.data, bg = hex(cssv('--panel')), c1 = hex(cssv('--box')), c2 = hex(cssv('--seek')), c3 = hex(cssv('--hider'));
    for (let i = 0; i < n * n; i++) {
      const t = clamp(this.v[i] * 3.2, 0, 1);
      let r, gg, b;
      if (t < 0.5) { const s = t / 0.5; r = bg[0] + (c1[0] - bg[0]) * s; gg = bg[1] + (c1[1] - bg[1]) * s; b = bg[2] + (c1[2] - bg[2]) * s; }
      else if (t < 0.8) { const s = (t - 0.5) / 0.3; r = c1[0] + (c2[0] - c1[0]) * s; gg = c1[1] + (c2[1] - c1[1]) * s; b = c1[2] + (c2[2] - c1[2]) * s; }
      else { const s = (t - 0.8) / 0.2; r = c2[0] + (c3[0] - c2[0]) * s; gg = c2[1] + (c3[1] - c2[1]) * s; b = c2[2] + (c3[2] - c2[2]) * s; }
      d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
    }
    oc.putImageData(this.img, 0, 0);
    g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = true;
    const s = Math.max(W, H); g.drawImage(this.off, (W - s) / 2, (H - s) / 2, s, s);
  }
}

/* --------------------------------------------- Slave-making ants: a raid in miniature */
type Ant = { x: number; y: number; a: number; kind: 'raider' | 'scout' | 'slave' | 'host'; st: number; carry: boolean; home: number; tx: number; ty: number; t: number };
export class Ants {
  G = 90; ph = new Float32Array(90 * 90); ph2 = new Float32Array(90 * 90);
  slaver = { x: 0.24, y: 0.62, brood: 0 }; hosts: { x: number; y: number; brood: number }[] = [];
  ants: Ant[] = []; phase: 'scout' | 'raid' | 'rest' = 'scout'; target = -1; clock = 0; raids = 0; stolen = 0; slaves = 0; pending: number[] = [];
  constructor() { this.reset(); }
  reset() {
    this.hosts = [{ x: 0.72, y: 0.28, brood: 22 }, { x: 0.8, y: 0.72, brood: 22 }, { x: 0.45, y: 0.18, brood: 22 }];
    this.ants = []; this.ph.fill(0); this.phase = 'scout'; this.target = -1; this.clock = 0; this.raids = 0; this.stolen = 0; this.slaves = 0; this.pending = []; this.slaver.brood = 0;
    this.hosts.forEach((h, i) => { for (let k = 0; k < 16; k++) this.ants.push(this.mk('host', h.x, h.y, i)); });
    for (let k = 0; k < 4; k++) this.ants.push(this.mk('slave', this.slaver.x, this.slaver.y, -1));
    this.slaves = 4;
    this.sendScouts();
  }
  mk(kind: Ant['kind'], x: number, y: number, home: number): Ant { return { x: x + rnd(0.03) - 0.015, y: y + rnd(0.03) - 0.015, a: rnd(Math.PI * 2), kind, st: 0, carry: false, home, tx: 0, ty: 0, t: 0 }; }
  sendScouts() { for (let k = 0; k < 3; k++) this.ants.push(this.mk('scout', this.slaver.x, this.slaver.y, -1)); this.phase = 'scout'; }
  lay(x: number, y: number, q: number) { const G = this.G, i = clamp(Math.floor(y * G), 0, G - 1) * G + clamp(Math.floor(x * G), 0, G - 1); this.ph[i] = Math.min(1, this.ph[i] + q); }
  smell(x: number, y: number) { const G = this.G; if (x < 0 || y < 0 || x >= 1 || y >= 1) return 0; return this.ph[Math.floor(y * G) * G + Math.floor(x * G)]; }
  step() {
    const G = this.G, ph = this.ph, p2 = this.ph2;
    for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) { const i = y * G + x; p2[i] = (ph[i] * 0.84 + (ph[i - 1] + ph[i + 1] + ph[i - G] + ph[i + G]) * 0.04) * 0.9965; }
    this.ph = p2; this.ph2 = ph; this.clock++;
    const S = this.slaver, sp = 0.0032;
    for (let k = this.pending.length - 1; k >= 0; k--) if (--this.pending[k] <= 0) { this.pending.splice(k, 1); this.ants.push(this.mk('slave', S.x, S.y, -1)); this.slaves++; S.brood = Math.max(0, S.brood - 1); }
    for (const a of this.ants) {
      a.t++;
      if (a.kind === 'host' || a.kind === 'slave') {
        const hx = a.kind === 'host' ? this.hosts[a.home].x : S.x, hy = a.kind === 'host' ? this.hosts[a.home].y : S.y, d = Math.hypot(a.x - hx, a.y - hy);
        a.a += (rnd() - 0.5) * 0.7; if (d > (a.kind === 'slave' ? 0.26 : 0.15)) a.a = Math.atan2(hy - a.y, hx - a.x) + (rnd() - 0.5) * 0.6;
        a.x += Math.cos(a.a) * sp * 0.6; a.y += Math.sin(a.a) * sp * 0.6;
      } else if (a.kind === 'scout') {
        if (!a.carry) {
          a.a += (rnd() - 0.5) * 0.5; a.x += Math.cos(a.a) * sp * 1.3; a.y += Math.sin(a.a) * sp * 1.3;
          if (a.x < 0.03 || a.x > 0.97 || a.y < 0.03 || a.y > 0.97) a.a += Math.PI;
          const hit = this.hosts.findIndex((h) => h.brood > 0 && Math.hypot(h.x - a.x, h.y - a.y) < 0.045);
          if (hit >= 0 && this.phase === 'scout') { a.carry = true; this.target = hit; }
          if (a.t > 1400) a.carry = true;
        } else {
          a.a = Math.atan2(S.y - a.y, S.x - a.x) + (rnd() - 0.5) * 0.35; a.x += Math.cos(a.a) * sp * 1.3; a.y += Math.sin(a.a) * sp * 1.3;
          if (this.target >= 0) this.lay(a.x, a.y, 0.5);
          if (Math.hypot(S.x - a.x, S.y - a.y) < 0.02) { a.st = -1; if (this.target >= 0 && this.phase === 'scout') this.muster(); }
        }
      } else {
        if (a.t < 0) continue; // still queued at the nest: the column leaves one by one
        const T = this.hosts[this.target];
        if (!a.carry && a.home !== -2 && T) {
          // follow the raid trail outward: sensors ahead-left/right, restricted to the target side
          const toT = Math.atan2(T.y - a.y, T.x - a.x); let best = a.a, bv = -1;
          for (const o of [-0.6, 0, 0.6]) { const ang = a.a + o, v = this.smell(a.x + Math.cos(ang) * 0.03, a.y + Math.sin(ang) * 0.03) + Math.cos(ang - toT) * 0.08; if (v > bv) { bv = v; best = ang; } }
          a.a = best + (rnd() - 0.5) * 0.25; a.x += Math.cos(a.a) * sp * 1.15; a.y += Math.sin(a.a) * sp * 1.15;
          if (Math.hypot(T.x - a.x, T.y - a.y) < 0.03) { if (T.brood > 0) { T.brood--; a.carry = true; this.stolen++; } else a.home = -2; }
        } else {
          a.a = Math.atan2(S.y - a.y, S.x - a.x) + (rnd() - 0.5) * 0.3; a.x += Math.cos(a.a) * sp; a.y += Math.sin(a.a) * sp;
          if (Math.hypot(S.x - a.x, S.y - a.y) < 0.02) { if (a.carry) { S.brood++; this.pending.push(260 + Math.floor(rnd(200))); } a.st = -1; }
        }
      }
    }
    this.ants = this.ants.filter((a) => a.st >= 0);
    if (this.phase === 'raid' && !this.ants.some((a) => a.kind === 'raider')) { this.phase = 'rest'; this.clock = 0; }
    if (this.phase === 'rest' && this.clock > 420) { if (this.hosts.every((h) => h.brood <= 0) || this.slaves > 60) this.reset(); else { this.target = -1; this.sendScouts(); } }
    if (this.phase === 'scout' && !this.ants.some((a) => a.kind === 'scout')) this.sendScouts();
  }
  muster() { this.phase = 'raid'; this.raids++; this.ants = this.ants.filter((a) => a.kind !== 'scout'); for (let k = 0; k < 16; k++) { const r = this.mk('raider', this.slaver.x, this.slaver.y, -1); r.t = -k * 9; this.ants.push(r); } }
  draw(g: CanvasRenderingContext2D, W: number, H: number) {
    g.clearRect(0, 0, W, H);
    const G = this.G, cw = W / G, ch = H / G, hid = cssv('--hider'), fg = cssv('--fg'), seek = cssv('--seek'), box = cssv('--box'), mut = cssv('--mut');
    g.fillStyle = hid;
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { const v = this.ph[y * G + x]; if (v > 0.03) { g.globalAlpha = Math.min(0.55, v * 0.9); g.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5); } }
    g.globalAlpha = 1;
    const nest = (x: number, y: number, c: string, brood: number, label: string) => {
      g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.arc(x * W, y * H, Math.min(W, H) * 0.045, 0, Math.PI * 2); g.stroke();
      g.fillStyle = cssv('--panel'); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1;
      g.fillStyle = mut; g.font = `500 ${clamp(W * 0.022, 10, 13)}px ${MONO}`; g.textAlign = 'center'; g.fillText(`${label} · ${brood}`, x * W, y * H + Math.min(W, H) * 0.075);
    };
    this.hosts.forEach((h) => nest(h.x, h.y, box, h.brood, 'Formica'));
    nest(this.slaver.x, this.slaver.y, hid, this.slaver.brood, 'Polyergus');
    const s = clamp(W * 0.0085, 3, 5.5);
    for (const a of this.ants) {
      if (a.kind === 'raider' && a.t < 0) continue;
      g.save(); g.translate(a.x * W, a.y * H); g.rotate(a.a);
      g.fillStyle = a.kind === 'raider' || a.kind === 'scout' ? hid : a.kind === 'slave' ? seek : fg;
      g.fillRect(-s * 1.4, -s * 0.55, s * 2.8, s * 1.1);
      if (a.carry && a.kind === 'raider') { g.fillStyle = cssv('--panel'); g.strokeStyle = fg; g.lineWidth = 0.8; g.fillRect(s * 1.3, -s * 0.7, s * 1.3, s * 1.4); g.strokeRect(s * 1.3, -s * 0.7, s * 1.3, s * 1.4); }
      g.restore();
    }
  }
  metrics(): [string, string | number][] { return [['Phase', this.phase === 'scout' ? 'Scouting' : this.phase === 'raid' ? 'Raid' : 'At home'], ['Raids', this.raids], ['Brood stolen', this.stolen], ['Slaves', this.slaves]]; }
}

/* --------------------------------------------- Sudoku: logic reduction + min-conflicts */
const PUZZLES = [ // from AEASS's audited Sudoku Exchange medium/hard sets
  '2.6..83.9..1..2...7....4.12942.6.......4.7.......8.42362.7....4...2..5..3.98..2.6',
  '45.....27....5......6.4.8...147.956..9.....8...5.2.7..1..2.3..8.23...19.....9....',
  '2..7.9..56...3...24.......7..2...4.....1.4......567...84.....63.29...81...7...5..',
  '...4.2......7.9....52...93..236.145.4..375..6....................89.36..3.6...7.2',
  '...8.9....43...87..2.....1.3...2...9...3.8....1.....2.6.7...4.2.842.569.2..7.4..1',
  '.36...2......84..61..6....4.1..9.3...5.4.6.2...8.7..1.3....5..18..73......9...87.',
  '......36..5..4...8...852..1..75.....26.....53.....69..6..294...7...3..4..41......',
  '.......2.......6.98..5.1..7....14.7.318.9.546.2.63....5..7.8..22.4.......3.......',
];
export class Sudoku {
  given = new Uint8Array(81); logic = new Uint8Array(81); g = new Uint8Array(81); pi = 0; iters = 0; restarts = 0; solved = false; hold = 0; cost = 0; conf = new Uint8Array(81);
  constructor() { this.load(Math.floor(rnd(PUZZLES.length))); }
  load(i: number) {
    this.pi = i % PUZZLES.length; const s = PUZZLES[this.pi];
    for (let k = 0; k < 81; k++) { const c = s[k]; this.given[k] = c >= '1' && c <= '9' ? +c : 0; }
    this.logic.fill(0); this.reduce(); this.iters = 0; this.restarts = 0; this.solved = false; this.hold = 0; this.fill();
  }
  // naked and hidden singles, as in AEASS's logic-reduction step (a subset of it)
  reduce() {
    const v = new Uint8Array(81); for (let k = 0; k < 81; k++) v[k] = this.given[k];
    const cand = (k: number) => { const r = Math.floor(k / 9), c = k % 9, br = r - r % 3, bc = c - c % 3; let m = 0x3fe; for (let i = 0; i < 9; i++) { m &= ~(1 << v[r * 9 + i]); m &= ~(1 << v[i * 9 + c]); m &= ~(1 << v[(br + Math.floor(i / 3)) * 9 + bc + i % 3]); } return m; };
    const units: number[][] = []; for (let i = 0; i < 9; i++) { units.push([...Array(9)].map((_, j) => i * 9 + j)); units.push([...Array(9)].map((_, j) => j * 9 + i)); units.push([...Array(9)].map((_, j) => (Math.floor(i / 3) * 3 + Math.floor(j / 3)) * 9 + (i % 3) * 3 + j % 3)); }
    let changed = true;
    while (changed) {
      changed = false;
      for (let k = 0; k < 81; k++) if (!v[k]) { const m = cand(k); if (m && !(m & (m - 1))) { v[k] = Math.log2(m); this.logic[k] = v[k]; changed = true; } }
      for (const u of units) for (let d = 1; d <= 9; d++) { if (u.some((k) => v[k] === d)) continue; const spots = u.filter((k) => !v[k] && (cand(k) & (1 << d))); if (spots.length === 1) { v[spots[0]] = d; this.logic[spots[0]] = d; changed = true; } }
    }
  }
  fixed(k: number) { return this.given[k] || this.logic[k]; }
  fill() {
    for (let r = 0; r < 9; r++) {
      const have = new Set<number>(), free: number[] = [];
      for (let c = 0; c < 9; c++) { const k = r * 9 + c, f = this.fixed(k); if (f) { this.g[k] = f; have.add(f); } else free.push(k); }
      const miss = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !have.has(d)).sort(() => rnd() - 0.5);
      free.forEach((k, i) => (this.g[k] = miss[i]));
    }
    this.eval();
  }
  eval() {
    let cost = 0; this.conf.fill(0);
    for (let i = 0; i < 9; i++) {
      for (const unit of [[...Array(9)].map((_, j) => j * 9 + i), [...Array(9)].map((_, j) => (Math.floor(i / 3) * 3 + Math.floor(j / 3)) * 9 + (i % 3) * 3 + j % 3)]) {
        const seen: number[][] = [...Array(10)].map(() => []); unit.forEach((k) => seen[this.g[k]].push(k));
        for (let d = 1; d <= 9; d++) if (seen[d].length > 1) { cost += seen[d].length - 1; seen[d].forEach((k) => (this.conf[k] = 1)); }
      }
    }
    this.cost = cost; return cost;
  }
  step() {
    if (this.solved) { if (++this.hold > 140) this.load(this.pi + 1); return; }
    this.iters++;
    const bad: number[] = []; for (let k = 0; k < 81; k++) if (this.conf[k] && !this.fixed(k)) bad.push(k);
    if (!bad.length) { this.solved = this.cost === 0; return; }
    const k = bad[Math.floor(rnd(bad.length))], r = Math.floor(k / 9);
    let best = this.cost + 99, cands: number[] = [];
    for (let c = 0; c < 9; c++) {
      const j = r * 9 + c; if (j === k || this.fixed(j)) continue;
      [this.g[k], this.g[j]] = [this.g[j], this.g[k]]; const v = this.eval(); [this.g[k], this.g[j]] = [this.g[j], this.g[k]];
      if (v < best) { best = v; cands = [j]; } else if (v === best) cands.push(j);
    }
    if (cands.length) {
      const j = Math.random() < 0.12 ? (() => { const fr = [...Array(9)].map((_, c) => r * 9 + c).filter((q) => q !== k && !this.fixed(q)); return fr[Math.floor(rnd(fr.length))]; })() : cands[Math.floor(rnd(cands.length))];
      [this.g[k], this.g[j]] = [this.g[j], this.g[k]];
    }
    this.eval();
    if (this.iters % 1500 === 0 && this.cost > 0) { this.restarts++; this.fill(); }
    if (this.cost === 0) this.solved = true;
  }
  draw(g: CanvasRenderingContext2D, W: number, H: number) {
    g.clearRect(0, 0, W, H);
    const M = Math.min(W, H) * 0.92, ox = (W - M) / 2, oy = (H - M) / 2, c = M / 9, fg = cssv('--fg'), wall = cssv('--wall'), line = cssv('--line'), hid = cssv('--hider'), box = cssv('--box'), seek = cssv('--seek'), mut = cssv('--mut');
    for (let k = 0; k < 81; k++) {
      const x = ox + (k % 9) * c, y = oy + Math.floor(k / 9) * c;
      if (this.conf[k] && !this.fixed(k)) { g.fillStyle = hid; g.globalAlpha = 0.16; g.fillRect(x, y, c, c); g.globalAlpha = 1; }
      if (this.solved) { g.fillStyle = seek; g.globalAlpha = 0.08; g.fillRect(x, y, c, c); g.globalAlpha = 1; }
      g.font = `${this.given[k] ? 600 : 400} ${c * 0.5}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = this.given[k] ? fg : this.logic[k] ? box : this.conf[k] ? hid : mut;
      g.fillText(String(this.g[k]), x + c / 2, y + c / 2 + 1);
    }
    for (let i = 0; i <= 9; i++) { g.strokeStyle = i % 3 ? line : wall; g.lineWidth = i % 3 ? 1 : 2; g.beginPath(); g.moveTo(ox + i * c, oy); g.lineTo(ox + i * c, oy + M); g.moveTo(ox, oy + i * c); g.lineTo(ox + M, oy + i * c); g.stroke(); }
  }
  metrics(): [string, string | number][] { let lg = 0, gv = 0; for (let k = 0; k < 81; k++) { if (this.given[k]) gv++; else if (this.logic[k]) lg++; } return [['Givens', gv], ['Logic-filled', lg], ['Conflicts', this.cost], ['Moves', this.iters], ['Restarts', this.restarts], ['Status', this.solved ? 'Solved ✓' : 'Searching']]; }
}

/* --------------------------------------------------------------- Vicsek flocking */
export class Vicsek {
  n: number; x: Float32Array; y: Float32Array; a: Float32Array; na: Float32Array; eta = 0.3; t = 0; va = 0; L = 1; r = 0.05; v = 0.0035;
  constructor(n = 260) { this.n = n; this.x = new Float32Array(n); this.y = new Float32Array(n); this.a = new Float32Array(n); this.na = new Float32Array(n); for (let i = 0; i < n; i++) { this.x[i] = rnd(); this.y[i] = rnd(); this.a[i] = rnd(Math.PI * 2); } }
  step() {
    const { n, x, y, a, na, r } = this; this.t++;
    this.eta = 1.2 + 1.1 * Math.sin(this.t / 700); // slowly sweep the noise through the ordering transition
    let sx = 0, sy = 0; const r2 = r * r;
    for (let i = 0; i < n; i++) {
      let cx = 0, cy = 0;
      for (let j = 0; j < n; j++) { let dx = x[j] - x[i], dy = y[j] - y[i]; dx -= Math.round(dx); dy -= Math.round(dy); if (dx * dx + dy * dy < r2) { cx += Math.cos(a[j]); cy += Math.sin(a[j]); } }
      na[i] = Math.atan2(cy, cx) + (rnd() - 0.5) * this.eta;
    }
    for (let i = 0; i < n; i++) { a[i] = na[i]; x[i] = (x[i] + Math.cos(a[i]) * this.v + 1) % 1; y[i] = (y[i] + Math.sin(a[i]) * this.v + 1) % 1; sx += Math.cos(a[i]); sy += Math.sin(a[i]); }
    this.va = Math.hypot(sx, sy) / n;
  }
  draw(g: CanvasRenderingContext2D, W: number, H: number) {
    g.clearRect(0, 0, W, H); const cols = [cssv('--hider'), cssv('--seek'), cssv('--box')], s = clamp(W * 0.009, 3, 6);
    for (let i = 0; i < this.n; i++) {
      const h = ((this.a[i] % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      g.save(); g.translate(this.x[i] * W, this.y[i] * H); g.rotate(this.a[i]); g.fillStyle = cols[Math.floor(h / (Math.PI * 2 / 3)) % 3];
      g.beginPath(); g.moveTo(s * 1.4, 0); g.lineTo(-s, s * 0.7); g.lineTo(-s * 0.5, 0); g.lineTo(-s, -s * 0.7); g.closePath(); g.fill(); g.restore();
    }
  }
  metrics(): [string, string | number][] { return [['Particles', this.n], ['Noise η', this.eta.toFixed(2)], ['Order v_a', this.va.toFixed(2)]]; }
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

/* ------------------------------------------------------- video drawn into a canvas */
export function drawVideo(g: CanvasRenderingContext2D, W: number, H: number, v: HTMLVideoElement) {
  g.clearRect(0, 0, W, H); if (v.readyState < 2) return;
  const vr = v.videoWidth / v.videoHeight, cr = W / H; let sw = v.videoWidth, sh = v.videoHeight, sx = 0, sy = 0;
  if (vr > cr) { sw = sh * cr; sx = (v.videoWidth - sw) / 2; } else { sh = sw / cr; sy = (v.videoHeight - sh) / 2; }
  g.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
}
