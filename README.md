# Arqen Share Image

Make the image that shows when your link is shared, see how it looks on X, LinkedIn, Facebook, Discord, Slack and WhatsApp before you post, and copy the meta tags. Everything runs in your browser: no account, no uploads, no server.

## Features

- **Four layouts** at 1200 × 630: Headline, Logo on top, Split with image (a screenshot works well) and Minimal.
- **Ten color palettes, nine fonts** and a subtle grid or dot pattern. Write `*word*` in the title to color it with the accent.
- **Your logo and image**, with an adjustable overlay so text stays readable on any photo.
- **Platform previews** that approximate each network's link card, plus a square-crop guide for apps that cut the image to a square.
- **Download** as PNG or JPG, with a size check against the platforms' limits.
- **Meta tags** (`og:` and `twitter:`) ready to paste into your page's `<head>`.

## Run it

It is a static page with no build step. Serve the folder with any web server, for example:

```bash
python -m http.server 5178
```

Then open http://localhost:5178. (Opening `index.html` straight from disk does not work, because browsers block ES modules on `file://`.)

## Files

| File | What it does |
|---|---|
| `render.js` | Draws the image on a canvas: layouts, palettes, fonts, text fitting |
| `app.js` | The editor, platform previews, download and meta tags |
| `index.html`, `style.css` | The page |
| `fonts/` | Self-hosted fonts, each with its SIL Open Font License |

## License

MIT, see [LICENSE](LICENSE). The fonts in `fonts/` are under the SIL Open Font License 1.1 (see each `OFL-*.txt`).

Made by [samidatools](https://samidatools.com/).
