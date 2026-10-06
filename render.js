// Draws a share image (Open Graph card) on a canvas. Pure drawing: no DOM besides the canvas.

export const WIDTH = 1200;
export const HEIGHT = 630;

export const PALETTES = {
  midnight: { name: 'Midnight', colors: ['#07080d', '#141029', '#1d1440'], text: '#ffffff', muted: '#a9acc4', accent: '#2cc8f5' },
  lime: { name: 'Lime', colors: ['#0e0f0b', '#151a0c', '#20290d'], text: '#ffffff', muted: '#b4b8a6', accent: '#d4ff3a' },
  ocean: { name: 'Ocean', colors: ['#031a2e', '#0b4f7a', '#1aa3c7'], text: '#ffffff', muted: '#bfdcec', accent: '#ffd23f' },
  sunset: { name: 'Sunset', colors: ['#2b1030', '#7a2340', '#e0663a'], text: '#ffffff', muted: '#f3cdbf', accent: '#ffd166' },
  forest: { name: 'Forest', colors: ['#07140f', '#12402c', '#2f8f5b'], text: '#ffffff', muted: '#bfdccb', accent: '#c6f432' },
  ember: { name: 'Ember', colors: ['#120404', '#5a0f0f', '#d9480f'], text: '#ffffff', muted: '#f0c2b0', accent: '#ffb703' },
  royal: { name: 'Royal', colors: ['#060d24', '#10286b', '#1f5fe0'], text: '#ffffff', muted: '#c2cff2', accent: '#ffd400' },
  candy: { name: 'Candy', colors: ['#3a0ca3', '#7209b7', '#f72585'], text: '#ffffff', muted: '#ecd2f5', accent: '#4cc9f0' },
  mono: { name: 'Mono', colors: ['#0a0a0a', '#161616', '#262626'], text: '#ffffff', muted: '#a6a6a6', accent: '#ff3b3b' },
  paper: { name: 'Paper', colors: ['#f6f1e7', '#ece3d2'], text: '#1b1b1b', muted: '#5f5a50', accent: '#e63946' },
};

// Self-hosted, see fonts/ for the licences.
export const FONTS = {
  montserrat: { name: 'Montserrat Black', family: 'Montserrat', weight: '900' },
  poppins: { name: 'Poppins Black', family: 'Poppins', weight: '900' },
  archivo: { name: 'Archivo Black', family: 'Archivo Black', weight: '400' },
  rubik: { name: 'Rubik Black', family: 'Rubik', weight: '900' },
  kanit: { name: 'Kanit Black', family: 'Kanit', weight: '900' },
  bebas: { name: 'Bebas Neue', family: 'Bebas Neue', weight: '400' },
  oswald: { name: 'Oswald Bold', family: 'Oswald', weight: '700' },
  anton: { name: 'Anton', family: 'Anton', weight: '400' },
  barlow: { name: 'Barlow Condensed Black', family: 'Barlow Condensed', weight: '900' },
};

export const LAYOUTS = {
  headline: 'Headline',
  logo: 'Logo on top',
  split: 'Split with image',
  minimal: 'Minimal',
};

const BODY = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
const PAD = 72;

/** Words of `text`, each marked when it was written *like this*. */
function words(text) {
  const out = [];
  let on = false;
  for (const raw of text.trim().split(/\s+/).filter(Boolean)) {
    let w = raw;
    const start = w.startsWith('*');
    if (start) { on = true; w = w.slice(1); }
    const end = w.endsWith('*');
    if (end) w = w.slice(0, -1);
    out.push({ w, hl: on });
    if (end) on = false;
  }
  return out;
}

/** Splits words into lines that fit `maxWidth` with the current font. */
function wrap(ctx, list, maxWidth) {
  const lines = [];
  let line = [];
  for (const item of list) {
    const test = [...line, item].map((x) => x.w).join(' ');
    if (line.length && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = [item];
    } else line.push(item);
  }
  if (line.length) lines.push(line);
  return lines;
}

/** The biggest font size (max..min) at which the title fits in `maxLines` lines. */
function fitTitle(ctx, list, font, maxWidth, maxLines, max, min) {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `${font.weight} ${size}px "${font.family}"`;
    const lines = wrap(ctx, list, maxWidth);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l.map((x) => x.w).join(' ')).width <= maxWidth)) return { size, lines };
  }
  ctx.font = `${font.weight} ${min}px "${font.family}"`;
  return { size: min, lines: wrap(ctx, list, maxWidth).slice(0, maxLines) };
}

function drawTitle(ctx, s, p, { x, y, maxWidth, maxLines, max, min, align = 'left' }) {
  const font = FONTS[s.font] || FONTS.montserrat;
  const { size, lines } = fitTitle(ctx, words(s.title || 'Your page title'), font, maxWidth, maxLines, max, min);
  const lineHeight = size * (['bebas', 'oswald', 'anton', 'barlow'].includes(s.font) ? 1.02 : 1.12);
  ctx.textBaseline = 'alphabetic';
  lines.forEach((line, i) => {
    const full = line.map((x) => x.w).join(' ');
    let cx = align === 'center' ? x - ctx.measureText(full).width / 2 : x;
    const cy = y + size * 0.9 + i * lineHeight;
    line.forEach((item, j) => {
      const text = item.w + (j < line.length - 1 ? ' ' : '');
      ctx.fillStyle = item.hl ? p.accent : p.text;
      ctx.fillText(text, cx, cy);
      cx += ctx.measureText(text).width;
    });
  });
  return y + size * 0.9 + (lines.length - 1) * lineHeight + size * 0.3;
}

// The subtitle never runs into the footer (site name) at the bottom.
const SUBTITLE_BOTTOM = HEIGHT - PAD - 44;

function drawSubtitle(ctx, s, p, { x, y, maxWidth, align = 'left', size = 30, maxLines = 2 }) {
  if (!s.subtitle) return y;
  ctx.font = `500 ${size}px ${BODY}`;
  ctx.fillStyle = p.muted;
  const room = Math.floor((SUBTITLE_BOTTOM - y - size) / (size * 1.35)) + 1;
  const all = wrap(ctx, words(s.subtitle.replace(/\*/g, '')), maxWidth);
  const lines = all.slice(0, Math.max(0, Math.min(maxLines, room)));
  if (!lines.length) return y;
  if (lines.length < all.length) {
    // Cut with an ellipsis rather than overlapping the footer.
    const last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(last.map((w) => w.w).join(' ') + '…').width > maxWidth) last.pop();
    last[last.length - 1] = { ...last[last.length - 1], w: last[last.length - 1].w + '…' };
  }
  lines.forEach((line, i) => {
    const t = line.map((w) => w.w).join(' ');
    ctx.fillText(t, align === 'center' ? x - ctx.measureText(t).width / 2 : x, y + size + i * size * 1.35);
  });
  return y + size + (lines.length - 1) * size * 1.35 + size * 0.4;
}

function drawBackground(ctx, s, p, images) {
  const g = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  p.colors.forEach((c, i) => g.addColorStop(p.colors.length === 1 ? 0 : i / (p.colors.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (images.background && s.layout !== 'split') {
    cover(ctx, images.background, 0, 0, WIDTH, HEIGHT);
    // Darken (or lighten on Paper) so the text stays readable on any photo.
    const shade = ctx.createLinearGradient(0, 0, WIDTH, 0);
    const dark = p.text === '#ffffff';
    const a = Math.max(0, Math.min(1, s.overlay ?? 0.65));
    shade.addColorStop(0, dark ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`);
    shade.addColorStop(1, dark ? `rgba(0,0,0,${a * 0.55})` : `rgba(255,255,255,${a * 0.55})`);
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  if (s.pattern === 'grid' || s.pattern === 'dots') {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = ctx.strokeStyle = p.text;
    for (let x = 0; x <= WIDTH; x += 40) {
      for (let y = 0; y <= HEIGHT; y += 40) {
        if (s.pattern === 'dots') { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
      }
      if (s.pattern === 'grid') { ctx.fillRect(x, 0, 1, HEIGHT); }
    }
    if (s.pattern === 'grid') for (let y = 0; y <= HEIGHT; y += 40) ctx.fillRect(0, y, WIDTH, 1);
    ctx.restore();
  }
  // A soft glow in the accent color for depth.
  const glow = ctx.createRadialGradient(WIDTH * 0.85, HEIGHT * 0.1, 0, WIDTH * 0.85, HEIGHT * 0.1, WIDTH * 0.6);
  glow.addColorStop(0, hexA(p.accent, 0.16));
  glow.addColorStop(1, hexA(p.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function cover(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height);
  const sw = w / r, sh = h / r;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function contain(ctx, img, x, y, w, h) {
  const r = Math.min(w / img.width, h / img.height);
  const dw = img.width * r, dh = img.height * r;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  return { w: dw, h: dh };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Site name (and small logo) in the bottom-left, or centered. */
function drawFooter(ctx, s, p, images, align = 'left', withLogo = true) {
  const y = HEIGHT - PAD + 4;
  let x = align === 'center' ? WIDTH / 2 : PAD;
  ctx.font = `600 26px ${BODY}`;
  const label = s.site || '';
  const textW = label ? ctx.measureText(label).width : 0;
  const logoSize = withLogo && images.logo ? 40 : 0;
  const total = logoSize + (logoSize && label ? 14 : 0) + textW;
  if (align === 'center') x -= total / 2;
  if (logoSize) {
    contain(ctx, images.logo, x, y - logoSize + 8, logoSize, logoSize);
    x += logoSize + (label ? 14 : 0);
  } else if (label) {
    ctx.fillStyle = p.accent;
    roundRect(ctx, x, y - 22, 6, 28, 3);
    ctx.fill();
    x += 18;
  }
  if (label) {
    ctx.fillStyle = p.text;
    ctx.globalAlpha = 0.9;
    ctx.fillText(label, x, y);
    ctx.globalAlpha = 1;
  }
}

/**
 * Draws the share image.
 * s: { layout, palette, font, title, subtitle, site, pattern, overlay }
 * images: { logo?: HTMLImageElement, background?: HTMLImageElement }
 */
export function renderShareImage(canvas, s, images = {}) {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  const p = PALETTES[s.palette] || PALETTES.midnight;
  drawBackground(ctx, s, p, images);

  if (s.layout === 'logo') {
    let top = 96;
    if (images.logo) {
      const box = contain(ctx, images.logo, WIDTH / 2 - 90, 70, 180, 120);
      top = 70 + 120 / 2 + box.h / 2 + 36;
    }
    const end = drawTitle(ctx, s, p, { x: WIDTH / 2, y: top, maxWidth: WIDTH - PAD * 2.4, maxLines: 2, max: 84, min: 44, align: 'center' });
    drawSubtitle(ctx, s, p, { x: WIDTH / 2, y: end + 4, maxWidth: WIDTH - PAD * 3, align: 'center', size: 28 });
    drawFooter(ctx, s, p, images, 'center', false);
  } else if (s.layout === 'split') {
    const panelX = WIDTH * 0.56;
    if (images.background) {
      ctx.save();
      roundRect(ctx, panelX, 70, WIDTH - panelX - 56, HEIGHT - 140, 22);
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.clip();
      cover(ctx, images.background, panelX, 70, WIDTH - panelX - 56, HEIGHT - 140);
      ctx.restore();
    }
    const maxWidth = (images.background ? panelX - 40 : WIDTH - PAD) - PAD;
    const end = drawTitle(ctx, s, p, { x: PAD, y: 110, maxWidth, maxLines: 4, max: 72, min: 40 });
    drawSubtitle(ctx, s, p, { x: PAD, y: end + 6, maxWidth, size: 26, maxLines: 3 });
    drawFooter(ctx, s, p, images);
  } else if (s.layout === 'minimal') {
    const end = drawTitle(ctx, s, p, { x: WIDTH / 2, y: 175, maxWidth: WIDTH - PAD * 2.6, maxLines: 3, max: 92, min: 48, align: 'center' });
    ctx.fillStyle = p.accent;
    roundRect(ctx, WIDTH / 2 - 40, end + 22, 80, 8, 4);
    ctx.fill();
    drawFooter(ctx, s, p, images, 'center');
  } else {
    // Headline: accent bar, big title, subtitle, site in the corner.
    ctx.fillStyle = p.accent;
    roundRect(ctx, PAD, 96, 88, 10, 5);
    ctx.fill();
    const end = drawTitle(ctx, s, p, { x: PAD, y: 130, maxWidth: WIDTH - PAD * 2.2, maxLines: 3, max: 96, min: 48 });
    drawSubtitle(ctx, s, p, { x: PAD, y: end + 6, maxWidth: WIDTH - PAD * 3 });
    drawFooter(ctx, s, p, images);
  }
  return canvas;
}

/** Waits until the fonts the image uses are loaded, so the first render isn't drawn in a fallback font. */
export async function loadFonts() {
  // Load each declared face directly: a canvas never asks for fonts the page itself doesn't show.
  const families = new Set(Object.values(FONTS).map((f) => f.family));
  await Promise.all([...document.fonts].filter((face) => families.has(face.family.replace(/"/g, ''))).map((face) => face.load().catch(() => null)));
}
