# Editing the site

## On the page (easiest)

1. Open any page with `?edit` at the end, e.g. `https://emreerturk-3.github.io/?edit`.
2. Text blocks with a dashed outline are editable. Type directly. `Ctrl+B` bold, `Ctrl+I` italic,
   the **Link** button adds or removes a link on the selected text.
3. Press **Save**. The first time, paste your GitHub token (below). Changes are committed to this
   repository and the live site updates in about a minute.
4. **Exit** leaves edit mode.

Only someone with a token for this repository can save. Visitors who add `?edit` can type, but
cannot save anything.

### Token (one time)

GitHub → Settings → Developer settings → Fine-grained personal access tokens → Generate new token:
- Repository access: **Only select repositories** → `EmreErturk-3.github.io`
- Permissions → Repository permissions → **Contents: Read and write**
- Expiration: your choice (e.g. one year)

Paste it when the site asks. It is stored only in that browser; the **Token** button replaces or
forgets it.

## In the files

All editable text is in `src/content/`:

| File | Where it appears |
|---|---|
| `home-intro.md` | home page, under your name |
| `research-intro.md` | Research & Projects, top line |
| `research-direction.md` | Research & Projects, "Current direction" |
| `evomaxx-summary.md` | Research & Projects, next to the EvoMaxx video |
| `about-intro.md` | About, under your name |
| `about-background.md` | About, "Background" |
| `robotics-intro.md` | Robotics, top line |
| `site.json` | lists: interests, hobbies, languages, education, scores, courses |

Other content: papers and project list in `src/data/site.ts`; reading list at the top of
`src/pages/about.astro`; project pages in `src/pages/research/` and `src/pages/robotics.astro`.

Edit a file on github.com (pencil icon) or locally, then commit. Every push to `main` rebuilds the
site. To preview locally: `npm install` once, then `npm run dev` and open the address it prints.
