"""Generate the CodeCaliper SVG masters into brand/svg/.

Requires: pip install fonttools
"""
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'svg'

TEAL, NAVY, WHITE = '#64FFDA', '#0A192F', '#FFFFFF'

# Geometry on a 460x460 artboard, traced from the original logo.
LEFT = [(29.6, 228.4), (196, 113.7), (196, 169.2), (110.8, 228.9), (196, 289.0), (196, 347.3)]
RIGHT = [(429.5, 231.8), (319.4, 156.0), (306.2, 201.4), (351.0, 231.9), (284.1, 277.6), (264.1, 346.5)]
SLASH = [(283.8, 55.0), (323.5, 66.5), (226.6, 404.0), (186.4, 392.5)]
BAR = (20, 254, 421, 69)  # x, y, w, h
TEXT = 'CODECALIPER'
# Horizontal extent of each letter, and the cap-height band.
LETTER_X = [(35, 65), (73, 104), (111, 142), (149, 176), (202, 233), (238, 275),
            (281, 302), (308, 317), (325, 355), (362, 389), (397, 428)]
CAP_TOP, CAP_BOTTOM = 266, 312


def fmt(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


def text_path():
    font = TTFont(HERE / 'fonts' / 'BarlowSemiCondensed-Bold.ttf')
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    k = (CAP_BOTTOM - CAP_TOP) / font['OS/2'].sCapHeight
    parts = []
    for ch, (x0, x1) in zip(TEXT, LETTER_X):
        g = glyphs[cmap[ord(ch)]]
        bp = BoundsPen(glyphs)
        g.draw(bp)
        xmin, _, xmax, _ = bp.bounds
        dx = (x0 + x1) / 2 - (xmax - xmin) * k / 2 - xmin * k
        pen = SVGPathPen(glyphs, ntos=fmt)
        g.draw(TransformPen(pen, (k, 0, 0, -k, dx, CAP_BOTTOM)))
        parts.append(pen.getCommands())
    return ' '.join(parts)


def pts(points):
    return ' '.join(f'{fmt(x)},{fmt(y)}' for x, y in points)


def svg(viewbox, body, label='CodeCaliper'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img" '
            f'aria-label="{label}">\n{body}\n</svg>\n')


def shapes(colour, bar):
    s = [f'<polygon points="{pts(LEFT)}"/>', f'<polygon points="{pts(RIGHT)}"/>',
         f'<polygon points="{pts(SLASH)}"/>']
    if bar:
        x, y, w, h = BAR
        s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>')
    return f'<g fill="{colour}">' + ''.join(s) + '</g>'


TEXT_D = text_path()
LOGO_VB = '0 0 460 460'
MARK_VB = '14 40 432 380'


def logo(shape_colour, text_colour=None, bg=None):
    """text_colour=None knocks the lettering out of the bar (transparent)."""
    body = []
    if bg:
        body.append(f'<rect width="460" height="460" fill="{bg}"/>')
    if text_colour:
        body += [shapes(shape_colour, True), f'<path fill="{text_colour}" d="{TEXT_D}"/>']
    else:
        body += ['<mask id="knockout"><rect width="460" height="460" fill="#fff"/>'
                 f'<path fill="#000" d="{TEXT_D}"/></mask>',
                 f'<g mask="url(#knockout)">{shapes(shape_colour, True)}</g>']
    return svg(LOGO_VB, '\n'.join(body))


def mark(colour, bg=None, rounded=False, scale=0.95):
    if not bg:
        return svg(MARK_VB, shapes(colour, False), 'CodeCaliper mark')
    # Square app-icon tile with the mark centred and padded.
    rx = ' rx="96"' if rounded else ''
    inner = shapes(colour, False)
    body = (f'<rect width="512" height="512"{rx} fill="{bg}"/>'
            f'<g transform="translate(256 256) scale({scale}) translate(-229.5 -229.5)">{inner}</g>')
    return svg('0 0 512 512', body, 'CodeCaliper icon')


VARIANTS = {
    'logo.svg': logo(TEAL, NAVY),
    'logo-on-navy.svg': logo(TEAL, NAVY, bg=NAVY),
    'logo-mono-navy.svg': logo(NAVY),
    'logo-mono-white.svg': logo(WHITE),
    'mark.svg': mark(TEAL),
    'mark-mono-navy.svg': mark(NAVY),
    'mark-mono-white.svg': mark(WHITE),
    'icon-square.svg': mark(TEAL, bg=NAVY),
    'icon-rounded.svg': mark(TEAL, bg=NAVY, rounded=True),
    # Android maskable icons may be cropped to a circle: keep the mark in the safe zone.
    'icon-maskable.svg': mark(TEAL, bg=NAVY, scale=0.75),
}

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for name, data in VARIANTS.items():
        (OUT / name).write_text(data)
        print('wrote', OUT / name)
