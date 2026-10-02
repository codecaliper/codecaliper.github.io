// Render every PNG asset in brand/ from the SVG masters in brand/svg/.
// Requires Google Chrome and: npm i --no-save playwright-core
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BRAND = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = (name) => readFileSync(join(BRAND, 'svg', name), 'utf8');
const FONT = pathToFileURL(join(BRAND, 'source/fonts/BarlowSemiCondensed-Bold.ttf')).href;
const TEAL = '#64FFDA';
const NAVY = '#0A192F';

const sized = (name, w, h = w) =>
  svg(name).replace('<svg ', `<svg width="${w}" height="${h}" style="display:block" `);

const page = (w, h, body, bg = 'transparent') => `<!doctype html><html><head><style>
@font-face { font-family: Barlow; src: url('${FONT}'); }
html, body { margin: 0; width: ${w}px; height: ${h}px; background: ${bg}; overflow: hidden; }
body { font-family: Barlow, sans-serif; color: #fff; }
</style></head><body>${body}</body></html>`;

const tagline = (size, align = 'left') => `
  <div style="font-size:${size}px;line-height:1.15;text-align:${align}">
    <div style="color:#fff;letter-spacing:.02em">HOMELAB BUILDS</div>
    <div style="color:#fff;letter-spacing:.02em">SELF-HOSTED APPS</div>
    <div style="color:${TEAL};letter-spacing:.02em">TIPS &amp; TRICKS</div>
    <div style="margin-top:${size * 0.45}px;font-size:${size * 0.55}px;color:#8892b0;letter-spacing:.08em">codecaliper.uk</div>
  </div>`;

const centred = (inner) =>
  `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${inner}</div>`;

const jobs = [];
const icon = (file, src, sizes) => sizes.forEach((s) => jobs.push([file.replace('{s}', s), s, s, page(s, s, sized(src, s))]));

// Logos and marks, transparent PNGs.
icon('png/logo-{s}.png', 'logo.svg', [256, 512, 1024, 2048]);
icon('png/logo-on-navy-{s}.png', 'logo-on-navy.svg', [512, 1024, 2048]);
icon('png/logo-mono-navy-{s}.png', 'logo-mono-navy.svg', [1024]);
icon('png/logo-mono-white-{s}.png', 'logo-mono-white.svg', [1024]);
for (const [name, w, h] of [['mark', 1024, 901], ['mark-mono-navy', 1024, 901], ['mark-mono-white', 1024, 901]]) {
  jobs.push([`png/${name}-1024.png`, w, h, page(w, h, sized(`${name}.svg`, w, h))]);
}

// Favicons and app icons.
icon('favicon/favicon-{s}.png', 'icon-rounded.svg', [16, 32, 48]);
icon('favicon/apple-touch-icon-{s}.png', 'icon-square.svg', [180]);
icon('favicon/android-chrome-{s}.png', 'icon-rounded.svg', [192, 512]);
icon('favicon/maskable-{s}.png', 'icon-maskable.svg', [512]);

// Social profile pictures (platforms crop to a circle; content stays inside it).
icon('social/profile-mark-{s}.png', 'icon-square.svg', [800]);
icon('social/profile-logo-{s}.png', 'logo-on-navy.svg', [800]);

// YouTube watermark: transparent, 150x150 recommended.
icon('social/youtube-watermark-{s}.png', 'mark-mono-white.svg', [150]);

// YouTube banner: everything inside the 1546x423 safe area shown on all devices.
jobs.push(['social/youtube-banner-2560x1440.png', 2560, 1440, page(2560, 1440, centred(`
  <div style="width:1546px;height:423px;display:flex;align-items:center;justify-content:center;gap:90px">
    ${sized('logo.svg', 400)}${tagline(78)}
  </div>`), NAVY)]);

// Link preview / Open Graph image.
jobs.push(['social/og-image-1200x630.png', 1200, 630, page(1200, 630, centred(`
  <div style="display:flex;align-items:center;gap:56px">${sized('logo.svg', 440)}${tagline(60)}</div>`), NAVY)]);

// Corner watermark overlay for 1280x720 video thumbnails.
jobs.push(['social/thumbnail-overlay-1280x720.png', 1280, 720, page(1280, 720,
  `<div style="position:absolute;right:28px;bottom:24px">${sized('logo.svg', 190)}</div>`)]);

const browser = await chromium.launch({ channel: 'chrome' });
const tab = await browser.newPage();
for (const [file, w, h, html] of jobs) {
  const out = join(BRAND, file);
  mkdirSync(dirname(out), { recursive: true });
  await tab.setViewportSize({ width: w, height: h });
  const tmp = join(BRAND, 'source', '.render.html');
  writeFileSync(tmp, html);
  await tab.goto(pathToFileURL(tmp).href);
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: out, omitBackground: true });
  console.log('rendered', file);
}
await browser.close();
rmSync(join(BRAND, 'source', '.render.html'), { force: true });
