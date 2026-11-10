"""Render cv/cv.html to public/docs/emre-erturk-cv.pdf (A4). Needs: pip install playwright && playwright install chromium"""
from pathlib import Path
from playwright.sync_api import sync_playwright
here = Path(__file__).resolve().parent
out = here.parent / 'public' / 'docs' / 'emre-erturk-cv.pdf'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto((here / 'cv.html').as_uri()); pg.wait_for_load_state('networkidle'); pg.evaluate('document.fonts.ready')
    pg.pdf(path=str(out), format='A4', print_background=True, margin={'top': '14mm', 'bottom': '14mm', 'left': '16mm', 'right': '16mm'})
    b.close()
print('wrote', out)
