# Överlämning: Arqen Share Image (2026-10-06)

## Vad det är
Ett verktyg för delningsbilder (Open Graph, 1200×630) som körs helt i webbläsaren. Det är ett av de två nya verktyg som ska finnas på samidatools.com före lanseringen. Allt som användaren ser är på engelska.

- **Lokalt:** konfigurationen `arqen-share-image` i Studios `.claude/launch.json` (port 5178), eller `python -m http.server 5178` i mappen.
- **Filer:** `render.js` (ritar på canvas), `app.js` (redigerare, förhandsvisningar, nedladdning och taggar), `index.html`, `style.css` och `fonts/` (9 typsnitt med OFL-licens, kopierade från Arqen Thumbnail).
- **Licens:** MIT. Publikt repo: https://github.com/stefansemb/arqen-share-image (skapat 2026-10-06).

## Läge: första versionen (MVP), byggd och testad lokalt 2026-10-06
- **4 layouter:** Headline, Logo on top, Split with image och Minimal.
- **10 paletter, 9 typsnitt och mönster** (rutnät eller prickar). `*ord*` färgas i accentfärgen.
- **Logga och bild:** bilden kan ligga som bakgrund med en justerbar mörkläggning, eller till höger i Split.
- **Förhandsvisningar** som efterliknar X, LinkedIn, Facebook, Discord, Slack och WhatsApp. WhatsApp beskär bilden kvadratiskt, och det finns en kryssruta som visar den kvadratiska beskärningen.
- **Nedladdning** som PNG eller JPG med storlekskoll: över 5 MB stoppas bilden av X och LinkedIn.
- **`og:`- och `twitter:`-taggar** att kopiera.
- **Inställningarna sparas** i webbläsaren (localStorage). Bilderna sparas inte.
- **Testat:** inga fel i konsolen för alla kombinationer av layouter, typsnitt och paletter, ingen horisontell scroll i mobilbredd (375 px), och alla 6 förhandsvisningarna renderas.

## Lärdom
- `document.fonts.load("900 48px \"Montserrat\"")` aktiverade inte typsnitten, så canvasen ritade med reservtypsnitt. `loadFonts()` laddar därför varje FontFace direkt med `face.load()`.

## Live (2026-10-06)
- **Adress:** https://samidatools.com/share-image/, uppladdad med `scp` till `strato:samidatools/share-image/` (index.html, style.css, app.js, render.js, og-image.png och fonts/).
- **Delningsbild:** verktygets egen `og-image.png` är gjord i verktyget, och sidan har `og:`- och `twitter:`-taggar.
- **Startsidan:** samidatools.com har ett kort, "Arqen Share Image" (Free). Backup: `index.pre-share-image.backup.html`.
- **Startsidans delningsbild** (`samidatools.com/og-image.png`) är också gjord här.
- **Projektlistan i Mission Control:** projektet står på 60 %. Kvar är batch (zip) och "kolla en adress".

## Nästa steg
1. Användaren provar och ger feedback.
2. Använd verktyget till lanseringen: gör delningsbilder för samidatools.com och varje verktygssida.
3. Senare: flera sidor på en gång (zip), och "kolla en adress", som kräver serverkod (PHP finns på servern).
