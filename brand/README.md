# CodeCaliper brand kit

The SVG files in `svg/` are the masters. Everything else is generated from them.

## Which file do I use?

| I need… | Use |
| --- | --- |
| The logo anywhere (web, docs, video editor) | `svg/logo.svg` (or `png/logo-*.png`) |
| The logo on a solid navy background | `svg/logo-on-navy.svg`, `png/logo-on-navy-*.png` |
| The logo on a light or busy background, single colour | `svg/logo-mono-navy.svg` |
| The logo on video or a dark photo, single colour | `svg/logo-mono-white.svg` |
| Just the `</>` symbol | `svg/mark.svg` (plus mono navy and mono white versions) |
| YouTube, TikTok or Instagram profile picture | `social/profile-mark-800.png` (or `profile-logo-800.png`) |
| YouTube banner | `social/youtube-banner-2560x1440.png` |
| YouTube video watermark | `social/youtube-watermark-150.png` |
| Corner logo for a 1280×720 thumbnail | `social/thumbnail-overlay-1280x720.png` |
| Link preview image (Open Graph) | `social/og-image-1200x630.png` |
| Website and browser icons | `favicon/` |
| App icon on a square or rounded tile | `svg/icon-square.svg`, `svg/icon-rounded.svg` |

Below roughly 64px the words "CODE CALIPER" become unreadable. At small sizes, use the `</>` mark.

## Colours

| Name | Hex | RGB |
| --- | --- | --- |
| Caliper Teal | `#64FFDA` | 100, 255, 218 |
| Deep Navy | `#0A192F` | 10, 25, 47 |
| Slate (secondary text) | `#8892B0` | 136, 146, 176 |
| White | `#FFFFFF` | 255, 255, 255 |

Teal on white has poor contrast, so on light backgrounds use the mono navy version.

## Typography

The lettering is **Barlow Semi Condensed Bold**, included in `source/fonts/` under the
SIL Open Font License (`source/fonts/OFL.txt`). Install it to use the same font for
thumbnails, titles and captions. Inside the logo files the letters are already
converted to shapes, so nobody needs the font installed to view the logo.

## Usage rules

- Leave clear space around the logo of at least the height of the teal bar.
- Don't stretch, rotate, recolour (other than the mono versions), add effects to, or
  re-type the logo.

## Rebuilding

```bash
pip install fonttools
python brand/source/build_svg.py           # regenerate the SVG masters

cd brand/source && npm i --no-save playwright-core && cd -
node brand/source/render.mjs               # render all PNGs (needs Google Chrome)
```

`favicon/favicon.ico` is built from `favicon/android-chrome-512.png` at 16, 32 and 48px (for example, with Pillow).
After rebuilding, copy the site's icons into `public/`.
