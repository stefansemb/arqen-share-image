import { FONTS, HEIGHT, LAYOUTS, PALETTES, WIDTH, loadFonts, renderShareImage } from './render.js';

const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const images = {};
const STORE = 'arqen-share-image';
const TEXT_FIELDS = ['title', 'subtitle', 'site', 'pageUrl', 'imageUrl'];

const state = {
  layout: 'headline', palette: 'midnight', font: 'montserrat', pattern: 'grid', overlay: 0.65,
  title: $('title').value, subtitle: $('subtitle').value, site: $('site').value, pageUrl: '', imageUrl: '',
};

// Remembered per browser so a returning visitor keeps their style. Images are not stored.
try { Object.assign(state, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch { /* private window */ }
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* ignore */ } };

$('layout').innerHTML = Object.entries(LAYOUTS).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
$('font').innerHTML = Object.entries(FONTS).map(([id, f]) => `<option value="${id}">${f.name}</option>`).join('');
$('palette').innerHTML = Object.entries(PALETTES).map(([id, p]) =>
  `<button type="button" class="swatch" data-id="${id}" title="${p.name}" style="background:linear-gradient(135deg,${p.colors.join(',')});--dot:${p.accent}"></button>`).join('');

for (const id of [...TEXT_FIELDS, 'layout', 'font', 'pattern', 'overlay']) {
  const el = $(id);
  el.value = state[id];
  el.addEventListener('input', () => { state[id] = id === 'overlay' ? Number(el.value) : el.value; update(); });
}
$('palette').addEventListener('click', (e) => {
  const b = e.target.closest('.swatch');
  if (b) { state.palette = b.dataset.id; update(); }
});

for (const key of ['logo', 'background']) {
  $(key).addEventListener('change', () => {
    const file = $(key).files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { images[key] = img; $(`${key}Name`).textContent = file.name; update(); };
    img.src = URL.createObjectURL(file);
  });
}
document.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', () => {
  delete images[b.dataset.clear];
  $(b.dataset.clear).value = '';
  $(`${b.dataset.clear}Name`).textContent = 'None';
  update();
}));
$('showSafe').addEventListener('change', () => { $('safe').hidden = !$('showSafe').checked; });

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const plain = (s) => s.replace(/\*/g, '').trim();
const domain = () => {
  const raw = state.pageUrl || state.site || 'example.com';
  try { return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.replace(/^www\./, ''); } catch { return raw; }
};

function previews(src) {
  const t = esc(plain(state.title) || 'Your page title');
  const d = esc(plain(state.subtitle));
  const dom = esc(domain());
  const accent = PALETTES[state.palette].accent;
  return `
  <div class="pv"><h3>X (Twitter)</h3><div class="x"><img src="${src}" alt=""><span class="dom">${t}</span></div><div class="xsrc">From ${dom}</div></div>
  <div class="pv"><h3>LinkedIn</h3><div class="li"><img src="${src}" alt=""><div class="t">${t}</div><div class="d">${dom}</div></div></div>
  <div class="pv"><h3>Facebook</h3><div class="fb"><img src="${src}" alt=""><div class="meta"><div class="dom">${dom}</div><div class="t">${t}</div>${d ? `<div class="d">${d}</div>` : ''}</div></div></div>
  <div class="pv"><h3>Discord</h3><div class="dc" style="--embed:${accent}"><div class="s">${esc(state.site || dom)}</div><div class="t">${t}</div>${d ? `<div class="d">${d}</div>` : ''}<img src="${src}" alt=""></div></div>
  <div class="pv"><h3>Slack</h3><div class="sl"><div class="s"><i></i>${esc(state.site || dom)}</div><div class="t">${t}</div>${d ? `<div class="d">${d}</div>` : ''}<img src="${src}" alt=""></div></div>
  <div class="pv"><h3>WhatsApp (square crop)</h3><div class="wa"><div class="card"><img src="${src}" alt=""><div class="meta"><div class="t">${t}</div>${d ? `<div class="d">${d}</div>` : ''}<div class="dom">${dom}</div></div></div><div class="msg">https://${dom}/…</div></div></div>`;
}

function tags() {
  const title = plain(state.title) || 'Your page title';
  const desc = plain(state.subtitle);
  const page = state.pageUrl || 'https://example.com/page';
  const img = state.imageUrl || `${page.replace(/\/[^/]*$/, '')}/og-image.png`;
  const lines = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${esc(page)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    desc && `<meta property="og:description" content="${esc(desc)}">`,
    state.site && `<meta property="og:site_name" content="${esc(state.site)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:width" content="${WIDTH}">`,
    `<meta property="og:image:height" content="${HEIGHT}">`,
    `<meta property="og:image:alt" content="${esc(title)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    desc && `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
  ];
  return lines.filter(Boolean).join('\n');
}

let timer;
function update() {
  document.querySelectorAll('.swatch').forEach((b) => b.classList.toggle('on', b.dataset.id === state.palette));
  $('overlayRow').hidden = !images.background || state.layout === 'split';
  renderShareImage(canvas, state, images);
  $('tags').textContent = tags();
  save();
  // The previews and the size check re-encode the image, so they wait until typing pauses.
  clearTimeout(timer);
  timer = setTimeout(() => {
    $('previews').innerHTML = previews(canvas.toDataURL('image/png'));
    const type = $('format').value;
    canvas.toBlob((blob) => {
      const kb = Math.round(blob.size / 1024);
      $('sizeInfo').textContent = `${type.toUpperCase()}, ${kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`}. ` +
        (blob.size > 5 * 1024 * 1024 ? 'Over 5 MB: X and LinkedIn will reject it, so choose JPG.' :
          blob.size > 1024 * 1024 ? 'Works everywhere, but JPG would load faster.' : 'Small enough for every platform.');
    }, `image/${type}`, 0.9);
  }, 250);
}

$('format').addEventListener('change', update);
$('download').addEventListener('click', () => {
  const type = $('format').value;
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    const name = plain(state.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'share-image';
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${type === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, `image/${type}`, 0.9);
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(tags()); $('copy').textContent = 'Copied'; } catch { $('copy').textContent = 'Select and copy'; }
  setTimeout(() => { $('copy').textContent = 'Copy tags'; }, 1500);
});

loadFonts().then(update);
update();
