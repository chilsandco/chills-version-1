#!/usr/bin/env python3
"""Make small, fast copies of every product photo that has no studio version yet.

For each photo in the live product list that src/data/studioImages.json doesn't cover:
  public/p/<id>.webp    1000 px wide  (product page)
  public/p/s/<id>.webp   640 px wide  (cards, thumbnails)
and records it in src/data/sizedImages.json as {"<uploads path>": "<id>"}.

Run after adding products, then build and deploy:
    python3 scripts/size_images.py
New photos that haven't been sized yet still load, through the cached /media/ route.
"""
import hashlib, io, json, os, sys, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.environ.get('CHILS_SITE', 'https://chilsandco.com')
STORE = os.environ.get('CHILS_STORE', 'https://api.chilsandco.com')
STUDIO = json.load(open(os.path.join(ROOT, 'src/data/studioImages.json')))
OUT_MAP = os.path.join(ROOT, 'src/data/sizedImages.json')
SIZES = [(1000, 'public/p'), (640, 'public/p/s')]
UA = {'User-Agent': 'chils-image-sizer'}


def rel_of(url: str):
    u = urllib.parse.unquote(url)
    return u.split('/uploads/', 1)[1].split('?')[0].split('&')[0] if '/uploads/' in u else None


def get(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def main():
    products = json.loads(get(f'{SITE}/api/products?fresh=true'))
    rels = sorted({r for p in products for u in p.get('images', []) if (r := rel_of(u))})
    sized = json.load(open(OUT_MAP)) if os.path.exists(OUT_MAP) else {}
    for _, d in SIZES:
        os.makedirs(os.path.join(ROOT, d), exist_ok=True)
    todo = [r for r in rels if r not in STUDIO]
    made = skipped = 0
    for rel in todo:
        pid = hashlib.sha1(rel.encode()).hexdigest()[:12]
        targets = [os.path.join(ROOT, d, f'{pid}.webp') for _, d in SIZES]
        if rel in sized and all(os.path.exists(t) for t in targets):
            skipped += 1
            continue
        try:
            im = Image.open(io.BytesIO(get(f'{STORE}/wp-content/uploads/{urllib.parse.quote(rel)}')))
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        except Exception as e:  # keep going; the site falls back to /media/
            print('  could not read', rel, e, file=sys.stderr)
            continue
        for (w, _), t in zip(SIZES, targets):
            c = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            c.save(t, 'WEBP', quality=80, method=6)
        sized[rel] = pid
        made += 1
        print(f'  {rel} -> {pid}  {os.path.getsize(targets[1]) // 1024} KB small, {os.path.getsize(targets[0]) // 1024} KB large')
    keep = {r: sized[r] for r in sorted(sized) if r in rels and r not in STUDIO}
    json.dump(keep, open(OUT_MAP, 'w'), indent=0, sort_keys=True)
    print(f'{len(rels)} photos: {len(rels) - len(todo)} studio, {made} sized now, {skipped} already sized, map has {len(keep)}')


if __name__ == '__main__':
    main()
