import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.SITE_URL || 'https://emreerturk-3.github.io',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  redirects: { '/personal': '/about/', '/projects': '/research/', '/projects/evomaxx': '/research/evomaxx/', '/cv': '/docs/emre-erturk-cv.pdf' },
});
