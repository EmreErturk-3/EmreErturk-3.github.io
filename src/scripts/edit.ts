// In-page editing for the site owner.
// Open any page with ?edit to turn it on. Text blocks marked data-edit become editable;
// "Save" commits the changed Markdown files to GitHub with your personal access token,
// which is stored only in this browser (localStorage). GitHub Pages then redeploys.
const REPO = 'EmreErturk-3/EmreErturk-3.github.io';
const BRANCH = 'main';
const KEY = 'site-edit-token';

const store = { get: () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } }, set: (v: string) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch {} } };
const on = () => { try { return new URLSearchParams(location.search).has('edit') || sessionStorage.getItem('site-edit') === '1'; } catch { return false; } };

// ---------- HTML -> Markdown (paragraphs, links, bold, italic, line breaks, lists) ----------
function inline(n: Node): string {
  if (n.nodeType === Node.TEXT_NODE) return (n.textContent || '').replace(/\s+/g, ' ');
  if (n.nodeType !== Node.ELEMENT_NODE) return '';
  const el = n as HTMLElement, kids = () => [...el.childNodes].map(inline).join('');
  switch (el.tagName) {
    case 'A': { const h = el.getAttribute('href') || ''; const t = kids().trim(); return h ? `[${t}](${h})` : t; }
    case 'STRONG': case 'B': { const t = kids().trim(); return t ? `**${t}**` : ''; }
    case 'EM': case 'I': { const t = kids().trim(); return t ? `*${t}*` : ''; }
    case 'CODE': return '`' + kids() + '`';
    case 'BR': return '  \n';
    default: return kids();
  }
}
function toMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];
  const loose: Node[] = [];
  const flush = () => { const t = loose.map(inline).join('').trim(); if (t) blocks.push(t); loose.length = 0; };
  root.childNodes.forEach((n) => {
    const tag = n.nodeType === Node.ELEMENT_NODE ? (n as HTMLElement).tagName : '';
    if (tag === 'P' || tag === 'DIV' || /^H[1-6]$/.test(tag)) { flush(); const t = inline(n).trim(); if (t) blocks.push((/^H[1-6]$/.test(tag) ? '#'.repeat(+tag[1]) + ' ' : '') + t); }
    else if (tag === 'UL' || tag === 'OL') { flush(); blocks.push([...(n as HTMLElement).children].map((li, i) => (tag === 'OL' ? `${i + 1}. ` : '- ') + inline(li).trim()).join('\n')); }
    else loose.push(n);
  });
  flush();
  return blocks.join('\n\n') + '\n';
}

(window as any).__siteToMarkdown = toMarkdown; // handy for checking conversions in the console

// ---------- GitHub API ----------
const b64 = (s: string) => { const bytes = new TextEncoder().encode(s); let bin = ''; bytes.forEach((x) => (bin += String.fromCharCode(x))); return btoa(bin); };
async function gh(path: string, init: RequestInit = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { ...init, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${store.get()}`, ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${(await r.json().catch(() => ({}))).message || r.statusText}`);
  return r.json();
}
async function save(path: string, md: string) {
  const cur = await gh(`${path}?ref=${BRANCH}`);
  await gh(path, { method: 'PUT', body: JSON.stringify({ message: `Edit ${path.split('/').pop()} on the site`, content: b64(md), sha: cur.sha, branch: BRANCH }) });
}

// ---------- UI ----------
function start() {
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-edit]')];
  document.getElementById('edit-bar')?.remove();
  const bar = document.createElement('div'); bar.id = 'edit-bar';
  bar.innerHTML = `<b>Edit mode</b><span class="n">${blocks.length} editable block${blocks.length === 1 ? '' : 's'} on this page</span>
    <button data-a="bold" title="Bold (Ctrl+B)"><b>B</b></button><button data-a="italic" title="Italic (Ctrl+I)"><i>I</i></button><button data-a="link" title="Link">Link</button>
    <button data-a="save" class="pri">Save</button><button data-a="token">Token</button><button data-a="exit">Exit</button><span class="st" aria-live="polite"></span>`;
  document.body.appendChild(bar);
  const st = bar.querySelector('.st') as HTMLElement, say = (t: string) => (st.textContent = t);
  const orig = new Map<HTMLElement, string>();
  blocks.forEach((b) => { b.contentEditable = 'true'; b.spellcheck = true; orig.set(b, toMarkdown(b)); });
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch {}
  try { sessionStorage.setItem('site-edit', '1'); } catch {}
  bar.addEventListener('mousedown', (e) => e.preventDefault()); // keep the text selection when clicking toolbar buttons
  bar.addEventListener('click', async (e) => {
    const a = (e.target as HTMLElement).closest('button')?.dataset.a; if (!a) return;
    if (a === 'bold' || a === 'italic') document.execCommand(a);
    if (a === 'link') { const u = prompt('Link address (leave empty to remove the link):', 'https://'); if (u === null) return; u.trim() && u !== 'https://' ? document.execCommand('createLink', false, u.trim()) : document.execCommand('unlink'); }
    if (a === 'token') { const t = prompt('GitHub fine-grained token (Contents: read and write, this repository only). Stored only in this browser. Leave empty to forget it.', ''); if (t !== null) { store.set(t.trim()); say(t.trim() ? 'Token saved in this browser.' : 'Token removed.'); } }
    if (a === 'exit') { try { sessionStorage.removeItem('site-edit'); } catch {} location.href = location.pathname; }
    if (a === 'save') {
      if (!store.get()) { const t = prompt('Paste your GitHub token to save (see EDITING.md):', ''); if (!t) return; store.set(t.trim()); }
      const changed = blocks.filter((b) => toMarkdown(b) !== orig.get(b));
      if (!changed.length) { say('Nothing changed.'); return; }
      // group by file (a file may appear twice on a page; the last edit wins)
      const byFile = new Map<string, HTMLElement>(); changed.forEach((b) => byFile.set(b.dataset.edit!, b));
      try {
        for (const [path, el] of byFile) { say(`Saving ${path.split('/').pop()}…`); const md = toMarkdown(el); await save(path, md); orig.set(el, md); }
        say(`Saved ${byFile.size} file${byFile.size === 1 ? '' : 's'}. The live site updates in about a minute.`);
      } catch (err) { say(`Save failed: ${(err as Error).message}`); }
    }
  });
  addEventListener('beforeunload', (e) => { if (blocks.some((b) => toMarkdown(b) !== orig.get(b))) { e.preventDefault(); } });
}
document.addEventListener('astro:page-load', () => { if (on()) start(); else document.getElementById('edit-bar')?.remove(); });
